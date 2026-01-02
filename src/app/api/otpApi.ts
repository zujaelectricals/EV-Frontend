import { api } from './baseApi';

export interface SendOTPRequest {
  mobileNumber: string;
}

export interface VerifyOTPRequest {
  mobileNumber: string;
  otp: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Only for mock, in production this won't be returned
}

// Mock OTP storage (in real app, this would be in backend/database)
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

export const otpApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendOTP: builder.mutation<OTPResponse, SendOTPRequest>({
      queryFn: async ({ mobileNumber }) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with 5 minute expiration
        otpStore[mobileNumber] = {
          otp,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        };
        
        // In production, send OTP via SMS service
        console.log(`[MOCK] OTP sent to ${mobileNumber}: ${otp}`);
        
        return {
          data: {
            success: true,
            message: 'OTP sent successfully',
            otp, // Only for development/mock
          },
        };
      },
    }),

    verifyOTP: builder.mutation<OTPResponse, VerifyOTPRequest>({
      queryFn: async ({ mobileNumber, otp }) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const stored = otpStore[mobileNumber];
        
        if (!stored) {
          return {
            error: {
              status: 400,
              data: { success: false, message: 'OTP not found. Please request a new OTP.' },
            },
          };
        }
        
        if (Date.now() > stored.expiresAt) {
          delete otpStore[mobileNumber];
          return {
            error: {
              status: 400,
              data: { success: false, message: 'OTP has expired. Please request a new OTP.' },
            },
          };
        }
        
        if (stored.otp !== otp) {
          return {
            error: {
              status: 400,
              data: { success: false, message: 'Invalid OTP. Please try again.' },
            },
          };
        }
        
        // OTP verified successfully, remove it
        delete otpStore[mobileNumber];
        
        return {
          data: {
            success: true,
            message: 'OTP verified successfully',
          },
        };
      },
    }),
  }),
});

export const { useSendOTPMutation, useVerifyOTPMutation } = otpApi;

