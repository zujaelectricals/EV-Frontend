import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TransactionReport, TransactionType, TransactionStatus } from '../types/reports';

const mockTransactions: TransactionReport[] = [
  {
    id: '1',
    transactionId: 'TXN-2024-001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    type: 'payment',
    amount: 50000,
    status: 'completed',
    description: 'Vehicle pre-booking payment',
    paymentMethod: 'card',
    gateway: 'Razorpay',
    referenceNumber: 'REF-001',
    createdAt: '2024-03-22T10:30:00',
    updatedAt: '2024-03-22T10:30:00',
  },
  {
    id: '2',
    transactionId: 'TXN-2024-002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    type: 'commission',
    amount: 2000,
    status: 'completed',
    description: 'Binary commission payout',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'REF-002',
    createdAt: '2024-03-21T14:20:00',
    updatedAt: '2024-03-21T14:20:00',
  },
  {
    id: '3',
    transactionId: 'TXN-2024-003',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    type: 'refund',
    amount: 10000,
    status: 'completed',
    description: 'Refund for cancelled booking',
    paymentMethod: 'card',
    gateway: 'Razorpay',
    referenceNumber: 'REF-003',
    createdAt: '2024-03-20T09:15:00',
    updatedAt: '2024-03-20T09:15:00',
  },
  {
    id: '4',
    transactionId: 'TXN-2024-004',
    userId: 'U12348',
    userName: 'Sneha Reddy',
    userEmail: 'sneha@example.com',
    type: 'payout',
    amount: 15000,
    status: 'pending',
    description: 'Referral commission payout',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'REF-004',
    createdAt: '2024-03-22T11:00:00',
    updatedAt: '2024-03-22T11:00:00',
  },
  {
    id: '5',
    transactionId: 'TXN-2024-005',
    userId: 'U12349',
    userName: 'Vikram Singh',
    userEmail: 'vikram@example.com',
    type: 'redemption',
    amount: 5000,
    status: 'completed',
    description: 'Redemption points used',
    paymentMethod: 'wallet',
    referenceNumber: 'REF-005',
    createdAt: '2024-03-19T15:30:00',
    updatedAt: '2024-03-19T15:30:00',
  },
];

const dailyTransactionData = [
  { day: 'Mon', transactions: 125, amount: 1250000 },
  { day: 'Tue', transactions: 145, amount: 1450000 },
  { day: 'Wed', transactions: 132, amount: 1320000 },
  { day: 'Thu', transactions: 158, amount: 1580000 },
  { day: 'Fri', transactions: 168, amount: 1680000 },
  { day: 'Sat', transactions: 95, amount: 950000 },
  { day: 'Sun', transactions: 78, amount: 780000 },
];

const transactionTypeSummary = [
  { type: 'Payment', count: 850, totalAmount: 12500000, avgAmount: 14705, successRate: 98.5 },
  { type: 'Commission', count: 245, totalAmount: 3200000, avgAmount: 13061, successRate: 95.2 },
  { type: 'Payout', count: 120, totalAmount: 2800000, avgAmount: 23333, successRate: 92.3 },
  { type: 'Refund', count: 20, totalAmount: 450000, avgAmount: 22500, successRate: 100 },
  { type: 'Redemption', count: 10, totalAmount: 250000, avgAmount: 25000, successRate: 100 },
  { type: 'Wallet', count: 85, totalAmount: 850000, avgAmount: 10000, successRate: 97.6 },
];

const getTypeBadge = (type: TransactionType) => {
  switch (type) {
    case 'payment':
      return <Badge className="bg-success text-white">Payment</Badge>;
    case 'commission':
      return <Badge className="bg-info text-white">Commission</Badge>;
    case 'payout':
      return <Badge className="bg-warning text-white">Payout</Badge>;
    case 'refund':
      return <Badge variant="destructive">Refund</Badge>;
    case 'redemption':
      return <Badge variant="default">Redemption</Badge>;
    case 'wallet':
      return <Badge variant="secondary">Wallet</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const getStatusBadge = (status: TransactionStatus) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-success text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="default">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const TransactionHistory = () => {
  const [transactions] = useState<TransactionReport[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingTransaction, setViewingTransaction] = useState<TransactionReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || txn.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const successRate = (transactions.filter((t) => t.status === 'completed').length / transactions.length) * 100;
  const failedTransactions = transactions.filter((t) => t.status === 'failed').length;

  const handleViewTransaction = (transaction: TransactionReport) => {
    setViewingTransaction(transaction);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground mt-1">View and analyze all platform transactions</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalTransactions}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-3xl font-bold text-success mt-1">₹{totalAmount.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-3xl font-bold text-info mt-1">{successRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{failedTransactions}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transaction Type Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transaction Type Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Avg Amount</TableHead>
                  <TableHead>Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionTypeSummary.map((summary) => (
                  <TableRow key={summary.type}>
                    <TableCell>
                      <Badge variant="outline">{summary.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{summary.count}</TableCell>
                    <TableCell className="font-medium">₹{summary.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{summary.avgAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className="bg-success h-2 rounded-full"
                            style={{ width: `${summary.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{summary.successRate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Trend Chart - Single Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Weekly Transaction Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTransactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="day" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="transactions" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Transactions" />
                <Line type="monotone" dataKey="amount" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Amount (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
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
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="redemption">Redemption</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{transaction.transactionId}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{transaction.createdAt.split('T')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{transaction.userName}</p>
                      <p className="text-xs text-muted-foreground">{transaction.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>
                    <span className="font-medium">₹{transaction.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{transaction.paymentMethod || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{transaction.gateway || 'N/A'}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <p className="text-sm line-clamp-1 max-w-xs">{transaction.description}</p>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewTransaction(transaction)}
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

      {/* Transaction Detail Dialog */}
      {viewingTransaction && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information for {viewingTransaction.transactionId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="font-medium">{viewingTransaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
                  <p className="font-medium">{viewingTransaction.referenceNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="font-medium">{viewingTransaction.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingTransaction.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="mt-1">{getTypeBadge(viewingTransaction.type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">₹{viewingTransaction.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingTransaction.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{viewingTransaction.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gateway</p>
                  <p className="font-medium">{viewingTransaction.gateway || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="font-medium">{viewingTransaction.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(viewingTransaction.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                  <p className="font-medium">{new Date(viewingTransaction.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
