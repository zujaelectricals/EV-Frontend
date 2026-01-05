import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
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
import { CommissionReport } from '../types/reports';

const mockReferralCommissions: CommissionReport[] = [
  {
    id: '1',
    commissionId: 'REF-2024-001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    type: 'referral',
    amount: 1000,
    tds: 100,
    netAmount: 900,
    status: 'completed',
    referredUserId: 'U12350',
    referredUserName: 'New User 1',
    createdAt: '2024-03-22T10:30:00',
    paidAt: '2024-03-22T10:30:00',
    payoutId: 'PO-001',
  },
  {
    id: '2',
    commissionId: 'REF-2024-002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    type: 'referral',
    amount: 1000,
    tds: 100,
    netAmount: 900,
    status: 'pending',
    referredUserId: 'U12351',
    referredUserName: 'New User 2',
    createdAt: '2024-03-21T14:20:00',
  },
  {
    id: '3',
    commissionId: 'REF-2024-003',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    type: 'referral',
    amount: 1000,
    tds: 100,
    netAmount: 900,
    status: 'completed',
    referredUserId: 'U12352',
    referredUserName: 'New User 3',
    createdAt: '2024-03-20T09:15:00',
    paidAt: '2024-03-20T09:15:00',
    payoutId: 'PO-002',
  },
];

const commissionTrendData = [
  { month: 'Jan', commissions: 120, amount: 120000 },
  { month: 'Feb', commissions: 145, amount: 145000 },
  { month: 'Mar', commissions: 168, amount: 168000 },
  { month: 'Apr', commissions: 185, amount: 185000 },
];

const referrerPerformance = [
  { referrer: 'Rajesh Kumar', referrals: 25, totalAmount: 25000, tds: 2500, netAmount: 22500, paid: 20, pending: 5 },
  { referrer: 'Priya Sharma', referrals: 20, totalAmount: 20000, tds: 2000, netAmount: 18000, paid: 18, pending: 2 },
  { referrer: 'Amit Patel', referrals: 18, totalAmount: 18000, tds: 1800, netAmount: 16200, paid: 15, pending: 3 },
  { referrer: 'Sneha Reddy', referrals: 15, totalAmount: 15000, tds: 1500, netAmount: 13500, paid: 12, pending: 3 },
  { referrer: 'Vikram Singh', referrals: 12, totalAmount: 12000, tds: 1200, netAmount: 10800, paid: 10, pending: 2 },
];

const commissionStatusSummary = [
  { status: 'Completed', count: 850, totalAmount: 850000, tds: 85000, netAmount: 765000 },
  { status: 'Pending', count: 120, totalAmount: 120000, tds: 12000, netAmount: 108000 },
  { status: 'Processing', count: 50, totalAmount: 50000, tds: 5000, netAmount: 45000 },
  { status: 'Failed', count: 10, totalAmount: 10000, tds: 1000, netAmount: 9000 },
];

const getStatusBadge = (status: string) => {
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
    case 'processing':
      return <Badge className="bg-info text-white">Processing</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const ReferralCommission = () => {
  const [commissions] = useState<CommissionReport[]>(mockReferralCommissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingCommission, setViewingCommission] = useState<CommissionReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredCommissions = commissions.filter((comm) => {
    const matchesSearch =
      comm.commissionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCommissions = commissions.length;
  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidAmount = commissions.filter((c) => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0);
  const pendingAmount = commissions.filter((c) => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
  const avgCommission = totalAmount / totalCommissions;

  const handleViewCommission = (commission: CommissionReport) => {
    setViewingCommission(commission);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Commission</h1>
          <p className="text-muted-foreground mt-1">Track referral commission payouts and trends</p>
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
      <div className="grid gap-4 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalCommissions}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                  <p className="text-3xl font-bold text-info mt-1">₹{paidAmount.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹{pendingAmount.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Commission</p>
                  <p className="text-3xl font-bold text-primary mt-1">₹{Math.round(avgCommission).toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referrer Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Referrer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrerPerformance.map((perf) => (
                  <TableRow key={perf.referrer}>
                    <TableCell className="font-medium">{perf.referrer}</TableCell>
                    <TableCell>{perf.referrals}</TableCell>
                    <TableCell className="font-medium">₹{perf.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{perf.tds.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-success">₹{perf.netAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-white">{perf.paid}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{perf.pending}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission Status Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Commission Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionStatusSummary.map((summary) => (
                  <TableRow key={summary.status}>
                    <TableCell>
                      <Badge variant={summary.status === 'Completed' ? 'default' : 'outline'}>
                        {summary.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{summary.count}</TableCell>
                    <TableCell className="font-medium">₹{summary.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{summary.tds.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-success">₹{summary.netAmount.toLocaleString()}</TableCell>
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
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Commission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={commissionTrendData}>
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
                <Line type="monotone" dataKey="commissions" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Commissions" />
                <Line type="monotone" dataKey="amount" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Amount (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Referral Commissions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search commissions..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commission ID</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TDS</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{commission.commissionId}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{commission.userName}</p>
                      <p className="text-xs text-muted-foreground">{commission.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{commission.referredUserName}</p>
                      <p className="text-xs text-muted-foreground">ID: {commission.referredUserId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{commission.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">₹{commission.tds.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{commission.netAmount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(commission.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{commission.createdAt.split('T')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCommission(commission)}
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

      {/* Commission Detail Dialog */}
      {viewingCommission && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Commission Details</DialogTitle>
              <DialogDescription>
                Complete information for {viewingCommission.commissionId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commission ID</p>
                  <p className="font-medium">{viewingCommission.commissionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{viewingCommission.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referrer</p>
                  <p className="font-medium">{viewingCommission.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingCommission.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referred User</p>
                  <p className="font-medium">{viewingCommission.referredUserName}</p>
                  <p className="text-sm text-muted-foreground">ID: {viewingCommission.referredUserId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">₹{viewingCommission.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TDS</p>
                  <p className="font-medium">₹{viewingCommission.tds.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                  <p className="font-medium">₹{viewingCommission.netAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingCommission.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(viewingCommission.createdAt).toLocaleString()}</p>
                </div>
                {viewingCommission.paidAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid At</p>
                    <p className="font-medium">{new Date(viewingCommission.paidAt).toLocaleString()}</p>
                  </div>
                )}
                {viewingCommission.payoutId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payout ID</p>
                    <p className="font-medium">{viewingCommission.payoutId}</p>
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
