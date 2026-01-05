import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Package,
  AlertTriangle,
  Truck,
  DollarSign,
  Warehouse,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const inventoryMetrics = {
  totalModels: 6,
  totalStock: 245,
  totalValue: 20825000,
  lowStockItems: 3,
  outOfStockItems: 1,
  pendingAllocations: 8,
  inTransitDeliveries: 15,
  warehouses: 3,
};

const stockTrend = [
  { month: 'Jan', value: 180 },
  { month: 'Feb', value: 195 },
  { month: 'Mar', value: 220 },
  { month: 'Apr', value: 245 },
];

const recentActivity = [
  {
    id: 1,
    type: 'stock_in',
    message: '50 units of EVOLVE added to Mumbai Central',
    timestamp: '2 hours ago',
    icon: Package,
    color: 'text-success',
  },
  {
    id: 2,
    type: 'allocation',
    message: 'Vehicle VH-003 allocated to ORD-2024-003',
    timestamp: '5 hours ago',
    icon: Truck,
    color: 'text-info',
  },
  {
    id: 3,
    type: 'delivery',
    message: 'Order ORD-2024-001 delivered to Rajesh Kumar',
    timestamp: '1 day ago',
    icon: CheckCircle,
    color: 'text-success',
  },
  {
    id: 4,
    type: 'alert',
    message: 'Low stock alert: EVOQUE in Bangalore South',
    timestamp: '2 days ago',
    icon: AlertTriangle,
    color: 'text-destructive',
  },
];

export const EVInventory = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">EV Inventory Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of inventory, stock levels, and operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/inventory/models">Manage Models</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/admin/inventory/stock">View Stock</Link>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{inventoryMetrics.totalModels}</p>
                </div>
                <Boxes className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Stock</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{inventoryMetrics.totalStock}</p>
                </div>
                <Package className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{(inventoryMetrics.totalValue / 100000).toFixed(1)}L
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{inventoryMetrics.lowStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Allocations</p>
                  <p className="text-3xl font-bold text-warning mt-1">{inventoryMetrics.pendingAllocations}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                  <p className="text-3xl font-bold text-info mt-1">{inventoryMetrics.inTransitDeliveries}</p>
                </div>
                <Truck className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Warehouses</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{inventoryMetrics.warehouses}</p>
                </div>
                <Warehouse className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-3xl font-bold text-destructive mt-1">
                    {inventoryMetrics.outOfStockItems}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stock Trend & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Stock Trend (Last 4 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stockTrend}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
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
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(221 83% 53%)"
                    fillOpacity={1}
                    fill="url(#colorStock)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

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
                  <Link to="/admin/inventory/models">
                    <Boxes className="h-4 w-4 mr-2" />
                    Manage Models
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/inventory/stock">
                    <Package className="h-4 w-4 mr-2" />
                    View Stock Levels
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/inventory/delivery">
                    <Truck className="h-4 w-4 mr-2" />
                    Delivery Pipeline
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/admin/inventory/allocations">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Allocations
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
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
  );
};

