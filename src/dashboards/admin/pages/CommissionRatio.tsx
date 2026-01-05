import { motion } from 'framer-motion';
import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Building2, Wallet, Plus, Edit, Trash2, Download, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CommissionStructure } from '../types/partnerShops';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const mockCommissions: CommissionStructure[] = [
  {
    id: 'comm1',
    shopId: 'shop1',
    shopName: 'Electronics Hub',
    baseRate: 5.5,
    tierRates: [
      { minRedemptions: 50, rate: 6.0 },
      { minRedemptions: 100, rate: 6.5 },
      { minRedemptions: 200, rate: 7.0 },
    ],
    paymentSchedule: 'monthly',
    paymentMethod: 'bank_transfer',
    bankDetails: {
      accountNumber: '1234567890',
      ifsc: 'HDFC0001234',
      bankName: 'HDFC Bank',
      accountHolderName: 'Rajesh Kumar',
    },
    lastPayoutDate: '2024-03-01',
    nextPayoutDate: '2024-04-01',
    totalEarnings: 19937.5,
    pendingEarnings: 5432.5,
    minimumPayoutThreshold: 1000,
    autoPayout: true,
  },
  {
    id: 'comm2',
    shopId: 'shop2',
    shopName: 'Fashion Store',
    baseRate: 6.0,
    tierRates: [
      { minRedemptions: 30, rate: 6.5 },
      { minRedemptions: 75, rate: 7.0 },
    ],
    paymentSchedule: 'monthly',
    paymentMethod: 'upi',
    upiId: 'priya@paytm',
    lastPayoutDate: '2024-03-05',
    nextPayoutDate: '2024-04-05',
    totalEarnings: 14700,
    pendingEarnings: 4200,
    minimumPayoutThreshold: 500,
    autoPayout: true,
  },
  {
    id: 'comm3',
    shopId: 'shop3',
    shopName: 'Home Essentials',
    baseRate: 5.0,
    paymentSchedule: 'weekly',
    paymentMethod: 'wallet',
    walletAddress: '0x1234567890abcdef',
    totalEarnings: 0,
    pendingEarnings: 0,
    minimumPayoutThreshold: 500,
    autoPayout: false,
  },
];

const payoutHistory = [
  {
    id: 'payout1',
    shopId: 'shop1',
    shopName: 'Electronics Hub',
    amount: 19937.5,
    date: '2024-03-01',
    status: 'completed',
    paymentMethod: 'bank_transfer',
  },
  {
    id: 'payout2',
    shopId: 'shop2',
    shopName: 'Fashion Store',
    amount: 14700,
    date: '2024-03-05',
    status: 'completed',
    paymentMethod: 'upi',
  },
  {
    id: 'payout3',
    shopId: 'shop1',
    shopName: 'Electronics Hub',
    amount: 18500,
    date: '2024-02-01',
    status: 'completed',
    paymentMethod: 'bank_transfer',
  },
];

const earningsTrend = [
  { month: 'Jan', earnings: 15000 },
  { month: 'Feb', earnings: 18500 },
  { month: 'Mar', earnings: 19937.5 },
  { month: 'Apr', earnings: 22000 },
];

export const CommissionRatio = () => {
  const [commissions, setCommissions] = useState<CommissionStructure[]>(mockCommissions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<CommissionStructure | null>(null);
  const [selectedShop, setSelectedShop] = useState<string>('all');

  const filteredCommissions = commissions.filter(
    (comm) => selectedShop === 'all' || comm.shopId === selectedShop
  );

  const totalEarnings = commissions.reduce((sum, c) => sum + c.totalEarnings, 0);
  const pendingEarnings = commissions.reduce((sum, c) => sum + c.pendingEarnings, 0);
  const averageRate = commissions.reduce((sum, c) => sum + c.baseRate, 0) / commissions.length;

  const handleEdit = (commission: CommissionStructure) => {
    setEditingCommission(commission);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCommission(null);
    setIsDialogOpen(true);
  };

  const mockShops = [
    { id: 'shop1', name: 'Electronics Hub' },
    { id: 'shop2', name: 'Fashion Store' },
    { id: 'shop3', name: 'Home Essentials' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commission Ratio</h1>
          <p className="text-muted-foreground mt-1">Manage commission structures and payout configurations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Commission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCommission ? 'Edit Commission Structure' : 'Add Commission Structure'}
                </DialogTitle>
                <DialogDescription>
                  {editingCommission
                    ? 'Update commission rates and payment configuration'
                    : 'Configure commission structure for a partner shop'}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="rates" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rates">Commission Rates</TabsTrigger>
                  <TabsTrigger value="payment">Payment Setup</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                </TabsList>
                <TabsContent value="rates" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Shop</Label>
                    <Select defaultValue={editingCommission?.shopId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shop" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockShops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id}>
                            {shop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Base Commission Rate (%) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      defaultValue={editingCommission?.baseRate}
                    />
                    <p className="text-xs text-muted-foreground">
                      Base commission rate applied to all redemptions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Payout Threshold (₹)</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      defaultValue={editingCommission?.minimumPayoutThreshold}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Tiered Commission Rates (Optional)</Label>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Tier
                      </Button>
                    </div>
                    <div className="space-y-2 border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Add tier rates based on redemption volume
                      </p>
                      {editingCommission?.tierRates?.map((tier, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Min Redemptions"
                            defaultValue={tier.minRedemptions}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Rate %"
                            defaultValue={tier.rate}
                            className="w-32"
                          />
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="payment" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <Select defaultValue={editingCommission?.paymentMethod || 'bank_transfer'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bank Account Number</Label>
                      <Input
                        placeholder="1234567890"
                        defaultValue={editingCommission?.bankDetails?.accountNumber}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input placeholder="HDFC0001234" defaultValue={editingCommission?.bankDetails?.ifsc} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input placeholder="HDFC Bank" defaultValue={editingCommission?.bankDetails?.bankName} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Holder Name</Label>
                      <Input
                        placeholder="Account Holder Name"
                        defaultValue={editingCommission?.bankDetails?.accountHolderName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>UPI ID</Label>
                      <Input placeholder="user@paytm" defaultValue={editingCommission?.upiId} />
                    </div>
                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input placeholder="0x..." defaultValue={editingCommission?.walletAddress} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Payout</Label>
                    <Switch defaultChecked={editingCommission?.autoPayout || false} />
                  </div>
                </TabsContent>
                <TabsContent value="schedule" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Schedule *</Label>
                    <Select defaultValue={editingCommission?.paymentSchedule || 'monthly'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Next Payout Date</Label>
                    <Input type="date" defaultValue={editingCommission?.nextPayoutDate} />
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {editingCommission ? 'Update' : 'Create'} Commission
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{(totalEarnings / 1000).toFixed(1)}K
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
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Earnings</p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    ₹{(pendingEarnings / 1000).toFixed(1)}K
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Average Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{averageRate.toFixed(1)}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Structures</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{commissions.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Earnings Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsTrend}>
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
                <Line type="monotone" dataKey="earnings" stroke="hsl(221 83% 53%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission Structures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commission Structures</CardTitle>
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Shops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shops</SelectItem>
                {mockShops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Tiers</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Next Payout</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <span className="font-medium text-foreground">{commission.shopName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-primary">{commission.baseRate}%</span>
                  </TableCell>
                  <TableCell>
                    {commission.tierRates && commission.tierRates.length > 0 ? (
                      <Badge variant="outline">{commission.tierRates.length} tiers</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">No tiers</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {commission.paymentMethod === 'bank_transfer' && (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      {commission.paymentMethod === 'upi' && (
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                      )}
                      {commission.paymentMethod === 'wallet' && (
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm capitalize">
                        {commission.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{commission.paymentSchedule}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-success">₹{commission.totalEarnings.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-warning">
                      ₹{commission.pendingEarnings.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {commission.nextPayoutDate ? (
                      <span className="text-sm">{commission.nextPayoutDate}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(commission)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutHistory.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <span className="text-sm">{payout.date}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{payout.shopName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">₹{payout.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{payout.paymentMethod.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-success text-white">{payout.status}</Badge>
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

