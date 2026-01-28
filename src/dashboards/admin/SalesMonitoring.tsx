import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, DollarSign, TrendingUp, Package, ShoppingCart, CreditCard, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useGetAdminDashboardQuery } from '@/app/api/reportsApi';
import { Skeleton } from '@/components/ui/skeleton';

export const SalesMonitoring = () => {
  const { data: dashboardData, isLoading, isError } = useGetAdminDashboardQuery();
  const [userType, setUserType] = useState<'normal_users' | 'staff_users' | 'combined'>('combined');

  // Calculate combined sales metrics
  const getSalesMetrics = () => {
    if (!dashboardData) return null;

    if (userType === 'combined') {
      const normalPreBookings = dashboardData.pre_bookings?.normal_users || { kpi_cards: { total_amount: 0 }, summary: { total_count: 0 } };
      const staffPreBookings = dashboardData.pre_bookings?.staff_users || { kpi_cards: { total_amount: 0 }, summary: { total_count: 0 } };
      const normalEmi = dashboardData.emi_orders?.normal_users || { kpi_cards: { monthly_collection: 0 }, summary: { total_collected: 0 } };
      const staffEmi = dashboardData.emi_orders?.staff_users || { kpi_cards: { monthly_collection: 0 }, summary: { total_collected: 0 } };
      
      const totalPreBookings = normalPreBookings.kpi_cards.total_pre_bookings + staffPreBookings.kpi_cards.total_pre_bookings;
      const totalEmiOrders = (dashboardData.emi_orders?.normal_users?.kpi_cards.total_emi_orders || 0) + (dashboardData.emi_orders?.staff_users?.kpi_cards.total_emi_orders || 0);
      const totalRevenue = normalPreBookings.kpi_cards.total_amount + staffPreBookings.kpi_cards.total_amount + 
                          normalEmi.kpi_cards.monthly_collection + staffEmi.kpi_cards.monthly_collection;
      const totalOrders = totalPreBookings + totalEmiOrders;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalSales: totalOrders,
        totalRevenue,
        avgOrderValue,
        preBookings: totalPreBookings,
        emiOrders: totalEmiOrders,
      };
    } else {
      const preBookings = dashboardData.pre_bookings?.[userType] || { kpi_cards: { total_amount: 0, total_pre_bookings: 0 }, summary: { total_count: 0 } };
      const emiOrders = dashboardData.emi_orders?.[userType] || { kpi_cards: { monthly_collection: 0, total_emi_orders: 0 }, summary: { total_collected: 0 } };
      
      const totalRevenue = preBookings.kpi_cards.total_amount + emiOrders.kpi_cards.monthly_collection;
      const totalOrders = preBookings.kpi_cards.total_pre_bookings + emiOrders.kpi_cards.total_emi_orders;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        totalSales: totalOrders,
        totalRevenue,
        avgOrderValue,
        preBookings: preBookings.kpi_cards.total_pre_bookings,
        emiOrders: emiOrders.kpi_cards.total_emi_orders,
      };
    }
  };

  const salesMetrics = getSalesMetrics();

  // Get booking trends data for chart
  const getBookingTrendsData = () => {
    if (!dashboardData?.booking_trends) return [];
    
    if (userType === 'combined') {
      const normal = dashboardData.booking_trends.normal_users;
      const staff = dashboardData.booking_trends.staff_users;
      return normal.months.map((month, index) => ({
        month,
        normal: normal.bookings[index] || 0,
        staff: staff.bookings[index] || 0,
        total: (normal.bookings[index] || 0) + (staff.bookings[index] || 0),
      }));
    } else {
      const trend = dashboardData.booking_trends[userType];
      return trend.months.map((month, index) => ({
        month,
        bookings: trend.bookings[index] || 0,
      }));
    }
  };

  const bookingTrendsData = getBookingTrendsData();

  // Payment distribution data
  const paymentTypes = dashboardData?.payment_distribution
    ? [
        {
          name: "Full Payment",
          value: dashboardData.payment_distribution.full_payment.percentage,
          count: dashboardData.payment_distribution.full_payment.count,
        },
        {
          name: "EMI",
          value: dashboardData.payment_distribution.emi.percentage,
          count: dashboardData.payment_distribution.emi.count,
        },
        {
          name: "Wallet",
          value: dashboardData.payment_distribution.wallet.percentage,
          count: dashboardData.payment_distribution.wallet.count,
        },
        {
          name: "Mixed",
          value: dashboardData.payment_distribution.mixed.percentage,
          count: dashboardData.payment_distribution.mixed.count,
        },
      ].filter(item => item.value > 0)
    : [];

  const COLORS = [
    "hsl(221 83% 53%)",
    "hsl(199 89% 48%)",
    "hsl(38 92% 50%)",
    "hsl(0 84% 60%)",
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Monitoring</h1>
          <p className="text-muted-foreground mt-1">Monitor sales performance and revenue metrics</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            Failed to load sales data
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales Monitoring</h1>
        <p className="text-muted-foreground mt-1">Monitor sales performance and revenue metrics</p>
      </div>

      {/* User Type Tabs */}
      <Tabs value={userType} onValueChange={(v) => setUserType(v as typeof userType)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="combined">Combined</TabsTrigger>
          <TabsTrigger value="normal_users">Normal Users</TabsTrigger>
          <TabsTrigger value="staff_users">Staff Users</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sales Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {salesMetrics?.totalSales.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {salesMetrics?.preBookings || 0} pre-bookings, {salesMetrics?.emiOrders || 0} EMI orders
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{salesMetrics?.totalRevenue ? (salesMetrics.totalRevenue / 100000).toFixed(1) + 'L' : '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Combined revenue from all orders
              </p>
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
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{salesMetrics?.avgOrderValue ? Math.round(salesMetrics.avgOrderValue).toLocaleString('en-IN') : '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average value per order
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bookingTrendsData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip />
                  {userType === 'combined' ? (
                    <>
                      <Area type="monotone" dataKey="total" stroke="hsl(221 83% 53%)" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                      <Area type="monotone" dataKey="normal" stroke="hsl(221 83% 53%)" strokeWidth={1} strokeDasharray="5 5" fillOpacity={0} />
                      <Area type="monotone" dataKey="staff" stroke="hsl(199 89% 48%)" strokeWidth={1} strokeDasharray="5 5" fillOpacity={0} />
                    </>
                  ) : (
                    <Area type="monotone" dataKey="bookings" stroke="hsl(221 83% 53%)" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No payment data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

