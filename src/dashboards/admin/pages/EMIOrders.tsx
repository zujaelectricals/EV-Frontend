import { motion } from 'framer-motion';
import { CreditCard, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const emiOrders = [
  {
    id: 'EMI001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    vehicle: 'EV Scooter Pro',
    totalAmount: 125000,
    emiAmount: 12500,
    tenure: 10,
    paid: 3,
    remaining: 7,
    nextDue: '2024-04-15',
    status: 'active',
  },
  {
    id: 'EMI002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    vehicle: 'EV Bike Elite',
    totalAmount: 250000,
    emiAmount: 25000,
    tenure: 10,
    paid: 5,
    remaining: 5,
    nextDue: '2024-04-20',
    status: 'active',
  },
  {
    id: 'EMI003',
    userId: 'U12347',
    userName: 'Amit Patel',
    vehicle: 'EV Scooter Pro',
    totalAmount: 125000,
    emiAmount: 12500,
    tenure: 10,
    paid: 10,
    remaining: 0,
    nextDue: '-',
    status: 'completed',
  },
];

const emiStats = [
  { month: 'Jan', amount: 2.5, orders: 45 },
  { month: 'Feb', amount: 3.2, orders: 58 },
  { month: 'Mar', amount: 4.1, orders: 72 },
  { month: 'Apr', amount: 4.8, orders: 85 },
];

export const EMIOrders = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">EMI Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage all EMI-based orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
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
                  <p className="text-sm font-medium text-muted-foreground">Total EMI Orders</p>
                  <p className="text-3xl font-bold text-foreground mt-1">850</p>
                </div>
                <CreditCard className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active EMIs</p>
                  <p className="text-3xl font-bold text-info mt-1">720</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Monthly Collection</p>
                  <p className="text-3xl font-bold text-success mt-1">₹4.8M</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹68.5M</p>
                </div>
                <Calendar className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* EMI Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>EMI Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emiStats}>
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
                <Bar dataKey="amount" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* EMI Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All EMI Orders</CardTitle>
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
                <TableHead>Total Amount</TableHead>
                <TableHead>EMI Amount</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emiOrders.map((order) => (
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
                    <span className="font-bold text-foreground">₹{order.totalAmount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">₹{order.emiAmount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {order.paid}/{order.tenure}
                      </span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-20">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(order.paid / order.tenure) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{order.nextDue}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={order.status === 'active' ? 'bg-info text-white' : 'bg-success text-white'}>
                      {order.status}
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

