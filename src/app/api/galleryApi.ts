import { api } from './baseApi';
import { API_BASE_URL } from '../../lib/config';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Gallery Item Types
export interface GalleryItem {
  id: number;
  title: string;
  image: string;
  image_url: string;
  caption?: string;
  level: string;
  level_display?: string;
  order: number;
  status: boolean;
  created_by: number;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

// Create Gallery Item Request
export interface CreateGalleryItemRequest {
  title: string;
  image: File;
  caption?: string;
  level: string;
  order?: number;
  status?: boolean;
}

// Update Gallery Item Request
export interface UpdateGalleryItemRequest {
  title: string;
  image: File | string; // Can be a new File or existing image path
  caption?: string;
  level: string;
  order?: number;
  status?: boolean;
}

export const galleryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all gallery items
    getGalleryItems: builder.query<GalleryItem[], void>({
      query: () => ({
        url: 'gallery/gallery-items/',
        method: 'GET',
      }),
      providesTags: ['GalleryItems'],
    }),

    // Get single gallery item by ID
    getGalleryItemById: builder.query<GalleryItem, number>({
      query: (id) => ({
        url: `gallery/gallery-items/${id}/`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'GalleryItems', id }],
    }),

    // Create gallery item
    createGalleryItem: builder.mutation<GalleryItem, CreateGalleryItemRequest>({
      query: (body) => {
        const formData = new FormData();
        formData.append('title', body.title);
        formData.append('image', body.image);
        if (body.caption) {
          formData.append('caption', body.caption);
        }
        formData.append('level', body.level);
        if (body.order !== undefined) {
          formData.append('order', body.order.toString());
        }
        if (body.status !== undefined) {
          formData.append('status', body.status.toString());
        }

        return {
          url: 'gallery/gallery-items/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['GalleryItems'],
    }),

    // Update gallery item
    updateGalleryItem: builder.mutation<GalleryItem, { id: number; data: UpdateGalleryItemRequest }>({
      queryFn: async ({ id, data }, _api, _extraOptions, baseQuery) => {
        // Note: We use queryFn to handle FormData manually
        // We don't use baseQuery to avoid Content-Type issues with multipart/form-data
        try {
          const baseUrl = API_BASE_URL;
          const putEndpoint = `gallery/gallery-items/${id}/`;
          const fullPutUrl = `${baseUrl}${putEndpoint}`;
          
          console.log('🔄 [Gallery API] Starting update gallery item');
          console.log('📝 [Gallery API] Item ID:', id);
          console.log('🌐 [Gallery API] PUT Endpoint:', putEndpoint);
          console.log('🌐 [Gallery API] Full PUT URL:', fullPutUrl);
          console.log('📦 [Gallery API] Update data:', {
            title: data.title,
            caption: data.caption,
            level: data.level,
            order: data.order,
            status: data.status,
            imageType: data.image instanceof File ? 'File' : typeof data.image,
          });
          
          const formData = new FormData();
          formData.append('title', data.title);
          
          // Store the image file for potential retry
          let imageFile: File | null = null;
          
          // If image is a File, append it directly
          if (data.image instanceof File) {
            console.log('📎 [Gallery API] Using provided File object:', {
              name: data.image.name,
              size: data.image.size,
              type: data.image.type,
            });
            imageFile = data.image;
            formData.append('image', data.image);
          } else if (typeof data.image === 'string' && data.image.trim()) {
            // If it's a string (existing image URL), we need to fetch it and convert to File
            // This is required because the API expects multipart/form-data with a file
            try {
              // Use the URL as-is if it's already a full URL, otherwise construct it
              let imageUrl = data.image.trim();
              
              // Validate the URL is not empty or just slashes
              if (!imageUrl || imageUrl === '/' || imageUrl === '//' || imageUrl === '/api' || imageUrl === '/api/') {
                throw new Error('Invalid image URL: URL is empty, invalid, or points to API base');
              }
              
              // Check if it's a relative path that needs construction
              if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                // It's a relative path, construct full URL
                const mediaBaseUrl = baseUrl.replace('/api/', '');
                
                // Ensure we have a valid path (not empty, not just /, not /api)
                if (!imageUrl || imageUrl === '/' || imageUrl === '/api' || imageUrl === '/api/') {
                  throw new Error('Invalid image URL: Relative path is empty or points to API base');
                }
                
                // Ensure we have a valid path
                if (imageUrl.startsWith('/')) {
                  imageUrl = `${mediaBaseUrl}${imageUrl}`;
                } else {
                  imageUrl = `${mediaBaseUrl}/${imageUrl}`;
                }
              }
              
              // Final validation - ensure URL is not pointing to base API URL
              if (imageUrl === baseUrl || imageUrl === `${baseUrl}/` || imageUrl.endsWith('/api/') || imageUrl.endsWith('/api')) {
                throw new Error(`Invalid image URL: URL points to base API URL (${imageUrl})`);
              }
              
              // Ensure URL has a valid path after the domain
              try {
                const urlObj = new URL(imageUrl);
                if (!urlObj.pathname || urlObj.pathname === '/' || urlObj.pathname === '/api' || urlObj.pathname === '/api/') {
                  throw new Error(`Invalid image URL: URL has no valid path (${imageUrl})`);
                }
              } catch (urlError) {
                // If URL constructor fails, the URL is invalid
                throw new Error(`Invalid image URL format: ${imageUrl}`);
              }
              
              console.log('🖼️ [Gallery API] Original image string:', data.image);
              console.log('🖼️ [Gallery API] Constructed image URL:', imageUrl);
              console.log('🖼️ [Gallery API] Fetching image with GET request to:', imageUrl);
              
              const response = await fetch(imageUrl, {
                method: 'GET',
                // Don't include credentials to avoid CORS issues
                credentials: 'omit',
              });
              
              console.log('🖼️ [Gallery API] Image fetch response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url,
              });
              
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
              }
              
              const blob = await response.blob();
              if (!blob || blob.size === 0) {
                throw new Error('Fetched image is empty');
              }
              
              const fileName = imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
              imageFile = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
              formData.append('image', imageFile);
              console.log('✅ [Gallery API] Successfully converted image URL to File:', {
                fileName,
                size: blob.size,
                type: blob.type,
              });
            } catch (error) {
              console.error('❌ [Gallery API] Failed to fetch existing image:', error);
              // If fetching fails, we cannot proceed without an image file
              // The API requires an image file, so we need to throw an error
              const errorMessage = error instanceof Error ? error.message : String(error);
              return {
                error: {
                  status: 'CUSTOM_ERROR' as const,
                  error: `Failed to load existing image. Please select a new image file. ${errorMessage}`,
                  data: { message: `Failed to load existing image. Please select a new image file.` },
                } as FetchBaseQueryError,
              };
            }
          } else {
            // No image provided - this should not happen, but handle gracefully
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'Image is required. Please select an image file.',
                data: { message: 'Image is required. Please select an image file.' },
              } as FetchBaseQueryError,
            };
          }
          
          if (data.caption !== undefined) {
            formData.append('caption', data.caption);
          }
          formData.append('level', data.level);
          if (data.order !== undefined) {
            formData.append('order', data.order.toString());
          }
          if (data.status !== undefined) {
            formData.append('status', data.status.toString());
          }

          // Log FormData contents (excluding file data for size)
          const formDataEntries: Record<string, string> = {};
          formData.forEach((value, key) => {
            if (value instanceof File) {
              formDataEntries[key] = `[File: ${value.name}, ${value.size} bytes, ${value.type}]`;
            } else {
              formDataEntries[key] = String(value);
            }
          });
          console.log('📤 [Gallery API] FormData contents:', formDataEntries);
          console.log('📤 [Gallery API] Sending PUT request to:', fullPutUrl);
          console.log('📤 [Gallery API] Request method: PUT');
          console.log('📤 [Gallery API] Content-Type: multipart/form-data (set by browser)');

          // Get access token
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          // Make the PUT request directly with fetch (not through baseQuery)
          // This ensures proper multipart/form-data handling without Content-Type conflicts
          const headers: HeadersInit = new Headers();
          headers.set('Authorization', `Bearer ${accessToken}`);
          // CRITICAL: Do NOT set Content-Type - browser will automatically set it with boundary
          // Setting it manually will break multipart/form-data encoding
          
          console.log('📤 [Gallery API] Making direct fetch request (bypassing RTK Query baseQuery)');
          console.log('📤 [Gallery API] URL:', fullPutUrl);
          console.log('📤 [Gallery API] Method: PUT');
          console.log('📤 [Gallery API] Headers:', {
            Authorization: 'Bearer [TOKEN]',
            'Content-Type': 'NOT SET - Browser will set multipart/form-data with boundary',
          });
          
          let response = await fetch(fullPutUrl, {
            method: 'PUT',
            headers: headers,
            body: formData,
            credentials: 'include', // Include cookies if needed
          });
          
          console.log('📥 [Gallery API] Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            contentType: response.headers.get('content-type'),
            url: response.url,
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [Gallery API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [Gallery API] Retrying request with new token...');
                // Recreate FormData (can't reuse after being sent)
                const retryFormData = new FormData();
                retryFormData.append('title', data.title);
                if (imageFile) {
                  retryFormData.append('image', imageFile);
                } else {
                  // This shouldn't happen, but handle it
                  return {
                    error: {
                      status: 'CUSTOM_ERROR' as const,
                      error: 'Image file not available for retry',
                      data: { message: 'Image file not available for retry' },
                    } as FetchBaseQueryError,
                  };
                }
                if (data.caption !== undefined) {
                  retryFormData.append('caption', data.caption);
                }
                retryFormData.append('level', data.level);
                if (data.order !== undefined) {
                  retryFormData.append('order', data.order.toString());
                }
                if (data.status !== undefined) {
                  retryFormData.append('status', data.status.toString());
                }

                response = await fetch(fullPutUrl, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                  },
                  body: retryFormData,
                });
              }
            }
          }

          if (!response.ok) {
            // Try to parse JSON error, but handle HTML responses
            let errorData: unknown = {};
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
              try {
                errorData = await response.json();
              } catch (e) {
                console.error('❌ [Gallery API] Failed to parse error JSON:', e);
                errorData = { message: response.statusText };
              }
            } else {
              // If it's HTML (like 404 page), just get text
              const text = await response.text();
              console.error('❌ [Gallery API] Received non-JSON error response:', {
                status: response.status,
                contentType,
                textPreview: text.substring(0, 200),
              });
              errorData = { 
                message: `Server returned ${response.status} ${response.statusText}`,
                detail: 'Non-JSON response received'
              };
            }
            
            console.error('❌ [Gallery API] PUT request failed:', {
              status: response.status,
              statusText: response.statusText,
              errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          // Parse successful response
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn('⚠️ [Gallery API] Unexpected content-type:', contentType);
          }
          
          let result: GalleryItem;
          try {
            result = await response.json();
            console.log('✅ [Gallery API] Update successful:', result);
            return { data: result };
          } catch (e) {
            console.error('❌ [Gallery API] Failed to parse response JSON:', e);
            const text = await response.text();
            console.error('❌ [Gallery API] Response text:', text.substring(0, 500));
            return {
              error: {
                status: 'PARSING_ERROR' as const,
                originalStatus: response.status,
                data: text,
                error: 'Failed to parse response as JSON',
              } as FetchBaseQueryError,
            };
          }
        } catch (error) {
          console.error('❌ [Gallery API] Unexpected error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error instanceof Error ? error.message : String(error),
            },
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'GalleryItems', id }, 'GalleryItems'],
    }),

    // Delete gallery item
    deleteGalleryItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `gallery/gallery-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GalleryItems'],
    }),
  }),
});

export const {
  useGetGalleryItemsQuery,
  useGetGalleryItemByIdQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
} = galleryApi;

