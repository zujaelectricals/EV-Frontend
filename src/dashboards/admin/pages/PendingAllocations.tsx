import { motion } from 'framer-motion';
import { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle, Clock, Search, Filter, User, Download } from 'lucide-react';
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
import { Allocation } from '../types/inventory';

const mockAllocations: Allocation[] = [
  {
    id: 'alloc1',
    orderId: 'ORD-2024-001',
    preBookingId: 'PB-2024-001',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    customerId: 'U12345',
    customerName: 'Rajesh Kumar',
    priority: 'high',
    status: 'pending',
    requestedDate: '2024-03-20',
    notes: 'Customer requested early delivery',
  },
  {
    id: 'alloc2',
    orderId: 'ORD-2024-002',
    preBookingId: 'PB-2024-002',
    modelId: 'zuja-evolve-plus',
    modelName: 'EVOLVE PLUS',
    customerId: 'U12346',
    customerName: 'Priya Sharma',
    priority: 'medium',
    status: 'approved',
    requestedDate: '2024-03-21',
    warehouseId: 'wh1',
    warehouseName: 'Mumbai Central',
  },
  {
    id: 'alloc3',
    orderId: 'ORD-2024-003',
    modelId: 'zuja-evoque',
    modelName: 'EVOQUE',
    customerId: 'U12347',
    customerName: 'Amit Patel',
    priority: 'low',
    status: 'allocated',
    requestedDate: '2024-03-18',
    allocatedVehicleId: 'VH-003',
    warehouseId: 'wh2',
    warehouseName: 'Delhi North',
  },
  {
    id: 'alloc4',
    orderId: 'ORD-2024-004',
    modelId: 'zuja-evolve',
    modelName: 'EVOLVE',
    customerId: 'U12348',
    customerName: 'Sneha Reddy',
    priority: 'high',
    status: 'pending',
    requestedDate: '2024-03-22',
    conflictReason: 'Insufficient stock in requested warehouse',
  },
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">High</Badge>;
    case 'medium':
      return <Badge variant="default">Medium</Badge>;
    case 'low':
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="default">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge className="bg-info text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case 'allocated':
      return (
        <Badge className="bg-success text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Allocated
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const PendingAllocations = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredAllocations = mockAllocations.filter((allocation) => {
    const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || allocation.priority === priorityFilter;
    const matchesSearch =
      allocation.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.modelName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const pendingCount = mockAllocations.filter((a) => a.status === 'pending').length;
  const approvedCount = mockAllocations.filter((a) => a.status === 'approved').length;
  const allocatedCount = mockAllocations.filter((a) => a.status === 'allocated').length;
  const conflictCount = mockAllocations.filter((a) => a.conflictReason).length;

  const handleApprove = (id: string) => {
    // Mock approval logic
    console.log('Approving allocation:', id);
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this allocation?')) {
      console.log('Rejecting allocation:', id);
    }
  };

  const handleAllocate = (id: string) => {
    setSelectedAllocation(mockAllocations.find((a) => a.id === id) || null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Allocations</h1>
          <p className="text-muted-foreground mt-1">Manage vehicle allocations to orders and pre-bookings</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-info mt-1">{approvedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Allocated</p>
                  <p className="text-3xl font-bold text-success mt-1">{allocatedCount}</p>
                </div>
                <Package className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Conflicts</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{conflictCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Conflict Alerts */}
      {conflictCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Allocation Conflicts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAllocations
                  .filter((a) => a.conflictReason)
                  .map((allocation) => (
                    <div
                      key={allocation.id}
                      className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{allocation.orderId}</p>
                        <p className="text-sm text-muted-foreground">{allocation.conflictReason}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Allocations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Allocation Queue</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell className="font-medium">{allocation.orderId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{allocation.customerName}</p>
                        <p className="text-xs text-muted-foreground">{allocation.customerId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{allocation.modelName}</span>
                  </TableCell>
                  <TableCell>{getPriorityBadge(allocation.priority)}</TableCell>
                  <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{allocation.requestedDate}</span>
                  </TableCell>
                  <TableCell>
                    {allocation.warehouseName ? (
                      <span className="text-sm">{allocation.warehouseName}</span>
                    ) : (
                      <Badge variant="outline">Not Assigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {allocation.allocatedVehicleId ? (
                      <code className="text-xs bg-secondary px-2 py-1 rounded">
                        {allocation.allocatedVehicleId}
                      </code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {allocation.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(allocation.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleReject(allocation.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {allocation.status === 'approved' && (
                        <Button size="sm" onClick={() => handleAllocate(allocation.id)}>
                          <Package className="h-4 w-4 mr-1" />
                          Allocate
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Allocation Details</DialogTitle>
                            <DialogDescription>Order {allocation.orderId}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-xs text-muted-foreground">Customer</Label>
                                <p className="font-medium">{allocation.customerName}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Model</Label>
                                <p className="font-medium">{allocation.modelName}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Priority</Label>
                                <div className="mt-1">{getPriorityBadge(allocation.priority)}</div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <div className="mt-1">{getStatusBadge(allocation.status)}</div>
                              </div>
                              {allocation.preBookingId && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Pre-Booking ID</Label>
                                  <p className="font-medium">{allocation.preBookingId}</p>
                                </div>
                              )}
                              {allocation.allocatedVehicleId && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Vehicle ID</Label>
                                  <p className="font-medium">{allocation.allocatedVehicleId}</p>
                                </div>
                              )}
                            </div>
                            {allocation.notes && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Notes</Label>
                                <p className="text-sm mt-1">{allocation.notes}</p>
                              </div>
                            )}
                            {allocation.conflictReason && (
                              <div className="p-3 bg-destructive/10 rounded-lg">
                                <Label className="text-xs text-destructive">Conflict Reason</Label>
                                <p className="text-sm mt-1">{allocation.conflictReason}</p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vehicle Allocation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Vehicle</DialogTitle>
            <DialogDescription>
              Assign a vehicle from inventory to order {selectedAllocation?.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wh1">Mumbai Central</SelectItem>
                  <SelectItem value="wh2">Delhi North</SelectItem>
                  <SelectItem value="wh3">Bangalore South</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Available Vehicles</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vh-001">VH-001 (EVOLVE - Black)</SelectItem>
                  <SelectItem value="vh-002">VH-002 (EVOLVE - White)</SelectItem>
                  <SelectItem value="vh-003">VH-003 (EVOLVE PLUS - Red)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>Confirm Allocation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

