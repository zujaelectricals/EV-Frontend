import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { EnhancedTarget } from '../types';

interface TargetTrendsChartProps {
  targets: EnhancedTarget[];
}

export const TargetTrendsChart = ({ targets }: TargetTrendsChartProps) => {
  // Combine all target histories into a single dataset
  const combinedData: Record<string, any> = {};
  
  targets.forEach((target) => {
    target.progressHistory.forEach((point) => {
      if (!combinedData[point.date]) {
        combinedData[point.date] = { date: point.date };
      }
      combinedData[point.date][target.label] = point.value;
      combinedData[point.date][`${target.label}_target`] = target.target;
    });
  });

  const chartData = Object.values(combinedData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartConfig: Record<string, any> = {};
  const colors = ['hsl(221 83% 53%)', 'hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(142 76% 36%)', 'hsl(0 84% 60%)'];

  targets.forEach((target, index) => {
    chartConfig[target.label] = {
      label: target.label,
      color: colors[index % colors.length],
    };
    chartConfig[`${target.label}_target`] = {
      label: `${target.label} (Target)`,
      color: colors[index % colors.length],
      theme: {
        light: colors[index % colors.length],
        dark: colors[index % colors.length],
      },
    };
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Progress Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {targets.map((target, index) => (
                <Line
                  key={`${target.label}_current`}
                  type="monotone"
                  dataKey={target.label}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
              {targets.map((target, index) => (
                <Line
                  key={`${target.label}_target`}
                  type="monotone"
                  dataKey={`${target.label}_target`}
                  stroke={colors[index % colors.length]}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  strokeOpacity={0.5}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

