import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, DollarSign, TrendingUp, Search, CheckCircle, XCircle, Zap, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetEmergencyWithdrawalRequestsQuery, useApproveWithdrawalRequestMutation, useRejectWithdrawalRequestMutation } from '@/app/api/poolWithdrawalApi';
import { toast } from 'sonner';
import { format, differenceInHours } from 'date-fns';

export const EmergencyWithdrawals = () => {
  const { data: emergencyRequests = [], isLoading, refetch } = useGetEmergencyWithdrawalRequestsQuery();
  const [approveWithdrawal] = useApproveWithdrawalRequestMutation();
  const [rejectWithdrawal] = useRejectWithdrawalRequestMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComments, setRejectComments] = useState('');

  const pendingRequests = emergencyRequests.filter(req => req.status === 'pending');
  const approvedRequests = emergencyRequests.filter(req => req.status === 'approved');
  const rejectedRequests = emergencyRequests.filter(req => req.status === 'rejected');

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalEmergencyAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
    
    // Calculate average processing time (for approved requests)
    const approvedWithTimes = approvedRequests
      .filter(req => req.processedAt && req.requestedAt)
      .map(req => ({
        ...req,
        processingTime: differenceInHours(new Date(req.processedAt!), new Date(req.requestedAt)),
      }));
    const avgProcessingTime = approvedWithTimes.length > 0
      ? approvedWithTimes.reduce((sum, req) => sum + req.processingTime, 0) / approvedWithTimes.length
      : 0;

    // Count urgent requests (24h+ pending)
    const urgentRequests = pendingRequests.filter(req => {
      const hoursPending = differenceInHours(new Date(), new Date(req.requestedAt));
      return hoursPending >= 24;
    });

    return {
      pendingCount: pendingRequests.length,
      totalEmergencyAmount,
      avgProcessingTime: Math.round(avgProcessingTime),
      urgentCount: urgentRequests.length,
    };
  }, [pendingRequests, approvedRequests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return emergencyRequests.filter(req => {
      const matchesSearch = !searchTerm ||
        req.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [emergencyRequests, searchTerm, statusFilter, priorityFilter]);

  // Sort by priority and urgency
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      // First sort by status (pending first)
      if (a.status !== b.status) {
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
      }

      // Then by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'low'] || 1;
      const bPriority = priorityOrder[b.priority || 'low'] || 1;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // Then by urgency (older requests first)
      const aHours = differenceInHours(new Date(), new Date(a.requestedAt));
      const bHours = differenceInHours(new Date(), new Date(b.requestedAt));
      return bHours - aHours;
    });
  }, [filteredRequests]);

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-destructive text-white"><AlertCircle className="w-3 h-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-white"><Clock className="w-3 h-3 mr-1" />Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-white"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyIndicator = (requestedAt: string) => {
    const hoursPending = differenceInHours(new Date(), new Date(requestedAt));
    if (hoursPending >= 48) {
      return <Badge className="bg-destructive text-white">Critical (48h+)</Badge>;
    } else if (hoursPending >= 24) {
      return <Badge className="bg-warning text-white">Urgent (24h+)</Badge>;
    }
    return null;
  };

  const handleFastApprove = async (requestId: string) => {
    try {
      const result = await approveWithdrawal({ requestId }).unwrap();
      if (result.success) {
        toast.success(result.message);
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.data || 'Failed to approve withdrawal request');
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      const result = await approveWithdrawal({ requestId: selectedRequest.id }).unwrap();
      if (result.success) {
        toast.success(result.message);
        setShowApproveDialog(false);
        setSelectedRequest(null);
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.data || 'Failed to approve withdrawal request');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectComments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const result = await rejectWithdrawal({
        requestId: selectedRequest.id,
        adminComments: rejectComments,
      }).unwrap();
      if (result.success) {
        toast.success(result.message);
        setShowRejectDialog(false);
        setRejectComments('');
        setSelectedRequest(null);
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.data || 'Failed to reject withdrawal request');
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      vehicle_purchase: 'Future Vehicle Purchase',
      emergency: 'Emergency',
      pf: 'Provident Fund (PF)',
      resignation: 'Resignation',
      other: 'Other Valid Reason',
    };
    return labels[reason] || reason;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading emergency withdrawal requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Emergency Withdrawals</h1>
        <p className="text-muted-foreground mt-1">Fast-track approval for urgent pool money withdrawal requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Emergency Requests</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
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
              <CardTitle className="text-sm font-medium">Total Emergency Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{summaryStats.totalEmergencyAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
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
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.avgProcessingTime}h</div>
              <p className="text-xs text-muted-foreground mt-1">For approved requests</p>
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
              <CardTitle className="text-sm font-medium">Urgent Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.urgentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">24h+ pending</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Urgent Alert */}
      {summaryStats.urgentCount > 0 && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Urgent Action Required:</strong> {summaryStats.urgentCount} emergency withdrawal request(s) have been pending for over 24 hours. Please review and process them immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Emergency Withdrawal Requests</CardTitle>
              <CardDescription>Priority queue for emergency pool money withdrawals</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedRequests.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <p className="text-muted-foreground">No emergency withdrawal requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequests.map((request) => (
                  <TableRow key={request.id} className={request.status === 'pending' && request.priority === 'high' ? 'bg-destructive/5' : ''}>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell className="font-mono text-xs">{request.id}</TableCell>
                    <TableCell className="font-medium">{request.distributorName}</TableCell>
                    <TableCell className="font-bold">₹{request.amount.toLocaleString()}</TableCell>
                    <TableCell>{getReasonLabel(request.reason)}</TableCell>
                    <TableCell>{format(new Date(request.requestedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell>{getUrgencyIndicator(request.requestedAt)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleFastApprove(request.id)}
                              className="bg-success hover:bg-success/90"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Fast Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveDialog(true);
                              }}
                            >
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectDialog(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {request.status !== 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
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

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Emergency Withdrawal</DialogTitle>
            <DialogDescription>
              Review the withdrawal request details before approval
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Distributor</Label>
                  <p className="font-medium">{selectedRequest.distributorName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p className="font-bold text-lg">₹{selectedRequest.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Reason</Label>
                  <p>{getReasonLabel(selectedRequest.reason)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedRequest.description || 'No description provided'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Requested Date</Label>
                  <p>{format(new Date(selectedRequest.requestedAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Priority</Label>
                  <div>{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-success hover:bg-success/90">
              Approve Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Emergency Withdrawal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Request Details:</p>
                <p className="text-sm">Distributor: {selectedRequest.distributorName}</p>
                <p className="text-sm">Amount: ₹{selectedRequest.amount.toLocaleString()}</p>
                <p className="text-sm">Reason: {getReasonLabel(selectedRequest.reason)}</p>
              </div>
              <div>
                <Label htmlFor="reject-comments">Rejection Reason *</Label>
                <textarea
                  id="reject-comments"
                  value={rejectComments}
                  onChange={(e) => setRejectComments(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none mt-2"
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
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

