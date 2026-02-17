import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle, Info, Calendar, Wallet, Eye, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addBooking, updateBooking } from '@/app/slices/bookingSlice';
import { updatePreBooking } from '@/app/slices/authSlice';
import { addPayout } from '@/app/slices/payoutSlice';
import { useAddReferralNodeMutation } from '@/app/api/binaryApi';
import { useCreateBookingMutation, useMakePaymentMutation, BookingResponse } from '@/app/api/bookingApi';
import { useGetDistributorDocumentsQuery, useAcceptDocumentMutation, useVerifyAcceptanceMutation } from '@/app/api/complianceApi';
import { useGetUserProfileRawQuery } from '@/app/api/userApi';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { Scooter } from '../ScooterCard';
import { StockDetailResponse } from '@/app/api/inventoryApi';
import { useRazorpay } from '@/hooks/useRazorpay';
import { payForEntity, VerifyPaymentResponse } from '@/services/paymentService';

interface PreBookingModalProps {
  scooter: Scooter;
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
  stockData?: StockDetailResponse;
}

const MIN_PRE_BOOKING = 500; // Minimum pre-booking amount
const DISTRIBUTOR_ELIGIBILITY_AMOUNT = 5000; // Minimum amount to be eligible for distributor program
const TDS_RATE = 0.1; // 10% TDS
const REFERRAL_BONUS = 1000;
const REDEMPTION_ELIGIBILITY_DAYS = 365; // 1 year
const PAYMENT_DUE_DAYS = 30;

// Helper function to extract error messages from API responses
const extractErrorMessage = (error: unknown, defaultMessage: string = 'An error occurred. Please try again.'): string => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;
  }

  const errorData = (error as { data?: any }).data;

  if (!errorData) {
    return defaultMessage;
  }

  if (typeof errorData === 'string') {
    return errorData;
  }

  if (typeof errorData !== 'object') {
    return defaultMessage;
  }

  // Check for general error messages first
  if (errorData.detail && typeof errorData.detail === 'string') {
    return errorData.detail;
  }
  
  if (errorData.message && typeof errorData.message === 'string') {
    return errorData.message;
  }
  
  if (errorData.error && typeof errorData.error === 'string') {
    return errorData.error;
  }

  // Handle field-specific errors (e.g., { referral_code: ['Invalid referral code'] })
  const fieldErrors: string[] = [];

  // Map API field names to user-friendly names
  const fieldNameMap: Record<string, string> = {
    'referral_code': 'Referral Code',
    'vehicle_model_code': 'Vehicle Model',
    'vehicle_color': 'Vehicle Color',
    'battery_variant': 'Battery Variant',
    'booking_amount': 'Pre-Booking Amount',
    'total_amount': 'Total Amount',
    'delivery_city': 'Delivery City',
    'delivery_state': 'Delivery State',
    'delivery_pin': 'PIN Code',
    'terms_accepted': 'Terms and Conditions',
    'join_distributor_program': 'Distributor Program',
    'amount': 'Amount',
    'payment_method': 'Payment Method',
    'booking_id': 'Booking',
  };

  // Extract field-specific errors
  Object.keys(errorData).forEach((key) => {
    const fieldName = fieldNameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const fieldError = errorData[key];

    if (Array.isArray(fieldError) && fieldError.length > 0) {
      // Join multiple errors for the same field
      fieldErrors.push(`${fieldName}: ${fieldError.join(', ')}`);
    } else if (typeof fieldError === 'string') {
      fieldErrors.push(`${fieldName}: ${fieldError}`);
    } else if (typeof fieldError === 'object' && fieldError !== null) {
      // Handle nested error objects
      const nestedErrors = Object.values(fieldError).flat();
      if (nestedErrors.length > 0) {
        fieldErrors.push(`${fieldName}: ${nestedErrors.join(', ')}`);
      }
    }
  });

  if (fieldErrors.length > 0) {
    // Join all field errors with newlines for better readability
    return fieldErrors.join('\n');
  }

  return defaultMessage;
};

export function PreBookingModal({ scooter, isOpen, onClose, referralCode, stockData }: PreBookingModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [addReferralNode] = useAddReferralNodeMutation();
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();
  const [makePayment, { isLoading: isMakingPayment }] = useMakePaymentMutation();
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  
  // Fetch user profile to get address information (raw profile includes city, state, pincode)
  const { data: userProfile } = useGetUserProfileRawQuery(undefined, {
    skip: !isOpen || !isAuthenticated, // Only fetch when modal is open and user is authenticated
  });
  
  // Fetch distributor documents when modal opens
  const { data: distributorDocuments, isLoading: isLoadingDocuments } = useGetDistributorDocumentsQuery(undefined, {
    skip: !isOpen, // Only fetch when modal is open
  });
  
  // Log API response
  useEffect(() => {
    if (distributorDocuments) {
      console.log('📄 [PRE-BOOKING] Distributor Documents API Response:', distributorDocuments);
    }
  }, [distributorDocuments]);
  
  // Find payment_terms document
  // Check for document_type and file URL existence (is_active might not be in response)
  const paymentTermsDocument = distributorDocuments?.find(
    (doc) => doc.document_type === 'payment_terms' && doc.file
  );
  
  // Log the filtered payment terms document and debug info
  useEffect(() => {
    if (distributorDocuments) {
      console.log('📄 [PRE-BOOKING] All documents:', distributorDocuments);
      const paymentDocs = distributorDocuments.filter(doc => doc.document_type === 'payment_terms');
      console.log('📄 [PRE-BOOKING] Payment terms documents found:', paymentDocs);
      console.log('📄 [PRE-BOOKING] Payment terms documents with file:', paymentDocs.filter(doc => doc.file));
    }
    if (paymentTermsDocument) {
      console.log('📄 [PRE-BOOKING] Payment Terms Document:', paymentTermsDocument);
      console.log('📄 [PRE-BOOKING] Payment Terms Document URL:', paymentTermsDocument.file);
    } else if (distributorDocuments) {
      console.warn('📄 [PRE-BOOKING] Payment Terms document not found. Available documents:', 
        distributorDocuments.map(doc => ({ type: doc.document_type, hasFile: !!doc.file, is_active: (doc as any).is_active }))
      );
    }
  }, [paymentTermsDocument, distributorDocuments]);
  // Use ref to prevent duplicate submissions (refs update synchronously)
  const isSubmittingRef = useRef(false);
  const [preBookingAmount, setPreBookingAmount] = useState(500);
  const [inputValue, setInputValue] = useState('500'); // Local state for input field
  
  // Get referral code from localStorage or prop, default to empty string
  const getReferralCodeFromStorage = useCallback(() => {
    if (referralCode) return referralCode;
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem('ev_nexus_referral_code');
      if (storedCode) return storedCode;
    }
    return '';
  }, [referralCode]);
  
  const [referralCodeInput, setReferralCodeInput] = useState(() => {
    // Initialize with referral code from prop or localStorage
    if (referralCode) return referralCode;
    if (typeof window !== 'undefined') {
      const storedCode = localStorage.getItem('ev_nexus_referral_code');
      if (storedCode) return storedCode;
    }
    return '';
  });
  const [joinDistributorProgram, setJoinDistributorProgram] = useState(false);
  
  // Delivery address fields
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPin, setDeliveryPin] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Document acceptance and OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isAcceptingDocument, setIsAcceptingDocument] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  
  // Document acceptance mutations
  const [acceptDocument] = useAcceptDocumentMutation();
  const [verifyAcceptance] = useVerifyAcceptanceMutation();
  
  // Get user identifier (email or mobile)
  const getIdentifier = () => {
    if (currentUser?.email) return currentUser.email;
    if (currentUser?.phone) return currentUser.phone.replace(/\D/g, '');
    return '';
  };
  
  const getOtpType = (): 'email' | 'mobile' => {
    const identifier = getIdentifier();
    return identifier.includes('@') ? 'email' : 'mobile';
  };
  
  // Selected vehicle color and battery variant
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedBatteryVariant, setSelectedBatteryVariant] = useState<string>('');
  
  // Store booking response
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  
  // Razorpay integration
  const openRazorpayCheckout = useRazorpay();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Sync inputValue when preBookingAmount changes externally
  useEffect(() => {
    setInputValue(preBookingAmount.toString());
  }, [preBookingAmount]);

  // Auto-fill referral code when modal opens (from localStorage or prop)
  useEffect(() => {
    if (isOpen) {
      const codeToUse = getReferralCodeFromStorage();
      setReferralCodeInput(codeToUse);
      console.log('✅ [PRE-BOOKING] Auto-filled referral code:', codeToUse || 'none');
    }
  }, [isOpen, getReferralCodeFromStorage]);
  
  // Auto-fill delivery address from user profile
  useEffect(() => {
    if (isOpen && userProfile) {
      if (userProfile.city) {
        setDeliveryCity(userProfile.city);
      }
      if (userProfile.state) {
        setDeliveryState(userProfile.state);
      }
      if (userProfile.pincode) {
        setDeliveryPin(userProfile.pincode);
      }
      console.log('✅ [PRE-BOOKING] Auto-filled delivery address from profile:', {
        city: userProfile.city,
        state: userProfile.state,
        pincode: userProfile.pincode,
      });
    }
  }, [isOpen, userProfile]);

  // Reset booking response and submission state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBookingResponse(null);
      setIsBookingInProgress(false);
      setIsVerifyingPayment(false);
      isSubmittingRef.current = false;
      // Reset OTP state
      setTermsAccepted(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode('');
    }
  }, [isOpen]);

  // Initialize selected color and battery variant from stockData
  useEffect(() => {
    if (stockData) {
      if (stockData.vehicle_colors && stockData.vehicle_colors.length > 0 && !selectedColor) {
        setSelectedColor(stockData.vehicle_colors[0]);
      }
      if (stockData.battery_variants && stockData.battery_variants.length > 0 && !selectedBatteryVariant) {
        setSelectedBatteryVariant(stockData.battery_variants[0]);
      }
    }
  }, [stockData, selectedColor, selectedBatteryVariant]);

  const totalAmount = scooter.price;
  const remainingAmount = totalAmount - preBookingAmount;
  const excessAmount = preBookingAmount > DISTRIBUTOR_ELIGIBILITY_AMOUNT ? preBookingAmount - DISTRIBUTOR_ELIGIBILITY_AMOUNT : 0;
  const taxAndDeductions = excessAmount * 0.15; // 15% tax and deductions on excess
  const refundableAmount = excessAmount - taxAndDeductions;
  // Redemption points only eligible if pre-booked at least ₹5000
  const redemptionPoints = preBookingAmount >= DISTRIBUTOR_ELIGIBILITY_AMOUNT ? DISTRIBUTOR_ELIGIBILITY_AMOUNT : 0;
  // Get user from Redux or localStorage fallback
  const getUser = (): typeof user => {
    if (user) return user;
    // Fallback to localStorage if Redux hasn't loaded yet
    try {
      const authDataStr = localStorage.getItem('ev_nexus_auth_data');
      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        if (authData.user && authData.user.id && authData.user.email) {
          return {
            id: authData.user.id,
            name: authData.user.name || authData.user.email,
            email: authData.user.email,
            role: (authData.user.role || 'user') as 'admin' | 'staff' | 'user',
            isDistributor: authData.user.isDistributor || false,
            phone: authData.user.phone,
            joinedAt: authData.user.joinedAt || new Date().toISOString(),
            kycStatus: authData.user.kycStatus,
            kycDetails: authData.user.kycDetails,
            distributorInfo: authData.user.distributorInfo,
            preBookingInfo: authData.user.preBookingInfo,
          };
        }
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }
    return null;
  };
  
  const currentUser = getUser();
  
  // Skip distributor eligibility check if user is already a distributor
  const isAlreadyDistributor = currentUser?.isDistributor && currentUser?.distributorInfo?.isVerified;
  // Check eligibility based on:
  // 1. Current pre-booking amount >= 5000, OR
  // 2. Existing total paid amount (from previous pre-booking/payments) >= 5000
  const existingTotalPaid = currentUser?.preBookingInfo?.totalPaid || 0;
  const isEligibleByCurrentAmount = preBookingAmount >= DISTRIBUTOR_ELIGIBILITY_AMOUNT;
  const isEligibleByAccumulatedAmount = existingTotalPaid >= DISTRIBUTOR_ELIGIBILITY_AMOUNT;
  const isDistributorEligible = !isAlreadyDistributor && (isEligibleByCurrentAmount || isEligibleByAccumulatedAmount);

  const paymentDueDate = new Date();
  paymentDueDate.setDate(paymentDueDate.getDate() + PAYMENT_DUE_DAYS);

  const handlePreBook = async () => {
    // Prevent double submission - check both state and ref (ref updates synchronously)
    if (isBookingInProgress || isCreatingBooking || isSubmittingRef.current || bookingResponse) {
      console.log('🟡 [PRE-BOOK] Submission blocked - already in progress or booking exists');
      if (bookingResponse) {
        // If booking already exists, trigger payment again
        await handleRazorpayPayment(bookingResponse);
      }
      return;
    }

    if (preBookingAmount < MIN_PRE_BOOKING) {
      toast.error(`Minimum pre-booking amount is ₹${MIN_PRE_BOOKING.toLocaleString()}`);
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to pre-book');
      return;
    }

    // Use currentUser (already computed from Redux or localStorage fallback at component level)
    if (!currentUser) {
      toast.error('Please login to pre-book');
      return;
    }
    
    const userForBooking = currentUser;

    // Validate required fields
    if (!selectedColor) {
      toast.error('Please select a vehicle color');
      return;
    }

    if (!selectedBatteryVariant) {
      toast.error('Please select a battery variant');
      return;
    }

    if (!deliveryCity.trim()) {
      toast.error('Please enter delivery city');
      return;
    }

    if (!deliveryState.trim()) {
      toast.error('Please enter delivery state');
      return;
    }

    if (!deliveryPin.trim()) {
      toast.error('Please enter delivery PIN code');
      return;
    }

    // Validate PIN code format (6 digits)
    if (!/^\d{6}$/.test(deliveryPin.trim())) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }

    if (!referralCodeInput.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the Terms and Conditions');
      return;
    }
    
    if (!otpVerified) {
      toast.error('Please verify OTP to proceed');
      return;
    }

    if (!stockData) {
      toast.error('Vehicle details not available. Please refresh the page.');
      return;
    }

    // Validate selected color is in available colors
    if (!stockData.vehicle_colors.includes(selectedColor)) {
      toast.error('Selected color is not available for this vehicle');
      return;
    }

    // Validate selected battery variant is in available variants
    if (!stockData.battery_variants.includes(selectedBatteryVariant)) {
      toast.error('Selected battery variant is not available for this vehicle');
      return;
    }

    // Validate total amount matches vehicle price
    if (totalAmount !== parseFloat(stockData.price)) {
      toast.error('Vehicle price mismatch. Please refresh the page.');
      return;
    }

    // All validations passed - set ref and state to prevent duplicate submissions
    isSubmittingRef.current = true;
    setIsBookingInProgress(true);

    try {
      
      // Prepare booking request (without payment_gateway_ref initially)
      const bookingRequest = {
        vehicle_model_code: stockData.vehicle_model_code,
        vehicle_color: selectedColor,
        battery_variant: selectedBatteryVariant,
        booking_amount: preBookingAmount,
        total_amount: totalAmount,
        delivery_city: deliveryCity.trim(),
        delivery_state: deliveryState.trim(),
        delivery_pin: deliveryPin.trim(),
        terms_accepted: termsAccepted,
        referral_code: referralCodeInput.trim(),
        join_distributor_program: joinDistributorProgram || undefined,
      };

      console.log('🟢 [PRE-BOOK] Creating booking...', {
        timestamp: new Date().toISOString(),
        requestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      });
      
      // Call booking API - only once
      const response = await createBooking(bookingRequest).unwrap();
      console.log('🟢 [PRE-BOOK] Booking created successfully:', response);
      
      // Store booking response immediately to prevent duplicate calls
      setBookingResponse(response);
      
      // Trigger Razorpay payment flow after successful booking
      // Keep isSubmittingRef true until payment is processed to prevent duplicate bookings
      await handleRazorpayPayment(response);
      
      // Don't reset ref here - keep it true until payment completes or modal closes
    } catch (error: unknown) {
      console.error('🔴 [PRE-BOOK] Booking API Error:', error);
      
      // Extract and format error messages from API response
      const errorMessage = extractErrorMessage(error, 'Failed to create booking. Please try again.');
      
      toast.error(errorMessage, {
        duration: 5000, // Show for longer since it might contain multiple errors
      });
      
      // Reset submission state on error
      isSubmittingRef.current = false;
      setIsBookingInProgress(false);
    }
  };

  // Handle viewing Payment Terms PDF
  const handleViewBookingTerms = () => {
    if (paymentTermsDocument?.file) {
      console.log('📄 [PRE-BOOKING] Opening Payment Terms document:', paymentTermsDocument.file);
      window.open(paymentTermsDocument.file, '_blank');
    } else {
      console.warn('📄 [PRE-BOOKING] Payment Terms document not available from API');
      toast.error('Payment Terms document is not available. Please try again later.');
    }
  };

  // Handle downloading Payment Terms PDF
  const handleDownloadBookingTerms = () => {
    if (paymentTermsDocument?.file) {
      console.log('📄 [PRE-BOOKING] Downloading Payment Terms document:', paymentTermsDocument.file);
      const link = document.createElement('a');
      link.href = paymentTermsDocument.file;
      link.download = paymentTermsDocument.title || 'Payment_Terms.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Payment Terms PDF download started');
    } else {
      console.warn('📄 [PRE-BOOKING] Payment Terms document not available from API');
      toast.error('Payment Terms document is not available. Please try again later.');
    }
  };
  
  // Handle Terms & Conditions checkbox change
  const handleTermsCheckboxChange = async (checked: boolean) => {
    setTermsAccepted(checked);
    
    if (checked) {
      // Check if document is available
      if (!paymentTermsDocument) {
        toast.error('Payment Terms document is not available. Please try again later.');
        setTermsAccepted(false);
        return;
      }
      
      setIsAcceptingDocument(true);
      try {
        // Call accept API
        console.log('📄 [PRE-BOOKING] Accepting document:', paymentTermsDocument.id);
        await acceptDocument(paymentTermsDocument.id).unwrap();
        console.log('📄 [PRE-BOOKING] Document accepted, OTP should be sent');
        setOtpSent(true);
        toast.success(`OTP sent to your ${getOtpType() === 'email' ? 'email' : 'mobile number'}`);
      } catch (error: unknown) {
        console.error('📄 [PRE-BOOKING] Error accepting document:', error);
        const errorMessage = error && typeof error === 'object' && 'data' in error && 
          error.data && typeof error.data === 'object' && 'message' in error.data &&
          typeof error.data.message === 'string' ? error.data.message : 'Failed to accept terms. Please try again.';
        toast.error(errorMessage);
        setTermsAccepted(false);
      } finally {
        setIsAcceptingDocument(false);
      }
    } else {
      // Reset OTP state when unchecked
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode('');
    }
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!paymentTermsDocument) {
      toast.error('Payment Terms document is not available. Please try again later.');
      return;
    }
    
    const identifier = getIdentifier();
    const otpType = getOtpType();
    
    if (!identifier) {
      toast.error('Email or mobile number not found in profile');
      return;
    }
    
    setIsVerifyingOTP(true);
    try {
      console.log('📄 [PRE-BOOKING] Verifying OTP for document:', paymentTermsDocument.id);
      await verifyAcceptance({
        documentId: paymentTermsDocument.id,
        data: {
          identifier,
          otp_code: otpCode,
          otp_type: otpType,
        },
      }).unwrap();
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } catch (error: unknown) {
      console.error('📄 [PRE-BOOKING] Error verifying OTP:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error && 
        error.data && typeof error.data === 'object' && 'message' in error.data &&
        typeof error.data.message === 'string' ? error.data.message : 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Handle Razorpay payment flow
  const handleRazorpayPayment = async (booking: BookingResponse) => {
    if (!booking) {
      toast.error('Booking details not available. Please refresh the page.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Get user info for prefill
      const userPrefill = currentUser ? {
        name: currentUser.name || undefined,
        email: currentUser.email || undefined,
        contact: currentUser.phone || undefined,
      } : undefined;

      // Trigger Razorpay payment flow
      const paymentResult = await payForEntity(
        'booking', // entity_type
        booking.id, // entity_id (booking ID)
        openRazorpayCheckout,
        {
          name: 'EV Nexus',
          description: `Pre-booking payment for ${scooter.name}`,
          prefill: userPrefill,
          onClose: () => {
            // User closed the modal - reset payment state but keep booking
            setIsProcessingPayment(false);
            toast.info('Payment cancelled. You can complete payment later.');
          },
          onDismiss: () => {
            // User dismissed the modal - reset payment state but keep booking
            setIsProcessingPayment(false);
            toast.info('Payment cancelled. You can complete payment later.');
          },
        }
      );

      // Payment verified successfully by Razorpay
      if (paymentResult.success) {
        console.log('✅ [PAYMENT] Razorpay payment verified, showing loading overlay');
        // Show verification loading immediately after Razorpay payment success
        setIsProcessingPayment(false);
        setIsVerifyingPayment(true);
        
        // Force a re-render to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('✅ [PAYMENT] Calling handlePaymentSuccess');
        // Call the existing handlePaymentSuccess function
        await handlePaymentSuccess();
      } else {
        throw new Error(paymentResult.message || 'Payment verification failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      
      // Only show error toast if it's not a user cancellation
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('closed') && !errorMessage.includes('dismissed')) {
        toast.error(errorMessage);
      }
      
      // Reset payment processing state
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentGatewayRef?: string) => {
    if (!stockData || !bookingResponse) {
      toast.error('Booking details not available. Please refresh the page.');
      setIsVerifyingPayment(false);
      return;
    }

    // Verification loading should already be set from handleRazorpayPayment
    // But ensure it's set in case this is called directly
    if (!isVerifyingPayment) {
      setIsVerifyingPayment(true);
    }

    try {
      // Call make payment API
      const paymentResponse = await makePayment({
        bookingId: bookingResponse.id,
        paymentData: {
          amount: preBookingAmount,
          payment_method: 'online',
        },
      }).unwrap();

      // Use the updated booking response from payment API if available, otherwise use original
      const booking = paymentResponse || bookingResponse;

      // Calculate referral bonus if referral code is provided
      let referralBonus = 0;
      let tdsDeducted = 0;
      if (referralCodeInput && referralCodeInput.trim()) {
        referralBonus = REFERRAL_BONUS;
        tdsDeducted = referralBonus * TDS_RATE;
        const netBonus = referralBonus - tdsDeducted;

        // Add payout for referrer
        dispatch(addPayout({
          id: `payout-${Date.now()}`,
          amount: netBonus,
          type: 'referral',
          status: 'pending',
          description: `Referral bonus for ${scooter.name} pre-booking`,
          tds: tdsDeducted,
          netAmount: netBonus,
          requestedAt: new Date().toISOString(),
        }));
      }

      // Create local booking object from API response
      const localBooking = {
        id: booking.id.toString(),
        vehicleId: scooter.id,
        vehicleName: scooter.name,
        status: 'pre-booked' as const,
        preBookingAmount: parseFloat(booking.booking_amount),
        totalAmount: parseFloat(booking.total_amount),
        remainingAmount: parseFloat(booking.remaining_amount),
        totalPaid: parseFloat(booking.total_paid),
        paymentMethod: 'full' as const,
        emiPlan: undefined,
        paymentDueDate: booking.expires_at as string,
        paymentStatus: 'partial' as const,
        isActiveBuyer: true,
        redemptionPoints,
        redemptionEligible: false,
        bookedAt: booking.created_at as string,
        referredBy: booking.referred_by && typeof booking.referred_by === 'object' 
          ? String(booking.referred_by.id) 
          : undefined,
        referralBonus: referralBonus > 0 ? referralBonus : undefined,
        tdsDeducted: referralBonus > 0 ? tdsDeducted : undefined,
        addedToTeamNetwork: false,
      };

      // Add user to distributor's binary tree if referral code belongs to a distributor
      if (currentUser && preBookingAmount >= DISTRIBUTOR_ELIGIBILITY_AMOUNT && referralCodeInput && referralCodeInput.trim()) {
        try {
          let distributorId: string | null = null;
          
          const authDataStr = localStorage.getItem('ev_nexus_auth_data');
          if (authDataStr) {
            try {
              const authData = JSON.parse(authDataStr);
              if (authData.user?.distributorInfo?.referralCode === referralCodeInput.trim() &&
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
              userId: currentUser.id,
              userName: currentUser.name,
              pv: preBookingAmount,
              referralCode: referralCodeInput.trim(),
            }).unwrap();
            
            localBooking.addedToTeamNetwork = true;
          }
        } catch (error) {
          console.error('Error adding user to binary tree:', error);
        }
      }

      dispatch(addBooking(localBooking));

      // Store referral code in localStorage after successful booking
      if (referralCodeInput.trim() && typeof window !== 'undefined') {
        localStorage.setItem('ev_nexus_referral_code', referralCodeInput.trim());
        console.log('✅ [PRE-BOOKING] Stored referral code in localStorage after booking:', referralCodeInput.trim());
      }

      // Update user pre-booking info
      dispatch(updatePreBooking({
        hasPreBooked: true,
        preBookingAmount,
        totalPaid: preBookingAmount,
        preBookingDate: new Date().toISOString(),
        vehicleId: scooter.id,
        vehicleName: scooter.name,
        isActiveBuyer: true,
        remainingAmount,
        paymentDueDate: paymentDueDate.toISOString(),
        paymentStatus: 'partial',
        redemptionPoints,
        redemptionEligible: false,
        isDistributorEligible: isAlreadyDistributor ? true : isDistributorEligible,
        wantsToJoinDistributor: isAlreadyDistributor ? false : joinDistributorProgram,
      }));

      let successMessage = 'Pre-booking successful! You are now an Active Buyer.';
      if (isAlreadyDistributor) {
        successMessage = 'Pre-booking successful! Your order has been added to your order history.';
      } else if (joinDistributorProgram && isDistributorEligible) {
        successMessage += ' You can now apply for the ASA(Authorized Sales Associate) Program from your profile.';
      }
      
      // Reset submission state after successful payment
      isSubmittingRef.current = false;
      setIsBookingInProgress(false);
      setIsProcessingPayment(false);
      
      console.log('✅ [PAYMENT] Payment processing complete, preparing navigation');
      
      // Keep verification loading visible for a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ [PAYMENT] Closing modal and navigating');
      
      // Close modal first
      onClose();
      
      // Small delay before navigation to ensure modal closes smoothly
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Reset verification state before navigation
      setIsVerifyingPayment(false);
      
      // Navigate to profile page with orders tab
      console.log('✅ [PAYMENT] Navigating to /profile?tab=orders');
      navigate('/profile?tab=orders', { replace: true });
      
      // Show success toast after navigation
      setTimeout(() => {
        toast.success(successMessage, {
          duration: 4000,
        });
      }, 600);
    } catch (error: unknown) {
      console.error('🔴 [PAYMENT] Payment Processing Error:', error);
      
      // Extract and format error messages from API response
      const errorMessage = extractErrorMessage(error, 'Failed to process payment. Please try again.');
      
      toast.error(errorMessage, {
        duration: 5000, // Show for longer since it might contain multiple errors
      });
      
      // Reset submission state on payment error
      isSubmittingRef.current = false;
      setIsBookingInProgress(false);
      setIsProcessingPayment(false);
      setIsVerifyingPayment(false);
    }
  };

  return (
    <>
      {/* Payment Verification Loading Overlay - Outside Dialog using Portal */}
      {isVerifyingPayment && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-background/98 backdrop-blur-md flex items-center justify-center">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center space-y-6 px-8 py-10"
            >
              <div className="relative">
                {/* Outer rotating ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary"
                />
                {/* Inner pulsing circle */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-primary/20"
                />
                {/* Center spinner */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </motion.div>
              </div>
              <div className="text-center space-y-3">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-foreground"
                >
                  Verifying your payment...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground max-w-xs"
                >
                  Please wait while we confirm your transaction
                </motion.p>
                {/* Animated dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-1.5 pt-2"
                >
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}

      <Dialog open={isOpen} onOpenChange={(open) => {
        // Prevent closing during payment verification
        if (!open && isVerifyingPayment) {
          return;
        }
        onClose();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Pre-Book {scooter.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Pre-booking form for {scooter.name}. Fill in your details to complete the pre-booking.
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-5">
          {/* Pre-Booking Amount */}
          <div className="space-y-2.5">
            <Label htmlFor="preBookingAmount" className="text-base font-semibold text-foreground">
              Pre-Booking Amount (Minimum ₹{MIN_PRE_BOOKING.toLocaleString()})
            </Label>
            <Input
              id="preBookingAmount"
              type="number"
              min={MIN_PRE_BOOKING}
              max={totalAmount}
              step="1"
              value={inputValue}
              onChange={(e) => {
                // Allow free typing - update local input value
                const value = e.target.value;
                setInputValue(value);
                
                // Update the actual amount if it's a valid number
                const numValue = Number(value);
                if (!isNaN(numValue) && numValue >= 0) {
                  setPreBookingAmount(numValue);
                }
              }}
              onBlur={(e) => {
                // Validate and clamp on blur (when user finishes typing)
                const value = Number(e.target.value);
                let finalValue = MIN_PRE_BOOKING;
                
                if (!isNaN(value)) {
                  if (value < MIN_PRE_BOOKING) {
                    finalValue = MIN_PRE_BOOKING;
                  } else if (value > totalAmount) {
                    finalValue = totalAmount;
                  } else {
                    finalValue = value;
                  }
                }
                
                setPreBookingAmount(finalValue);
                setInputValue(finalValue.toString());
              }}
              className="text-lg h-12"
            />
            {preBookingAmount < MIN_PRE_BOOKING && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Minimum amount is ₹{MIN_PRE_BOOKING.toLocaleString()}
              </p>
            )}
            {preBookingAmount > totalAmount && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Pre-booking amount cannot exceed vehicle price (₹{totalAmount.toLocaleString()})
              </p>
            )}
          </div>

          {/* Referral Code */}
          <div className="space-y-2.5">
            <Label htmlFor="referralCode" className="text-sm font-medium text-foreground">
              Referral Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="referralCode"
              placeholder="Enter referral code"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value)}
              required
              className="h-11"
            />
            {!referralCodeInput.trim() && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Referral code is required
              </p>
            )}
            {referralCodeInput && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Referrer will get ₹{REFERRAL_BONUS.toLocaleString()} bonus (after TDS)
              </p>
            )}
          </div>

          {/* Vehicle Color and Battery Variant Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vehicle Color Selection */}
            {stockData && stockData.vehicle_colors && stockData.vehicle_colors.length > 0 && (
              <div className="space-y-2.5">
                <Label htmlFor="vehicleColor" className="text-base font-semibold text-foreground">
                  Vehicle Color <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {stockData.vehicle_colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-2.5 rounded-lg border-2 transition-all font-medium ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Battery Variant Selection */}
            {stockData && stockData.battery_variants && stockData.battery_variants.length > 0 && (
              <div className="space-y-2.5">
                <Label htmlFor="batteryVariant" className="text-base font-semibold text-foreground">
                  Battery Variant <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {stockData.battery_variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedBatteryVariant(variant)}
                      className={`px-5 py-2.5 rounded-lg border-2 transition-all font-medium ${
                        selectedBatteryVariant === variant
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address - Auto-filled from profile, hidden from UI */}
          {/* Address fields are autofilled from user profile and not displayed */}

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={termsAccepted}
                  onCheckedChange={handleTermsCheckboxChange}
                  disabled={isAcceptingDocument || otpVerified}
                  required
                  className="mt-0.5"
                />
                <Label
                  htmlFor="termsAccepted"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={handleViewBookingTerms}
                    className="text-primary hover:underline font-medium"
                  >
                    Terms and Conditions
                  </button>
                  {' '}<span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleViewBookingTerms}
                  className="h-9 w-9 flex-shrink-0"
                  title="View Booking Terms"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDownloadBookingTerms}
                  className="h-9 w-9 flex-shrink-0"
                  title="Download Booking Terms"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!termsAccepted && (
              <p className="text-xs text-destructive ml-8 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                You must accept the Terms and Conditions to proceed
              </p>
            )}
            
            {/* OTP Verification Section */}
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 border-2 border-primary rounded-lg bg-primary/5 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-base">OTP Verification</h4>
                </div>
                
                {otpVerified ? (
                  <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      OTP verified successfully! You can now proceed.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        OTP has been sent to your registered {getOtpType() === 'email' ? 'Email' : 'Mobile Number'}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Enter OTP *</Label>
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <InputOTP
                          maxLength={6}
                          value={otpCode}
                          onChange={(value) => {
                            const cleaned = value.replace(/\D/g, '').slice(0, 6);
                            setOtpCode(cleaned);
                          }}
                          disabled={otpVerified || isVerifyingOTP}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={otpCode.length !== 6 || isVerifyingOTP}
                      className="w-full"
                    >
                      {isVerifyingOTP ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
            
            {termsAccepted && !otpSent && isAcceptingDocument && (
              <p className="text-sm text-muted-foreground ml-8">Accepting terms...</p>
            )}
          </div>


          {/* Payment Summary */}
          <div className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50 space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">Payment Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Vehicle Price</span>
                <span className="font-semibold text-base text-foreground">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Pre-Booking Amount</span>
                <span className="font-semibold text-base text-primary">₹{preBookingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Remaining Amount</span>
                <span className="font-semibold text-base text-foreground">₹{remainingAmount.toLocaleString()}</span>
              </div>
              {excessAmount > 0 && (
                <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Excess Amount (Refundable)</span>
                    <span>₹{excessAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tax & Deductions (15%)</span>
                    <span className="text-destructive">-₹{taxAndDeductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/30">
                    <span className="text-foreground">Net Refund</span>
                    <span className="text-primary">₹{refundableAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Due Date */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1.5">Payment Due Date</p>
                <p className="text-base font-medium text-foreground mb-2">
                  {paymentDueDate.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  If payment is not completed within 30 days, flexible payment options will be available.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isCreatingBooking}>
              Cancel
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePreBook();
              }}
              type="button"
              className="flex-1" 
              disabled={
                isCreatingBooking ||
                isBookingInProgress ||
                isProcessingPayment ||
                preBookingAmount < MIN_PRE_BOOKING ||
                !selectedColor ||
                !selectedBatteryVariant ||
                !deliveryCity.trim() ||
                !deliveryState.trim() ||
                !deliveryPin.trim() ||
                !/^\d{6}$/.test(deliveryPin.trim()) ||
                !referralCodeInput.trim() ||
                !termsAccepted ||
                !otpVerified ||
                !stockData
              }
            >
              {isCreatingBooking || isBookingInProgress || isProcessingPayment 
                ? (isProcessingPayment ? 'Opening Payment...' : 'Processing...') 
                : 'Pre-Book Now'}
            </Button>
          </div>
        </div>
          </div>
      </DialogContent>
    </Dialog>

    </>
  );
}

