import { useState } from 'react';
import { Shield, Upload, X, AlertCircle } from 'lucide-react';
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
import { useSubmitKYCMutation, useGetUserProfileQuery } from '@/app/api/userApi';
import { toast } from 'sonner';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/app/slices/authSlice';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KYCModal({ isOpen, onClose }: KYCModalProps) {
  const dispatch = useAppDispatch();
  const [submitKYC, { isLoading }] = useSubmitKYCMutation();
  const { refetch: refetchProfile } = useGetUserProfileQuery();

  // Debug: Log when modal state changes
  console.log('🔵 [KYC MODAL] isOpen:', isOpen);

  const [formData, setFormData] = useState({
    pan_number: '',
    aadhaar_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
  });

  const [files, setFiles] = useState({
    pan_document: null as File | null,
    aadhaar_front: null as File | null,
    aadhaar_back: null as File | null,
    bank_passbook: null as File | null,
  });

  const [previews, setPreviews] = useState({
    pan_document: '',
    aadhaar_front: '',
    aadhaar_back: '',
    bank_passbook: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (
    field: keyof typeof files,
    file: File | null
  ) => {
    if (!file) {
      setFiles((prev) => ({ ...prev, [field]: null }));
      setPreviews((prev) => ({ ...prev, [field]: '' }));
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setFiles((prev) => ({ ...prev, [field]: file }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [field]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [field]: 'PDF file selected' }));
    }

    // Clear error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate PAN
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!formData.pan_number || !panRegex.test(formData.pan_number.toUpperCase())) {
      newErrors.pan_number = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }

    // Validate Aadhar
    const aadharRegex = /^\d{12}$/;
    if (!formData.aadhaar_number || !aadharRegex.test(formData.aadhaar_number.replace(/\s/g, ''))) {
      newErrors.aadhaar_number = 'Please enter a valid 12-digit Aadhar number';
    }

    // Validate required text fields
    if (!formData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    // Validate bank details
    if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required';
    if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required';
    if (!formData.ifsc_code.trim()) newErrors.ifsc_code = 'IFSC code is required';
    if (!formData.account_holder_name.trim()) {
      newErrors.account_holder_name = 'Account holder name is required';
    }

    // Validate files
    if (!files.pan_document) newErrors.pan_document = 'PAN document is required';
    if (!files.aadhaar_front) newErrors.aadhaar_front = 'Aadhar front is required';
    if (!files.aadhaar_back) newErrors.aadhaar_back = 'Aadhar back is required';
    if (!files.bank_passbook) newErrors.bank_passbook = 'Bank passbook is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 [KYC MODAL] Form submitted!');
    console.log('🔵 [KYC MODAL] Form data:', formData);
    console.log('🔵 [KYC MODAL] Files:', {
      pan_document: !!files.pan_document,
      aadhaar_front: !!files.aadhaar_front,
      aadhaar_back: !!files.aadhaar_back,
      bank_passbook: !!files.bank_passbook,
    });

    const isValid = validateForm();
    console.log('🔵 [KYC MODAL] Form validation result:', isValid);
    if (!isValid) {
      console.log('❌ [KYC MODAL] Validation failed, errors:', errors);
      toast.error('Please fill all required fields correctly');
      return;
    }

    console.log('🟢 [KYC MODAL] Validation passed, calling API...');
    try {
      console.log('🔵 [KYC MODAL] Calling submitKYC mutation...');
      const result = await submitKYC({
        pan_number: formData.pan_number.toUpperCase(),
        aadhaar_number: formData.aadhaar_number.replace(/\s/g, ''),
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || undefined,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        pan_document: files.pan_document!,
        aadhaar_front: files.aadhaar_front!,
        aadhaar_back: files.aadhaar_back!,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        account_holder_name: formData.account_holder_name,
        bank_passbook: files.bank_passbook!,
      }).unwrap();

      console.log('✅ [KYC MODAL] API call successful! Response:', result);
      toast.success(result.message || 'KYC documents submitted successfully');
      
      // Refetch profile to update KYC status
      console.log('🔄 [KYC MODAL] Refetching profile after KYC submission...');
      const profileResult = await refetchProfile(); 
      console.log('📥 [KYC MODAL] Profile refetch result:', profileResult);
      if (profileResult.data) {
        console.log('✅ [KYC MODAL] Updated profile data:', profileResult.data);
        dispatch(setCredentials({ user: profileResult.data }));
      }
      
      // Close modal and reset form
      onClose();
      resetForm();
    } catch (error: unknown) {
      console.error('❌ [KYC MODAL] API call failed!', error);
      
      // Type guard to check if it's a FetchBaseQueryError
      const isFetchBaseQueryError = (err: unknown): err is FetchBaseQueryError => {
        return typeof err === 'object' && err !== null && 'status' in err;
      };
      
      // Type guard to check if it's a SerializedError
      const isSerializedError = (err: unknown): err is SerializedError => {
        return typeof err === 'object' && err !== null && 'message' in err && !('status' in err);
      };
      
      let errorStatus: number | string | undefined;
      let errorData: unknown;
      let errorMessage = 'Failed to submit KYC documents';
      
      if (isFetchBaseQueryError(error)) {
        errorStatus = error.status;
        errorData = error.data;
        console.error('❌ [KYC MODAL] Error details:', {
          status: errorStatus,
          data: errorData,
        });
        
        // Try to extract message from error data
        if (errorData && typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = String(errorData.message);
        } else if (errorData) {
          errorMessage = String(errorData);
        }
      } else if (isSerializedError(error)) {
        errorMessage = error.message || 'Failed to submit KYC documents';
        console.error('❌ [KYC MODAL] Serialized error:', error);
      } else {
        console.error('❌ [KYC MODAL] Unknown error:', error);
      }
      
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      pan_number: '',
      aadhaar_number: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      account_holder_name: '',
    });
    setFiles({
      pan_document: null,
      aadhaar_front: null,
      aadhaar_back: null,
      bank_passbook: null,
    });
    setPreviews({
      pan_document: '',
      aadhaar_front: '',
      aadhaar_back: '',
      bank_passbook: '',
    });
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Complete KYC Verification
          </DialogTitle>
          <DialogDescription>
            Please fill in all the required fields and upload the necessary documents for KYC verification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PAN Details */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-lg">PAN Card Details</h3>
            <div className="space-y-2">
              <Label htmlFor="pan_number">
                PAN Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pan_number"
                placeholder="ABCDE1234F"
                value={formData.pan_number}
                onChange={(e) => handleInputChange('pan_number', e.target.value.toUpperCase())}
                maxLength={10}
                className="uppercase"
                disabled={isLoading}
              />
              {errors.pan_number && (
                <p className="text-sm text-destructive">{errors.pan_number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan_document">
                PAN Document <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pan_document"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={(e) => handleFileChange('pan_document', e.target.files?.[0] || null)}
                disabled={isLoading}
              />
              {errors.pan_document && (
                <p className="text-sm text-destructive">{errors.pan_document}</p>
              )}
              {previews.pan_document && (
                <div className="mt-2 border rounded-lg p-2">
                  {previews.pan_document.startsWith('data:') ? (
                    <img
                      src={previews.pan_document}
                      alt="PAN Preview"
                      className="max-h-32 object-contain w-full"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{previews.pan_document}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Aadhar Details */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-lg">Aadhar Card Details</h3>
            <div className="space-y-2">
              <Label htmlFor="aadhaar_number">
                Aadhar Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="aadhaar_number"
                placeholder="123456789012"
                value={formData.aadhaar_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                  handleInputChange('aadhaar_number', formatted);
                }}
                maxLength={14}
                disabled={isLoading}
              />
              {errors.aadhaar_number && (
                <p className="text-sm text-destructive">{errors.aadhaar_number}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaar_front">
                  Aadhar Front <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="aadhaar_front"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => handleFileChange('aadhaar_front', e.target.files?.[0] || null)}
                  disabled={isLoading}
                />
                {errors.aadhaar_front && (
                  <p className="text-sm text-destructive">{errors.aadhaar_front}</p>
                )}
                {previews.aadhaar_front && (
                  <div className="mt-2 border rounded-lg p-2">
                    {previews.aadhaar_front.startsWith('data:') ? (
                      <img
                        src={previews.aadhaar_front}
                        alt="Aadhar Front Preview"
                        className="max-h-32 object-contain w-full"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{previews.aadhaar_front}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar_back">
                  Aadhar Back <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="aadhaar_back"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => handleFileChange('aadhaar_back', e.target.files?.[0] || null)}
                  disabled={isLoading}
                />
                {errors.aadhaar_back && (
                  <p className="text-sm text-destructive">{errors.aadhaar_back}</p>
                )}
                {previews.aadhaar_back && (
                  <div className="mt-2 border rounded-lg p-2">
                    {previews.aadhaar_back.startsWith('data:') ? (
                      <img
                        src={previews.aadhaar_back}
                        alt="Aadhar Back Preview"
                        className="max-h-32 object-contain w-full"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{previews.aadhaar_back}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-lg">Address Details</h3>
            <div className="space-y-2">
              <Label htmlFor="address_line1">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address_line1"
                placeholder="Street address"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                disabled={isLoading}
              />
              {errors.address_line1 && (
                <p className="text-sm text-destructive">{errors.address_line1}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.address_line2}
                onChange={(e) => handleInputChange('address_line2', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={isLoading}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={isLoading}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pincode"
                  placeholder="123456"
                  value={formData.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    handleInputChange('pincode', value.slice(0, 6));
                  }}
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.pincode && (
                  <p className="text-sm text-destructive">{errors.pincode}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">
                Country <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={isLoading}
              />
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-lg">Bank Account Details</h3>
            <div className="space-y-2">
              <Label htmlFor="bank_name">
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bank_name"
                placeholder="Bank name"
                value={formData.bank_name}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                disabled={isLoading}
              />
              {errors.bank_name && (
                <p className="text-sm text-destructive">{errors.bank_name}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_number">
                  Account Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account_number"
                  placeholder="Account number"
                  value={formData.account_number}
                  onChange={(e) => handleInputChange('account_number', e.target.value)}
                  disabled={isLoading}
                />
                {errors.account_number && (
                  <p className="text-sm text-destructive">{errors.account_number}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc_code">
                  IFSC Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ifsc_code"
                  placeholder="IFSC code"
                  value={formData.ifsc_code}
                  onChange={(e) => handleInputChange('ifsc_code', e.target.value.toUpperCase())}
                  className="uppercase"
                  disabled={isLoading}
                />
                {errors.ifsc_code && (
                  <p className="text-sm text-destructive">{errors.ifsc_code}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_holder_name">
                Account Holder Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="account_holder_name"
                placeholder="Account holder name"
                value={formData.account_holder_name}
                onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                disabled={isLoading}
              />
              {errors.account_holder_name && (
                <p className="text-sm text-destructive">{errors.account_holder_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_passbook">
                Bank Passbook <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bank_passbook"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={(e) => handleFileChange('bank_passbook', e.target.files?.[0] || null)}
                disabled={isLoading}
              />
              {errors.bank_passbook && (
                <p className="text-sm text-destructive">{errors.bank_passbook}</p>
              )}
              {previews.bank_passbook && (
                <div className="mt-2 border rounded-lg p-2">
                  {previews.bank_passbook.startsWith('data:') ? (
                    <img
                      src={previews.bank_passbook}
                      alt="Bank Passbook Preview"
                      className="max-h-32 object-contain w-full"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{previews.bank_passbook}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Submit KYC
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

