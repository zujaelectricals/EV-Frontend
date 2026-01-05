import { motion } from 'framer-motion';
import { useState } from 'react';
import { Store, Plus, Search, Edit, Trash2, Eye, CheckCircle, XCircle, MapPin, Phone, Mail, Download, Upload, Filter } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PartnerShopExtended } from '../types/partnerShops';

const mockShops: PartnerShopExtended[] = [
  {
    id: 'shop1',
    name: 'Electronics Hub',
    category: 'Electronics',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100',
    description: 'Premium electronics and gadgets',
    ownerName: 'Rajesh Kumar',
    ownerEmail: 'rajesh@electronicshub.com',
    ownerPhone: '+91 98765 43210',
    address: {
      street: '123 Tech Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
    },
    status: 'active',
    commissionRate: 5.5,
    paymentTerms: 'Monthly payout on 1st',
    contractStartDate: '2024-01-15',
    totalRedemptions: 145,
    totalValue: 362500,
    productsCount: 45,
    createdAt: '2024-01-10',
    updatedAt: '2024-03-20',
    taxId: 'GST123456789',
    registrationNumber: 'REG-2024-001',
  },
  {
    id: 'shop2',
    name: 'Fashion Store',
    category: 'Fashion',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100',
    description: 'Trendy fashion and accessories',
    ownerName: 'Priya Sharma',
    ownerEmail: 'priya@fashionstore.com',
    ownerPhone: '+91 98765 43211',
    address: {
      street: '456 Fashion Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
    },
    status: 'active',
    commissionRate: 6.0,
    paymentTerms: 'Monthly payout on 5th',
    contractStartDate: '2024-02-01',
    totalRedemptions: 98,
    totalValue: 245000,
    productsCount: 32,
    createdAt: '2024-01-25',
    updatedAt: '2024-03-18',
    taxId: 'GST987654321',
    registrationNumber: 'REG-2024-002',
  },
  {
    id: 'shop3',
    name: 'Home Essentials',
    category: 'Home',
    logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100',
    description: 'Home and kitchen products',
    ownerName: 'Amit Patel',
    ownerEmail: 'amit@homeessentials.com',
    ownerPhone: '+91 98765 43212',
    address: {
      street: '789 Home Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    },
    status: 'pending',
    commissionRate: 5.0,
    paymentTerms: 'Monthly payout on 1st',
    contractStartDate: '2024-03-15',
    totalRedemptions: 0,
    totalValue: 0,
    productsCount: 28,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-15',
    taxId: 'GST456789123',
    registrationNumber: 'REG-2024-003',
  },
  {
    id: 'shop4',
    name: 'Sports Zone',
    category: 'Sports',
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
    description: 'Sports and fitness equipment',
    ownerName: 'Sneha Reddy',
    ownerEmail: 'sneha@sportszone.com',
    ownerPhone: '+91 98765 43213',
    address: {
      street: '321 Sports Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      country: 'India',
    },
    status: 'suspended',
    commissionRate: 4.5,
    paymentTerms: 'Monthly payout on 1st',
    contractStartDate: '2023-12-01',
    contractEndDate: '2024-03-01',
    totalRedemptions: 67,
    totalValue: 167500,
    productsCount: 22,
    createdAt: '2023-11-25',
    updatedAt: '2024-03-01',
    taxId: 'GST789123456',
    registrationNumber: 'REG-2023-045',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-success text-white">Active</Badge>;
    case 'pending':
      return <Badge variant="default">Pending</Badge>;
    case 'suspended':
      return <Badge variant="destructive">Suspended</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const ShopList = () => {
  const [shops, setShops] = useState<PartnerShopExtended[]>(mockShops);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<PartnerShopExtended | null>(null);
  const [viewingShop, setViewingShop] = useState<PartnerShopExtended | null>(null);

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shop.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || shop.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this shop?')) {
      setShops(shops.filter((s) => s.id !== id));
    }
  };

  const handleApprove = (id: string) => {
    setShops(shops.map((s) => (s.id === id ? { ...s, status: 'active' as const } : s)));
  };

  const handleSuspend = (id: string) => {
    setShops(shops.map((s) => (s.id === id ? { ...s, status: 'suspended' as const } : s)));
  };

  const handleView = (shop: PartnerShopExtended) => {
    setViewingShop(shop);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (shop: PartnerShopExtended) => {
    setEditingShop(shop);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingShop(null);
    setIsDialogOpen(true);
  };

  const activeShops = shops.filter((s) => s.status === 'active').length;
  const pendingShops = shops.filter((s) => s.status === 'pending').length;
  const totalRedemptions = shops.reduce((sum, s) => sum + s.totalRedemptions, 0);
  const totalValue = shops.reduce((sum, s) => sum + s.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shop List</h1>
          <p className="text-muted-foreground mt-1">Manage partner shops and their details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingShop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
                <DialogDescription>
                  {editingShop ? 'Update shop details and information' : 'Register a new partner shop'}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="owner">Owner Details</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="commission">Commission</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Shop Name *</Label>
                      <Input placeholder="Electronics Hub" defaultValue={editingShop?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select defaultValue={editingShop?.category || 'Electronics'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Fashion">Fashion</SelectItem>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select defaultValue={editingShop?.status || 'pending'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo URL</Label>
                      <Input placeholder="https://..." defaultValue={editingShop?.logo} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Shop description..."
                      defaultValue={editingShop?.description}
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tax ID (GST)</Label>
                      <Input placeholder="GST123456789" defaultValue={editingShop?.taxId} />
                    </div>
                    <div className="space-y-2">
                      <Label>Registration Number</Label>
                      <Input placeholder="REG-2024-001" defaultValue={editingShop?.registrationNumber} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="owner" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Owner Name *</Label>
                      <Input placeholder="Rajesh Kumar" defaultValue={editingShop?.ownerName} />
                    </div>
                    <div className="space-y-2">
                      <Label>Owner Email *</Label>
                      <Input type="email" placeholder="owner@shop.com" defaultValue={editingShop?.ownerEmail} />
                    </div>
                    <div className="space-y-2">
                      <Label>Owner Phone *</Label>
                      <Input type="tel" placeholder="+91 98765 43210" defaultValue={editingShop?.ownerPhone} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="address" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Street Address *</Label>
                    <Input placeholder="123 Main Street" defaultValue={editingShop?.address?.street} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input placeholder="Mumbai" defaultValue={editingShop?.address?.city} />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Input placeholder="Maharashtra" defaultValue={editingShop?.address?.state} />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode *</Label>
                      <Input placeholder="400001" defaultValue={editingShop?.address?.pincode} />
                    </div>
                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Input placeholder="India" defaultValue={editingShop?.address?.country} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="commission" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Commission Rate (%) *</Label>
                      <Input type="number" placeholder="5.5" step="0.1" defaultValue={editingShop?.commissionRate} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Terms</Label>
                      <Input placeholder="Monthly payout on 1st" defaultValue={editingShop?.paymentTerms} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contract Start Date *</Label>
                      <Input type="date" defaultValue={editingShop?.contractStartDate} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contract End Date (Optional)</Label>
                      <Input type="date" defaultValue={editingShop?.contractEndDate} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {editingShop ? 'Update' : 'Create'} Shop
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
                  <p className="text-sm font-medium text-muted-foreground">Total Shops</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{shops.length}</p>
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
                  <p className="text-3xl font-bold text-success mt-1">{activeShops}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-3xl font-bold text-warning mt-1">{pendingShops}</p>
                </div>
                <XCircle className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Redemptions</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalRedemptions}</p>
                </div>
                <Store className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Shops Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Partner Shops</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search shops..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
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
                <TableHead>Shop Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Redemptions</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {shop.logo && (
                        <img src={shop.logo} alt={shop.name} className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.ownerName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{shop.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{shop.address.city}, {shop.address.state}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{shop.ownerName}</p>
                      <p className="text-xs text-muted-foreground">{shop.ownerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(shop.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{shop.productsCount}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{shop.totalRedemptions}</p>
                      <p className="text-xs text-muted-foreground">₹{(shop.totalValue / 1000).toFixed(1)}K</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{shop.commissionRate}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(shop)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(shop)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {shop.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(shop.id)}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {shop.status === 'active' && (
                        <Button variant="ghost" size="sm" onClick={() => handleSuspend(shop.id)}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(shop.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Shop Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shop Details</DialogTitle>
            <DialogDescription>Complete information about {viewingShop?.name}</DialogDescription>
          </DialogHeader>
          {viewingShop && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {viewingShop.logo && (
                  <img src={viewingShop.logo} alt={viewingShop.name} className="h-20 w-20 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">{viewingShop.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{viewingShop.category}</Badge>
                    {getStatusBadge(viewingShop.status)}
                  </div>
                  {viewingShop.description && (
                    <p className="text-sm text-muted-foreground mt-2">{viewingShop.description}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Owner Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Owner Name</Label>
                      <p className="font-medium">{viewingShop.ownerName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{viewingShop.ownerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{viewingShop.ownerPhone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="text-sm">
                        <p>{viewingShop.address.street}</p>
                        <p>{viewingShop.address.city}, {viewingShop.address.state}</p>
                        <p>{viewingShop.address.pincode}, {viewingShop.address.country}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {viewingShop.taxId && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Tax ID (GST)</Label>
                        <p className="font-medium">{viewingShop.taxId}</p>
                      </div>
                    )}
                    {viewingShop.registrationNumber && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Registration Number</Label>
                        <p className="font-medium">{viewingShop.registrationNumber}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Commission & Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Commission Rate</Label>
                      <p className="font-medium">{viewingShop.commissionRate}%</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Payment Terms</Label>
                      <p className="font-medium">{viewingShop.paymentTerms}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Redemptions</Label>
                      <p className="font-medium">{viewingShop.totalRedemptions}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Value</Label>
                      <p className="font-medium">₹{viewingShop.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Products Count</Label>
                      <p className="font-medium">{viewingShop.productsCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Contract Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Contract Start Date</Label>
                      <p className="font-medium">{viewingShop.contractStartDate}</p>
                    </div>
                    {viewingShop.contractEndDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Contract End Date</Label>
                        <p className="font-medium">{viewingShop.contractEndDate}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Created At</Label>
                      <p className="font-medium">{viewingShop.createdAt}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Last Updated</Label>
                      <p className="font-medium">{viewingShop.updatedAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                handleEdit(viewingShop!);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

