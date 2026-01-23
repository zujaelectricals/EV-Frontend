import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, CheckCircle, XCircle, Search, Filter, Download, ChevronLeft, ChevronRight, X, User, Mail, Phone, Car, MapPin, CreditCard, FileText, Eye, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGetAdminDashboardQuery } from '@/app/api/reportsApi';
import { useGetBookingsQuery, useGetBookingDetailQuery, useUpdateBookingStatusMutation } from '@/app/api/bookingApi';
import { useToast } from '@/hooks/use-toast';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
    case 'active':
      return <Badge className="bg-success text-white">Confirmed</Badge>;
    case 'pending':
      return <Badge variant="default">Pending</Badge>;
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    case 'completed':
      return <Badge className="bg-info text-white">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const PreBookings = () => {
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetAdminDashboardQuery();
  
  // State for pagination and filtering
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchInput, setSearchInput] = useState(''); // Input field value
  const [searchQuery, setSearchQuery] = useState(''); // Actual search query sent to API
  
  // State for viewing booking details
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // State for status update dialog
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Toast hook
  const { toast } = useToast();
  
  // Status update mutation
  const [updateBookingStatus, { isLoading: isUpdatingStatus }] = useUpdateBookingStatusMutation();

  // Map status filter to API status
  const apiStatus = statusFilter === 'all' ? undefined : statusFilter;

  // Prepare query parameters - ensure it updates when searchQuery changes
  const queryParams = React.useMemo(() => {
    const params: { page: number; page_size: number; status?: string; search?: string } = {
      page,
      page_size: pageSize,
    };
    if (apiStatus) params.status = apiStatus;
    // Only include search if it's not empty
    if (searchQuery && searchQuery.trim() !== '') {
      params.search = searchQuery.trim();
    }
    
    console.log('📤 [PreBookings] API Query Params (Memo):', params, {
      searchQuery,
      page,
      apiStatus,
      timestamp: new Date().toISOString(),
    });
    return params;
  }, [page, pageSize, apiStatus, searchQuery]);

  // Fetch bookings with pagination and filtering
  const { 
    data: bookingsData, 
    isLoading: isLoadingBookings, 
    isError: isErrorBookings,
    refetch: refetchBookings,
    isFetching: isFetchingBookings
  } = useGetBookingsQuery(queryParams, {
    // Force refetch when search query changes
    refetchOnMountOrArgChange: true,
    // Skip cache when search query changes
    skip: false,
  });

  // Fetch booking details when a booking is selected
  const { 
    data: bookingDetails, 
    isLoading: isLoadingBookingDetails,
    isError: isErrorBookingDetails 
  } = useGetBookingDetailQuery(selectedBookingId!, {
    skip: !selectedBookingId,
  });

  // Log when query params change
  React.useEffect(() => {
    console.log('🔄 [PreBookings] Query params changed, triggering refetch:', queryParams);
  }, [queryParams]);

  // Console log the bookings API response
  React.useEffect(() => {
    if (bookingsData) {
      console.log('=== PreBookings: Bookings API Response ===');
      console.log('Full bookings response:', bookingsData);
      console.log('Count:', bookingsData.count);
      console.log('Results count:', bookingsData.results?.length || 0);
      console.log('Results:', bookingsData.results);
      console.log('Next:', bookingsData.next);
      console.log('Previous:', bookingsData.previous);
      console.log('Current search query:', searchQuery);
      console.log('Current status filter:', statusFilter);
    }
  }, [bookingsData, searchQuery, statusFilter]);

  // Console log the dashboard API response for debugging
  React.useEffect(() => {
    if (dashboardData) {
      console.log('=== PreBookings: Full Admin Dashboard API Response ===');
      console.log('Full response:', dashboardData);
      console.log('Pre Bookings:', dashboardData.pre_bookings);
    }
  }, [dashboardData]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  // Calculate total pages
  const totalPages = bookingsData ? Math.ceil(bookingsData.count / pageSize) : 0;

  // Handle search button click
  const handleSearch = () => {
    const trimmedQuery = searchInput.trim();
    console.log('🔍 [PreBookings] Search button clicked:', {
      searchInput,
      trimmedQuery,
      currentSearchQuery: searchQuery,
      willTriggerAPI: trimmedQuery !== searchQuery,
    });
    
    // Update search query - this will trigger the query to refetch
    setSearchQuery(trimmedQuery);
    setPage(1); // Reset to first page when searching
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    console.log('🧹 [PreBookings] Clearing all filters');
    setSearchInput('');
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  // Handle view booking click
  const handleViewBooking = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsViewDialogOpen(true);
  };

  // Handle edit status click
  const handleEditStatus = (bookingId: number, currentStatus: string) => {
    setEditingBookingId(bookingId);
    setSelectedStatus(''); // Reset to empty, user will select new status
    setIsStatusDialogOpen(true);
  };
  
  // Get current booking status for the editing booking
  const getCurrentBookingStatus = (): string => {
    if (!editingBookingId) return '';
    const booking = filteredBookings.find(b => b.id === editingBookingId);
    return booking?.status || '';
  };

  // Get available status options based on current status
  const getAvailableStatuses = (currentStatus: string): string[] => {
    const statusTransitions: Record<string, string[]> = {
      pending: ['active', 'cancelled', 'expired'],
      active: ['completed', 'cancelled'],
      completed: ['delivered', 'cancelled'],
      delivered: [], // Cannot be changed
      cancelled: [], // Cannot be changed
      expired: [], // Cannot be changed
    };
    return statusTransitions[currentStatus] || [];
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!editingBookingId || !selectedStatus) return;

    try {
      await updateBookingStatus({
        bookingId: editingBookingId,
        status: selectedStatus,
      }).unwrap();

      toast({
        title: 'Status Updated',
        description: `Booking status has been updated to ${selectedStatus}.`,
      });

      // Refresh bookings list
      refetchBookings();
      
      // Close dialog
      setIsStatusDialogOpen(false);
      setEditingBookingId(null);
      setSelectedStatus('');
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: error?.data?.message || error?.data?.error || 'Failed to update booking status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  // Use server-side filtered results directly (no client-side filtering needed)
  const filteredBookings = React.useMemo(() => {
    const results = bookingsData?.results || [];
    console.log('📊 [PreBookings] Filtered bookings calculation:', {
      searchQuery,
      statusFilter,
      hasBookingsData: !!bookingsData,
      resultsCount: results.length,
      bookingsDataCount: bookingsData?.count,
      isLoading: isLoadingBookings,
      isFetching: isFetchingBookings,
      sampleResults: results.slice(0, 3).map(b => ({ 
        id: b.id, 
        booking_number: b.booking_number, 
        user_email: b.user_email 
      })),
    });
    return results;
  }, [bookingsData, searchQuery, statusFilter, isLoadingBookings, isFetchingBookings]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pre-Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage and track all pre-booking orders</p>
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
        {isLoadingDashboard ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : dashboardData?.pre_bookings ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Pre-Bookings</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {dashboardData.pre_bookings.kpi_cards.total_pre_bookings.toLocaleString()}
                      </p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-primary opacity-20" />
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
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold text-warning mt-1">
                        {dashboardData.pre_bookings.kpi_cards.pending.toLocaleString()}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-warning opacity-20" />
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
                      <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                      <p className="text-3xl font-bold text-success mt-1">
                        {dashboardData.pre_bookings.kpi_cards.confirmed.toLocaleString()}
                      </p>
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
                      <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        ₹{(dashboardData.pre_bookings.kpi_cards.total_amount / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-info opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </div>

      {/* Pre-Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Pre-Bookings</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Search by booking number, email, mobile, vehicle..." 
                  className="w-64" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
                <Button 
                  onClick={handleSearch}
                  size="sm"
                  disabled={isLoadingBookings}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllFilters}
                  disabled={isLoadingBookings}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table key={`bookings-${searchQuery}-${statusFilter}-${page}`}>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingBookings ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : isErrorBookings ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-destructive">
                    Error loading bookings. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No bookings found matching your search' : 'No bookings found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.booking_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{booking.user_email}</p>
                        <p className="text-xs text-muted-foreground">{booking.user_mobile}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-sm font-medium">{booking.vehicle_details?.name || 'N/A'}</span>
                        <p className="text-xs text-muted-foreground">{booking.model_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-foreground">₹{parseFloat(booking.booking_amount).toLocaleString('en-IN')}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(booking.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(booking.expires_at)}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewBooking(booking.id)}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditStatus(booking.id, booking.status)}
                          className="h-8 w-8 p-0"
                          disabled={booking.status === 'delivered' || booking.status === 'cancelled' || booking.status === 'expired'}
                          title="Edit Status"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination */}
        {bookingsData && bookingsData.count > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, bookingsData.count)} of {bookingsData.count} bookings
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!bookingsData.previous || isLoadingBookings}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      disabled={isLoadingBookings}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!bookingsData.next || isLoadingBookings}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Page Size Selector */}
        {bookingsData && bookingsData.count > 0 && (
          <div className="flex items-center justify-end gap-2 px-6 py-3 border-t bg-muted/30">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1); // Reset to first page when changing page size
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
          </div>
        )}
      </Card>

      {/* Booking Details Dialog */}
      <Dialog 
        open={isViewDialogOpen} 
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setSelectedBookingId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {bookingDetails ? `Complete information for booking ${bookingDetails.booking_number}` : 'Loading booking details...'}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingBookingDetails ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : isErrorBookingDetails ? (
            <div className="text-center py-8 text-destructive">
              Error loading booking details. Please try again.
            </div>
          ) : bookingDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Booking ID</Label>
                      <p className="font-medium text-lg">{bookingDetails.booking_number}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Booking Status</Label>
                      <div className="mt-1">{getStatusBadge(bookingDetails.status)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Reservation Status</Label>
                      <p className="font-medium capitalize">{bookingDetails.reservation_status || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Payment Option</Label>
                      <p className="font-medium capitalize">{bookingDetails.payment_option?.replace('_', ' ') || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email
                      </Label>
                      <p className="font-medium">{bookingDetails.user_email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        Mobile
                      </Label>
                      <p className="font-medium">{bookingDetails.user_mobile}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">User ID</Label>
                      <p className="font-medium">U{bookingDetails.user}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">IP Address</Label>
                      <p className="font-medium">{bookingDetails.ip_address || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Vehicle Name</Label>
                      <p className="font-medium">{bookingDetails.vehicle_details?.name || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Model Code</Label>
                      <p className="font-medium">{bookingDetails.model_code}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vehicle Color</Label>
                      <p className="font-medium capitalize">{bookingDetails.vehicle_color || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Battery Variant</Label>
                      <p className="font-medium">{bookingDetails.battery_variant || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vehicle Model ID</Label>
                      <p className="font-medium">{bookingDetails.vehicle_model}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vehicle Price</Label>
                      <p className="font-medium text-lg">₹{parseFloat(bookingDetails.vehicle_details?.price || bookingDetails.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Booking Amount</Label>
                      <p className="font-medium text-lg text-primary">₹{parseFloat(bookingDetails.booking_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Amount</Label>
                      <p className="font-medium text-lg">₹{parseFloat(bookingDetails.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Paid</Label>
                      <p className="font-medium text-lg text-success">₹{parseFloat(bookingDetails.total_paid).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Remaining Amount</Label>
                      <p className="font-medium text-lg text-warning">₹{parseFloat(bookingDetails.remaining_amount).toLocaleString('en-IN')}</p>
                    </div>
                    {bookingDetails.payment_gateway_ref && (
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Payment Gateway Reference</Label>
                        <p className="font-medium">{bookingDetails.payment_gateway_ref}</p>
                      </div>
                    )}
                    {bookingDetails.emi_amount && (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground">EMI Amount</Label>
                          <p className="font-medium">₹{parseFloat(bookingDetails.emi_amount).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">EMI Duration</Label>
                          <p className="font-medium">{bookingDetails.emi_duration_months} months</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">EMI Start Date</Label>
                          <p className="font-medium">{formatDateTime(bookingDetails.emi_start_date)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">EMI Progress</Label>
                          <p className="font-medium">{bookingDetails.emi_paid_count} / {bookingDetails.emi_total_count} payments</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">City</Label>
                      <p className="font-medium">{bookingDetails.delivery_city || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">State</Label>
                      <p className="font-medium">{bookingDetails.delivery_state || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">PIN Code</Label>
                      <p className="font-medium">{bookingDetails.delivery_pin || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog 
        open={isStatusDialogOpen} 
        onOpenChange={(open) => {
          setIsStatusDialogOpen(open);
          if (!open) {
            setEditingBookingId(null);
            setSelectedStatus('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Select the new status for this booking. Status transitions are validated based on the current status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {editingBookingId && (() => {
              const currentStatus = getCurrentBookingStatus();
              const availableStatuses = getAvailableStatuses(currentStatus);
              
              return (
                <>
                  <div>
                    <Label className="text-sm font-medium">Current Status</Label>
                    <div className="mt-2">
                      {getStatusBadge(currentStatus)}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="status-select" className="text-sm font-medium">
                      New Status
                    </Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger id="status-select" className="mt-2">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.length > 0 ? (
                          availableStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No valid transitions available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {availableStatuses.length > 0 ? (
                      <p className="text-xs text-muted-foreground mt-2">
                        Valid transitions: {availableStatuses.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-destructive mt-2">
                        This status cannot be changed (final status).
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsStatusDialogOpen(false);
                setEditingBookingId(null);
                setSelectedStatus('');
              }}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus || !selectedStatus || selectedStatus === getCurrentBookingStatus()}
            >
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

