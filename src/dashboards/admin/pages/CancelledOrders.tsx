import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const cancelledOrders = [
  {
    id: 'CO001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    vehicle: 'EV Scooter Pro',
    amount: 125000,
    cancelledDate: '2024-03-20',
    reason: 'Changed mind',
    refundStatus: 'processed',
  },
  {
    id: 'CO002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    vehicle: 'EV Bike Elite',
    amount: 250000,
    cancelledDate: '2024-03-18',
    reason: 'Financial issues',
    refundStatus: 'pending',
  },
];

const cancellationTrend = [
  { month: 'Jan', count: 12, amount: 1.5 },
  { month: 'Feb', count: 15, amount: 1.8 },
  { month: 'Mar', count: 18, amount: 2.2 },
  { month: 'Apr', count: 22, amount: 2.6 },
];

export const CancelledOrders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cancelled Orders</h1>
        <p className="text-muted-foreground mt-1">Track cancelled orders and refund status</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Cancelled</p>
                  <p className="text-3xl font-bold text-foreground mt-1">67</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-3xl font-bold text-foreground mt-1">₹8.2M</p>
                </div>
                <DollarSign className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Refund Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">12</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-1">5.4%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cancellation Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cancellationTrend}>
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
                <Line type="monotone" dataKey="count" stroke="hsl(0 84% 60%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancelled Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Cancellations</CardTitle>
            <Input placeholder="Search..." className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Cancelled Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Refund Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cancelledOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{order.userName}</p>
                      <p className="text-xs text-muted-foreground">{order.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{order.vehicle}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{order.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{order.cancelledDate}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{order.reason}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.refundStatus === 'processed' ? 'default' : 'destructive'}
                    >
                      {order.refundStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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

