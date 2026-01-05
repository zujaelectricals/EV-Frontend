import { motion } from 'framer-motion';
import { useState } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, Filter, Download, Search, Eye, Building2, Wallet } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PayoutExtended } from '../types/payoutEngine';

const mockPendingPayouts: PayoutExtended[] = [
  {
    id: 'PO001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    amount: 25000,
    type: 'binary',
    status: 'pending',
    description: 'Binary commission for 5 pairs',
    requestedAt: '2024-03-20 10:30',
    tds: 2500,
    netAmount: 22500,
    bankDetails: {
      accountNumber: '1234567890',
      accountHolderName: 'Rajesh Kumar',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
      branch: 'Mumbai Main',
    },
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'PO002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    amount: 15000,
    type: 'referral',
    status: 'pending',
    description: 'Referral commission for 3 referrals',
    requestedAt: '2024-03-21 14:20',
    tds: 1500,
    netAmount: 13500,
    bankDetails: {
      accountNumber: '5678901234',
      accountHolderName: 'Priya Sharma',
      ifsc: 'ICIC0005678',
      bankName: 'ICICI Bank',
      branch: 'Delhi Central',
    },
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'PO003',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    amount: 35000,
    type: 'binary',
    status: 'pending',
    description: 'Binary commission for 10 pairs',
    requestedAt: '2024-03-22 09:15',
    tds: 3500,
    netAmount: 31500,
    bankDetails: {
      accountNumber: '9012345678',
      accountHolderName: 'Amit Patel',
      ifsc: 'SBIN0009012',
      bankName: 'State Bank of India',
      branch: 'Bangalore South',
    },
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'PO004',
    userId: 'U12348',
    userName: 'Sneha Reddy',
    userEmail: 'sneha@example.com',
    amount: 8000,
    type: 'milestone',
    status: 'pending',
    description: 'Milestone reward: First 3 Referrals',
    milestoneId: 'm1',
    requestedAt: '2024-03-22 11:00',
    tds: 800,
    netAmount: 7200,
    upiId: 'sneha@paytm',
    paymentMethod: 'upi',
  },
];

export const PendingPayouts = () => {
  const [payouts, setPayouts] = useState<PayoutExtended[]>(mockPendingPayouts);
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewingPayout, setViewingPayout] = useState<PayoutExtended | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectingPayout, setRejectingPayout] = useState<PayoutExtended | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredPayouts = payouts.filter((payout) => {
    const matchesSearch =
      payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || payout.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const totalNetAmount = payouts.reduce((sum, p) => sum + (p.netAmount || p.amount), 0);
  const averageAmount = payouts.length > 0 ? totalAmount / payouts.length : 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayouts(filteredPayouts.map((p) => p.id));
    } else {
      setSelectedPayouts([]);
    }
  };

  const handleSelectPayout = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPayouts([...selectedPayouts, id]);
    } else {
      setSelectedPayouts(selectedPayouts.filter((p) => p !== id));
    }
  };

  const handleApprove = (id: string) => {
    setPayouts(payouts.map((p) => (p.id === id ? { ...p, status: 'processing' as const, approvedAt: new Date().toISOString() } : p)));
    setSelectedPayouts(selectedPayouts.filter((p) => p !== id));
  };

  const handleBulkApprove = () => {
    setPayouts(
      payouts.map((p) =>
        selectedPayouts.includes(p.id)
          ? { ...p, status: 'processing' as const, approvedAt: new Date().toISOString() }
          : p
      )
    );
    setSelectedPayouts([]);
  };

  const handleReject = (payout: PayoutExtended) => {
    setRejectingPayout(payout);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (rejectingPayout && rejectionReason) {
      setPayouts(
        payouts.map((p) =>
          p.id === rejectingPayout.id
            ? {
                ...p,
                status: 'cancelled' as const,
                rejectedAt: new Date().toISOString(),
                rejectionReason,
              }
            : p
        )
      );
      setIsRejectDialogOpen(false);
      setRejectingPayout(null);
      setRejectionReason('');
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      binary: 'bg-primary text-white',
      referral: 'bg-info text-white',
      milestone: 'bg-success text-white',
      pool: 'bg-warning text-white',
      incentive: 'bg-secondary',
    };
    return <Badge className={colors[type] || 'bg-secondary'}>{type}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Payouts</h1>
          <p className="text-muted-foreground mt-1">Review and approve pending payout requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {selectedPayouts.length > 0 && (
            <Button size="sm" onClick={handleBulkApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Selected ({selectedPayouts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Count</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{payouts.length}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹{(totalAmount / 1000).toFixed(1)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹{(totalNetAmount / 1000).toFixed(1)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Amount</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹{Math.round(averageAmount).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Payout Requests</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="pool">Pool</SelectItem>
                  <SelectItem value="incentive">Incentive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPayouts.length === filteredPayouts.length && filteredPayouts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Payout ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPayouts.includes(payout.id)}
                      onCheckedChange={(checked) => handleSelectPayout(payout.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{payout.userName}</p>
                      <p className="text-xs text-muted-foreground">{payout.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-bold text-foreground">₹{payout.amount.toLocaleString()}</span>
                      {payout.tds && (
                        <p className="text-xs text-muted-foreground">TDS: ₹{payout.tds.toLocaleString()}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-success">₹{(payout.netAmount || payout.amount).toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{getTypeBadge(payout.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {payout.paymentMethod === 'bank_transfer' && (
                        <>
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Bank</span>
                        </>
                      )}
                      {payout.paymentMethod === 'upi' && (
                        <>
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">UPI</span>
                        </>
                      )}
                      {payout.paymentMethod === 'wallet' && (
                        <>
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Wallet</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{payout.requestedAt.split(' ')[0]}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setViewingPayout(payout);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleApprove(payout.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(payout)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Payout Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>Complete information about payout {viewingPayout?.id}</DialogDescription>
          </DialogHeader>
          {viewingPayout && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Payout ID</Label>
                  <p className="font-medium">{viewingPayout.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="font-medium">{viewingPayout.userName}</p>
                  <p className="text-xs text-muted-foreground">{viewingPayout.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <div className="mt-1">{getTypeBadge(viewingPayout.type)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="font-bold text-lg">₹{viewingPayout.amount.toLocaleString()}</p>
                </div>
                {viewingPayout.tds && (
                  <div>
                    <Label className="text-xs text-muted-foreground">TDS</Label>
                    <p className="font-medium">₹{viewingPayout.tds.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Net Amount</Label>
                  <p className="font-bold text-lg text-success">
                    ₹{(viewingPayout.netAmount || viewingPayout.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="font-medium">{viewingPayout.description}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Payment Details</Label>
                <div className="p-3 bg-secondary rounded-lg space-y-2">
                  {viewingPayout.paymentMethod === 'bank_transfer' && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Holder</Label>
                        <p className="font-medium">{viewingPayout.bankDetails.accountHolderName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Number</Label>
                        <p className="font-medium">{viewingPayout.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">IFSC</Label>
                        <p className="font-medium">{viewingPayout.bankDetails.ifsc}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Bank Name</Label>
                        <p className="font-medium">{viewingPayout.bankDetails.bankName}</p>
                      </div>
                      {viewingPayout.bankDetails.branch && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Branch</Label>
                          <p className="font-medium">{viewingPayout.bankDetails.branch}</p>
                        </div>
                      )}
                    </>
                  )}
                  {viewingPayout.paymentMethod === 'upi' && viewingPayout.upiId && (
                    <div>
                      <Label className="text-xs text-muted-foreground">UPI ID</Label>
                      <p className="font-medium">{viewingPayout.upiId}</p>
                    </div>
                  )}
                  {viewingPayout.paymentMethod === 'wallet' && viewingPayout.walletAddress && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Wallet Address</Label>
                      <p className="font-medium">{viewingPayout.walletAddress}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Requested At</Label>
                <p className="font-medium">{viewingPayout.requestedAt}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={() => {
                if (viewingPayout) {
                  handleApprove(viewingPayout.id);
                  setIsViewDialogOpen(false);
                }
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (viewingPayout) {
                  setIsViewDialogOpen(false);
                  handleReject(viewingPayout);
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payout Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this payout request</DialogDescription>
          </DialogHeader>
          {rejectingPayout && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Payout ID</Label>
                <p className="font-medium">{rejectingPayout.id}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">User</Label>
                <p className="font-medium">{rejectingPayout.userName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <p className="font-medium">₹{rejectingPayout.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Enter reason for rejection..."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

