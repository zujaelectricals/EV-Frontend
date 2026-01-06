import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Car,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
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
  LineChart,
  Line,
} from "recharts";
import {
  useGetGrowthMetricsQuery,
  useGetBookingTrendsQuery,
  useGetPaymentTypesQuery,
  useGetStaffPerformanceQuery,
} from "@/app/api/growthApi";
import { StatsCard } from "@/shared/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const AdminDashboard = () => {
  const { data: metrics } = useGetGrowthMetricsQuery();
  const { data: bookingTrends } = useGetBookingTrendsQuery();
  const { data: paymentTypes } = useGetPaymentTypesQuery();
  const { data: staffPerformance } = useGetStaffPerformanceQuery();

  const COLORS = [
    "hsl(221 83% 53%)",
    "hsl(199 89% 48%)",
    "hsl(38 92% 50%)",
    "hsl(0 84% 60%)",
  ];

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
    evBookings: { value: 1250, change: 15.2, trend: "up" },
    activeBuyers: { value: 8450, change: 8.5, trend: "up" },
  };

  const bookingTrendsData = [
    { month: "Jan", bookings: 120 },
    { month: "Feb", bookings: 180 },
    { month: "Mar", bookings: 250 },
    { month: "Apr", bookings: 320 },
  ];

  const funnelData = [
    { name: "Visitors", value: 10000, fill: "hsl(221 83% 53%)" },
    { name: "Interested", value: 3500, fill: "hsl(199 89% 48%)" },
    { name: "Pre-Booked", value: 1250, fill: "hsl(38 92% 50%)" },
    { name: "Paid", value: 850, fill: "hsl(142 76% 36%)" },
    { name: "Delivered", value: 720, fill: "hsl(0 84% 60%)" },
  ];

  const conversionRates = [
    { stage: "Visitors → Interested", rate: 35.0, change: +2.5 },
    { stage: "Interested → Pre-Booked", rate: 35.7, change: -1.2 },
    { stage: "Pre-Booked → Paid", rate: 68.0, change: +3.8 },
    { stage: "Paid → Delivered", rate: 84.7, change: +0.5 },
  ];

  const buyerGrowthData = [
    { month: "Jan", new: 450, active: 3200, total: 7200 },
    { month: "Feb", new: 520, active: 3650, total: 7800 },
    { month: "Mar", new: 680, active: 4200, total: 8500 },
    { month: "Apr", new: 750, active: 4850, total: 9200 },
    { month: "May", new: 820, active: 5400, total: 10000 },
    { month: "Jun", new: 950, active: 6100, total: 11000 },
  ];

  const buyerSegments = [
    { name: "Active Buyers", value: 6100, color: "hsl(142 76% 36%)" },
    { name: "Pre-Booked", value: 1250, color: "hsl(38 92% 50%)" },
    { name: "Inactive", value: 2650, color: "hsl(0 84% 60%)" },
    { name: "New This Month", value: 950, color: "hsl(221 83% 53%)" },
  ];

  const buyerSegmentColors = [
    "hsl(142 76% 36%)",
    "hsl(38 92% 50%)",
    "hsl(0 84% 60%)",
    "hsl(221 83% 53%)",
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-primary">
              Admin Control Center
            </span>
          </div>
          <h1 className="mt-1 font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Growth Intelligence Dashboard
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            Export Report
          </Button>
          <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
            <Zap className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Live Mode
          </Button>
        </div>
      </motion.div>

      {/* KPA Cards */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative"
        >
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Active Buyers
              </CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {mockMetrics.activeBuyers.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-success flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-success">
                  {mockMetrics.activeBuyers.change}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Total Visitors
              </CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                10,000
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-success">
                  +8.2% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative"
        >
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Pre-Booked
              </CardTitle>
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                1,250
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                12.5% conversion
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Paid Orders
              </CardTitle>
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                850
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                68% conversion
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative"
        >
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Delivered
              </CardTitle>
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-info flex-shrink-0" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                720
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                84.7% conversion
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 items-stretch">
        {/* Booking Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full"
        >
          <Card className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-lg bg-primary/20 p-1.5 sm:p-2 flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    EV Booking Trends
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Monthly booking growth
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs sm:text-sm text-success">
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  15.2%
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendsData}>
                  <defs>
                    <linearGradient
                      id="colorBookings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(221 83% 53%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(221 83% 53%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(214 32% 91%)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(215 16% 47%)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(215 16% 47%)"
                    fontSize={12}
                    domain={[0, 600]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(214 32% 91%)",
                      borderRadius: "8px",
                      color: "hsl(222 47% 11%)",
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
            </div>
          </Card>
        </motion.div>

        {/* Payment Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <Card className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-info/20 p-1.5 sm:p-2 flex-shrink-0">
                <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Payment Distribution
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  By payment type
                </p>
              </div>
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(214 32% 91%)",
                      borderRadius: "8px",
                      color: "hsl(222 47% 11%)",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {paymentTypes?.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Staff Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="h-full"
        >
          <Card className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-warning/20 p-1.5 sm:p-2 flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Staff Performance
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Target achievement %
                </p>
              </div>
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffPerformance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(214 32% 91%)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(215 16% 47%)"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(214 32% 91%)",
                      borderRadius: "8px",
                      color: "hsl(222 47% 11%)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(38 92% 50%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Buyer Growth Trend and Buyer Segments */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="h-full"
        >
          <Card className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                Buyer Growth Trend
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Monthly buyer acquisition trends
              </p>
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={buyerGrowthData}>
                  <defs>
                    <linearGradient
                      id="colorBuyerNew"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(221 83% 53%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(221 83% 53%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorBuyerActive"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(142 76% 36%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(142 76% 36%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(214 32% 91%)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(215 16% 47%)"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(214 32% 91%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(199 89% 48%)"
                    fillOpacity={1}
                    fill="url(#colorBuyerNew)"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="hsl(142 76% 36%)"
                    fillOpacity={1}
                    fill="url(#colorBuyerActive)"
                  />
                  <Line
                    type="monotone"
                    dataKey="new"
                    stroke="hsl(221 83% 53%)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="h-full"
        >
          <Card className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                Buyer Segments
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Distribution of buyer categories
              </p>
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={buyerSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {buyerSegments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          buyerSegmentColors[index % buyerSegmentColors.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0 0% 100%)",
                      border: "1px solid hsl(214 32% 91%)",
                      borderRadius: "8px",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2 mt-3 sm:mt-4">
              {buyerSegments.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        buyerSegmentColors[index % buyerSegmentColors.length],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {item.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Sales Funnel Visualization and Conversion Rates */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="h-full"
        >
          <Card className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:mb-2">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    Sales Funnel Visualization
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Customer journey through sales pipeline
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Total Visitors
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    {funnelData[0].value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {funnelData.map((item, index) => {
                const percentage = (item.value / funnelData[0].value) * 100;
                const dropOff =
                  index > 0
                    ? ((funnelData[index - 1].value - item.value) /
                        funnelData[index - 1].value) *
                      100
                    : 0;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {item.name}
                        </span>
                        {index > 0 && dropOff > 0 && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            ({dropOff.toFixed(1)}% drop-off)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-8 sm:h-10 bg-secondary rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        className="h-full rounded-lg flex items-center"
                        style={{ backgroundColor: item.fill }}
                      >
                        {percentage > 15 && (
                          <span className="text-[10px] sm:text-xs font-semibold text-white ml-2 sm:ml-3">
                            {percentage.toFixed(1)}%
                          </span>
                        )}
                      </motion.div>
                      {percentage <= 15 && (
                        <div className="absolute inset-0 flex items-center">
                          <span className="text-[10px] sm:text-xs font-semibold text-foreground ml-2 sm:ml-3">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    {index < funnelData.length - 1 && (
                      <div className="flex items-center justify-center py-1">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      Overall Conversion
                    </p>
                    <p className="text-base sm:text-lg font-bold text-primary">
                      {(
                        (funnelData[funnelData.length - 1].value /
                          funnelData[0].value) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {funnelData[funnelData.length - 1].value.toLocaleString()}{" "}
                      of {funnelData[0].value.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-info/5 border border-info/20">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      Biggest Drop
                    </p>
                    <p className="text-base sm:text-lg font-bold text-info">
                      {(() => {
                        const dropOffs = funnelData.map((item, idx) =>
                          idx > 0
                            ? ((funnelData[idx - 1].value - item.value) /
                                funnelData[idx - 1].value) *
                              100
                            : 0
                        );
                        return Math.max(...dropOffs).toFixed(1);
                      })()}
                      %
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {(() => {
                        const dropOffs = funnelData.map((item, idx) =>
                          idx > 0
                            ? ((funnelData[idx - 1].value - item.value) /
                                funnelData[idx - 1].value) *
                              100
                            : 0
                        );
                        const maxIndex = dropOffs.indexOf(
                          Math.max(...dropOffs)
                        );
                        return `${funnelData[maxIndex - 1].name} → ${
                          funnelData[maxIndex].name
                        }`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="h-full"
        >
          <Card className="p-4 sm:p-6 h-full flex flex-col">
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:mb-2">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    Conversion Rates
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Stage-to-stage conversion efficiency
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Avg. Rate
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      {(
                        conversionRates.reduce(
                          (sum, item) => sum + item.rate,
                          0
                        ) / conversionRates.length
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between space-y-5">
              {conversionRates.map((item, index) => {
                const isPositive = item.change >= 0;
                const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                            {item.stage}
                          </span>
                          <div
                            className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                              isPositive
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span>
                              {isPositive ? "+" : ""}
                              {item.change}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                          <span className="text-xl sm:text-2xl font-bold text-foreground">
                            {item.rate}%
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {index === 0 &&
                              `${(
                                (item.rate / 100) *
                                10000
                              ).toLocaleString()} converted`}
                            {index === 1 &&
                              `${(
                                (item.rate / 100) *
                                3500
                              ).toLocaleString()} converted`}
                            {index === 2 &&
                              `${(
                                (item.rate / 100) *
                                1250
                              ).toLocaleString()} converted`}
                            {index === 3 &&
                              `${(
                                (item.rate / 100) *
                                850
                              ).toLocaleString()} converted`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={item.rate} className="h-3" />
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-[10px] font-medium text-white">
                          {item.rate >= 50
                            ? "Excellent"
                            : item.rate >= 35
                            ? "Good"
                            : "Needs Improvement"}
                        </span>
                      </div>
                    </div>
                    {index < conversionRates.length - 1 && (
                      <div className="border-t border-border/50" />
                    )}
                  </div>
                );
              })}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      Best Rate
                    </p>
                    <p className="text-base sm:text-lg font-bold text-success">
                      {Math.max(...conversionRates.map((r) => r.rate)).toFixed(
                        1
                      )}
                      %
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                      {
                        conversionRates.find(
                          (r) =>
                            r.rate ===
                            Math.max(...conversionRates.map((r) => r.rate))
                        )?.stage
                      }
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                      Needs Focus
                    </p>
                    <p className="text-base sm:text-lg font-bold text-warning">
                      {Math.min(...conversionRates.map((r) => r.rate)).toFixed(
                        1
                      )}
                      %
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">
                      {
                        conversionRates.find(
                          (r) =>
                            r.rate ===
                            Math.min(...conversionRates.map((r) => r.rate))
                        )?.stage
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
