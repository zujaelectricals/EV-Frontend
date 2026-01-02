import { motion } from 'framer-motion';
import { Clock, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const delayData = [
  {
    staffId: 'S001',
    staffName: 'Rajesh Kumar',
    role: 'Sales Manager',
    pendingApprovals: 5,
    avgDelay: 2.5,
    maxDelay: 5,
    status: 'good',
  },
  {
    staffId: 'S002',
    staffName: 'Priya Sharma',
    role: 'Lead Manager',
    pendingApprovals: 12,
    avgDelay: 4.2,
    maxDelay: 8,
    status: 'warning',
  },
  {
    staffId: 'S003',
    staffName: 'Amit Patel',
    role: 'Verification Officer',
    pendingApprovals: 8,
    avgDelay: 3.8,
    maxDelay: 6,
    status: 'warning',
  },
];

const delayTrend = [
  { day: 'Mon', avgDelay: 2.5 },
  { day: 'Tue', avgDelay: 3.2 },
  { day: 'Wed', avgDelay: 2.8 },
  { day: 'Thu', avgDelay: 4.1 },
  { day: 'Fri', avgDelay: 3.5 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'good':
      return <Badge className="bg-success text-white">Good</Badge>;
    case 'warning':
      return <Badge variant="default">Needs Attention</Badge>;
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const ApprovalDelayReport = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Approval Delay Report</h1>
        <p className="text-muted-foreground mt-1">Monitor approval processing delays and bottlenecks</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Delay</p>
                  <p className="text-3xl font-bold text-foreground mt-1">3.5 hrs</p>
                </div>
                <Clock className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                  <p className="text-3xl font-bold text-warning mt-1">25</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">On Time Rate</p>
                  <p className="text-3xl font-bold text-success mt-1">78%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Max Delay</p>
                  <p className="text-3xl font-bold text-destructive mt-1">8 hrs</p>
                </div>
                <TrendingUp className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delay Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Average Delay Trend (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={delayTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="day" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => `${value} hrs`}
                />
                <Bar dataKey="avgDelay" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Staff Delay Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Approval Delay Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Avg. Delay</TableHead>
                <TableHead>Max Delay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delayData.map((staff) => (
                <TableRow key={staff.staffId}>
                  <TableCell className="font-medium">{staff.staffId}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{staff.staffName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-warning">{staff.pendingApprovals}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{staff.avgDelay} hrs</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-destructive">{staff.maxDelay} hrs</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(staff.status)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="cursor-pointer">
                      View Details
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

