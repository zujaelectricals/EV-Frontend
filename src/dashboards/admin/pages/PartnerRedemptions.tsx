import { motion } from 'framer-motion';
import { Gift, Store, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const redemptions = [
  {
    id: 'RD001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    shop: 'Electronics Hub',
    product: 'Wireless Earbuds',
    points: 2500,
    value: 2500,
    date: '2024-03-20',
    status: 'completed',
  },
  {
    id: 'RD002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    shop: 'Fashion Store',
    product: 'Smart Watch',
    points: 5000,
    value: 5000,
    date: '2024-03-21',
    status: 'pending',
  },
];

const shopData = [
  { shop: 'Electronics Hub', redemptions: 45, value: 112500 },
  { shop: 'Fashion Store', redemptions: 32, value: 80000 },
  { shop: 'Home Decor', redemptions: 28, value: 70000 },
  { shop: 'Sports Zone', redemptions: 22, value: 55000 },
];

const COLORS = ['hsl(221 83% 53%)', 'hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)'];

export const PartnerRedemptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Partner Redemptions</h1>
        <p className="text-muted-foreground mt-1">Track redemption transactions across partner shops</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Redemptions</p>
                  <p className="text-3xl font-bold text-foreground mt-1">127</p>
                </div>
                <Gift className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹3.18L</p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Shops</p>
                  <p className="text-3xl font-bold text-foreground mt-1">12</p>
                </div>
                <Store className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold text-foreground mt-1">45</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Shop Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Redemptions by Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shopData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="shop" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="redemptions" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <CardTitle>Value Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shopData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {shopData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {shopData.map((item, index) => (
                  <div key={item.shop} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{item.shop}</p>
                      <p className="text-xs text-muted-foreground">₹{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Redemptions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Redemptions</CardTitle>
            <Input placeholder="Search..." className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Redemption ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell className="font-medium">{redemption.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{redemption.userName}</p>
                      <p className="text-xs text-muted-foreground">{redemption.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{redemption.shop}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{redemption.product}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{redemption.points}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{redemption.value.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{redemption.date}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={redemption.status === 'completed' ? 'bg-success text-white' : 'bg-warning text-white'}
                    >
                      {redemption.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

