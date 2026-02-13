import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, DollarSign, TrendingUp, Search, Filter } from 'lucide-react';
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
  const [userType, setUserType] = useState<'normal_users' | 'staff_users' | 'combined'>('combined');

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
    if (!dashboardData?.emi_orders) {
      return [];
    }
    
    if (userType === 'combined') {
      const normal = dashboardData.emi_orders.normal_users.collection_trend;
      const staff = dashboardData.emi_orders.staff_users.collection_trend;
      const months = normal.months;
      return months.map((month, index) => ({
        month,
        amount: ((normal.amounts[index] || 0) + (staff.amounts[index] || 0)) / 1000000,
        orders: (normal.order_counts[index] || 0) + (staff.order_counts[index] || 0),
      }));
    } else {
      const trend = dashboardData.emi_orders[userType].collection_trend;
      if (!trend.months || !trend.amounts || !trend.order_counts) {
        return [];
      }
      return trend.months.map((month, index) => ({
        month,
        amount: (trend.amounts[index] || 0) / 1000000,
        orders: trend.order_counts[index] || 0,
      }));
    }
  }, [dashboardData?.emi_orders, userType]);
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
        ) : dashboardData?.emi_orders ? (
          (() => {
            const emiData = userType === 'combined'
              ? {
                  kpi_cards: {
                    total_emi_orders: dashboardData.emi_orders.normal_users.kpi_cards.total_emi_orders + dashboardData.emi_orders.staff_users.kpi_cards.total_emi_orders,
                    active_emis: dashboardData.emi_orders.normal_users.kpi_cards.active_emis + dashboardData.emi_orders.staff_users.kpi_cards.active_emis,
                    monthly_collection: dashboardData.emi_orders.normal_users.kpi_cards.monthly_collection + dashboardData.emi_orders.staff_users.kpi_cards.monthly_collection,
                    pending_amount: dashboardData.emi_orders.normal_users.kpi_cards.pending_amount + dashboardData.emi_orders.staff_users.kpi_cards.pending_amount,
                  }
                }
              : dashboardData.emi_orders[userType];
            return (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/20 dark:via-background dark:to-blue-950/20 h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total EMI Orders</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mt-1">
                            {emiData.kpi_cards.total_emi_orders.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-full bg-indigo-500/10 p-3">
                          <CreditCard className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-teal-950/20 dark:via-background dark:to-cyan-950/20 h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active EMIs</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mt-1">
                            {emiData.kpi_cards.active_emis.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-full bg-teal-500/10 p-3">
                          <TrendingUp className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20 h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Monthly Collection</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent mt-1">
                            ₹{(emiData.kpi_cards.monthly_collection / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div className="rounded-full bg-emerald-500/10 p-3">
                          <DollarSign className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20 h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mt-1">
                            ₹{(emiData.kpi_cards.pending_amount / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div className="rounded-full bg-amber-500/10 p-3">
                          <Calendar className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            );
          })()
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

