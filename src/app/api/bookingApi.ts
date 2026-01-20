import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import { getApiBaseUrl } from '../../lib/config';

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
  referred_by: string | null;
  booking_number: string;
  vehicle_color: string;
  battery_variant: string;
  booking_amount: string;
  payment_option: string;
  total_amount: string;
  total_paid: string;
  remaining_amount: string;
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
          const baseUrl = getApiBaseUrl();
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
      invalidatesTags: ['Booking'],
    }),
    makePayment: builder.mutation<MakePaymentResponse, { bookingId: number; paymentData: MakePaymentRequest }>({
      queryFn: async ({ bookingId, paymentData }) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
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
      invalidatesTags: ['Booking'],
    }),
    getBookings: builder.query<BookingsListResponse, { page?: number; status?: string } | void>({
      queryFn: async (params) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          
          // Build query string
          const queryParams = new URLSearchParams();
          if (params && typeof params === 'object') {
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.status) queryParams.append('status', params.status);
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
      providesTags: ['Booking'],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateBookingMutation, useMakePaymentMutation, useGetBookingsQuery } = bookingApi;

