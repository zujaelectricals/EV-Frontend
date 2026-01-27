import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, Calendar, Wallet, Users, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addBooking, updateBooking } from '@/app/slices/bookingSlice';
import { updatePreBooking } from '@/app/slices/authSlice';
import { addPayout } from '@/app/slices/payoutSlice';
import { useAddReferralNodeMutation } from '@/app/api/binaryApi';
import { useCreateBookingMutation, useMakePaymentMutation } from '@/app/api/bookingApi';
import { toast } from 'sonner';
import { Scooter } from '../ScooterCard';
import { PaymentGateway } from './PaymentGateway';
import { StockDetailResponse } from '@/app/api/inventoryApi';

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

export function PreBookingModal({ scooter, isOpen, onClose, referralCode, stockData }: PreBookingModalProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [addReferralNode] = useAddReferralNodeMutation();
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();
  const [makePayment, { isLoading: isMakingPayment }] = useMakePaymentMutation();
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  // Use ref to prevent duplicate submissions (refs update synchronously)
  const isSubmittingRef = useRef(false);
  const [preBookingAmount, setPreBookingAmount] = useState(500);
  const [inputValue, setInputValue] = useState('500'); // Local state for input field
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'emi' | 'flexible'>('full');
  const [selectedEMI, setSelectedEMI] = useState<string>('12');
  const [selectedTenure, setSelectedTenure] = useState<number>(12);
  const [referralCodeInput, setReferralCodeInput] = useState(referralCode || '');
  const [joinDistributorProgram, setJoinDistributorProgram] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  
  // Delivery address fields
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPin, setDeliveryPin] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Selected vehicle color and battery variant
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedBatteryVariant, setSelectedBatteryVariant] = useState<string>('');
  
  // Store booking response
  const [bookingResponse, setBookingResponse] = useState<any>(null);

  // Sync inputValue when preBookingAmount changes externally
  useEffect(() => {
    setInputValue(preBookingAmount.toString());
  }, [preBookingAmount]);

  // Reset booking response and submission state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBookingResponse(null);
      setIsBookingInProgress(false);
      isSubmittingRef.current = false;
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
        // If booking already exists, just open payment gateway
        setShowPaymentGateway(true);
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

    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
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
        referral_code: referralCodeInput.trim() || undefined,
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
      
      // Open payment gateway after successful booking
      // Keep isSubmittingRef true until payment is processed to prevent duplicate bookings
      setShowPaymentGateway(true);
      
      // Don't reset ref here - keep it true until payment completes or modal closes
    } catch (error: any) {
      console.error('🔴 [PRE-BOOK] Booking API Error:', error);
      const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
      // Reset submission state on error
      isSubmittingRef.current = false;
      setIsBookingInProgress(false);
    }
  };

  // Handle viewing Booking Terms PDF
  const handleViewBookingTerms = () => {
    window.open('/Booking_Terms.pdf', '_blank');
  };

  // Handle downloading Booking Terms PDF
  const handleDownloadBookingTerms = () => {
    const link = document.createElement('a');
    link.href = '/Booking_Terms.pdf';
    link.download = 'Booking_Terms.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Booking Terms PDF download started');
  };

  const handlePaymentSuccess = async (paymentGatewayRef?: string) => {
    if (!stockData || !bookingResponse) {
      toast.error('Booking details not available. Please refresh the page.');
      return;
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

      // Calculate EMI details if selected
      let emiPlan = undefined;
      if (paymentMethod === 'emi' && selectedTenure) {
        const interest = Math.round(remainingAmount * 0.08); // 8% interest
        const totalWithInterest = remainingAmount + interest;
        const monthlyAmount = Math.round(totalWithInterest / selectedTenure);
        
        emiPlan = {
          id: `emi-${selectedTenure}`,
          months: selectedTenure,
          monthlyAmount: monthlyAmount,
          interestRate: 8,
          totalAmount: totalWithInterest,
        };
      }

      // Create local booking object from API response
      let localBooking = {
        id: booking.id.toString(),
        vehicleId: scooter.id,
        vehicleName: scooter.name,
        status: 'pre-booked' as const,
        preBookingAmount: parseFloat(booking.booking_amount),
        totalAmount: parseFloat(booking.total_amount),
        remainingAmount: parseFloat(booking.remaining_amount),
        totalPaid: parseFloat(booking.total_paid),
        paymentMethod,
        emiPlan,
        paymentDueDate: booking.expires_at,
        paymentStatus: 'partial' as const,
        isActiveBuyer: true,
        redemptionPoints,
        redemptionEligible: false,
        bookedAt: booking.created_at,
        referredBy: booking.referred_by || undefined,
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
        successMessage += ' You can now apply for the Distributor Program from your profile.';
      }
      toast.success(successMessage);
      
      // Reset submission state after successful payment
      isSubmittingRef.current = false;
      setIsBookingInProgress(false);
      
      onClose();
    } catch (error: any) {
      console.error('🔴 [PAYMENT] Payment Processing Error:', error);
      const errorMessage = error?.data?.detail || error?.data?.message || 'Failed to process payment. Please try again.';
      toast.error(errorMessage);
      // Reset submission state on payment error
      isSubmittingRef.current = false;
      setIsBookingInProgress(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Pre-Book {scooter.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Pre-booking form for {scooter.name}. Fill in your details to complete the pre-booking.
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-6">
          {/* Info Alert */}
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Pre-Booking Benefits
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Minimum ₹{MIN_PRE_BOOKING.toLocaleString()} to pre-book and become an Active Buyer</li>
                  <li>30 days to pay remaining amount</li>
                  <li>Pre-book at least ₹{DISTRIBUTOR_ELIGIBILITY_AMOUNT.toLocaleString()} to be eligible for Distributor Program</li>
                  <li>After 1 year, ₹{DISTRIBUTOR_ELIGIBILITY_AMOUNT.toLocaleString()} (if pre-booked) can be redeemed as points at partner shops</li>
                  <li>Excess amount (above ₹{DISTRIBUTOR_ELIGIBILITY_AMOUNT.toLocaleString()}) will be refunded after tax deductions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pre-Booking Amount */}
          <div className="space-y-2">
            <Label htmlFor="preBookingAmount" className="text-base font-semibold">
              Pre-Booking Amount (Minimum ₹{MIN_PRE_BOOKING.toLocaleString()})
              {!isDistributorEligible && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pre-book at least ₹{DISTRIBUTOR_ELIGIBILITY_AMOUNT.toLocaleString()} to be eligible for Distributor Program
                </p>
              )}
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
              className="text-lg"
            />
            {preBookingAmount < MIN_PRE_BOOKING && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Minimum amount is ₹{MIN_PRE_BOOKING.toLocaleString()}
              </p>
            )}
            {preBookingAmount > totalAmount && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Pre-booking amount cannot exceed vehicle price (₹{totalAmount.toLocaleString()})
              </p>
            )}
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
            <Input
              id="referralCode"
              placeholder="Enter referral code"
              value={referralCodeInput}
              onChange={(e) => setReferralCodeInput(e.target.value)}
            />
            {referralCodeInput && (
              <p className="text-xs text-muted-foreground">
                Referrer will get ₹{REFERRAL_BONUS.toLocaleString()} bonus (after TDS)
              </p>
            )}
          </div>

          {/* Vehicle Color Selection */}
          {stockData && stockData.vehicle_colors && stockData.vehicle_colors.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="vehicleColor" className="text-base font-semibold">
                Vehicle Color <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {stockData.vehicle_colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-primary bg-primary/10 font-semibold'
                        : 'border-border hover:border-primary/50'
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
            <div className="space-y-2">
              <Label htmlFor="batteryVariant" className="text-base font-semibold">
                Battery Variant <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {stockData.battery_variants.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedBatteryVariant(variant)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedBatteryVariant === variant
                        ? 'border-primary bg-primary/10 font-semibold'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-foreground">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryCity" className="text-sm">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deliveryCity"
                  placeholder="Enter city"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryState" className="text-sm">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deliveryState"
                  placeholder="Enter state"
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deliveryPin" className="text-sm">
                  PIN Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deliveryPin"
                  placeholder="Enter 6-digit PIN code"
                  value={deliveryPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setDeliveryPin(value);
                  }}
                  maxLength={6}
                  required
                />
                {deliveryPin && !/^\d{6}$/.test(deliveryPin) && (
                  <p className="text-xs text-destructive">
                    Please enter a valid 6-digit PIN code
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccepted"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  required
                />
                <Label
                  htmlFor="termsAccepted"
                  className="text-sm cursor-pointer leading-relaxed"
                >
                  I accept the terms and conditions <span className="text-destructive">*</span>
                </Label>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleViewBookingTerms}
                  className="h-8 w-8 flex-shrink-0"
                  title="View Booking Terms"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleDownloadBookingTerms}
                  className="h-8 w-8 flex-shrink-0"
                  title="Download Booking Terms"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!termsAccepted && (
              <p className="text-xs text-destructive ml-6">
                You must accept the terms and conditions to proceed
              </p>
            )}
          </div>

          {/* Join Distribution Program Section */}
          {isDistributorEligible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-5 bg-success/10 border-2 border-success/30 rounded-xl space-y-4"
            >
              {!joinDistributorProgram ? (
                // Show simple opt-in option when eligible but not opted in
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="joinDistributor"
                    checked={joinDistributorProgram}
                    onCheckedChange={(checked) => setJoinDistributorProgram(checked as boolean)}
                  />
                  <Label
                    htmlFor="joinDistributor"
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-success" />
                    Yes, I want to join the distribution program
                  </Label>
                  <Badge className="bg-success text-success-foreground ml-auto">Eligible</Badge>
                </div>
              ) : (
                // Show full eligibility form when user opts in
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Join Distribution Program</h3>
                    <Badge className="bg-success text-success-foreground">Eligible</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    With a booking of ₹{DISTRIBUTOR_ELIGIBILITY_AMOUNT.toLocaleString()} or more, you can join our distribution program and earn commissions!
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span>Earn commissions on referrals</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span>Access to exclusive distributor portal</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span>Priority support and training</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-success/20">
                    <Checkbox
                      id="joinDistributor"
                      checked={joinDistributorProgram}
                      onCheckedChange={(checked) => setJoinDistributorProgram(checked as boolean)}
                    />
                    <Label
                      htmlFor="joinDistributor"
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-success" />
                      Yes, I want to join the distribution program
                    </Label>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Payment Summary */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <h3 className="font-semibold text-foreground">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle Price</span>
                <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pre-Booking Amount</span>
                <span className="font-medium">₹{preBookingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Amount</span>
                <span className="font-medium">₹{remainingAmount.toLocaleString()}</span>
              </div>
              {excessAmount > 0 && (
                <>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Excess Amount (Refundable)</span>
                      <span>₹{excessAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tax & Deductions (15%)</span>
                      <span>-₹{taxAndDeductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-1">
                      <span>Net Refund</span>
                      <span>₹{refundableAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
              <div className="pt-2 border-t border-border/50">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Redemption Points (After 1 year)</span>
                  <span className="font-medium">
                    {redemptionPoints > 0 ? `${redemptionPoints.toLocaleString()} points` : 'Not eligible'}
                  </span>
                </div>
                {redemptionPoints === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Pre-book at least ₹{DISTRIBUTOR_ELIGIBILITY_AMOUNT.toLocaleString()} to be eligible
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Method for Remaining Amount</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
              <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-colors ${
                paymentMethod === 'full' ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="font-medium">Full Payment</div>
                  <div className="text-sm text-muted-foreground">
                    Pay ₹{remainingAmount.toLocaleString()} within 30 days
                  </div>
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-colors ${
                paymentMethod === 'emi' ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value="emi" id="emi" />
                <Label htmlFor="emi" className="flex-1 cursor-pointer">
                  <div className="font-medium">EMI Options</div>
                  <div className="text-sm text-muted-foreground">
                    Flexible monthly installments
                  </div>
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-colors ${
                paymentMethod === 'flexible' ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value="flexible" id="flexible" />
                <Label htmlFor="flexible" className="flex-1 cursor-pointer">
                  <div className="font-medium">Flexible Payment</div>
                  <div className="text-sm text-muted-foreground">
                    Custom payment schedule (if unable to pay within 30 days)
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {/* Flexible Payment Warning */}
            {paymentMethod === 'flexible' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-warning/10 border border-warning/30 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground mb-1">Important Notice</p>
                    <p className="text-muted-foreground">
                      If payment is not completed within 30 days from the pre-booking date, the vehicle price may vary based on current market conditions. The final amount will be calculated at the time of payment completion.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* EMI Tenure Selection */}
          {paymentMethod === 'emi' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <Label className="text-base font-semibold">Select Tenure</Label>
              <div className="grid grid-cols-3 gap-3">
                {[12, 18, 24].map((months) => {
                  const interest = Math.round(remainingAmount * 0.08); // 8% interest
                  const totalWithInterest = remainingAmount + interest;
                  const finalMonthly = Math.round(totalWithInterest / months);
                  
                  return (
                    <button
                      key={months}
                      type="button"
                      onClick={() => {
                        setSelectedEMI(months.toString());
                        setSelectedTenure(months);
                      }}
                      className={`p-4 border rounded-xl transition-all text-left ${
                        selectedEMI === months.toString()
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold text-foreground mb-1">{months} Months</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{finalMonthly.toLocaleString()}/month
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Total: ₹{totalWithInterest.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Important Notes */}
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-warning mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-foreground mb-1">Payment Due Date</p>
                <p className="text-muted-foreground">
                  {paymentDueDate.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                {paymentMethod === 'flexible' ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    If payment is not completed within 30 days, the vehicle price may vary based on current market conditions.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    If payment is not completed within 30 days, flexible payment options will be available.
                  </p>
                )}
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
                preBookingAmount < MIN_PRE_BOOKING ||
                !selectedColor ||
                !selectedBatteryVariant ||
                !deliveryCity.trim() ||
                !deliveryState.trim() ||
                !deliveryPin.trim() ||
                !/^\d{6}$/.test(deliveryPin.trim()) ||
                !termsAccepted ||
                !stockData
              }
            >
              {isCreatingBooking || isBookingInProgress ? 'Processing...' : 'Pre-Book Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Payment Gateway Modal */}
    <PaymentGateway
      isOpen={showPaymentGateway}
      onClose={() => setShowPaymentGateway(false)}
      amount={preBookingAmount}
      onSuccess={handlePaymentSuccess}
      vehicleName={scooter.name}
    />
    </>
  );
}

