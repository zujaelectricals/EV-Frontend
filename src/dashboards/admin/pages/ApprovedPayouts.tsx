import { motion } from 'framer-motion';
import { useState } from 'react';
import { DollarSign, CheckCircle, Search, Filter, Download, Eye, Calendar, Building2, Wallet, FileText } from 'lucide-react';
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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { PayoutExtended } from '../types/payoutEngine';

const mockApprovedPayouts: PayoutExtended[] = [
  {
    id: 'PO101',
    userId: 'U12001',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    amount: 64000,
    type: 'binary',
    status: 'completed',
    description: 'Binary commission for 10 pairs',
    requestedAt: '2024-03-15 10:00',
    approvedAt: '2024-03-15 11:30',
    processedAt: '2024-03-15 14:00',
    tds: 6400,
    netAmount: 57600,
    bankDetails: {
      accountNumber: '9876543210',
      accountHolderName: 'John Doe',
      ifsc: 'HDFC0009876',
      bankName: 'HDFC Bank',
      branch: 'Mumbai Central',
    },
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN202403151400001',
    approvedBy: 'Admin User',
    processedBy: 'System',
  },
  {
    id: 'PO102',
    userId: 'U12002',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    amount: 32000,
    type: 'referral',
    status: 'completed',
    description: 'Referral commission for 5 referrals',
    requestedAt: '2024-03-16 09:00',
    approvedAt: '2024-03-16 10:15',
    processedAt: '2024-03-16 13:30',
    tds: 3200,
    netAmount: 28800,
    bankDetails: {
      accountNumber: '8765432109',
      accountHolderName: 'Jane Smith',
      ifsc: 'ICIC0008765',
      bankName: 'ICICI Bank',
      branch: 'Delhi North',
    },
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN202403161330002',
    approvedBy: 'Admin User',
    processedBy: 'System',
  },
  {
    id: 'PO103',
    userId: 'U12003',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    amount: 10000,
    type: 'milestone',
    status: 'completed',
    description: 'Milestone reward: 10 Pairs Completed',
    milestoneId: 'm4',
    requestedAt: '2024-03-17 08:00',
    approvedAt: '2024-03-17 09:00',
    processedAt: '2024-03-17 12:00',
    tds: 1000,
    netAmount: 9000,
    upiId: 'mike@paytm',
    paymentMethod: 'upi',
    transactionId: 'UPI202403171200003',
    approvedBy: 'Admin User',
    processedBy: 'System',
  },
];

const monthlyData = [
  { month: 'Jan', count: 45, amount: 1125000 },
  { month: 'Feb', count: 52, amount: 1300000 },
  { month: 'Mar', count: 68, amount: 1700000 },
  { month: 'Apr', count: 75, amount: 1875000 },
];

const typeDistribution = [
  { type: 'Binary', count: 120, amount: 3000000 },
  { type: 'Referral', count: 85, amount: 1275000 },
  { type: 'Milestone', count: 45, amount: 450000 },
  { type: 'Pool', count: 30, amount: 600000 },
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

export const ApprovedPayouts = () => {
  const [payouts] = useState<PayoutExtended[]>(mockApprovedPayouts);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingPayout, setViewingPayout] = useState<PayoutExtended | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredPayouts = payouts.filter((payout) => {
    const matchesSearch =
      payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || payout.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const totalNetAmount = payouts.reduce((sum, p) => sum + (p.netAmount || p.amount), 0);
  const totalTDS = payouts.reduce((sum, p) => sum + (p.tds || 0), 0);
  const completedCount = payouts.filter((p) => p.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Approved Payouts</h1>
          <p className="text-muted-foreground mt-1">View approved payout history and transactions</p>
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
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Approved</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{payouts.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-3xl font-bold text-foreground mt-1">₹{(totalAmount / 100000).toFixed(1)}L</p>
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
                  <p className="text-3xl font-bold text-success mt-1">₹{(totalNetAmount / 100000).toFixed(1)}L</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total TDS</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹{(totalTDS / 1000).toFixed(1)}K</p>
                </div>
                <FileText className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payout Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Count" />
                  <Line type="monotone" dataKey="amount" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Amount (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payouts by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="type" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Approved Payout History</CardTitle>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
                <TableHead>Net Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Approved Date</TableHead>
                <TableHead>Processed Date</TableHead>
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
                    {payout.transactionId ? (
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{payout.transactionId}</code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{payout.approvedAt?.split(' ')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payout.processedAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{payout.processedAt.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <Badge variant="secondary">Processing</Badge>
                    )}
                  </TableCell>
                  <TableCell>
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
                    <Badge className="bg-success text-white">Completed</Badge>
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
                {viewingPayout.transactionId && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                    <p className="font-medium">{viewingPayout.transactionId}</p>
                  </div>
                )}
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
                {viewingPayout.approvedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Approved At</Label>
                    <p className="font-medium">{viewingPayout.approvedAt}</p>
                  </div>
                )}
                {viewingPayout.processedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Processed At</Label>
                    <p className="font-medium">{viewingPayout.processedAt}</p>
                  </div>
                )}
                {viewingPayout.approvedBy && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Approved By</Label>
                    <p className="font-medium">{viewingPayout.approvedBy}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

