import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Users,
  Timer,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  totalTickets: 265,
  pendingTickets: 5,
  answeredTickets: 12,
  closedTickets: 248,
  avgResponseTime: 45, // minutes
  slaComplianceRate: 92.5, // percentage
};

const monthlyTicketData = [
  { month: 'Jan', tickets: 85, resolved: 78 },
  { month: 'Feb', tickets: 92, resolved: 88 },
  { month: 'Mar', tickets: 105, resolved: 98 },
  { month: 'Apr', tickets: 120, resolved: 115 },
];

const categoryDistribution = [
  { category: 'Payment', count: 45 },
  { category: 'Account', count: 38 },
  { category: 'Delivery', count: 32 },
  { category: 'Technical', count: 28 },
  { category: 'KYC', count: 25 },
  { category: 'Payout', count: 22 },
  { category: 'General', count: 15 },
];

const priorityDistribution = [
  { priority: 'Urgent', value: 8 },
  { priority: 'High', value: 25 },
  { priority: 'Medium', value: 120 },
  { priority: 'Low', value: 112 },
];

const COLORS = ['hsl(0 84% 60%)', 'hsl(25 95% 53%)', 'hsl(38 92% 50%)', 'hsl(215 16% 47%)'];

const recentActivity = [
  {
    id: 1,
    type: 'ticket',
    message: '5 new tickets received',
    timestamp: '2 hours ago',
    icon: Ticket,
    color: 'text-warning',
  },
  {
    id: 2,
    type: 'response',
    message: '12 tickets answered',
    timestamp: '5 hours ago',
    icon: MessageSquare,
    color: 'text-info',
  },
  {
    id: 3,
    type: 'resolution',
    message: '8 tickets resolved',
    timestamp: '1 day ago',
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    id: 4,
    type: 'sla',
    message: '2 tickets approaching SLA deadline',
    timestamp: '2 days ago',
    icon: AlertTriangle,
    color: 'text-destructive',
  },
];

export const SupportTickets = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all support tickets and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/tickets/pending">Pending Tickets</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/tickets/pending">
              <Clock className="h-4 w-4 mr-2" />
              Review Pending
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
                  <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalTickets}</p>
                </div>
                <Ticket className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{metrics.pendingTickets}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Answered</p>
                  <p className="text-3xl font-bold text-info mt-1">{metrics.answeredTickets}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Closed</p>
                  <p className="text-3xl font-bold text-success mt-1">{metrics.closedTickets}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-3xl font-bold text-info mt-1">{metrics.avgResponseTime}m</p>
                </div>
                <Timer className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                  <p className="text-3xl font-bold text-success mt-1">{metrics.slaComplianceRate}%</p>
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
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Ticket Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTicketData}>
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
                  <Line type="monotone" dataKey="tickets" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Total Tickets" />
                  <Line type="monotone" dataKey="resolved" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tickets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="category" stroke="hsl(215 16% 47%)" fontSize={12} />
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

      {/* Priority Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Ticket Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
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
              {priorityDistribution.map((item, index) => (
                <div key={item.priority} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{item.priority}</p>
                    <p className="text-xs text-muted-foreground">{item.value} tickets</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/tickets/pending">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Tickets
                    <Badge variant="destructive" className="ml-auto">{metrics.pendingTickets}</Badge>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/tickets/answered">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Answered Tickets
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/tickets/closed">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Closed Tickets
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/tickets/all">
                    <Ticket className="h-4 w-4 mr-2" />
                    All Tickets
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
          transition={{ delay: 1.0 }}
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

      {/* Pending Tickets Alert */}
      {metrics.pendingTickets > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="border-warning/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      {metrics.pendingTickets} ticket{metrics.pendingTickets > 1 ? 's' : ''} pending review
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review and assign tickets to support agents
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/tickets/pending">Review Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

