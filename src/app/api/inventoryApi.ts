import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import { getApiBaseUrl } from '../../lib/config';

// Types based on the API response structure
export interface VehicleImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  alt_text: string;
  order: number;
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
  }),
});

export const { useGetVehiclesQuery, useLazyGetVehiclesQuery, useGetStockQuery } = inventoryApi;

