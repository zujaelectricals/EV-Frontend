import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet,
  CheckCircle,
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
import { InvestmentReport, InvestmentType } from '../types/reports';

const mockInvestments: InvestmentReport[] = [
  {
    id: '1',
    bookingId: 'BK-2024-001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    type: 'pre_booking',
    amount: 50000,
    paymentMethod: 'card',
    status: 'completed',
    vehicleName: 'EV Scooter Pro',
    redemptionPoints: 5000,
    redemptionEligible: false,
    createdAt: '2024-03-22T10:30:00',
    completedAt: '2024-03-22T10:30:00',
  },
  {
    id: '2',
    bookingId: 'BK-2024-002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    type: 'full_payment',
    amount: 150000,
    paymentMethod: 'upi',
    status: 'completed',
    vehicleName: 'EV Bike Premium',
    redemptionPoints: 15000,
    redemptionEligible: false,
    createdAt: '2024-03-21T14:20:00',
    completedAt: '2024-03-21T14:20:00',
  },
  {
    id: '3',
    bookingId: 'BK-2024-003',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    type: 'emi',
    amount: 25000,
    paymentMethod: 'netbanking',
    status: 'completed',
    vehicleName: 'EV Scooter Standard',
    emiPlan: {
      monthlyAmount: 5000,
      totalMonths: 12,
      interestRate: 8.5,
    },
    redemptionPoints: 2500,
    redemptionEligible: false,
    createdAt: '2024-03-20T09:15:00',
    completedAt: '2024-03-20T09:15:00',
  },
  {
    id: '4',
    bookingId: 'BK-2024-004',
    userId: 'U12348',
    userName: 'Sneha Reddy',
    userEmail: 'sneha@example.com',
    type: 'top_up',
    amount: 20000,
    paymentMethod: 'wallet',
    status: 'pending',
    vehicleName: 'EV Bike Standard',
    redemptionPoints: 2000,
    redemptionEligible: false,
    createdAt: '2024-03-22T11:00:00',
  },
];

const investmentTrendData = [
  { month: 'Jan', investments: 85, amount: 4250000 },
  { month: 'Feb', investments: 92, amount: 4600000 },
  { month: 'Mar', investments: 105, amount: 5250000 },
  { month: 'Apr', investments: 120, amount: 6000000 },
];

const investmentTypeSummary = [
  { type: 'Pre-Booking', count: 1250, totalAmount: 62500000, avgAmount: 50000, completed: 1200, pending: 50 },
  { type: 'Full Payment', count: 850, totalAmount: 127500000, avgAmount: 150000, completed: 850, pending: 0 },
  { type: 'EMI', count: 950, totalAmount: 23750000, avgAmount: 25000, completed: 900, pending: 50 },
  { type: 'Top Up', count: 200, totalAmount: 4000000, avgAmount: 20000, completed: 180, pending: 20 },
];

const paymentMethodSummary = [
  { method: 'Card', count: 1200, totalAmount: 150000000, percentage: 38 },
  { method: 'UPI', count: 1500, totalAmount: 180000000, percentage: 47 },
  { method: 'Net Banking', count: 400, totalAmount: 50000000, percentage: 13 },
  { method: 'Wallet', count: 100, totalAmount: 10000000, percentage: 3 },
];

const getTypeBadge = (type: InvestmentType) => {
  switch (type) {
    case 'pre_booking':
      return <Badge className="bg-info text-white">Pre-Booking</Badge>;
    case 'full_payment':
      return <Badge className="bg-success text-white">Full Payment</Badge>;
    case 'emi':
      return <Badge className="bg-warning text-white">EMI</Badge>;
    case 'top_up':
      return <Badge variant="default">Top Up</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-white">Completed</Badge>;
    case 'pending':
      return <Badge variant="default">Pending</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'refunded':
      return <Badge variant="outline">Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'card':
      return <CreditCard className="h-4 w-4" />;
    case 'wallet':
      return <Wallet className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

export const InvestmentLogs = () => {
  const [investments] = useState<InvestmentReport[]>(mockInvestments);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingInvestment, setViewingInvestment] = useState<InvestmentReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch =
      inv.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalInvestments = investments.length;
  const totalAmount = investments.reduce((sum, i) => sum + i.amount, 0);
  const avgInvestment = totalAmount / totalInvestments;
  const activeInvestments = investments.filter((i) => i.status === 'completed').length;

  const handleViewInvestment = (investment: InvestmentReport) => {
    setViewingInvestment(investment);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investment Logs</h1>
          <p className="text-muted-foreground mt-1">Track all investment transactions and payments</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalInvestments}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
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
                <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Investment</p>
                  <p className="text-3xl font-bold text-info mt-1">₹{Math.round(avgInvestment).toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Investments</p>
                  <p className="text-3xl font-bold text-success mt-1">{activeInvestments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Investment Type Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Investment Type Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Avg Amount</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investmentTypeSummary.map((summary) => (
                  <TableRow key={summary.type}>
                    <TableCell>
                      <Badge variant="outline">{summary.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{summary.count}</TableCell>
                    <TableCell className="font-medium">₹{summary.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{summary.avgAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-white">{summary.completed}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{summary.pending}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Method Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethodSummary.map((summary) => (
                  <TableRow key={summary.method}>
                    <TableCell className="font-medium">{summary.method}</TableCell>
                    <TableCell>{summary.count}</TableCell>
                    <TableCell className="font-medium">₹{summary.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${summary.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{summary.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Trend Chart - Single Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Investment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={investmentTrendData}>
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
                <Legend />
                <Line type="monotone" dataKey="investments" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Investments" />
                <Line type="monotone" dataKey="amount" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Amount (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Investments</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search investments..."
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
                  <SelectItem value="pre_booking">Pre-Booking</SelectItem>
                  <SelectItem value="full_payment">Full Payment</SelectItem>
                  <SelectItem value="emi">EMI</SelectItem>
                  <SelectItem value="top_up">Top Up</SelectItem>
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
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Redemption Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvestments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{investment.bookingId}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{investment.userName}</p>
                      <p className="text-xs text-muted-foreground">{investment.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(investment.type)}</TableCell>
                  <TableCell>
                    <span className="font-medium">₹{investment.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(investment.paymentMethod)}
                      <span className="text-sm capitalize">{investment.paymentMethod}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{investment.vehicleName || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{investment.redemptionPoints?.toLocaleString() || 0}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(investment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{investment.createdAt.split('T')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewInvestment(investment)}
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

      {/* Investment Detail Dialog */}
      {viewingInvestment && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Investment Details</DialogTitle>
              <DialogDescription>
                Complete information for {viewingInvestment.bookingId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                  <p className="font-medium">{viewingInvestment.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="font-medium">{viewingInvestment.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingInvestment.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="mt-1">{getTypeBadge(viewingInvestment.type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">₹{viewingInvestment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{viewingInvestment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingInvestment.status)}</div>
                </div>
                {viewingInvestment.vehicleName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                    <p className="font-medium">{viewingInvestment.vehicleName}</p>
                  </div>
                )}
                {viewingInvestment.emiPlan && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">EMI Plan</p>
                    <p className="font-medium">
                      ₹{viewingInvestment.emiPlan.monthlyAmount.toLocaleString()}/month for {viewingInvestment.emiPlan.totalMonths} months
                    </p>
                    <p className="text-xs text-muted-foreground">Interest: {viewingInvestment.emiPlan.interestRate}%</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Redemption Points</p>
                  <p className="font-medium">{viewingInvestment.redemptionPoints?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Redemption Eligible</p>
                  <p className="font-medium">{viewingInvestment.redemptionEligible ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(viewingInvestment.createdAt).toLocaleString()}</p>
                </div>
                {viewingInvestment.completedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed At</p>
                    <p className="font-medium">{new Date(viewingInvestment.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
