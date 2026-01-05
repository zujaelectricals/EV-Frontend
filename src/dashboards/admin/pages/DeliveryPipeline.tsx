import { motion } from 'framer-motion';
import { useState } from 'react';
import { Truck, Package, MapPin, Clock, CheckCircle, XCircle, Calendar, Search, Filter, Download } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Delivery } from '../types/inventory';

const mockDeliveries: Delivery[] = [
  {
    id: 'del1',
    orderId: 'ORD-2024-001',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    customerId: 'U12345',
    customerName: 'Rajesh Kumar',
    status: 'in_transit',
    allocatedVehicleId: 'VH-001',
    deliveryPartner: 'DP001',
    deliveryPartnerName: 'FastTrack Logistics',
    scheduledDate: '2024-03-25',
    trackingNumber: 'TRK-123456789',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    timeline: [
      {
        id: 'tl1',
        status: 'ordered',
        timestamp: '2024-03-20 10:00',
        updatedBy: 'System',
      },
      {
        id: 'tl2',
        status: 'allocated',
        timestamp: '2024-03-21 14:30',
        updatedBy: 'Admin User',
      },
      {
        id: 'tl3',
        status: 'in_transit',
        timestamp: '2024-03-22 09:00',
        location: 'Mumbai Warehouse',
        updatedBy: 'Delivery Partner',
      },
    ],
  },
  {
    id: 'del2',
    orderId: 'ORD-2024-002',
    modelId: 'zuja-evolve-plus',
    modelName: 'EVOLVE PLUS',
    customerId: 'U12346',
    customerName: 'Priya Sharma',
    status: 'out_for_delivery',
    allocatedVehicleId: 'VH-002',
    deliveryPartner: 'DP002',
    deliveryPartnerName: 'QuickDeliver',
    scheduledDate: '2024-03-24',
    trackingNumber: 'TRK-987654321',
    address: {
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
    },
    timeline: [
      {
        id: 'tl4',
        status: 'ordered',
        timestamp: '2024-03-18 11:00',
        updatedBy: 'System',
      },
      {
        id: 'tl5',
        status: 'allocated',
        timestamp: '2024-03-19 15:00',
        updatedBy: 'Admin User',
      },
      {
        id: 'tl6',
        status: 'in_transit',
        timestamp: '2024-03-22 10:00',
        location: 'Delhi Warehouse',
        updatedBy: 'Delivery Partner',
      },
      {
        id: 'tl7',
        status: 'out_for_delivery',
        timestamp: '2024-03-23 08:00',
        location: 'Delhi',
        updatedBy: 'Delivery Partner',
      },
    ],
  },
  {
    id: 'del3',
    orderId: 'ORD-2024-003',
    modelId: 'zuja-evoque',
    modelName: 'EVOQUE',
    customerId: 'U12347',
    customerName: 'Amit Patel',
    status: 'delivered',
    allocatedVehicleId: 'VH-003',
    deliveryPartner: 'DP001',
    deliveryPartnerName: 'FastTrack Logistics',
    scheduledDate: '2024-03-20',
    deliveredDate: '2024-03-20 16:30',
    trackingNumber: 'TRK-456789123',
    address: {
      street: '789 Business Park',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    timeline: [
      {
        id: 'tl8',
        status: 'ordered',
        timestamp: '2024-03-15 09:00',
        updatedBy: 'System',
      },
      {
        id: 'tl9',
        status: 'allocated',
        timestamp: '2024-03-16 11:00',
        updatedBy: 'Admin User',
      },
      {
        id: 'tl10',
        status: 'in_transit',
        timestamp: '2024-03-18 10:00',
        location: 'Bangalore Warehouse',
        updatedBy: 'Delivery Partner',
      },
      {
        id: 'tl11',
        status: 'out_for_delivery',
        timestamp: '2024-03-20 14:00',
        location: 'Bangalore',
        updatedBy: 'Delivery Partner',
      },
      {
        id: 'tl12',
        status: 'delivered',
        timestamp: '2024-03-20 16:30',
        location: 'Customer Address',
        updatedBy: 'Delivery Partner',
      },
    ],
  },
];

const statusData = [
  { status: 'Ordered', count: 12 },
  { status: 'Allocated', count: 8 },
  { status: 'In Transit', count: 15 },
  { status: 'Out for Delivery', count: 5 },
  { status: 'Delivered', count: 125 },
];

const deliveryPerformance = [
  { month: 'Jan', onTime: 85, delayed: 15 },
  { month: 'Feb', onTime: 88, delayed: 12 },
  { month: 'Mar', onTime: 92, delayed: 8 },
  { month: 'Apr', onTime: 90, delayed: 10 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ordered':
      return <Badge variant="secondary">Ordered</Badge>;
    case 'allocated':
      return <Badge variant="default">Allocated</Badge>;
    case 'in_transit':
      return <Badge className="bg-info text-white">In Transit</Badge>;
    case 'out_for_delivery':
      return <Badge className="bg-warning text-white">Out for Delivery</Badge>;
    case 'delivered':
      return <Badge className="bg-success text-white">Delivered</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getStatusProgress = (status: string) => {
  const statusOrder = ['ordered', 'allocated', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);
  return ((currentIndex + 1) / statusOrder.length) * 100;
};

export const DeliveryPipeline = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeliveries = mockDeliveries.filter((delivery) => {
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesSearch =
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const inTransitCount = mockDeliveries.filter((d) => d.status === 'in_transit').length;
  const outForDeliveryCount = mockDeliveries.filter((d) => d.status === 'out_for_delivery').length;
  const deliveredCount = mockDeliveries.filter((d) => d.status === 'delivered').length;
  const onTimeRate = 92; // Mock calculation

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery Pipeline</h1>
          <p className="text-muted-foreground mt-1">Track orders from allocation to delivery</p>
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
                  <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                  <p className="text-3xl font-bold text-info mt-1">{inTransitCount}</p>
                </div>
                <Truck className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Out for Delivery</p>
                  <p className="text-3xl font-bold text-warning mt-1">{outForDeliveryCount}</p>
                </div>
                <Package className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-3xl font-bold text-success mt-1">{deliveredCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{onTimeRate}%</p>
                </div>
                <Clock className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delivery Status Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="status" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
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
              <CardTitle>Delivery Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryPerformance}>
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
                  <Bar dataKey="onTime" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delayed" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Delivery Pipeline</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search orders..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Delivery Partner</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.orderId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{delivery.customerName}</p>
                          <p className="text-xs text-muted-foreground">{delivery.customerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{delivery.modelName}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={getStatusProgress(delivery.status)} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(getStatusProgress(delivery.status))}% complete
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.deliveryPartnerName ? (
                          <span className="text-sm">{delivery.deliveryPartnerName}</span>
                        ) : (
                          <Badge variant="outline">Not Assigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{delivery.scheduledDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.trackingNumber ? (
                          <code className="text-xs bg-secondary px-2 py-1 rounded">
                            {delivery.trackingNumber}
                          </code>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Delivery Details</DialogTitle>
                              <DialogDescription>Order {delivery.orderId}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Customer</Label>
                                  <p className="font-medium">{delivery.customerName}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Model</Label>
                                  <p className="font-medium">{delivery.modelName}</p>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Status</Label>
                                  <div className="mt-1">{getStatusBadge(delivery.status)}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Tracking Number</Label>
                                  <p className="font-medium">{delivery.trackingNumber || 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Delivery Address</Label>
                                <div className="mt-1 p-3 bg-secondary rounded-lg">
                                  <p className="text-sm">
                                    {delivery.address.street}, {delivery.address.city}
                                  </p>
                                  <p className="text-sm">
                                    {delivery.address.state} - {delivery.address.pincode}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">Timeline</Label>
                                <div className="space-y-2">
                                  {delivery.timeline.map((event, index) => (
                                    <div key={event.id} className="flex items-start gap-3">
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={`h-2 w-2 rounded-full ${
                                            index === delivery.timeline.length - 1
                                              ? 'bg-primary'
                                              : 'bg-muted-foreground'
                                          }`}
                                        />
                                        {index < delivery.timeline.length - 1 && (
                                          <div className="h-8 w-0.5 bg-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <p className="text-sm font-medium capitalize">{event.status}</p>
                                        <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                                        {event.location && (
                                          <p className="text-xs text-muted-foreground">{event.location}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Update Status</Button>
                              <Button>Close</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <div className="space-y-4">
                {filteredDeliveries.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">{delivery.orderId}</h4>
                            {getStatusBadge(delivery.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {delivery.customerName} - {delivery.modelName}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{delivery.address.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{delivery.scheduledDate}</span>
                            </div>
                            {delivery.trackingNumber && (
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                <code className="text-xs">{delivery.trackingNumber}</code>
                              </div>
                            )}
                          </div>
                        </div>
                        <Progress value={getStatusProgress(delivery.status)} className="w-24 h-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

