import { getAuthTokens, refreshAccessToken } from '@/app/api/baseApi';
import { API_BASE_URL } from '@/lib/config';

// TypeScript interfaces for API requests and responses

export interface CreateOrderRequest {
  entity_type: string;
  entity_id: string | number;
  amount?: number; // Optional: Amount in rupees for partial payment. If not provided, uses full remaining amount for bookings or full amount for payouts
}

export interface CreateOrderResponse {
  order_id: string;
  key_id: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment_id?: string;
  message?: string;
  [key: string]: any;
}

export interface RefundRequest {
  payment_id: string;
  amount?: number;
}

export interface RefundResponse {
  success: boolean;
  refund_id?: string;
  message?: string;
  [key: string]: any;
}

export interface PayoutRequest {
  payout_id: string;
}

export interface PayoutResponse {
  success: boolean;
  payout_id?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Helper function to make authenticated API calls
 */
async function makeAuthenticatedRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = API_BASE_URL;
  const fullUrl = `${baseUrl}${url.startsWith('/') ? url.slice(1) : url}`;

  let { accessToken } = getAuthTokens();

  // Check if token needs refresh (basic check - full logic in baseApi)
  if (!accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = refreshed.access;
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle 401 - try to refresh token once
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed.access}`;
      const retryResponse = await fetch(fullUrl, {
        ...options,
        headers,
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Authentication failed');
      }

      return retryResponse.json();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a Razorpay order for an entity (booking, prebooking, etc.)
 * @param entityType Type of entity (e.g., 'booking', 'prebooking')
 * @param entityId ID of the entity
 * @param amount Optional: Amount in rupees for partial payment. If not provided, uses full remaining amount for bookings or full amount for payouts
 * @returns Order details including order_id, key_id, and amount
 */
export async function createOrder(
  entityType: string,
  entityId: string | number,
  amount?: number
): Promise<CreateOrderResponse> {
  const requestData: CreateOrderRequest = {
    entity_type: entityType,
    entity_id: entityId,
    ...(amount !== undefined && { amount }),
  };

  // Console log the request body
  console.log('💳 [PAYMENTS/CREATE-ORDER] Request Body:', JSON.stringify(requestData, null, 2));
  console.log('💳 [PAYMENTS/CREATE-ORDER] Request Details:', {
    entity_type: entityType,
    entity_id: entityId,
    amount: amount !== undefined ? amount : 'not provided (will use full remaining amount)',
    timestamp: new Date().toISOString(),
  });

  return makeAuthenticatedRequest<CreateOrderResponse>(
    'payments/create-order/',
    {
      method: 'POST',
      body: JSON.stringify(requestData),
    }
  );
}

/**
 * Verify a Razorpay payment
 * @param paymentData Payment data from Razorpay
 * @returns Verification response
 */
export async function verifyPayment(
  paymentData: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  // Console log the request body
  console.log('✅ [PAYMENTS/VERIFY] Request Body:', JSON.stringify(paymentData, null, 2));
  console.log('✅ [PAYMENTS/VERIFY] Request Details:', {
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_order_id: paymentData.razorpay_order_id,
    timestamp: new Date().toISOString(),
  });

  const response = await makeAuthenticatedRequest<VerifyPaymentResponse>(
    'payments/verify/',
    {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }
  );

  // Console log the response
  console.log('✅ [PAYMENTS/VERIFY] Response:', JSON.stringify(response, null, 2));
  console.log('✅ [PAYMENTS/VERIFY] Response Details:', {
    success: response.success,
    payment_id: response.payment_id,
    message: response.message,
    timestamp: new Date().toISOString(),
  });

  return response;
}

/**
 * Complete payment flow: create order, open Razorpay, and verify payment
 * @param entityType Type of entity
 * @param entityId ID of the entity
 * @param openRazorpayCheckout Function to open Razorpay checkout (from useRazorpay hook)
 * @param options Additional Razorpay options (name, description, prefill, amount, etc.)
 * @returns Verified payment response
 */
export async function payForEntity(
  entityType: string,
  entityId: string | number,
  openRazorpayCheckout: (options: any) => Promise<void>,
  options?: {
    name?: string;
    description?: string;
    amount?: number; // Optional: Amount in rupees for partial payment
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    onClose?: () => void;
    onDismiss?: () => void;
  }
): Promise<VerifyPaymentResponse> {
  // Step 1: Create order on backend
  const orderData = await createOrder(entityType, entityId, options?.amount);

  // Step 2: Open Razorpay checkout
  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: options?.name || 'EV Nexus',
      description: options?.description || 'Payment for booking',
      order_id: orderData.order_id,
      prefill: options?.prefill,
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // Step 3: Verify payment on backend
          const verificationResult = await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          resolve(verificationResult);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          if (options?.onDismiss) {
            options.onDismiss();
          }
          reject(new Error('Payment cancelled by user'));
        },
        onClose: () => {
          if (options?.onClose) {
            options.onClose();
          }
          reject(new Error('Payment modal closed'));
        },
      },
    };

    openRazorpayCheckout(razorpayOptions).catch(reject);
  });
}

/**
 * Create a refund for a payment (admin/staff only)
 * @param paymentId Payment ID to refund
 * @param amount Optional partial refund amount (if not provided, full refund)
 * @returns Refund response
 */
export async function createRefund(
  paymentId: string,
  amount?: number
): Promise<RefundResponse> {
  const requestData: RefundRequest = {
    payment_id: paymentId,
    ...(amount !== undefined && { amount }),
  };

  return makeAuthenticatedRequest<RefundResponse>(
    'payments/refund/',
    {
      method: 'POST',
      body: JSON.stringify(requestData),
    }
  );
}

/**
 * Create a payout (admin/staff only)
 * @param payoutId Payout ID
 * @returns Payout response
 */
export async function createPayout(
  payoutId: string
): Promise<PayoutResponse> {
  const requestData: PayoutRequest = {
    payout_id: payoutId,
  };

  return makeAuthenticatedRequest<PayoutResponse>(
    'payments/create-payout/',
    {
      method: 'POST',
      body: JSON.stringify(requestData),
    }
  );
}

