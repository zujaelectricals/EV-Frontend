import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, Truck, CheckCircle, Clock, XCircle, Eye, CreditCard, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateBooking } from '@/app/slices/bookingSlice';
import { PaymentGateway } from '@/store/components/PaymentGateway';
import { toast } from 'sonner';
import { format } from 'date-fns';

type BookingStatus = 'pre-booked' | 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'refunded';
type PaymentStatus = 'pending' | 'partial' | 'completed' | 'overdue' | 'refunded';

export function OrderHistory() {
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.booking);
  const { user } = useAppSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    const matchesSearch = 
      booking.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPayment && matchesSearch;
  });

  // Get pending payments count
  const pendingPayments = bookings.filter(
    (b) => b.paymentStatus === 'pending' || b.paymentStatus === 'partial' || b.paymentStatus === 'overdue'
  ).length;

  // Get total pending amount
  const totalPendingAmount = bookings
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

  const handlePaymentSuccess = () => {
    if (selectedBooking) {
      const booking = bookings.find((b) => b.id === selectedBooking);
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
  };

  const selectedBookingData = selectedBooking ? bookings.find((b) => b.id === selectedBooking) : null;

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
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalPendingAmount.toLocaleString()} pending
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
              {bookings.filter((b) => b.status === 'delivered' || b.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by vehicle or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pre-booked">Pre-booked</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStatusFilter('all');
                  setPaymentFilter('all');
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
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {bookings.length === 0
                ? "You haven't placed any orders yet. Start browsing vehicles to make your first order!"
                : 'No orders match your current filters. Try adjusting your search criteria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
                          <p className="text-sm text-muted-foreground mt-1">Order ID: {booking.id}</p>
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
    </div>
  );
}

