import { motion } from 'framer-motion';
import { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, Check, X, Star, Upload, Download, Filter } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShopProductMapping } from '../types/partnerShops';
import { RedemptionProduct } from '@/app/slices/redemptionSlice';

// Mock products catalog
const mockProducts: RedemptionProduct[] = [
  {
    id: 'p1',
    shopId: '',
    shopName: '',
    name: 'Wireless Earbuds',
    description: 'Premium quality wireless earbuds with noise cancellation',
    points: 1500,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200',
    category: 'Electronics',
    available: true,
  },
  {
    id: 'p2',
    shopId: '',
    shopName: '',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking',
    points: 3000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
    category: 'Electronics',
    available: true,
  },
  {
    id: 'p3',
    shopId: '',
    shopName: '',
    name: 'Designer T-Shirt',
    description: 'Premium cotton t-shirt with modern design',
    points: 800,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    category: 'Fashion',
    available: true,
  },
  {
    id: 'p4',
    shopId: '',
    shopName: '',
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with RFID protection',
    points: 1200,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
    category: 'Fashion',
    available: true,
  },
  {
    id: 'p5',
    shopId: '',
    shopName: '',
    name: 'Coffee Maker',
    description: 'Automatic coffee maker with programmable settings',
    points: 2500,
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=200',
    category: 'Home',
    available: true,
  },
  {
    id: 'p6',
    shopId: '',
    shopName: '',
    name: 'Yoga Mat',
    description: 'Premium yoga mat with non-slip surface',
    points: 1000,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200',
    category: 'Sports',
    available: true,
  },
];

// Mock shop-product mappings
const mockMappings: ShopProductMapping[] = [
  {
    id: 'm1',
    shopId: 'shop1',
    shopName: 'Electronics Hub',
    productId: 'p1',
    productName: 'Wireless Earbuds',
    productDescription: 'Premium quality wireless earbuds with noise cancellation',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200',
    productCategory: 'Electronics',
    points: 1500,
    available: true,
    priority: 1,
    featured: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
  },
  {
    id: 'm2',
    shopId: 'shop1',
    shopName: 'Electronics Hub',
    productId: 'p2',
    productName: 'Smart Watch',
    productDescription: 'Feature-rich smartwatch with health tracking',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
    productCategory: 'Electronics',
    points: 3000,
    available: true,
    priority: 2,
    featured: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
  },
  {
    id: 'm3',
    shopId: 'shop2',
    shopName: 'Fashion Store',
    productId: 'p3',
    productName: 'Designer T-Shirt',
    productDescription: 'Premium cotton t-shirt with modern design',
    productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200',
    productCategory: 'Fashion',
    points: 800,
    available: true,
    priority: 1,
    featured: true,
    createdAt: '2024-02-01',
    updatedAt: '2024-03-18',
  },
];

const mockShops = [
  { id: 'shop1', name: 'Electronics Hub' },
  { id: 'shop2', name: 'Fashion Store' },
  { id: 'shop3', name: 'Home Essentials' },
  { id: 'shop4', name: 'Sports Zone' },
];

export const ProductMapping = () => {
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [mappings, setMappings] = useState<ShopProductMapping[]>(mockMappings);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ShopProductMapping | null>(null);

  const filteredMappings = mappings.filter((mapping) => {
    const matchesShop = selectedShop === 'all' || mapping.shopId === selectedShop;
    const matchesSearch =
      mapping.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || mapping.productCategory === categoryFilter;
    return matchesShop && matchesSearch && matchesCategory;
  });

  const availableProducts = mockProducts.filter(
    (product) => !mappings.some((m) => m.productId === product.id && m.shopId === selectedShop && selectedShop !== 'all')
  );

  const handleAddMapping = (product: RedemptionProduct) => {
    if (selectedShop === 'all') {
      alert('Please select a shop first');
      return;
    }
    const newMapping: ShopProductMapping = {
      id: `m-${Date.now()}`,
      shopId: selectedShop,
      shopName: mockShops.find((s) => s.id === selectedShop)?.name || '',
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      productImage: product.image,
      productCategory: product.category,
      points: product.points,
      available: true,
      priority: mappings.filter((m) => m.shopId === selectedShop).length + 1,
      featured: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setMappings([...mappings, newMapping]);
  };

  const handleRemoveMapping = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the shop?')) {
      setMappings(mappings.filter((m) => m.id !== id));
    }
  };

  const handleEditMapping = (mapping: ShopProductMapping) => {
    setEditingMapping(mapping);
    setIsMappingDialogOpen(true);
  };

  const handleToggleAvailability = (id: string) => {
    setMappings(mappings.map((m) => (m.id === id ? { ...m, available: !m.available } : m)));
  };

  const handleToggleFeatured = (id: string) => {
    setMappings(mappings.map((m) => (m.id === id ? { ...m, featured: !m.featured } : m)));
  };

  const selectedShopMappings = mappings.filter((m) => m.shopId === selectedShop);
  const categories = ['All', ...Array.from(new Set(mockProducts.map((p) => p.category)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Mapping</h1>
          <p className="text-muted-foreground mt-1">Map products to partner shops and manage availability</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{mockProducts.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Mappings</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{mappings.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Shops</p>
                  <p className="text-3xl font-bold text-success mt-1">{mockShops.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Featured Products</p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    {mappings.filter((m) => m.featured).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Shop Selector and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Select Shop</Label>
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger>
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
            <div className="flex-1">
              <Label>Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase() === 'all' ? 'all' : cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout: Available Products + Mappings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Products */}
        <Card>
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedShop === 'all' ? 'Select a shop to add products' : `Add products to ${mockShops.find((s) => s.id === selectedShop)?.name}`}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {selectedShop === 'all' ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Please select a shop to view available products</p>
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>All products are already mapped to this shop</p>
                </div>
              ) : (
                availableProducts
                  .filter((p) => {
                    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      {product.image && (
                        <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{product.category}</Badge>
                          <span className="text-sm font-medium text-primary">{product.points} points</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddMapping(product)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </motion.div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mapped Products */}
        <Card>
          <CardHeader>
            <CardTitle>
              Mapped Products
              {selectedShop !== 'all' && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({selectedShopMappings.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredMappings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products mapped yet</p>
                </div>
              ) : (
                filteredMappings.map((mapping) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    {mapping.productImage && (
                      <img
                        src={mapping.productImage}
                        alt={mapping.productName}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{mapping.productName}</p>
                        {mapping.featured && <Star className="h-4 w-4 text-warning fill-warning" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{mapping.shopName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{mapping.productCategory}</Badge>
                        <span className="text-sm font-medium text-primary">{mapping.points} points</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditMapping(mapping)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveMapping(mapping.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Product Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {mapping.productImage && (
                        <img
                          src={mapping.productImage}
                          alt={mapping.productName}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{mapping.productName}</p>
                        <p className="text-xs text-muted-foreground">{mapping.productCategory}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{mapping.shopName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-primary">{mapping.points}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{mapping.priority}</span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={mapping.available}
                      onCheckedChange={() => handleToggleAvailability(mapping.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(mapping.id)}
                    >
                      <Star
                        className={`h-4 w-4 ${mapping.featured ? 'text-warning fill-warning' : 'text-muted-foreground'}`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditMapping(mapping)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveMapping(mapping.id)}>
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

      {/* Edit Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product Mapping</DialogTitle>
            <DialogDescription>Update product details for this shop</DialogDescription>
          </DialogHeader>
          {editingMapping && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={editingMapping.productName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input value={editingMapping.shopName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  value={editingMapping.points}
                  onChange={(e) =>
                    setEditingMapping({ ...editingMapping, points: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Priority (Display Order)</Label>
                <Input
                  type="number"
                  value={editingMapping.priority}
                  onChange={(e) =>
                    setEditingMapping({ ...editingMapping, priority: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Available</Label>
                <Switch
                  checked={editingMapping.available}
                  onCheckedChange={(checked) =>
                    setEditingMapping({ ...editingMapping, available: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Featured</Label>
                <Switch
                  checked={editingMapping.featured}
                  onCheckedChange={(checked) =>
                    setEditingMapping({ ...editingMapping, featured: checked })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMappingDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingMapping) {
                  setMappings(
                    mappings.map((m) => (m.id === editingMapping.id ? editingMapping : m))
                  );
                }
                setIsMappingDialogOpen(false);
              }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

