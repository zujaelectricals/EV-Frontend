import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Search, Edit, Trash2, Download, Upload, Filter, Eye, X, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
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
import { 
  useGetVehiclesQuery, 
  useLazyGetVehicleByIdQuery,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useUploadImagesMutation,
  useCreateVehicleMutation,
  VehicleGroup,
  VehicleDetailResponse,
  InventoryQueryParams,
  UpdateVehicleRequest,
  CreateVehicleRequest
} from '@/app/api/inventoryApi';
import { toast } from 'sonner';

// Transform API VehicleGroup to InventoryModel
const transformVehicleGroupToModel = (vehicleGroup: VehicleGroup, index: number): InventoryModel => {
  // Get the first variant for primary data
  const firstVariant = vehicleGroup.variants[0];
  const primaryImage = firstVariant?.primary_image_url || firstVariant?.images[0]?.image_url || '';
  
  // Extract max speed from specifications
  const maxSpeedStr = vehicleGroup.specifications['Max Speed'] || vehicleGroup.specifications['Max Speed (km/h)'] || '';
  const maxSpeed = maxSpeedStr ? parseInt(maxSpeedStr.replace(' km/h', '').trim()) || 0 : 0;
  
  // Try to extract range from name (e.g., "EV Model X1 (90 km range)") or use 0 as default
  // The API doesn't provide range directly, so we'll use 0 and show "N/A" in UI
  const range = 0;
  
  // Determine status based on status_summary
  let status: 'active' | 'inactive' | 'coming_soon' = 'active';
  if (vehicleGroup.status_summary.discontinued && vehicleGroup.status_summary.discontinued > 0) {
    status = 'inactive';
  } else if (vehicleGroup.status_summary.available === 0 && vehicleGroup.status_summary.out_of_stock === 0) {
    status = 'inactive';
  }

  // Create a simple SKU from the first variant's model_code
  const sku = firstVariant?.model_code || `EV-${vehicleGroup.name.toUpperCase().replace(/\s+/g, '-')}-001`;

  // Extract all variant IDs for variant selection operations
  const variantIds = vehicleGroup.variants.map(v => v.id);
  const firstVariantId = firstVariant?.id;

  return {
    id: `model-${index}-${vehicleGroup.name}`,
    sku,
    name: vehicleGroup.name,
    brand: 'Zuja Electric', // Default brand, can be extracted from model_code if needed
    category: 'scooter' as const, // Default category, can be enhanced based on API data
    specifications: {
      id: vehicleGroup.name.toLowerCase().replace(/\s+/g, '-'),
      name: vehicleGroup.name,
      brand: 'Zuja Electric',
      price: vehicleGroup.price_range.min,
      range,
      topSpeed: maxSpeed,
      batteryCapacity: vehicleGroup.battery_capacities_available[0] || '',
      batteryVoltage: vehicleGroup.specifications['Battery'] || '',
      power: vehicleGroup.specifications['Motor Power'] || '',
      motorType: '',
      chargingTime: '',
      brakeType: '',
      image: primaryImage,
      colors: vehicleGroup.colors_available,
      description: vehicleGroup.description,
      isComingSoon: false,
    },
    basePrice: vehicleGroup.price_range.min,
    status,
    images: vehicleGroup.variants
      .flatMap(v => v.images.map(img => img.image_url))
      .filter((url, idx, arr) => arr.indexOf(url) === idx), // Remove duplicates
    createdAt: firstVariant?.created_at || new Date().toISOString(),
    updatedAt: firstVariant?.created_at || new Date().toISOString(),
    description: vehicleGroup.description,
    variants: vehicleGroup.variants.map((variant, vIndex) => ({
      id: `variant-${variant.id}`,
      variantId: variant.id, // Store actual variant ID for API operations
      name: `${vehicleGroup.name} - ${variant.vehicle_color.join(', ')} - ${variant.battery_variant.join(', ')}`,
      color: variant.vehicle_color[0] || '',
      priceAdjustment: parseFloat(variant.price) - vehicleGroup.price_range.min,
      sku: variant.model_code,
      stock: variant.stock_available_quantity,
      batteryVariant: variant.battery_variant,
      price: variant.price,
    })),
    variantIds, // Store all variant IDs for variant selection
    firstVariantId, // Store first variant ID for quick access
  };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-success text-white">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'coming_soon':
      return <Badge variant="default">Coming Soon</Badge>;
    case 'available':
      return <Badge className="bg-success text-white">Available</Badge>;
    case 'out_of_stock':
      return <Badge variant="secondary">Out of Stock</Badge>;
    case 'discontinued':
      return <Badge variant="destructive">Discontinued</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const Models = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState(''); // Only applied when search button is clicked
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<InventoryModel | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editingVehicleDetail, setEditingVehicleDetail] = useState<VehicleDetailResponse | null>(null);
  const [viewingModel, setViewingModel] = useState<InventoryModel | null>(null);
  const [viewingVehicleDetail, setViewingVehicleDetail] = useState<VehicleDetailResponse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteModel, setDeleteModel] = useState<InventoryModel | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Edit variant selection dialog state
  const [isEditVariantDialogOpen, setIsEditVariantDialogOpen] = useState(false);
  const [editVariantModel, setEditVariantModel] = useState<InventoryModel | null>(null);
  const [selectedEditVariantId, setSelectedEditVariantId] = useState<number | null>(null);
  
  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    vehicle_color: [] as string[],
    battery_variant: [] as string[],
    price: 0,
    battery_pricing: {} as Record<string, number>,
    status: 'available' as 'available' | 'out_of_stock' | 'discontinued',
    description: '',
    features: [] as string[],
    specifications: {} as Record<string, string>,
    color_images: {} as Record<string, number[]>,
    image_ids: [] as number[],
    initial_quantity: 0,
  });
  const [featureInput, setFeatureInput] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: number; image_url: string; created_at: string }>>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [vehicleColorInput, setVehicleColorInput] = useState('');
  const [batteryVariantInput, setBatteryVariantInput] = useState('');
  const [isAddingSpecification, setIsAddingSpecification] = useState(false);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [editingSpecKeys, setEditingSpecKeys] = useState<Record<string, string>>({});
  const [colorImageInputs, setColorImageInputs] = useState<Record<string, string>>({});

  // API hooks
  const [getVehicleById, { isLoading: isLoadingVehicleDetail }] = useLazyGetVehicleByIdQuery();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();
  const [uploadImages, { isLoading: isUploadingImages }] = useUploadImagesMutation();
  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();

  // Build API query parameters
  const queryParams = useMemo(() => {
    const params: InventoryQueryParams = {
      page: currentPage,
      page_size: pageSize,
    };
    
    // Only include search if it was applied via button click
    if (appliedSearchQuery) {
      params.search = appliedSearchQuery;
    }
    
    if (statusFilter !== 'all') {
      // Map UI status to API status
      if (statusFilter === 'active') {
        params.status = 'available';
      } else if (statusFilter === 'inactive') {
        params.status = 'discontinued';
      } else if (statusFilter === 'available' || statusFilter === 'out_of_stock' || statusFilter === 'discontinued') {
        params.status = statusFilter;
      }
    }
    
    return params;
  }, [currentPage, pageSize, appliedSearchQuery, statusFilter]);

  // Fetch vehicles from API
  const { data, isLoading, isError, error, refetch } = useGetVehiclesQuery(queryParams);

  // Transform API data to models
  const models = useMemo(() => {
    if (!data?.results) return [];
    return data.results.map((vehicleGroup, index) => transformVehicleGroupToModel(vehicleGroup, index));
  }, [data]);

  // Handle search button click
  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  // Handle search input clear
  const handleSearchClear = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    setCurrentPage(1);
  };

  // Reset to page 1 when status or category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter]);

  const filteredModels = models; // API handles filtering, so we just use the models directly

  const handleDelete = (model: InventoryModel) => {
    setDeleteModel(model);
    setSelectedVariantId(null);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVariantId) {
      toast.error('Please select a variant to delete');
      return;
    }

    try {
      await deleteVehicle(selectedVariantId).unwrap();
      toast.success('Variant deleted successfully');
      setIsDeleteConfirmOpen(false);
      setIsDeleteDialogOpen(false);
      setDeleteModel(null);
      setSelectedVariantId(null);
      refetch(); // Refresh the list
    } catch (error: unknown) {
      console.error('Error deleting variant:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error && 
        error.data && typeof error.data === 'object' && 'message' in error.data &&
        typeof error.data.message === 'string' ? error.data.message : 'Failed to delete variant';
      toast.error(errorMessage);
    }
  };

  // View a specific variant's details
  const handleViewVariant = async (model: InventoryModel, variantId: number) => {
    setViewingModel(model);
    setCurrentImageIndex(0);
    setIsViewDialogOpen(true);
    try {
      const result = await getVehicleById(variantId).unwrap();
      setViewingVehicleDetail(result);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('Failed to load vehicle details');
    }
  };

  // Start editing a specific variant
  const startEditVariant = async (model: InventoryModel, variantId: number) => {
    setEditingModel(model);
    setIsDialogOpen(true);
    setEditingVariantId(variantId);
    try {
      const result = await getVehicleById(variantId).unwrap();
      setEditingVehicleDetail(result);
      // Populate form with fetched data
      setFormData({
        name: result.name,
        vehicle_color: result.vehicle_color,
        battery_variant: result.battery_variant,
        price: parseFloat(result.price),
        battery_pricing: {},
        status: result.status,
        description: result.description,
        features: result.features,
        specifications: result.specifications,
        color_images: {},
        image_ids: result.images.map((img) => img.id),
        initial_quantity: result.stock_total_quantity,
      });
      setFeatureInput('');
      setVehicleColorInput(result.vehicle_color.join(', '));
      setBatteryVariantInput(result.battery_variant.join(', '));
      setIsAddingSpecification(false);
      setNewSpecKey('');
      setNewSpecValue('');
      setEditingSpecKeys({});
      setColorImageInputs({});
    } catch (error) {
      console.error('Error fetching vehicle details for edit:', error);
      toast.error('Failed to load vehicle details for editing');
    }
  };

  // When clicking the edit icon in the table: first choose a variant
  const handleEditClick = (model: InventoryModel) => {
    if (!model.variants || model.variants.length === 0) {
      toast.error('No variants available to edit');
      return;
    }
    setEditVariantModel(model);
    setSelectedEditVariantId(null);
    setIsEditVariantDialogOpen(true);
  };

  const handleEditVariantConfirm = async () => {
    if (!editVariantModel || !selectedEditVariantId) {
      toast.error('Please select a variant to edit');
      return;
    }
    setIsEditVariantDialogOpen(false);
    await startEditVariant(editVariantModel, selectedEditVariantId);
    setEditVariantModel(null);
    setSelectedEditVariantId(null);
  };

  const handleAddNew = () => {
    setEditingModel(null);
    setEditingVariantId(null);
    setEditingVehicleDetail(null);
    setFormData({
      name: '',
      vehicle_color: [],
      battery_variant: [],
      price: 0,
      battery_pricing: {},
      status: 'available',
      description: '',
      features: [],
      specifications: {},
      color_images: {},
      image_ids: [],
      initial_quantity: 0,
    });
    setFeatureInput('');
    setVehicleColorInput('');
    setBatteryVariantInput('');
    setSelectedFiles([]);
    setImagePreviewUrls([]);
    setUploadedImages([]);
    setActiveTab('basic');
    setIsAddingSpecification(false);
    setNewSpecKey('');
    setNewSpecValue('');
    setEditingSpecKeys({});
    setColorImageInputs({});
    setIsDialogOpen(true);
  };

  const addFeature = (feature: string) => {
    // Handle comma-separated values
    const features = feature.split(',').map(f => f.trim()).filter(f => f);
    if (features.length === 0) return;
    
    setFormData((prev) => {
      const newFeatures = [...prev.features];
      features.forEach((trimmed) => {
        if (!newFeatures.includes(trimmed)) {
          newFeatures.push(trimmed);
        }
      });
      return {
        ...prev,
        features: newFeatures,
      };
    });
  };

  // Handle image file selection
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Remove uploaded image
  const removeUploadedImage = (imageId: number) => {
    setUploadedImages((prev) => prev.filter(img => img.id !== imageId));
    setFormData((prev) => ({
      ...prev,
      image_ids: prev.image_ids.filter(id => id !== imageId),
    }));
  };

  // Remove preview image (not yet uploaded)
  const removePreviewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload images
  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }

    try {
      const result = await uploadImages(selectedFiles).unwrap();
      setUploadedImages((prev) => [...prev, ...result]);
      setFormData((prev) => ({
        ...prev,
        image_ids: [...prev.image_ids, ...result.map(img => img.id)],
      }));
      // Clear selected files and previews after successful upload
      setSelectedFiles([]);
      setImagePreviewUrls((prev) => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
      toast.success(`Successfully uploaded ${result.length} image(s)`);
    } catch (error: unknown) {
      console.error('Error uploading images:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error && 
        error.data && typeof error.data === 'object' && 'message' in error.data &&
        typeof error.data.message === 'string' ? error.data.message : 'Failed to upload images';
      toast.error(errorMessage);
    }
  };

  // Check if all required tabs are completed
  const isFormComplete = () => {
    // Basic Info: name, status, price are required
    if (!formData.name || formData.price <= 0) return false;
    
    // Variants: vehicle_color and battery_variant are required
    if (formData.vehicle_color.length === 0 || formData.battery_variant.length === 0) return false;
    
    // Features: at least one feature is required
    if (formData.features.length === 0) return false;
    
    // Specifications: at least one specification is required
    if (Object.keys(formData.specifications).length === 0) return false;
    
    // Images: at least one image should be uploaded or image_ids should be set
    if (formData.image_ids.length === 0 && uploadedImages.length === 0) return false;
    
    return true;
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    // If creating new vehicle
    if (!editingVariantId) {
      // Validate required fields
      if (!isFormComplete()) {
        toast.error('Please complete all required fields in all tabs before creating the model');
        return;
      }

      try {
        // Prepare request data
        const requestData: CreateVehicleRequest = {
          name: formData.name,
          vehicle_color: formData.vehicle_color,
          battery_variant: formData.battery_variant,
          price: formData.price,
          status: formData.status,
          description: formData.description,
          features: formData.features,
          specifications: formData.specifications,
        };

        // Only include battery_pricing if it has values, and filter to only include batteries in battery_variant
        const filteredBatteryPricing: Record<string, number> = {};
        formData.battery_variant.forEach(battery => {
          if (formData.battery_pricing[battery] !== undefined) {
            filteredBatteryPricing[battery] = formData.battery_pricing[battery];
          }
        });
        if (Object.keys(filteredBatteryPricing).length > 0) {
          requestData.battery_pricing = filteredBatteryPricing;
        }

        // Only include color_images if it has values, and filter to only include colors in vehicle_color
        const filteredColorImages: Record<string, number[]> = {};
        formData.vehicle_color.forEach(color => {
          if (formData.color_images[color] && formData.color_images[color].length > 0) {
            filteredColorImages[color] = formData.color_images[color];
          }
        });
        if (Object.keys(filteredColorImages).length > 0) {
          requestData.color_images = filteredColorImages;
        }

        // Include image_ids (from uploaded images)
        if (formData.image_ids.length > 0) {
          requestData.image_ids = formData.image_ids;
        }

        // Only include initial_quantity if it's greater than 0
        if (formData.initial_quantity > 0) {
          requestData.initial_quantity = formData.initial_quantity;
        }

        console.log('📤 [CREATE VEHICLE API REQUEST] Request Body:', JSON.stringify(requestData, null, 2));

        const result = await createVehicle(requestData).unwrap();
        
        console.log('📥 [CREATE VEHICLE API RESPONSE] Response Data:', JSON.stringify(result, null, 2));
        
        toast.success(`Successfully created ${result.length} variant(s)`);
        setIsDialogOpen(false);
        setEditingModel(null);
        setEditingVariantId(null);
        setEditingVehicleDetail(null);
        setSelectedFiles([]);
        setImagePreviewUrls([]);
        setUploadedImages([]);
        setActiveTab('basic');
      setIsAddingSpecification(false);
      setNewSpecKey('');
      setNewSpecValue('');
      setEditingSpecKeys({});
      setColorImageInputs({});
      refetch(); // Refresh the list
      } catch (error: unknown) {
        console.error('Error creating vehicle:', error);
        let errorMessage = 'Failed to create model';
        if (error && typeof error === 'object' && 'data' in error) {
          const errorData = error.data;
          if (errorData && typeof errorData === 'object') {
            if ('message' in errorData && typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if ('detail' in errorData && typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            }
          }
        }
        toast.error(errorMessage);
      }
      return;
    }

    // If updating existing vehicle
    // Validate required fields
    if (!formData.name || formData.vehicle_color.length === 0 || formData.battery_variant.length === 0) {
      toast.error('Please fill in all required fields (Name, Colors, Battery Variants)');
      return;
    }

    try {
      // Debug: Log current formData specifications
      console.log('📋 [UPDATE VARIANT] Current formData.specifications:', JSON.stringify(formData.specifications, null, 2));
      console.log('📋 [UPDATE VARIANT] Specifications keys:', Object.keys(formData.specifications));
      
      // Prepare request data - only include optional fields if they have values
      const requestData: UpdateVehicleRequest = {
        name: formData.name,
        vehicle_color: formData.vehicle_color,
        battery_variant: formData.battery_variant,
        price: formData.price,
        status: formData.status,
        description: formData.description,
        features: formData.features,
        specifications: { ...formData.specifications }, // Ensure we're sending a copy with all specifications
      };

      // Only include battery_pricing if it has values, and filter to only include batteries in battery_variant
      const filteredBatteryPricing: Record<string, number> = {};
      formData.battery_variant.forEach(battery => {
        if (formData.battery_pricing[battery] !== undefined) {
          filteredBatteryPricing[battery] = formData.battery_pricing[battery];
        }
      });
      if (Object.keys(filteredBatteryPricing).length > 0) {
        requestData.battery_pricing = filteredBatteryPricing;
      }

      // Only include color_images if it has values, and filter to only include colors in vehicle_color
      const filteredColorImages: Record<string, number[]> = {};
      formData.vehicle_color.forEach(color => {
        if (formData.color_images[color] && formData.color_images[color].length > 0) {
          filteredColorImages[color] = formData.color_images[color];
        }
      });
      if (Object.keys(filteredColorImages).length > 0) {
        requestData.color_images = filteredColorImages;
      }

      // Only include image_ids if it has values
      if (formData.image_ids.length > 0) {
        requestData.image_ids = formData.image_ids;
      }

      // Only include initial_quantity if it's greater than 0
      if (formData.initial_quantity > 0) {
        requestData.initial_quantity = formData.initial_quantity;
      }

      // Console log the PUT request body
      console.log('📤 [PUT API REQUEST] Request Body:', JSON.stringify(requestData, null, 2));
      console.log('📤 [PUT API REQUEST] Variant ID:', editingVariantId);
      console.log('📤 [PUT API REQUEST] Full Request:', {
        id: editingVariantId,
        data: requestData,
      });

      const result = await updateVehicle({
        id: editingVariantId,
        data: requestData,
      }).unwrap();
      
      // Console log the PUT response
      console.log('📥 [PUT API RESPONSE] Response Data:', JSON.stringify(result, null, 2));
      
      toast.success('Variant updated successfully');
      setIsDialogOpen(false);
      setEditingModel(null);
      setEditingVariantId(null);
      setEditingVehicleDetail(null);
      setIsAddingSpecification(false);
      setNewSpecKey('');
      setNewSpecValue('');
      setEditingSpecKeys({});
      setColorImageInputs({});
      refetch(); // Refresh the list
    } catch (error: unknown) {
      console.error('Error updating vehicle:', error);
      let errorMessage = 'Failed to update variant';
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = error.data;
        if (errorData && typeof errorData === 'object') {
          if ('message' in errorData && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if ('detail' in errorData && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        }
      }
      toast.error(errorMessage);
    }
  };

  const nextImage = () => {
    if (viewingVehicleDetail?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % viewingVehicleDetail.images.length);
    } else if (viewingModel) {
      setCurrentImageIndex((prev) => (prev + 1) % viewingModel.images.length);
    }
  };

  const prevImage = () => {
    if (viewingVehicleDetail?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + viewingVehicleDetail.images.length) % viewingVehicleDetail.images.length);
    } else if (viewingModel) {
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingModel(null);
              setEditingVariantId(null);
              setEditingVehicleDetail(null);
            }
          }}>
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  {isLoadingVehicleDetail && editingVariantId ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading variant data...</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Model Name *</Label>
                          <Input 
                            placeholder="EV Model X1" 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        {editingVariantId && editingVehicleDetail && (
                          <div className="space-y-2">
                            <Label>Model Code</Label>
                            <Input 
                              placeholder="EV-RED-75K-ZKZ9H1" 
                              value={editingVehicleDetail.model_code || ''}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Status *</Label>
                          <Select 
                            value={formData.status}
                            onValueChange={(value: 'available' | 'out_of_stock' | 'discontinued') => 
                              setFormData({ ...formData, status: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                              <SelectItem value="discontinued">Discontinued</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Price (₹) *</Label>
                          <Input 
                            type="number" 
                            placeholder="65000" 
                            value={formData.price > 0 ? formData.price : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ 
                                ...formData, 
                                price: val === '' ? 0 : parseFloat(val) || 0 
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setFormData({ ...formData, price: 0 });
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Initial Quantity</Label>
                          <Input 
                            type="number" 
                            placeholder="25" 
                            value={formData.initial_quantity > 0 ? formData.initial_quantity : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ 
                                ...formData, 
                                initial_quantity: val === '' ? 0 : parseInt(val) || 0 
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setFormData({ ...formData, initial_quantity: 0 });
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Premium electric vehicle"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="specifications" className="space-y-4">
                  <div className="space-y-4">
                    {Object.keys(formData.specifications).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(formData.specifications).map(([key, value], index) => {
                          // Use index as stable key to prevent re-mounting when key changes
                          const displayKey = editingSpecKeys[key] !== undefined ? editingSpecKeys[key] : key;
                          return (
                            <div key={`spec-${index}-${key}`} className="flex gap-2 items-end">
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs text-muted-foreground">Label</Label>
                                <Input 
                                  placeholder="e.g., Battery"
                                  value={displayKey}
                                  onChange={(e) => {
                                    const newKey = e.target.value;
                                    // Store the temporary key edit without updating the actual specifications
                                    setEditingSpecKeys(prev => ({
                                      ...prev,
                                      [key]: newKey
                                    }));
                                  }}
                                  onBlur={(e) => {
                                    const newKey = e.target.value.trim();
                                    const currentKey = key;
                                    
                                    // Clear the temporary edit
                                    setEditingSpecKeys(prev => {
                                      const updated = { ...prev };
                                      delete updated[currentKey];
                                      return updated;
                                    });
                                    
                                    // If key is empty on blur, remove the specification
                                    if (!newKey) {
                                      const newSpecifications = { ...formData.specifications };
                                      delete newSpecifications[currentKey];
                                      setFormData({
                                        ...formData,
                                        specifications: newSpecifications
                                      });
                                    } else if (newKey !== currentKey) {
                                      // Finalize the rename: ensure old key is removed and new key is set
                                      const newSpecifications: Record<string, string> = {};
                                      const oldValue = formData.specifications[currentKey];
                                      
                                      Object.entries(formData.specifications).forEach(([k, v]) => {
                                        if (k !== currentKey) {
                                          newSpecifications[k] = v;
                                        }
                                      });
                                      
                                      // Add with new key
                                      newSpecifications[newKey] = oldValue;
                                      
                                      setFormData({
                                        ...formData,
                                        specifications: newSpecifications
                                      });
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label className="text-xs text-muted-foreground">Value</Label>
                                <Input 
                                  placeholder="e.g., 60V × 50AH"
                                  value={value}
                                  onChange={(e) => {
                                    // Use the current key from the map, not from state (which might be stale)
                                    const currentSpecs = { ...formData.specifications };
                                    currentSpecs[key] = e.target.value;
                                    setFormData({
                                      ...formData,
                                      specifications: currentSpecs
                                    });
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newSpecifications = { ...formData.specifications };
                                  delete newSpecifications[key];
                                  setFormData({
                                    ...formData,
                                    specifications: newSpecifications
                                  });
                                }}
                                className="mb-0"
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Battery</Label>
                          <Input 
                            placeholder="60V × 50AH"
                            value={formData.specifications['Battery'] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              specifications: { ...formData.specifications, 'Battery': e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Motor Power</Label>
                          <Input 
                            placeholder="48V/60V/72V 1000W"
                            value={formData.specifications['Motor Power'] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              specifications: { ...formData.specifications, 'Motor Power': e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Speed</Label>
                          <Input 
                            placeholder="25 km/h"
                            value={formData.specifications['Max Speed'] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              specifications: { ...formData.specifications, 'Max Speed': e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    )}
                    {isAddingSpecification ? (
                      <div className="flex gap-2 items-end p-3 border rounded-lg bg-muted/50">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs text-muted-foreground">Label</Label>
                          <Input 
                            placeholder="e.g., Battery"
                            value={newSpecKey}
                            onChange={(e) => setNewSpecKey(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newSpecKey.trim()) {
                                  const trimmedKey = newSpecKey.trim();
                                  setFormData((prev) => ({
                                    ...prev,
                                    specifications: { 
                                      ...prev.specifications, 
                                      [trimmedKey]: newSpecValue 
                                    }
                                  }));
                                  console.log('✅ [ADD SPEC] Added specification:', trimmedKey, '=', newSpecValue);
                                  setNewSpecKey('');
                                  setNewSpecValue('');
                                  setIsAddingSpecification(false);
                                }
                              } else if (e.key === 'Escape') {
                                setIsAddingSpecification(false);
                                setNewSpecKey('');
                                setNewSpecValue('');
                                setEditingSpecKeys({});
                              }
                            }}
                            autoFocus
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs text-muted-foreground">Value</Label>
                          <Input 
                            placeholder="e.g., 60V × 50AH"
                            value={newSpecValue}
                            onChange={(e) => setNewSpecValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newSpecKey.trim()) {
                                  const trimmedKey = newSpecKey.trim();
                                  setFormData((prev) => ({
                                    ...prev,
                                    specifications: { 
                                      ...prev.specifications, 
                                      [trimmedKey]: newSpecValue 
                                    }
                                  }));
                                  console.log('✅ [ADD SPEC] Added specification:', trimmedKey, '=', newSpecValue);
                                  setNewSpecKey('');
                                  setNewSpecValue('');
                                  setIsAddingSpecification(false);
                                }
                              } else if (e.key === 'Escape') {
                                setIsAddingSpecification(false);
                                setNewSpecKey('');
                                setNewSpecValue('');
                                setEditingSpecKeys({});
                              }
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (newSpecKey.trim()) {
                              const trimmedKey = newSpecKey.trim();
                              setFormData((prev) => ({
                                ...prev,
                                specifications: { 
                                  ...prev.specifications, 
                                  [trimmedKey]: newSpecValue 
                                }
                              }));
                              console.log('✅ [ADD SPEC] Added specification:', trimmedKey, '=', newSpecValue);
                              setNewSpecKey('');
                              setNewSpecValue('');
                              setIsAddingSpecification(false);
                            }
                          }}
                          disabled={!newSpecKey.trim()}
                        >
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingSpecification(false);
                            setNewSpecKey('');
                            setNewSpecValue('');
                            setEditingSpecKeys({});
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingSpecification(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Specification
                      </Button>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="pricing" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Base Price (₹) *</Label>
                        <Input 
                          type="number" 
                          placeholder="65000" 
                          value={formData.price > 0 ? formData.price : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({ 
                              ...formData, 
                              price: val === '' ? 0 : parseFloat(val) || 0 
                            });
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              setFormData({ ...formData, price: 0 });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Battery Pricing (Optional)</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Set different prices for different battery variants. If not provided, base price will be used.
                      </p>
                      {formData.battery_variant.map((battery) => (
                        <div key={battery} className="flex items-center gap-2 mb-2">
                          <Label className="w-24">{battery}:</Label>
                          <Input
                            type="number"
                            placeholder="Price"
                            value={formData.battery_pricing[battery] > 0 ? formData.battery_pricing[battery] : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({
                                ...formData,
                                battery_pricing: {
                                  ...formData.battery_pricing,
                                  [battery]: val === '' ? 0 : parseFloat(val) || 0
                                }
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setFormData({
                                  ...formData,
                                  battery_pricing: {
                                    ...formData.battery_pricing,
                                    [battery]: 0
                                  }
                                });
                              }
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      {formData.battery_variant.length === 0 && (
                        <p className="text-sm text-muted-foreground">Add battery variants in the Variants tab first</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="features" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Features *</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Type a feature and press Enter or comma to add it
                      </p>
                      <Input
                        placeholder="USB Charging Port, Reverse Gear, Parking Mode (comma-separated)"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addFeature(featureInput);
                            setFeatureInput('');
                          }
                        }}
                        onBlur={() => {
                          if (featureInput.trim()) {
                            addFeature(featureInput);
                            setFeatureInput('');
                          }
                        }}
                      />
                      {formData.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary">
                              {feature}
                              <button
                                onClick={() => {
                                  const newFeatures = formData.features.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, features: newFeatures });
                                }}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Product Images *</Label>
                        <p className="text-sm text-muted-foreground">
                          Upload images for the vehicle. Images will be uploaded and their IDs will be automatically assigned.
                        </p>
                      </div>
                    </div>
                    
                    {/* Image Upload Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Upload Images</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageFileSelect}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleUploadImages}
                            disabled={selectedFiles.length === 0 || isUploadingImages}
                          >
                            {isUploadingImages ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </>
                            )}
                          </Button>
                        </div>
                        {selectedFiles.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {selectedFiles.length} file(s) selected. Click Upload to upload them.
                          </p>
                        )}
                      </div>

                      {/* Image Previews */}
                      {(imagePreviewUrls.length > 0 || uploadedImages.length > 0) && (
                        <div className="space-y-2">
                          <Label>Uploaded Images</Label>
                          <div className="grid grid-cols-3 gap-4">
                            {uploadedImages.map((image) => (
                              <div key={image.id} className="relative">
                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-secondary">
                                  <img
                                    src={image.image_url}
                                    alt={`Uploaded ${image.id}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Badge className="absolute top-2 left-2">
                                  ID: {image.id}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => removeUploadedImage(image.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            {imagePreviewUrls.map((url, index) => (
                              <div key={index} className="relative">
                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-secondary">
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Badge className="absolute top-2 left-2">
                                  Pending
                                </Badge>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() => removePreviewImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual Image ID Input (for editing existing vehicles) */}
                      {editingVehicleDetail && (
                        <div className="space-y-2">
                          <Label>Image IDs (comma-separated)</Label>
                          <Input
                            placeholder="100, 101, 102"
                            value={formData.image_ids.join(', ')}
                            onChange={(e) => {
                              const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                              setFormData({ ...formData, image_ids: ids });
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Current images: {editingVehicleDetail?.images.length || 0}
                          </p>
                          {editingVehicleDetail?.images && editingVehicleDetail.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              {editingVehicleDetail.images.map((image) => (
                                <div key={image.id} className="relative">
                                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-secondary">
                                    <img
                                      src={image.image_url}
                                      alt={`Image ${image.id}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <Badge className="absolute top-2 left-2">
                                    ID: {image.id}
                                    {image.is_primary && ' (Primary)'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Color Images Mapping */}
                      {formData.vehicle_color.length > 0 && (
                        <div className="space-y-2">
                          <Label>Color Images Mapping (Optional)</Label>
                          <p className="text-sm text-muted-foreground">
                            Map colors to specific image IDs. Format: color: imageId1, imageId2
                          </p>
                          {formData.vehicle_color.map((color) => {
                            const displayValue = colorImageInputs[color] !== undefined 
                              ? colorImageInputs[color] 
                              : (formData.color_images[color]?.join(', ') || '');
                            return (
                              <div key={color} className="flex items-center gap-2">
                                <Label className="w-24 capitalize">{color}:</Label>
                                <Input
                                  placeholder="Image IDs (comma-separated)"
                                  value={displayValue}
                                  onChange={(e) => {
                                    setColorImageInputs(prev => ({
                                      ...prev,
                                      [color]: e.target.value
                                    }));
                                  }}
                                  onBlur={(e) => {
                                    const inputValue = e.target.value;
                                    const ids = inputValue.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                                    setFormData((prev) => ({
                                      ...prev,
                                      color_images: {
                                        ...prev.color_images,
                                        [color]: ids
                                      }
                                    }));
                                    // Update input to show processed values
                                    setColorImageInputs(prev => ({
                                      ...prev,
                                      [color]: ids.join(', ')
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    // Process on Enter key
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const inputValue = colorImageInputs[color] || '';
                                      const ids = inputValue.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                                      setFormData((prev) => ({
                                        ...prev,
                                        color_images: {
                                          ...prev.color_images,
                                          [color]: ids
                                        }
                                      }));
                                      setColorImageInputs(prev => ({
                                        ...prev,
                                        [color]: ids.join(', ')
                                      }));
                                    }
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="variants" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Vehicle Colors *</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter colors separated by commas or add one at a time
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="red, white, blue (comma-separated)"
                          value={vehicleColorInput}
                          onChange={(e) => {
                            setVehicleColorInput(e.target.value);
                          }}
                          onBlur={() => {
                            // Process comma-separated values when user leaves the field
                            const colors = vehicleColorInput.split(',').map(c => c.trim()).filter(c => c);
                            // Clean up color_images to only include colors that are still in vehicle_color
                            const cleanedColorImages: Record<string, number[]> = {};
                            colors.forEach(color => {
                              if (formData.color_images[color]) {
                                cleanedColorImages[color] = formData.color_images[color];
                              }
                            });
                            setFormData({ 
                              ...formData, 
                              vehicle_color: colors,
                              color_images: cleanedColorImages
                            });
                            // Update input to show processed values
                            setVehicleColorInput(colors.join(', '));
                          }}
                          onKeyDown={(e) => {
                            // Process on Enter key
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const colors = vehicleColorInput.split(',').map(c => c.trim()).filter(c => c);
                              // Clean up color_images to only include colors that are still in vehicle_color
                              const cleanedColorImages: Record<string, number[]> = {};
                              colors.forEach(color => {
                                if (formData.color_images[color]) {
                                  cleanedColorImages[color] = formData.color_images[color];
                                }
                              });
                              setFormData({ 
                                ...formData, 
                                vehicle_color: colors,
                                color_images: cleanedColorImages
                              });
                              setVehicleColorInput(colors.join(', '));
                            }
                          }}
                        />
                      </div>
                      {formData.vehicle_color.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.vehicle_color.map((color, idx) => (
                            <Badge key={idx} variant="secondary" className="capitalize">
                              {color}
                              <button
                                onClick={() => {
                                  const newColors = formData.vehicle_color.filter((_, i) => i !== idx);
                                  const removedColor = formData.vehicle_color[idx];
                                  // Remove the color from color_images if it exists
                                  const newColorImages = { ...formData.color_images };
                                  delete newColorImages[removedColor];
                                  setFormData({ 
                                    ...formData, 
                                    vehicle_color: newColors,
                                    color_images: newColorImages
                                  });
                                  setVehicleColorInput(newColors.join(', '));
                                }}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Battery Variants *</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter battery variants separated by commas
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="40kWh, 60kWh, 75kWh (comma-separated)"
                          value={batteryVariantInput}
                          onChange={(e) => {
                            setBatteryVariantInput(e.target.value);
                          }}
                          onBlur={() => {
                            // Process comma-separated values when user leaves the field
                            const batteries = batteryVariantInput.split(',').map(b => b.trim()).filter(b => b);
                            // Clean up battery_pricing to only include batteries that are still in battery_variant
                            const cleanedBatteryPricing: Record<string, number> = {};
                            batteries.forEach(battery => {
                              if (formData.battery_pricing[battery] !== undefined) {
                                cleanedBatteryPricing[battery] = formData.battery_pricing[battery];
                              }
                            });
                            setFormData({ 
                              ...formData, 
                              battery_variant: batteries,
                              battery_pricing: cleanedBatteryPricing
                            });
                            // Update input to show processed values
                            setBatteryVariantInput(batteries.join(', '));
                          }}
                          onKeyDown={(e) => {
                            // Process on Enter key
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const batteries = batteryVariantInput.split(',').map(b => b.trim()).filter(b => b);
                              // Clean up battery_pricing to only include batteries that are still in battery_variant
                              const cleanedBatteryPricing: Record<string, number> = {};
                              batteries.forEach(battery => {
                                if (formData.battery_pricing[battery] !== undefined) {
                                  cleanedBatteryPricing[battery] = formData.battery_pricing[battery];
                                }
                              });
                              setFormData({ 
                                ...formData, 
                                battery_variant: batteries,
                                battery_pricing: cleanedBatteryPricing
                              });
                              setBatteryVariantInput(batteries.join(', '));
                            }
                          }}
                        />
                      </div>
                      {formData.battery_variant.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.battery_variant.map((battery, idx) => (
                            <Badge key={idx} variant="secondary">
                              {battery}
                              <button
                                onClick={() => {
                                  const newBatteries = formData.battery_variant.filter((_, i) => i !== idx);
                                  const newPricing = { ...formData.battery_pricing };
                                  delete newPricing[battery];
                                  setFormData({ 
                                    ...formData, 
                                    battery_variant: newBatteries,
                                    battery_pricing: newPricing
                                  });
                                  setBatteryVariantInput(newBatteries.join(', '));
                                }}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingModel(null);
                    setEditingVariantId(null);
                    setEditingVehicleDetail(null);
                    setSelectedFiles([]);
                    setImagePreviewUrls([]);
                    setUploadedImages([]);
                    setActiveTab('basic');
                    setIsAddingSpecification(false);
                    setNewSpecKey('');
                    setNewSpecValue('');
                    setEditingSpecKeys({});
                  }}
                  disabled={isUpdating || isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFormSubmit}
                  disabled={
                    isUpdating || 
                    isCreating || 
                    (editingVariantId ? (!formData.name || formData.vehicle_color.length === 0 || formData.battery_variant.length === 0) : (activeTab !== 'images' || !isFormComplete()))
                  }
                >
                  {(isUpdating || isCreating) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingVariantId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingVariantId ? 'Update' : 'Create'} {editingVariantId ? 'Variant' : 'Model'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Model Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Variant Details</DialogTitle>
                <DialogDescription>
                  Complete information about {viewingVehicleDetail?.name || viewingModel?.name}
                </DialogDescription>
              </DialogHeader>
              {isLoadingVehicleDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading variant details...</span>
                </div>
              ) : viewingVehicleDetail ? (
                <div className="space-y-6">
                  {/* Image Gallery */}
                  {viewingVehicleDetail.images && viewingVehicleDetail.images.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                          <img
                            src={viewingVehicleDetail.images[currentImageIndex]?.image_url || viewingVehicleDetail.primary_image_url || ''}
                            alt={`${viewingVehicleDetail.name} - Image ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {viewingVehicleDetail.images.length > 1 && (
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
                                {currentImageIndex + 1} / {viewingVehicleDetail.images.length}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                      {viewingVehicleDetail.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {viewingVehicleDetail.images.map((image, index) => (
                            <button
                              key={image.id}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                index === currentImageIndex
                                  ? 'border-primary ring-2 ring-primary'
                                  : 'border-secondary hover:border-primary/50'
                              }`}
                            >
                              <img
                                src={image.image_url}
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
                          <Label className="text-xs text-muted-foreground">Variant ID</Label>
                          <p className="font-medium">{viewingVehicleDetail.id}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Model Code</Label>
                          <p className="font-medium">{viewingVehicleDetail.model_code}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Name</Label>
                          <p className="font-medium">{viewingVehicleDetail.name}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Colors</Label>
                          <div className="mt-1 flex gap-2 flex-wrap">
                            {viewingVehicleDetail.vehicle_color.map((color, idx) => (
                              <Badge key={idx} variant="outline" className="capitalize">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Battery Variant</Label>
                          <div className="mt-1 flex gap-2 flex-wrap">
                            {viewingVehicleDetail.battery_variant.map((battery, idx) => (
                              <Badge key={idx} variant="outline">
                                {battery}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <div className="mt-1">{getStatusBadge(viewingVehicleDetail.status)}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Price</Label>
                          <p className="font-bold text-lg">₹{parseFloat(viewingVehicleDetail.price).toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(viewingVehicleDetail.specifications).map(([key, value]) => (
                            <div key={key}>
                              <Label className="text-xs text-muted-foreground">{key}</Label>
                              <p className="font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Features */}
                  {viewingVehicleDetail.features && viewingVehicleDetail.features.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {viewingVehicleDetail.features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Description */}
                  {viewingVehicleDetail.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{viewingVehicleDetail.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Stock & Metadata */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Stock Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Stock Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Total Quantity</Label>
                            <p className="font-medium text-lg">{viewingVehicleDetail.stock_total_quantity}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Available Quantity</Label>
                            <p className="font-medium text-lg text-success">
                              {viewingVehicleDetail.stock_available_quantity}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Reserved Quantity</Label>
                            <p className="font-medium text-lg text-warning">
                              {viewingVehicleDetail.stock_reserved_quantity}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Metadata</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Created At</Label>
                            <p className="font-medium">
                              {new Date(viewingVehicleDetail.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Last Updated</Label>
                            <p className="font-medium">
                              {new Date(viewingVehicleDetail.updated_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No variant details available</p>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setViewingVehicleDetail(null);
                    setViewingModel(null);
                    setCurrentImageIndex(0);
                  }}
                >
                  Close
                </Button>
                {viewingVehicleDetail && viewingModel && (
                  <Button
                    onClick={async () => {
                      setIsViewDialogOpen(false);
                      setViewingVehicleDetail(null);
                      await startEditVariant(viewingModel, viewingVehicleDetail.id);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Variant
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Variant Selection Dialog */}
          <Dialog open={isEditVariantDialogOpen} onOpenChange={setIsEditVariantDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Variant to Edit</DialogTitle>
                <DialogDescription>
                  Choose which variant of {editVariantModel?.name} you want to edit.
                </DialogDescription>
              </DialogHeader>
              {editVariantModel && editVariantModel.variants && editVariantModel.variants.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Variant *</Label>
                    <Select
                      value={selectedEditVariantId?.toString() || ''}
                      onValueChange={(value) => setSelectedEditVariantId(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {editVariantModel.variants.map((variant) => (
                          <SelectItem key={variant.variantId} value={variant.variantId.toString()}>
                            {variant.sku} {variant.color ? `| ${variant.color}` : ''}{' '}
                            {variant.batteryVariant && variant.batteryVariant.length > 0
                              ? `| ${variant.batteryVariant.join(', ')}`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No variants available for this model.</p>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditVariantDialogOpen(false);
                    setEditVariantModel(null);
                    setSelectedEditVariantId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditVariantConfirm}
                  disabled={!selectedEditVariantId}
                >
                  Edit Variant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Variant Selection Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Variant</DialogTitle>
                <DialogDescription>
                  Select a variant to delete from {deleteModel?.name}
                </DialogDescription>
              </DialogHeader>
              {deleteModel && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Variant to Delete *</Label>
                    <Select
                      value={selectedVariantId?.toString() || ''}
                      onValueChange={(value) => setSelectedVariantId(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {deleteModel.variants?.map((variant) => (
                          <SelectItem key={variant.variantId} value={variant.variantId.toString()}>
                            {variant.sku} - {variant.color || 'N/A'} - {variant.batteryVariant?.join(', ') || 'N/A'} - ₹{variant.price ? parseFloat(variant.price).toLocaleString() : 'N/A'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedVariantId && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Selected Variant:</p>
                      {deleteModel.variants?.find(v => v.variantId === selectedVariantId) && (
                        <div className="text-sm text-muted-foreground">
                          <p>SKU: {deleteModel.variants.find(v => v.variantId === selectedVariantId)?.sku}</p>
                          <p>Color: {deleteModel.variants.find(v => v.variantId === selectedVariantId)?.color || 'N/A'}</p>
                          <p>Battery: {deleteModel.variants.find(v => v.variantId === selectedVariantId)?.batteryVariant?.join(', ') || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteModel(null);
                  setSelectedVariantId(null);
                }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedVariantId) {
                      setIsDeleteConfirmOpen(true);
                    }
                  }}
                  disabled={!selectedVariantId}
                >
                  Continue to Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this variant? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedVariantId && deleteModel && (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="font-medium text-destructive mb-2">Variant to be deleted:</p>
                    {deleteModel.variants?.find(v => v.variantId === selectedVariantId) && (
                      <div className="text-sm">
                        <p><strong>SKU:</strong> {deleteModel.variants.find(v => v.variantId === selectedVariantId)?.sku}</p>
                        <p><strong>Color:</strong> {deleteModel.variants.find(v => v.variantId === selectedVariantId)?.color || 'N/A'}</p>
                        <p><strong>Battery:</strong> {deleteModel.variants.find(v => v.variantId === selectedVariantId)?.batteryVariant?.join(', ') || 'N/A'}</p>
                        <p><strong>Price:</strong> ₹{deleteModel.variants.find(v => v.variantId === selectedVariantId)?.price ? parseFloat(deleteModel.variants.find(v => v.variantId === selectedVariantId)!.price!).toLocaleString() : 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Variant'
                  )}
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
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {isLoading ? '...' : data?.count || models.length}
                  </p>
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
                    {isLoading ? '...' : models.filter((m) => m.status === 'active').length}
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
                    {isLoading ? '...' : new Set(models.map((m) => m.category)).size}
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
                  <p className="text-sm font-medium text-muted-foreground">Variants</p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    {isLoading ? '...' : models.reduce((sum, m) => sum + (m.variants?.length || 0), 0)}
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
              <div className="relative flex items-center gap-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchClear}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading models...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-4">Error loading models</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error && 'status' in error ? `Status: ${error.status}` : 'Unknown error'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          ) : filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No models found</p>
            </div>
          ) : (
            <>
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
                          <p className="text-xs text-muted-foreground">
                            {model.specifications.range ? `${model.specifications.range} km range` : 'N/A'}
                          </p>
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
                        <span className="font-bold text-foreground">
                          ₹{model.basePrice.toLocaleString()}
                          {model.variants && model.variants.length > 0 && (
                            <span className="text-xs text-muted-foreground block">
                              (₹{Math.max(...model.variants.map(v => model.basePrice + (v.priceAdjustment || 0))).toLocaleString()} max)
                            </span>
                          )}
                        </span>
                      </TableCell>
                  <TableCell>{getStatusBadge(model.status)}</TableCell>
                  <TableCell>
                    {model.variants && model.variants.length > 0 ? (
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        <p className="text-xs text-muted-foreground">
                          {model.variants.length} variants
                        </p>
                        {model.variants.map((variant) => (
                          <button
                            key={variant.variantId}
                            type="button"
                            onClick={() => variant.variantId && handleViewVariant(model, variant.variantId)}
                            className="w-full text-left text-xs flex flex-wrap items-center gap-1 rounded border px-2 py-1 bg-muted/40 hover:border-primary/70 hover:bg-primary/5 cursor-pointer"
                          >
                            <span className="font-medium">{variant.sku}</span>
                            {variant.color && (
                              <span className="capitalize text-muted-foreground">
                                | {variant.color}
                              </span>
                            )}
                            {variant.batteryVariant && variant.batteryVariant.length > 0 && (
                              <span className="text-muted-foreground">
                                | {variant.batteryVariant.join(', ')}
                              </span>
                            )}
                            {variant.price && (
                              <span className="ml-auto font-semibold">
                                ₹{parseFloat(variant.price).toLocaleString()}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No variants</span>
                    )}
                  </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(model)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(model)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {data && data.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.count)} of {data.count} models
                    </p>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(parseInt(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">per page</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                        let pageNum: number;
                        if (data.total_pages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= data.total_pages - 2) {
                          pageNum = data.total_pages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoading}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(data.total_pages, prev + 1))}
                      disabled={currentPage === data.total_pages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

