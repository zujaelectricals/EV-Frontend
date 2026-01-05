import { motion } from 'framer-motion';
import { useState } from 'react';
import { DollarSign, Users, TrendingUp, Search, Filter, Download, Eye, Calendar, CreditCard } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { UserExtended } from '../types/userManagement';

const mockPaidUsers: UserExtended[] = [
  {
    id: '1',
    userId: 'U12345',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    role: 'distributor',
    status: 'active',
    kycStatus: 'verified',
    emailVerified: true,
    phoneVerified: true,
    joinDate: '2024-01-15',
    totalOrders: 3,
    totalSpent: 125000,
    paymentStatus: 'paid',
  },
  {
    id: '2',
    userId: 'U12346',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    role: 'user',
    status: 'active',
    kycStatus: 'pending',
    emailVerified: true,
    phoneVerified: true,
    joinDate: '2024-02-20',
    totalOrders: 1,
    totalSpent: 45000,
    paymentStatus: 'paid',
  },
  {
    id: '3',
    userId: 'U12347',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    role: 'distributor',
    status: 'active',
    kycStatus: 'verified',
    emailVerified: true,
    phoneVerified: true,
    joinDate: '2024-01-10',
    totalOrders: 5,
    totalSpent: 285000,
    paymentStatus: 'paid',
  },
];

const revenueTrend = [
  { month: 'Jan', revenue: 2500000, users: 850 },
  { month: 'Feb', revenue: 3200000, users: 1020 },
  { month: 'Mar', revenue: 4100000, users: 1280 },
  { month: 'Apr', revenue: 5200000, users: 1650 },
];

const paymentDistribution = [
  { range: '₹0-10K', count: 450 },
  { range: '₹10K-50K', count: 680 },
  { range: '₹50K-1L', count: 320 },
  { range: '₹1L+', count: 200 },
];

export const PaidUsers = () => {
  const [users] = useState<UserExtended[]>(mockPaidUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<UserExtended | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && user.paymentStatus === 'paid';
  });

  const totalPaidUsers = users.filter((u) => u.paymentStatus === 'paid').length;
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
  const averageSpent = totalPaidUsers > 0 ? totalRevenue / totalPaidUsers : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paid Users</h1>
          <p className="text-muted-foreground mt-1">View users who have made payments and track revenue</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Paid Users</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalPaidUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-success mt-1">₹{(totalRevenue / 100000).toFixed(1)}L</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Average Spent</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹{Math.round(averageSpent).toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                  <p className="text-3xl font-bold text-success mt-1">+18.2%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-20" />
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
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrend}>
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
                  <Line type="monotone" dataKey="revenue" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Revenue (₹)" />
                  <Line type="monotone" dataKey="users" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Paid Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="range" stroke="hsl(215 16% 47%)" fontSize={12} />
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Paid Users List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Average Order</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.totalOrders}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-success">₹{user.totalSpent.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ₹{user.totalOrders > 0 ? Math.round(user.totalSpent / user.totalOrders).toLocaleString() : '0'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{user.joinDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setViewingUser(user);
                        setIsViewDialogOpen(true);
                      }}
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

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Payment Details</DialogTitle>
            <DialogDescription>Payment information for {viewingUser?.name}</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="font-medium">{viewingUser.name}</p>
                  <p className="text-xs text-muted-foreground">{viewingUser.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Status</Label>
                  <Badge className="bg-success text-white">Paid</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Orders</Label>
                  <p className="font-medium">{viewingUser.totalOrders}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Spent</Label>
                  <p className="font-bold text-lg text-success">₹{viewingUser.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Average Order Value</Label>
                  <p className="font-medium">
                    ₹{viewingUser.totalOrders > 0 ? Math.round(viewingUser.totalSpent / viewingUser.totalOrders).toLocaleString() : '0'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Join Date</Label>
                  <p className="font-medium">{viewingUser.joinDate}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

