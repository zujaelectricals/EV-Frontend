import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'recharts';

const conversionData = [
  {
    staffId: 'S001',
    staffName: 'Rajesh Kumar',
    role: 'Sales Manager',
    leads: 50,
    converted: 38,
    conversionRate: 76,
    status: 'excellent',
  },
  {
    staffId: 'S002',
    staffName: 'Priya Sharma',
    role: 'Lead Manager',
    leads: 75,
    converted: 52,
    conversionRate: 69.3,
    status: 'good',
  },
  {
    staffId: 'S003',
    staffName: 'Amit Patel',
    role: 'Verification Officer',
    leads: 100,
    converted: 65,
    conversionRate: 65,
    status: 'average',
  },
];

const monthlyConversion = [
  { month: 'Jan', rate: 68 },
  { month: 'Feb', rate: 72 },
  { month: 'Mar', rate: 75 },
  { month: 'Apr', rate: 70 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'excellent':
      return <Badge className="bg-success text-white">Excellent</Badge>;
    case 'good':
      return <Badge variant="default">Good</Badge>;
    case 'average':
      return <Badge variant="secondary">Average</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const LeadConversionRate = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lead Conversion Rate</h1>
        <p className="text-muted-foreground mt-1">Track staff lead conversion performance</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Overall Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-1">70%</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-3xl font-bold text-foreground mt-1">225</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Converted</p>
                  <p className="text-3xl font-bold text-success mt-1">155</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Target Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-1">75%</p>
                </div>
                <Target className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Conversion Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Conversion Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyConversion}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => `${value}%`}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(142 76% 36%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142 76% 36%)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Staff Conversion Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Conversion Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Converted</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionData.map((staff) => (
                <TableRow key={staff.staffId}>
                  <TableCell className="font-medium">{staff.staffId}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{staff.staffName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{staff.leads}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-success">{staff.converted}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{staff.conversionRate}%</span>
                      </div>
                      <Progress
                        value={staff.conversionRate}
                        className={`h-2 ${
                          staff.conversionRate >= 75
                            ? '[&>div]:bg-success'
                            : staff.conversionRate >= 65
                            ? '[&>div]:bg-warning'
                            : '[&>div]:bg-destructive'
                        }`}
                      />
                    </div>
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

