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
  Users,
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

const mockTeamCommissions: CommissionReport[] = [
  {
    id: '1',
    commissionId: 'BIN-2024-001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    type: 'binary',
    amount: 10000,
    tds: 1000,
    poolMoney: 2000,
    netAmount: 7000,
    status: 'completed',
    pairCount: 5,
    createdAt: '2024-03-22T10:30:00',
    paidAt: '2024-03-22T10:30:00',
    payoutId: 'PO-001',
  },
  {
    id: '2',
    commissionId: 'BIN-2024-002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    type: 'binary',
    amount: 20000,
    tds: 2000,
    poolMoney: 4000,
    netAmount: 14000,
    status: 'pending',
    pairCount: 10,
    createdAt: '2024-03-21T14:20:00',
  },
  {
    id: '3',
    commissionId: 'BIN-2024-003',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    type: 'binary',
    amount: 4000,
    tds: 400,
    poolMoney: 800,
    netAmount: 2800,
    status: 'completed',
    pairCount: 2,
    createdAt: '2024-03-20T09:15:00',
    paidAt: '2024-03-20T09:15:00',
    payoutId: 'PO-002',
  },
];

const commissionTrendData = [
  { month: 'Jan', commissions: 85, pairs: 425, amount: 850000 },
  { month: 'Feb', commissions: 92, pairs: 460, amount: 920000 },
  { month: 'Mar', commissions: 105, pairs: 525, amount: 1050000 },
  { month: 'Apr', commissions: 120, pairs: 600, amount: 1200000 },
];

const distributorPerformance = [
  { distributor: 'Rajesh Kumar', pairs: 25, totalAmount: 50000, tds: 5000, poolMoney: 10000, netAmount: 35000, paid: 20, pending: 5 },
  { distributor: 'Priya Sharma', pairs: 20, totalAmount: 40000, tds: 4000, poolMoney: 8000, netAmount: 28000, paid: 18, pending: 2 },
  { distributor: 'Amit Patel', pairs: 18, totalAmount: 36000, tds: 3600, poolMoney: 7200, netAmount: 25200, paid: 15, pending: 3 },
  { distributor: 'Sneha Reddy', pairs: 15, totalAmount: 30000, tds: 3000, poolMoney: 6000, netAmount: 21000, paid: 12, pending: 3 },
  { distributor: 'Vikram Singh', pairs: 12, totalAmount: 24000, tds: 2400, poolMoney: 4800, netAmount: 16800, paid: 10, pending: 2 },
];

const commissionBreakdown = [
  { status: 'Completed', count: 850, totalAmount: 17000000, tds: 1700000, poolMoney: 3400000, netAmount: 11900000 },
  { status: 'Pending', count: 120, totalAmount: 2400000, tds: 240000, poolMoney: 480000, netAmount: 1680000 },
  { status: 'Processing', count: 50, totalAmount: 1000000, tds: 100000, poolMoney: 200000, netAmount: 700000 },
  { status: 'Failed', count: 10, totalAmount: 200000, tds: 20000, poolMoney: 40000, netAmount: 140000 },
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

export const TeamCommission = () => {
  const [commissions] = useState<CommissionReport[]>(mockTeamCommissions);
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
  const totalPairs = commissions.reduce((sum, c) => sum + (c.pairCount || 0), 0);
  const totalAmount = commissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPoolMoney = commissions.reduce((sum, c) => sum + (c.poolMoney || 0), 0);
  const netPayout = commissions.reduce((sum, c) => sum + c.netAmount, 0);
  const avgPerPair = totalPairs > 0 ? totalAmount / totalPairs : 0;

  const handleViewCommission = (commission: CommissionReport) => {
    setViewingCommission(commission);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Commission (Binary)</h1>
          <p className="text-muted-foreground mt-1">Track binary/team commission payouts and pair matching</p>
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
      <div className="grid gap-4 md:grid-cols-6">
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
                  <p className="text-sm font-medium text-muted-foreground">Total Pairs</p>
                  <p className="text-3xl font-bold text-info mt-1">{totalPairs}</p>
                </div>
                <Users className="h-8 w-8 text-info opacity-20" />
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
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pool Money</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹{totalPoolMoney.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Net Payout</p>
                  <p className="text-3xl font-bold text-primary mt-1">₹{netPayout.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg per Pair</p>
                  <p className="text-3xl font-bold text-info mt-1">₹{Math.round(avgPerPair).toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Distributor Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Distributor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Pairs</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Pool Money</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributorPerformance.map((perf) => (
                  <TableRow key={perf.distributor}>
                    <TableCell className="font-medium">{perf.distributor}</TableCell>
                    <TableCell className="font-medium">{perf.pairs}</TableCell>
                    <TableCell className="font-medium">₹{perf.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{perf.tds.toLocaleString()}</TableCell>
                    <TableCell>₹{perf.poolMoney.toLocaleString()}</TableCell>
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

      {/* Commission Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Pool Money</TableHead>
                  <TableHead>Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionBreakdown.map((breakdown) => (
                  <TableRow key={breakdown.status}>
                    <TableCell>
                      <Badge variant={breakdown.status === 'Completed' ? 'default' : 'outline'}>
                        {breakdown.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{breakdown.count}</TableCell>
                    <TableCell className="font-medium">₹{breakdown.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{breakdown.tds.toLocaleString()}</TableCell>
                    <TableCell>₹{breakdown.poolMoney.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-success">₹{breakdown.netAmount.toLocaleString()}</TableCell>
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
        transition={{ delay: 0.8 }}
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
                <Line type="monotone" dataKey="pairs" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Pairs" />
                <Line type="monotone" dataKey="amount" stroke="hsl(38 92% 50%)" strokeWidth={2} name="Amount (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Commissions</CardTitle>
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
                <TableHead>Distributor</TableHead>
                <TableHead>Pairs</TableHead>
                <TableHead>Amount per Pair</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>TDS</TableHead>
                <TableHead>Pool Money</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => {
                const amountPerPair = commission.pairCount ? commission.amount / commission.pairCount : 0;
                return (
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
                      <span className="font-medium">{commission.pairCount || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">₹{Math.round(amountPerPair).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₹{commission.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">₹{commission.tds.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">₹{(commission.poolMoney || 0).toLocaleString()}</span>
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
                );
              })}
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
                  <p className="text-sm font-medium text-muted-foreground">Distributor</p>
                  <p className="font-medium">{viewingCommission.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingCommission.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pairs</p>
                  <p className="font-medium">{viewingCommission.pairCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">₹{viewingCommission.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount per Pair</p>
                  <p className="font-medium">
                    ₹{viewingCommission.pairCount ? Math.round(viewingCommission.amount / viewingCommission.pairCount).toLocaleString() : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TDS</p>
                  <p className="font-medium">₹{viewingCommission.tds.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pool Money</p>
                  <p className="font-medium">₹{(viewingCommission.poolMoney || 0).toLocaleString()}</p>
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
