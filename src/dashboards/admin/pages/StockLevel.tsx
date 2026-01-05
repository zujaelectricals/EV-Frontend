import { motion } from 'framer-motion';
import { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Warehouse, Plus, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Legend,
} from 'recharts';
import { StockLevel, StockMovement } from '../types/inventory';

const mockWarehouses = [
  { id: 'wh1', name: 'Mumbai Central', location: 'Mumbai, MH' },
  { id: 'wh2', name: 'Delhi North', location: 'Delhi, DL' },
  { id: 'wh3', name: 'Bangalore South', location: 'Bangalore, KA' },
];

const mockStockLevels: StockLevel[] = [
  {
    id: 'sl1',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    warehouseId: 'wh1',
    warehouseName: 'Mumbai Central',
    quantity: 45,
    reserved: 5,
    available: 40,
    reorderPoint: 20,
    maxStock: 100,
    lastUpdated: '2024-03-22 10:30',
    status: 'in_stock',
  },
  {
    id: 'sl2',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    warehouseId: 'wh2',
    warehouseName: 'Delhi North',
    quantity: 15,
    reserved: 2,
    available: 13,
    reorderPoint: 20,
    maxStock: 80,
    lastUpdated: '2024-03-22 09:15',
    status: 'low_stock',
  },
  {
    id: 'sl3',
    modelId: 'zuja-evolve-plus',
    modelName: 'EVOLVE PLUS',
    warehouseId: 'wh1',
    warehouseName: 'Mumbai Central',
    quantity: 32,
    reserved: 8,
    available: 24,
    reorderPoint: 15,
    maxStock: 100,
    lastUpdated: '2024-03-22 11:00',
    status: 'in_stock',
  },
  {
    id: 'sl4',
    modelId: 'zuja-evoque',
    modelName: 'EVOQUE',
    warehouseId: 'wh3',
    warehouseName: 'Bangalore South',
    quantity: 0,
    reserved: 0,
    available: 0,
    reorderPoint: 10,
    maxStock: 60,
    lastUpdated: '2024-03-20 14:20',
    status: 'out_of_stock',
  },
];

const mockMovements: StockMovement[] = [
  {
    id: 'mov1',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    type: 'in',
    quantity: 50,
    reason: 'Purchase Order',
    reference: 'PO-2024-001',
    userId: 'admin1',
    userName: 'Admin User',
    timestamp: '2024-03-20 10:00',
    notes: 'New stock received',
  },
  {
    id: 'mov2',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    type: 'out',
    quantity: 5,
    reason: 'Order Fulfillment',
    reference: 'ORD-2024-123',
    userId: 'admin1',
    userName: 'Admin User',
    timestamp: '2024-03-21 14:30',
    fromWarehouse: 'wh1',
  },
  {
    id: 'mov3',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    type: 'transfer',
    quantity: 10,
    reason: 'Stock Transfer',
    reference: 'TRF-2024-045',
    userId: 'admin1',
    userName: 'Admin User',
    timestamp: '2024-03-22 09:00',
    fromWarehouse: 'wh1',
    toWarehouse: 'wh2',
  },
];

const stockTrendData = [
  { month: 'Jan', quantity: 120 },
  { month: 'Feb', quantity: 135 },
  { month: 'Mar', quantity: 145 },
  { month: 'Apr', quantity: 160 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'in_stock':
      return <Badge className="bg-success text-white">In Stock</Badge>;
    case 'low_stock':
      return <Badge variant="default">Low Stock</Badge>;
    case 'out_of_stock':
      return <Badge variant="destructive">Out of Stock</Badge>;
    case 'overstock':
      return <Badge variant="secondary">Overstock</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getMovementTypeBadge = (type: string) => {
  switch (type) {
    case 'in':
      return <Badge className="bg-success text-white">In</Badge>;
    case 'out':
      return <Badge variant="destructive">Out</Badge>;
    case 'transfer':
      return <Badge variant="default">Transfer</Badge>;
    case 'adjustment':
      return <Badge variant="secondary">Adjustment</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const StockLevel = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);

  const filteredStock = mockStockLevels.filter((stock) => {
    const matchesWarehouse = selectedWarehouse === 'all' || stock.warehouseId === selectedWarehouse;
    const matchesSearch =
      stock.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.warehouseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWarehouse && matchesSearch;
  });

  const lowStockItems = mockStockLevels.filter((s) => s.status === 'low_stock' || s.status === 'out_of_stock');
  const totalStockValue = mockStockLevels.reduce((sum, s) => sum + s.quantity * 85000, 0);
  const totalQuantity = mockStockLevels.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Level</h1>
          <p className="text-muted-foreground mt-1">Monitor inventory levels across warehouses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Stock Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stock Adjustment</DialogTitle>
                <DialogDescription>Add, remove, or transfer stock between warehouses</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="adjust" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="adjust">Adjust</TabsTrigger>
                  <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  <TabsTrigger value="add">Add Stock</TabsTrigger>
                </TabsList>
                <TabsContent value="adjust" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStockLevels.map((stock) => (
                          <SelectItem key={stock.id} value={stock.modelId}>
                            {stock.modelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Warehouse</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockWarehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Adjustment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Increase</SelectItem>
                        <SelectItem value="decrease">Decrease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Textarea placeholder="Enter reason for adjustment..." rows={3} />
                  </div>
                </TabsContent>
                <TabsContent value="transfer" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStockLevels.map((stock) => (
                          <SelectItem key={stock.id} value={stock.modelId}>
                            {stock.modelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>From Warehouse</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockWarehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>
                              {wh.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Warehouse</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockWarehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>
                              {wh.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Textarea placeholder="Enter reason for transfer..." rows={3} />
                  </div>
                </TabsContent>
                <TabsContent value="add" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockStockLevels.map((stock) => (
                          <SelectItem key={stock.id} value={stock.modelId}>
                            {stock.modelName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Warehouse</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockWarehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Order Reference</Label>
                    <Input placeholder="PO-2024-XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Additional notes..." rows={3} />
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAdjustmentDialogOpen(false)}>Apply</Button>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Stock</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalQuantity}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{(totalStockValue / 100000).toFixed(1)}L
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{lowStockItems.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Warehouses</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{mockWarehouses.length}</p>
                </div>
                <Warehouse className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Low Stock Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.modelName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.warehouseName} - {item.quantity} units (Reorder: {item.reorderPoint})
                      </p>
                    </div>
                    <Badge variant="destructive">{item.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stock Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Stock Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockTrendData}>
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
                <Line type="monotone" dataKey="quantity" stroke="hsl(221 83% 53%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Levels by Warehouse</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {mockWarehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((stock) => {
                const stockPercentage = (stock.quantity / stock.maxStock) * 100;
                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <span className="font-medium text-foreground">{stock.modelName}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{stock.warehouseName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-foreground">{stock.quantity}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-warning">{stock.reserved}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-success">{stock.available}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {stock.quantity}/{stock.maxStock}
                          </span>
                          <span className="text-xs font-medium">{stockPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress
                          value={stockPercentage}
                          className={`h-2 ${
                            stockPercentage < 20
                              ? '[&>div]:bg-destructive'
                              : stockPercentage < 50
                              ? '[&>div]:bg-warning'
                              : '[&>div]:bg-success'
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(stock.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{stock.lastUpdated}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>From/To</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <span className="text-sm">{new Date(movement.timestamp).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{movement.modelName}</span>
                  </TableCell>
                  <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">{movement.quantity}</span>
                  </TableCell>
                  <TableCell>
                    {movement.type === 'transfer' ? (
                      <div className="text-sm">
                        <span className="text-muted-foreground">{movement.fromWarehouse}</span>
                        <span className="mx-1">→</span>
                        <span>{movement.toWarehouse}</span>
                      </div>
                    ) : movement.fromWarehouse ? (
                      <span className="text-sm">{movement.fromWarehouse}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{movement.reason}</span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-secondary px-2 py-1 rounded">{movement.reference}</code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{movement.userName}</span>
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

