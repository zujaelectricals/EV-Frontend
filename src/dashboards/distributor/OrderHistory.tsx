import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, Truck, CheckCircle, Clock, XCircle, Eye, CreditCard, Filter, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateBooking, setBookings, Booking, PaymentMethod } from '@/app/slices/bookingSlice';
import { PaymentGateway } from '@/store/components/PaymentGateway';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useGetBookingsQuery, useCancelBookingMutation } from '@/app/api/bookingApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { api } from '@/app/api/baseApi';

type BookingStatus = 'pre-booked' | 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue' | 'refunded';

export function OrderHistory() {
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.booking);
  const { user } = useAppSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancelBooking, { isLoading: isCancellingBooking }] = useCancelBookingMutation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  // Map API status to query parameter
  const getApiStatus = (localStatus: string): string | undefined => {
    const statusMap: Record<string, string> = {
      "all": "",
      "pending": "pending",
      "pre-booked": "pending",
      "active": "active",
      "confirmed": "active",
      "completed": "completed",
      "delivered": "completed",
      "cancelled": "cancelled",
      "expired": "expired",
    };
    return statusMap[localStatus] || undefined;
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  // Get bookings with status filter - uses RTK Query caching
  const apiStatus = statusFilter === 'all' ? undefined : getApiStatus(statusFilter);
  const queryParams = useMemo(() => {
    const params: { status?: string; search?: string } = {};
    if (apiStatus) params.status = apiStatus;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return Object.keys(params).length > 0 ? params : undefined;
  }, [apiStatus, searchQuery]);

  const { 
    data: bookingsData, 
    isLoading: isLoadingBookings, 
    error: bookingsError, 
    refetch,
    isFetching,
    currentData
  } = useGetBookingsQuery(
    queryParams,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
      refetchOnReconnect: true,
    }
  );

  // Use currentData if available, otherwise fallback to data
  const activeBookingsData = currentData ?? bookingsData;

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      const status = apiStatus || 'all';
      dispatch(
        api.util.invalidateTags([
          { type: 'Booking', id: 'LIST' },
          { type: 'Booking', id: `LIST-${status}` },
        ])
      );
      
      const result = await refetch();
      if (result.data) {
        setRefreshKey(prev => prev + 1);
        toast.success("Orders refreshed successfully");
      } else if (result.error) {
        toast.error("Failed to refresh orders");
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast.error("Failed to refresh orders");
    }
  };

  // Map API bookings to local booking format
  const mappedBookings: Booking[] = useMemo(() => {
    if (!activeBookingsData?.results) return [];
    
    return activeBookingsData.results.map((apiBooking): Booking => {
      // Map API status to display status
      let displayStatus: Booking['status'] = 'pending';
      if (apiBooking.status === 'pending') {
        displayStatus = 'pre-booked';
      } else if (apiBooking.status === 'active') {
        displayStatus = 'confirmed';
      } else if (apiBooking.status === 'confirmed') {
        displayStatus = 'confirmed';
      } else if (apiBooking.status === 'delivered') {
        displayStatus = 'delivered';
      } else if (apiBooking.status === 'cancelled') {
        displayStatus = 'cancelled';
      } else if (apiBooking.status === 'refunded') {
        displayStatus = 'refunded';
      }
      
      return {
        id: apiBooking.id.toString(),
        vehicleId: `vehicle-${apiBooking.vehicle_details.name?.toLowerCase().replace(/\s+/g, '-') || 'vehicle'}-${apiBooking.vehicle_model}`,
        vehicleName: apiBooking.vehicle_details.name,
        modelCode: apiBooking.model_code,
        status: displayStatus,
        preBookingAmount: parseFloat(apiBooking.booking_amount) || 0,
        totalAmount: parseFloat(apiBooking.total_amount) || 0,
        remainingAmount: parseFloat(apiBooking.remaining_amount) || 0,
        totalPaid: parseFloat(apiBooking.total_paid) || 0,
        paymentMethod: (apiBooking.payment_option === 'full_payment' ? 'full' : 
                      apiBooking.payment_option === 'emi' ? 'emi' : 'flexible') as PaymentMethod,
        paymentDueDate: apiBooking.expires_at,
        paymentStatus: (parseFloat(apiBooking.remaining_amount) === 0 ? 'completed' : 
                      parseFloat(apiBooking.total_paid) > 0 ? 'partial' : 'pending') as Booking['paymentStatus'],
        isActiveBuyer: true,
        redemptionPoints: 0,
        redemptionEligible: false,
        bookedAt: apiBooking.created_at,
        referredBy: apiBooking.referred_by?.fullname || apiBooking.referred_by?.email || undefined,
        addedToTeamNetwork: false,
        bookingNumber: apiBooking.booking_number,
        vehicleColor: apiBooking.vehicle_color,
        batteryVariant: apiBooking.battery_variant,
      };
    });
  }, [activeBookingsData, refreshKey]);

  // Update Redux store when bookings data changes
  useEffect(() => {
    if (mappedBookings.length > 0 || activeBookingsData) {
      dispatch(setBookings(mappedBookings));
    }
  }, [mappedBookings, dispatch, activeBookingsData]);

  // Always use API data when available
  const displayBookings = useMemo(() => {
    const source = activeBookingsData !== undefined ? mappedBookings : bookings;
    // Remove duplicates by ID
    const seen = new Set<string>();
    return source.filter((booking) => {
      if (seen.has(booking.id)) {
        return false;
      }
      seen.add(booking.id);
      return true;
    });
  }, [mappedBookings, bookings, activeBookingsData]);

  // Filter bookings - search is handled by API, so we just use displayBookings
  const filteredBookings = displayBookings;

  // Get pending payments count
  const pendingPayments = displayBookings.filter(
    (b) => b.paymentStatus === 'pending' || b.paymentStatus === 'partial' || b.paymentStatus === 'overdue'
  ).length;

  // Get total pending amount
  const totalPendingAmount = displayBookings
    .filter((b) => b.paymentStatus === 'pending' || b.paymentStatus === 'partial' || b.paymentStatus === 'overdue')
    .reduce((sum, b) => sum + b.remainingAmount, 0);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-success/10 text-success border-success/30';
      case 'confirmed':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'pre-booked':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'cancelled':
      case 'refunded':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'partial':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-destructive/10 text-destructive';
      case 'pending':
        return 'bg-muted/10 text-muted-foreground';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pre-booked':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleCompletePayment = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (selectedBooking) {
      const booking = displayBookings.find((b) => b.id === selectedBooking);
      if (booking) {
        dispatch(updateBooking({
          id: selectedBooking,
          updates: {
            paymentStatus: 'completed',
            status: booking.status === 'pre-booked' ? 'confirmed' : booking.status,
            remainingAmount: 0,
          },
        }));
        toast.success('Payment completed successfully!');
      }
    }
    setShowPaymentModal(false);
    setSelectedBooking(null);
    
    // Refetch bookings to get updated data from server
    await refetch();
  };

  const handleCancelBookingClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelDialog(true);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) {
      toast.error("Booking ID is required");
      setShowCancelDialog(false);
      return;
    }

    try {
      const result = await cancelBooking(parseInt(bookingToCancel, 10)).unwrap();
      
      toast.success("Booking cancelled successfully");
      
      // Refresh bookings to get updated data
      await refetch();
      
      console.log("✅ [CANCEL BOOKING] Booking cancelled successfully:", result);
      
      // Close dialog and reset state
      setShowCancelDialog(false);
      setBookingToCancel(null);
    } catch (error: any) {
      console.error("❌ [CANCEL BOOKING] Error cancelling booking:", error);
      const errorMessage = error?.data?.message || error?.data?.detail || error?.message || "Failed to cancel booking. Please try again.";
      toast.error(errorMessage);
      // Keep dialog open on error so user can retry
    }
  };

  // Check if booking can be cancelled
  const canCancelBooking = (booking: Booking) => {
    // Don't allow cancellation if already cancelled, delivered, or expired
    return booking.status !== "cancelled" && 
           booking.status !== "delivered" && 
           booking.status !== "expired" &&
           booking.status !== "refunded";
  };

  const selectedBookingData = selectedBooking ? displayBookings.find((b) => b.id === selectedBooking) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Order History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your orders, track payments, and view order details
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingBookings ? '...' : (activeBookingsData?.count ?? displayBookings.length)}
            </div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {isLoadingBookings ? '...' : pendingPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{isLoadingBookings ? '...' : totalPendingAmount.toLocaleString()} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoadingBookings ? '...' : displayBookings.filter((b) => b.status === 'delivered' || b.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingBookings || isFetching}
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(isLoadingBookings || isFetching) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by vehicle or order ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isLoadingBookings || isFetching}
                  className="shrink-0 bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] text-white border-0 hover:opacity-90 shadow-md shadow-emerald-500/25"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            <div className="space-y-2 min-w-[180px]">
              <label className="text-sm font-medium">Booking Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchInput('');
                  setSearchQuery('');
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {isLoadingBookings ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner text="Loading orders..." size="md" />
          </CardContent>
        </Card>
      ) : bookingsError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error loading orders</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Failed to load your orders. Please try again.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {displayBookings.length === 0
                ? "You haven't placed any orders yet. Start browsing vehicles to make your first order!"
                : 'No orders match your current filters. Try adjusting your search criteria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Results Count */}
          {activeBookingsData?.count !== undefined && (
            <div className="text-sm text-muted-foreground mb-2">
              Showing {filteredBookings.length} of {activeBookingsData.count} orders
              {activeBookingsData.total_pages && activeBookingsData.total_pages > 1 && (
                <span className="ml-2">
                  (Page {activeBookingsData.current_page || 1} of {activeBookingsData.total_pages})
                </span>
              )}
            </div>
          )}
          
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">{booking.vehicleName}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status.replace('-', ' ')}</span>
                            </Badge>
                            <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Order ID: {booking.id}
                            {booking.bookingNumber && ` • Booking #${booking.bookingNumber}`}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-semibold text-foreground">₹{booking.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pre-booking</p>
                          <p className="font-semibold text-foreground">₹{booking.preBookingAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className={`font-semibold ${booking.remainingAmount > 0 ? 'text-warning' : 'text-success'}`}>
                            ₹{booking.remainingAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Booked On</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(booking.bookedAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      {booking.paymentDueDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Payment Due:</span>
                          <span className={`font-medium ${
                            new Date(booking.paymentDueDate) < new Date() && booking.paymentStatus !== 'completed'
                              ? 'text-destructive'
                              : 'text-foreground'
                          }`}>
                            {format(new Date(booking.paymentDueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}

                      {booking.emiPlan && (
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">EMI Plan:</span>
                          <span className="font-medium text-foreground">
                            {booking.emiPlan.months} months @ ₹{booking.emiPlan.monthlyAmount.toLocaleString()}/month
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:w-auto w-full">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedBooking(booking.id);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {canCancelBooking(booking) && (
                        <Button
                          variant="outline"
                          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleCancelBookingClick(booking.id)}
                          disabled={isCancellingBooking}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {isCancellingBooking ? "Cancelling..." : "Cancel Booking"}
                        </Button>
                      )}
                      {(booking.paymentStatus === 'pending' || 
                        booking.paymentStatus === 'partial' || 
                        booking.paymentStatus === 'overdue') && (
                        <Button
                          className="w-full"
                          onClick={() => handleCompletePayment(booking.id)}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Complete Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBookingData && (
        <PaymentGateway
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBooking(null);
          }}
          amount={selectedBookingData.remainingAmount}
          onSuccess={handlePaymentSuccess}
          vehicleName={selectedBookingData.vehicleName}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBookingData && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>Complete information about your order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold">{selectedBookingData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-semibold">{selectedBookingData.vehicleName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedBookingData.status)}>
                    {selectedBookingData.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge className={getPaymentStatusColor(selectedBookingData.paymentStatus)}>
                    {selectedBookingData.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">₹{selectedBookingData.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pre-booking Amount</p>
                  <p className="font-semibold">₹{selectedBookingData.preBookingAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Amount</p>
                  <p className="font-semibold">₹{selectedBookingData.remainingAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-semibold capitalize">{selectedBookingData.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booked On</p>
                  <p className="font-semibold">
                    {format(new Date(selectedBookingData.bookedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                {selectedBookingData.paymentDueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Due Date</p>
                    <p className="font-semibold">
                      {format(new Date(selectedBookingData.paymentDueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {selectedBookingData.emiPlan && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">EMI Tenure</p>
                      <p className="font-semibold">{selectedBookingData.emiPlan.months} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly EMI</p>
                      <p className="font-semibold">₹{selectedBookingData.emiPlan.monthlyAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">{selectedBookingData.emiPlan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total with Interest</p>
                      <p className="font-semibold">₹{selectedBookingData.emiPlan.totalAmount.toLocaleString()}</p>
                    </div>
                  </>
                )}
                {selectedBookingData.referredBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Referred By</p>
                    <p className="font-semibold">{selectedBookingData.referredBy}</p>
                  </div>
                )}
                {selectedBookingData.referralBonus && (
                  <div>
                    <p className="text-sm text-muted-foreground">Referral Bonus</p>
                    <p className="font-semibold">₹{selectedBookingData.referralBonus.toLocaleString()}</p>
                  </div>
                )}
                {selectedBookingData.redemptionPoints > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Redemption Points</p>
                    <p className="font-semibold">{selectedBookingData.redemptionPoints.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">Cancel Booking</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <p className="text-base text-foreground">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Important Warnings:
                  </p>
                  <ul className="text-sm text-foreground space-y-1.5 list-disc list-inside ml-2">
                    <li>This action cannot be undone</li>
                    <li>Your booking will be permanently cancelled</li>
                    <li>Any paid amounts will be processed for refund as per our refund policy</li>
                    <li>You will lose your reservation for this vehicle</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you proceed, your booking will be cancelled immediately and you will need to create a new booking if you wish to purchase this vehicle in the future.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel 
              onClick={() => {
                setShowCancelDialog(false);
                setBookingToCancel(null);
              }}
              disabled={isCancellingBooking}
            >
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isCancellingBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancellingBooking ? "Cancelling..." : "Yes, Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

