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
 * Helper function to make authenticated API calls with retry logic for 504 Gateway Timeout
 * This handles backend cold start issues where the first request times out but subsequent requests succeed
 */
async function makeAuthenticatedRequest<T>(
  url: string,
  options: RequestInit = {},
  retryConfig?: {
    maxRetries?: number;
    retryDelay?: number;
    retryableStatuses?: number[];
  }
): Promise<T> {
  const baseUrl = API_BASE_URL;
  const fullUrl = `${baseUrl}${url.startsWith('/') ? url.slice(1) : url}`;

  // Default retry configuration
  const maxRetries = retryConfig?.maxRetries ?? 2; // Retry up to 2 times (3 total attempts)
  const baseRetryDelay = retryConfig?.retryDelay ?? 2000; // Start with 2 second delay
  const retryableStatuses = retryConfig?.retryableStatuses ?? [504]; // Retry on 504 Gateway Timeout

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

  let lastError: Error | null = null;
  let attempt = 0;

  // Retry loop for 504 errors (handles backend cold start)
  while (attempt <= maxRetries) {
    try {
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

      // If we get a retryable status code (like 504), retry with exponential backoff
      if (!response.ok && retryableStatuses.includes(response.status) && attempt < maxRetries) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        attempt++;
        const retryDelay = baseRetryDelay * Math.pow(2, attempt - 1); // Exponential backoff: 2s, 4s
        
        console.warn(`⚠️ [PAYMENTS] Received ${response.status} error (attempt ${attempt}/${maxRetries + 1}). Retrying in ${retryDelay}ms...`, {
          url: fullUrl,
          status: response.status,
          errorMessage,
          attempt,
          maxRetries: maxRetries + 1,
        });

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue; // Retry the request
      }

      // If response is not ok and not retryable, throw error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Success - return the response
      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this is a network error or timeout and we have retries left, retry
      if (attempt < maxRetries) {
        attempt++;
        const retryDelay = baseRetryDelay * Math.pow(2, attempt - 1);
        
        console.warn(`⚠️ [PAYMENTS] Request failed (attempt ${attempt}/${maxRetries + 1}). Retrying in ${retryDelay}ms...`, {
          url: fullUrl,
          error: lastError.message,
          attempt,
          maxRetries: maxRetries + 1,
        });

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue; // Retry the request
      }

      // No more retries left, throw the error
      throw lastError;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Request failed after all retries');
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

  // Use retry logic specifically for create-order to handle backend cold start (504 errors)
  // The first request might timeout due to backend initialization, but retry will succeed
  return makeAuthenticatedRequest<CreateOrderResponse>(
    'payments/create-order/',
    {
      method: 'POST',
      body: JSON.stringify(requestData),
    },
    {
      maxRetries: 2, // Retry up to 2 times (3 total attempts)
      retryDelay: 2000, // Start with 2 second delay, then 4 seconds
      retryableStatuses: [504], // Retry on 504 Gateway Timeout (backend cold start)
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

