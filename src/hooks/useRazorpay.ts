import { useEffect, useRef, useCallback } from 'react';

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: () => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    onClose?: () => void;
  };
  [key: string]: unknown;
}

/**
 * Custom hook to dynamically load Razorpay checkout script and provide
 * a function to open Razorpay checkout modal
 * 
 * @returns Function to open Razorpay checkout
 */
export const useRazorpay = () => {
  const scriptLoadedRef = useRef(false);
  const scriptLoadingRef = useRef(false);

  useEffect(() => {
    // Only load on client side
    if (typeof window === 'undefined') return;

    // If script is already loaded or loading, skip
    if (scriptLoadedRef.current || scriptLoadingRef.current) return;

    // Check if Razorpay is already available
    if (window.Razorpay) {
      scriptLoadedRef.current = true;
      return;
    }

    scriptLoadingRef.current = true;

    // Create and append script tag
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      scriptLoadedRef.current = true;
      scriptLoadingRef.current = false;
      console.log('✅ Razorpay script loaded successfully');
    };

    script.onerror = () => {
      scriptLoadingRef.current = false;
      console.error('❌ Failed to load Razorpay script');
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove script on unmount as it might be used by other components
      // The script will remain in the DOM for reuse
    };
  }, []);

  /**
   * Opens Razorpay checkout modal
   * @param options Razorpay checkout options
   */
  const openRazorpayCheckout = useCallback((options: RazorpayOptions) => {
    // Ensure we're on client side
    if (typeof window === 'undefined') {
      throw new Error('Razorpay can only be used on the client side');
    }

    // Wait for script to load if it's still loading
    if (scriptLoadingRef.current) {
      // Poll until script is loaded (max 10 seconds)
      const maxWaitTime = 10000;
      const startTime = Date.now();
      
      return new Promise<void>((resolve, reject) => {
        const checkScript = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(checkScript);
            scriptLoadedRef.current = true;
            scriptLoadingRef.current = false;
            try {
              const razorpay = new window.Razorpay(options);
              razorpay.open();
              resolve();
            } catch (error) {
              reject(error);
            }
          } else if (Date.now() - startTime > maxWaitTime) {
            clearInterval(checkScript);
            reject(new Error('Razorpay script failed to load within timeout'));
          }
        }, 100);
      });
    }

    // If script is already loaded, use it immediately
    if (window.Razorpay) {
      try {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }

    // If script hasn't loaded yet, wait for it
    return new Promise<void>((resolve, reject) => {
      const checkScript = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkScript);
          scriptLoadedRef.current = true;
          try {
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkScript);
        reject(new Error('Razorpay script failed to load within timeout'));
      }, 10000);
    });
  }, []);

  return openRazorpayCheckout;
};

