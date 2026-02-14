import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import { API_BASE_URL } from '../../lib/config';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// System settings interface matching the API schema
export interface SystemSettings {
    booking_reservation_timeout_minutes: number | null; // Integer (minutes) or null (never expires)
    direct_user_commission_amount: number; // Commission per direct user before activation (default: ₹1000)
    binary_commission_activation_count: number; // Number of direct users needed to activate binary commission (default: 3, min: 1)
    binary_pair_commission_amount: number; // Commission per binary pair after activation (default: ₹2000)
    binary_tds_threshold_pairs: number; // Number of pairs after activation before extra deduction starts (default: 5, min: 0)
    binary_commission_tds_percentage: number; // TDS percentage on ALL binary commissions (default: 20%, range: 0-100)
    binary_extra_deduction_percentage: number; // Extra deduction percentage on 6th+ pairs (default: 20%, range: 0-100)
    binary_daily_pair_limit: number; // Maximum binary pairs per day after activation (default: 10, min: 1)
    max_earnings_before_active_buyer: number; // Maximum number of binary pairs non-Active Buyer ASA(Authorized Sales Associate) can earn commission for before becoming Active Buyer (default: 5 pairs). 6th+ pairs are blocked until user becomes Active Buyer (default: 5, min: 1)
    binary_commission_initial_bonus: number; // Initial bonus amount (in rupees) credited to user's wallet and total_earnings when binary commission is activated (3 persons). TDS is deducted from this amount, but TDS is NOT deducted from booking balance (default: 0)
    binary_tree_default_placement_side: 'left' | 'right'; // Default placement side: "left" or "right" (default: "left")
    activation_amount: number; // Minimum payment amount per booking required for seniors to earn commission. If payment is less than this amount, no commission is credited, but user is still counted in descendants calculation. On cancellation, this amount is withheld for future point redemption (default: ₹5000, min: 0)
    distributor_application_auto_approve: boolean; // If true, auto-approve distributor applications; if false, require admin/staff approval (default: true)
    payout_approval_needed: boolean; // If true, payout requests require admin approval; if false, payouts are automatically processed upon creation (default: true)
    payout_tds_percentage: number; // TDS percentage applied on payout withdrawals (default: 0, meaning no payout TDS, range: 0-100)
    company_referral_code: string; // Static referral code representing the company (used for first booking in the system, default: "COMPANY", min length: 3, max length: 20)
}

// Partial settings for PATCH requests (all fields optional)
export type SystemSettingsUpdate = Partial<SystemSettings>;

// API response for settings
export interface SettingsResponse {
    success?: boolean;
    message?: string;
    data?: SystemSettings;
}

export const settingsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET settings/ - Get current system settings
        getSettings: builder.query<SystemSettings, void>({
            queryFn: async () => {
                const { accessToken } = getAuthTokens();

                if (!accessToken) {
                    return {
                        error: {
                            status: 401,
                            data: { message: 'No access token found' },
                        } as FetchBaseQueryError,
                    };
                }

                try {
                    console.log('📤 [SETTINGS API - GET] Fetching system settings...');

                    let response = await fetch(`${API_BASE_URL}settings/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    // Handle 401 Unauthorized - try to refresh token
                    if (response.status === 401) {
                        console.log('🟡 [SETTINGS API - GET] Access token expired, attempting to refresh...');
                        const refreshData = await refreshAccessToken();

                        if (refreshData) {
                            // Retry the request with new token
                            const { accessToken: newAccessToken } = getAuthTokens();
                            if (newAccessToken) {
                                console.log('🔄 [SETTINGS API - GET] Retrying request with new token...');
                                response = await fetch(`${API_BASE_URL}settings/`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${newAccessToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                });
                            }
                        } else {
                            // Refresh failed, return 401 error
                            const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
                            return {
                                error: {
                                    status: 401,
                                    data: error,
                                } as FetchBaseQueryError,
                            };
                        }
                    }

                    if (!response.ok) {
                        const error = await response.json().catch(() => ({ message: 'Failed to fetch settings' }));
                        console.error('❌ [SETTINGS API - GET] Error:', error);
                        return {
                            error: {
                                status: response.status,
                                data: error,
                            } as FetchBaseQueryError,
                        };
                    }

                    const data: SystemSettings = await response.json();
                    console.log('✅ [SETTINGS API - GET] Success:', data);

                    return { data };
                } catch (error) {
                    console.error('❌ [SETTINGS API - GET] Fetch error:', error);
                    return {
                        error: {
                            status: 'FETCH_ERROR' as const,
                            error: String(error),
                        } as FetchBaseQueryError,
                    };
                }
            },
            providesTags: ['Settings'],
        }),

        // PATCH settings/ - Update system settings (admin only)
        updateSettings: builder.mutation<SystemSettings, SystemSettingsUpdate>({
            queryFn: async (body) => {
                const { accessToken } = getAuthTokens();

                if (!accessToken) {
                    return {
                        error: {
                            status: 401,
                            data: { message: 'No access token found' },
                        } as FetchBaseQueryError,
                    };
                }

                try {
                    console.log('📤 [SETTINGS API - PATCH] Updating system settings...');
                    console.log('📤 [SETTINGS API - PATCH] Request body:', body);

                    let response = await fetch(`${API_BASE_URL}settings/`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    });

                    // Handle 401 Unauthorized - try to refresh token
                    if (response.status === 401) {
                        console.log('🟡 [SETTINGS API - PATCH] Access token expired, attempting to refresh...');
                        const refreshData = await refreshAccessToken();

                        if (refreshData) {
                            // Retry the request with new token
                            const { accessToken: newAccessToken } = getAuthTokens();
                            if (newAccessToken) {
                                console.log('🔄 [SETTINGS API - PATCH] Retrying request with new token...');
                                response = await fetch(`${API_BASE_URL}settings/`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${newAccessToken}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(body),
                                });
                            }
                        } else {
                            // Refresh failed, return 401 error
                            const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
                            return {
                                error: {
                                    status: 401,
                                    data: error,
                                } as FetchBaseQueryError,
                            };
                        }
                    }

                    if (!response.ok) {
                        const error = await response.json().catch(() => ({ message: 'Failed to update settings' }));
                        console.error('❌ [SETTINGS API - PATCH] Error:', error);
                        return {
                            error: {
                                status: response.status,
                                data: error,
                            } as FetchBaseQueryError,
                        };
                    }

                    const data: SystemSettings = await response.json();
                    console.log('✅ [SETTINGS API - PATCH] Success:', data);

                    return { data };
                } catch (error) {
                    console.error('❌ [SETTINGS API - PATCH] Fetch error:', error);
                    return {
                        error: {
                            status: 'FETCH_ERROR' as const,
                            error: String(error),
                        } as FetchBaseQueryError,
                    };
                }
            },
            invalidatesTags: ['Settings'],
        }),
    }),
});

export const {
    useGetSettingsQuery,
    useUpdateSettingsMutation,
} = settingsApi;
