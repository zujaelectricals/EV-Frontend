import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useGetAdminDashboardQuery } from '@/app/api/reportsApi';

export const CancelledOrders = () => {
  const { data: dashboardData, isLoading, isError } = useGetAdminDashboardQuery();
  const [userType, setUserType] = useState<'normal_users' | 'staff_users' | 'combined'>('combined');

  // Console log the full API response for debugging
  React.useEffect(() => {
    if (dashboardData) {
      console.log('=== CancelledOrders: Full Admin Dashboard API Response ===');
      console.log('Full response:', dashboardData);
      console.log('Cancelled Orders:', dashboardData.cancelled_orders);
      console.log('Cancellation Trend:', dashboardData.cancelled_orders?.cancellation_trend);
    }
  }, [dashboardData]);

  // Transform cancellation trend data
  const cancellationTrendData = React.useMemo(() => {
    if (!dashboardData?.cancelled_orders) {
      return [];
    }
    
    if (userType === 'combined') {
      const normal = dashboardData.cancelled_orders.normal_users.cancellation_trend;
      const staff = dashboardData.cancelled_orders.staff_users.cancellation_trend;
      const months = normal.months;
      return months.map((month, index) => ({
        month,
        count: (normal.counts[index] || 0) + (staff.counts[index] || 0),
      }));
    } else {
      const trend = dashboardData.cancelled_orders[userType].cancellation_trend;
      if (!trend.months || !trend.counts) {
        return [];
      }
      return trend.months.map((month, index) => ({
        month,
        count: trend.counts[index] || 0,
      }));
    }
  }, [dashboardData?.cancelled_orders, userType]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cancelled Orders</h1>
        <p className="text-muted-foreground mt-1">Track cancelled orders and refund status</p>
      </div>

      {/* User Type Tabs */}
      <Tabs value={userType} onValueChange={(v) => setUserType(v as typeof userType)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="combined">Combined</TabsTrigger>
          <TabsTrigger value="normal_users">Normal Users</TabsTrigger>
          <TabsTrigger value="staff_users">Staff Users</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : dashboardData?.cancelled_orders ? (
          (() => {
            const cancelledData = userType === 'combined'
              ? {
                  kpi_cards: {
                    total_cancelled: dashboardData.cancelled_orders.normal_users.kpi_cards.total_cancelled + dashboardData.cancelled_orders.staff_users.kpi_cards.total_cancelled,
                    total_amount: dashboardData.cancelled_orders.normal_users.kpi_cards.total_amount + dashboardData.cancelled_orders.staff_users.kpi_cards.total_amount,
                    refund_pending: dashboardData.cancelled_orders.normal_users.kpi_cards.refund_pending + dashboardData.cancelled_orders.staff_users.kpi_cards.refund_pending,
                    cancellation_rate: ((dashboardData.cancelled_orders.normal_users.kpi_cards.cancellation_rate + dashboardData.cancelled_orders.staff_users.kpi_cards.cancellation_rate) / 2),
                  }
                }
              : dashboardData.cancelled_orders[userType];
            return (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Cancelled</p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            {cancelledData.kpi_cards.total_cancelled.toLocaleString()}
                          </p>
                        </div>
                        <XCircle className="h-8 w-8 text-destructive opacity-20" />
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
                          <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            ₹{(cancelledData.kpi_cards.total_amount / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-warning opacity-20" />
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
                          <p className="text-sm font-medium text-muted-foreground">Refund Pending</p>
                          <p className="text-3xl font-bold text-warning mt-1">
                            {cancelledData.kpi_cards.refund_pending.toLocaleString()}
                          </p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-warning opacity-20" />
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
                          <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
                          <p className="text-3xl font-bold text-foreground mt-1">
                            {cancelledData.kpi_cards.cancellation_rate.toFixed(1)}%
                          </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-info opacity-20" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            );
          })()
        ) : null}
      </div>

      {/* Cancellation Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : cancellationTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cancellationTrendData}>
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
                  <Line type="monotone" dataKey="count" stroke="hsl(0 84% 60%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : dashboardData?.cancelled_orders ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <p>No trend data available</p>
                <p className="text-xs">
                  {dashboardData.cancelled_orders.cancellation_trend 
                    ? 'Data structure issue - check console'
                    : 'cancellation_trend not found in API response'}
                </p>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {isError ? 'Error loading data' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cancelled Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Cancellations</CardTitle>
            <Input placeholder="Search..." className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Cancelled Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Refund Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Detailed cancelled orders list will be available from a separate API endpoint
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

