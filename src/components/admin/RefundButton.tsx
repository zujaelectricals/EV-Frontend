import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createRefund, RefundResponse } from '@/services/paymentService';
import { useAppSelector } from '@/app/hooks';

interface RefundButtonProps {
  paymentId: string;
  amount?: number;
  onSuccess?: (refundData: RefundResponse) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showRoleCheck?: boolean;
}

/**
 * Admin/Staff only component to trigger refunds
 * Automatically checks user role before rendering/executing
 */
export function RefundButton({
  paymentId,
  amount,
  onSuccess,
  onError,
  disabled: externalDisabled,
  className,
  children,
  variant = 'destructive',
  size = 'default',
  showRoleCheck = true,
}: RefundButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const { user } = useAppSelector((state) => state.auth);

  // Role check
  const isAuthorized = user?.role === 'admin' || user?.role === 'staff';

  // Don't render if role check fails and showRoleCheck is true
  if (showRoleCheck && !isAuthorized) {
    return null;
  }

  const handleRefund = async () => {
    // Prevent double-click
    if (isProcessing || isProcessingRef.current || externalDisabled) {
      return;
    }

    // Additional role check before execution
    if (!isAuthorized) {
      toast.error('Insufficient permissions. Admin or staff access required.');
      if (onError) {
        onError(new Error('Insufficient permissions'));
      }
      return;
    }

    // Validate payment ID
    if (!paymentId) {
      toast.error('Payment ID is required');
      if (onError) {
        onError(new Error('Payment ID is required'));
      }
      return;
    }

    // Confirm refund action
    const confirmMessage = amount
      ? `Are you sure you want to refund ₹${amount.toLocaleString('en-IN')}?`
      : 'Are you sure you want to process a full refund?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Set processing state
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const refundResult = await createRefund(paymentId, amount);

      if (refundResult.success) {
        const successMessage = amount
          ? `Refund of ₹${amount.toLocaleString('en-IN')} processed successfully`
          : 'Full refund processed successfully';
        
        toast.success(successMessage);
        
        if (onSuccess) {
          onSuccess(refundResult);
        }
      } else {
        throw new Error(refundResult.message || 'Refund failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process refund. Please try again.';
      toast.error(errorMessage);

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const isDisabled = externalDisabled || isProcessing || !isAuthorized;

  return (
    <Button
      onClick={handleRefund}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={className}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children || (amount ? `Refund ₹${amount.toLocaleString('en-IN')}` : 'Refund')
      )}
    </Button>
  );
}

