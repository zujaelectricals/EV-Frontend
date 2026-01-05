import { motion } from 'framer-motion';
import { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, Download, Upload, Filter, Eye, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { InventoryModel } from '../types/inventory';
import { scooters } from '@/store/data/scooters';
import { Scooter } from '@/store/ScooterCard';

const mockModels: InventoryModel[] = scooters.map((scooter, index) => ({
  id: scooter.id,
  sku: `EV-${scooter.id.toUpperCase()}-001`,
  name: scooter.name,
  brand: scooter.brand,
  category: scooter.category || 'scooter',
  specifications: scooter,
  basePrice: scooter.price,
  status: scooter.isComingSoon ? 'coming_soon' : 'active',
  images: [scooter.image],
  createdAt: '2024-01-15',
  updatedAt: '2024-03-20',
  description: scooter.description,
  variants: scooter.colors.map((color, i) => ({
    id: `${scooter.id}-variant-${i}`,
    name: `Color Variant ${i + 1}`,
    color,
    priceAdjustment: 0,
    sku: `${scooter.id.toUpperCase()}-COL-${i + 1}`,
  })),
}));

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-success text-white">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'coming_soon':
      return <Badge variant="default">Coming Soon</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const Models = () => {
  const [models, setModels] = useState<InventoryModel[]>(mockModels);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<InventoryModel | null>(null);
  const [viewingModel, setViewingModel] = useState<InventoryModel | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editImages, setEditImages] = useState<string[]>([]);

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || model.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || model.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      setModels(models.filter((m) => m.id !== id));
    }
  };

  const handleView = (model: InventoryModel) => {
    setViewingModel(model);
    setCurrentImageIndex(0);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (model: InventoryModel) => {
    setEditingModel(model);
    setEditImages([...model.images]);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingModel(null);
    setEditImages([]);
    setIsDialogOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newImages.push(reader.result as string);
            if (newImages.length === files.length) {
              setEditImages([...editImages, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  const handleReplaceImage = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const newImages = [...editImages];
          newImages[index] = reader.result as string;
          setEditImages(newImages);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const nextImage = () => {
    if (viewingModel) {
      setCurrentImageIndex((prev) => (prev + 1) % viewingModel.images.length);
    }
  };

  const prevImage = () => {
    if (viewingModel) {
      setCurrentImageIndex((prev) => (prev - 1 + viewingModel.images.length) % viewingModel.images.length);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Models</h1>
          <p className="text-muted-foreground mt-1">Manage EV product catalog and specifications</p>
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
                Add Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
                <DialogDescription>
                  {editingModel ? 'Update model details and specifications' : 'Create a new EV model in the catalog'}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Model Name *</Label>
                      <Input placeholder="EVOLVE" defaultValue={editingModel?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label>SKU *</Label>
                      <Input placeholder="EV-EVOLVE-001" defaultValue={editingModel?.sku} />
                    </div>
                    <div className="space-y-2">
                      <Label>Brand *</Label>
                      <Input placeholder="Zuja Electric" defaultValue={editingModel?.brand} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select defaultValue={editingModel?.category || 'scooter'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scooter">Scooter</SelectItem>
                          <SelectItem value="loader">Loader</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select defaultValue={editingModel?.status || 'active'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="coming_soon">Coming Soon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Base Price (₹) *</Label>
                      <Input type="number" placeholder="85000" defaultValue={editingModel?.basePrice} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Model description..."
                      defaultValue={editingModel?.description}
                      rows={4}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="specifications" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Range (km)</Label>
                      <Input type="number" placeholder="90" />
                    </div>
                    <div className="space-y-2">
                      <Label>Top Speed (km/h)</Label>
                      <Input type="number" placeholder="25" />
                    </div>
                    <div className="space-y-2">
                      <Label>Battery Capacity</Label>
                      <Input placeholder="32AH" />
                    </div>
                    <div className="space-y-2">
                      <Label>Battery Voltage</Label>
                      <Input placeholder="60V × 32AH" />
                    </div>
                    <div className="space-y-2">
                      <Label>Power</Label>
                      <Input placeholder="1000W" />
                    </div>
                    <div className="space-y-2">
                      <Label>Motor Type</Label>
                      <Input placeholder="Brushless DC" />
                    </div>
                    <div className="space-y-2">
                      <Label>Charging Time</Label>
                      <Input placeholder="4-5h" />
                    </div>
                    <div className="space-y-2">
                      <Label>Brake Type</Label>
                      <Input placeholder="Front Disc - Rear Drum" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Base Price (₹)</Label>
                      <Input type="number" placeholder="85000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Original Price (₹)</Label>
                      <Input type="number" placeholder="95000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input type="number" placeholder="10.5" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Product Images</Label>
                        <p className="text-sm text-muted-foreground">
                          Upload, replace, or remove product images. First image will be used as the primary image.
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="image-upload"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add Images
                        </Button>
                      </div>
                    </div>

                    {editImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {editImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-secondary">
                              <img
                                src={image}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <input
                                type="file"
                                id={`replace-image-${index}`}
                                accept="image/*"
                                onChange={(e) => handleReplaceImage(index, e)}
                                className="hidden"
                              />
                              <Button
                                variant="secondary"
                                size="sm"
                                type="button"
                                onClick={() => document.getElementById(`replace-image-${index}`)?.click()}
                              >
                                <ImageIcon className="h-4 w-4 mr-1" />
                                Replace
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {index === 0 && (
                              <Badge className="absolute top-2 left-2">Primary</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-12 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">No images uploaded</p>
                        <input
                          type="file"
                          id="image-upload-empty"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => document.getElementById('image-upload-empty')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Images
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="variants" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Color Variants</Label>
                    <p className="text-sm text-muted-foreground">
                      Add color variants with price adjustments
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  {editingModel ? 'Update' : 'Create'} Model
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Model Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Model Details</DialogTitle>
                <DialogDescription>
                  Complete information about {viewingModel?.name}
                </DialogDescription>
              </DialogHeader>
              {viewingModel && (
                <div className="space-y-6">
                  {/* Image Gallery */}
                  {viewingModel.images.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                          <img
                            src={viewingModel.images[currentImageIndex]}
                            alt={`${viewingModel.name} - Image ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {viewingModel.images.length > 1 && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                              <Badge variant="secondary">
                                {currentImageIndex + 1} / {viewingModel.images.length}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                      {viewingModel.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {viewingModel.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                index === currentImageIndex
                                  ? 'border-primary ring-2 ring-primary'
                                  : 'border-secondary hover:border-primary/50'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">SKU</Label>
                          <p className="font-medium">{viewingModel.sku}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Model Name</Label>
                          <p className="font-medium">{viewingModel.name}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Brand</Label>
                          <p className="font-medium">{viewingModel.brand}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Category</Label>
                          <div className="mt-1">
                            <Badge variant="outline" className="capitalize">
                              {viewingModel.category}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div className="mt-1">{getStatusBadge(viewingModel.status)}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Base Price</Label>
                          <p className="font-bold text-lg">₹{viewingModel.basePrice.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Range</Label>
                            <p className="font-medium">{viewingModel.specifications.range} km</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Top Speed</Label>
                            <p className="font-medium">{viewingModel.specifications.topSpeed} km/h</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Battery Capacity</Label>
                            <p className="font-medium">{viewingModel.specifications.batteryCapacity}</p>
                          </div>
                          {viewingModel.specifications.batteryVoltage && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Battery Voltage</Label>
                              <p className="font-medium">{viewingModel.specifications.batteryVoltage}</p>
                            </div>
                          )}
                          {viewingModel.specifications.power && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Power</Label>
                              <p className="font-medium">{viewingModel.specifications.power}</p>
                            </div>
                          )}
                          {viewingModel.specifications.motorType && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Motor Type</Label>
                              <p className="font-medium">{viewingModel.specifications.motorType}</p>
                            </div>
                          )}
                          {viewingModel.specifications.chargingTime && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Charging Time</Label>
                              <p className="font-medium">{viewingModel.specifications.chargingTime}</p>
                            </div>
                          )}
                          {viewingModel.specifications.brakeType && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Brake Type</Label>
                              <p className="font-medium">{viewingModel.specifications.brakeType}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description */}
                  {viewingModel.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{viewingModel.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Variants */}
                  {viewingModel.variants && viewingModel.variants.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Color Variants ({viewingModel.variants.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          {viewingModel.variants.map((variant) => (
                            <div key={variant.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">{variant.name}</p>
                                {variant.color && (
                                  <div
                                    className="w-6 h-6 rounded-full border-2 border-secondary"
                                    style={{ backgroundColor: variant.color }}
                                  />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                              {variant.priceAdjustment !== 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Price Adjustment: ₹{variant.priceAdjustment.toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metadata */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Created At</Label>
                          <p className="font-medium">{viewingModel.createdAt}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Last Updated</Label>
                          <p className="font-medium">{viewingModel.updatedAt}</p>
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
                    handleEdit(viewingModel!);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Model
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
                  <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{models.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                  <p className="text-3xl font-bold text-success mt-1">
                    {models.filter((m) => m.status === 'active').length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {new Set(models.map((m) => m.category)).size}
                  </p>
                </div>
                <Package className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    {models.filter((m) => m.status === 'coming_soon').length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Models Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Catalog</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="scooter">Scooter</SelectItem>
                  <SelectItem value="loader">Loader</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
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
                <TableHead>SKU</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{model.sku}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.specifications.range} km range</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{model.brand}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {model.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{model.basePrice.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(model.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{model.variants?.length || 0} variants</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(model)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(model)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(model.id)}>
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
    </div>
  );
};

