import { motion } from 'framer-motion';
import { FileCheck, FileX, CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetAllDistributorApplicationsQuery, useApproveDistributorApplicationMutation, useRejectDistributorApplicationMutation } from '@/app/api/distributorApi';
import { toast } from 'sonner';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const DistributorApplications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data: applications = [], refetch } = useGetAllDistributorApplicationsQuery();
  const [approveApplication] = useApproveDistributorApplicationMutation();
  const [rejectApplication] = useRejectDistributorApplicationMutation();

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.applicationData.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationData.distributorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationData.mobileNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  const handleApprove = async (applicationId: string) => {
    try {
      await approveApplication({ applicationId }).unwrap();
      toast.success('Application approved successfully!');
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
      toast.success('Application rejected');
      setIsRejectDialogOpen(false);
      setRejectComment('');
      setSelectedApplication(null);
      refetch();
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const openRejectDialog = (application: any) => {
    setSelectedApplication(application);
    setIsRejectDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Distributor Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage distributor applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{applications.length}</p>
                </div>
                <FileCheck className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                </div>
                <FileCheck className="h-8 w-8 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Distributor ID</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Vehicle Model</TableHead>
                <TableHead>MRP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.id}</TableCell>
                    <TableCell>{app.applicationData.applicantName}</TableCell>
                    <TableCell>{app.applicationData.distributorId}</TableCell>
                    <TableCell>{app.applicationData.mobileNumber}</TableCell>
                    <TableCell>{app.applicationData.vehicleModel}</TableCell>
                    <TableCell>₹{parseInt(app.applicationData.vehicleMRP || '0').toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                              <DialogDescription>
                                Application ID: {app.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Applicant Name</Label>
                                  <p className="font-medium">{app.applicationData.applicantName}</p>
                                </div>
                                <div>
                                  <Label>Distributor ID</Label>
                                  <p className="font-medium">{app.applicationData.distributorId}</p>
                                </div>
                                <div>
                                  <Label>Mobile Number</Label>
                                  <p className="font-medium">{app.applicationData.mobileNumber}</p>
                                </div>
                                <div>
                                  <Label>Date & Place</Label>
                                  <p className="font-medium">{app.applicationData.date} - {app.applicationData.place}</p>
                                </div>
                                <div>
                                  <Label>Vehicle Model</Label>
                                  <p className="font-medium">{app.applicationData.vehicleModel}</p>
                                </div>
                                <div>
                                  <Label>MRP</Label>
                                  <p className="font-medium">₹{parseInt(app.applicationData.vehicleMRP || '0').toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label>Booking Order No</Label>
                                  <p className="font-medium">{app.applicationData.bookingOrderNo}</p>
                                </div>
                                <div>
                                  <Label>Payment Mode</Label>
                                  <p className="font-medium capitalize">{app.applicationData.paymentMode}</p>
                                </div>
                              </div>
                              
                              {app.applicationData.paymentMode === 'installment' && (
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-2">Payment Details</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Advance Paid</Label>
                                      <p className="font-medium">₹{parseInt(app.applicationData.advancePaid || '0').toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <Label>Balance Amount</Label>
                                      <p className="font-medium">₹{parseInt(app.applicationData.balanceAmount || '0').toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <Label>Installment Mode</Label>
                                      <p className="font-medium capitalize">{app.applicationData.installmentMode}</p>
                                    </div>
                                    <div>
                                      <Label>Installment Amount</Label>
                                      <p className="font-medium">₹{parseInt(app.applicationData.installmentAmount || '0').toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Consents</h4>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    Incentive Consent: {app.applicationData.incentiveConsent ? '✓ Yes' : '✗ No'}
                                  </p>
                                  <p className="text-sm">
                                    Declaration Accepted: {app.applicationData.declarationAccepted ? '✓ Yes' : '✗ No'}
                                  </p>
                                  <p className="text-sm">
                                    Refund Policy Accepted: {app.applicationData.refundPolicyAccepted ? '✓ Yes' : '✗ No'}
                                  </p>
                                </div>
                              </div>

                              {app.applicationData.vehicleImage && (
                                <div className="border-t pt-4">
                                  <Label>Vehicle Image</Label>
                                  <img 
                                    src={app.applicationData.vehicleImage} 
                                    alt="Vehicle" 
                                    className="mt-2 max-w-md rounded-lg border"
                                  />
                                </div>
                              )}

                              {app.applicationData.signature && (
                                <div className="border-t pt-4">
                                  <Label>Signature</Label>
                                  <img 
                                    src={app.applicationData.signature} 
                                    alt="Signature" 
                                    className="mt-2 max-w-md rounded-lg border"
                                  />
                                </div>
                              )}

                              {app.status === 'pending' && (
                                <div className="border-t pt-4 flex gap-2">
                                  <Button
                                    onClick={() => handleApprove(app.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => openRejectDialog(app)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {app.comments && (
                                <div className="border-t pt-4">
                                  <Label>Review Comments</Label>
                                  <p className="text-sm mt-1">{app.comments}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {app.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(app.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openRejectDialog(app)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-comment">Reason for Rejection *</Label>
              <Textarea
                id="reject-comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
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

