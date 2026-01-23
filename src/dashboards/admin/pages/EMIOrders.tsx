import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useGetAdminDashboardQuery } from '@/app/api/reportsApi';

export const EMIOrders = () => {
  const { data: dashboardData, isLoading, isError } = useGetAdminDashboardQuery();

  // Console log the full API response for debugging
  React.useEffect(() => {
    if (dashboardData) {
      console.log('=== EMIOrders: Full Admin Dashboard API Response ===');
      console.log('Full response:', dashboardData);
      console.log('EMI Orders:', dashboardData.emi_orders);
      console.log('Collection Trend:', dashboardData.emi_orders?.collection_trend);
    }
  }, [dashboardData]);

  // Transform EMI collection trend data
  const emiCollectionTrendData = React.useMemo(() => {
    if (!dashboardData?.emi_orders?.collection_trend) {
      console.log('EMIOrders: No collection_trend data', {
        hasEmiOrders: !!dashboardData?.emi_orders,
        collectionTrend: dashboardData?.emi_orders?.collection_trend,
      });
      return [];
    }
    const trend = dashboardData.emi_orders.collection_trend;
    if (!trend.months || !trend.amounts || !trend.order_counts) {
      console.log('EMIOrders: Missing required fields', { trend });
      return [];
    }
    if (trend.months.length !== trend.amounts.length || 
        trend.months.length !== trend.order_counts.length) {
      console.log('EMIOrders: Length mismatch', {
        monthsLength: trend.months.length,
        amountsLength: trend.amounts.length,
        orderCountsLength: trend.order_counts.length,
      });
      return [];
    }
    const data = trend.months.map((month, index) => ({
      month,
      amount: (trend.amounts[index] || 0) / 1000000, // Convert to millions
      orders: trend.order_counts[index] || 0,
    }));
    console.log('EMIOrders: Transformed data', data);
    return data;
  }, [dashboardData?.emi_orders?.collection_trend]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">EMI Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage all EMI-based orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : dashboardData?.emi_orders ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total EMI Orders</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {dashboardData.emi_orders.kpi_cards.total_emi_orders.toLocaleString()}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary opacity-20" />
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
                      <p className="text-sm font-medium text-muted-foreground">Active EMIs</p>
                      <p className="text-3xl font-bold text-info mt-1">
                        {dashboardData.emi_orders.kpi_cards.active_emis.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-info opacity-20" />
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
                      <p className="text-sm font-medium text-muted-foreground">Monthly Collection</p>
                      <p className="text-3xl font-bold text-success mt-1">
                        ₹{(dashboardData.emi_orders.kpi_cards.monthly_collection / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                      <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                      <p className="text-3xl font-bold text-warning mt-1">
                        ₹{(dashboardData.emi_orders.kpi_cards.pending_amount / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-warning opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </div>

      {/* EMI Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>EMI Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : emiCollectionTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emiCollectionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'amount') {
                        return `₹${value.toFixed(1)}M`;
                      }
                      return value;
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : dashboardData?.emi_orders ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <p>No trend data available</p>
                <p className="text-xs">
                  {dashboardData.emi_orders.collection_trend 
                    ? 'Data structure issue - check console'
                    : 'collection_trend not found in API response'}
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

      {/* EMI Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All EMI Orders</CardTitle>
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
                <TableHead>Total Amount</TableHead>
                <TableHead>EMI Amount</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Detailed EMI orders list will be available from a separate API endpoint
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

