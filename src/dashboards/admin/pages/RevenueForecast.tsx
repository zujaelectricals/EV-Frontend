import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const historicalData = [
  { month: 'Jan', actual: 2.4, forecast: null },
  { month: 'Feb', actual: 2.8, forecast: null },
  { month: 'Mar', actual: 3.2, forecast: null },
  { month: 'Apr', actual: 3.6, forecast: null },
  { month: 'May', actual: 4.1, forecast: null },
  { month: 'Jun', actual: 4.5, forecast: null },
  { month: 'Jul', actual: null, forecast: 5.2 },
  { month: 'Aug', actual: null, forecast: 5.8 },
  { month: 'Sep', actual: null, forecast: 6.4 },
  { month: 'Oct', actual: null, forecast: 7.1 },
  { month: 'Nov', actual: null, forecast: 7.8 },
  { month: 'Dec', actual: null, forecast: 8.5 },
];

const forecastBreakdown = [
  { source: 'EV Sales', current: 2.8, forecast: 4.2, growth: 50 },
  { source: 'Distributor Commissions', current: 1.2, forecast: 1.8, growth: 50 },
  { source: 'Service & Maintenance', current: 0.5, forecast: 0.9, growth: 80 },
  { source: 'Accessories', current: 0.3, forecast: 0.6, growth: 100 },
];

export const RevenueForecast = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revenue Forecast</h1>
        <p className="text-muted-foreground mt-1">Projected revenue trends and forecasting analysis</p>
      </div>

      {/* Forecast Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹4.5M</div>
              <div className="text-xs text-muted-foreground mt-1">This month</div>
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
              <CardTitle className="text-sm font-medium">Q3 Forecast</CardTitle>
              <Target className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹18.5M</div>
              <div className="text-xs text-muted-foreground mt-1">Jul - Sep 2024</div>
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
              <CardTitle className="text-sm font-medium">Q4 Forecast</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹23.4M</div>
              <div className="text-xs text-muted-foreground mt-1">Oct - Dec 2024</div>
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
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+15.8%</div>
              <div className="text-xs text-muted-foreground mt-1">Monthly average</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Forecast Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => (value ? `₹${value}M` : '-')}
                />
                <ReferenceLine x="Jun" stroke="hsl(215 16% 47%)" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(142 76% 36%)"
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="hsl(221 83% 53%)"
                  fillOpacity={1}
                  fill="url(#colorForecast)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Actual Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Forecasted Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Revenue Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecastBreakdown.map((item, index) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.source}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground">₹{item.current}M</span>
                        <span className="text-xs text-muted-foreground ml-2">→</span>
                        <span className="text-sm font-bold text-primary ml-2">₹{item.forecast}M</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{item.growth}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${(item.current / item.forecast) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.forecast / 8.5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

