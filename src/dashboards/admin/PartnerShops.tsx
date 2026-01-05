import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Store,
  Plus,
  Gift,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Package,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const metrics = {
  totalShops: 12,
  activeShops: 8,
  pendingShops: 2,
  totalRedemptions: 127,
  totalRedemptionValue: 317500,
  totalCommissionPaid: 17500,
  pendingCommission: 4800,
};

const redemptionTrend = [
  { month: 'Jan', redemptions: 85, value: 212500 },
  { month: 'Feb', redemptions: 102, value: 255000 },
  { month: 'Mar', redemptions: 127, value: 317500 },
  { month: 'Apr', redemptions: 145, value: 362500 },
];

const shopPerformance = [
  { shop: 'Electronics Hub', redemptions: 45, value: 112500 },
  { shop: 'Fashion Store', redemptions: 32, value: 80000 },
  { shop: 'Home Decor', redemptions: 28, value: 70000 },
  { shop: 'Sports Zone', redemptions: 22, value: 55000 },
];

const recentActivity = [
  {
    id: 1,
    type: 'shop_added',
    message: 'New shop "Home Essentials" added',
    timestamp: '2 hours ago',
    icon: Store,
    color: 'text-info',
  },
  {
    id: 2,
    type: 'redemption',
    message: '45 redemptions processed today',
    timestamp: '5 hours ago',
    icon: Gift,
    color: 'text-success',
  },
  {
    id: 3,
    type: 'commission',
    message: 'Commission payout of ₹17,500 processed',
    timestamp: '1 day ago',
    icon: DollarSign,
    color: 'text-primary',
  },
  {
    id: 4,
    type: 'approval',
    message: '3 shops pending approval',
    timestamp: '2 days ago',
    icon: Clock,
    color: 'text-warning',
  },
];

export const PartnerShops = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partner Shops Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of partner shops, redemptions, and commissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/partners/shops">Manage Shops</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/partners/shops">
              <Plus className="h-4 w-4 mr-2" />
              Add Shop
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Shops</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metrics.totalShops}</p>
                </div>
                <Store className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Shops</p>
                  <p className="text-3xl font-bold text-success mt-1">{metrics.activeShops}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Redemptions</p>
                  <p className="text-3xl font-bold text-info mt-1">{metrics.totalRedemptions}</p>
                </div>
                <Gift className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Commission Paid</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{(metrics.totalCommissionPaid / 1000).toFixed(1)}K
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-3xl font-bold text-warning mt-1">{metrics.pendingShops}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Redemption Value</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{(metrics.totalRedemptionValue / 1000).toFixed(1)}K
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Commission</p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    ₹{(metrics.pendingCommission / 1000).toFixed(1)}K
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Redemption Trend (Last 4 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={redemptionTrend}>
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
                  <Line type="monotone" dataKey="redemptions" stroke="hsl(221 83% 53%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Shop Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shopPerformance}>
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
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/partners/shops">
                    <Store className="h-4 w-4 mr-2" />
                    Manage Shops
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/partners/products">
                    <Package className="h-4 w-4 mr-2" />
                    Product Mapping
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/partners/redemption">
                    <Gift className="h-4 w-4 mr-2" />
                    Redemption Load
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/partners/commission">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Commission Ratio
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className={`mt-0.5 ${activity.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Approval Alert */}
      {metrics.pendingShops > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="border-warning/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      {metrics.pendingShops} shop{metrics.pendingShops > 1 ? 's' : ''} pending approval
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Review and approve new partner shop applications
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/partners/shops">Review</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

