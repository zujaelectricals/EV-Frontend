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

export interface RazorpayOptions {
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
   * Helper function to disable pointer-events on Dialog overlays and content
   * This allows Razorpay modal to be interactive even when a Dialog is open
   */
  const disableDialogOverlays = () => {
    if (typeof document === 'undefined') return;
    
    // Find all Dialog overlays (Radix UI Dialog uses data-radix-dialog-overlay)
    const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
    overlays.forEach((overlay) => {
      const element = overlay as HTMLElement;
      // Store original pointer-events value to restore later
      if (!element.dataset.originalPointerEvents) {
        element.dataset.originalPointerEvents = element.style.pointerEvents || '';
      }
      element.style.pointerEvents = 'none';
    });

    // Also disable pointer-events on Dialog content elements
    // Radix UI Dialog content uses data-radix-dialog-content
    const dialogContents = document.querySelectorAll('[data-radix-dialog-content]');
    dialogContents.forEach((content) => {
      const element = content as HTMLElement;
      // Store original pointer-events value to restore later
      if (!element.dataset.originalPointerEvents) {
        element.dataset.originalPointerEvents = element.style.pointerEvents || '';
      }
      element.style.pointerEvents = 'none';
    });

    // Also check for any elements with high z-index that might be blocking
    // Look for fixed positioned elements with z-index >= 50 (Dialog z-index)
    const allFixedElements = Array.from(document.querySelectorAll('*')).filter((el) => {
      const style = window.getComputedStyle(el);
      const position = style.position;
      const zIndex = parseInt(style.zIndex, 10);
      return position === 'fixed' && zIndex >= 50 && zIndex < 1000; // Dialog range, not Razorpay
    });

    allFixedElements.forEach((element) => {
      const el = element as HTMLElement;
      // Only disable if it's not Razorpay related
      if (!el.closest('[class*="razorpay"]') && !el.querySelector('[class*="razorpay"]')) {
        if (!el.dataset.originalPointerEvents) {
          el.dataset.originalPointerEvents = el.style.pointerEvents || '';
        }
        el.style.pointerEvents = 'none';
      }
    });
  };

  /**
   * Helper function to restore pointer-events on Dialog overlays and content
   * Also restores ALL elements that have the originalPointerEvents dataset
   */
  const restoreDialogOverlays = () => {
    if (typeof document === 'undefined') return;
    
    // Restore Dialog overlays
    const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
    overlays.forEach((overlay) => {
      const element = overlay as HTMLElement;
      const originalValue = element.dataset.originalPointerEvents || '';
      element.style.pointerEvents = originalValue;
      delete element.dataset.originalPointerEvents;
    });

    // Restore Dialog content
    const dialogContents = document.querySelectorAll('[data-radix-dialog-content]');
    dialogContents.forEach((content) => {
      const element = content as HTMLElement;
      const originalValue = element.dataset.originalPointerEvents || '';
      element.style.pointerEvents = originalValue;
      delete element.dataset.originalPointerEvents;
    });

    // Restore ALL elements that have the originalPointerEvents dataset
    // This is more comprehensive and will catch navbar and other elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
      const el = element as HTMLElement;
      if (el.dataset.originalPointerEvents !== undefined) {
        const originalValue = el.dataset.originalPointerEvents || '';
        el.style.pointerEvents = originalValue;
        delete el.dataset.originalPointerEvents;
      }
    });
  };

  /**
   * Monitor Razorpay modal and restore pointer-events when it closes
   * This is a fallback in case callbacks don't fire
   * Also continuously disables Dialog overlays while Razorpay is open
   */
  const setupRazorpayModalMonitor = () => {
    if (typeof document === 'undefined') return () => {};

    let checkInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let keepDisabledInterval: NodeJS.Timeout | null = null;

    // Check if Razorpay modal is still open
    const checkRazorpayModal = () => {
      // Razorpay modal typically has class 'razorpay-checkout-frame' or similar
      // Also check for Razorpay's modal container and iframe
      const razorpayModal = document.querySelector(
        '.razorpay-checkout-frame, ' +
        'iframe[src*="razorpay"], ' +
        '[class*="razorpay"], ' +
        '#razorpay-checkout-iframe'
      );
      
      // Also check for high z-index divs that might contain Razorpay iframe
      const highZIndexDivs = Array.from(document.querySelectorAll('body > div')).filter((div) => {
        const style = window.getComputedStyle(div);
        const zIndex = parseInt(style.zIndex, 10);
        return zIndex > 1000 && div.querySelector('iframe[src*="razorpay"]');
      });
      
      if (razorpayModal || highZIndexDivs.length > 0) {
        // Razorpay is still open, keep Dialog overlays disabled
        disableDialogOverlays();
      } else {
        // Modal is closed, restore pointer-events
        restoreDialogOverlays();
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        if (keepDisabledInterval) {
          clearInterval(keepDisabledInterval);
          keepDisabledInterval = null;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    };

    // Start monitoring for Razorpay modal
    checkInterval = setInterval(checkRazorpayModal, 200);

    // Continuously disable Dialog overlays while Razorpay is open
    // This ensures any new Dialog elements that appear are also disabled
    keepDisabledInterval = setInterval(() => {
      const razorpayModal = document.querySelector(
        '.razorpay-checkout-frame, ' +
        'iframe[src*="razorpay"], ' +
        '[class*="razorpay"], ' +
        '#razorpay-checkout-iframe'
      );
      
      if (razorpayModal) {
        disableDialogOverlays();
      }
    }, 300);

    // Fallback: restore after 5 minutes (safety timeout)
    timeoutId = setTimeout(() => {
      restoreDialogOverlays();
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (keepDisabledInterval) {
        clearInterval(keepDisabledInterval);
      }
    }, 5 * 60 * 1000);

    // Return cleanup function
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (keepDisabledInterval) {
        clearInterval(keepDisabledInterval);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  };

  /**
   * Opens Razorpay checkout modal
   * @param options Razorpay checkout options
   */
  const openRazorpayCheckout = useCallback((options: RazorpayOptions) => {
    // Ensure we're on client side
    if (typeof window === 'undefined') {
      throw new Error('Razorpay can only be used on the client side');
    }

    // Setup monitoring to restore pointer-events when Razorpay modal closes
    const cleanupMonitor = setupRazorpayModalMonitor();

    // Disable pointer-events on Dialog overlays before opening Razorpay
    // Use a small delay to ensure Razorpay modal is fully rendered
    const disableOverlays = () => {
      disableDialogOverlays();
      // Also disable after a short delay to catch any late-rendering elements
      setTimeout(() => {
        disableDialogOverlays();
      }, 100);
    };
    
    disableOverlays();

    // Wrap the original modal callbacks to restore pointer-events when Razorpay closes
    const originalOnClose = options.modal?.onClose;
    const originalOnDismiss = options.modal?.ondismiss;

    const wrappedOptions: RazorpayOptions = {
      ...options,
      modal: {
        ...options.modal,
        onClose: () => {
          cleanupMonitor();
          restoreDialogOverlays();
          if (originalOnClose) {
            originalOnClose();
          }
        },
        ondismiss: () => {
          cleanupMonitor();
          restoreDialogOverlays();
          if (originalOnDismiss) {
            originalOnDismiss();
          }
        },
      },
    };

    // Also restore on payment success (handler callback)
    const originalHandler = options.handler;
    wrappedOptions.handler = async (response) => {
      // Restore pointer-events after a delay to ensure Razorpay modal is fully closed
      // Use multiple timeouts to ensure restoration happens even if Razorpay closes slowly
      setTimeout(() => {
        cleanupMonitor();
        restoreDialogOverlays();
      }, 200);
      
      // Additional restoration after longer delay as fallback
      setTimeout(() => {
        restoreDialogOverlays();
      }, 500);
      
      // Final restoration after handler completes
      if (originalHandler) {
        try {
          await originalHandler(response);
        } finally {
          // Ensure restoration happens even if handler throws an error
          setTimeout(() => {
            cleanupMonitor();
            restoreDialogOverlays();
          }, 100);
        }
      } else {
        // If no handler, restore immediately after delay
        setTimeout(() => {
          cleanupMonitor();
          restoreDialogOverlays();
        }, 300);
      }
    };

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
              const razorpay = new window.Razorpay(wrappedOptions);
              razorpay.open();
              // Disable overlays again after Razorpay opens to catch any late-rendering dialogs
              setTimeout(() => {
                disableDialogOverlays();
              }, 200);
              resolve();
            } catch (error) {
              cleanupMonitor();
              restoreDialogOverlays();
              reject(error);
            }
          } else if (Date.now() - startTime > maxWaitTime) {
            clearInterval(checkScript);
            cleanupMonitor();
            restoreDialogOverlays();
            reject(new Error('Razorpay script failed to load within timeout'));
          }
        }, 100);
      });
    }

    // If script is already loaded, use it immediately
    if (window.Razorpay) {
      try {
        const razorpay = new window.Razorpay(wrappedOptions);
        razorpay.open();
        // Disable overlays again after Razorpay opens to catch any late-rendering dialogs
        setTimeout(() => {
          disableDialogOverlays();
        }, 200);
        return Promise.resolve();
      } catch (error) {
        cleanupMonitor();
        restoreDialogOverlays();
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
            const razorpay = new window.Razorpay(wrappedOptions);
            razorpay.open();
            // Disable overlays again after Razorpay opens to catch any late-rendering dialogs
            setTimeout(() => {
              disableDialogOverlays();
            }, 200);
            resolve();
          } catch (error) {
            cleanupMonitor();
            restoreDialogOverlays();
            reject(error);
          }
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkScript);
        cleanupMonitor();
        restoreDialogOverlays();
        reject(new Error('Razorpay script failed to load within timeout'));
      }, 10000);
    });
  }, []);

  return openRazorpayCheckout;
};

