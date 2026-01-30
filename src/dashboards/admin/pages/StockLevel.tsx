import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Warehouse, Plus, Filter, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useGetStockListQuery, StockListQueryParams, useUpdateStockByVehicleIdMutation } from '@/app/api/inventoryApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to format currency
const formatCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', '');
};

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

// Helper function to format vehicle variant display
const formatVehicleVariantDisplay = (stock: {
  vehicle_name: string;
  vehicle_colors?: string[];
  battery_variants?: string[];
}): string => {
  const colors = stock.vehicle_colors && stock.vehicle_colors.length > 0 
    ? stock.vehicle_colors.join(', ') 
    : 'N/A';
  const batteries = stock.battery_variants && stock.battery_variants.length > 0 
    ? stock.battery_variants.join(', ') 
    : 'N/A';
  
  return `${stock.vehicle_name} - ${colors} / ${batteries}`;
};

export const StockLevel = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [vehicleIdFilter, setVehicleIdFilter] = useState<string>('');
  const [modelCodeFilter, setModelCodeFilter] = useState<string>('');
  const [vehicleNameFilter, setVehicleNameFilter] = useState<string>('');
  const [minAvailableFilter, setMinAvailableFilter] = useState<string>('');
  const [maxAvailableFilter, setMaxAvailableFilter] = useState<string>('');
  
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Add Stock form state
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('');
  
  // API mutation for updating stock
  const [updateStockByVehicleId, { isLoading: isUpdatingStock }] = useUpdateStockByVehicleIdMutation();

  // Build query params
  const queryParams: StockListQueryParams = useMemo(() => {
    const params: StockListQueryParams = {
      page: currentPage,
      page_size: pageSize,
    };
    
    if (appliedSearchQuery) {
      // Apply search to vehicle_name or model_code
      params.vehicle_name = appliedSearchQuery;
    }
    
    if (vehicleIdFilter && !isNaN(parseInt(vehicleIdFilter))) {
      params.vehicle_id = parseInt(vehicleIdFilter);
    }
    
    if (modelCodeFilter) {
      params.model_code = modelCodeFilter;
    }
    
    if (vehicleNameFilter) {
      params.vehicle_name = vehicleNameFilter;
    }
    
    if (minAvailableFilter && !isNaN(parseInt(minAvailableFilter))) {
      params.min_available = parseInt(minAvailableFilter);
    }
    
    if (maxAvailableFilter && !isNaN(parseInt(maxAvailableFilter))) {
      params.max_available = parseInt(maxAvailableFilter);
    }
    
    return params;
  }, [currentPage, pageSize, appliedSearchQuery, vehicleIdFilter, modelCodeFilter, vehicleNameFilter, minAvailableFilter, maxAvailableFilter]);

  // Fetch stock data
  const { data: stockData, isLoading, isError, error, refetch: refetchStockList } = useGetStockListQuery(queryParams);

  // Calculate pagination info
  const totalPages = stockData ? Math.ceil(stockData.count / pageSize) : 0;
  
  // Handle Add Stock form submission
  const handleAddStock = async () => {
    if (!selectedVehicleId || !stockQuantity) {
      toast.error('Please select a vehicle model and enter quantity');
      return;
    }
    
    const quantity = parseInt(stockQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }
    
    const vehicleId = parseInt(selectedVehicleId);
    if (isNaN(vehicleId)) {
      toast.error('Invalid vehicle selected');
      return;
    }
    
    try {
      const result = await updateStockByVehicleId({
        vehicleId,
        totalQuantity: quantity,
      }).unwrap();
      
      toast.success(`Stock updated successfully! ${result.vehicle_name} now has ${result.total_quantity} units`);
      
      // Reset form
      setSelectedVehicleId('');
      setStockQuantity('');
      
      // Close dialog
      setIsAdjustmentDialogOpen(false);
      
      // Refetch stock list to show updated data
      refetchStockList();
    } catch (error: unknown) {
      console.error('Error updating stock:', error);
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status?: number; data?: { error?: string; detail?: string } };
        if (apiError.status === 404) {
          toast.error('Vehicle not found');
        } else if (apiError.status === 403) {
          toast.error('Only admin users can perform this action');
        } else if (apiError.data?.error) {
          toast.error(apiError.data.error);
        } else if (apiError.data?.detail) {
          toast.error(apiError.data.detail);
        } else {
          toast.error('Failed to update stock. Please try again.');
        }
      } else {
        toast.error('Failed to update stock. Please try again.');
      }
    }
  };
  
  // Handle search
  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    setVehicleIdFilter('');
    setModelCodeFilter('');
    setVehicleNameFilter('');
    setMinAvailableFilter('');
    setMaxAvailableFilter('');
    setCurrentPage(1);
  };

  // Prepare stock trend data from API
  const stockTrendData = useMemo(() => {
    if (!stockData?.summary?.stock_trend) return [];
    return stockData.summary.stock_trend.map((item) => ({
      month: item.label,
      quantity: item.total_stock,
    }));
  }, [stockData]);

  // Get status for a stock item
  const getStockStatus = (available: number, total: number, thresholdPercent: number = 20): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (available === 0) return 'out_of_stock';
    const percentage = (available / total) * 100;
    if (percentage < thresholdPercent) return 'low_stock';
    return 'in_stock';
  };

  // Calculate stock level percentage (using a default max capacity)
  const getStockLevelPercentage = (quantity: number, maxCapacity: number = 100): number => {
    return Math.min((quantity / maxCapacity) * 100, 100);
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Stock Data</h3>
              <p className="text-muted-foreground mb-4">
                {error && 'status' in error ? `Error ${error.status}: ${JSON.stringify(error.data)}` : 'Failed to load stock data'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Level</h1>
          <p className="text-muted-foreground mt-1">Monitor inventory levels across warehouses</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button> */}
          <Dialog 
            open={isAdjustmentDialogOpen} 
            onOpenChange={(open) => {
              setIsAdjustmentDialogOpen(open);
              if (!open) {
                // Reset form when dialog closes
                setSelectedVehicleId('');
                setStockQuantity('');
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Stock Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
                <DialogDescription>Add stock to a specific vehicle model variant</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-select">Vehicle Model Variant</Label>
                  <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                    <SelectTrigger id="vehicle-select">
                      <SelectValue placeholder="Select vehicle model variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockData?.results && stockData.results.length > 0 ? (
                        stockData.results.map((stock) => (
                          <SelectItem key={stock.id} value={stock.vehicle.toString()}>
                            {formatVehicleVariantDisplay(stock)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>No models available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity-input">Total Quantity</Label>
                  <Input 
                    id="quantity-input"
                    type="number" 
                    placeholder="Enter total quantity" 
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the total stock quantity for this vehicle model variant. If stock doesn't exist, it will be created automatically.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdjustmentDialogOpen(false);
                    setSelectedVehicleId('');
                    setStockQuantity('');
                  }}
                  disabled={isUpdatingStock}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddStock}
                  disabled={isUpdatingStock}
                >
                  {isUpdatingStock ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Add Stock'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {stockData?.summary?.low_stock_items && stockData.summary.low_stock_items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>▲ Low Stock Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {stockData.summary.low_stock_items.map((item) => (
                    <div key={item.vehicle_id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{item.vehicle_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.vehicle_model_code} - {item.available_quantity} units (Reorder: {item.reorder_level})
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {item.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
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
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : stockTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quantity" 
                    stroke="hsl(221 83% 53%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(221 83% 53%)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stock Levels Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Stock Levels by Warehouse</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Search..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleSearch}>
                Search
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle ID</Label>
                  <Input
                    placeholder="Filter by vehicle ID"
                    value={vehicleIdFilter}
                    onChange={(e) => setVehicleIdFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model Code</Label>
                  <Input
                    placeholder="Filter by model code"
                    value={modelCodeFilter}
                    onChange={(e) => setModelCodeFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Name</Label>
                  <Input
                    placeholder="Filter by vehicle name"
                    value={vehicleNameFilter}
                    onChange={(e) => setVehicleNameFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Available</Label>
                  <Input
                    type="number"
                    placeholder="Minimum available"
                    value={minAvailableFilter}
                    onChange={(e) => setMinAvailableFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Available</Label>
                  <Input
                    type="number"
                    placeholder="Maximum available"
                    value={maxAvailableFilter}
                    onChange={(e) => setMaxAvailableFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setCurrentPage(1)}>
                  Apply Filters
                </Button>
                <Button size="sm" variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Model Code</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockData?.results && stockData.results.length > 0 ? (
                    stockData.results.map((stock) => {
                      const thresholdPercent = stockData.summary?.low_stock_threshold_percent || 20;
                      const status = getStockStatus(stock.available_quantity, stock.total_quantity, thresholdPercent);
                      
                      // Stock Level shows Available/Quantity
                      // Calculate stock level percentage based on available vs total quantity
                      const levelPercentage = stock.total_quantity > 0 
                        ? (stock.available_quantity / stock.total_quantity) * 100 
                        : 0;
                      
                        return (
                          <TableRow key={stock.id}>
                            <TableCell>
                              <span className="font-medium text-foreground">{stock.vehicle_name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{stock.vehicle_model_code}</span>
                            </TableCell>
                            <TableCell>
                              {stock.vehicle_colors && stock.vehicle_colors.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {stock.vehicle_colors.map((color, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {color}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {stock.battery_variants && stock.battery_variants.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {stock.battery_variants.map((battery, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {battery}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-foreground">{stock.total_quantity}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-warning">{stock.reserved_quantity}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-success">{stock.available_quantity}</span>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {stock.available_quantity}/{stock.total_quantity}
                                  </span>
                                  <span className="text-xs font-medium">{levelPercentage.toFixed(0)}%</span>
                                </div>
                                <Progress
                                  value={levelPercentage}
                                  className={`h-2 ${
                                    levelPercentage < 20
                                      ? '[&>div]:bg-destructive'
                                      : levelPercentage < 50
                                      ? '[&>div]:bg-warning'
                                      : '[&>div]:bg-success'
                                  }`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(stock.updated_at)}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No stock data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {stockData && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, stockData.count)} of {stockData.count} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
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
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Stock Movements - Note: This section would need a separate API endpoint for stock movements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Stock movements data will be available when the movements API endpoint is implemented.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

