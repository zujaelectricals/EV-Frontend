import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import { getApiBaseUrl } from '../../lib/config';

// Types based on the API response structure
export interface VehicleImage {
  id: number;
  image?: string; // Full image path
  image_url: string;
  is_primary: boolean;
  alt_text: string;
  order: number;
  vehicle?: number; // Vehicle ID this image belongs to
  created_at?: string;
}

export interface VehicleVariant {
  id: number;
  model_code: string;
  vehicle_color: string[];
  battery_variant: string[];
  price: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  primary_image_url: string | null;
  image_count: number;
  images: VehicleImage[];
  stock_total_quantity: number;
  stock_available_quantity: number;
  stock_reserved_quantity: number;
  created_at: string;
}

export interface VehicleGroup {
  name: string;
  colors_available: string[];
  battery_capacities_available: string[];
  price_range: {
    min: number;
    max: number;
  };
  total_variants: number;
  status_summary: {
    available: number;
    out_of_stock?: number;
    discontinued?: number;
  };
  features: string[];
  specifications: Record<string, string>;
  description: string;
  variants: VehicleVariant[];
}

export interface InventoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: VehicleGroup[];
}

export interface InventoryQueryParams {
  page?: number;
  page_size?: number;
  name?: string;
  model_code?: string;
  status?: 'available' | 'out_of_stock' | 'discontinued';
  color?: string;
  battery?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
}

// Other variant interface for stock response
export interface OtherVariant {
  id: number;
  model_code: string;
  vehicle_color: string[];
  battery_variant: string[];
  price: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  primary_image_url: string | null;
  image_count: number;
  images: VehicleImage[];
  stock_total_quantity: number;
  stock_available_quantity: number;
  stock_reserved_quantity: number;
  created_at: string;
}

// Stock detail response interface - matches actual API response
export interface StockDetailResponse {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_model_code: string;
  vehicle_colors: string[];
  battery_variants: string[];
  features: string[];
  specifications: Record<string, string>;
  description: string;
  price: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  primary_image_url: string | null;
  images: VehicleImage[];
  other_variants: OtherVariant[];
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  created_at: string;
  updated_at: string;
}

// Vehicle detail response - single variant from GET inventory/vehicles/{id}/
export interface VehicleDetailResponse {
  id: number;
  name: string;
  model_code: string;
  vehicle_color: string[];
  battery_variant: string[];
  price: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  description: string;
  features: string[];
  specifications: Record<string, string>;
  images: VehicleImage[];
  primary_image_url: string | null;
  stock_total_quantity: number;
  stock_available_quantity: number;
  stock_reserved_quantity: number;
  created_at: string;
  updated_at: string;
}

// Update vehicle request - PUT inventory/vehicles/{id}/
export interface UpdateVehicleRequest {
  name: string;
  vehicle_color: string[];
  battery_variant: string[];
  price: number;
  battery_pricing?: Record<string, number>; // Optional: Dictionary mapping battery variant names to prices
  status: 'available' | 'out_of_stock' | 'discontinued';
  description: string;
  features: string[];
  specifications: Record<string, string>;
  color_images?: Record<string, number[]>; // Optional: Object mapping colors to image ID arrays
  image_ids?: number[]; // Optional: Fallback array of image IDs
  initial_quantity?: number; // Or use stock_quantity (both supported)
}

export const inventoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query<InventoryResponse, InventoryQueryParams | void>({
      queryFn: async (params = {}) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          
          // Build query string
          const queryParams = new URLSearchParams();
          
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.page_size) queryParams.append('page_size', params.page_size.toString());
          if (params.name) queryParams.append('name', params.name);
          if (params.model_code) queryParams.append('model_code', params.model_code);
          if (params.status) queryParams.append('status', params.status);
          if (params.color) queryParams.append('color', params.color);
          if (params.battery) queryParams.append('battery', params.battery);
          if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
          if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
          if (params.search) queryParams.append('search', params.search);
          
          const queryString = queryParams.toString();
          const url = `${baseUrl}inventory/vehicles/${queryString ? `?${queryString}` : ''}`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [INVENTORY API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
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
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('Inventory API Response:', data);
          
          return { data };
        } catch (error) {
          console.error('Inventory API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: ['Inventory'],
    }),
    getStock: builder.query<StockDetailResponse, number>({
      queryFn: async (variantId) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          const url = `${baseUrl}inventory/stock/${variantId}/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [STOCK API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
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
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('Stock API Response:', data);
          
          return { data };
        } catch (error) {
          console.error('Stock API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: ['Inventory'],
    }),
    getVehicleById: builder.query<VehicleDetailResponse, number>({
      queryFn: async (variantId) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          const url = `${baseUrl}inventory/vehicles/${variantId}/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [VEHICLE DETAIL API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
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
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('Vehicle Detail API Response:', data);
          
          return { data };
        } catch (error) {
          console.error('Vehicle Detail API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: (result, error, variantId) => [{ type: 'Inventory', id: variantId }],
    }),
    updateVehicle: builder.mutation<VehicleDetailResponse, { id: number; data: UpdateVehicleRequest }>({
      queryFn: async ({ id, data }) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          const url = `${baseUrl}inventory/vehicles/${id}/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          // Console log the PUT request
          console.log('📤 [UPDATE VEHICLE API] Request URL:', url);
          console.log('📤 [UPDATE VEHICLE API] Request Method: PUT');
          console.log('📤 [UPDATE VEHICLE API] Request Headers:', headers);
          console.log('📤 [UPDATE VEHICLE API] Request Body:', JSON.stringify(data, null, 2));
          
          let response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
          });
          
          console.log('📥 [UPDATE VEHICLE API] Response Status:', response.status);
          console.log('📥 [UPDATE VEHICLE API] Response Headers:', Object.fromEntries(response.headers.entries()));
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [UPDATE VEHICLE API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                response = await fetch(url, {
                  method: 'PUT',
                  headers,
                  body: JSON.stringify(data),
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
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const responseData = await response.json();
          console.log('📥 [UPDATE VEHICLE API] Response Body:', JSON.stringify(responseData, null, 2));
          console.log('✅ [UPDATE VEHICLE API] Update successful');
          
          return { data: responseData };
        } catch (error) {
          console.error('Update Vehicle API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }, 'Inventory'],
    }),
    deleteVehicle: builder.mutation<{ success: boolean; message?: string }, number>({
      queryFn: async (variantId) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          const url = `${baseUrl}inventory/vehicles/${variantId}/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          let response = await fetch(url, {
            method: 'DELETE',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [DELETE VEHICLE API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                response = await fetch(url, {
                  method: 'DELETE',
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
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          // DELETE might return empty body or success message
          let responseData: { success: boolean; message?: string } = { success: true };
          try {
            const text = await response.text();
            if (text) {
              responseData = JSON.parse(text);
            }
          } catch {
            // Empty response is fine for DELETE
          }
          
          console.log('Delete Vehicle API Response:', responseData);
          
          return { data: responseData };
        } catch (error) {
          console.error('Delete Vehicle API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['Inventory'],
    }),
    getStockList: builder.query<StockListResponse, StockListQueryParams | void>({
      queryFn: async (params = {}) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          
          // Build query string
          const queryParams = new URLSearchParams();
          
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.page_size) queryParams.append('page_size', params.page_size.toString());
          if (params.vehicle_id) queryParams.append('vehicle_id', params.vehicle_id.toString());
          if (params.model_code) queryParams.append('model_code', params.model_code);
          if (params.vehicle_name) queryParams.append('vehicle_name', params.vehicle_name);
          if (params.min_available !== undefined) queryParams.append('min_available', params.min_available.toString());
          if (params.max_available !== undefined) queryParams.append('max_available', params.max_available.toString());
          
          const queryString = queryParams.toString();
          const url = `${baseUrl}inventory/stock/${queryString ? `?${queryString}` : ''}`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [STOCK LIST API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
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
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('Stock List API Response:', data);
          
          return { data };
        } catch (error) {
          console.error('Stock List API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: ['Inventory'],
    }),
  }),
});

// Stock List Types
export interface StockListItem {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_model_code: string;
  vehicle_colors?: string[];
  battery_variants?: string[];
  total_quantity: number; // stock_total_quantity - total units of this model variant
  available_quantity: number; // stock_available_quantity - available units
  reserved_quantity: number;
  max_capacity?: number; // Optional: maximum capacity for this variant
  created_at: string;
  updated_at: string;
}

export interface LowStockItem {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_model_code: string;
  available_quantity: number;
  total_quantity: number;
  reorder_level: number;
  status: 'low_stock' | 'out_of_stock';
}

export interface StockTrendData {
  label: string;
  total_stock: number;
}

export interface StockListSummary {
  total_stock: number;
  inventory_value: number;
  low_stock_threshold_percent: number;
  low_stock_alerts_count: number;
  out_of_stock_count: number;
  low_stock_items: LowStockItem[];
  stock_trend: StockTrendData[];
}

export interface StockListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StockListItem[];
  summary: StockListSummary;
}

export interface StockListQueryParams {
  page?: number;
  page_size?: number;
  vehicle_id?: number;
  model_code?: string;
  vehicle_name?: string;
  min_available?: number;
  max_available?: number;
}

export const { 
  useGetVehiclesQuery, 
  useLazyGetVehiclesQuery, 
  useGetStockQuery,
  useGetStockListQuery,
  useLazyGetStockListQuery,
  useGetVehicleByIdQuery,
  useLazyGetVehicleByIdQuery,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = inventoryApi;

