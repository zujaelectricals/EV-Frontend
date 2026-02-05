import { useState } from 'react';
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetUserProfileQuery } from '@/app/api/userApi';
import { KYCModal } from '@/components/KYCModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function KYCVerification() {
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  
  // Fetch user profile using the cached API - this will use cache if available
  const { data: profileData, isLoading, refetch } = useGetUserProfileQuery();

  // Get KYC status from profile data
  const kycStatus = profileData?.kycStatus === null 
    ? 'not_submitted' 
    : (profileData?.kycStatus || 'not_submitted');

  const handleKYCModalClose = () => {
    setIsKYCModalOpen(false);
    // Refetch profile after KYC submission to update the status
    refetch();
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div>
                <CardTitle className="text-lg sm:text-xl">KYC Verification</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  View your KYC verification status
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">{getStatusBadge()}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Status Messages */}
          {(kycStatus === 'verified' || kycStatus === 'approved') && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Your KYC has been verified!</strong>
                <p className="mt-2">
                  Your identity documents have been successfully verified. You can now apply to become an ASA(Authorized Sales Associate) if eligible.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'pending' && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>KYC Under Review</strong>
                <p className="mt-2">
                  Your KYC documents are currently under review. You will be notified once the verification is complete.
                </p>
                <p className="text-sm mt-2 opacity-75">
                  Please wait for the verification process to complete.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'rejected' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>KYC Rejected</strong>
                <p className="mt-2">
                  Your KYC verification has been rejected. Please review your documents and resubmit them.
                </p>
                <p className="mt-2 text-sm">
                  Click the button below to update and resubmit your KYC documents.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {kycStatus === 'not_submitted' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>KYC Not Submitted</strong>
                <p className="mt-2">
                  Complete your KYC verification to become an ASA(Authorized Sales Associate). Please upload your PAN and Aadhar documents.
                </p>
                <p className="mt-2 text-sm">
                  KYC verification is required for ASA(Authorized Sales Associate) eligibility and enhanced account security.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {(kycStatus === 'not_submitted' || kycStatus === 'rejected') && (
              <Button
                onClick={() => setIsKYCModalOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] text-white border-0 hover:opacity-90 shadow-md shadow-emerald-500/25"
                size="lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                {kycStatus === 'rejected' ? 'Resubmit KYC Documents' : 'Submit KYC Documents'}
              </Button>
            )}
            {kycStatus === 'pending' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">Your KYC is Under Review</span>
              </div>
            )}
            {(kycStatus === 'verified' || kycStatus === 'approved') && (
              <Button
                onClick={() => setIsKYCModalOpen(true)}
                className="w-full sm:w-auto"
                size="lg"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Update KYC Documents
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KYC Modal */}
      <KYCModal
        isOpen={isKYCModalOpen}
        onClose={handleKYCModalClose}
      />
    </div>
  );
}

