import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  useUploadKYCDocumentsMutation,
  useGetKYCStatusQuery,
} from '@/app/api/kycApi';
import { updateKYCStatus } from '@/app/slices/authSlice';
import { toast } from 'sonner';

export function KYCVerification() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [bankStatementFile, setBankStatementFile] = useState<File | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string>('');
  const [panPreview, setPanPreview] = useState<string>('');
  const [bankStatementPreview, setBankStatementPreview] = useState<string>('');

  const { data: kycStatusData, refetch: refetchKYCStatus } = useGetKYCStatusQuery(
    user?.id || '',
    { skip: !user?.id, refetchOnMountOrArgChange: true }
  );

  const [uploadKYCDocuments, { isLoading: isUploading }] = useUploadKYCDocumentsMutation();

  // Sync KYC status from API to Redux state
  useEffect(() => {
    if (kycStatusData && user?.id) {
      dispatch(
        updateKYCStatus({
          kycStatus: kycStatusData.kycStatus,
          kycDetails: kycStatusData.kycDetails,
        })
      );
    }
  }, [kycStatusData, user?.id, dispatch]);

  // Load existing KYC data if available
  useEffect(() => {
    if (kycStatusData?.kycDetails) {
      setAadharNumber(kycStatusData.kycDetails.aadharNumber || '');
      setPanNumber(kycStatusData.kycDetails.panNumber || '');
      if (kycStatusData.kycDetails.documents?.aadhar) {
        setAadharPreview(kycStatusData.kycDetails.documents.aadhar);
      }
      if (kycStatusData.kycDetails.documents?.pan) {
        setPanPreview(kycStatusData.kycDetails.documents.pan);
      }
      if (kycStatusData.kycDetails.documents?.bankStatement) {
        setBankStatementPreview(kycStatusData.kycDetails.documents.bankStatement);
      }
    }
  }, [kycStatusData]);

  // Use Redux state first, then API data, then default
  const kycStatus = user?.kycStatus || kycStatusData?.kycStatus || 'not_submitted';
  const kycDetails = user?.kycDetails || kycStatusData?.kycDetails;

  const handleFileChange = (
    file: File | null,
    type: 'aadhar' | 'pan' | 'bankStatement',
    setFile: (file: File | null) => void,
    setPreview: (preview: string) => void
  ) => {
    if (!file) {
      setFile(null);
      setPreview('');
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

    setFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validatePAN = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  const validateAadhar = (aadhar: string): boolean => {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    // Validate PAN
    if (!panNumber || !validatePAN(panNumber)) {
      toast.error('Please enter a valid PAN number (e.g., ABCDE1234F)');
      return;
    }

    // Validate Aadhar
    if (!aadharNumber || !validateAadhar(aadharNumber)) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return;
    }

    // Validate documents
    if (!panFile && !panPreview) {
      toast.error('Please upload PAN card document');
      return;
    }

    if (!aadharFile && !aadharPreview) {
      toast.error('Please upload Aadhar card document');
      return;
    }

    try {
      // Convert files to base64
      const convertFileToBase64 = (file: File | null, existingPreview: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (existingPreview && !file) {
            resolve(existingPreview);
            return;
          }
          if (!file) {
            reject(new Error('No file provided'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const aadharDoc = await convertFileToBase64(aadharFile, aadharPreview);
      const panDoc = await convertFileToBase64(panFile, panPreview);
      const bankStatementDoc = bankStatementFile
        ? await convertFileToBase64(bankStatementFile, bankStatementPreview)
        : bankStatementPreview || undefined;

      const result = await uploadKYCDocuments({
        userId: user.id,
        aadharNumber: aadharNumber.replace(/\s/g, ''),
        panNumber: panNumber.toUpperCase(),
        documents: {
          aadhar: aadharDoc,
          pan: panDoc,
          bankStatement: bankStatementDoc,
        },
      }).unwrap();

      // Update Redux state
      dispatch(
        updateKYCStatus({
          kycStatus: 'pending',
          kycDetails: {
            aadharNumber: aadharNumber.replace(/\s/g, ''),
            panNumber: panNumber.toUpperCase(),
            documents: {
              aadhar: aadharDoc,
              pan: panDoc,
              bankStatement: bankStatementDoc,
            },
            submittedAt: new Date().toISOString(),
          },
        })
      );

      toast.success(result.message || 'KYC documents submitted successfully');
      refetchKYCStatus();
    } catch (error: any) {
      toast.error(error?.data || 'Failed to upload KYC documents');
    }
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <FileText className="w-3 h-3 mr-1" />
            Not Submitted
          </Badge>
        );
    }
  };

  const canEdit = kycStatus === 'not_submitted' || kycStatus === 'rejected';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>KYC Verification</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your identity documents for verification
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Messages */}
          {kycStatus === 'verified' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your KYC has been verified. You can now pre-book vehicles.
                {kycDetails?.verifiedAt && (
                  <span className="block text-sm mt-1">
                    Verified on: {new Date(kycDetails.verifiedAt).toLocaleDateString()}
                    {kycDetails.verifiedBy && ` by ${kycDetails.verifiedBy}`}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'pending' && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your KYC documents are under review. You will be notified once the verification is complete.
                {kycDetails?.submittedAt && (
                  <span className="block text-sm mt-1">
                    Submitted on: {new Date(kycDetails.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'rejected' && kycDetails?.rejectionReason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>KYC Rejected</strong>
                <p className="mt-2">{kycDetails.rejectionReason}</p>
                {kycDetails.rejectedAt && (
                  <span className="block text-sm mt-2 opacity-75">
                    Rejected on: {new Date(kycDetails.rejectedAt).toLocaleDateString()}
                  </span>
                )}
                <p className="mt-2 text-sm">
                  Please correct the issues and resubmit your documents.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'not_submitted' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete your KYC verification to pre-book vehicles. Please upload your PAN and Aadhar documents.
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* PAN Card */}
            <div className="space-y-3">
              <Label htmlFor="panNumber" className="text-base font-semibold">
                PAN Card Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="panNumber"
                placeholder="ABCDE1234F"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                disabled={!canEdit}
                maxLength={10}
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
              </p>

              <div className="space-y-2">
                <Label htmlFor="panFile" className="text-sm font-medium">
                  PAN Card Document <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="panFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e.target.files?.[0] || null,
                        'pan',
                        setPanFile,
                        setPanPreview
                      )
                    }
                    disabled={!canEdit}
                    className="flex-1"
                  />
                </div>
                {panPreview && (
                  <div className="mt-2 border rounded-lg p-2">
                    <img
                      src={panPreview}
                      alt="PAN Preview"
                      className="max-h-32 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Aadhar Card */}
            <div className="space-y-3">
              <Label htmlFor="aadharNumber" className="text-base font-semibold">
                Aadhar Card Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="aadharNumber"
                placeholder="1234 5678 9012"
                value={aadharNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                  setAadharNumber(formatted);
                }}
                disabled={!canEdit}
                maxLength={14} // 12 digits + 2 spaces
              />
              <p className="text-xs text-muted-foreground">
                12-digit Aadhar number
              </p>

              <div className="space-y-2">
                <Label htmlFor="aadharFile" className="text-sm font-medium">
                  Aadhar Card Document <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="aadharFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) =>
                      handleFileChange(
                        e.target.files?.[0] || null,
                        'aadhar',
                        setAadharFile,
                        setAadharPreview
                      )
                    }
                    disabled={!canEdit}
                    className="flex-1"
                  />
                </div>
                {aadharPreview && (
                  <div className="mt-2 border rounded-lg p-2">
                    <img
                      src={aadharPreview}
                      alt="Aadhar Preview"
                      className="max-h-32 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bank Statement (Optional) */}
            <div className="space-y-3">
              <Label htmlFor="bankStatementFile" className="text-sm font-medium">
                Bank Statement (Optional)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="bankStatementFile"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) =>
                    handleFileChange(
                      e.target.files?.[0] || null,
                      'bankStatement',
                      setBankStatementFile,
                      setBankStatementPreview
                    )
                  }
                  disabled={!canEdit}
                  className="flex-1"
                />
              </div>
              {bankStatementPreview && (
                <div className="mt-2 border rounded-lg p-2">
                  <img
                    src={bankStatementPreview}
                    alt="Bank Statement Preview"
                    className="max-h-32 object-contain"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload your bank statement for faster verification (optional but recommended)
              </p>
            </div>

            {/* Submit Button */}
            {canEdit && (
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit KYC Documents
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

