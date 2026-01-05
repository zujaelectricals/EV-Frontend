import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Landmark, TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useGetAllPoolBalancesQuery } from '@/app/api/poolBalancesApi';
import { useGetAllWithdrawalRequestsQuery } from '@/app/api/poolWithdrawalApi';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--destructive))'];

export const PoolUtilization = () => {
  const { data: balances = [] } = useGetAllPoolBalancesQuery();
  const { data: withdrawalRequests = [] } = useGetAllWithdrawalRequestsQuery();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: subMonths(new Date(), 6),
    end: new Date(),
  });

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalPoolMoney = balances.reduce((sum, b) => sum + b.poolBalance, 0);
    const totalWithdrawals = withdrawalRequests.filter(r => r.status === 'approved').length;
    const totalWithdrawalAmount = withdrawalRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
    const utilizationRate = totalPoolMoney > 0 
      ? (totalWithdrawalAmount / (totalPoolMoney + totalWithdrawalAmount)) * 100 
      : 0;
    const avgWithdrawal = totalWithdrawals > 0 ? totalWithdrawalAmount / totalWithdrawals : 0;

    // Most common withdrawal reason
    const reasonCounts: Record<string, number> = {};
    withdrawalRequests.forEach(req => {
      if (req.status === 'approved') {
        reasonCounts[req.reason] = (reasonCounts[req.reason] || 0) + 1;
      }
    });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalPoolMoney,
      utilizationRate,
      avgWithdrawal,
      topReason,
    };
  }, [balances, withdrawalRequests]);

  // Pool money growth over time (last 6 months)
  const poolGrowthData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      // Calculate pool money at end of month (simplified - in real app, track historical data)
      const withdrawalsInMonth = withdrawalRequests.filter(req => {
        const reqDate = new Date(req.requestedAt);
        return req.status === 'approved' && reqDate >= monthStart && reqDate <= monthEnd;
      });
      const withdrawalsAmount = withdrawalsInMonth.reduce((sum, req) => sum + req.amount, 0);
      
      // Estimate pool money (current total - withdrawals after this month)
      const withdrawalsAfter = withdrawalRequests.filter(req => {
        const reqDate = new Date(req.requestedAt);
        return req.status === 'approved' && reqDate > monthEnd;
      }).reduce((sum, req) => sum + req.amount, 0);
      
      const estimatedPool = summaryStats.totalPoolMoney + withdrawalsAfter;
      
      return {
        month: format(month, 'MMM yyyy'),
        poolMoney: estimatedPool,
        withdrawals: withdrawalsAmount,
      };
    });
  }, [dateRange, withdrawalRequests, summaryStats.totalPoolMoney]);

  // Withdrawal reasons distribution
  const withdrawalReasonsData = useMemo(() => {
    const reasonCounts: Record<string, number> = {};
    withdrawalRequests.forEach(req => {
      if (req.status === 'approved') {
        reasonCounts[req.reason] = (reasonCounts[req.reason] || 0) + req.amount;
      }
    });
    return Object.entries(reasonCounts).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));
  }, [withdrawalRequests]);

  // Monthly withdrawals trend
  const monthlyWithdrawalsData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const withdrawalsInMonth = withdrawalRequests.filter(req => {
        const reqDate = new Date(req.requestedAt);
        return req.status === 'approved' && reqDate >= monthStart && reqDate <= monthEnd;
      });
      
      return {
        month: format(month, 'MMM'),
        count: withdrawalsInMonth.length,
        amount: withdrawalsInMonth.reduce((sum, req) => sum + req.amount, 0),
      };
    });
  }, [dateRange, withdrawalRequests]);

  // Top 10 distributors by pool balance
  const topDistributorsData = useMemo(() => {
    return [...balances]
      .sort((a, b) => b.poolBalance - a.poolBalance)
      .slice(0, 10)
      .map(b => ({
        name: b.distributorName.length > 15 ? b.distributorName.substring(0, 15) + '...' : b.distributorName,
        balance: b.poolBalance,
      }));
  }, [balances]);

  // Utilization by month
  const utilizationData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const withdrawalsInMonth = withdrawalRequests.filter(req => {
        const reqDate = new Date(req.requestedAt);
        return req.status === 'approved' && reqDate >= monthStart && reqDate <= monthEnd;
      });
      const withdrawalAmount = withdrawalsInMonth.reduce((sum, req) => sum + req.amount, 0);
      
      // Estimate pool money at start of month
      const withdrawalsBefore = withdrawalRequests.filter(req => {
        const reqDate = new Date(req.requestedAt);
        return req.status === 'approved' && reqDate < monthStart;
      }).reduce((sum, req) => sum + req.amount, 0);
      
      const estimatedPoolStart = summaryStats.totalPoolMoney + withdrawalsBefore;
      const utilization = estimatedPoolStart > 0 ? (withdrawalAmount / estimatedPoolStart) * 100 : 0;
      
      return {
        month: format(month, 'MMM'),
        utilization: Math.round(utilization),
        withdrawals: withdrawalAmount,
      };
    });
  }, [dateRange, withdrawalRequests, summaryStats.totalPoolMoney]);

  // Insights
  const insights = useMemo(() => {
    const approvedRequests = withdrawalRequests.filter(r => r.status === 'approved');
    const processingTimes = approvedRequests
      .filter(r => r.processedAt && r.requestedAt)
      .map(r => {
        const requested = new Date(r.requestedAt);
        const processed = new Date(r.processedAt!);
        return (processed.getTime() - requested.getTime()) / (1000 * 60 * 60); // hours
      });
    const avgProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    const reasonCounts: Record<string, number> = {};
    approvedRequests.forEach(req => {
      reasonCounts[req.reason] = (reasonCounts[req.reason] || 0) + 1;
    });
    const mostCommonReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Peak withdrawal periods (by month)
    const monthlyCounts: Record<string, number> = {};
    approvedRequests.forEach(req => {
      const month = format(new Date(req.requestedAt), 'MMM');
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    const peakMonth = Object.entries(monthlyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      avgProcessingTime: Math.round(avgProcessingTime),
      mostCommonReason: mostCommonReason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      peakMonth,
    };
  }, [withdrawalRequests]);

  const handleExport = () => {
    // Export functionality can be implemented here
    toast.success('Export functionality coming soon');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reserve Utilization</h1>
          <p className="text-muted-foreground mt-1">Analytics and insights on reserve wallet utilization</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reserve Wallet</CardTitle>
              <Landmark className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{summaryStats.totalPoolMoney.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current balance</p>
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
              <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {summaryStats.utilizationRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Reserve wallet utilized</p>
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
              <CardTitle className="text-sm font-medium">Average Withdrawal</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{summaryStats.avgWithdrawal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per withdrawal</p>
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
              <CardTitle className="text-sm font-medium">Top Withdrawal Reason</CardTitle>
              <PieChartIcon className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground capitalize">
                {summaryStats.topReason}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Most common</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pool Money Growth Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Pool Money Growth Over Time</CardTitle>
            <CardDescription>Trend of pool money accumulation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={poolGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="poolMoney" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Reserve Wallet"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Withdrawal Reasons Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Reasons Distribution</CardTitle>
            <CardDescription>Breakdown by withdrawal reason</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={withdrawalReasonsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {withdrawalReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Withdrawals Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Withdrawals Trend</CardTitle>
            <CardDescription>Number and amount of withdrawals per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyWithdrawalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Count" />
                <Bar dataKey="amount" fill="hsl(var(--success))" name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Distributors by Pool Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Distributors by Pool Balance</CardTitle>
            <CardDescription>Highest pool money balances</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDistributorsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip />
                <Bar dataKey="balance" fill="hsl(var(--info))" name="Pool Balance (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization by Month */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pool Utilization by Month</CardTitle>
            <CardDescription>Percentage of pool money utilized each month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="hsl(var(--warning))" 
                  fill="hsl(var(--warning))" 
                  fillOpacity={0.3}
                  name="Utilization %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Important metrics and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Average Processing Time</p>
              <p className="text-2xl font-bold">{insights.avgProcessingTime} hours</p>
              <p className="text-xs text-muted-foreground mt-1">Time from request to approval</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Most Common Withdrawal Reason</p>
              <p className="text-2xl font-bold capitalize">{insights.mostCommonReason}</p>
              <p className="text-xs text-muted-foreground mt-1">Primary reason for withdrawals</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Peak Withdrawal Period</p>
              <p className="text-2xl font-bold">{insights.peakMonth}</p>
              <p className="text-xs text-muted-foreground mt-1">Month with most withdrawals</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

