import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRazorpay } from '@/hooks/useRazorpay';
import { payForEntity, VerifyPaymentResponse } from '@/services/paymentService';
import { useAppSelector } from '@/app/hooks';

interface PayButtonProps {
  entityType: 'booking' | 'prebooking' | string;
  entityId: string | number;
  amount: number;
  onSuccess?: (paymentData: VerifyPaymentResponse) => void;
  onFailure?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

/**
 * Reusable payment button component that integrates with Razorpay
 * Handles the complete payment flow: create order, open Razorpay, verify payment
 */
export function PayButton({
  entityType,
  entityId,
  amount,
  onSuccess,
  onFailure,
  disabled: externalDisabled,
  className,
  children,
  name,
  description,
  prefill,
}: PayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const openRazorpayCheckout = useRazorpay();
  const { user } = useAppSelector((state) => state.auth);

  // Get user info for prefill if not provided
  const getUserPrefill = () => {
    if (prefill) return prefill;
    
    if (user) {
      return {
        name: user.name || undefined,
        email: user.email || undefined,
        contact: user.phone || undefined,
      };
    }
    
    return undefined;
  };

  const handlePayment = async () => {
    // Prevent double-click
    if (isProcessing || isProcessingRef.current || externalDisabled) {
      return;
    }

    // Validate amount
    if (!amount || amount <= 0) {
      toast.error('Invalid payment amount');
      if (onFailure) {
        onFailure(new Error('Invalid payment amount'));
      }
      return;
    }

    // Set processing state
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      // Initiate payment flow
      const paymentResult = await payForEntity(
        entityType,
        entityId,
        openRazorpayCheckout,
        {
          name: name || 'EV Nexus',
          description: description || `Payment for ${entityType}`,
          prefill: getUserPrefill(),
          onClose: () => {
            // User closed the modal - don't show error, just reset state
            isProcessingRef.current = false;
            setIsProcessing(false);
          },
          onDismiss: () => {
            // User dismissed the modal - don't show error, just reset state
            isProcessingRef.current = false;
            setIsProcessing(false);
          },
        }
      );

      // Payment verified successfully
      if (paymentResult.success) {
        // Use API message if available (e.g., "payment already success" from webhook)
        // Otherwise use default success message
        const successMessage = paymentResult.message && (
          paymentResult.message.toLowerCase().includes('already verified') ||
          paymentResult.message.toLowerCase().includes('already success') ||
          paymentResult.message.toLowerCase().includes('payment already success') ||
          paymentResult.message.toLowerCase().includes('webhook') ||
          paymentResult.message.toLowerCase().includes('already processed')
        ) ? paymentResult.message : (paymentResult.message || 'Payment Verified Successfully');
        
        toast.success(successMessage);
        if (onSuccess) {
          onSuccess(paymentResult);
        }
      } else {
        throw new Error(paymentResult.message || 'Payment verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      
      // Only show error toast if it's not a user cancellation
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('closed')) {
        toast.error(errorMessage);
      }

      if (onFailure) {
        onFailure(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const isDisabled = externalDisabled || isProcessing;

  return (
    <Button
      onClick={handlePayment}
      disabled={isDisabled}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Pay ₹${amount.toLocaleString('en-IN')}`
      )}
    </Button>
  );
}

