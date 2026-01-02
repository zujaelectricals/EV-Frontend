import { motion } from 'framer-motion';
import { Gift, DollarSign, TrendingUp, Award } from 'lucide-react';
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

const staffIncentives = [
  {
    staffId: 'S001',
    staffName: 'Rajesh Kumar',
    role: 'Sales Manager',
    baseIncentive: 15000,
    performanceBonus: 5000,
    targetBonus: 3000,
    total: 23000,
    month: 'March 2024',
  },
  {
    staffId: 'S002',
    staffName: 'Priya Sharma',
    role: 'Lead Manager',
    baseIncentive: 12000,
    performanceBonus: 4500,
    targetBonus: 2500,
    total: 19000,
    month: 'March 2024',
  },
  {
    staffId: 'S003',
    staffName: 'Amit Patel',
    role: 'Verification Officer',
    baseIncentive: 10000,
    performanceBonus: 3000,
    targetBonus: 2000,
    total: 15000,
    month: 'March 2024',
  },
];

const incentiveTrend = [
  { month: 'Jan', amount: 2.5 },
  { month: 'Feb', amount: 2.8 },
  { month: 'Mar', amount: 3.2 },
  { month: 'Apr', amount: 3.5 },
];

export const StaffIncentives = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Incentives Earned</h1>
        <p className="text-muted-foreground mt-1">Track staff incentives and performance bonuses</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Incentives</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹3.2L</p>
                </div>
                <Gift className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹57K</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. per Staff</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹19K</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹23K</p>
                </div>
                <Award className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Incentive Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Incentive Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incentiveTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => `₹${value}L`}
                />
                <Bar dataKey="amount" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Staff Incentives Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Incentive Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Base Incentive</TableHead>
                <TableHead>Performance Bonus</TableHead>
                <TableHead>Target Bonus</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffIncentives.map((staff) => (
                <TableRow key={staff.staffId}>
                  <TableCell className="font-medium">{staff.staffId}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{staff.staffName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{staff.baseIncentive.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-success">
                      ₹{staff.performanceBonus.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-info">₹{staff.targetBonus.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{staff.total.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{staff.month}</span>
                  </TableCell>
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

