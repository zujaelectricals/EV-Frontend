import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon, Plus, Search, Eye, Edit, Trash2, X, Loader2 } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetGalleryItemsQuery,
  useGetGalleryItemByIdQuery,
  useCreateGalleryItemMutation,
  useUpdateGalleryItemMutation,
  useDeleteGalleryItemMutation,
  type GalleryItem,
  type CreateGalleryItemRequest,
  type UpdateGalleryItemRequest,
} from '@/app/api/galleryApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { getApiBaseUrl } from '@/lib/config';

export const Gallery = () => {
  const { data: galleryResponse, isLoading, error, refetch } = useGetGalleryItemsQuery();

  // Ensure galleryItems is always an array
  const galleryItems: GalleryItem[] = useMemo(() => {
    if (!galleryResponse) {
      console.log('📥 [Gallery] No response data yet');
      return [];
    }
    
    // Log the response for debugging
    console.log('📥 [Gallery] API Response:', galleryResponse);
    console.log('📥 [Gallery] Response type:', typeof galleryResponse);
    console.log('📥 [Gallery] Is array:', Array.isArray(galleryResponse));
    
    // Handle if response is already an array
    if (Array.isArray(galleryResponse)) {
      console.log('📥 [Gallery] Using direct array, count:', galleryResponse.length);
      return galleryResponse;
    }
    
    // Handle if response is an object with results property (paginated response)
    if (typeof galleryResponse === 'object' && galleryResponse !== null && 'results' in galleryResponse) {
      const results = (galleryResponse as any).results;
      if (Array.isArray(results)) {
        console.log('📥 [Gallery] Using results array, count:', results.length);
        return results;
      }
    }
    
    // Fallback to empty array
    console.warn('⚠️ [Gallery] Unexpected API response format:', galleryResponse);
    return [];
  }, [galleryResponse]);

  // View dialog state
  const [viewingItemId, setViewingItemId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { data: viewingItem, isLoading: isLoadingViewItem } = useGetGalleryItemByIdQuery(
    viewingItemId!,
    { skip: !viewingItemId }
  );

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateGalleryItemRequest>({
    title: '',
    image: null as any,
    caption: '',
    level: '',
    order: 0,
    status: true,
  });
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
  const [createImage, setCreateImage] = useState<File | null>(null);

  // Edit dialog state
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateGalleryItemRequest>({
    title: '',
    image: '',
    caption: '',
    level: '',
    order: 0,
    status: true,
  });
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImage, setEditImage] = useState<File | null>(null);

  // Delete dialog state
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // API mutations
  const [createGalleryItem, { isLoading: isCreating }] = useCreateGalleryItemMutation();
  const [updateGalleryItem, { isLoading: isUpdating }] = useUpdateGalleryItemMutation();
  const [deleteGalleryItem, { isLoading: isDeleting }] = useDeleteGalleryItemMutation();

  // Filter gallery items based on search
  const filteredItems = galleryItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.caption?.toLowerCase().includes(query) ||
      item.level.toLowerCase().includes(query) ||
      item.created_by_username.toLowerCase().includes(query)
    );
  });

  // Handle view
  const handleView = (id: number) => {
    setViewingItemId(id);
    setIsViewDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (item: GalleryItem) => {
    setEditingItemId(item.id);
    // Use the full image URL for the form
    const fullImageUrl = getImageUrl(item.image_url);
    
    // Validate the image URL before setting it
    if (!fullImageUrl || fullImageUrl.trim() === '' || fullImageUrl.endsWith('/api/') || fullImageUrl.endsWith('/api')) {
      console.error('❌ [Gallery] Invalid image URL for item:', item.id, 'URL:', fullImageUrl);
      toast.error('Invalid image URL. Please select a new image file.');
      return;
    }
    
    console.log('✏️ [Gallery] Editing item:', {
      id: item.id,
      title: item.title,
      originalImageUrl: item.image_url,
      fullImageUrl: fullImageUrl,
    });
    
    setEditFormData({
      title: item.title,
      image: fullImageUrl, // Use full URL for fetching
      caption: item.caption || '',
      level: item.level,
      order: item.order,
      status: item.status,
    });
    setEditImagePreview(fullImageUrl);
    setEditImage(null);
    setIsEditDialogOpen(true);
  };

  // Handle create
  const handleCreate = () => {
    setCreateFormData({
      title: '',
      image: null as any,
      caption: '',
      level: '',
      order: 0,
      status: true,
    });
    setCreateImagePreview(null);
    setCreateImage(null);
    setIsCreateDialogOpen(true);
  };

  // Handle create image change
  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCreateImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCreateImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit image change
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle create submit
  const handleCreateSubmit = async () => {
    if (!createImage) {
      toast.error('Please select an image');
      return;
    }
    if (!createFormData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!createFormData.level.trim()) {
      toast.error('Please enter a level');
      return;
    }

    try {
      await createGalleryItem({
        title: createFormData.title,
        image: createImage,
        caption: createFormData.caption || undefined,
        level: createFormData.level,
        order: createFormData.order || undefined,
        status: createFormData.status,
      }).unwrap();
      toast.success('Gallery item created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create gallery item');
    }
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!editFormData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!editFormData.level.trim()) {
      toast.error('Please enter a level');
      return;
    }

    // Validate image
    if (!editImage && (!editFormData.image || typeof editFormData.image !== 'string' || !editFormData.image.trim())) {
      toast.error('Please select an image file');
      return;
    }

    try {
      // If a new image was selected, use it; otherwise use the existing image URL
      // IMPORTANT: Always prefer the File if available, as it doesn't require fetching
      let imageToSend: File | string;
      
      if (editImage) {
        // New image file selected - use it directly
        imageToSend = editImage;
        console.log('🔄 [Gallery Component] Using new image file:', {
          name: editImage.name,
          size: editImage.size,
          type: editImage.type,
        });
      } else if (editFormData.image && typeof editFormData.image === 'string' && editFormData.image.trim()) {
        // No new image, use existing image URL
        imageToSend = editFormData.image;
        console.log('🔄 [Gallery Component] Using existing image URL:', editFormData.image);
      } else {
        // This shouldn't happen due to validation above, but handle it
        toast.error('Please select an image file');
        return;
      }
      
      console.log('🔄 [Gallery Component] Starting update operation');
      console.log('🔄 [Gallery Component] Editing item ID:', editingItemId);
      console.log('🔄 [Gallery Component] Image to send:', {
        type: imageToSend instanceof File ? 'File' : 'URL',
        value: imageToSend instanceof File 
          ? `[File: ${imageToSend.name}, ${imageToSend.size} bytes, ${imageToSend.type}]`
          : imageToSend,
      });
      console.log('🔄 [Gallery Component] Update payload:', {
        id: editingItemId,
        title: editFormData.title,
        caption: editFormData.caption,
        level: editFormData.level,
        order: editFormData.order,
        status: editFormData.status,
      });
      
      await updateGalleryItem({
        id: editingItemId!,
        data: {
          title: editFormData.title,
          image: imageToSend,
          caption: editFormData.caption || undefined,
          level: editFormData.level,
          order: editFormData.order || undefined,
          status: editFormData.status,
        },
      }).unwrap();
      
      console.log('✅ [Gallery Component] Update successful');
      toast.success('Gallery item updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('❌ [Gallery] Update error:', error);
      const errorMessage = error?.data?.message || error?.error || error?.message || 'Failed to update gallery item';
      toast.error(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setDeletingItemId(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingItemId) return;

    try {
      await deleteGalleryItem(deletingItemId).unwrap();
      toast.success('Gallery item deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingItemId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete gallery item');
    }
  };

  // Get image URL helper
  const getImageUrl = (imagePath: string) => {
    // Validate input
    if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
      console.warn('⚠️ [Gallery] Invalid image path provided:', imagePath);
      return '/placeholder.svg'; // Return placeholder for invalid paths
    }
    
    const trimmedPath = imagePath.trim();
    
    // If it's already a full URL, return as-is
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
      return trimmedPath;
    }
    
    // Construct full URL from relative path
    const baseUrl = getApiBaseUrl().replace('/api/', '');
    
    // Ensure path starts with / if it doesn't already
    const normalizedPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
    
    // Validate the constructed URL doesn't point to base API
    const fullUrl = `${baseUrl}${normalizedPath}`;
    if (fullUrl.endsWith('/api/') || fullUrl.endsWith('/api')) {
      console.error('❌ [Gallery] Constructed URL points to base API:', fullUrl);
      return '/placeholder.svg';
    }
    
    return fullUrl;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardContent className="text-center">
            <p className="text-destructive mb-2">Failed to load gallery items</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage company member images and documents
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Gallery Item
        </Button>
      </motion.div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, caption, level, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No gallery items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Caption</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.title}
                          className="h-16 w-16 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.caption || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.level_display || item.level}</Badge>
                      </TableCell>
                      <TableCell>{item.order}</TableCell>
                      <TableCell>
                        {item.status ? (
                          <Badge className="bg-success text-white">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.created_by_username}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(item.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gallery Item Details</DialogTitle>
            <DialogDescription>View complete details of the gallery item</DialogDescription>
          </DialogHeader>
          {isLoadingViewItem ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : viewingItem ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={getImageUrl(viewingItem.image_url)}
                  alt={viewingItem.title}
                  className="max-h-96 w-auto rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="font-medium">{viewingItem.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Level</Label>
                  <p className="font-medium">{viewingItem.level_display || viewingItem.level}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Caption</Label>
                  <p className="font-medium">{viewingItem.caption || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Order</Label>
                  <p className="font-medium">{viewingItem.order}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="font-medium">
                    {viewingItem.status ? (
                      <Badge className="bg-success text-white">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created By</Label>
                  <p className="font-medium">{viewingItem.created_by_username}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="font-medium">
                    {new Date(viewingItem.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated At</Label>
                  <p className="font-medium">
                    {new Date(viewingItem.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load gallery item details</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Gallery Item</DialogTitle>
            <DialogDescription>Add a new gallery item (company member)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-title">Title *</Label>
              <Input
                id="create-title"
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, title: e.target.value })
                }
                placeholder="John Doe"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="create-image">Image *</Label>
              <Input
                id="create-image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleCreateImageChange}
              />
              {createImagePreview && (
                <div className="mt-2">
                  <img
                    src={createImagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="create-caption">Caption</Label>
              <Textarea
                id="create-caption"
                value={createFormData.caption}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, caption: e.target.value })
                }
                placeholder="CEO and Founder"
              />
            </div>
            <div>
              <Label htmlFor="create-level">Level *</Label>
              <Input
                id="create-level"
                value={createFormData.level}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, level: e.target.value })
                }
                placeholder="executive"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="create-order">Order</Label>
              <Input
                id="create-order"
                type="number"
                value={createFormData.order}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, order: parseInt(e.target.value) || 0 })
                }
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="create-status">Status</Label>
              <Select
                value={createFormData.status ? 'true' : 'false'}
                onValueChange={(value) =>
                  setCreateFormData({ ...createFormData, status: value === 'true' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Gallery Item</DialogTitle>
            <DialogDescription>Update gallery item details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                placeholder="John Doe"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Image * (can be same or new image)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleEditImageChange}
              />
              {editImagePreview && (
                <div className="mt-2">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="edit-caption">Caption</Label>
              <Textarea
                id="edit-caption"
                value={editFormData.caption}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, caption: e.target.value })
                }
                placeholder="CEO and Founder"
              />
            </div>
            <div>
              <Label htmlFor="edit-level">Level *</Label>
              <Input
                id="edit-level"
                value={editFormData.level}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, level: e.target.value })
                }
                placeholder="executive"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-order">Order</Label>
              <Input
                id="edit-order"
                type="number"
                value={editFormData.order}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, order: parseInt(e.target.value) || 0 })
                }
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editFormData.status ? 'true' : 'false'}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value === 'true' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the gallery item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingItemId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

