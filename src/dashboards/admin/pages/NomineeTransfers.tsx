import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserX, DollarSign, FileCheck, Search, CheckCircle, XCircle, AlertCircle, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useGetAllNomineeTransfersQuery,
  useVerifyNomineeTransferMutation,
  useApproveNomineeTransferMutation,
  useRejectNomineeTransferMutation,
} from '@/app/api/nomineeTransferApi';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const NomineeTransfers = () => {
  const { data: transfers = [], isLoading, refetch } = useGetAllNomineeTransfersQuery();
  const [verifyTransfer] = useVerifyNomineeTransferMutation();
  const [approveTransfer] = useApproveNomineeTransferMutation();
  const [rejectTransfer] = useRejectNomineeTransferMutation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'approved' | 'transferred' | 'rejected'>('all');
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [verifyComments, setVerifyComments] = useState('');
  const [rejectComments, setRejectComments] = useState('');
  const [nomineeActivated, setNomineeActivated] = useState(false);
  const [approveComments, setApproveComments] = useState('');

  const pendingTransfers = transfers.filter(t => t.status === 'pending');
  const verifiedTransfers = transfers.filter(t => t.status === 'verified');
  const transferredTransfers = transfers.filter(t => t.status === 'transferred');

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter(transfer => {
      const matchesSearch = !searchTerm ||
        transfer.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.nominee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transfers, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'transferred':
        return <Badge className="bg-success text-white"><CheckCircle className="w-3 h-3 mr-1" />Transferred</Badge>;
      case 'approved':
        return <Badge className="bg-info text-white"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'verified':
        return <Badge className="bg-primary text-white"><FileCheck className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning"><Clock className="w-3 h-3 mr-1" />Pending Verification</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleVerify = async () => {
    if (!selectedTransfer) return;
    try {
      const result = await verifyTransfer({
        requestId: selectedTransfer.id,
        verifiedBy: 'admin-user-id', // In real app, get from auth
        adminComments: verifyComments,
      }).unwrap();
      if (result.success) {
        toast.success(result.message);
        setShowVerifyDialog(false);
        setVerifyComments('');
        setSelectedTransfer(null);
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.data || 'Failed to verify transfer request');
    }
  };

  const handleApprove = async () => {
    if (!selectedTransfer) return;
    try {
      const result = await approveTransfer({
        requestId: selectedTransfer.id,
        nomineeActivated,
        adminComments: approveComments,
      }).unwrap();
      if (result.success) {
        toast.success(result.message);
        setShowApproveDialog(false);
        setNomineeActivated(false);
        setApproveComments('');
        setSelectedTransfer(null);
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.data || 'Failed to approve transfer');
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer) return;
    if (!rejectComments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const result = await rejectTransfer({
        requestId: selectedTransfer.id,
        adminComments: rejectComments,
      }).unwrap();
      if (result.success) {
        toast.success(result.message);
        setShowRejectDialog(false);
        setRejectComments('');
        setSelectedTransfer(null);
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.data || 'Failed to reject transfer request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading nominee transfer requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nominee Transfers</h1>
        <p className="text-muted-foreground mt-1">Manage pool money transfers to nominees upon distributor demise</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingTransfers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting document verification</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <FileCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{verifiedTransfers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for transfer</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transferred</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{transferredTransfers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed transfers</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{transfers.reduce((sum, t) => sum + t.poolAmount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All transfer requests</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Nominee Transfer Requests</CardTitle>
              <CardDescription>Review and process pool money transfers to nominees</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by distributor, nominee, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransfers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No nominee transfer requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Distributor (Deceased)</TableHead>
                  <TableHead>Nominee</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-mono text-xs">{transfer.id}</TableCell>
                    <TableCell className="font-medium">{transfer.distributorName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.nominee.name}</p>
                        <p className="text-xs text-muted-foreground">{transfer.nominee.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{transfer.nominee.relationship}</TableCell>
                    <TableCell className="font-bold">₹{transfer.poolAmount.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(transfer.requestedAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transfer.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setShowVerifyDialog(true);
                              }}
                            >
                              <FileCheck className="h-3 w-3 mr-1" />
                              Verify
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setShowRejectDialog(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {transfer.status === 'verified' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve & Transfer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setShowRejectDialog(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {(transfer.status === 'transferred' || transfer.status === 'rejected') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransfer(transfer);
                              setShowApproveDialog(true);
                            }}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Nominee Transfer Request</DialogTitle>
            <DialogDescription>
              Review documents and verify nominee details before approval
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Distributor (Deceased)</Label>
                  <p className="font-medium">{selectedTransfer.distributorName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Pool Amount</Label>
                  <p className="font-bold text-lg">₹{selectedTransfer.poolAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Nominee Name</Label>
                  <p className="font-medium">{selectedTransfer.nominee.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Relationship</Label>
                  <p>{selectedTransfer.nominee.relationship}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Nominee Phone</Label>
                  <p>{selectedTransfer.nominee.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Nominee Email</Label>
                  <p>{selectedTransfer.nominee.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Nominee Address</Label>
                  <p className="text-sm">{selectedTransfer.nominee.address || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Aadhar Number</Label>
                  <p>{selectedTransfer.nominee.aadhar || 'N/A'}</p>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please verify the death certificate and nominee identity documents before proceeding.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="verify-comments">Verification Comments</Label>
                <Textarea
                  id="verify-comments"
                  value={verifyComments}
                  onChange={(e) => setVerifyComments(e.target.value)}
                  placeholder="Add verification notes..."
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowVerifyDialog(false);
              setVerifyComments('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleVerify}>
              <FileCheck className="h-4 w-4 mr-2" />
              Verify Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve & Transfer Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve & Transfer Pool Money</DialogTitle>
            <DialogDescription>
              Complete the transfer of pool money to the nominee
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Distributor (Deceased)</Label>
                  <p className="font-medium">{selectedTransfer.distributorName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Pool Amount</Label>
                  <p className="font-bold text-lg">₹{selectedTransfer.poolAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Nominee</Label>
                  <p className="font-medium">{selectedTransfer.nominee.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Relationship</Label>
                  <p>{selectedTransfer.nominee.relationship}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <Checkbox
                  id="activate-nominee"
                  checked={nomineeActivated}
                  onCheckedChange={(checked) => setNomineeActivated(checked as boolean)}
                />
                <Label htmlFor="activate-nominee" className="cursor-pointer">
                  Activate nominee as distributor (they can continue the distributor work)
                </Label>
              </div>
              <div>
                <Label htmlFor="approve-comments">Transfer Comments</Label>
                <Textarea
                  id="approve-comments"
                  value={approveComments}
                  onChange={(e) => setApproveComments(e.target.value)}
                  placeholder="Add transfer notes..."
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowApproveDialog(false);
              setNomineeActivated(false);
              setApproveComments('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-success hover:bg-success/90">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Nominee Transfer</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this transfer request
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Transfer Details:</p>
                <p className="text-sm">Distributor: {selectedTransfer.distributorName}</p>
                <p className="text-sm">Nominee: {selectedTransfer.nominee.name}</p>
                <p className="text-sm">Amount: ₹{selectedTransfer.poolAmount.toLocaleString()}</p>
              </div>
              <div>
                <Label htmlFor="reject-comments">Rejection Reason *</Label>
                <Textarea
                  id="reject-comments"
                  value={rejectComments}
                  onChange={(e) => setRejectComments(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full min-h-[100px] mt-2"
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectComments('');
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

