import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  DollarSign,
  Filter,
  TrendingUp,
  Calendar,
  Download,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  List,
  Grid,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { StatsCard } from '@/shared/components/StatsCard';
import { IncentiveCard } from './components/IncentiveCard';
import { IncentiveAnalyticsChart } from './components/IncentiveAnalyticsChart';
import { EnhancedIncentive } from './types';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

type IncentiveStatusFilter = 'all' | 'earned' | 'pending' | 'processing' | 'paid';
type IncentiveCategoryFilter = 'all' | 'sales' | 'performance' | 'milestone' | 'special';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type ViewMode = 'list' | 'grid' | 'timeline';

export const StaffIncentives = () => {
  const [statusFilter, setStatusFilter] = useState<IncentiveStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<IncentiveCategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - In real app, this would come from API
  const mockIncentives: EnhancedIncentive[] = [
    {
      id: '1',
      type: 'Sales Bonus',
      category: 'sales',
      amount: 5000,
      status: 'earned',
      description: 'Achieved 50+ sales this month',
      date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
      earnedDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
      paidDate: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
      transactionId: 'TXN-2024-001234',
      paymentMethod: 'Bank Transfer',
      relatedTargetId: '1',
    },
    {
      id: '2',
      type: 'Lead Generation Bonus',
      category: 'performance',
      amount: 2000,
      status: 'earned',
      description: 'Generated 100+ leads',
      date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
      earnedDate: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
      paidDate: format(subDays(new Date(), 13), 'yyyy-MM-dd'),
      transactionId: 'TXN-2024-001235',
      paymentMethod: 'Bank Transfer',
      relatedTargetId: '2',
    },
    {
      id: '3',
      type: 'Performance Bonus',
      category: 'performance',
      amount: 10000,
      status: 'pending',
      description: 'Top performer of the month',
      date: format(new Date(), 'yyyy-MM-dd'),
      progress: { current: 45, target: 50 },
      relatedTargetId: '1',
    },
    {
      id: '4',
      type: 'Revenue Milestone',
      category: 'milestone',
      amount: 7500,
      status: 'processing',
      description: 'Reached ₹850K revenue milestone',
      date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      earnedDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      transactionId: 'TXN-2024-001236',
      relatedTargetId: '3',
    },
    {
      id: '5',
      type: 'Perfect Month',
      category: 'special',
      amount: 15000,
      status: 'paid',
      description: 'Achieved all targets for the month',
      date: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
      earnedDate: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
      paidDate: format(subDays(new Date(), 23), 'yyyy-MM-dd'),
      transactionId: 'TXN-2024-001237',
      paymentMethod: 'Bank Transfer',
      taxAmount: 1500,
    },
    {
      id: '6',
      type: 'Verification Bonus',
      category: 'performance',
      amount: 3000,
      status: 'pending',
      description: 'Complete 40+ verifications this month',
      date: format(new Date(), 'yyyy-MM-dd'),
      progress: { current: 28, target: 40 },
      relatedTargetId: '4',
    },
  ];

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEarned = mockIncentives
      .filter((i) => i.status === 'earned' || i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const thisMonthEarned = mockIncentives
      .filter((i) => {
        const earnedDate = i.earnedDate || i.date;
        const earned = parseISO(earnedDate);
        return (i.status === 'earned' || i.status === 'paid') &&
          earned >= startOfMonth(new Date()) &&
          earned <= endOfMonth(new Date());
      })
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingTotal = mockIncentives
      .filter((i) => i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0);

    const processingTotal = mockIncentives
      .filter((i) => i.status === 'processing')
      .reduce((sum, i) => sum + i.amount, 0);

    const averageMonthly = totalEarned / 6; // Mock calculation

    return {
      totalEarned,
      thisMonthEarned,
      pendingTotal,
      processingTotal,
      averageMonthly: averageMonthly.toFixed(0),
      totalCount: mockIncentives.length,
      earnedCount: mockIncentives.filter((i) => i.status === 'earned' || i.status === 'paid').length,
      pendingCount: mockIncentives.filter((i) => i.status === 'pending').length,
    };
  }, []);

  // Filter and sort incentives
  const filteredAndSortedIncentives = useMemo(() => {
    let filtered = mockIncentives.filter((incentive) => {
      const matchesStatus = statusFilter === 'all' || incentive.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || incentive.category === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        incentive.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incentive.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [statusFilter, categoryFilter, sortBy, searchQuery]);

  // Group incentives
  const groupedIncentives = useMemo(() => {
    const groups: Record<string, EnhancedIncentive[]> = {
      'This Month': [],
      'Last Month': [],
      'This Quarter': [],
      'Older': [],
    };

    filteredAndSortedIncentives.forEach((incentive) => {
      const date = parseISO(incentive.date);
      const now = new Date();
      const monthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subDays(monthStart, 1));
      const lastMonthEnd = endOfMonth(subDays(monthStart, 1));

      if (date >= monthStart) {
        groups['This Month'].push(incentive);
      } else if (date >= lastMonthStart && date <= lastMonthEnd) {
        groups['Last Month'].push(incentive);
      } else if (date >= subDays(monthStart, 90)) {
        groups['This Quarter'].push(incentive);
      } else {
        groups['Older'].push(incentive);
      }
    });

    return Object.entries(groups).filter(([_, incentives]) => incentives.length > 0);
  }, [filteredAndSortedIncentives]);

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

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Incentives</h1>
          <p className="text-muted-foreground mt-1">View your earned and pending incentives</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        <motion.div variants={item}>
          <StatsCard
            title="Total Earned"
            value={formatAmount(summaryStats.totalEarned)}
            icon={DollarSign}
            variant="success"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="This Month"
            value={formatAmount(summaryStats.thisMonthEarned)}
            icon={TrendingUp}
            variant="primary"
            change={15}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Pending"
            value={formatAmount(summaryStats.pendingTotal)}
            icon={Clock}
            variant="warning"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Processing"
            value={formatAmount(summaryStats.processingTotal)}
            icon={AlertCircle}
            variant="info"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Avg Monthly"
            value={formatAmount(parseInt(summaryStats.averageMonthly))}
            icon={Award}
            variant="default"
          />
        </motion.div>
      </motion.div>

      {/* Filters and View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <Input
                placeholder="Search incentives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={(value: IncentiveStatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={(value: IncentiveCategoryFilter) => setCategoryFilter(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Incentives</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {summaryStats.pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {summaryStats.pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAndSortedIncentives.map((incentive) => (
                <IncentiveCard key={incentive.id} incentive={incentive} />
              ))}
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="space-y-6">
              {groupedIncentives.map(([groupName, incentives]) => (
                <div key={groupName}>
                  <h3 className="text-lg font-semibold mb-4">{groupName}</h3>
                  <div className="space-y-4">
                    {incentives.map((incentive) => (
                      <IncentiveCard key={incentive.id} incentive={incentive} variant="compact" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedIncentives.map((incentive) => (
                <IncentiveCard key={incentive.id} incentive={incentive} variant="compact" />
              ))}
            </div>
          )}

          {filteredAndSortedIncentives.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No incentives found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="space-y-4">
            {filteredAndSortedIncentives
              .filter((i) => i.status === 'pending')
              .map((incentive) => (
                <IncentiveCard key={incentive.id} incentive={incentive} />
              ))}
            {filteredAndSortedIncentives.filter((i) => i.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                  <p className="text-muted-foreground">No pending incentives at the moment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <IncentiveAnalyticsChart incentives={mockIncentives} type="monthly" />
            <IncentiveAnalyticsChart incentives={mockIncentives} type="byType" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
