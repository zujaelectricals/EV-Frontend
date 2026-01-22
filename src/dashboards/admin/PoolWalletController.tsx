import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, DollarSign, TrendingUp, Users, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetAllWithdrawalRequestsQuery, useApproveWithdrawalRequestMutation, useRejectWithdrawalRequestMutation } from '@/app/api/poolWithdrawalApi';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PoolWalletController = () => {
  const { data: allRequests = [], isLoading, refetch } = useGetAllWithdrawalRequestsQuery(undefined, {
    // Refetch on mount to ensure we have the latest data
    refetchOnMountOrArgChange: true,
  });
  const [approveWithdrawal] = useApproveWithdrawalRequestMutation();
  const [rejectWithdrawal] = useRejectWithdrawalRequestMutation();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComments, setRejectComments] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingRequests = allRequests.filter(req => req.status === 'pending');
  const approvedRequests = allRequests.filter(req => req.status === 'approved');
  const rejectedRequests = allRequests.filter(req => req.status === 'rejected');

  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);
  const totalPoolMoney = allRequests
    .filter(req => req.status === 'approved')
    .reduce((sum, req) => sum + req.amount, 0);

  // Debug: Log requests to console
  useEffect(() => {
    console.log('PoolWalletController - All requests:', allRequests);
    console.log('PoolWalletController - Pending requests:', pendingRequests);
  }, [allRequests, pendingRequests]);

  const filteredRequests = allRequests.filter(req => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      req.distributorName.toLowerCase().includes(search) ||
      req.id.toLowerCase().includes(search) ||
      req.reason.toLowerCase().includes(search)
    );
  });

  const handleApprove = async (requestId: string) => {
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
        <LoadingSpinner text="Loading withdrawal requests..." size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reserve Wallet Controller</h1>
        <p className="text-muted-foreground mt-1">Manage and approve reserve wallet withdrawal requests</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reserve Wallet</CardTitle>
            <Landmark className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalPoolMoney.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved withdrawals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requests awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{allRequests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Review and approve reserve wallet withdrawal requests from authorized partners</CardDescription>
            </div>
            <Input
              placeholder="Search by name, ID, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({allRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p className="text-muted-foreground">No pending withdrawal requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Authorized Partner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests
                      .filter(req => !searchTerm || 
                        req.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        req.id.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">{request.id}</TableCell>
                        <TableCell className="font-medium">{request.distributorName}</TableCell>
                        <TableCell className="font-bold">₹{request.amount.toLocaleString()}</TableCell>
                        <TableCell>{getReasonLabel(request.reason)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.description || '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No approved withdrawals yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Authorized Partner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Processed Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">{request.id}</TableCell>
                        <TableCell className="font-medium">{request.distributorName}</TableCell>
                        <TableCell className="font-bold text-success">₹{request.amount.toLocaleString()}</TableCell>
                        <TableCell>{getReasonLabel(request.reason)}</TableCell>
                        <TableCell>
                          {request.processedAt 
                            ? new Date(request.processedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No rejected withdrawals</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Authorized Partner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Admin Comments</TableHead>
                      <TableHead>Processed Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">{request.id}</TableCell>
                        <TableCell className="font-medium">{request.distributorName}</TableCell>
                        <TableCell className="font-bold">₹{request.amount.toLocaleString()}</TableCell>
                        <TableCell>{getReasonLabel(request.reason)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.adminComments || '-'}
                        </TableCell>
                        <TableCell>
                          {request.processedAt 
                            ? new Date(request.processedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Distributor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">{request.id}</TableCell>
                      <TableCell className="font-medium">{request.distributorName}</TableCell>
                      <TableCell className="font-bold">₹{request.amount.toLocaleString()}</TableCell>
                      <TableCell>{getReasonLabel(request.reason)}</TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request. The reserve wallet will be restored to the authorized partner.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Distributor</p>
                <p className="font-semibold">{selectedRequest.distributorName}</p>
                <p className="text-sm text-muted-foreground mt-2">Amount</p>
                <p className="font-semibold">₹{selectedRequest.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">Reason</p>
                <p className="font-semibold">{getReasonLabel(selectedRequest.reason)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-comments">Rejection Reason *</Label>
                <Textarea
                  id="reject-comments"
                  placeholder="Enter reason for rejection..."
                  value={rejectComments}
                  onChange={(e) => setRejectComments(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectComments('');
              setSelectedRequest(null);
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
