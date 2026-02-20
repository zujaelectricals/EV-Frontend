import { motion } from 'framer-motion';
import { useState } from 'react';
import { DollarSign, XCircle, Search, Filter, Download, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PayoutExtended } from '../types/payoutEngine';

const mockRejectedPayouts: PayoutExtended[] = [
  {
    id: 'PO201',
    userId: 'U13001',
    userName: 'Robert Brown',
    userEmail: 'robert@example.com',
    amount: 20000,
    type: 'binary',
    status: 'cancelled',
    description: 'Binary commission for 5 pairs',
    requestedAt: '2024-03-10 10:00',
    rejectedAt: '2024-03-10 15:30',
    rejectionReason: 'Invalid bank account details. Account number mismatch.',
    bankDetails: {
      accountNumber: '1111111111',
      accountHolderName: 'Robert Brown',
      ifsc: 'HDFC0001111',
      bankName: 'HDFC Bank',
      branch: 'Mumbai',
    },
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'PO202',
    userId: 'U13002',
    userName: 'Sarah Wilson',
    userEmail: 'sarah@example.com',
    amount: 12000,
    type: 'referral',
    status: 'cancelled',
    description: 'Referral commission for 3 referrals',
    requestedAt: '2024-03-12 09:00',
    rejectedAt: '2024-03-12 11:00',
    rejectionReason: 'KYC verification pending. User needs to complete KYC.',
    bankDetails: {
      accountNumber: '2222222222',
      accountHolderName: 'Sarah Wilson',
      ifsc: 'ICIC0002222',
      bankName: 'ICICI Bank',
      branch: 'Delhi',
    },
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'PO203',
    userId: 'U13003',
    userName: 'David Lee',
    userEmail: 'david@example.com',
    amount: 18000,
    type: 'milestone',
    status: 'cancelled',
    description: 'Milestone reward: 5 Total Partner Framework Completed',
    milestoneId: 'm3',
    requestedAt: '2024-03-14 14:00',
    rejectedAt: '2024-03-14 16:00',
    rejectionReason: 'Milestone not yet achieved. Only 4 pairs completed.',
    upiId: 'david@paytm',
    paymentMethod: 'upi',
  },
];

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

export const RejectedPayouts = () => {
  const [payouts, setPayouts] = useState<PayoutExtended[]>(mockRejectedPayouts);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewingPayout, setViewingPayout] = useState<PayoutExtended | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredPayouts = payouts.filter((payout) => {
    const matchesSearch =
      payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || payout.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const totalRejected = payouts.length;

  const handleResubmit = (id: string) => {
    // Move payout back to pending status
    setPayouts(
      payouts.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'pending' as const,
              rejectedAt: undefined,
              rejectionReason: undefined,
            }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rejected Payouts</h1>
          <p className="text-muted-foreground mt-1">Review rejected payout requests and manage resubmissions</p>
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rejected</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalRejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Resubmissions</p>
                  <p className="text-3xl font-bold text-info mt-1">0</p>
                </div>
                <RefreshCw className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rejected Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rejected Payout Requests</CardTitle>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rejection Reason</TableHead>
                <TableHead>Rejected Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{payout.userName}</p>
                      <p className="text-xs text-muted-foreground">{payout.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{payout.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{getTypeBadge(payout.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2 max-w-md">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{payout.rejectionReason || 'No reason provided'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{payout.rejectedAt?.split(' ')[0]}</span>
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
                      <Button variant="outline" size="sm" onClick={() => handleResubmit(payout.id)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resubmit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Rejected Payout Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rejected Payout Details</DialogTitle>
            <DialogDescription>Complete information about rejected payout {viewingPayout?.id}</DialogDescription>
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
                    <Badge variant="destructive">Rejected</Badge>
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
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="font-medium">{viewingPayout.description}</p>
                </div>
              </div>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Label className="text-xs text-destructive mb-2 block">Rejection Reason</Label>
                <p className="text-sm">{viewingPayout.rejectionReason || 'No reason provided'}</p>
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
                    </>
                  )}
                  {viewingPayout.paymentMethod === 'upi' && viewingPayout.upiId && (
                    <div>
                      <Label className="text-xs text-muted-foreground">UPI ID</Label>
                      <p className="font-medium">{viewingPayout.upiId}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Requested At</Label>
                  <p className="font-medium">{viewingPayout.requestedAt}</p>
                </div>
                {viewingPayout.rejectedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Rejected At</Label>
                    <p className="font-medium">{viewingPayout.rejectedAt}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingPayout) {
                  handleResubmit(viewingPayout.id);
                  setIsViewDialogOpen(false);
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Resubmit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

