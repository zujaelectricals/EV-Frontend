import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle, Info, Calendar, Wallet, Eye, Download, Loader2, FileText } from 'lucide-react';
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
import { useGetDistributorDocumentsQuery, useGetPaymentTermsQuery, useAcceptDocumentMutation, useVerifyAcceptanceMutation, useInitiatePaymentTermsAcceptanceMutation, useVerifyPaymentTermsAcceptanceMutation } from '@/app/api/complianceApi';
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
import { api } from '@/app/api/baseApi';

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

  const errorData = (error as { data?: unknown }).data;

  if (!errorData) {
    return defaultMessage;
  }

  if (typeof errorData === 'string') {
    return errorData;
  }

  if (typeof errorData !== 'object' || errorData === null) {
    return defaultMessage;
  }

  // Type guard for error data object
  const errorObj = errorData as Record<string, unknown>;

  // Check for general error messages first
  if (errorObj.detail && typeof errorObj.detail === 'string') {
    return errorObj.detail;
  }
  
  if (errorObj.message && typeof errorObj.message === 'string') {
    return errorObj.message;
  }
  
  if (errorObj.error && typeof errorObj.error === 'string') {
    return errorObj.error;
  }

  // Handle field-specific errors (e.g., { referral_code: ['Invalid referral code'] })
  const fieldErrors: string[] = [];

  // Map API field names to user-friendly names
  const fieldNameMap: Record<string, string> = {
    'referral_code': 'ASA Code',
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
  Object.keys(errorObj).forEach((key) => {
    const fieldName = fieldNameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const fieldError = errorObj[key];

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

// Helper function to restore all pointer-events
const restoreAllPointerEvents = () => {
  if (typeof document === 'undefined') return;
  
  // First, restore all elements with stored pointer-events
  const allElements = document.querySelectorAll('*');
  allElements.forEach((el) => {
    const element = el as HTMLElement;
    if (element.dataset.originalPointerEvents !== undefined) {
      const originalValue = element.dataset.originalPointerEvents || '';
      element.style.pointerEvents = originalValue;
      delete element.dataset.originalPointerEvents;
    }
  });
  
  // Also ensure no high z-index overlays are blocking (except Razorpay)
  const highZIndexElements = Array.from(document.querySelectorAll('*')).filter((el) => {
    const style = window.getComputedStyle(el);
    const zIndex = parseInt(style.zIndex, 10);
    const position = style.position;
    return position === 'fixed' && zIndex >= 50 && !isNaN(zIndex);
  });
  
  highZIndexElements.forEach((element) => {
    const el = element as HTMLElement;
    // Skip Razorpay elements
    if (el.closest('[class*="razorpay"]') || el.querySelector('[class*="razorpay"]')) {
      return;
    }
    // Skip if it's the verification overlay and it's still showing
    if (el.classList.contains('fixed') && el.classList.contains('inset-0')) {
      // Check if it's our verification overlay by checking z-index
      const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
      if (zIndex >= 99999) {
        // This might be our overlay, ensure it's not blocking
        el.style.pointerEvents = 'none';
      }
    }
  });
  
  // Force enable pointer-events on navbar and navigation elements
  const navElements = document.querySelectorAll('nav, [role="navigation"], header, [class*="navbar"], [class*="nav"]');
  navElements.forEach((nav) => {
    const navEl = nav as HTMLElement;
    const style = window.getComputedStyle(navEl);
    // Only restore if it's not already set to 'none' by design
    if (style.pointerEvents === 'none' && !navEl.dataset.originalPointerEvents) {
      navEl.style.pointerEvents = 'auto';
    } else if (navEl.dataset.originalPointerEvents !== undefined) {
      const originalValue = navEl.dataset.originalPointerEvents || 'auto';
      navEl.style.pointerEvents = originalValue;
    }
  });
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
  
  // Fetch payment terms when modal opens
  const { data: paymentTermsData, isLoading: isLoadingPaymentTerms } = useGetPaymentTermsQuery(undefined, {
    skip: !isOpen, // Only fetch when modal is open
  });
  
  // Log API response
  useEffect(() => {
    if (paymentTermsData) {
      console.log('📄 [PRE-BOOKING] Payment Terms API Response:', paymentTermsData);
      console.log('📄 [PRE-BOOKING] Payment Terms API Response (stringified):', JSON.stringify(paymentTermsData, null, 2));
      console.log('📄 [PRE-BOOKING] Payment Terms count:', paymentTermsData.length);
    }
  }, [paymentTermsData]);
  
  // Log loading state
  useEffect(() => {
    if (isOpen) {
      console.log('📄 [PRE-BOOKING] Payment Terms loading state:', isLoadingPaymentTerms);
    }
  }, [isOpen, isLoadingPaymentTerms]);

  // Get active payment term
  const activePaymentTerm = useMemo(() => {
    if (!paymentTermsData || paymentTermsData.length === 0) {
      console.log('📄 [PRE-BOOKING] No payment terms data available');
      return null;
    }
    const active = paymentTermsData.find(term => term.is_active) || paymentTermsData[0];
    console.log('📄 [PRE-BOOKING] Active payment term:', active);
    return active;
  }, [paymentTermsData]);

  // Parse payment terms from full_text (split by double newlines)
  const paymentTerms = useMemo(() => {
    if (!activePaymentTerm || !activePaymentTerm.full_text) {
      console.log('📄 [PRE-BOOKING] No active payment term or full_text available');
      return [];
    }
    
    // Parse full_text: split by double newlines and filter out empty strings
    const terms = activePaymentTerm.full_text
      .split(/\n\n+/)
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    console.log('📄 [PRE-BOOKING] Parsed payment terms count:', terms.length);
    console.log('📄 [PRE-BOOKING] Parsed payment terms:', terms);
    
    return terms;
  }, [activePaymentTerm]);

  // Modal state for viewing full terms
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  // Use ref to prevent duplicate submissions (refs update synchronously)
  const isSubmittingRef = useRef(false);
  const [preBookingAmount, setPreBookingAmount] = useState(500);
  const [inputValue, setInputValue] = useState('500'); // Local state for input field
  
  // Get referral code from localStorage or prop, default to empty string
  const getReferralCodeFromStorage = useCallback(() => {
    // Priority 1: Prop passed to modal
    if (referralCode) return referralCode;
    
    // Priority 2: localStorage (from referral link or previous booking)
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
  const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);
  
  // Document acceptance mutations
  const [acceptDocument] = useAcceptDocumentMutation();
  const [verifyAcceptance] = useVerifyAcceptanceMutation();
  const [initiatePaymentTermsAcceptance] = useInitiatePaymentTermsAcceptanceMutation();
  const [verifyPaymentTermsAcceptance] = useVerifyPaymentTermsAcceptanceMutation();
  
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
      console.log('✅ [PRE-BOOKING] Auto-filled ASA code:', codeToUse || 'none');
    }
  }, [isOpen, getReferralCodeFromStorage]);
  
  // Auto-fill delivery address from user profile or localStorage
  useEffect(() => {
    if (isOpen) {
      let city = '';
      let state = '';
      let pincode = '';
      
      // Priority 1: User profile (from API)
      if (userProfile) {
        city = userProfile.city || '';
        state = userProfile.state || '';
        pincode = userProfile.pincode || '';
      }
      
      // Priority 2: localStorage (fallback if profile doesn't have the data)
      if (typeof window !== 'undefined') {
        if (!city) {
          const storedCity = localStorage.getItem('ev_nexus_delivery_city');
          if (storedCity) city = storedCity;
        }
        if (!state) {
          const storedState = localStorage.getItem('ev_nexus_delivery_state');
          if (storedState) state = storedState;
        }
        if (!pincode) {
          const storedPincode = localStorage.getItem('ev_nexus_delivery_pincode');
          if (storedPincode) pincode = storedPincode;
        }
      }
      
      // Set the values if we have them
      if (city) setDeliveryCity(city);
      if (state) setDeliveryState(state);
      if (pincode) setDeliveryPin(pincode);
      
      console.log('✅ [PRE-BOOKING] Auto-filled delivery address:', {
        city,
        state,
        pincode,
        hasAllFields: !!(city && state && pincode),
        source: userProfile ? 'profile' : 'localStorage',
      });
    }
  }, [isOpen, userProfile]);

  // Watch for verification completion and restore pointer-events immediately
  useEffect(() => {
    if (!isVerifyingPayment) {
      // When verification completes, immediately restore pointer-events
      restoreAllPointerEvents();
      
      // Also remove any blocking overlays
      if (typeof document !== 'undefined') {
        setTimeout(() => {
          const verificationOverlays = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
          verificationOverlays.forEach((overlay) => {
            const el = overlay as HTMLElement;
            const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
            if (zIndex >= 99999) {
              el.style.pointerEvents = 'none';
            }
          });
          restoreAllPointerEvents();
        }, 50);
        
        // Additional restoration after animation completes
        setTimeout(() => {
          restoreAllPointerEvents();
        }, 300);
      }
    }
  }, [isVerifyingPayment]);

  // Reset booking response and submission state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBookingResponse(null);
      setIsBookingInProgress(false);
      setIsVerifyingPayment(false);
      setIsProcessingPayment(false);
      isSubmittingRef.current = false;
      // Reset OTP state
      setTermsAccepted(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode('');
      setReceiptPdfUrl(null);
      
      // Ensure pointer-events are restored for all elements
      // This is a safety measure in case Razorpay hook didn't restore them
      restoreAllPointerEvents();
      
      // Force remove any blocking overlays
      if (typeof document !== 'undefined') {
        setTimeout(() => {
          const verificationOverlays = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
          verificationOverlays.forEach((overlay) => {
            const el = overlay as HTMLElement;
            const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
            if (zIndex >= 99999) {
              el.style.pointerEvents = 'none';
              el.style.display = 'none';
            }
          });
          restoreAllPointerEvents();
        }, 100);
      }
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

  // Helper to check if button should be disabled and why
  const getButtonDisabledState = useMemo(() => {
    const reasons: string[] = [];
    
    if (isCreatingBooking) reasons.push('Creating booking...');
    if (isBookingInProgress) reasons.push('Booking in progress...');
    if (isProcessingPayment) reasons.push('Processing payment...');
    if (preBookingAmount < MIN_PRE_BOOKING) reasons.push(`Amount must be at least ₹${MIN_PRE_BOOKING}`);
    if (!selectedColor) reasons.push('Color not selected');
    if (!selectedBatteryVariant) reasons.push('Battery variant not selected');
    if (!deliveryCity.trim()) reasons.push('Delivery city missing');
    if (!deliveryState.trim()) reasons.push('Delivery state missing');
    if (!deliveryPin.trim()) reasons.push('Delivery PIN missing');
    if (deliveryPin.trim() && !/^\d{6}$/.test(deliveryPin.trim())) reasons.push('Invalid PIN format (must be 6 digits)');
    if (!referralCodeInput.trim()) reasons.push('ASA code missing');
    if (!termsAccepted) reasons.push('Terms not accepted');
    if (!otpVerified) reasons.push('OTP not verified');
    if (!stockData) reasons.push('Stock data not available');
    
    return {
      disabled: reasons.length > 0,
      reasons,
    };
  }, [
    isCreatingBooking,
    isBookingInProgress,
    isProcessingPayment,
    preBookingAmount,
    selectedColor,
    selectedBatteryVariant,
    deliveryCity,
    deliveryState,
    deliveryPin,
    referralCodeInput,
    termsAccepted,
    otpVerified,
    stockData,
  ]);

  // Debug log to help identify why button is disabled
  useEffect(() => {
    if (isOpen && getButtonDisabledState.disabled) {
      console.log('🔴 [PRE-BOOKING] Button disabled reasons:', getButtonDisabledState.reasons);
      console.log('🔴 [PRE-BOOKING] Current state:', {
        preBookingAmount,
        selectedColor,
        selectedBatteryVariant,
        deliveryCity,
        deliveryState,
        deliveryPin,
        referralCodeInput: referralCodeInput.trim(),
        termsAccepted,
        otpVerified,
        hasStockData: !!stockData,
      });
    }
  }, [isOpen, getButtonDisabledState, preBookingAmount, selectedColor, selectedBatteryVariant, deliveryCity, deliveryState, deliveryPin, referralCodeInput, termsAccepted, otpVerified, stockData]);

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
      toast.error('Please enter an ASA code');
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


  // Handle viewing Payment Terms - open modal
  const handleViewBookingTerms = () => {
    if (activePaymentTerm) {
      setIsTermsModalOpen(true);
    } else {
      toast.error('Payment Terms are not available. Please try again later.');
    }
  };

  // Handle downloading Payment Terms
  const handleDownloadBookingTerms = () => {
    if (activePaymentTerm) {
      const blob = new Blob([activePaymentTerm.full_text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activePaymentTerm.title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Payment Terms download started');
    } else {
      toast.error('Payment Terms are not available. Please try again later.');
    }
  };
  
  // Handle final Terms & Conditions checkbox change
  const handleTermsCheckboxChange = async (checked: boolean) => {
    setTermsAccepted(checked);
    
    if (checked) {
      // Check if payment terms are available
      if (!activePaymentTerm) {
        toast.error('Payment Terms are not available. Please try again later.');
        setTermsAccepted(false);
        return;
      }
      
      // Check if user has email or mobile
      const identifier = getIdentifier();
      if (!identifier) {
        toast.error('Email or mobile number not found in profile. Please update your profile.');
        setTermsAccepted(false);
        return;
      }
      
      setIsAcceptingDocument(true);
      try {
        console.log('📄 [PRE-BOOKING] Initiating payment terms acceptance:', activePaymentTerm.id);
        
        // Call initiate endpoint to send OTP
        const response = await initiatePaymentTermsAcceptance(activePaymentTerm.id).unwrap();
        
        console.log('📄 [PRE-BOOKING] Payment terms acceptance initiated:', response);
        
        // Show OTP section
        setOtpSent(true);
        setOtpVerified(false);
        setOtpCode('');
        
        // Show success message with OTP delivery info
        const otpChannels = [];
        if (response.otp_sent.email) otpChannels.push('email');
        if (response.otp_sent.sms) otpChannels.push('SMS');
        
        toast.success(`OTP sent to your ${otpChannels.join(' and ')}. Please verify to proceed.`);
      } catch (error: unknown) {
        console.error('📄 [PRE-BOOKING] Error initiating payment terms acceptance:', error);
        
        // Extract error message
        let errorMessage = 'Failed to initiate payment terms acceptance. Please try again.';
        if (error && typeof error === 'object' && 'data' in error) {
          const errorData = error.data as any;
          if (errorData?.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData?.message && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (errorData?.detail && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        }
        
        toast.error(errorMessage);
        setTermsAccepted(false);
        setOtpSent(false);
        setOtpVerified(false);
        setReceiptPdfUrl(null);
      } finally {
        setIsAcceptingDocument(false);
      }
      } else {
        // Reset OTP state when unchecked
        setOtpSent(false);
        setOtpVerified(false);
        setOtpCode('');
        setReceiptPdfUrl(null);
      }
    };
  
  // Handle OTP verification for payment terms
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!activePaymentTerm) {
      toast.error('Payment Terms are not available. Please try again later.');
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
      console.log('📄 [PRE-BOOKING] Verifying OTP for payment terms:', {
        paymentTermsId: activePaymentTerm.id,
        identifier,
        otpType,
      });
      
      // Call verify endpoint
      const response = await verifyPaymentTermsAcceptance({
        id: activePaymentTerm.id,
        data: {
          identifier,
          otp_code: otpCode,
          otp_type: otpType,
          generate_pdf: true, // Generate PDF receipt
        },
      }).unwrap();
      
      console.log('📄 [PRE-BOOKING] Payment terms acceptance verified:', response);
      
      // Store receipt PDF URL if available
      if (response.acceptance?.receipt_pdf_url) {
        setReceiptPdfUrl(response.acceptance.receipt_pdf_url);
      }
      
      setOtpVerified(true);
      toast.success('OTP verified successfully! Payment terms accepted.');
    } catch (error: unknown) {
      console.error('📄 [PRE-BOOKING] Error verifying OTP:', error);
      
      // Extract error message
      let errorMessage = 'Invalid or expired OTP. Please try again.';
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data as any;
        if (errorData?.non_field_errors && Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
          errorMessage = errorData.non_field_errors[0];
        } else if (errorData?.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData?.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message;
        } else if (errorData?.detail && typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
      }
      
      toast.error(errorMessage);
      setOtpCode(''); // Clear OTP on error so user can retry
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
            // Invalidate inventory cache to refresh vehicle data
            dispatch(api.util.invalidateTags(['Inventory']));
          },
          onDismiss: () => {
            // User dismissed the modal - reset payment state but keep booking
            setIsProcessingPayment(false);
            toast.info('Payment cancelled. You can complete payment later.');
            // Invalidate inventory cache to refresh vehicle data
            dispatch(api.util.invalidateTags(['Inventory']));
          },
        }
      );

      // Payment verified successfully by Razorpay
      if (paymentResult.success) {
        console.log('✅ [PAYMENT] Razorpay payment verified, showing loading overlay');
        // Show verification loading immediately after Razorpay payment success
        setIsProcessingPayment(false);
        setIsVerifyingPayment(true);
        
        // Restore pointer-events immediately after payment success
        // This ensures navbar and other elements are clickable
        // Restore immediately and with delays to ensure it happens
        restoreAllPointerEvents();
        
        // Force enable navbar immediately
        if (typeof document !== 'undefined') {
          const navbars = document.querySelectorAll('nav, [role="navigation"], header');
          navbars.forEach((nav) => {
            (nav as HTMLElement).style.pointerEvents = 'auto';
          });
        }
        
        setTimeout(() => {
          restoreAllPointerEvents();
          // Force enable navbar again
          if (typeof document !== 'undefined') {
            const navbars = document.querySelectorAll('nav, [role="navigation"], header');
            navbars.forEach((nav) => {
              (nav as HTMLElement).style.pointerEvents = 'auto';
            });
          }
        }, 100);
        
        setTimeout(() => {
          restoreAllPointerEvents();
        }, 300);
        
        setTimeout(() => {
          restoreAllPointerEvents();
          // Final navbar restoration
          if (typeof document !== 'undefined') {
            const navbars = document.querySelectorAll('nav, [role="navigation"], header, [class*="navbar"]');
            navbars.forEach((nav) => {
              (nav as HTMLElement).style.pointerEvents = 'auto';
            });
          }
        }, 500);
        
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
      
      // Restore pointer-events on error as well
      restoreAllPointerEvents();
      setTimeout(restoreAllPointerEvents, 100);
      setTimeout(restoreAllPointerEvents, 300);
      
      // Invalidate inventory cache to refresh vehicle data after payment failure
      dispatch(api.util.invalidateTags(['Inventory']));
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

      // Calculate referral bonus if ASA code is provided
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

      // Add user to distributor's binary tree if ASA code belongs to a distributor
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

      // Store ASA code in localStorage after successful booking
      if (referralCodeInput.trim() && typeof window !== 'undefined') {
        localStorage.setItem('ev_nexus_referral_code', referralCodeInput.trim());
        console.log('✅ [PRE-BOOKING] Stored ASA code in localStorage after booking:', referralCodeInput.trim());
      }
      
      // Store delivery address in localStorage after successful booking for future use
      if (typeof window !== 'undefined') {
        if (deliveryCity.trim()) {
          localStorage.setItem('ev_nexus_delivery_city', deliveryCity.trim());
        }
        if (deliveryState.trim()) {
          localStorage.setItem('ev_nexus_delivery_state', deliveryState.trim());
        }
        if (deliveryPin.trim()) {
          localStorage.setItem('ev_nexus_delivery_pincode', deliveryPin.trim());
        }
        console.log('✅ [PRE-BOOKING] Stored delivery address in localStorage after booking:', {
          city: deliveryCity.trim(),
          state: deliveryState.trim(),
          pincode: deliveryPin.trim(),
        });
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
      
      // Reset verification state FIRST to remove overlay and restore interactions
      setIsVerifyingPayment(false);
      
      // Final restoration of pointer-events before closing modal
      restoreAllPointerEvents();
      
      // Force remove any blocking overlays
      if (typeof document !== 'undefined') {
        // Remove verification overlay if it still exists
        const verificationOverlays = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
        verificationOverlays.forEach((overlay) => {
          const el = overlay as HTMLElement;
          const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
          if (zIndex >= 99999) {
            el.style.pointerEvents = 'none';
            el.style.display = 'none';
          }
        });
      }
      
      // Force a delay to ensure overlay animation completes and DOM is updated
      await new Promise(resolve => setTimeout(resolve, 250));
      
      // Final restoration after delay
      restoreAllPointerEvents();
      
      // Close modal
      onClose();
      
      // Small delay before navigation to ensure modal closes smoothly
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Invalidate inventory cache to refresh vehicle data with updated is_already_booked status
      dispatch(api.util.invalidateTags(['Inventory']));
      console.log('✅ [PAYMENT] Invalidated inventory cache to refresh vehicle data');
      
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
      
      // Restore pointer-events on error
      restoreAllPointerEvents();
      
      // Force remove any blocking overlays
      setTimeout(() => {
        restoreAllPointerEvents();
        if (typeof document !== 'undefined') {
          const verificationOverlays = document.querySelectorAll('[class*="fixed"][class*="inset-0"]');
          verificationOverlays.forEach((overlay) => {
            const el = overlay as HTMLElement;
            const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
            if (zIndex >= 99999) {
              el.style.pointerEvents = 'none';
            }
          });
        }
      }, 100);
      
      // Invalidate inventory cache to refresh vehicle data after payment error
      dispatch(api.util.invalidateTags(['Inventory']));
    }
  };

  return (
    <>
      {/* Payment Verification Loading Overlay - Outside Dialog using Portal */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {isVerifyingPayment && (
            <motion.div
              key="payment-verification-overlay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[99999] bg-background/98 backdrop-blur-md flex items-center justify-center"
              style={{ pointerEvents: isVerifyingPayment ? 'auto' : 'none' }}
              onAnimationComplete={() => {
                // Force remove any blocking overlays after animation
                if (!isVerifyingPayment) {
                  restoreAllPointerEvents();
                  // Remove any high z-index overlays that might be blocking
                  const overlays = document.querySelectorAll('[class*="fixed"][class*="inset-0"][class*="z-"]');
                  overlays.forEach((overlay) => {
                    const el = overlay as HTMLElement;
                    const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
                    if (zIndex >= 99999 && el !== overlay) {
                      el.style.pointerEvents = 'none';
                    }
                  });
                }
              }}
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
          )}
        </AnimatePresence>,
        document.body
      )}

      <Dialog open={isOpen} onOpenChange={(open) => {
        // Prevent closing during payment verification
        if (!open && isVerifyingPayment) {
          return;
        }
        onClose();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 flex-wrap">
              <span>Pre-Book {scooter.name}</span>
              {selectedColor && (
                <Badge variant="outline" className="text-sm font-normal px-3 py-1 border-primary/30 bg-primary/5">
                  {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
                </Badge>
              )}
              {selectedBatteryVariant && (
                <Badge variant="outline" className="text-sm font-normal px-3 py-1 border-primary/30 bg-primary/5">
                  {selectedBatteryVariant}
                </Badge>
              )}
              {referralCodeInput.trim() && (
                <Badge variant="outline" className="text-sm font-semibold px-3 py-1 border-primary/40 bg-primary/10 text-primary">
                  {referralCodeInput.trim()}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Pre-booking form for {scooter.name}. Fill in your details to complete the pre-booking.
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-6">
          {/* Pre-Booking Amount */}
          <div className="space-y-3 pt-2">
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
              className="text-lg h-12 border-2 focus:border-primary transition-colors"
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

          {/* Delivery Address - Auto-filled from profile, hidden from UI */}
          {/* Address fields are autofilled from user profile and not displayed */}
          
          {/* ASA Code - Auto-filled from localStorage or prop, hidden from UI */}
          {/* ASA code is autofilled from referral link or previous booking and not displayed */}

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-foreground">
                    Payment Terms & Conditions
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleViewBookingTerms}
                    className="h-8 w-8"
                    title="View Terms"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleDownloadBookingTerms}
                    className="h-8 w-8"
                    title="Download Terms"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Please review and accept all terms before proceeding to verification.
              </p>
              
              {/* Final Confirmation Checkbox */}
              <div className={`mt-3 p-4 border-2 rounded-lg transition-colors ${
                termsAccepted
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-400 dark:border-green-600'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
              }`}>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={termsAccepted}
                    onCheckedChange={handleTermsCheckboxChange}
                    disabled={isAcceptingDocument || otpVerified}
                    required
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="termsAccepted"
                      className="cursor-pointer text-sm font-semibold block"
                    >
                      Payment Terms & Conditions
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                      I agree to the payment terms including booking amount, refund policy, delivery terms, and all conditions stated above.
                    </p>
                    <button
                      type="button"
                      onClick={handleViewBookingTerms}
                      className="text-primary hover:underline text-xs font-medium transition-colors"
                    >
                      View Full Agreement
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* OTP Verification Section */}
            {otpSent && (
              <motion.div
                id="otp-verification-section"
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
                  <div className="space-y-3">
                    <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        OTP verified successfully! You can now proceed.
                      </AlertDescription>
                    </Alert>
                    
                    {/* Receipt PDF Download Section */}
                    {receiptPdfUrl && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              Payment Terms Receipt
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Open PDF in new tab
                                window.open(receiptPdfUrl, '_blank');
                              }}
                              className="h-8 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Download PDF
                                const link = document.createElement('a');
                                link.href = receiptPdfUrl;
                                link.download = `payment-terms-receipt-${new Date().toISOString().split('T')[0]}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                toast.success('Receipt download started');
                              }}
                              className="h-8 text-xs"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
          <div className="p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-muted/30 rounded-xl border-2 border-primary/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 h-12 font-medium border-2 hover:bg-muted/50 transition-colors" 
              disabled={isCreatingBooking}
            >
              Cancel
            </Button>
            <div className="flex-1 relative">
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePreBook();
                }}
                type="button"
                className="w-full h-12 font-semibold shadow-md hover:shadow-lg transition-all" 
                disabled={getButtonDisabledState.disabled}
                title={getButtonDisabledState.disabled ? getButtonDisabledState.reasons.join(', ') : undefined}
              >
                {isCreatingBooking || isBookingInProgress || isProcessingPayment 
                  ? (isProcessingPayment ? 'Opening Payment...' : 'Processing...') 
                  : 'Pre-Book Now'}
              </Button>
              {getButtonDisabledState.disabled && getButtonDisabledState.reasons.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  {getButtonDisabledState.reasons[0]}
                </p>
              )}
            </div>
          </div>
        </div>
          </div>
      </DialogContent>
    </Dialog>

      {/* Payment Terms Modal */}
      <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              {activePaymentTerm?.title || 'Payment Terms & Conditions'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Full payment terms and conditions document
            </DialogDescription>
          </DialogHeader>
          
          {activePaymentTerm && (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {/* Format the full_text with numbered points */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {(() => {
                  // Split by double newlines to get paragraphs
                  const paragraphs = activePaymentTerm.full_text.split(/\n\n+/);
                  
                  // Filter out empty paragraphs and trim
                  const allPoints = paragraphs
                    .map(p => p.trim())
                    .filter(p => p.length > 0);
                  
                  // Number each point sequentially
                  return allPoints.map((point, index) => (
                    <div key={index} className="flex gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {point}
                      </p>
                    </div>
                  ));
                })()}
              </div>
              
              {/* Additional Info */}
              {activePaymentTerm.version && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Version:</strong> {activePaymentTerm.version}</p>
                    {activePaymentTerm.effective_from && (
                      <p><strong>Effective From:</strong> {new Date(activePaymentTerm.effective_from).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              onClick={() => setIsTermsModalOpen(false)}
            >
              Close
            </Button>
            {!termsAccepted && (
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    // Set checkbox state immediately (before API call)
                    setTermsAccepted(true);
                    
                    // Check the checkbox by calling the handler (this initiates OTP)
                    await handleTermsCheckboxChange(true);
                    
                    // Close the Payment Terms modal first
                    setIsTermsModalOpen(false);
                    
                    // Wait for OTP section to appear in main modal and state to update
                    // Increased timeout to account for animation and state updates
                    await new Promise(resolve => setTimeout(resolve, 600));
                    
                    // Scroll to OTP section in the main modal
                    const otpSection = document.getElementById('otp-verification-section');
                    if (otpSection) {
                      // Scroll the element into view
                      otpSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                      });
                      
                      // Add a highlight effect
                      otpSection.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all');
                      setTimeout(() => {
                        otpSection.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all');
                      }, 2000);
                    }
                  } catch (error) {
                    // If there's an error, reset checkbox state and don't close the modal
                    setTermsAccepted(false);
                    console.error('Error accepting terms:', error);
                  }
                }}
                className="bg-primary"
                disabled={isAcceptingDocument}
              >
                {isAcceptingDocument ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
            )}
            {termsAccepted && (
              <Button
                variant="default"
                onClick={() => setIsTermsModalOpen(false)}
                className="bg-primary"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Already Accepted
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

