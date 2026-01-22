import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, User, Mail, Phone, FileCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateDistributorInfo, updateUser, setCredentials } from '@/app/slices/authSlice';
import { toast } from 'sonner';
import { 
  useSubmitDistributorApplicationNewMutation,
  useSubmitDistributorApplicationMutation, 
  useGetDistributorApplicationQuery 
} from '@/app/api/distributorApi';
import { Booking } from '@/app/slices/bookingSlice';
import { KYCModal } from '@/components/KYCModal';
import { useGetBookingsQuery } from '@/app/api/bookingApi';
import { useSendUniversalOTPMutation, useVerifyUniversalOTPMutation } from '@/app/api/authApi';
import { useGetUserProfileQuery } from '@/app/api/userApi';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export function DistributorApplication() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { bookings: reduxBookings } = useAppSelector((state) => state.booking);
  
  // Fetch user profile to ensure KYC status is up-to-date on page refresh
  const { data: profileData, refetch: refetchUserProfile } = useGetUserProfileQuery();
  
  // Use profileData if available (from API), otherwise fallback to Redux user state
  // This ensures we have the latest KYC status even on page refresh
  const currentUser = profileData || user;
  
  // Update Redux state when profile data is fetched
  useEffect(() => {
    if (profileData) {
      console.log('📋 [DISTRIBUTOR APPLICATION] Profile data received, updating Redux state:', profileData);
      dispatch(setCredentials({ user: profileData }));
    }
  }, [profileData, dispatch]);
  
  // Fetch bookings from API instead of relying on Redux state
  const { data: bookingsData } = useGetBookingsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  });
  
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Vehicle Selection Details
    vehicleImage: null as File | null,
    vehicleModel: '',
    vehicleMRP: '',
    bookingOrderNo: '',
    
    // Payment Mode
    paymentMode: 'full' as 'full' | 'installment',
    
    // Payment Details
    advancePaid: '',
    balanceAmount: '',
    installmentMode: 'monthly' as 'monthly' | 'weekly',
    installmentAmount: '',
    
    
    // Applicant Details
    applicantName: '',
    mobileNumber: '',
    date: new Date().toISOString().split('T')[0],
    place: '',
    
    // Additional KYC (if needed)
    aadharNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [documents, setDocuments] = useState({
    aadhar: null as File | null,
    pan: null as File | null,
    bankStatement: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conditionsAccepted, setConditionsAccepted] = useState({
    incentiveConsent: false,
    declarationAccepted: false,
    refundPolicyAccepted: false,
    otpVerified: false,
  });
  const [submitApplication] = useSubmitDistributorApplicationMutation();
  const [submitApplicationNew] = useSubmitDistributorApplicationNewMutation();
  const { data: existingApplication } = useGetDistributorApplicationQuery(currentUser?.id || '', {
    skip: !currentUser?.id,
  });
  const [userOrders, setUserOrders] = useState<Booking[]>([]);
  
  // Terms & Conditions and OTP state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [sendUniversalOTP] = useSendUniversalOTPMutation();
  const [verifyUniversalOTP] = useVerifyUniversalOTPMutation();
  
  // Determine identifier (email or mobile) and OTP type
  const getIdentifier = () => {
    if (user?.email) return user.email;
    if (user?.phone) return user.phone.replace(/\D/g, '');
    return '';
  };
  
  const getOtpType = (): 'email' | 'mobile' => {
    const identifier = getIdentifier();
    // Check if it's an email (contains @) or mobile (only digits)
    return identifier.includes('@') ? 'email' : 'mobile';
  };

  // Auto-fill applicant details from user profile (uneditable)
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        applicantName: currentUser.name || '',
        mobileNumber: currentUser.phone || currentUser.email?.replace(/[^0-9]/g, '').slice(-10) || '',
        date: new Date().toISOString().split('T')[0],
        place: currentUser.address || currentUser.city || '',
      }));
    }
  }, [currentUser]);
  
  // Handle Terms & Conditions checkbox change
  const handleTermsCheckboxChange = async (checked: boolean) => {
    setTermsAccepted(checked);
    
    if (checked) {
      // Send OTP when checkbox is checked
      const identifier = getIdentifier();
      const otpType = getOtpType();
      
      if (!identifier) {
        toast.error('Email or mobile number not found in profile');
        setTermsAccepted(false);
        return;
      }
      
      setIsSendingOTP(true);
      try {
        await sendUniversalOTP({
          identifier,
          otp_type: otpType,
        }).unwrap();
        setOtpSent(true);
        toast.success(`OTP sent to your ${otpType === 'email' ? 'email' : 'mobile number'}`);
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to send OTP');
        setTermsAccepted(false);
      } finally {
        setIsSendingOTP(false);
      }
    } else {
      // Reset OTP state when unchecked
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode('');
      setConditionsAccepted(prev => ({ ...prev, otpVerified: false }));
    }
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
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
      await verifyUniversalOTP({
        identifier,
        otp_code: otpCode,
        otp_type: otpType,
      }).unwrap();
      setOtpVerified(true);
      setConditionsAccepted(prev => ({ ...prev, otpVerified: true }));
      toast.success('OTP verified successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Use API bookings data, fallback to Redux bookings
  // Bookings should come from the backend API, not localStorage
  const apiBookings = bookingsData?.results || [];
  const bookings = reduxBookings.length > 0 ? reduxBookings : apiBookings;
  
  // Map API bookings to local booking format (same as MyOrders.tsx)
  useEffect(() => {
    if (!bookingsData?.results) {
      setUserOrders([]);
      return;
    }
    
    const mappedBookings = bookingsData.results.map((apiBooking) => {
      // Map API status to display status
      let displayStatus: Booking['status'] = 'pending';
      if (apiBooking.status === 'pending') {
        displayStatus = 'pre-booked';
      } else if (apiBooking.status === 'active' || apiBooking.status === 'confirmed') {
        displayStatus = 'confirmed';
      } else if (apiBooking.status === 'delivered') {
        displayStatus = 'delivered';
      } else if (apiBooking.status === 'cancelled') {
        displayStatus = 'cancelled';
      }
      
      return {
        id: apiBooking.id.toString(),
        vehicleId: `vehicle-${apiBooking.vehicle_details.name?.toLowerCase().replace(/\s+/g, '-') || 'vehicle'}-${apiBooking.vehicle_model}`,
        vehicleName: apiBooking.vehicle_details.name,
        modelCode: apiBooking.model_code,
        status: displayStatus,
        preBookingAmount: parseFloat(apiBooking.booking_amount) || 0,
        totalAmount: parseFloat(apiBooking.total_amount) || 0,
        remainingAmount: parseFloat(apiBooking.remaining_amount) || 0,
        totalPaid: parseFloat(apiBooking.total_paid) || 0,
        paymentMethod: (apiBooking.payment_option === 'full_payment' ? 'full' : 
                      apiBooking.payment_option === 'emi' ? 'emi' : 'flexible') as Booking['paymentMethod'],
        paymentDueDate: apiBooking.expires_at,
        paymentStatus: (parseFloat(apiBooking.remaining_amount) === 0 ? 'completed' : 
                      parseFloat(apiBooking.total_paid) > 0 ? 'partial' : 'pending') as Booking['paymentStatus'],
        isActiveBuyer: true,
        redemptionPoints: 0,
        redemptionEligible: false,
        bookedAt: apiBooking.created_at,
        referredBy: apiBooking.referred_by || undefined,
        addedToTeamNetwork: false,
        bookingNumber: apiBooking.booking_number,
        vehicleColor: apiBooking.vehicle_color,
        batteryVariant: apiBooking.battery_variant,
      };
    });
    
    // Deduplicate bookings by ID
    const deduplicatedBookings = mappedBookings.filter((booking, index, self) => 
      index === self.findIndex(b => b.id === booking.id)
    );
    
    setUserOrders(deduplicatedBookings);
  }, [bookingsData]);


  // Eligibility check: No ₹5000 requirement, no active buyer requirement
  // Anyone can become a distributor (KYC verification is still required)
  const isEligible = true; // Always eligible - no pre-booking or payment requirements
  
  // Check KYC verification status
  // If kyc_status is null from API, treat it as 'not_submitted'
  // Handle both 'verified' and 'approved' as verified states
  const kycStatus = currentUser?.kycStatus === null ? 'not_submitted' : (currentUser?.kycStatus || 'not_submitted');
  const isKYCVerified = kycStatus === 'verified' || kycStatus === 'approved';
  
  // Debug: Log eligibility status
  console.log('Distributor Eligibility Check:', {
    bookingsCount: bookings.length,
    apiBookingsCount: apiBookings.length,
    reduxBookingsCount: reduxBookings.length,
    isEligible,
    kycStatus: currentUser?.kycStatus,
  });

  // Check if already a distributor
  const isDistributor = currentUser?.isDistributor;
  const verificationStatus = currentUser?.distributorInfo?.verificationStatus || existingApplication?.status;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updates: any = { [field]: value };
      
      // Auto-calculate balance amount when MRP or advance paid changes in installment mode
      if (prev.paymentMode === 'installment') {
        if (field === 'vehicleMRP' || field === 'advancePaid') {
          const mrp = field === 'vehicleMRP' ? parseFloat(value) : parseFloat(prev.vehicleMRP);
          const advance = field === 'advancePaid' ? parseFloat(value) : parseFloat(prev.advancePaid);
          
          if (!isNaN(mrp) && !isNaN(advance) && mrp >= advance) {
            updates.balanceAmount = (mrp - advance).toString();
          } else if (!isNaN(mrp) && !isNaN(advance) && advance > mrp) {
            updates.balanceAmount = '0';
          } else {
            updates.balanceAmount = '';
          }
        }
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleFileUpload = (field: 'aadhar' | 'pan' | 'bankStatement', file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate KYC verification
    if (!isKYCVerified) {
      toast.error('KYC verification is required to submit the distributor application. Please complete your KYC verification first.');
      setIsSubmitting(false);
      navigate('/profile?tab=kyc');
      return;
    }

    // Validate terms acceptance and OTP verification
    if (!termsAccepted) {
      toast.error('Please accept Terms & Conditions');
      setIsSubmitting(false);
      return;
    }
    
    if (!otpVerified) {
      toast.error('Please verify OTP before submitting');
      setIsSubmitting(false);
      return;
    }

    if (!formData.applicantName || !formData.mobileNumber || !formData.place) {
      toast.error('Please fill all applicant details including name, mobile number, and place');
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit application using new API endpoint
      const result = await submitApplicationNew({
        is_distributor_terms_and_conditions_accepted: termsAccepted,
      }).unwrap();
      
      console.log('📥 [DISTRIBUTOR APPLICATION] API Response:', result);
      
      // Check if application was approved
      if (result.status === 'approved') {
        toast.success('Congratulations! Your distributor application has been approved!');
        
        // Fetch user profile again to get updated distributor status
        try {
          const profileResult = await refetchUserProfile();
          const updatedProfile = profileResult.data;
          
          if (!updatedProfile) {
            throw new Error('Failed to fetch updated profile');
          }
          
          console.log('📥 [DISTRIBUTOR APPLICATION] Updated profile after approval:', updatedProfile);
          
          // Update Redux state with new profile data
          dispatch(setCredentials({ user: updatedProfile }));
          
          // Check if user is now a distributor
          if (updatedProfile.isDistributor) {
            toast.success('Distributor privileges have been activated! You now have access to distributor features.');
            
            // Update distributor info in Redux
            dispatch(updateDistributorInfo({
              isDistributor: true,
              isVerified: true,
              verificationStatus: 'approved',
              referralCode: currentUser?.distributorInfo?.referralCode || '',
              leftCount: currentUser?.distributorInfo?.leftCount || 0,
              rightCount: currentUser?.distributorInfo?.rightCount || 0,
              totalReferrals: currentUser?.distributorInfo?.totalReferrals || 0,
              binaryActivated: currentUser?.distributorInfo?.binaryActivated || false,
              poolMoney: currentUser?.distributorInfo?.poolMoney || 0,
              joinedAt: currentUser?.distributorInfo?.joinedAt || new Date().toISOString(),
            }));

            dispatch(updateUser({
              isDistributor: true,
            }));
          }
        } catch (profileError) {
          console.error('Error fetching updated profile:', profileError);
          toast.warning('Application approved, but failed to fetch updated profile. Please refresh the page.');
        }
      } else if (result.status === 'pending') {
        toast.success('Application submitted successfully! Your application is under review.');
      } else if (result.status === 'rejected') {
        toast.error(`Application rejected: ${result.rejection_reason || 'Please contact support for more information.'}`);
      }
      
      // Reset form
      setFormData({
        vehicleImage: null,
        vehicleModel: '',
        vehicleMRP: '',
        bookingOrderNo: '',
        paymentMode: 'full',
        advancePaid: '',
        balanceAmount: '',
        installmentMode: 'monthly',
        installmentAmount: '',
        applicantName: currentUser?.name || '',
        mobileNumber: currentUser?.phone || currentUser?.email?.replace(/[^0-9]/g, '').slice(-10) || '',
        date: new Date().toISOString().split('T')[0],
        place: currentUser?.address || currentUser?.city || '',
        aadharNumber: '',
        panNumber: '',
        bankAccountNumber: '',
        ifscCode: '',
        bankName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      });
      setConditionsAccepted({
        incentiveConsent: false,
        declarationAccepted: false,
        refundPolicyAccepted: false,
        otpVerified: false,
      });
      setDocuments({ aadhar: null, pan: null, bankStatement: null });
      setTermsAccepted(false);
      setOtpCode('');
      setOtpSent(false);
      setOtpVerified(false);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error?.data?.message || error?.data?.detail || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to profile if already a distributor
  // Only check isDistributor flag - this is the primary indicator of distributor status
  // Other flags like isVerified or verificationStatus might be set for KYC but not for distributor status
  const isVerifiedDistributor = isDistributor === true;
  if (isVerifiedDistributor) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="min-h-[250px] sm:min-h-[300px] flex flex-col">
          <CardHeader className="pb-4 sm:pb-6 p-4 sm:p-6">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-lg sm:text-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                <span className="break-words">Authorized Partner Status: Active</span>
              </div>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Your authorized partner account is active. Visit your profile to access authorized partner options and manage your authorized partner account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto p-4 sm:p-6 pt-0">
            <Button 
              onClick={() => window.location.href = '/profile?tab=distributor'} 
              className="w-full sm:w-1/2 text-sm sm:text-base"
            >
              Go to Authorized Partner Profile
            </Button>
            <Button 
              onClick={() => window.location.href = '/distributor'} 
              variant="outline" 
              className="w-full sm:w-1/2 text-sm sm:text-base"
            >
              Go to Authorized Partner Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check KYC verification - show warning if not verified or approved
  // Only show KYC button if status is not_submitted, pending, rejected, or verified
  // If status is 'approved', skip KYC requirement and show distributor form directly
  if (!isKYCVerified && kycStatus !== 'approved') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              KYC Verification Required
            </CardTitle>
            <CardDescription>
              Complete your KYC verification to apply for the Distributor Program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">KYC verification is required to become a Distributor.</p>
                <p className="mb-3 text-sm">
                  You need to complete your KYC verification to proceed with the distributor application.
                </p>
                {kycStatus === 'not_submitted' && (
                  <p className="mb-3 text-sm">
                    Please upload your PAN and Aadhar documents for verification.
                  </p>
                )}
                {kycStatus === 'pending' && (
                  <p className="mb-3 text-sm">
                    Your KYC verification is currently under review. Please wait for approval before submitting the distributor application.
                  </p>
                )}
                {kycStatus === 'rejected' && (
                  <p className="mb-3 text-sm">
                    Your KYC verification was rejected. Please resubmit your documents with correct information.
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => {
                      console.log('🔵 [KYC BUTTON] Clicked, opening modal...');
                      setIsKYCModalOpen(true);
                      console.log('🟢 [KYC BUTTON] Modal state set to true');
                    }} 
                    className="mt-2"
                    size="lg"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {kycStatus === 'not_submitted' && 'Complete KYC Verification'}
                    {kycStatus === 'pending' && 'View KYC Status'}
                    {kycStatus === 'rejected' && 'Resubmit KYC Documents'}
                    {kycStatus === 'verified' && 'Update KYC Verification'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* KYC Modal */}
        <KYCModal
          isOpen={isKYCModalOpen}
          onClose={() => setIsKYCModalOpen(false)}
        />
      </div>
    );
  }

  // Check application status from API
  const applicationStatus = existingApplication?.status || verificationStatus;

  if (applicationStatus === 'pending' || verificationStatus === 'pending') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Application Under Review
            </CardTitle>
            <CardDescription>
              Your distributor application is being reviewed by our team. You will be notified once the verification is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Status:</strong> Pending Approval
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Our staff team is reviewing your application and documents. This usually takes 2-3 business days.
                </p>
                {existingApplication && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted on: {new Date(existingApplication.submittedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (applicationStatus === 'rejected' || verificationStatus === 'rejected') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Application Rejected
            </CardTitle>
            <CardDescription>
              Your distributor application was not approved. Please review the requirements and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your application was rejected. Please ensure all documents are clear and valid, then resubmit.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => {
                dispatch(updateDistributorInfo({
                  verificationStatus: undefined,
                }));
              }}>
                Apply Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🔹 APPLICATION FORM – VEHICLE PURCHASE & INCENTIVE CONSENT</CardTitle>
          <CardDescription className="text-base">
            വാഹന വാങ്ങൽ & പ്രോത്സാഹന സമ്മതം അപേക്ഷാ ഫോം
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Eligibility Status Banner */}
          {isEligible && isKYCVerified ? (
            <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="font-semibold text-success">You are eligible to apply!</p>
                  <p className="text-sm text-muted-foreground">
                    KYC verification is complete. You can proceed with your distributor application.
                  </p>
                </div>
              </div>
            </div>
          ) : !isKYCVerified ? (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <p className="font-semibold text-warning">KYC Verification Required</p>
                  <p className="text-sm text-muted-foreground">
                    Please complete your KYC verification to proceed with the distributor application.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsKYCModalOpen(true)}
                  >
                    Complete KYC Verification
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Terms & Conditions Section */}
            <div className="space-y-4 p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5" />
                <h3 className="font-semibold text-lg text-foreground">
                  Terms & Conditions
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Please read and accept the terms & conditions to proceed
              </p>
              
              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="terms-checkbox"
                  checked={termsAccepted}
                  onCheckedChange={handleTermsCheckboxChange}
                  disabled={isSendingOTP}
                />
                <label htmlFor="terms-checkbox" className="cursor-pointer flex-1 text-sm">
                  I understand and accept the Terms & Conditions *
                </label>
              </div>
              
              {/* OTP Verification Section */}
              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-4 p-4 border-2 border-primary rounded-lg bg-primary/5 mt-4"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-base">OTP Verification</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Gentle message instead of input box */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          OTP has been sent to your registered Mobile and Email
                        </p>
                      </div>
                    </motion.div>

                    {otpVerified ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <AlertDescription className="text-green-700 dark:text-green-300">
                            OTP verified successfully!
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                        className="space-y-4"
                      >
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
                              disabled={otpVerified}
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
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {termsAccepted && !otpSent && isSendingOTP && (
                <p className="text-sm text-muted-foreground mt-2">Sending OTP...</p>
              )}
            </div>

            {/* 🔹 Payment Mode Selection - COMMENTED OUT */}
            {/* <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                🔹 Payment Mode Selection (✔ tick applicable option)
              </h3>
              
              <RadioGroup
                value={formData.paymentMode}
                onValueChange={(value) => {
                  const newPaymentMode = value as 'full' | 'installment';
                  setFormData(prev => {
                    const updates: any = { paymentMode: newPaymentMode };
                    
                    // Auto-fill advance paid amount when selecting installment mode
                    if (newPaymentMode === 'installment' && prev.bookingOrderNo) {
                      const selectedOrder = userOrders.find(order => order.id === prev.bookingOrderNo);
                      if (selectedOrder && selectedOrder.preBookingAmount) {
                        updates.advancePaid = selectedOrder.preBookingAmount.toString();
                        
                        // Auto-calculate balance amount
                        const mrp = parseFloat(prev.vehicleMRP);
                        const advance = selectedOrder.preBookingAmount;
                        if (!isNaN(mrp) && mrp >= advance) {
                          updates.balanceAmount = (mrp - advance).toString();
                        } else if (!isNaN(mrp) && advance > mrp) {
                          updates.balanceAmount = '0';
                        }
                      }
                    }
                    
                    return { ...prev, ...updates };
                  });
                }}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="full" id="full-payment" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="full-payment" className="cursor-pointer">
                      <div className="font-medium">☐ Full Payment</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ഞാൻ വാഹനത്തിന്റെ മുഴുവൻ തുകയും ഒരുമിച്ച് അടയ്ക്കുന്നു.
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="installment" id="installment-payment" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="installment-payment" className="cursor-pointer">
                      <div className="font-medium">☐ Advance + Installments</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ഞാൻ അഡ്വാൻസ് തുകയും ശേഷിക്കുന്ന തുകയും തവണകളായി അടയ്ക്കുന്നു.
                      </div>
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </div> */}

            {/* 🖊 Applicant Details */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                🖊 Applicant Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Applicant Name *</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName}
                    readOnly
                    className="bg-muted"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    readOnly
                    className="bg-muted"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    readOnly
                    className="bg-muted"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Place *</Label>
                  <Input
                    id="place"
                    value={formData.place}
                    onChange={(e) => handleInputChange('place', e.target.value)}
                    placeholder="Enter place"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isSubmitting || !termsAccepted || !otpVerified || (!isKYCVerified && kycStatus !== 'approved')}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
            {!isKYCVerified && kycStatus !== 'approved' && (
              <p className="text-sm text-destructive text-center">
                KYC verification is required. Please complete your KYC verification to submit the application.
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-destructive underline ml-1"
                  onClick={() => navigate('/profile?tab=kyc')}
                >
                  Complete KYC
                </Button>
              </p>
            )}
            {!termsAccepted && (
              <p className="text-sm text-muted-foreground text-center">
                Please accept Terms & Conditions to proceed
              </p>
            )}
            {termsAccepted && !otpVerified && (
              <p className="text-sm text-muted-foreground text-center">
                Please verify OTP to submit
              </p>
            )}
          </form>
        </CardContent>
      </Card>


      {/* KYC Modal */}
      <KYCModal
        isOpen={isKYCModalOpen}
        onClose={() => setIsKYCModalOpen(false)}
      />
    </div>
  );
}

