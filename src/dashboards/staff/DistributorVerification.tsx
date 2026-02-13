import { motion } from 'framer-motion';
import { UserCheck, CheckCircle, XCircle, Clock, Eye, Search, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { 
  useGetAllDistributorApplicationsQuery, 
  useApproveDistributorApplicationMutation, 
  useRejectDistributorApplicationMutation 
} from '@/app/api/distributorApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved
      </Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const DistributorVerification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: applications = [], refetch } = useGetAllDistributorApplicationsQuery();
  const [approveApplication] = useApproveDistributorApplicationMutation();
  const [rejectApplication] = useRejectDistributorApplicationMutation();

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.applicationData.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationData.distributorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationData.mobileNumber.includes(searchTerm);
    
    return matchesSearch;
  });

  const pendingApplications = filteredApplications.filter(app => app.status === 'pending');

  // Get last 5 recently approved/verified applications
  const recentlyApproved = useMemo(() => {
    return applications
      .filter(app => app.status === 'approved')
      .sort((a, b) => {
        const dateA = a.reviewedAt ? new Date(a.reviewedAt).getTime() : new Date(a.submittedAt).getTime();
        const dateB = b.reviewedAt ? new Date(b.reviewedAt).getTime() : new Date(b.submittedAt).getTime();
        return dateB - dateA; // Most recent first
      })
      .slice(0, 5);
  }, [applications]);

  const handleApprove = async (applicationId: string) => {
    try {
      await approveApplication({ applicationId }).unwrap();
      toast.success('Application approved successfully! User has been promoted to Distributor.');
      refetch();
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    if (!rejectComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await rejectApplication({ 
        applicationId: selectedApplication.id, 
        comments: rejectComment 
      }).unwrap();
      toast.success('Application rejected successfully');
      setIsRejectDialogOpen(false);
      setRejectComment('');
      setSelectedApplication(null);
      refetch();
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const openRejectDialog = (app: any) => {
    setSelectedApplication(app);
    setIsRejectDialogOpen(true);
  };

  const openViewDialog = (app: any) => {
    setSelectedApplication(app);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Distributor Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify distributor applications</p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, distributor ID, or mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications ({pendingApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending verifications found
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{app.applicationData.applicantName}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.applicationData.distributorId} • {app.applicationData.mobileNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openViewDialog(app)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-success hover:bg-success/90"
                      onClick={() => handleApprove(app.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => openRejectDialog(app)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Approved/Verified Section */}
      {recentlyApproved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-success" />
              Recently Approved/Verified (Last 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentlyApproved.map((app) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-pink-100 bg-pink-50/50 border-pink-200/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{app.applicationData.applicantName}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {app.applicationData.distributorId} • {app.applicationData.mobileNumber}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                      {app.reviewedAt && (
                        <span>
                          Approved: {new Date(app.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                      {app.reviewedBy && (
                        <span>
                          By: {app.reviewedBy}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openViewDialog(app)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the complete application information
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Applicant Name</Label>
                  <p className="font-medium">{selectedApplication.applicationData.applicantName}</p>
                </div>
                <div>
                  <Label>Distributor ID</Label>
                  <p className="font-medium">{selectedApplication.applicationData.distributorId}</p>
                </div>
                <div>
                  <Label>Mobile Number</Label>
                  <p className="font-medium">{selectedApplication.applicationData.mobileNumber}</p>
                </div>
                <div>
                  <Label>Vehicle Model</Label>
                  <p className="font-medium">{selectedApplication.applicationData.vehicleModel}</p>
                </div>
                <div>
                  <Label>MRP</Label>
                  <p className="font-medium">₹{selectedApplication.applicationData.vehicleMRP}</p>
                </div>
                <div>
                  <Label>Booking Order No</Label>
                  <p className="font-medium">{selectedApplication.applicationData.bookingOrderNo}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Mode</Label>
                  <p className="font-medium capitalize">{selectedApplication.applicationData.paymentMode || 'N/A'}</p>
                </div>
                <div>
                  <Label>Advance Paid</Label>
                  <p className="font-medium">₹{selectedApplication.applicationData.advancePaid || '0'}</p>
                </div>
                {selectedApplication.applicationData.paymentMode === 'installment' && (
                  <>
                    <div>
                      <Label>Installment Mode</Label>
                      <p className="font-medium capitalize">{selectedApplication.applicationData.installmentMode || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Installment Amount</Label>
                      <p className="font-medium">₹{selectedApplication.applicationData.installmentAmount || '0'}</p>
                    </div>
                  </>
                )}
                <div>
                  <Label>Balance Amount</Label>
                  <p className="font-medium">₹{selectedApplication.applicationData.balanceAmount || '0'}</p>
                </div>
                <div>
                  <Label>Submitted Date</Label>
                  <p className="font-medium">{new Date(selectedApplication.submittedAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedApplication.status === 'approved' && selectedApplication.reviewedAt && (
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Reviewed Date</Label>
                      <p className="font-medium">{new Date(selectedApplication.reviewedAt).toLocaleString()}</p>
                    </div>
                    {selectedApplication.reviewedBy && (
                      <div>
                        <Label>Reviewed By</Label>
                        <p className="font-medium">{selectedApplication.reviewedBy}</p>
                      </div>
                    )}
                  </div>
                  {selectedApplication.comments && (
                    <div className="mt-4">
                      <Label>Review Comments</Label>
                      <p className="font-medium mt-1">{selectedApplication.comments}</p>
                    </div>
                  )}
                </div>
              )}
              {selectedApplication.applicationData.vehicleImage && (
                <div>
                  <Label>Vehicle Image</Label>
                  <img 
                    src={selectedApplication.applicationData.vehicleImage === '[IMAGE_STORED]' 
                      ? '/placeholder.svg' 
                      : selectedApplication.applicationData.vehicleImage} 
                    alt="Vehicle" 
                    className="mt-2 max-w-md rounded-lg border"
                  />
                </div>
              )}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-success hover:bg-success/90 flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      openRejectDialog(selectedApplication);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectComment">Rejection Reason *</Label>
              <Textarea
                id="rejectComment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectComment('');
                setSelectedApplication(null);
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

