import { useEffect } from "react";
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
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
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
import { useGetAdminDashboardQuery } from "@/app/api/reportsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminDashboard = () => {
  const { data: dashboardData, isLoading, isError } = useGetAdminDashboardQuery();

  // Console log the API response
  useEffect(() => {
    if (dashboardData) {
      console.log('📊 [ADMIN DASHBOARD] API Response:', dashboardData);
      console.log('📊 [ADMIN DASHBOARD] API Response (JSON):', JSON.stringify(dashboardData, null, 2));
    }
    if (isError) {
      console.error('❌ [ADMIN DASHBOARD] API Error:', isError);
    }
  }, [dashboardData, isError]);

  const COLORS = [
    "hsl(221 83% 53%)",
    "hsl(199 89% 48%)",
    "hsl(38 92% 50%)",
    "hsl(0 84% 60%)",
  ];

  // Transform API data to component format
  const bookingTrendsData = dashboardData?.booking_trends
    ? dashboardData.booking_trends.months.map((month, index) => ({
        month,
        bookings: dashboardData.booking_trends.bookings[index],
      }))
    : [];

  const paymentTypes = dashboardData?.payment_distribution
    ? [
        {
          name: "Full Payment",
          value: dashboardData.payment_distribution.full_payment.percentage,
        },
        {
          name: "Wallet",
          value: dashboardData.payment_distribution.wallet.percentage,
        },
        {
          name: "EMI",
          value: dashboardData.payment_distribution.emi.percentage,
        },
        {
          name: "Mixed",
          value: dashboardData.payment_distribution.mixed.percentage,
        },
      ]
    : [];

  const staffPerformance = dashboardData?.staff_performance
    ? dashboardData.staff_performance.map((staff) => ({
        name: staff.name,
        value: staff.achievement,
      }))
    : [];

  const funnelData = dashboardData?.sales_funnel
    ? dashboardData.sales_funnel.map((stage, index) => ({
        name: stage.stage,
        value: stage.count,
        percentage: stage.percentage,
        drop_off: stage.drop_off,
        fill:
          index === 0
            ? "hsl(221 83% 53%)"
            : index === 1
            ? "hsl(199 89% 48%)"
            : index === 2
            ? "hsl(38 92% 50%)"
            : index === 3
            ? "hsl(142 76% 36%)"
            : "hsl(0 84% 60%)",
      }))
    : [];

  const conversionRates = dashboardData?.conversion_rates
    ? dashboardData.conversion_rates.map((rate) => ({
        stage: `${rate.from} → ${rate.to}`,
        rate: rate.rate,
        change: rate.change,
        trend: rate.trend,
        converted_count: rate.converted_count,
      }))
    : [];

  const buyerGrowthData = dashboardData?.buyer_growth_trend
    ? dashboardData.buyer_growth_trend.months.map((month, index) => ({
        month,
        active: dashboardData.buyer_growth_trend.active_buyers[index],
        total: dashboardData.buyer_growth_trend.total_buyers[index],
        new:
          index > 0
            ? dashboardData.buyer_growth_trend.active_buyers[index] -
              dashboardData.buyer_growth_trend.active_buyers[index - 1]
            : dashboardData.buyer_growth_trend.active_buyers[index],
      }))
    : [];

  const buyerSegments = dashboardData?.buyer_segments
    ? [
        {
          name: "Active Buyers",
          value: dashboardData.buyer_segments.active_buyers,
          color: "hsl(142 76% 36%)",
        },
        {
          name: "Pre-Booked",
          value: dashboardData.buyer_segments.pre_booked,
          color: "hsl(38 92% 50%)",
        },
        {
          name: "Inactive",
          value: dashboardData.buyer_segments.inactive,
          color: "hsl(0 84% 60%)",
        },
        {
          name: "New This Month",
          value: dashboardData.buyer_segments.new_this_month,
          color: "hsl(221 83% 53%)",
        },
      ]
    : [];

  const buyerSegmentColors = [
    "hsl(142 76% 36%)",
    "hsl(38 92% 50%)",
    "hsl(0 84% 60%)",
    "hsl(221 83% 53%)",
  ];

  // Transform pre-bookings data
  const emiCollectionTrendData = dashboardData?.emi_orders?.collection_trend
    ? dashboardData.emi_orders.collection_trend.months.map((month, index) => ({
        month,
        amount: dashboardData.emi_orders!.collection_trend.amounts[index],
        orders: dashboardData.emi_orders!.collection_trend.order_counts[index],
      }))
    : [];

  const cancellationTrendData = dashboardData?.cancelled_orders?.cancellation_trend
    ? dashboardData.cancelled_orders.cancellation_trend.months.map((month, index) => ({
        month,
        count: dashboardData.cancelled_orders!.cancellation_trend.counts[index],
      }))
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardContent className="text-center">
            <p className="text-destructive mb-2">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {dashboardData.kpi_cards.active_buyers.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {dashboardData.kpi_cards.active_buyers.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-success flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive flex-shrink-0" />
                )}
                <span
                  className={`text-[10px] sm:text-xs ${
                    dashboardData.kpi_cards.active_buyers.trend === "up"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {dashboardData.kpi_cards.active_buyers.change}% vs last month
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
                {dashboardData.kpi_cards.total_visitors.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {dashboardData.kpi_cards.total_visitors.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-success flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive flex-shrink-0" />
                )}
                <span
                  className={`text-[10px] sm:text-xs ${
                    dashboardData.kpi_cards.total_visitors.trend === "up"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {dashboardData.kpi_cards.total_visitors.trend === "up" ? "+" : ""}
                  {dashboardData.kpi_cards.total_visitors.change}% from last month
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
                {dashboardData.kpi_cards.pre_booked.value.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {dashboardData.kpi_cards.pre_booked.conversion}% conversion
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
                {dashboardData.kpi_cards.paid_orders.value.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {dashboardData.kpi_cards.paid_orders.conversion}% conversion
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
                {dashboardData.kpi_cards.delivered.value.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {dashboardData.kpi_cards.delivered.conversion}% conversion
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
                  {dashboardData.booking_trends.growth}%
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
                    domain={[
                      0,
                      Math.max(...bookingTrendsData.map((d) => d.bookings)) * 1.2,
                    ]}
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
                const percentage = item.percentage || (item.value / funnelData[0].value) * 100;
                const dropOff = item.drop_off !== null && item.drop_off !== undefined
                  ? item.drop_off
                  : index > 0
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
                        {index > 0 && dropOff !== null && dropOff !== undefined && dropOff > 0 && (
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
                          item.drop_off !== null && item.drop_off !== undefined
                            ? item.drop_off
                            : idx > 0
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
                          item.drop_off !== null && item.drop_off !== undefined
                            ? item.drop_off
                            : idx > 0
                            ? ((funnelData[idx - 1].value - item.value) /
                                funnelData[idx - 1].value) *
                              100
                            : 0
                        );
                        const maxIndex = dropOffs.indexOf(
                          Math.max(...dropOffs)
                        );
                        return maxIndex > 0
                          ? `${funnelData[maxIndex - 1].name} → ${
                              funnelData[maxIndex].name
                            }`
                          : "N/A";
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
                const trend = item.trend || (isPositive ? "up" : "down");
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
                            {item.converted_count
                              ? `${item.converted_count.toLocaleString()} converted`
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={item.rate} className="h-3" />
                      {item.rate >= 50 && (
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-[10px] font-medium text-white">
                            {item.rate >= 50
                              ? "Excellent"
                              : item.rate >= 35
                              ? "Good"
                              : "Needs Improvement"}
                          </span>
                        </div>
                      )}
                      {item.rate < 50 && (
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-[10px] font-medium text-foreground">
                            {item.rate >= 35 ? "Good" : "Needs Improvement"}
                          </span>
                        </div>
                      )}
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

      {/* Pre-Bookings Section */}
      {dashboardData?.pre_bookings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Pre-Bookings Overview
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pre-Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dashboardData.pre_bookings.kpi_cards.total_pre_bookings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total amount: ₹{dashboardData.pre_bookings.kpi_cards.total_amount.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {dashboardData.pre_bookings.kpi_cards.pending.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((dashboardData.pre_bookings.kpi_cards.pending / dashboardData.pre_bookings.kpi_cards.total_pre_bookings) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {dashboardData.pre_bookings.kpi_cards.confirmed.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((dashboardData.pre_bookings.kpi_cards.confirmed / dashboardData.pre_bookings.kpi_cards.total_pre_bookings) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expired</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {dashboardData.pre_bookings.summary.expired_count.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((dashboardData.pre_bookings.summary.expired_count / dashboardData.pre_bookings.summary.total_count) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* EMI Orders Section */}
      {dashboardData?.emi_orders && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              EMI Orders Overview
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total EMI Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dashboardData.emi_orders.kpi_cards.total_emi_orders.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active: {dashboardData.emi_orders.kpi_cards.active_emis.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active EMIs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {dashboardData.emi_orders.kpi_cards.active_emis.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((dashboardData.emi_orders.kpi_cards.active_emis / dashboardData.emi_orders.kpi_cards.total_emi_orders) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ₹{dashboardData.emi_orders.kpi_cards.monthly_collection.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current month
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  ₹{dashboardData.emi_orders.kpi_cards.pending_amount.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total pending
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* EMI Collection Trend Chart */}
          {emiCollectionTrendData.length > 0 && (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    Collection Trend
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Monthly EMI collection amounts
                  </p>
                </div>
                <div className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emiCollectionTrendData}>
                      <defs>
                        <linearGradient id="colorEmiAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                      <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                      <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                      <Tooltip
                        formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                        contentStyle={{
                          backgroundColor: "hsl(0 0% 100%)",
                          border: "1px solid hsl(214 32% 91%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(221 83% 53%)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEmiAmount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">
                    EMI Summary
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Order status breakdown
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Collected</span>
                    <span className="text-lg font-bold text-success">
                      ₹{dashboardData.emi_orders.summary.total_collected.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Pending</span>
                    <span className="text-lg font-bold text-warning">
                      ₹{dashboardData.emi_orders.summary.total_pending.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-lg font-bold text-foreground">
                      {dashboardData.emi_orders.summary.completed_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cancelled</span>
                    <span className="text-lg font-bold text-destructive">
                      {dashboardData.emi_orders.summary.cancelled_count}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </motion.div>
      )}

      {/* Cancelled Orders Section */}
      {dashboardData?.cancelled_orders && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Cancelled Orders Overview
            </h2>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {dashboardData.cancelled_orders.kpi_cards.total_cancelled.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.cancelled_orders.kpi_cards.cancellation_rate}% cancellation rate
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{dashboardData.cancelled_orders.kpi_cards.total_amount.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cancelled orders value
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Refund Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {dashboardData.cancelled_orders.kpi_cards.refund_pending.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ₹{dashboardData.cancelled_orders.summary.pending_refund_amount.toLocaleString('en-IN')} pending
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Refund Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {dashboardData.cancelled_orders.summary.refund_processed_count.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ₹{dashboardData.cancelled_orders.summary.total_refunded_amount.toLocaleString('en-IN')} refunded
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cancellation Trend Chart */}
          {cancellationTrendData.length > 0 && (
            <Card className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Cancellation Trend
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Monthly cancellation counts
                </p>
              </div>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cancellationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                    <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                    <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0 0% 100%)",
                        border: "1px solid hsl(214 32% 91%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(0 84% 60%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};
