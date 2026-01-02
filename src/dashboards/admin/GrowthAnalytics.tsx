import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const GrowthAnalytics = () => {
  const growthData = [
    { month: 'Jan', users: 120, revenue: 2400000, vehicles: 45 },
    { month: 'Feb', users: 180, revenue: 3200000, vehicles: 62 },
    { month: 'Mar', users: 250, revenue: 4500000, vehicles: 85 },
    { month: 'Apr', users: 320, revenue: 5800000, vehicles: 110 },
    { month: 'May', users: 410, revenue: 7200000, vehicles: 145 },
    { month: 'Jun', users: 520, revenue: 8900000, vehicles: 180 },
  ];

  const stats = [
    { label: 'Total Users', value: '2,450', change: '+24%', icon: Users, color: 'text-primary' },
    { label: 'Revenue Growth', value: '₹89L', change: '+32%', icon: DollarSign, color: 'text-success' },
    { label: 'Vehicles Sold', value: '1,240', change: '+18%', icon: Car, color: 'text-info' },
    { label: 'Growth Rate', value: '28%', change: '+5%', icon: TrendingUp, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Growth Analytics</h1>
        <p className="text-muted-foreground mt-1">Track platform growth metrics and trends</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-success mt-1">{stat.change} from last month</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--success))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

