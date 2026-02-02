import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPayout, PayoutResponse } from '@/services/paymentService';
import { useAppSelector } from '@/app/hooks';

interface PayoutButtonProps {
  payoutId: string;
  onSuccess?: (payoutData: PayoutResponse) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showRoleCheck?: boolean;
}

/**
 * Admin/Staff only component to trigger payouts
 * Automatically checks user role before rendering/executing
 */
export function PayoutButton({
  payoutId,
  onSuccess,
  onError,
  disabled: externalDisabled,
  className,
  children,
  variant = 'default',
  size = 'default',
  showRoleCheck = true,
}: PayoutButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const { user } = useAppSelector((state) => state.auth);

  // Role check
  const isAuthorized = user?.role === 'admin' || user?.role === 'staff';

  // Don't render if role check fails and showRoleCheck is true
  if (showRoleCheck && !isAuthorized) {
    return null;
  }

  const handlePayout = async () => {
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

    // Validate payout ID
    if (!payoutId) {
      toast.error('Payout ID is required');
      if (onError) {
        onError(new Error('Payout ID is required'));
      }
      return;
    }

    // Confirm payout action
    if (!window.confirm('Are you sure you want to process this payout?')) {
      return;
    }

    // Set processing state
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const payoutResult = await createPayout(payoutId);

      if (payoutResult.success) {
        toast.success('Payout processed successfully');
        
        if (onSuccess) {
          onSuccess(payoutResult);
        }
      } else {
        throw new Error(payoutResult.message || 'Payout failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payout. Please try again.';
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
      onClick={handlePayout}
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
        children || 'Process Payout'
      )}
    </Button>
  );
}

