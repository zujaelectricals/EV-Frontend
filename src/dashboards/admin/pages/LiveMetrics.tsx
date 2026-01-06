import { motion } from 'framer-motion';
import { Activity, Users, DollarSign, TrendingUp, Zap, Clock, Server, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const realTimeData = [
  { time: '00:00', users: 120, transactions: 45, revenue: 125000 },
  { time: '01:00', users: 95, transactions: 32, revenue: 98000 },
  { time: '02:00', users: 78, transactions: 28, revenue: 85000 },
  { time: '03:00', users: 65, transactions: 22, revenue: 72000 },
  { time: '04:00', users: 82, transactions: 35, revenue: 110000 },
  { time: '05:00', users: 145, transactions: 58, revenue: 185000 },
  { time: '06:00', users: 210, transactions: 89, revenue: 245000 },
  { time: '07:00', users: 285, transactions: 125, revenue: 320000 },
  { time: '08:00', users: 350, transactions: 168, revenue: 410000 },
  { time: '09:00', users: 420, transactions: 195, revenue: 485000 },
  { time: '10:00', users: 485, transactions: 225, revenue: 560000 },
  { time: '11:00', users: 520, transactions: 245, revenue: 610000 },
];

// const systemMetrics = [
//   { label: 'API Response Time', value: '45ms', status: 'good', trend: '+2ms' },
//   { label: 'Database Queries', value: '1,245/min', status: 'good', trend: '+12' },
//   { label: 'Active Connections', value: '2,850', status: 'warning', trend: '+150' },
//   { label: 'Server CPU', value: '68%', status: 'good', trend: '-5%' },
//   { label: 'Memory Usage', value: '4.2GB / 8GB', status: 'good', trend: 'Stable' },
//   { label: 'Cache Hit Rate', value: '94.5%', status: 'excellent', trend: '+1.2%' },
// ];

export const LiveMetrics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Live Metrics</h1>
        <p className="text-muted-foreground mt-1">Real-time system performance and activity monitoring</p>
      </div>

      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2,485</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+12.5% from last hour</span>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions/min</CardTitle>
              <Activity className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">245</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+8.2% from last hour</span>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue (24h)</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹4.2M</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+15.8% from yesterday</span>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-white">Operational</Badge>
                <span className="text-xs text-muted-foreground">99.9% uptime</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Last updated: Just now</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Real-time Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Real-time Activity (Last 12 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={realTimeData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="time" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(221 83% 53%)"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  stroke="hsl(199 89% 48%)"
                  fillOpacity={1}
                  fill="url(#colorTransactions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Metrics */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      metric.status === 'excellent'
                        ? 'default'
                        : metric.status === 'good'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {metric.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{metric.trend}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div> */}
    </div>
  );
};

