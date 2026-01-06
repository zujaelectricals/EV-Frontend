import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { EnhancedIncentive } from '../types';
import { format, parseISO } from 'date-fns';

interface IncentiveAnalyticsChartProps {
  incentives: EnhancedIncentive[];
  type?: 'monthly' | 'byType';
}

export const IncentiveAnalyticsChart = ({ incentives, type = 'monthly' }: IncentiveAnalyticsChartProps) => {
  const chartConfig = {
    earned: {
      label: 'Earned',
      color: 'hsl(142 76% 36%)',
    },
    pending: {
      label: 'Pending',
      color: 'hsl(38 92% 50%)',
    },
    processing: {
      label: 'Processing',
      color: 'hsl(199 89% 48%)',
    },
    paid: {
      label: 'Paid',
      color: 'hsl(221 83% 53%)',
    },
  };

  if (type === 'byType') {
    // Group by category
    const categoryData: Record<string, number> = {};
    
    incentives.forEach((incentive) => {
      if (!categoryData[incentive.category]) {
        categoryData[incentive.category] = 0;
      }
      categoryData[incentive.category] += incentive.amount;
    });

    const chartData = Object.entries(categoryData).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>Incentives by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="hsl(221 83% 53%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  // Monthly trends
  const monthlyData: Record<string, { earned: number; pending: number; processing: number; paid: number }> = {};

  incentives.forEach((incentive) => {
    const monthKey = format(parseISO(incentive.date), 'MMM yyyy');
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { earned: 0, pending: 0, processing: 0, paid: 0 };
    }
    monthlyData[monthKey][incentive.status] += incentive.amount;
  });

  const chartData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ...data,
    }))
    .sort((a, b) => {
      const dateA = parseISO(a.month + ' 01');
      const dateB = parseISO(b.month + ' 01');
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Incentive Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'currentColor' }} />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="paid" stackId="a" fill="hsl(221 83% 53%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="earned" stackId="a" fill="hsl(142 76% 36%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="processing" stackId="a" fill="hsl(199 89% 48%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="hsl(38 92% 50%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

