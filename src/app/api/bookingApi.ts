import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import { API_BASE_URL } from '../../lib/config';

// Booking request interface
export interface CreateBookingRequest {
  vehicle_model_code: string;
  vehicle_color: string;
  battery_variant: string;
  booking_amount: number;
  total_amount: number;
  delivery_city: string;
  delivery_state: string;
  delivery_pin: string;
  terms_accepted: boolean;
  referral_code?: string;
  join_distributor_program?: boolean;
  payment_gateway_ref?: string;
}

// Make payment request interface
export interface MakePaymentRequest {
  amount: number;
  payment_method: 'online' | 'bank_transfer' | 'cash' | 'wallet';
}

// User details interface for payment response
export interface PaymentUserDetails {
  id: number;
  fullname: string;
  email: string;
  mobile: string;
  username: string;
  profile_picture_url: string | null;
}

// Refund details interface
export interface RefundDetails {
  refund_id: string;
  refund_amount: string;
  refund_status: string;
  refund_created_at: number; // Unix timestamp
  refund_notes: {
    original_order_id?: string;
    refund_reason?: string;
  };
  refund_speed: string | null;
  original_amount: string;
  balance_amount: string;
}

// Payment response interface
export interface PaymentResponse {
  id: number;
  booking_number: string;
  booking_id?: number; // Booking ID for accept_payment endpoint
  booking?: number; // Alternative field name for booking ID
  user_details: PaymentUserDetails;
  refund_details: RefundDetails | null;
  amount: string;
  payment_method: 'online' | 'bank_transfer' | 'cash' | 'wallet';
  transaction_id?: string;
  status: string;
  payment_date: string;
  completed_at?: string;
  notes?: string;
  user: number;
}

// Payments list response interface
export interface PaymentsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentResponse[];
}

// Refund request interface
export interface RefundRequest {
  payment_id: string; // Razorpay payment_id from Payment model
  amount?: number | null; // Optional: Amount in rupees for partial refund (null/omitted = full refund)
}

// Refund response interface
export interface RefundResponse {
  refund_id: string;
  payment_id: string;
  amount: number; // Refund amount in paise
  status: string;
  message: string;
}

// Accept payment request interface
export interface AcceptPaymentRequest {
  amount: number;
  payment_method: 'online' | 'bank_transfer' | 'cash' | 'wallet';
  transaction_id?: string;
  notes?: string;
}

// Make payment response interface (can be same as BookingResponse or different)
export interface MakePaymentResponse {
  id: number;
  booking_amount: string;
  total_amount: string;
  total_paid: string;
  remaining_amount: string;
  status: string;
  payment_gateway_ref: string | null;
  updated_at: string;
  // Allow for additional fields from API
  [key: string]: string | number | null | undefined;
}

// Bookings list response interface
export interface BookingsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page_size?: number;
  current_page?: number;
  total_pages?: number;
  results: BookingResponse[];
}

// Booking response interface
export interface BookingResponse {
  id: number;
  user_email: string;
  user_mobile: string;
  vehicle_details: {
    id: number;
    name: string;
    model_code: string;
    vehicle_color: string[];
    battery_variant: string[];
    price: string;
  };
  model_code: string;
  reservation_status: string;
  reservation_expires_at: string;
  referred_by: {
    id: number;
    fullname: string;
    email: string;
  } | null;
  booking_number: string;
  vehicle_color: string;
  battery_variant: string;
  booking_amount: string;
  // Overall payment status for this booking (e.g. "pending", "completed")
  payment_status: string;
  payment_option: string;
  total_amount: string;
  total_paid: string;
  remaining_amount: string;
  bonus_amount: string | null;
  status: string;
  referrer_was_distributor: boolean;
  join_distributor_program: boolean;
  payment_gateway_ref: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_pin: string;
  terms_accepted: boolean;
  ip_address: string;
  expires_at: string;
  cancel_reason: string | null;
  emi_amount: string | null;
  emi_duration_months: number | null;
  emi_start_date: string | null;
  emi_paid_count: number;
  emi_total_count: number;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  user: number;
  vehicle_model: number;
}

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<BookingResponse, CreateBookingRequest>({
      queryFn: async (bookingData) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}booking/bookings/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          // Console log the request body
          const requestBodyString = JSON.stringify(bookingData);
          console.log('📤 [BOOKING API] Request URL:', url);
          console.log('📤 [BOOKING API] Request Body (Formatted):', JSON.stringify(bookingData, null, 2));
          console.log('📤 [BOOKING API] Request Body (Raw String):', requestBodyString);
          console.log('📤 [BOOKING API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: requestBodyString,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [BOOKING API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [BOOKING API] Retrying request with new token...');
                console.log('🔄 [BOOKING API] Retry Request Body:', JSON.stringify(bookingData, null, 2));
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: requestBodyString,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [BOOKING API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('📥 [BOOKING API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('Booking API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: [
        'Booking',
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id: 'LIST-all' },
        { type: 'Booking', id: 'LIST-pending' },
        { type: 'Booking', id: 'LIST-active' },
      ],
    }),
    makePayment: builder.mutation<MakePaymentResponse, { bookingId: number; paymentData: MakePaymentRequest }>({
      queryFn: async ({ bookingId, paymentData }) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}booking/bookings/${bookingId}/make_payment/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          // Console log the request body
          const requestBodyString = JSON.stringify(paymentData);
          console.log('💳 [PAYMENT API] Request URL:', url);
          console.log('💳 [PAYMENT API] Booking ID:', bookingId);
          console.log('💳 [PAYMENT API] Request Body (Formatted):', JSON.stringify(paymentData, null, 2));
          console.log('💳 [PAYMENT API] Request Body (Raw String):', requestBodyString);
          console.log('💳 [PAYMENT API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: requestBodyString,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [PAYMENT API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [PAYMENT API] Retrying request with new token...');
                console.log('🔄 [PAYMENT API] Retry Request Body:', JSON.stringify(paymentData, null, 2));
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: requestBodyString,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [PAYMENT API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [PAYMENT API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('💳 [PAYMENT API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: [
        'Booking',
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id: 'LIST-all' },
        { type: 'Booking', id: 'LIST-pending' },
        { type: 'Booking', id: 'LIST-active' },
        { type: 'Booking', id: 'LIST-completed' },
        { type: 'Booking', id: 'LIST-cancelled' },
        { type: 'Booking', id: 'LIST-expired' },
      ],
    }),
    getBookings: builder.query<BookingsListResponse, { page?: number; page_size?: number; status?: string; search?: string } | void>({
      queryFn: async (params) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          
          // Build query string
          const queryParams = new URLSearchParams();
          if (params && typeof params === 'object') {
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.page_size) queryParams.append('page_size', params.page_size.toString());
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);
          }
          
          const queryString = queryParams.toString();
          const url = `${baseUrl}booking/bookings/${queryString ? `?${queryString}` : ''}`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          // Console log the request
          console.log('📤 [BOOKINGS LIST API] Request URL:', url);
          console.log('📤 [BOOKINGS LIST API] Query Params:', params);
          console.log('📤 [BOOKINGS LIST API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [BOOKINGS LIST API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [BOOKINGS LIST API] Retrying request with new token...');
                // Rebuild URL with query params for retry
                const retryUrl = `${baseUrl}booking/bookings/${queryString ? `?${queryString}` : ''}`;
                response = await fetch(retryUrl, {
                  method: 'GET',
                  headers,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [BOOKINGS LIST API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('📥 [BOOKINGS LIST API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('💳 [BOOKINGS LIST API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      // Serialize query params for proper caching - each status, search, and page gets its own cache entry
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const status = queryArgs?.status || 'all';
        const page = queryArgs?.page || 1;
        const page_size = queryArgs?.page_size || 20;
        const search = queryArgs?.search || '';
        return `${endpointName}(${JSON.stringify({ status, page, page_size, search })})`;
      },
      // Provide cache tags based on status and individual booking IDs
      providesTags: (result, error, queryArgs) => {
        const status = queryArgs?.status || 'all';
        const tags: Array<{ type: 'Booking'; id: string | number }> = [
          { type: 'Booking', id: 'LIST' },
          { type: 'Booking', id: `LIST-${status}` },
        ];
        
        // Add individual booking tags if results exist
        if (result?.results) {
          tags.push(
            ...result.results.map((booking) => ({
              type: 'Booking' as const,
              id: booking.id,
            }))
          );
        }
        
        return tags;
      },
      // Merge function for pagination - only merge on initial pagination, not on refetch
      // When refetch is called, we want to replace the data entirely, not merge
      merge: (currentCache, newItems, { arg }) => {
        if (!newItems?.results) return currentCache;
        
        // If search or status changed, always replace (don't merge)
        if (arg && typeof arg === 'object') {
          const hasSearch = arg.search && arg.search !== '';
          const hasStatus = arg.status && arg.status !== 'all';
          
          // If search or status filter is active, always replace
          if (hasSearch || hasStatus) {
            console.log('🔄 [BOOKINGS API] Search/Status filter active - replacing cache');
            return newItems;
          }
        }
        
        // If this is a refetch (no page arg or page is 1), replace entirely
        // Only merge when actually paginating (page > 1)
        if (arg && typeof arg === 'object' && arg.page && arg.page > 1) {
          // For pagination, merge results
          if (currentCache && currentCache.results) {
            return {
              ...newItems,
              results: [...currentCache.results, ...newItems.results],
            };
          }
        }
        
        // For refetch or first page, replace entirely
        return newItems;
      },
      // Force refetch when status or search changes
      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          currentArg?.status !== previousArg?.status ||
          currentArg?.search !== previousArg?.search
        );
      },
    }),
    getBookingDetail: builder.query<BookingResponse, number>({
      queryFn: async (bookingId) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}booking/bookings/${bookingId}/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          console.log('📤 [BOOKING DETAIL API] Request URL:', url);
          console.log('📤 [BOOKING DETAIL API] Booking ID:', bookingId);
          console.log('📤 [BOOKING DETAIL API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [BOOKING DETAIL API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [BOOKING DETAIL API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'GET',
                  headers,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [BOOKING DETAIL API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('📥 [BOOKING DETAIL API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('❌ [BOOKING DETAIL API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
    }),
    updateBookingStatus: builder.mutation<BookingResponse, { bookingId: number; status: string }>({
      queryFn: async ({ bookingId, status }) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}booking/bookings/${bookingId}/update_status/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          const requestBody = { status };
          console.log('📤 [UPDATE BOOKING STATUS API] Request URL:', url);
          console.log('📤 [UPDATE BOOKING STATUS API] Booking ID:', bookingId);
          console.log('📤 [UPDATE BOOKING STATUS API] Request Body:', JSON.stringify(requestBody, null, 2));
          console.log('📤 [UPDATE BOOKING STATUS API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(requestBody),
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [UPDATE BOOKING STATUS API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [UPDATE BOOKING STATUS API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify(requestBody),
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [UPDATE BOOKING STATUS API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [UPDATE BOOKING STATUS API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('❌ [UPDATE BOOKING STATUS API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: (result, error, { bookingId }) => [
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id: 'LIST-all' },
        { type: 'Booking', id: 'LIST-pending' },
        { type: 'Booking', id: 'LIST-active' },
        { type: 'Booking', id: 'LIST-completed' },
        { type: 'Booking', id: 'LIST-cancelled' },
        { type: 'Booking', id: 'LIST-expired' },
        { type: 'Booking', id: 'LIST-delivered' },
      ],
    }),
    getPayments: builder.query<PaymentsListResponse, void>({
      queryFn: async () => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}booking/payments/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          console.log('📤 [PAYMENTS API] Request URL:', url);
          console.log('📤 [PAYMENTS API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [PAYMENTS API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [PAYMENTS API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'GET',
                  headers,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [PAYMENTS API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('📥 [PAYMENTS API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('❌ [PAYMENTS API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: [{ type: 'Booking', id: 'PAYMENTS' }],
    }),
    acceptPayment: builder.mutation<BookingResponse, { bookingId: number; paymentData: AcceptPaymentRequest }>({
      queryFn: async ({ bookingId, paymentData }) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}booking/bookings/${bookingId}/accept_payment/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          // Console log the request body
          const requestBodyString = JSON.stringify(paymentData);
          console.log('📤 [ACCEPT PAYMENT API] Request URL:', url);
          console.log('📤 [ACCEPT PAYMENT API] Booking ID:', bookingId);
          console.log('📤 [ACCEPT PAYMENT API] Request Body (Formatted):', JSON.stringify(paymentData, null, 2));
          console.log('📤 [ACCEPT PAYMENT API] Request Body (Raw String):', requestBodyString);
          console.log('📤 [ACCEPT PAYMENT API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: requestBodyString,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [ACCEPT PAYMENT API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [ACCEPT PAYMENT API] Retrying request with new token...');
                console.log('🔄 [ACCEPT PAYMENT API] Retry Request Body:', JSON.stringify(paymentData, null, 2));
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: requestBodyString,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [ACCEPT PAYMENT API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [ACCEPT PAYMENT API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('❌ [ACCEPT PAYMENT API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: [
        'Booking',
        { type: 'Booking', id: 'PAYMENTS' },
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id: 'LIST-all' },
        { type: 'Booking', id: 'LIST-pending' },
        { type: 'Booking', id: 'LIST-active' },
        { type: 'Booking', id: 'LIST-completed' },
      ],
    }),
    cancelBooking: builder.mutation<BookingResponse, number>({
      queryFn: async (bookingId) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}booking/bookings/${bookingId}/cancel/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          console.log('📤 [CANCEL BOOKING API] Request URL:', url);
          console.log('📤 [CANCEL BOOKING API] Booking ID:', bookingId);
          console.log('📤 [CANCEL BOOKING API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [CANCEL BOOKING API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [CANCEL BOOKING API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [CANCEL BOOKING API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [CANCEL BOOKING API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('❌ [CANCEL BOOKING API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: (result, error, bookingId) => [
        { type: 'Booking', id: bookingId },
        { type: 'Booking', id: 'LIST' },
        { type: 'Booking', id: 'LIST-all' },
        { type: 'Booking', id: 'LIST-pending' },
        { type: 'Booking', id: 'LIST-active' },
        { type: 'Booking', id: 'LIST-completed' },
        { type: 'Booking', id: 'LIST-cancelled' },
        { type: 'Booking', id: 'LIST-expired' },
      ],
    }),
    createRefund: builder.mutation<RefundResponse, RefundRequest>({
      queryFn: async (refundData) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = API_BASE_URL;
          const url = `${baseUrl}payments/refund/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          const requestBody: RefundRequest = {
            payment_id: refundData.payment_id,
          };
          
          // Only include amount if provided (for partial refund)
          if (refundData.amount !== undefined && refundData.amount !== null) {
            requestBody.amount = refundData.amount;
          }
          
          console.log('📤 [REFUND API] Request URL:', url);
          console.log('📤 [REFUND API] Request Body:', JSON.stringify(requestBody, null, 2));
          console.log('📤 [REFUND API] Request Headers:', headers);
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [REFUND API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [REFUND API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(requestBody),
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [REFUND API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [REFUND API] Success Response:', JSON.stringify(data, null, 2));
          
          return { data };
        } catch (error) {
          console.error('❌ [REFUND API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: [
        { type: 'Booking', id: 'PAYMENTS' },
        { type: 'Booking', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useCreateBookingMutation, 
  useMakePaymentMutation, 
  useGetBookingsQuery, 
  useGetBookingDetailQuery,
  useUpdateBookingStatusMutation,
  useGetPaymentsQuery,
  useAcceptPaymentMutation,
  useCancelBookingMutation,
  useCreateRefundMutation
} = bookingApi;

