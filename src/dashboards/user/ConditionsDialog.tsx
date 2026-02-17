import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, XCircle, Phone, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useSendOTPMutation, useVerifyOTPMutation } from '@/app/api/otpApi';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';

interface ConditionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (data: {
    incentiveConsent: boolean;
    declarationAccepted: boolean;
    refundPolicyAccepted: boolean;
    otpVerified: boolean;
  }) => void;
}

export function ConditionsDialog({ isOpen, onClose, onAccept }: ConditionsDialogProps) {
  const { user } = useAppSelector((state) => state.auth);
  
  // Auto-fetch phone number from user profile, use mock data if not available
  const getUserPhoneNumber = useCallback((): string => {
    // Try to get from user profile
    if (user?.phone) {
      // Remove any non-digit characters and ensure it's 10 digits
      const cleaned = user.phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned;
      }
      // If it's longer, take last 10 digits
      if (cleaned.length > 10) {
        return cleaned.slice(-10);
      }
    }
    
    // Use mock data if user phone is not available
    // Different mock numbers for different user types
    const mockPhones: Record<string, string> = {
      'admin@zuja.com': '9497279195',
      'staff@zuja.com': '9497279196',
      'distributor@zuja.com': '9497279197',
      'user@zuja.com': '9497279195',
    };
    
    return mockPhones[user?.email || ''] || '9497279195'; // Default mock phone
  }, [user]);

  const [mobileNumber, setMobileNumber] = useState(() => getUserPhoneNumber());
  const [incentiveConsent, setIncentiveConsent] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const [sendOTP] = useSendOTPMutation();
  const [verifyOTP] = useVerifyOTPMutation();

  // Update mobile number when user changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      const phone = getUserPhoneNumber();
      setMobileNumber(phone);
      // Reset OTP state when dialog opens
      setOtp('');
      setOtpSent(false);
      setOtpVerified(false);
      setIncentiveConsent(false);
      setDeclarationAccepted(false);
      setRefundPolicyAccepted(false);
    }
  }, [isOpen, user, getUserPhoneNumber]);

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSendingOTP(true);
    try {
      const result = await sendOTP({ mobileNumber }).unwrap();
      setOtpSent(true);
      toast.success('OTP sent successfully!');
      // In development, show OTP in console
      if (result.otp) {
        console.log(`[DEV] OTP for ${mobileNumber}: ${result.otp}`);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to send OTP';
      toast.error(errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifyingOTP(true);
    try {
      await verifyOTP({ mobileNumber, otp }).unwrap();
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleAccept = () => {
    if (!incentiveConsent && !declarationAccepted && !refundPolicyAccepted) {
      toast.error('Please accept at least one condition');
      return;
    }

    if (!otpVerified) {
      toast.error('Please verify OTP before accepting conditions');
      return;
    }

    onAccept({
      incentiveConsent,
      declarationAccepted,
      refundPolicyAccepted,
      otpVerified: true,
    });
    onClose();
  };

  const canAccept = (incentiveConsent || declarationAccepted || refundPolicyAccepted) && otpVerified;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms & Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept the following conditions to proceed with your application
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="english" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="malayalam">Malayalam</TabsTrigger>
          </TabsList>

          {/* English Section */}
          <TabsContent value="english" className="space-y-6 mt-4">
            {/* ASA(Authorized Sales Associate) Incentive Consent */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h3 className="font-semibold text-lg">ASA(Authorized Sales Associate) Incentive → Vehicle Installment Consent</h3>
              <div className="space-y-3 text-sm">
                <p>
                  I am working as an ASA(Authorized Sales Associate) at <strong>ZUJA Electric Scooter</strong>,
                  and I hereby authorize that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>👉 20% of my Eligible Incentives / Bonuses</li>
                  <li>👉 Will be automatically transferred to "Vehicle Incentive Wallet"</li>
                  <li>👉 For use in vehicle installment payments</li>
                </ul>
              </div>
              
              <RadioGroup
                value={incentiveConsent ? 'yes' : 'no'}
                onValueChange={(value) => setIncentiveConsent(value === 'yes')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="yes" id="incentive-yes-en" />
                  <label htmlFor="incentive-yes-en" className="cursor-pointer flex-1">
                    <div className="font-medium">☐ YES – I AUTHORIZE</div>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="no" id="incentive-no-en" />
                  <label htmlFor="incentive-no-en" className="cursor-pointer flex-1">
                    <div className="font-medium">☐ NO – I WILL PAY SEPARATELY</div>
                  </label>
                </div>
              </RadioGroup>
              
              <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-sm">
                  <strong>Important Clarification:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>This 20% amount is NOT a commission reduction</li>
                    <li>This is a Vehicle Purchase Incentive Conversion</li>
                    <li>Cash payout + Vehicle incentive will be clearly shown in the account</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            {/* Declaration */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">Declaration</h3>
              <div className="space-y-3 text-sm">
                <p>
                  I have read and understood all the information provided above and
                  I voluntarily give my consent.
                </p>
                <p>
                  I acknowledge that this is an Incentive Scheme and
                  it is NOT an investment or guaranteed income.
                </p>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="declaration-en"
                  checked={declarationAccepted}
                  onCheckedChange={(checked) => setDeclarationAccepted(checked === true)}
                />
                <label htmlFor="declaration-en" className="cursor-pointer flex-1 text-sm">
                  I accept the above declaration and agree to the terms and conditions *
                </label>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="space-y-4 p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                Refund Policy – Vehicle Payment
              </h3>
              
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-base mb-3">❗ Non-Refundable Payment Declaration</h4>
                <p className="text-sm mb-3">
                  I clearly understand that any amount paid for the vehicle (Advance / Full Payment / Installment / Incentive Conversion)
                  is NON-REFUNDABLE under any circumstances.
                </p>
                <p className="text-sm font-medium mb-2">👉 In case of:</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4 mb-3">
                  <li>Booking cancellation</li>
                  <li>ASA(Authorized Sales Associate) activity termination</li>
                  <li>No network incentive received</li>
                  <li>Personal reasons for abandoning purchase</li>
                </ul>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  I have no right to claim a refund of the paid amount.
                </p>
              </div>

              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border-2 border-red-300 dark:border-red-700">
                <h4 className="font-semibold text-base mb-3">Final Declaration</h4>
                <p className="text-sm mb-3">
                  I have fully read and understood this Non-Refund Policy and voluntarily give my consent.
                  I will not raise any legal claims related to this in the future.
                </p>
                
                <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                  <Checkbox
                    id="refund-policy-en"
                    checked={refundPolicyAccepted}
                    onCheckedChange={(checked) => setRefundPolicyAccepted(checked === true)}
                    className="border-red-600 data-[state=checked]:bg-red-600"
                  />
                  <label htmlFor="refund-policy-en" className="cursor-pointer flex-1 text-sm">
                    <span className="font-semibold">I understand and accept the Non-Refundable Policy *</span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Malayalam Section */}
          <TabsContent value="malayalam" className="space-y-6 mt-4">
            {/* ASA(Authorized Sales Associate) Incentive Consent */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h3 className="font-semibold text-lg">🔹 ASA(Authorized Sales Associate) Incentive → Vehicle Installment Consent</h3>
              <div className="space-y-3 text-sm">
                <p>
                  ഞാൻ <strong>ZUJA Electric Scooter</strong> /<br />
                  എന്ന സ്ഥാപനത്തിലെ ASA(Authorized Sales Associate) ആയി പ്രവർത്തിക്കുന്നതിനാൽ,
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>👉 എനിക്ക് ലഭിക്കുന്ന Eligible Incentives / Bonuses ല്‍ നിന്നും</li>
                  <li>👉 20% തുക "Vehicle Incentive Wallet" ലേക്ക്</li>
                  <li>👉 വാഹനത്തിന്റെ തവണ അടവിന് ഉപയോഗിക്കുന്നതിനായി</li>
                  <li>ഓട്ടോമാറ്റിക്കായി മാറ്റുന്നതിന് ഞാൻ സമ്മതം നൽകുന്നു.</li>
                </ul>
              </div>
              
              <RadioGroup
                value={incentiveConsent ? 'yes' : 'no'}
                onValueChange={(value) => setIncentiveConsent(value === 'yes')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="yes" id="incentive-yes-ml" />
                  <label htmlFor="incentive-yes-ml" className="cursor-pointer flex-1">
                    <div className="font-medium">☐ YES – I AUTHORIZE</div>
                  </label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                  <RadioGroupItem value="no" id="incentive-no-ml" />
                  <label htmlFor="incentive-no-ml" className="cursor-pointer flex-1">
                    <div className="font-medium">☐ NO – I WILL PAY SEPARATELY</div>
                  </label>
                </div>
              </RadioGroup>
              
              <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-sm">
                  <strong>Important Clarification:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>ഈ 20% തുക കമ്മീഷൻ കുറവ് അല്ല</li>
                    <li>ഇത് Vehicle Purchase Incentive Conversion ആകുന്നു</li>
                    <li>Cash payout + Vehicle incentive തെളിവായി അക്കൗണ്ടിൽ കാണിക്കും</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            {/* Declaration */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold text-lg">🔹 Declaration</h3>
              <div className="space-y-3 text-sm">
                <p>
                  ഞാൻ മുകളിൽ നൽകിയ വിവരങ്ങൾ മുഴുവനും വായിച്ചും മനസ്സിലാക്കിയും
                  സ്വമേധയാ സമ്മതം നൽകുന്നതാണ്.
                </p>
                <p>
                  ഇത് ഒരു പ്രോത്സാഹന പദ്ധതി (Incentive Scheme) ആണെന്നും
                  നിക്ഷേപമോ ഗ്യാരണ്ടി വരുമാനമോ അല്ല എന്നും ഞാൻ അംഗീകരിക്കുന്നു.
                </p>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="declaration-ml"
                  checked={declarationAccepted}
                  onCheckedChange={(checked) => setDeclarationAccepted(checked === true)}
                />
                <label htmlFor="declaration-ml" className="cursor-pointer flex-1 text-sm">
                  ഞാൻ മുകളിലെ declaration സ്വീകരിക്കുകയും terms and conditions-ന് സമ്മതിക്കുകയും ചെയ്യുന്നു *
                </label>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="space-y-4 p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                🔴 Refund Policy – Vehicle Payment
              </h3>
              
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-base mb-3">❗ Non-Refundable Payment Declaration</h4>
                <p className="text-sm mb-3">
                  വാഹനത്തിനായി അടയ്ക്കുന്ന ഏതൊരു തുകയും (Advance / Full Payment / Installment / Incentive Conversion)
                  എന്ത് സാഹചര്യത്തിലായാലും തിരികെ നൽകുന്നതല്ല (NON-REFUNDABLE) എന്ന് ഞാൻ വ്യക്തമായി മനസ്സിലാക്കുന്നു.
                </p>
                <p className="text-sm font-medium mb-2">👉 വാഹനത്തിന്റെ</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4 mb-3">
                  <li>ബുക്കിംഗ് റദ്ദാക്കിയാൽ</li>
                  <li>ഡിസ്ട്രിബ്യൂട്ടർ പ്രവർത്തനം നിർത്തിയാൽ</li>
                  <li>നെറ്റ്‌വർക്ക് ഇൻസന്റീവ് ലഭിക്കാതിരുന്നാൽ</li>
                  <li>വ്യക്തിപരമായ കാരണങ്ങളാൽ വാങ്ങൽ ഉപേക്ഷിച്ചാൽ</li>
                </ul>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  അടച്ച തുക തിരികെ ആവശ്യപ്പെടാൻ എനിക്ക് അവകാശമില്ല.
                </p>
              </div>

              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border-2 border-red-300 dark:border-red-700">
                <h4 className="font-semibold text-base mb-3">🔹 Final Declaration</h4>
                <p className="text-sm mb-3">
                  ഞാൻ ഈ Non-Refund Policy പൂർണ്ണമായി വായിച്ചും
                  മനസ്സിലാക്കിയും സ്വമേധയാ സമ്മതം നൽകുന്നതാണ്.
                  ഭാവിയിൽ ഇതുമായി ബന്ധപ്പെട്ട് നിയമനടപടികൾക്ക് ഞാൻ അവകാശവാദം ഉന്നയിക്കില്ല.
                </p>
                
                <div className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                  <Checkbox
                    id="refund-policy-ml"
                    checked={refundPolicyAccepted}
                    onCheckedChange={(checked) => setRefundPolicyAccepted(checked === true)}
                    className="border-red-600 data-[state=checked]:bg-red-600"
                  />
                  <label htmlFor="refund-policy-ml" className="cursor-pointer flex-1 text-sm">
                    <span className="font-semibold">ഞാൻ Non-Refundable Policy മനസ്സിലാക്കി സമ്മതിക്കുന്നു *</span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* OTP Verification Section */}
        <div className="space-y-4 p-4 border-2 border-primary rounded-lg bg-primary/5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">OTP Verification</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Mobile Number</Label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobileNumber(value);
                    // Reset OTP state if number changes
                    if (value.length !== 10) {
                      setOtpSent(false);
                      setOtpVerified(false);
                      setOtp('');
                    }
                  }}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className="flex-1"
                />
              </div>
              {mobileNumber && mobileNumber.length === 10 && (
                <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                  ✓ Valid mobile number
                </p>
              )}
              {mobileNumber && mobileNumber.length > 0 && mobileNumber.length < 10 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Please enter a valid 10-digit mobile number
                </p>
              )}
            </div>

            {!otpSent ? (
              <Button
                onClick={handleSendOTP}
                disabled={!mobileNumber || mobileNumber.length !== 10 || isSendingOTP}
                className="w-full"
              >
                {isSendingOTP ? 'Sending...' : 'Send OTP'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Enter OTP</Label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
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

                {otpVerified ? (
                  <Alert className="bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800">
                    <CheckCircle className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    <AlertDescription className="text-pink-700 dark:text-pink-300">
                      OTP verified successfully!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || isVerifyingOTP}
                      className="flex-1"
                    >
                      {isVerifyingOTP ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSendOTP}
                      disabled={isSendingOTP}
                    >
                      Resend
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!canAccept}
            className="bg-primary"
          >
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

