import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useCreateBookingMutation, useMakePaymentMutation, BookingResponse } from '@/app/api/bookingApi';
import { useAddReferralNodeMutation } from '@/app/api/binaryApi';
import { addBooking, updateBooking } from '@/app/slices/bookingSlice';
import { updatePreBooking } from '@/app/slices/authSlice';
import { addPayout } from '@/app/slices/payoutSlice';
import { toast } from 'sonner';
import { useRazorpay } from '@/hooks/useRazorpay';
import { payForEntity } from '@/services/paymentService';
import { api } from '@/app/api/baseApi';

interface BookingRequestData {
  vehicle_model_code: string;
  vehicle_color: string;
  battery_variant: string;
  booking_amount: number;
  total_amount: number;
  delivery_city: string;
  delivery_state: string;
  delivery_pin: string;
  terms_accepted: boolean;
  referral_code: string;
  join_distributor_program?: boolean;
  scooter: {
    id: string;
    name: string;
    price: number;
  };
  redemptionPoints: number;
  remainingAmount: number;
  paymentDueDate: string;
  isDistributorEligible: boolean;
  joinDistributorProgram: boolean;
  isAlreadyDistributor: boolean;
}

interface AdditionalPaymentData {
  type: 'additional_payment';
  bookingId: string | number;
  amount: number;
  vehicleName: string;
}

const MIN_PRE_BOOKING = 500;
const DISTRIBUTOR_ELIGIBILITY_AMOUNT = 5000;
const TDS_RATE = 0.1;
const REFERRAL_BONUS = 1000;

export function PaymentProcessingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [createBooking] = useCreateBookingMutation();
  const [makePayment] = useMakePaymentMutation();
  const [addReferralNode] = useAddReferralNodeMutation();
  const openRazorpayCheckout = useRazorpay();

  const [bookingData, setBookingData] = useState<BookingRequestData | null>(null);
  const [additionalPaymentData, setAdditionalPaymentData] = useState<AdditionalPaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting to secure payment gateway...');
  const hasStartedProcessing = useRef(false);

  // Get payment data from location state (can be either new booking or additional payment)
  useEffect(() => {
    const state = location.state as { 
      bookingData?: BookingRequestData;
      additionalPaymentData?: AdditionalPaymentData;
    };
    
    if (state?.bookingData) {
      setBookingData(state.bookingData);
    } else if (state?.additionalPaymentData) {
      setAdditionalPaymentData(state.additionalPaymentData);
    } else {
      // If no data, redirect back
      toast.error('Invalid payment data. Please try again.');
      navigate('/profile?tab=orders', { replace: true });
    }
  }, [location, navigate]);

  // Process payment when component mounts and data is available
  useEffect(() => {
    if ((bookingData || additionalPaymentData) && !isProcessing && !hasStartedProcessing.current) {
      hasStartedProcessing.current = true;
      if (additionalPaymentData) {
        handleAdditionalPaymentProcess();
      } else if (bookingData) {
        handleBookingProcess();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData, additionalPaymentData]);

  const handleBookingProcess = async () => {
    if (!bookingData) return;

    setIsProcessing(true);
    setStatusMessage('Creating your booking...');

    try {
      // Prepare booking request
      const bookingRequest = {
        vehicle_model_code: bookingData.vehicle_model_code,
        vehicle_color: bookingData.vehicle_color,
        battery_variant: bookingData.battery_variant,
        booking_amount: bookingData.booking_amount,
        total_amount: bookingData.total_amount,
        delivery_city: bookingData.delivery_city,
        delivery_state: bookingData.delivery_state,
        delivery_pin: bookingData.delivery_pin,
        terms_accepted: bookingData.terms_accepted,
        referral_code: bookingData.referral_code,
        join_distributor_program: bookingData.join_distributor_program || undefined,
      };

      console.log('🟢 [PAYMENT-PROCESSING] Creating booking...', {
        timestamp: new Date().toISOString(),
      });

      // Call booking API
      const response = await createBooking(bookingRequest).unwrap();
      console.log('🟢 [PAYMENT-PROCESSING] Booking created successfully:', response);

      setStatusMessage('Opening payment gateway...');
      
      // Trigger Razorpay payment flow
      await handleRazorpayPayment(response);
    } catch (error: unknown) {
      console.error('🔴 [PAYMENT-PROCESSING] Booking API Error:', error);
      
      let errorMessage = 'Failed to create booking. Please try again.';
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as Record<string, unknown>;
        if (errorData?.detail && typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (errorData?.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        }
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
      
      // Navigate back after error
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  };

  const handleAdditionalPaymentProcess = async () => {
    if (!additionalPaymentData) return;

    setIsProcessing(true);
    setStatusMessage('Opening payment gateway...');

    try {
      // Get user info for prefill
      const userPrefill = user ? {
        name: user.name || undefined,
        email: user.email || undefined,
        contact: user.phone || undefined,
      } : undefined;

      // Trigger Razorpay payment flow directly for additional payment
      const paymentResult = await payForEntity(
        'booking',
        typeof additionalPaymentData.bookingId === 'string' 
          ? parseInt(additionalPaymentData.bookingId, 10) 
          : additionalPaymentData.bookingId,
        openRazorpayCheckout,
        {
          name: 'EV Nexus',
          description: `Additional payment for ${additionalPaymentData.vehicleName}`,
          amount: additionalPaymentData.amount,
          prefill: userPrefill,
          onClose: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled. You can try again later.');
            navigate('/profile?tab=orders', { replace: true });
          },
          onDismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled. You can try again later.');
            navigate('/profile?tab=orders', { replace: true });
          },
        }
      );

      // Payment verified successfully
      if (paymentResult.success) {
        setStatusMessage('Payment verified successfully!');
        
        // Invalidate booking cache to force refresh of My Orders section
        const bookingId = typeof additionalPaymentData.bookingId === 'string' 
          ? parseInt(additionalPaymentData.bookingId, 10) 
          : additionalPaymentData.bookingId;
        
        dispatch(
          api.util.invalidateTags([
            { type: 'Booking', id: 'LIST' },
            { type: 'Booking', id: 'LIST-all' },
            { type: 'Booking', id: 'LIST-pending' },
            { type: 'Booking', id: 'LIST-active' },
            { type: 'Booking', id: bookingId }, // Invalidate specific booking
          ])
        );
        
        console.log('✅ [PAYMENT-PROCESSING] Invalidated booking cache for refresh');
        
        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Navigate to profile page with orders tab and payment completed flag
        navigate('/profile?tab=orders', { 
          replace: true,
          state: { paymentCompleted: true }
        });
        
        // Show success toast after navigation
        setTimeout(() => {
          // Check if payment was already verified by webhook
          const normalizedMessage = paymentResult.message?.toLowerCase().trim() || '';
          const hasAlready = normalizedMessage.includes('already');
          const hasSuccess = normalizedMessage.includes('success') || normalizedMessage.includes('succeed');
          const hasWebhook = normalizedMessage.includes('webhook');
          const hasProcessed = normalizedMessage.includes('processed');
          
          const isWebhookVerified = normalizedMessage && (
            (hasAlready && (hasSuccess || hasWebhook || hasProcessed)) ||
            normalizedMessage.includes('already verified') ||
            normalizedMessage.includes('payment already') ||
            normalizedMessage.includes('already verified by')
          );
          
          const successMessage = isWebhookVerified 
            ? 'Payment Verified Successfully' 
            : (paymentResult.message || 'Payment Verified Successfully');
          
          toast.success(successMessage, {
            duration: 4000,
          });
        }, 600);
      } else {
        throw new Error(paymentResult.message || 'Payment verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('closed') && !errorMessage.includes('dismissed')) {
        toast.error(errorMessage);
      }
      
      setIsProcessing(false);
      
      // Navigate back after error
      setTimeout(() => {
        navigate('/profile?tab=orders', { replace: true });
      }, 2000);
    }
  };

  const handleRazorpayPayment = async (booking: BookingResponse) => {
    if (!booking || !bookingData) {
      toast.error('Booking details not available. Please refresh the page.');
      return;
    }

    setStatusMessage('Processing your payment...');

    try {
      // Get user info for prefill
      const userPrefill = user ? {
        name: user.name || undefined,
        email: user.email || undefined,
        contact: user.phone || undefined,
      } : undefined;

      // Trigger Razorpay payment flow
      const paymentResult = await payForEntity(
        'booking',
        booking.id,
        openRazorpayCheckout,
        {
          name: 'EV Nexus',
          description: `Pre-booking payment for ${bookingData.scooter.name}`,
          prefill: userPrefill,
          onClose: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled. You can complete payment later.');
            dispatch(api.util.invalidateTags(['Inventory']));
            navigate(-1);
          },
          onDismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled. You can complete payment later.');
            dispatch(api.util.invalidateTags(['Inventory']));
            navigate(-1);
          },
        }
      );

      // Payment verified successfully
      if (paymentResult.success) {
        setStatusMessage('Verifying your payment...');
        
        // Call make payment API
        const paymentResponse = await makePayment({
          bookingId: booking.id,
          paymentData: {
            amount: bookingData.booking_amount,
            payment_method: 'online',
          },
        }).unwrap();

        const updatedBooking = paymentResponse || booking;

        // Calculate referral bonus if ASA code is provided
        let referralBonus = 0;
        let tdsDeducted = 0;
        if (bookingData.referral_code && bookingData.referral_code.trim()) {
          referralBonus = REFERRAL_BONUS;
          tdsDeducted = referralBonus * TDS_RATE;
          const netBonus = referralBonus - tdsDeducted;

          dispatch(addPayout({
            id: `payout-${Date.now()}`,
            amount: netBonus,
            type: 'referral',
            status: 'pending',
            description: `Referral bonus for ${bookingData.scooter.name} pre-booking`,
            tds: tdsDeducted,
            netAmount: netBonus,
            requestedAt: new Date().toISOString(),
          }));
        }

        // Create local booking object
        const localBooking = {
          id: updatedBooking.id.toString(),
          vehicleId: bookingData.scooter.id,
          vehicleName: bookingData.scooter.name,
          status: 'pre-booked' as const,
          preBookingAmount: parseFloat(updatedBooking.booking_amount),
          totalAmount: parseFloat(updatedBooking.total_amount),
          remainingAmount: parseFloat(updatedBooking.remaining_amount),
          totalPaid: parseFloat(updatedBooking.total_paid),
          paymentMethod: 'full' as const,
          emiPlan: undefined,
          paymentDueDate: updatedBooking.expires_at as string,
          paymentStatus: 'partial' as const,
          isActiveBuyer: true,
          redemptionPoints: bookingData.redemptionPoints,
          redemptionEligible: false,
          bookedAt: updatedBooking.created_at as string,
          referredBy: updatedBooking.referred_by && typeof updatedBooking.referred_by === 'object' 
            ? String(updatedBooking.referred_by.id) 
            : undefined,
          referralBonus: referralBonus > 0 ? referralBonus : undefined,
          tdsDeducted: referralBonus > 0 ? tdsDeducted : undefined,
          addedToTeamNetwork: false,
        };

        // Add user to distributor's binary tree if eligible
        if (user && bookingData.booking_amount >= DISTRIBUTOR_ELIGIBILITY_AMOUNT && bookingData.referral_code && bookingData.referral_code.trim()) {
          try {
            let distributorId: string | null = null;
            
            const authDataStr = localStorage.getItem('ev_nexus_auth_data');
            if (authDataStr) {
              try {
                const authData = JSON.parse(authDataStr);
                if (authData.user?.distributorInfo?.referralCode === bookingData.referral_code.trim() &&
                    authData.user?.distributorInfo?.isDistributor === true &&
                    authData.user?.distributorInfo?.isVerified === true) {
                  distributorId = authData.user.id;
                }
              } catch (e) {
                console.error('Error parsing auth data:', e);
              }
            }
            
            if (distributorId) {
              await addReferralNode({
                distributorId: distributorId,
                userId: user.id,
                userName: user.name,
                pv: bookingData.booking_amount,
                referralCode: bookingData.referral_code.trim(),
              }).unwrap();
              
              localBooking.addedToTeamNetwork = true;
            }
          } catch (error) {
            console.error('Error adding user to binary tree:', error);
          }
        }

        dispatch(addBooking(localBooking));

        // Store ASA code in localStorage
        if (bookingData.referral_code.trim() && typeof window !== 'undefined') {
          localStorage.setItem('ev_nexus_referral_code', bookingData.referral_code.trim());
        }
        
        // Store delivery address in localStorage
        if (typeof window !== 'undefined') {
          if (bookingData.delivery_city.trim()) {
            localStorage.setItem('ev_nexus_delivery_city', bookingData.delivery_city.trim());
          }
          if (bookingData.delivery_state.trim()) {
            localStorage.setItem('ev_nexus_delivery_state', bookingData.delivery_state.trim());
          }
          if (bookingData.delivery_pin.trim()) {
            localStorage.setItem('ev_nexus_delivery_pincode', bookingData.delivery_pin.trim());
          }
        }

        // Update user pre-booking info
        dispatch(updatePreBooking({
          hasPreBooked: true,
          preBookingAmount: bookingData.booking_amount,
          totalPaid: bookingData.booking_amount,
          preBookingDate: new Date().toISOString(),
          vehicleId: bookingData.scooter.id,
          vehicleName: bookingData.scooter.name,
          isActiveBuyer: true,
          remainingAmount: bookingData.remainingAmount,
          paymentDueDate: bookingData.paymentDueDate,
          paymentStatus: 'partial',
          redemptionPoints: bookingData.redemptionPoints,
          redemptionEligible: false,
          isDistributorEligible: bookingData.isAlreadyDistributor ? true : bookingData.isDistributorEligible,
          wantsToJoinDistributor: bookingData.isAlreadyDistributor ? false : bookingData.joinDistributorProgram,
        }));

        // Invalidate inventory cache
        dispatch(api.util.invalidateTags(['Inventory']));

        setStatusMessage('Payment verified successfully!');
        
        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Navigate to profile page with orders tab
        navigate('/profile?tab=orders', { replace: true });
        
        // Show success toast after navigation
        setTimeout(() => {
          toast.success('Payment Verified Successfully', {
            duration: 4000,
          });
        }, 600);
      } else {
        throw new Error(paymentResult.message || 'Payment verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('closed') && !errorMessage.includes('dismissed')) {
        toast.error(errorMessage);
      }
      
      setIsProcessing(false);
      dispatch(api.util.invalidateTags(['Inventory']));
      
      // Navigate back after error
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-6">
          {/* Security Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shield className="w-10 h-10 text-pink-600 dark:text-pink-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-2xl font-bold text-foreground"
          >
            Processing Your Payment
          </motion.h2>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-2 text-muted-foreground"
          >
            <p className="text-sm">Please do not refresh or press back</p>
            <p className="text-sm">This may take up to 20 seconds</p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto"
          >
            <motion.div
              animate={{ width: ['0%', '66%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"
            />
          </motion.div>

          {/* Status Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Shield className="w-4 h-4" />
            <span>{statusMessage}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

