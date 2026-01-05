import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  LogIn,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  Globe,
} from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { LoginHistoryReport, LoginStatus } from '../types/reports';

const mockLoginHistory: LoginHistoryReport[] = [
  {
    id: '1',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    loginTime: '2024-03-22T10:30:00',
    logoutTime: '2024-03-22T12:45:00',
    ipAddress: '192.168.1.100',
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows 11',
    location: 'Mumbai, India',
    status: 'success',
    sessionDuration: 135,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: '2',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    loginTime: '2024-03-22T09:15:00',
    ipAddress: '192.168.1.101',
    device: 'Mobile',
    browser: 'Safari',
    os: 'iOS 17',
    location: 'Delhi, India',
    status: 'success',
    sessionDuration: 0,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  },
  {
    id: '3',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    loginTime: '2024-03-21T14:20:00',
    ipAddress: '192.168.1.102',
    device: 'Desktop',
    browser: 'Firefox',
    os: 'Linux',
    location: 'Bangalore, India',
    status: 'failed',
    sessionDuration: 0,
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101',
  },
];

const loginActivityData = [
  { day: 'Mon', logins: 1250, failed: 25 },
  { day: 'Tue', logins: 1320, failed: 30 },
  { day: 'Wed', logins: 1280, failed: 28 },
  { day: 'Thu', logins: 1450, failed: 35 },
  { day: 'Fri', logins: 1500, failed: 40 },
  { day: 'Sat', logins: 980, failed: 20 },
  { day: 'Sun', logins: 850, failed: 15 },
];

const deviceSummary = [
  { device: 'Desktop', count: 1250, percentage: 45, avgSession: 120 },
  { device: 'Mobile', count: 1200, percentage: 43, avgSession: 45 },
  { device: 'Tablet', count: 350, percentage: 13, avgSession: 60 },
];

const loginStatusSummary = [
  { status: 'Success', count: 2650, percentage: 94 },
  { status: 'Failed', count: 150, percentage: 5 },
  { status: 'Blocked', count: 20, percentage: 1 },
];

const locationSummary = [
  { location: 'Mumbai', count: 850, percentage: 30 },
  { location: 'Delhi', count: 750, percentage: 27 },
  { location: 'Bangalore', count: 650, percentage: 23 },
  { location: 'Chennai', count: 400, percentage: 14 },
  { location: 'Other', count: 200, percentage: 7 },
];

const getStatusBadge = (status: LoginStatus) => {
  switch (status) {
    case 'success':
      return (
        <Badge className="bg-success text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case 'blocked':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Blocked
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const LoginHistory = () => {
  const [loginHistory] = useState<LoginHistoryReport[]>(mockLoginHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [viewingLogin, setViewingLogin] = useState<LoginHistoryReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredLogins = loginHistory.filter((login) => {
    const matchesSearch =
      login.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      login.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      login.ipAddress.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || login.status === statusFilter;
    const matchesDevice = deviceFilter === 'all' || login.device.toLowerCase() === deviceFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesDevice;
  });

  const totalLogins = loginHistory.length;
  const uniqueUsers = new Set(loginHistory.map((l) => l.userId)).size;
  const failedLogins = loginHistory.filter((l) => l.status === 'failed').length;
  const activeSessions = loginHistory.filter((l) => l.status === 'success' && !l.logoutTime).length;
  const avgLoginsPerUser = uniqueUsers > 0 ? totalLogins / uniqueUsers : 0;

  const handleViewLogin = (login: LoginHistoryReport) => {
    setViewingLogin(login);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Login History</h1>
          <p className="text-muted-foreground mt-1">Track user login activities and security events</p>
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
      <div className="grid gap-4 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Logins</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalLogins}</p>
                </div>
                <LogIn className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                  <p className="text-3xl font-bold text-info mt-1">{uniqueUsers}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{failedLogins}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <p className="text-3xl font-bold text-success mt-1">{activeSessions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Logins/User</p>
                  <p className="text-3xl font-bold text-primary mt-1">{avgLoginsPerUser.toFixed(1)}</p>
                </div>
                <LogIn className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Device Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Avg Session (min)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deviceSummary.map((device) => (
                    <TableRow key={device.device}>
                      <TableCell className="font-medium">{device.device}</TableCell>
                      <TableCell>{device.count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{device.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{device.avgSession} min</TableCell>
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
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Login Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginStatusSummary.map((status) => (
                    <TableRow key={status.status}>
                      <TableCell>
                        <Badge variant={status.status === 'Success' ? 'default' : 'destructive'}>
                          {status.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{status.count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status.status === 'Success' ? 'bg-success' : 'bg-destructive'
                              }`}
                              style={{ width: `${status.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{status.percentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Location Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Login Location Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationSummary.map((loc) => (
                  <TableRow key={loc.location}>
                    <TableCell className="font-medium">{loc.location}</TableCell>
                    <TableCell>{loc.count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${loc.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{loc.percentage}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Activity Chart - Single Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Weekly Login Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={loginActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="day" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Successful Logins" />
                <Line type="monotone" dataKey="failed" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Failed Logins" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Login History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Login History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logins..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
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
                <TableHead>Login Time</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Session Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogins.map((login) => (
                <TableRow key={login.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{login.userName}</p>
                      <p className="text-xs text-muted-foreground">{login.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{new Date(login.loginTime).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-secondary px-2 py-1 rounded">{login.ipAddress}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{login.device}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{login.browser}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{login.os}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{login.location || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(login.status)}</TableCell>
                  <TableCell>
                    {login.sessionDuration ? (
                      <span className="text-sm">{login.sessionDuration} min</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewLogin(login)}
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

      {/* Login Detail Dialog */}
      {viewingLogin && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Login Details</DialogTitle>
              <DialogDescription>
                Complete information for login session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="font-medium">{viewingLogin.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingLogin.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingLogin.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Login Time</p>
                  <p className="font-medium">{new Date(viewingLogin.loginTime).toLocaleString()}</p>
                </div>
                {viewingLogin.logoutTime && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Logout Time</p>
                    <p className="font-medium">{new Date(viewingLogin.logoutTime).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="font-medium">{viewingLogin.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="font-medium">{viewingLogin.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Device</p>
                  <p className="font-medium">{viewingLogin.device}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Browser</p>
                  <p className="font-medium">{viewingLogin.browser}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">OS</p>
                  <p className="font-medium">{viewingLogin.os}</p>
                </div>
                {viewingLogin.sessionDuration && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Session Duration</p>
                    <p className="font-medium">{viewingLogin.sessionDuration} minutes</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                  <p className="font-medium text-xs break-all">{viewingLogin.userAgent}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
