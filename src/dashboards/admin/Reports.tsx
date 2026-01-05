import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Bell,
  ArrowRight,
  Download,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const metrics = {
  totalTransactions: 12450,
  totalInvestments: 3250,
  totalBV: 850000,
  totalCommissions: 2450,
  activeUsers: 1250,
  notificationsSent: 15600,
};

const monthlyData = [
  { month: 'Jan', transactions: 1850, investments: 480, commissions: 320, amount: 1250000 },
  { month: 'Feb', transactions: 2100, investments: 520, commissions: 380, amount: 1450000 },
  { month: 'Mar', transactions: 2350, investments: 580, commissions: 420, amount: 1650000 },
  { month: 'Apr', transactions: 2650, investments: 650, commissions: 480, amount: 1850000 },
];

const recentTransactions = [
  { id: 'TXN-001', type: 'Payment', user: 'Rajesh Kumar', amount: 50000, status: 'Completed', date: '2024-03-22' },
  { id: 'TXN-002', type: 'Commission', user: 'Priya Sharma', amount: 2000, status: 'Completed', date: '2024-03-21' },
  { id: 'TXN-003', type: 'Payout', user: 'Amit Patel', amount: 15000, status: 'Pending', date: '2024-03-22' },
  { id: 'TXN-004', type: 'Investment', user: 'Sneha Reddy', amount: 75000, status: 'Completed', date: '2024-03-21' },
  { id: 'TXN-005', type: 'Refund', user: 'Vikram Singh', amount: 10000, status: 'Completed', date: '2024-03-20' },
];

const topPerformers = [
  { rank: 1, user: 'Rajesh Kumar', transactions: 125, investments: 850000, commissions: 50000 },
  { rank: 2, user: 'Priya Sharma', transactions: 98, investments: 650000, commissions: 45000 },
  { rank: 3, user: 'Amit Patel', transactions: 87, investments: 580000, commissions: 38000 },
  { rank: 4, user: 'Sneha Reddy', transactions: 76, investments: 520000, commissions: 32000 },
  { rank: 5, user: 'Vikram Singh', transactions: 65, investments: 450000, commissions: 28000 },
];

export const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive analytics and reporting for all platform activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalTransactions.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
                  <p className="text-3xl font-bold text-info mt-1">{metrics.totalInvestments.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total BV</p>
                  <p className="text-3xl font-bold text-success mt-1">₹{metrics.totalBV.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                  <p className="text-3xl font-bold text-warning mt-1">{metrics.totalCommissions.toLocaleString()}</p>
                </div>
                <FileText className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-primary mt-1">{metrics.activeUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Notifications Sent</p>
                  <p className="text-3xl font-bold text-info mt-1">{metrics.notificationsSent.toLocaleString()}</p>
                </div>
                <Bell className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Trend Chart - Single Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity Trend</CardTitle>
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
                <Legend />
                <Line type="monotone" dataKey="transactions" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Transactions" />
                <Line type="monotone" dataKey="investments" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Investments" />
                <Line type="monotone" dataKey="commissions" stroke="hsl(38 92% 50%)" strokeWidth={2} name="Commissions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabular Data Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/reports/transactions">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{txn.id}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{txn.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{txn.user}</TableCell>
                      <TableCell className="font-medium">₹{txn.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={txn.status === 'Completed' ? 'bg-success text-white' : 'bg-warning text-white'}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{txn.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <div className="flex items-center justify-between">
                <CardTitle>Top Performers</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Investments</TableHead>
                    <TableHead>Commissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((performer) => (
                    <TableRow key={performer.rank}>
                      <TableCell>
                        <Badge variant={performer.rank <= 3 ? 'default' : 'outline'}>
                          #{performer.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{performer.user}</TableCell>
                      <TableCell>{performer.transactions}</TableCell>
                      <TableCell className="font-medium">₹{performer.investments.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-success">₹{performer.commissions.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/reports/transactions">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Transaction History
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/reports/investments">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Investment Logs
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/reports/bv">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  BV Logs
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/reports/referral">
                  <FileText className="h-4 w-4 mr-2" />
                  Referral Commission
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/reports/binary">
                  <FileText className="h-4 w-4 mr-2" />
                  Team Commission
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/reports/login">
                  <Users className="h-4 w-4 mr-2" />
                  Login History
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/reports/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification History
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
