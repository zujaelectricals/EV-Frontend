import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, User, Mail, Phone, MapPin, CreditCard, Image as ImageIcon, Car, DollarSign, FileCheck } from 'lucide-react';
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
import { updateDistributorInfo, updateUser } from '@/app/slices/authSlice';
import { toast } from 'sonner';
import { scooters } from '@/store/data/scooters';
import { 
  useSubmitDistributorApplicationMutation, 
  useGetDistributorApplicationQuery 
} from '@/app/api/distributorApi';
import { ConditionsDialog } from './ConditionsDialog';

export function DistributorApplication() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { bookings } = useAppSelector((state) => state.booking);
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
    distributorId: '',
    mobileNumber: '',
    signature: null as File | null,
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
  const [isConditionsDialogOpen, setIsConditionsDialogOpen] = useState(false);
  const [conditionsAccepted, setConditionsAccepted] = useState({
    incentiveConsent: false,
    declarationAccepted: false,
    refundPolicyAccepted: false,
    otpVerified: false,
  });
  const [submitApplication] = useSubmitDistributorApplicationMutation();
  const { data: existingApplication } = useGetDistributorApplicationQuery(user?.id || '', {
    skip: !user?.id,
  });

  // Check if user is eligible (has pre-booked with at least ₹5000)
  // First check preBookingInfo, then fallback to bookings if preBookingInfo is missing
  const hasEligiblePreBooking = user?.preBookingInfo?.hasPreBooked && 
                                 (user.preBookingInfo.isDistributorEligible || 
                                  (user.preBookingInfo.preBookingAmount && user.preBookingInfo.preBookingAmount >= 5000));
  
  // Fallback: Check bookings if preBookingInfo is not available or doesn't show eligibility
  const hasEligibleBooking = bookings.some(booking => booking.preBookingAmount >= 5000);
  
  const isEligible = hasEligiblePreBooking || hasEligibleBooking;
  
  // Debug: Log eligibility status
  console.log('Distributor Eligibility Check:', {
    hasPreBooked: user?.preBookingInfo?.hasPreBooked,
    preBookingAmount: user?.preBookingInfo?.preBookingAmount,
    isDistributorEligible: user?.preBookingInfo?.isDistributorEligible,
    hasEligiblePreBooking,
    hasEligibleBooking,
    bookingsCount: bookings.length,
    bookingsPreBookingAmounts: bookings.map(b => b.preBookingAmount),
    isEligible,
  });

  // Check if already a distributor
  const isDistributor = user?.isDistributor;
  const verificationStatus = user?.distributorInfo?.verificationStatus || existingApplication?.status;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'aadhar' | 'pan' | 'bankStatement', file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.vehicleModel || !formData.vehicleMRP || !formData.bookingOrderNo) {
      toast.error('Please fill all vehicle selection details');
      setIsSubmitting(false);
      return;
    }

    if (!formData.vehicleImage) {
      toast.error('Please upload vehicle image');
      setIsSubmitting(false);
      return;
    }

    if (formData.paymentMode === 'installment') {
      if (!formData.advancePaid || !formData.balanceAmount || !formData.installmentAmount) {
        toast.error('Please fill all payment details for installment mode');
        setIsSubmitting(false);
        return;
      }
    }

    // Validate conditions acceptance
    if (!conditionsAccepted.otpVerified) {
      toast.error('Please accept terms & conditions and verify OTP');
      setIsSubmitting(false);
      return;
    }

    if (!conditionsAccepted.declarationAccepted && !conditionsAccepted.refundPolicyAccepted) {
      toast.error('Please accept at least the declaration or refund policy in terms & conditions');
      setIsSubmitting(false);
      return;
    }

    if (!formData.applicantName || !formData.distributorId || !formData.mobileNumber || !formData.signature || !formData.place) {
      toast.error('Please fill all applicant details including signature, date, and place');
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit application using API with userId
      const result = await submitApplication({
        ...formData,
        incentiveConsent: conditionsAccepted.incentiveConsent,
        declarationAccepted: conditionsAccepted.declarationAccepted,
        refundPolicyAccepted: conditionsAccepted.refundPolicyAccepted,
        userId: user?.id || `user-${Date.now()}`,
      }).unwrap();
      
      if (result.success) {
        // Generate referral code
        const referralCode = `REF${user?.id.slice(0, 6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Update user with distributor application
        dispatch(updateDistributorInfo({
          isDistributor: false, // Will be true after verification
          isVerified: false,
          verificationStatus: 'pending',
          referralCode,
          leftCount: 0,
          rightCount: 0,
          totalReferrals: 0,
          binaryActivated: false,
          poolMoney: 0,
          joinedAt: new Date().toISOString(),
        }));

        dispatch(updateUser({
          isDistributor: false, // Will be true after verification
        }));

        toast.success('Application submitted successfully! Your application is under review.');
        
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
          applicantName: '',
          distributorId: '',
          mobileNumber: '',
          signature: null,
          date: new Date().toISOString().split('T')[0],
          place: '',
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
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to profile if already a distributor (verified or approved)
  const isVerifiedDistributor = isDistributor && (verificationStatus === 'approved' || user?.distributorInfo?.isVerified);
  if (isVerifiedDistributor) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Distributor Status: Active
            </CardTitle>
            <CardDescription>
              Your distributor account is active. Visit your profile to access distributor options and manage your distributor account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => window.location.href = '/profile?tab=distributor'} className="w-full">
              Go to Distributor Profile
            </Button>
            <Button onClick={() => window.location.href = '/distributor'} variant="outline" className="w-full">
              Go to Distributor Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Distributor Program</CardTitle>
            <CardDescription>Join our distributor program and earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to pre-book an EV vehicle with at least ₹5,000 to become eligible for the Distributor Program.
                {user?.preBookingInfo?.hasPreBooked && (
                  <p className="mt-2 text-sm">
                    Your current pre-booking amount is ₹{user.preBookingInfo.preBookingAmount.toLocaleString()}. 
                    Please pre-book with at least ₹5,000 to be eligible.
                  </p>
                )}
                {bookings.length > 0 && bookings.some(b => b.preBookingAmount < 5000) && (
                  <p className="mt-2 text-sm">
                    You have bookings, but none with a pre-booking amount of ₹5,000 or more. 
                    Please pre-book a vehicle with at least ₹5,000 to be eligible.
                  </p>
                )}
                <div className="mt-4">
                  <Button onClick={() => window.location.href = '/scooters'}>
                    Browse Vehicles
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 🛵 Vehicle Selection Details */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <Car className="w-5 h-5" />
                🛵 Vehicle Selection Details
              </h3>
              
              {/* Vehicle Image Upload */}
              <div className="space-y-2">
                <Label>Vehicle Image *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {formData.vehicleImage ? (
                    <div className="space-y-2">
                      <img 
                        src={URL.createObjectURL(formData.vehicleImage)} 
                        alt="Vehicle" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">{formData.vehicleImage.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, vehicleImage: null }));
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            setFormData(prev => ({ ...prev, vehicleImage: file }));
                          }
                        }}
                        className="hidden"
                        id="vehicle-image-upload"
                      />
                      <label htmlFor="vehicle-image-upload" className="cursor-pointer">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('vehicle-image-upload')?.click();
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Vehicle Image
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Vehicle Model Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Model Name *</Label>
                  <Select
                    value={formData.vehicleModel}
                    onValueChange={(value) => {
                      const selectedScooter = scooters.find(s => s.id === value);
                      setFormData(prev => ({
                        ...prev,
                        vehicleModel: value,
                        vehicleMRP: selectedScooter ? selectedScooter.price.toString() : prev.vehicleMRP
                      }));
                    }}
                    required
                  >
                    <SelectTrigger id="vehicleModel">
                      <SelectValue placeholder="Select Vehicle Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {scooters.map((scooter) => (
                        <SelectItem key={scooter.id} value={scooter.id}>
                          {scooter.name} - ₹{scooter.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleMRP">MRP (₹) *</Label>
                  <Input
                    id="vehicleMRP"
                    type="number"
                    value={formData.vehicleMRP}
                    onChange={(e) => handleInputChange('vehicleMRP', e.target.value)}
                    placeholder="Enter MRP"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bookingOrderNo">Booking / Purchase Order No *</Label>
                  <Input
                    id="bookingOrderNo"
                    value={formData.bookingOrderNo}
                    onChange={(e) => handleInputChange('bookingOrderNo', e.target.value)}
                    placeholder="Enter Booking/Purchase Order Number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 🔹 Payment Mode Selection */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                🔹 Payment Mode Selection (✔ tick applicable option)
              </h3>
              
              <RadioGroup
                value={formData.paymentMode}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMode: value as 'full' | 'installment' }))}
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
            </div>

            {/* 💰 Payment Details */}
            {formData.paymentMode === 'installment' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  💰 Payment Details
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advancePaid">Advance Paid (₹) *</Label>
                    <Input
                      id="advancePaid"
                      type="number"
                      value={formData.advancePaid}
                      onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                      placeholder="Enter advance amount"
                      required={formData.paymentMode === 'installment'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balanceAmount">Balance Amount (₹) *</Label>
                    <Input
                      id="balanceAmount"
                      type="number"
                      value={formData.balanceAmount}
                      onChange={(e) => handleInputChange('balanceAmount', e.target.value)}
                      placeholder="Enter balance amount"
                      required={formData.paymentMode === 'installment'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installmentMode">Installment Mode *</Label>
                    <Select
                      value={formData.installmentMode}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, installmentMode: value as 'monthly' | 'weekly' }))}
                      required={formData.paymentMode === 'installment'}
                    >
                      <SelectTrigger id="installmentMode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installmentAmount">Installment Amount (₹) *</Label>
                    <Input
                      id="installmentAmount"
                      type="number"
                      value={formData.installmentAmount}
                      onChange={(e) => handleInputChange('installmentAmount', e.target.value)}
                      placeholder="Enter installment amount"
                      required={formData.paymentMode === 'installment'}
                    />
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> വാഹനത്തിന്റെ മൊത്തം തുക പൂർണ്ണമായതിനു ശേഷം മാത്രമേ വാഹനം ഡെലിവറി ചെയ്യുകയുള്ളൂ.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Terms & Conditions Section */}
            <div className="space-y-4 p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Terms & Conditions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please read and accept the terms & conditions to proceed
                  </p>
                </div>
                <Button
                  type="button"
                  variant={conditionsAccepted.otpVerified ? "outline" : "default"}
                  onClick={() => setIsConditionsDialogOpen(true)}
                >
                  {conditionsAccepted.otpVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Conditions Accepted
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Accept Terms & Conditions
                    </>
                  )}
                </Button>
              </div>
              
              {conditionsAccepted.otpVerified && (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <strong>✓ Terms & Conditions Accepted</strong>
                    <br />
                    <span className="text-xs">
                      Incentive Consent: {conditionsAccepted.incentiveConsent ? 'Yes' : 'No'} | 
                      Declaration: {conditionsAccepted.declarationAccepted ? 'Accepted' : 'Not Accepted'} | 
                      Refund Policy: {conditionsAccepted.refundPolicyAccepted ? 'Accepted' : 'Not Accepted'} | 
                      OTP: Verified
                    </span>
                  </AlertDescription>
                </Alert>
              )}
            </div>

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
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distributorId">Distributor ID *</Label>
                  <Input
                    id="distributorId"
                    value={formData.distributorId}
                    onChange={(e) => handleInputChange('distributorId', e.target.value)}
                    placeholder="Enter Distributor ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="Enter mobile number"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
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
                <div className="space-y-2 md:col-span-2">
                  <Label>Signature *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {formData.signature ? (
                      <div className="space-y-2">
                        <img 
                          src={URL.createObjectURL(formData.signature)} 
                          alt="Signature" 
                          className="max-h-32 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">{formData.signature.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, signature: null }));
                          }}
                        >
                          Remove Signature
                        </Button>
                      </div>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              setFormData(prev => ({ ...prev, signature: file }));
                            }
                          }}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label htmlFor="signature-upload" className="cursor-pointer">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById('signature-upload')?.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Signature
                          </Button>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ✍ Applicant Confirmation */}
              <div className="mt-6 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                <h4 className="font-semibold text-base mb-4">✍ Applicant Confirmation</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Applicant Signature</Label>
                    <div className="p-3 border rounded-lg bg-background text-sm text-muted-foreground min-h-[40px] flex items-center">
                      {formData.signature ? '✓ Signature Uploaded' : 'Signature required above'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="p-3 border rounded-lg bg-background text-sm min-h-[40px] flex items-center">
                      {formData.date || 'Not set'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Place</Label>
                    <div className="p-3 border rounded-lg bg-background text-sm min-h-[40px] flex items-center">
                      {formData.place || 'Not set'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  By signing above, I confirm that all information provided is true and accurate.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isSubmitting || !conditionsAccepted.otpVerified}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
            {!conditionsAccepted.otpVerified && (
              <p className="text-sm text-muted-foreground text-center">
                Please accept Terms & Conditions and verify OTP to submit
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Conditions Dialog */}
      <ConditionsDialog
        isOpen={isConditionsDialogOpen}
        onClose={() => setIsConditionsDialogOpen(false)}
        onAccept={(data) => {
          setConditionsAccepted(data);
          toast.success('Terms & Conditions accepted and OTP verified!');
        }}
      />
    </div>
  );
}

