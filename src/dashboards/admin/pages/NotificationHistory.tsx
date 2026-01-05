import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
  Mail,
  MessageSquare,
  TrendingUp,
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
import { NotificationHistoryReport, NotificationType, NotificationStatus } from '../types/reports';

const mockNotifications: NotificationHistoryReport[] = [
  {
    id: '1',
    notificationId: 'NOT-2024-001',
    type: 'email',
    subject: 'Welcome to EV Nexus Platform',
    body: 'Thank you for joining our platform...',
    recipientCount: 500,
    sentAt: '2024-03-22T10:30:00',
    deliveredCount: 485,
    openedCount: 320,
    clickedCount: 150,
    failedCount: 15,
    deliveryRate: 97,
    openRate: 66,
    clickRate: 31,
    status: 'sent',
    segment: 'new_users',
  },
  {
    id: '2',
    notificationId: 'NOT-2024-002',
    type: 'sms',
    subject: 'Payment Reminder',
    body: 'Your payment is due in 3 days...',
    recipientCount: 250,
    sentAt: '2024-03-21T14:20:00',
    deliveredCount: 245,
    openedCount: 200,
    clickedCount: 80,
    failedCount: 5,
    deliveryRate: 98,
    openRate: 82,
    clickRate: 33,
    status: 'sent',
    segment: 'pending_payments',
  },
  {
    id: '3',
    notificationId: 'NOT-2024-003',
    type: 'push',
    subject: 'New Commission Available',
    body: 'You have a new commission payout...',
    recipientCount: 1000,
    sentAt: '2024-03-20T09:15:00',
    deliveredCount: 980,
    openedCount: 750,
    clickedCount: 450,
    failedCount: 20,
    deliveryRate: 98,
    openRate: 77,
    clickRate: 46,
    status: 'sent',
    segment: 'distributors',
  },
];

const notificationVolumeData = [
  { day: 'Mon', sent: 1250, delivered: 1200, opened: 850 },
  { day: 'Tue', sent: 1320, delivered: 1280, opened: 920 },
  { day: 'Wed', sent: 1280, delivered: 1240, opened: 880 },
  { day: 'Thu', sent: 1450, delivered: 1400, opened: 1000 },
  { day: 'Fri', sent: 1500, delivered: 1450, opened: 1050 },
  { day: 'Sat', sent: 980, delivered: 950, opened: 680 },
  { day: 'Sun', sent: 850, delivered: 820, opened: 580 },
];

const deliveryStatusData = [
  { status: 'Delivered', count: 4850, percentage: 97 },
  { status: 'Opened', count: 3200, percentage: 64 },
  { status: 'Clicked', count: 1500, percentage: 30 },
  { status: 'Failed', count: 150, percentage: 3 },
];

const notificationTypeData = [
  { type: 'Email', sent: 2500, delivered: 2425, opened: 1600 },
  { type: 'SMS', sent: 1800, delivered: 1764, opened: 1440 },
  { type: 'Push', sent: 3200, delivered: 3136, opened: 2464 },
  { type: 'In-App', sent: 1500, delivered: 1500, opened: 1200 },
];


const getTypeBadge = (type: NotificationType) => {
  switch (type) {
    case 'email':
      return (
        <Badge variant="default">
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Badge>
      );
    case 'sms':
      return (
        <Badge className="bg-info text-white">
          <MessageSquare className="h-3 w-3 mr-1" />
          SMS
        </Badge>
      );
    case 'push':
      return (
        <Badge className="bg-warning text-white">
          <Bell className="h-3 w-3 mr-1" />
          Push
        </Badge>
      );
    case 'in_app':
      return (
        <Badge className="bg-success text-white">
          <Bell className="h-3 w-3 mr-1" />
          In-App
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const getStatusBadge = (status: NotificationStatus) => {
  switch (status) {
    case 'sent':
      return (
        <Badge className="bg-success text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      );
    case 'delivered':
      return <Badge className="bg-info text-white">Delivered</Badge>;
    case 'opened':
      return <Badge className="bg-warning text-white">Opened</Badge>;
    case 'clicked':
      return <Badge variant="default">Clicked</Badge>;
    case 'failed':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const NotificationHistory = () => {
  const [notifications] = useState<NotificationHistoryReport[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingNotification, setViewingNotification] = useState<NotificationHistoryReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.notificationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notif.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalSent = notifications.reduce((sum, n) => sum + n.recipientCount, 0);
  const totalDelivered = notifications.reduce((sum, n) => sum + n.deliveredCount, 0);
  const totalOpened = notifications.reduce((sum, n) => sum + n.openedCount, 0);
  const totalClicked = notifications.reduce((sum, n) => sum + n.clickedCount, 0);
  const totalFailed = notifications.reduce((sum, n) => sum + n.failedCount, 0);
  const avgDeliveryRate = notifications.reduce((sum, n) => sum + n.deliveryRate, 0) / notifications.length;
  const avgOpenRate = notifications.reduce((sum, n) => sum + n.openRate, 0) / notifications.length;
  const avgClickRate = notifications.reduce((sum, n) => sum + n.clickRate, 0) / notifications.length;

  const handleViewNotification = (notification: NotificationHistoryReport) => {
    setViewingNotification(notification);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notification History</h1>
          <p className="text-muted-foreground mt-1">Track notification delivery and engagement metrics</p>
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
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalSent}</p>
                </div>
                <Send className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-3xl font-bold text-success mt-1">{totalDelivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Opened</p>
                  <p className="text-3xl font-bold text-info mt-1">{totalOpened}</p>
                </div>
                <Bell className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Clicked</p>
                  <p className="text-3xl font-bold text-warning mt-1">{totalClicked}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{totalFailed}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rate Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                  <p className="text-3xl font-bold text-success mt-1">{avgDeliveryRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                  <p className="text-3xl font-bold text-info mt-1">{avgOpenRate.toFixed(1)}%</p>
                </div>
                <Bell className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                  <p className="text-3xl font-bold text-warning mt-1">{avgClickRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning opacity-20" />
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
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status Summary</CardTitle>
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
                  {deliveryStatusData.map((status) => (
                    <TableRow key={status.status}>
                      <TableCell>
                        <Badge variant={status.status === 'Delivered' ? 'default' : 'outline'}>
                          {status.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{status.count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Notification Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead>Delivery Rate</TableHead>
                    <TableHead>Open Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationTypeData.map((type) => {
                    const deliveryRate = (type.delivered / type.sent) * 100;
                    const openRate = (type.opened / type.delivered) * 100;
                    return (
                      <TableRow key={type.type}>
                        <TableCell className="font-medium">{type.type}</TableCell>
                        <TableCell>{type.sent}</TableCell>
                        <TableCell className="font-medium text-success">{type.delivered}</TableCell>
                        <TableCell className="font-medium text-info">{type.opened}</TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{deliveryRate.toFixed(1)}%</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{openRate.toFixed(1)}%</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Volume Chart - Single Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Weekly Notification Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={notificationVolumeData}>
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
                <Line type="monotone" dataKey="sent" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Sent" />
                <Line type="monotone" dataKey="delivered" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Delivered" />
                <Line type="monotone" dataKey="opened" stroke="hsl(38 92% 50%)" strokeWidth={2} name="Opened" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notification History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicked</TableHead>
                <TableHead>Delivery Rate</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{notification.notificationId}</code>
                  </TableCell>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium line-clamp-1">{notification.subject}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{notification.recipientCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{notification.deliveredCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{notification.openedCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{notification.clickedCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-success">{notification.deliveryRate}%</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-info">{notification.openRate}%</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{notification.sentAt.split('T')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewNotification(notification)}
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

      {/* Notification Detail Dialog */}
      {viewingNotification && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Notification Details</DialogTitle>
              <DialogDescription>
                Complete information for {viewingNotification.notificationId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notification ID</p>
                  <p className="font-medium">{viewingNotification.notificationId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="mt-1">{getTypeBadge(viewingNotification.type)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject</p>
                  <p className="font-medium">{viewingNotification.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingNotification.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipients</p>
                  <p className="font-medium">{viewingNotification.recipientCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="font-medium">{viewingNotification.deliveredCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opened</p>
                  <p className="font-medium">{viewingNotification.openedCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clicked</p>
                  <p className="font-medium">{viewingNotification.clickedCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="font-medium">{viewingNotification.failedCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                  <p className="font-medium text-success">{viewingNotification.deliveryRate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                  <p className="font-medium text-info">{viewingNotification.openRate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                  <p className="font-medium text-warning">{viewingNotification.clickRate}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Segment</p>
                  <p className="font-medium">{viewingNotification.segment || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sent At</p>
                  <p className="font-medium">{new Date(viewingNotification.sentAt).toLocaleString()}</p>
                </div>
                {viewingNotification.campaignId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Campaign ID</p>
                    <p className="font-medium">{viewingNotification.campaignId}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Body</p>
                <p className="text-sm bg-secondary p-3 rounded-lg">{viewingNotification.body}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

