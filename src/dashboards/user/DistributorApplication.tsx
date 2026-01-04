import { useState, useEffect } from 'react';
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
import { Booking } from '@/app/slices/bookingSlice';

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
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Booking[]>([]);

  // Auto-fill applicant details from user profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        applicantName: user.name || prev.applicantName,
        mobileNumber: user.phone || user.email?.replace(/[^0-9]/g, '').slice(-10) || prev.mobileNumber,
        place: user.address || user.city || prev.place,
      }));
    }
  }, [user]);

  // Sync bookings to local storage and load user orders
  useEffect(() => {
    const storageKey = `user_orders_${user?.id || 'guest'}`;
    
    // Save bookings to local storage whenever bookings change
    if (bookings.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(bookings));
        setUserOrders(bookings);
      } catch (error) {
        console.error('Error saving orders to local storage:', error);
      }
    } else {
      // Try to load from local storage if no bookings in Redux
      try {
        const storedOrders = localStorage.getItem(storageKey);
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          setUserOrders(parsedOrders);
        }
      } catch (error) {
        console.error('Error loading orders from local storage:', error);
      }
    }
  }, [bookings, user?.id]);

  // Function to convert image URL to File
  const urlToFile = async (url: string, filename: string): Promise<File | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      return file;
    } catch (error) {
      console.error('Error converting image URL to File:', error);
      return null;
    }
  };

  // Check if user is eligible (has paid at least ₹5000 in total)
  // Use totalPaid if available, otherwise fallback to preBookingAmount for backward compatibility
  const userTotalPaid = user?.preBookingInfo?.totalPaid || user?.preBookingInfo?.preBookingAmount || 0;
  const hasEligiblePreBooking = user?.preBookingInfo?.hasPreBooked && 
                                 (user.preBookingInfo.isDistributorEligible || 
                                  userTotalPaid >= 5000);
  
  // Fallback: Check bookings if preBookingInfo is not available or doesn't show eligibility
  // Use totalPaid if available, otherwise fallback to preBookingAmount
  const hasEligibleBooking = bookings.some(booking => {
    const bookingTotalPaid = booking.totalPaid || booking.preBookingAmount || 0;
    return bookingTotalPaid >= 5000;
  });
  
  const isEligible = hasEligiblePreBooking || hasEligibleBooking;
  
  // Debug: Log eligibility status
  console.log('Distributor Eligibility Check:', {
    hasPreBooked: user?.preBookingInfo?.hasPreBooked,
    preBookingAmount: user?.preBookingInfo?.preBookingAmount,
    totalPaid: user?.preBookingInfo?.totalPaid,
    userTotalPaid,
    isDistributorEligible: user?.preBookingInfo?.isDistributorEligible,
    hasEligiblePreBooking,
    hasEligibleBooking,
    bookingsCount: bookings.length,
    bookingsTotalPaid: bookings.map(b => b.totalPaid || b.preBookingAmount),
    isEligible,
  });

  // Check if already a distributor
  const isDistributor = user?.isDistributor;
  const verificationStatus = user?.distributorInfo?.verificationStatus || existingApplication?.status;

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

    // Validate eligibility: total paid must be at least ₹5000
    if (!isEligible || userTotalPaid < 5000) {
      toast.error(`You need to pay a total of at least ₹5,000 to submit the distributor application. Your current total paid is ₹${userTotalPaid.toLocaleString()}.`);
      setIsSubmitting(false);
      return;
    }

    // Validate required fields
    if (!formData.vehicleModel || !formData.vehicleMRP || !formData.bookingOrderNo) {
      toast.error('Please fill all vehicle selection details');
      setIsSubmitting(false);
      return;
    }

    // Validate that the selected model matches the booking order's vehicle
    const selectedOrder = userOrders.find(order => order.id === formData.bookingOrderNo);
    if (selectedOrder) {
      if (selectedOrder.vehicleId !== formData.vehicleModel) {
        const selectedScooter = scooters.find(s => s.id === formData.vehicleModel);
        const orderScooter = scooters.find(s => s.id === selectedOrder.vehicleId);
        toast.error(
          `Model mismatch: Selected model "${selectedScooter?.name || formData.vehicleModel}" does not match the booking order vehicle "${selectedOrder.vehicleName || orderScooter?.name || selectedOrder.vehicleId}". Please select the correct model or booking order.`
        );
        setIsSubmitting(false);
        return;
      }
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

    if (!formData.applicantName || !formData.mobileNumber || !formData.place) {
      toast.error('Please fill all applicant details including name, mobile number, and place');
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

        // Update user with distributor application status
        dispatch(updateDistributorInfo({
          isDistributor: false, // Will be true after verification
          isVerified: false,
          verificationStatus: 'pending',
          referralCode: user?.distributorInfo?.referralCode || referralCode,
          leftCount: user?.distributorInfo?.leftCount || 0,
          rightCount: user?.distributorInfo?.rightCount || 0,
          totalReferrals: user?.distributorInfo?.totalReferrals || 0,
          binaryActivated: user?.distributorInfo?.binaryActivated || false,
          poolMoney: user?.distributorInfo?.poolMoney || 0,
          joinedAt: user?.distributorInfo?.joinedAt || new Date().toISOString(),
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
          applicantName: user?.name || '',
          mobileNumber: user?.phone || user?.email?.replace(/[^0-9]/g, '').slice(-10) || '',
          date: new Date().toISOString().split('T')[0],
          place: user?.address || user?.city || '',
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
        setVehicleImagePreview(null);
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
        <Card className="min-h-[300px] flex flex-col">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Distributor Status: Active
            </CardTitle>
            <CardDescription>
              Your distributor account is active. Visit your profile to access distributor options and manage your distributor account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 mt-auto pb-6">
            <Button onClick={() => window.location.href = '/profile?tab=distributor'} className="w-1/2">
              Go to Distributor Profile
            </Button>
            <Button onClick={() => window.location.href = '/distributor'} variant="outline" className="w-1/2">
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
                You need to pay a total of at least ₹5,000 for your vehicle booking to become eligible for the Distributor Program.
                {user?.preBookingInfo?.hasPreBooked && (
                  <p className="mt-2 text-sm">
                    Your current total amount paid is ₹{(user.preBookingInfo.totalPaid || user.preBookingInfo.preBookingAmount || 0).toLocaleString()}. 
                    You need to pay a total of ₹5,000 to be eligible. 
                    {userTotalPaid < 5000 && (
                      <span className="block mt-1">
                        You need to pay ₹{(5000 - userTotalPaid).toLocaleString()} more to become eligible.
                      </span>
                    )}
                  </p>
                )}
                {bookings.length > 0 && !hasEligibleBooking && (
                  <p className="mt-2 text-sm">
                    You have bookings, but none with a total paid amount of ₹5,000 or more. 
                    Please make additional payments to reach ₹5,000 total to be eligible.
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => window.location.href = '/scooters'}>
                    Browse Vehicles
                  </Button>
                  {user?.preBookingInfo?.hasPreBooked && userTotalPaid < 5000 && (
                    <Button onClick={() => window.location.href = '/profile?tab=orders'} variant="outline">
                      Make Payment
                    </Button>
                  )}
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

  // Check for model mismatch
  const selectedOrder = formData.bookingOrderNo ? userOrders.find(order => order.id === formData.bookingOrderNo) : null;
  const selectedScooter = formData.vehicleModel ? scooters.find(s => s.id === formData.vehicleModel) : null;
  const isModelMismatch = selectedOrder && selectedScooter && selectedOrder.vehicleId !== formData.vehicleModel;

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
          {isEligible && userTotalPaid >= 5000 ? (
            <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="font-semibold text-success">You are eligible to apply!</p>
                  <p className="text-sm text-muted-foreground">
                    Total amount paid: ₹{userTotalPaid.toLocaleString()} (Minimum required: ₹5,000)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <p className="font-semibold text-warning">Not yet eligible</p>
                  <p className="text-sm text-muted-foreground">
                    Current total paid: ₹{userTotalPaid.toLocaleString()}. You need to pay ₹{(5000 - userTotalPaid).toLocaleString()} more to be eligible.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = '/profile?tab=orders'}
                  >
                    Make Payment
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                  {(formData.vehicleImage || vehicleImagePreview) ? (
                    <div className="space-y-2">
                      <img 
                        src={formData.vehicleImage ? URL.createObjectURL(formData.vehicleImage) : vehicleImagePreview || ''} 
                        alt="Vehicle" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      {formData.vehicleImage && (
                        <p className="text-sm text-muted-foreground">{formData.vehicleImage.name}</p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, vehicleImage: null }));
                          setVehicleImagePreview(null);
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
                            setVehicleImagePreview(null);
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
                    onValueChange={async (value) => {
                      const selectedScooter = scooters.find(s => s.id === value);
                      if (selectedScooter) {
                        // Auto-fill price and calculate balance if in installment mode
                        setFormData(prev => {
                          const updates: any = {
                            vehicleModel: value,
                            vehicleMRP: selectedScooter.price.toString()
                          };
                          
                          // Auto-calculate balance amount if in installment mode
                          if (prev.paymentMode === 'installment' && prev.advancePaid) {
                            const mrp = selectedScooter.price;
                            const advance = parseFloat(prev.advancePaid);
                            if (!isNaN(advance) && mrp >= advance) {
                              updates.balanceAmount = (mrp - advance).toString();
                            } else if (!isNaN(advance) && advance > mrp) {
                              updates.balanceAmount = '0';
                            }
                          }
                          
                          return { ...prev, ...updates };
                        });
                        
                        // Auto-fill image - convert URL to File and set preview
                        if (selectedScooter.image) {
                          setVehicleImagePreview(selectedScooter.image);
                          const imageFile = await urlToFile(selectedScooter.image, `${selectedScooter.name.toLowerCase().replace(/\s+/g, '-')}.jpg`);
                          if (imageFile) {
                            setFormData(prev => ({
                              ...prev,
                              vehicleImage: imageFile
                            }));
                          }
                        }
                      }
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
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bookingOrderNo">Booking / Purchase Order No *</Label>
                  <Select
                    value={formData.bookingOrderNo}
                    onValueChange={(value) => {
                      const selectedOrder = userOrders.find(order => order.id === value);
                      setFormData(prev => {
                        const updates: any = { bookingOrderNo: value };
                        
                        // Auto-fill advance paid amount if installment mode is selected
                        if (prev.paymentMode === 'installment' && selectedOrder && selectedOrder.preBookingAmount) {
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
                        
                        return { ...prev, ...updates };
                      });
                    }}
                    required
                  >
                    <SelectTrigger id="bookingOrderNo">
                      <SelectValue placeholder="Select Booking/Purchase Order Number" />
                    </SelectTrigger>
                    <SelectContent>
                      {userOrders.length > 0 ? (
                        userOrders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.id} - {order.vehicleName} (₹{order.totalAmount.toLocaleString()})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-orders" disabled>
                          No orders found. Please create a booking first.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {userOrders.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No orders available. Please make a booking first.
                    </p>
                  )}
                  {isModelMismatch && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Model Mismatch Warning:</strong> The selected model "{selectedScooter?.name || formData.vehicleModel}" does not match the booking order vehicle "{selectedOrder?.vehicleName}". Please select the correct model or booking order to proceed.
                      </AlertDescription>
                    </Alert>
                  )}
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
                      placeholder="Auto-calculated"
                      required={formData.paymentMode === 'installment'}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Calculated as: MRP - Advance Paid
                    </p>
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
              </div>

              {/* ✍ Applicant Confirmation */}
              <div className="mt-6 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                <h4 className="font-semibold text-base mb-4">✍ Applicant Confirmation</h4>
                <div className="grid md:grid-cols-2 gap-4">
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
                  By submitting this application, I confirm that all information provided is true and accurate.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isSubmitting || !conditionsAccepted.otpVerified || !isEligible || userTotalPaid < 5000}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
            {!conditionsAccepted.otpVerified && (
              <p className="text-sm text-muted-foreground text-center">
                Please accept Terms & Conditions and verify OTP to submit
              </p>
            )}
            {isEligible && userTotalPaid < 5000 && (
              <p className="text-sm text-warning text-center">
                You need to pay a total of ₹5,000 to submit the application. Current total paid: ₹{userTotalPaid.toLocaleString()}. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-warning underline ml-1"
                  onClick={() => window.location.href = '/profile?tab=orders'}
                >
                  Make Payment
                </Button>
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

