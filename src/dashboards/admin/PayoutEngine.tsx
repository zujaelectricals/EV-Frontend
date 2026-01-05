import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Building2,
  ArrowRight,
  Gift,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const metrics = {
  totalPayouts: 263,
  totalAmount: 6575000,
  completed: 245,
  completedAmount: 6125000,
  pending: 12,
  pendingAmount: 300000,
  failed: 3,
  failedAmount: 75000,
  rejected: 3,
  rejectedAmount: 75000,
  totalTDS: 657500,
  netAmount: 5917500,
};

const monthlyTrend = [
  { month: 'Jan', payouts: 85, amount: 2125000 },
  { month: 'Feb', payouts: 102, amount: 2550000 },
  { month: 'Mar', payouts: 127, amount: 3175000 },
  { month: 'Apr', payouts: 145, amount: 3625000 },
];

const typeDistribution = [
  { type: 'Binary', count: 150, amount: 3750000 },
  { type: 'Referral', count: 75, amount: 1125000 },
  { type: 'Milestone', count: 30, amount: 300000 },
  { type: 'Pool', count: 8, amount: 1400000 },
];

const statusDistribution = [
  { status: 'Completed', value: 245 },
  { status: 'Pending', value: 12 },
  { status: 'Failed', value: 3 },
  { status: 'Rejected', value: 3 },
];

const COLORS = ['hsl(142 76% 36%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(215 16% 47%)'];

const recentActivity = [
  {
    id: 1,
    type: 'approval',
    message: '12 payouts approved and sent for processing',
    timestamp: '2 hours ago',
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    id: 2,
    type: 'settlement',
    message: 'Settlement batch BATCH-2024-003 completed',
    timestamp: '5 hours ago',
    icon: Building2,
    color: 'text-info',
  },
  {
    id: 3,
    type: 'rejection',
    message: '3 payouts rejected due to invalid bank details',
    timestamp: '1 day ago',
    icon: XCircle,
    color: 'text-destructive',
  },
  {
    id: 4,
    type: 'processing',
    message: '45 payouts processed successfully',
    timestamp: '2 days ago',
    icon: DollarSign,
    color: 'text-primary',
  },
];

export const PayoutEngine = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payout Engine</h1>
          <p className="text-muted-foreground mt-1">Manage and process commission payouts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/payout-engine/pending">Pending Payouts</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/payout-engine/pending">
              <CheckCircle className="h-4 w-4 mr-2" />
              Review Pending
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Payouts</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalPayouts}</p>
                  <p className="text-xs text-muted-foreground mt-1">₹{(metrics.totalAmount / 100000).toFixed(1)}L</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-success mt-1">{metrics.completed}</p>
                  <p className="text-xs text-success mt-1">₹{(metrics.completedAmount / 100000).toFixed(1)}L</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{metrics.pending}</p>
                  <p className="text-xs text-warning mt-1">₹{(metrics.pendingAmount / 1000).toFixed(1)}K</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-3xl font-bold text-destructive mt-1">{metrics.failed}</p>
                  <p className="text-xs text-destructive mt-1">₹{(metrics.failedAmount / 1000).toFixed(1)}K</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Amount</p>
                  <p className="text-3xl font-bold text-success mt-1">₹{(metrics.netAmount / 100000).toFixed(1)}L</p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total TDS</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹{(metrics.totalTDS / 1000).toFixed(1)}K</p>
                </div>
                <FileText className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{metrics.rejected}</p>
                  <p className="text-xs text-destructive mt-1">₹{(metrics.rejectedAmount / 1000).toFixed(1)}K</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
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
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Payout Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
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
                  <Line type="monotone" dataKey="payouts" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Payouts" />
                  <Line type="monotone" dataKey="amount" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Amount (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Payout Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {statusDistribution.map((item, index) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{item.status}</p>
                    <p className="text-xs text-muted-foreground">{item.value} payouts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/payout-engine/pending">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Payouts
                    <Badge variant="destructive" className="ml-auto">{metrics.pending}</Badge>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/payout-engine/approved">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approved Payouts
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/payout-engine/rejected">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejected Payouts
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/payout-engine/settlement">
                    <Building2 className="h-4 w-4 mr-2" />
                    Bank Settlement Logs
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className={`mt-0.5 ${activity.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Payouts Alert */}
      {metrics.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="border-warning/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      {metrics.pending} payout{metrics.pending > 1 ? 's' : ''} pending approval
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total amount: ₹{(metrics.pendingAmount / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/payout-engine/pending">Review Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

