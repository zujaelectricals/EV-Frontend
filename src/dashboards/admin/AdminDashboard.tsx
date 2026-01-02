import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Car,
  DollarSign,
  Activity,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useGetGrowthMetricsQuery, useGetBookingTrendsQuery, useGetPaymentTypesQuery, useGetStaffPerformanceQuery } from '@/app/api/growthApi';
import { StatsCard } from '@/shared/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const AdminDashboard = () => {
  const { data: metrics } = useGetGrowthMetricsQuery();
  const { data: bookingTrends } = useGetBookingTrendsQuery();
  const { data: paymentTypes } = useGetPaymentTypesQuery();
  const { data: staffPerformance } = useGetStaffPerformanceQuery();

  const COLORS = ['hsl(221 83% 53%)', 'hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)'];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Mock data matching the image
  const mockMetrics = {
    evBookings: { value: 1250, change: 15.2, trend: 'up' },
    activeBuyers: { value: 8450, change: 8.5, trend: 'up' },
  };

  const bookingTrendsData = [
    { month: 'Jan', bookings: 120 },
    { month: 'Feb', bookings: 180 },
    { month: 'Mar', bookings: 250 },
    { month: 'Apr', bookings: 320 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Control Center</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
            Growth Intelligence Dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            <Zap className="mr-2 h-4 w-4" />
            Live Mode
          </Button>
        </div>
      </motion.div>

      {/* Main Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <motion.div variants={item} className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">EV Bookings</p>
                  <p className="text-3xl font-bold text-foreground">{mockMetrics.evBookings.value.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      {mockMetrics.evBookings.change}% vs last month
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item} className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Buyers</p>
                  <p className="text-3xl font-bold text-foreground">{mockMetrics.activeBuyers.value.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      {mockMetrics.activeBuyers.change}% vs last month
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Booking Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-2"
        >
          <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/20 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">EV Booking Trends</h3>
                <p className="text-xs text-muted-foreground">Monthly booking growth</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-success">
                <ArrowUpRight className="h-4 w-4" />
                15.2%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={bookingTrendsData}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
              <YAxis stroke="hsl(215 16% 47%)" fontSize={12} domain={[0, 600]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(214 32% 91%)',
                  borderRadius: '8px',
                  color: 'hsl(222 47% 11%)',
                }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBookings)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Payment Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-info/20 p-2">
              <PieChart className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Payment Distribution</h3>
              <p className="text-xs text-muted-foreground">By payment type</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RePieChart>
              <Pie
                data={paymentTypes}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentTypes?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(214 32% 91%)',
                  borderRadius: '8px',
                  color: 'hsl(222 47% 11%)',
                }}
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {paymentTypes?.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Staff Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-warning/20 p-2">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Staff Performance</h3>
              <p className="text-xs text-muted-foreground">Target achievement %</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={staffPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="name" stroke="hsl(215 16% 47%)" fontSize={12} />
              <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(214 32% 91%)',
                  borderRadius: '8px',
                  color: 'hsl(222 47% 11%)',
                }}
              />
              <Bar dataKey="value" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/20 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Active Alerts</h3>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </div>
            </div>
            <span className="rounded-full bg-destructive/20 px-2 py-1 text-xs font-medium text-destructive">
              3 Critical
            </span>
          </div>
          <div className="space-y-3">
            {[
              { type: 'Fraud', message: 'Suspicious duplicate registrations detected', severity: 'critical' },
              { type: 'Compliance', message: 'Pool wallet liability exceeds threshold', severity: 'warning' },
              { type: 'System', message: 'Binary engine sync delayed by 15 mins', severity: 'info' },
              { type: 'Risk', message: 'Unusual payout pattern detected', severity: 'critical' },
            ].map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`rounded-lg border p-3 ${
                  alert.severity === 'critical'
                    ? 'border-destructive/50 bg-destructive/10'
                    : alert.severity === 'warning'
                    ? 'border-warning/50 bg-warning/10'
                    : 'border-info/50 bg-info/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-xs font-medium ${
                        alert.severity === 'critical'
                          ? 'text-destructive'
                          : alert.severity === 'warning'
                          ? 'text-warning'
                          : 'text-info'
                      }`}
                    >
                      {alert.type}
                    </span>
                    <p className="mt-1 text-sm text-foreground">{alert.message}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
