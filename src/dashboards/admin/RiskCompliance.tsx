import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  AlertCircle,
  Activity,
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
  totalAlerts: 145,
  activeAlerts: 32,
  resolvedAlerts: 98,
  falsePositives: 15,
  criticalRisks: 5,
  highRisks: 12,
  mediumRisks: 28,
  lowRisks: 100,
  complianceScore: 87,
};

const alertTrendData = [
  { month: 'Jan', alerts: 45, resolved: 38, falsePositives: 5 },
  { month: 'Feb', alerts: 52, resolved: 45, falsePositives: 4 },
  { month: 'Mar', alerts: 48, resolved: 42, falsePositives: 6 },
  { month: 'Apr', alerts: 42, resolved: 38, falsePositives: 3 },
];

const recentAlerts = [
  {
    id: 'ALT-001',
    type: 'Duplicate PAN',
    title: 'Multiple accounts with PAN ABCDE1234F',
    riskLevel: 'critical',
    status: 'active',
    detectedAt: '2024-03-22T10:30:00',
    priority: 'urgent',
  },
  {
    id: 'ALT-002',
    type: 'Bank Abuse',
    title: 'Suspicious bank account activity detected',
    riskLevel: 'high',
    status: 'investigating',
    detectedAt: '2024-03-21T14:20:00',
    priority: 'high',
  },
  {
    id: 'ALT-003',
    type: 'Referral Farming',
    title: 'Unusual referral pattern detected',
    riskLevel: 'medium',
    status: 'active',
    detectedAt: '2024-03-20T09:15:00',
    priority: 'medium',
  },
  {
    id: 'ALT-004',
    type: 'Rapid Growth',
    title: 'Suspicious team growth detected',
    riskLevel: 'high',
    status: 'resolved',
    detectedAt: '2024-03-19T11:00:00',
    priority: 'high',
  },
  {
    id: 'ALT-005',
    type: 'Duplicate PAN',
    title: 'Multiple accounts with PAN XYZAB5678G',
    riskLevel: 'critical',
    status: 'active',
    detectedAt: '2024-03-18T15:45:00',
    priority: 'urgent',
  },
];

const riskDistribution = [
  { category: 'Duplicate PAN', critical: 3, high: 5, medium: 8, low: 12 },
  { category: 'Bank Abuse', critical: 1, high: 4, medium: 10, low: 25 },
  { category: 'Referral Farming', critical: 0, high: 2, medium: 6, low: 35 },
  { category: 'Rapid Growth', critical: 1, high: 1, medium: 4, low: 28 },
];

const getRiskBadge = (riskLevel: string) => {
  switch (riskLevel) {
    case 'critical':
      return <Badge className="bg-destructive text-white">Critical</Badge>;
    case 'high':
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
    case 'low':
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{riskLevel}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-destructive text-white">Active</Badge>;
    case 'investigating':
      return <Badge className="bg-warning text-white">Investigating</Badge>;
    case 'resolved':
      return <Badge className="bg-success text-white">Resolved</Badge>;
    case 'false_positive':
      return <Badge variant="outline">False Positive</Badge>;
    case 'dismissed':
      return <Badge variant="secondary">Dismissed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return <Badge className="bg-destructive text-white">Urgent</Badge>;
    case 'high':
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
    case 'low':
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export const RiskCompliance = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risk & Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor fraud detection, compliance violations, and risk management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
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
                  <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{metrics.activeAlerts}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                  <p className="text-3xl font-bold text-success mt-1">{metrics.complianceScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-info mt-1">{metrics.resolvedAlerts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Risk Level Breakdown */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Risks</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{metrics.criticalRisks}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">High Risks</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">{metrics.highRisks}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Medium Risks</p>
                  <p className="text-3xl font-bold text-yellow-500 mt-1">{metrics.mediumRisks}</p>
                </div>
                <Activity className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Risks</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.lowRisks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alert Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Alert Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alertTrendData}>
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
                <Line type="monotone" dataKey="alerts" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Total Alerts" />
                <Line type="monotone" dataKey="resolved" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Resolved" />
                <Line type="monotone" dataKey="falsePositives" stroke="hsl(38 92% 50%)" strokeWidth={2} name="False Positives" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk Distribution Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Critical</TableHead>
                  <TableHead>High</TableHead>
                  <TableHead>Medium</TableHead>
                  <TableHead>Low</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskDistribution.map((category) => {
                  const total = category.critical + category.high + category.medium + category.low;
                  return (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell>
                        <Badge className="bg-destructive text-white">{category.critical}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-500 text-white">{category.high}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-500 text-white">{category.medium}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.low}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{total}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Alerts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
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
                  <TableHead>Alert ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Detected At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{alert.id}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{alert.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{alert.title}</TableCell>
                    <TableCell>{getRiskBadge(alert.riskLevel)}</TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(alert.detectedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/compliance/duplicate-pan">
                  <Shield className="h-4 w-4 mr-2" />
                  Duplicate PAN Detection
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/compliance/bank-abuse">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Bank Abuse Monitor
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/compliance/referral-farming">
                  <Users className="h-4 w-4 mr-2" />
                  Referral Farming Alerts
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link to="/admin/compliance/rapid-growth">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Rapid Growth Suspicion
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
