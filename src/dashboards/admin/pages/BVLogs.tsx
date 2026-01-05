import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
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
import { BVReport, BVTransactionType } from '../types/reports';

const mockBVTransactions: BVReport[] = [
  {
    id: '1',
    transactionId: 'BV-2024-001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    distributorId: 'D001',
    distributorName: 'Rajesh Kumar',
    type: 'generated',
    amount: 50000,
    leftBV: 25000,
    rightBV: 25000,
    balance: 50000,
    source: 'booking',
    description: 'BV generated from pre-booking',
    createdAt: '2024-03-22T10:30:00',
  },
  {
    id: '2',
    transactionId: 'BV-2024-002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    distributorId: 'D002',
    distributorName: 'Priya Sharma',
    type: 'distributed',
    amount: 30000,
    leftBV: 15000,
    rightBV: 15000,
    balance: 30000,
    source: 'commission',
    description: 'BV distributed to team',
    createdAt: '2024-03-21T14:20:00',
  },
  {
    id: '3',
    transactionId: 'BV-2024-003',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    distributorId: 'D003',
    distributorName: 'Amit Patel',
    type: 'used',
    amount: 20000,
    leftBV: 10000,
    rightBV: 10000,
    balance: 20000,
    source: 'booking',
    description: 'BV used for commission calculation',
    createdAt: '2024-03-20T09:15:00',
  },
  {
    id: '4',
    transactionId: 'BV-2024-004',
    userId: 'U12348',
    userName: 'Sneha Reddy',
    userEmail: 'sneha@example.com',
    distributorId: 'D004',
    distributorName: 'Sneha Reddy',
    type: 'generated',
    amount: 40000,
    leftBV: 20000,
    rightBV: 20000,
    balance: 40000,
    source: 'booking',
    description: 'BV generated from full payment',
    createdAt: '2024-03-19T11:00:00',
  },
];

const bvTrendData = [
  { month: 'Jan', generated: 850000, distributed: 750000, used: 500000 },
  { month: 'Feb', generated: 920000, distributed: 820000, used: 580000 },
  { month: 'Mar', generated: 1050000, distributed: 950000, used: 650000 },
  { month: 'Apr', generated: 1200000, distributed: 1100000, used: 750000 },
];

const bvTypeSummary = [
  { type: 'Generated', count: 1250, totalAmount: 62500000, avgAmount: 50000, active: 1200 },
  { type: 'Distributed', count: 1100, totalAmount: 55000000, avgAmount: 50000, active: 1100 },
  { type: 'Used', count: 850, totalAmount: 42500000, avgAmount: 50000, active: 0 },
  { type: 'Expired', count: 50, totalAmount: 2500000, avgAmount: 50000, active: 0 },
];

const bvSourceSummary = [
  { source: 'Booking', count: 1800, totalAmount: 90000000, percentage: 72 },
  { source: 'Commission', count: 500, totalAmount: 25000000, percentage: 20 },
  { source: 'Transfer', count: 200, totalAmount: 10000000, percentage: 8 },
];

const getTypeBadge = (type: BVTransactionType) => {
  switch (type) {
    case 'generated':
      return <Badge className="bg-success text-white">Generated</Badge>;
    case 'distributed':
      return <Badge className="bg-info text-white">Distributed</Badge>;
    case 'used':
      return <Badge className="bg-warning text-white">Used</Badge>;
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const BVLogs = () => {
  const [bvTransactions] = useState<BVReport[]>(mockBVTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewingBV, setViewingBV] = useState<BVReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredBV = bvTransactions.filter((bv) => {
    const matchesSearch =
      bv.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bv.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || bv.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalBVGenerated = bvTransactions.filter((b) => b.type === 'generated').reduce((sum, b) => sum + b.amount, 0);
  const totalBVDistributed = bvTransactions.filter((b) => b.type === 'distributed').reduce((sum, b) => sum + b.amount, 0);
  const totalBVUsed = bvTransactions.filter((b) => b.type === 'used').reduce((sum, b) => sum + b.amount, 0);
  const activeBV = bvTransactions.filter((b) => b.type === 'generated' || b.type === 'distributed').reduce((sum, b) => sum + b.balance, 0);

  const handleViewBV = (bv: BVReport) => {
    setViewingBV(bv);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">BV Logs</h1>
          <p className="text-muted-foreground mt-1">Track Business Volume transactions and distributions</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total BV Generated</p>
                  <p className="text-3xl font-bold text-success mt-1">₹{totalBVGenerated.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total BV Distributed</p>
                  <p className="text-3xl font-bold text-info mt-1">₹{totalBVDistributed.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total BV Used</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹{totalBVUsed.toLocaleString()}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active BV</p>
                  <p className="text-3xl font-bold text-primary mt-1">₹{activeBV.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* BV Type Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>BV Type Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Avg Amount</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bvTypeSummary.map((summary) => (
                  <TableRow key={summary.type}>
                    <TableCell>
                      <Badge variant="outline">{summary.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{summary.count}</TableCell>
                    <TableCell className="font-medium">₹{summary.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>₹{summary.avgAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-success text-white">{summary.active}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* BV Source Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>BV Source Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bvSourceSummary.map((summary) => (
                  <TableRow key={summary.source}>
                    <TableCell className="font-medium capitalize">{summary.source}</TableCell>
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
            <CardTitle>Monthly BV Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bvTrendData}>
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
                <Line type="monotone" dataKey="generated" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Generated" />
                <Line type="monotone" dataKey="distributed" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Distributed" />
                <Line type="monotone" dataKey="used" stroke="hsl(38 92% 50%)" strokeWidth={2} name="Used" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* BV Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>BV Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search BV transactions..."
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
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Left BV</TableHead>
                <TableHead>Right BV</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBV.map((bv) => (
                <TableRow key={bv.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{bv.transactionId}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{bv.userName}</p>
                      <p className="text-xs text-muted-foreground">{bv.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(bv.type)}</TableCell>
                  <TableCell>
                    <span className="font-medium">₹{bv.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">₹{bv.leftBV?.toLocaleString() || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">₹{bv.rightBV?.toLocaleString() || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{bv.balance.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{bv.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{bv.createdAt.split('T')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewBV(bv)}
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

      {/* BV Detail Dialog */}
      {viewingBV && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>BV Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information for {viewingBV.transactionId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="font-medium">{viewingBV.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="font-medium">{viewingBV.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingBV.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="mt-1">{getTypeBadge(viewingBV.type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">₹{viewingBV.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Left BV</p>
                  <p className="font-medium">₹{viewingBV.leftBV?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Right BV</p>
                  <p className="font-medium">₹{viewingBV.rightBV?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                  <p className="font-medium">₹{viewingBV.balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{viewingBV.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="font-medium">{viewingBV.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="font-medium">{new Date(viewingBV.createdAt).toLocaleString()}</p>
                </div>
                {viewingBV.expiresAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expires At</p>
                    <p className="font-medium">{new Date(viewingBV.expiresAt).toLocaleString()}</p>
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
