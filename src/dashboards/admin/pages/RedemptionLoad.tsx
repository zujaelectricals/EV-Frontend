import { motion } from 'framer-motion';
import { useState } from 'react';
import { Gift, Store, DollarSign, TrendingUp, Search, Filter, Download, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { RedemptionTransactionExtended } from '../types/partnerShops';

const mockRedemptions: RedemptionTransactionExtended[] = [
  {
    id: 'RD001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    shopId: 'shop1',
    shopName: 'Electronics Hub',
    productId: 'p1',
    productName: 'Wireless Earbuds',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200',
    points: 2500,
    value: 2500,
    status: 'completed',
    redeemedAt: '2024-03-20 10:30',
    processedAt: '2024-03-20 11:00',
  },
  {
    id: 'RD002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    shopId: 'shop2',
    shopName: 'Fashion Store',
    productId: 'p3',
    productName: 'Designer T-Shirt',
    productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    points: 5000,
    value: 5000,
    status: 'processing',
    redeemedAt: '2024-03-21 14:30',
  },
  {
    id: 'RD003',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    shopId: 'shop1',
    shopName: 'Electronics Hub',
    productId: 'p2',
    productName: 'Smart Watch',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
    points: 3000,
    value: 3000,
    status: 'pending',
    redeemedAt: '2024-03-22 09:15',
  },
  {
    id: 'RD004',
    userId: 'U12348',
    userName: 'Sneha Reddy',
    userEmail: 'sneha@example.com',
    shopId: 'shop2',
    shopName: 'Fashion Store',
    productId: 'p4',
    productName: 'Leather Wallet',
    productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
    points: 1200,
    value: 1200,
    status: 'completed',
    redeemedAt: '2024-03-19 16:20',
    processedAt: '2024-03-19 17:00',
  },
];

const shopData = [
  { shop: 'Electronics Hub', redemptions: 45, value: 112500 },
  { shop: 'Fashion Store', redemptions: 32, value: 80000 },
  { shop: 'Home Decor', redemptions: 28, value: 70000 },
  { shop: 'Sports Zone', redemptions: 22, value: 55000 },
];

const monthlyTrend = [
  { month: 'Jan', redemptions: 85, value: 212500 },
  { month: 'Feb', redemptions: 102, value: 255000 },
  { month: 'Mar', redemptions: 127, value: 317500 },
  { month: 'Apr', redemptions: 145, value: 362500 },
];

const topProducts = [
  { product: 'Wireless Earbuds', redemptions: 45 },
  { product: 'Smart Watch', redemptions: 32 },
  { product: 'Designer T-Shirt', redemptions: 28 },
  { product: 'Coffee Maker', redemptions: 22 },
];

const COLORS = ['hsl(221 83% 53%)', 'hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)'];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-white">Completed</Badge>;
    case 'processing':
      return <Badge variant="default">Processing</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    case 'refunded':
      return <Badge variant="outline">Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const RedemptionLoad = () => {
  const [redemptions] = useState<RedemptionTransactionExtended[]>(mockRedemptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shopFilter, setShopFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('monthly');
  const [viewingRedemption, setViewingRedemption] = useState<RedemptionTransactionExtended | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredRedemptions = redemptions.filter((redemption) => {
    const matchesSearch =
      redemption.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redemption.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redemption.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redemption.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
    const matchesShop = shopFilter === 'all' || redemption.shopId === shopFilter;
    return matchesSearch && matchesStatus && matchesShop;
  });

  const totalRedemptions = redemptions.length;
  const totalValue = redemptions.reduce((sum, r) => sum + r.value, 0);
  const completedRedemptions = redemptions.filter((r) => r.status === 'completed').length;
  const pendingRedemptions = redemptions.filter((r) => r.status === 'pending' || r.status === 'processing').length;

  const handleView = (redemption: RedemptionTransactionExtended) => {
    setViewingRedemption(redemption);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Redemption Load</h1>
          <p className="text-muted-foreground mt-1">Track redemption transactions across partner shops</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
                  <p className="text-3xl font-bold text-foreground mt-1">{totalRedemptions}</p>
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
                  <p className="text-3xl font-bold text-foreground mt-1">₹{(totalValue / 1000).toFixed(1)}K</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-success mt-1">{completedRedemptions}</p>
                </div>
                <Gift className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{pendingRedemptions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
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

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Redemption Trend</CardTitle>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
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
                <Legend />
                <Line type="monotone" dataKey="redemptions" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Redemptions" />
                <Line type="monotone" dataKey="value" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Value (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Redeemed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.product} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.product}</p>
                      <p className="text-xs text-muted-foreground">{product.redemptions} redemptions</p>
                    </div>
                  </div>
                  <Badge variant="outline">{product.redemptions} times</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Redemptions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Redemption Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={shopFilter} onValueChange={setShopFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Shops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  <SelectItem value="shop1">Electronics Hub</SelectItem>
                  <SelectItem value="shop2">Fashion Store</SelectItem>
                  <SelectItem value="shop3">Home Essentials</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {filteredRedemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell className="font-medium">{redemption.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{redemption.userName}</p>
                      <p className="text-xs text-muted-foreground">{redemption.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{redemption.shopName}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {redemption.productImage && (
                        <img
                          src={redemption.productImage}
                          alt={redemption.productName}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <span className="text-sm">{redemption.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-primary">{redemption.points}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{redemption.value.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{redemption.redeemedAt.split(' ')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleView(redemption)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Redemption Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Redemption Details</DialogTitle>
            <DialogDescription>Transaction {viewingRedemption?.id}</DialogDescription>
          </DialogHeader>
          {viewingRedemption && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Redemption ID</Label>
                  <p className="font-medium">{viewingRedemption.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingRedemption.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="font-medium">{viewingRedemption.userName}</p>
                  <p className="text-xs text-muted-foreground">{viewingRedemption.userEmail}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Shop</Label>
                  <p className="font-medium">{viewingRedemption.shopName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Product</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {viewingRedemption.productImage && (
                      <img
                        src={viewingRedemption.productImage}
                        alt={viewingRedemption.productName}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <p className="font-medium">{viewingRedemption.productName}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Points</Label>
                  <p className="font-medium text-primary">{viewingRedemption.points}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <p className="font-medium">₹{viewingRedemption.value.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Redeemed At</Label>
                  <p className="font-medium">{viewingRedemption.redeemedAt}</p>
                </div>
                {viewingRedemption.processedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Processed At</Label>
                    <p className="font-medium">{viewingRedemption.processedAt}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

