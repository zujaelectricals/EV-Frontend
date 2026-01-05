import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, UserCheck, Search, Filter, Download, Eye, Edit, Ban, Mail, Phone, Calendar, TrendingUp } from 'lucide-react';
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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { UserExtended } from '../types/userManagement';

const mockActiveUsers: UserExtended[] = [
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
    lastLogin: '2024-03-22 10:30',
    totalOrders: 3,
    totalSpent: 125000,
    paymentStatus: 'paid',
    distributorInfo: {
      distributorId: 'D001',
      referralCode: 'REF-RK001',
      verified: true,
      verificationDate: '2024-01-20',
    },
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
    lastLogin: '2024-03-21 14:20',
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
    lastLogin: '2024-03-22 09:15',
    totalOrders: 5,
    totalSpent: 285000,
    paymentStatus: 'paid',
    distributorInfo: {
      distributorId: 'D002',
      referralCode: 'REF-AP002',
      verified: true,
      verificationDate: '2024-01-15',
    },
  },
];

const monthlyActiveUsers = [
  { month: 'Jan', active: 8500, new: 1200 },
  { month: 'Feb', active: 9200, new: 1500 },
  { month: 'Mar', active: 10100, new: 1800 },
  { month: 'Apr', active: 11000, new: 2000 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-success text-white">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'blocked':
      return <Badge variant="destructive">Blocked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'distributor':
      return <Badge variant="default">Distributor</Badge>;
    case 'user':
      return <Badge variant="outline">User</Badge>;
    case 'staff':
      return <Badge className="bg-info text-white">Staff</Badge>;
    case 'admin':
      return <Badge className="bg-primary text-white">Admin</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

export const ActiveUsers = () => {
  const [users] = useState<UserExtended[]>(mockActiveUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewingUser, setViewingUser] = useState<UserExtended | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole && user.status === 'active';
  });

  const totalActive = users.filter((u) => u.status === 'active').length;
  const distributors = users.filter((u) => u.role === 'distributor' && u.status === 'active').length;
  const regularUsers = users.filter((u) => u.role === 'user' && u.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Active Users</h1>
          <p className="text-muted-foreground mt-1">View and manage all active platform users</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Active</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalActive}</p>
                </div>
                <UserCheck className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Distributors</p>
                  <p className="text-3xl font-bold text-info mt-1">{distributors}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
                  <p className="text-3xl font-bold text-primary mt-1">{regularUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-3xl font-bold text-success mt-1">+12.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Active Users Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Active Users Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyActiveUsers}>
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
                <Line type="monotone" dataKey="active" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Active Users" />
                <Line type="monotone" dataKey="new" stroke="hsl(221 83% 53%)" strokeWidth={2} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Users List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
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
                      {user.distributorInfo?.referralCode && (
                        <p className="text-xs text-primary mt-1">Ref: {user.distributorInfo.referralCode}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.kycStatus === 'verified' ? (
                      <Badge className="bg-success text-white">Verified</Badge>
                    ) : user.kycStatus === 'pending' ? (
                      <Badge variant="default">Pending</Badge>
                    ) : (
                      <Badge variant="outline">Not Submitted</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.lastLogin.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{user.totalOrders}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{user.totalSpent.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Ban className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about {viewingUser?.name}</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="font-medium">{viewingUser.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{viewingUser.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{viewingUser.email}</p>
                    {viewingUser.emailVerified ? (
                      <Badge className="bg-success text-white text-xs">Verified</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Unverified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{viewingUser.phone}</p>
                    {viewingUser.phoneVerified ? (
                      <Badge className="bg-success text-white text-xs">Verified</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Unverified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <div className="mt-1">{getRoleBadge(viewingUser.role)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingUser.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">KYC Status</Label>
                  <div className="mt-1">
                    {viewingUser.kycStatus === 'verified' ? (
                      <Badge className="bg-success text-white">Verified</Badge>
                    ) : viewingUser.kycStatus === 'pending' ? (
                      <Badge variant="default">Pending</Badge>
                    ) : (
                      <Badge variant="outline">Not Submitted</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Join Date</Label>
                  <p className="font-medium">{viewingUser.joinDate}</p>
                </div>
                {viewingUser.lastLogin && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Login</Label>
                    <p className="font-medium">{viewingUser.lastLogin}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Total Orders</Label>
                  <p className="font-medium">{viewingUser.totalOrders}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Spent</Label>
                  <p className="font-medium">₹{viewingUser.totalSpent.toLocaleString()}</p>
                </div>
              </div>
              {viewingUser.distributorInfo && (
                <div className="p-3 bg-secondary rounded-lg">
                  <Label className="text-xs text-muted-foreground mb-2 block">Distributor Information</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    {viewingUser.distributorInfo.distributorId && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Distributor ID</Label>
                        <p className="font-medium">{viewingUser.distributorInfo.distributorId}</p>
                      </div>
                    )}
                    {viewingUser.distributorInfo.referralCode && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Referral Code</Label>
                        <p className="font-medium">{viewingUser.distributorInfo.referralCode}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Verified</Label>
                      <p className="font-medium">{viewingUser.distributorInfo.verified ? 'Yes' : 'No'}</p>
                    </div>
                    {viewingUser.distributorInfo.verificationDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Verification Date</Label>
                        <p className="font-medium">{viewingUser.distributorInfo.verificationDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

