import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const funnelData = [
  { name: 'Visitors', value: 10000, fill: 'hsl(221 83% 53%)' },
  { name: 'Interested', value: 3500, fill: 'hsl(199 89% 48%)' },
  { name: 'Pre-Booked', value: 1250, fill: 'hsl(38 92% 50%)' },
  { name: 'Paid', value: 850, fill: 'hsl(142 76% 36%)' },
  { name: 'Delivered', value: 720, fill: 'hsl(0 84% 60%)' },
];

const conversionRates = [
  { stage: 'Visitors → Interested', rate: 35.0, change: +2.5 },
  { stage: 'Interested → Pre-Booked', rate: 35.7, change: -1.2 },
  { stage: 'Pre-Booked → Paid', rate: 68.0, change: +3.8 },
  { stage: 'Paid → Delivered', rate: 84.7, change: +0.5 },
];

const monthlyTrend = [
  { month: 'Jan', visitors: 8500, preBooked: 980, paid: 680, delivered: 580 },
  { month: 'Feb', visitors: 9200, preBooked: 1100, paid: 750, delivered: 640 },
  { month: 'Mar', visitors: 9800, preBooked: 1180, paid: 820, delivered: 700 },
  { month: 'Apr', visitors: 10000, preBooked: 1250, paid: 850, delivered: 720 },
];

export const SalesFunnel = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">EV Sales Funnel</h1>
        <p className="text-muted-foreground mt-1">Track conversion rates across the sales pipeline</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">10,000</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+8.2% from last month</span>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pre-Booked</CardTitle>
              <ShoppingCart className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,250</div>
              <div className="text-xs text-muted-foreground mt-1">12.5% conversion</div>
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
              <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">850</div>
              <div className="text-xs text-muted-foreground mt-1">68% conversion</div>
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
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">720</div>
              <div className="text-xs text-muted-foreground mt-1">84.7% conversion</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Funnel Visualization */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((item, index) => {
                  const percentage = (item.value / funnelData[0].value) * 100;
                  const prevPercentage = index > 0 ? (funnelData[index - 1].value / funnelData[0].value) * 100 : 100;
                  return (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <span className="text-sm font-bold text-foreground">{item.value.toLocaleString()}</span>
                      </div>
                      <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                          className="h-full rounded-lg"
                          style={{ backgroundColor: item.fill }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                      {index < funnelData.length - 1 && (
                        <div className="flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionRates.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{item.rate}%</span>
                        <span
                          className={`text-xs ${
                            item.change >= 0 ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {item.change >= 0 ? '+' : ''}
                          {item.change}%
                        </span>
                      </div>
                    </div>
                    <Progress value={item.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Funnel Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
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
                <Bar dataKey="visitors" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="preBooked" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

