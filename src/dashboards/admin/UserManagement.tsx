import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  totalUsers: 11000,
  activeUsers: 8450,
  paidUsers: 3200,
  blockedUsers: 125,
  kycPending: 245,
  kycRejected: 89,
  emailUnverified: 156,
  mobileUnverified: 203,
  newUsersThisMonth: 1200,
};

const monthlyGrowth = [
  { month: 'Jan', users: 8500, new: 800 },
  { month: 'Feb', users: 9200, new: 1000 },
  { month: 'Mar', users: 10100, new: 1200 },
  { month: 'Apr', users: 11000, new: 1500 },
];

const userSegmentation = [
  { segment: 'Active Users', count: 8450, percentage: 76.8 },
  { segment: 'Paid Users', count: 3200, percentage: 29.1 },
  { segment: 'Distributors', count: 1250, percentage: 11.4 },
  { segment: 'Blocked', count: 125, percentage: 1.1 },
];

const COLORS = ['hsl(142 76% 36%)', 'hsl(221 83% 53%)', 'hsl(199 89% 48%)', 'hsl(0 84% 60%)'];

const recentActivity = [
  {
    id: 1,
    type: 'kyc',
    message: '8 new KYC applications submitted',
    timestamp: '2 hours ago',
    icon: FileCheck,
    color: 'text-warning',
  },
  {
    id: 2,
    type: 'user',
    message: '45 new users registered today',
    timestamp: '5 hours ago',
    icon: Users,
    color: 'text-success',
  },
  {
    id: 3,
    type: 'verification',
    message: '12 email verifications completed',
    timestamp: '1 day ago',
    icon: Mail,
    color: 'text-info',
  },
  {
    id: 4,
    type: 'block',
    message: '3 users blocked for policy violation',
    timestamp: '2 days ago',
    icon: UserX,
    color: 'text-destructive',
  },
];

export const UserManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all platform users and their status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/users/active">Active Users</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/users/notify">
              <Bell className="h-4 w-4 mr-2" />
              Send Notification
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
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalUsers.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-success mt-1">{metrics.activeUsers.toLocaleString()}</p>
                </div>
                <UserCheck className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Paid Users</p>
                  <p className="text-3xl font-bold text-info mt-1">{metrics.paidUsers.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">KYC Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{metrics.kycPending}</p>
                </div>
                <FileCheck className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
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
                  <p className="text-sm font-medium text-muted-foreground">Blocked Users</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{metrics.blockedUsers}</p>
                </div>
                <UserX className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Email Unverified</p>
                  <p className="text-3xl font-bold text-warning mt-1">{metrics.emailUnverified}</p>
                </div>
                <Mail className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Mobile Unverified</p>
                  <p className="text-3xl font-bold text-warning mt-1">{metrics.mobileUnverified}</p>
                </div>
                <Phone className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                  <p className="text-3xl font-bold text-success mt-1">{metrics.newUsersThisMonth.toLocaleString()}</p>
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
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyGrowth}>
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
                  <Line type="monotone" dataKey="users" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Total Users" />
                  <Line type="monotone" dataKey="new" stroke="hsl(142 76% 36%)" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User Segmentation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userSegmentation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {userSegmentation.map((entry, index) => (
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
                {userSegmentation.map((item, index) => (
                  <div key={item.segment} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{item.segment}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count.toLocaleString()} ({item.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
                  <Link to="/admin/users/active">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Active Users
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/users/paid">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Paid Users
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/users/blocked">
                    <UserX className="h-4 w-4 mr-2" />
                    Blocked Users
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/users/kyc-pending">
                    <FileCheck className="h-4 w-4 mr-2" />
                    KYC Pending
                    <Badge variant="destructive" className="ml-auto">{metrics.kycPending}</Badge>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/users/email-unverified">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Unverified
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/users/mobile-unverified">
                    <Phone className="h-4 w-4 mr-2" />
                    Mobile Unverified
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/users/notify">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
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

      {/* Alerts */}
      {metrics.kycPending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="border-warning/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      {metrics.kycPending} KYC application{metrics.kycPending > 1 ? 's' : ''} pending review
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review and verify KYC documents for distributor applications
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/users/kyc-pending">Review Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

