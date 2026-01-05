import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, ShoppingCart, ArrowUpRight, ArrowDownRight, Calendar, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { useGetBinaryStatsQuery, useGetPairHistoryQuery } from '@/app/api/binaryApi';
import { StatsCard } from '@/shared/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--info))', 'hsl(var(--warning))'];

export const SalesTracking = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || '';
  const distributorInfo = user?.distributorInfo;
  const { data: binaryStats } = useGetBinaryStatsQuery(distributorId, { skip: !distributorId });
  const { data: pairHistory } = useGetPairHistoryQuery(distributorId, { skip: !distributorId });

  // Calculate sales metrics
  const totalReferrals = distributorInfo?.totalReferrals || 0;
  const totalPairs = binaryStats?.totalPairs || 0;
  
  // Estimate total sales value (based on referrals * average order value)
  // Average order value: ₹50,000 (typical EV scooter price)
  const avgOrderValue = 50000;
  const totalSalesValue = totalReferrals * avgOrderValue;
  
  // Current month calculations (mock data - would need actual booking data)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthReferrals = Math.floor(totalReferrals / 12); // Estimate
  const currentMonthSales = currentMonthReferrals * avgOrderValue;
  
  // Commission breakdown
  const activationBonus = binaryStats?.activationBonus || 0;
  const referralCommissionEarned = Math.min(totalReferrals, 3) * 1000;
  const pairCommissionEarned = binaryStats?.totalEarnings ? 
    (binaryStats.totalEarnings - referralCommissionEarned - activationBonus) : 0;
  const totalCommission = binaryStats?.totalEarnings || 0;
  
  // Previous month comparison (mock data)
  const previousMonthSales = Math.max(0, currentMonthSales * 0.85);
  const salesGrowth = previousMonthSales > 0 
    ? ((currentMonthSales - previousMonthSales) / previousMonthSales * 100).toFixed(1)
    : '0';

  // Monthly sales data (last 6 months)
  const monthlySalesData = useMemo(() => {
    const months = [];
    const monthNames = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let cumulativeReferrals = Math.max(0, totalReferrals - 5);
    
    for (let i = 0; i < 6; i++) {
      cumulativeReferrals += Math.floor(totalReferrals / 12);
      months.push({
        month: monthNames[i],
        sales: cumulativeReferrals * avgOrderValue,
        referrals: cumulativeReferrals,
        commissions: Math.min(cumulativeReferrals, 3) * 1000 + Math.min(cumulativeReferrals, 10) * 2000,
      });
    }
    return months;
  }, [totalReferrals]);

  // Commission breakdown data
  const commissionBreakdown = [
    { name: 'Referral Commission', value: referralCommissionEarned, color: COLORS[0] },
    { name: 'Pair Commission', value: pairCommissionEarned, color: COLORS[1] },
    ...(activationBonus > 0 ? [{ name: 'Activation Bonus', value: activationBonus, color: COLORS[2] }] : []),
  ];

  // Referral performance data (last 6 months)
  const referralTrendData = useMemo(() => {
    const months = [];
    const monthNames = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let cumulative = Math.max(0, totalReferrals - 5);
    
    for (let i = 0; i < 6; i++) {
      cumulative += Math.floor(totalReferrals / 12);
      months.push({
        month: monthNames[i],
        referrals: cumulative,
        commission: Math.min(cumulative, 3) * 1000,
      });
    }
    return months;
  }, [totalReferrals]);

  // Pair history for recent sales
  const recentPairs = useMemo(() => {
    if (!pairHistory || pairHistory.length === 0) return [];
    return [...pairHistory]
      .sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime())
      .slice(0, 10);
  }, [pairHistory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor your sales and referrals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sales"
          value={`₹${(totalSalesValue / 1000).toFixed(0)}K`}
          icon={ShoppingCart}
          variant="primary"
          change={parseFloat(salesGrowth)}
          trend={parseFloat(salesGrowth) >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="This Month"
          value={`₹${(currentMonthSales / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Total Referrals"
          value={totalReferrals.toLocaleString()}
          icon={Package}
          variant="info"
        />
        <StatsCard
          title="Commission Earned"
          value={`₹${(totalCommission / 1000).toFixed(0)}K`}
          icon={DollarSign}
          variant="warning"
        />
      </div>

      {/* Sales Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="recent">Recent Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Sales Performance Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlySalesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value: number) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown</CardTitle>
                <CardDescription>Earnings by source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={commissionBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Package className="h-4 w-4 text-info" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalReferrals}</div>
                <p className="text-xs text-muted-foreground mt-1">Active referrals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pairs</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {totalPairs}/{binaryStats?.maxPairs || 10}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pairs matched</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ₹{(avgOrderValue / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per referral</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
              <CardDescription>Detailed commission earnings by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Referral Commission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        ₹{referralCommissionEarned.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.min(totalReferrals, 3)} referrals × ₹1,000
                      </p>
                    </CardContent>
                  </Card>

                  {activationBonus > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Activation Bonus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                          ₹{activationBonus.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          One-time bonus
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Pair Commission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        ₹{pairCommissionEarned.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalPairs} pairs × ₹2,000
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Commission Trend</CardTitle>
                    <CardDescription>Monthly commission earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="commissions" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Performance</CardTitle>
              <CardDescription>Track referral growth and commission</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={referralTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="referrals" 
                    stroke="hsl(var(--info))" 
                    strokeWidth={2}
                    name="Total Referrals"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="commission" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Commission (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales Activity</CardTitle>
              <CardDescription>Latest pair matches and commissions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentPairs.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Left PV</TableHead>
                        <TableHead>Right PV</TableHead>
                        <TableHead>Matched PV</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPairs.map((pair) => (
                        <TableRow key={pair.id}>
                          <TableCell>
                            {new Date(pair.matchedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>₹{pair.leftPV.toLocaleString()}</TableCell>
                          <TableCell>₹{pair.rightPV.toLocaleString()}</TableCell>
                          <TableCell>₹{pair.matchedPV.toLocaleString()}</TableCell>
                          <TableCell className="font-medium">
                            ₹{pair.commission.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-semibold text-success">
                            ₹{pair.netAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Matched</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sales activity yet</p>
                  <p className="text-sm mt-2">Your pair matches will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sales Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Summary</CardTitle>
          <CardDescription>Complete overview of your sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Sales Value</p>
              <p className="text-2xl font-bold">₹{(totalSalesValue / 100000).toFixed(1)}L</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold">{totalReferrals}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Pairs</p>
              <p className="text-2xl font-bold">{totalPairs}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Commission</p>
              <p className="text-2xl font-bold text-success">
                ₹{(totalCommission / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

