import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Package,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  Battery,
  Gauge,
  Zap,
  FileText,
  Mail,
  Phone,
  MapPin,
  Hash,
} from "lucide-react";
import { Booking } from "@/app/slices/bookingSlice";
import { scooters } from "@/store/data/scooters";
import { format } from "date-fns";
import { useGetBookingDetailQuery } from "@/app/api/bookingApi";
import { BookingResponse } from "@/app/api/bookingApi";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  bookingId?: number | null;
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  booking,
  bookingId,
}: OrderDetailsDialogProps) {
  // Fetch detailed booking information from API if bookingId is provided
  const { data: bookingDetail, isLoading: isLoadingDetail, error: detailError } = useGetBookingDetailQuery(
    bookingId || 0,
    { skip: !bookingId || !open }
  );

  // Use API data if available, otherwise fallback to booking prop
  const detailedBooking: BookingResponse | null = bookingDetail || null;

  const vehicleDetails = useMemo(() => {
    // For now, only map to the local scooter catalogue when we have a basic booking.
    // The detailed API response is handled directly via `detailedBooking` elsewhere.
    if (booking) {
      return scooters.find((s) => s.id === booking.vehicleId) || null;
    }
    return null;
  }, [booking]);

  // Calculate overdue status based on expires_at
  const isOverdue = useMemo(() => {
    const dueDate = detailedBooking?.expires_at || booking?.paymentDueDate;
    if (!dueDate) return false;
    const expiryDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const remainingAmount = detailedBooking 
      ? parseFloat(detailedBooking.remaining_amount || '0')
      : booking?.remainingAmount || 0;
    return today > expiryDate && remainingAmount > 0;
  }, [detailedBooking, booking]);

  const daysOverdue = useMemo(() => {
    if (!isOverdue) return 0;
    const dueDate = detailedBooking?.expires_at || booking?.paymentDueDate;
    if (!dueDate) return 0;
    const expiryDate = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - expiryDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [isOverdue, detailedBooking, booking]);

  const lateFeeAmount = useMemo(() => {
    if (!isOverdue) return 0;
    const remainingAmount = detailedBooking 
      ? parseFloat(detailedBooking.remaining_amount || '0')
      : booking?.remainingAmount || 0;
    // Calculate late fee: 2% of remaining amount per week overdue, minimum ₹500
    const weeksOverdue = Math.ceil(daysOverdue / 7);
    const lateFee = (remainingAmount * 0.02 * weeksOverdue);
    return Math.max(lateFee, 500);
  }, [isOverdue, detailedBooking, booking, daysOverdue]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-success/10 text-success border-success/30";
      case "active":
      case "confirmed":
        return "bg-primary/10 text-primary border-primary/30";
      case "pending":
      case "pre-booked":
        return "bg-warning/10 text-warning border-warning/30";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "expired":
        return "bg-muted/10 text-muted-foreground border-border";
      default:
        return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  // Show loading state
  if (bookingId && isLoadingDetail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Order Details</DialogTitle>
            <DialogDescription className="text-sm">Loading booking information...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8 sm:py-12">
            <LoadingSpinner size="md" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (bookingId && detailError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Order Details</DialogTitle>
            <DialogDescription className="text-sm">Failed to load booking information</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
            <p>Unable to load booking details. Please try again later.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Use detailed booking data or fallback to booking prop
  const displayBooking = detailedBooking || booking;
  if (!displayBooking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Order Details</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Complete information about your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Product Details Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div>
                <Link
                  to={detailedBooking 
                    ? `/scooters/vehicle-${detailedBooking.vehicle_details.name?.toLowerCase().replace(/\s+/g, '-') || 'vehicle'}-${detailedBooking.vehicle_details.id}`
                    : booking?.vehicleId ? `/scooters/${booking.vehicleId}` : '#'}
                  className="text-base sm:text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer inline-block break-words"
                >
                  {detailedBooking?.vehicle_details.name || booking?.vehicleName || 'Unknown Vehicle'}
                </Link>
                {vehicleDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    {detailedBooking ? (
                      <>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Model Code</p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {detailedBooking.model_code}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Color</p>
                            <p className="text-xs sm:text-sm font-medium capitalize truncate">
                              {detailedBooking.vehicle_color}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Battery className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Battery</p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {detailedBooking.battery_variant}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Price</p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              ₹{parseFloat(detailedBooking.vehicle_details.price || '0').toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Battery className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Range</p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {vehicleDetails.range}+ km
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              Top Speed
                            </p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {vehicleDetails.topSpeed} km/h
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Battery</p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {vehicleDetails.batteryVoltage ||
                                vehicleDetails.batteryCapacity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              Charging
                            </p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {vehicleDetails.chargingTime || "4-5h"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Purchase Order Details Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                Purchase Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Order ID
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-foreground break-words">
                    {detailedBooking?.id || booking?.id}
                  </p>
                </div>
                {detailedBooking?.booking_number && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Booking Number
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground break-words font-mono">
                      {detailedBooking.booking_number}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={`${getStatusColor(detailedBooking?.status || booking?.status || '')} text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1`}>
                    {(detailedBooking?.status || booking?.status || '').replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Payment Status
                  </p>
                  <Badge className={`${getStatusColor(detailedBooking?.payment_status || booking?.paymentStatus || '')} text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1`}>
                    {(detailedBooking?.payment_status || booking?.paymentStatus || '').replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Reservation Status
                  </p>
                  <Badge className={`${getStatusColor(detailedBooking?.reservation_status || '')} text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1`}>
                    {detailedBooking?.reservation_status?.replace(/_/g, " ").toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Order Date
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {detailedBooking?.created_at 
                      ? format(new Date(detailedBooking.created_at), "dd MMM yyyy HH:mm")
                      : booking?.bookedAt 
                        ? format(new Date(booking.bookedAt), "dd MMM yyyy")
                        : 'N/A'}
                  </p>
                </div>
                {detailedBooking?.confirmed_at && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Confirmed At
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {format(new Date(detailedBooking.confirmed_at), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Payment Option
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-foreground capitalize">
                    {detailedBooking?.payment_option?.replace(/_/g, " ") || booking?.paymentMethod || 'N/A'}
                  </p>
                </div>
                {detailedBooking?.emi_duration_months && (
                  <>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        EMI Duration
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        {detailedBooking.emi_duration_months} months
                      </p>
                    </div>
                    {detailedBooking.emi_amount && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                          EMI Amount
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-foreground">
                          ₹{parseFloat(detailedBooking.emi_amount).toLocaleString()}/month
                        </p>
                      </div>
                    )}
                    {detailedBooking.emi_start_date && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                          EMI Start Date
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-foreground">
                          {format(new Date(detailedBooking.emi_start_date), "dd MMM yyyy")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        EMI Progress
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-foreground">
                        {detailedBooking.emi_paid_count} / {detailedBooking.emi_total_count} payments
                      </p>
                    </div>
                  </>
                )}
                {detailedBooking?.referred_by && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Referred By
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground break-words">
                      {/* referred_by is an object { id, fullname, email } - render a readable string */}
                      {detailedBooking.referred_by.fullname ||
                        detailedBooking.referred_by.email ||
                        `User #${detailedBooking.referred_by.id}`}
                    </p>
                  </div>
                )}
                {detailedBooking?.join_distributor_program && (
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      ASA(Authorized Sales Associate) Program
                    </p>
                    <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
                      Joined
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Contact Information */}
          {detailedBooking && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center gap-1.5 sm:gap-2">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      Email
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground break-words">
                      {detailedBooking.user_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center gap-1.5 sm:gap-2">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      Mobile
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {detailedBooking.user_mobile}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Information */}
          {detailedBooking && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">City</p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {detailedBooking.delivery_city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">State</p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {detailedBooking.delivery_state}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">PIN Code</p>
                    <p className="text-sm sm:text-base font-semibold text-foreground">
                      {detailedBooking.delivery_pin}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment & Amount Details Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                Payment & Amount Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Total Amount
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-foreground">
                    ₹{detailedBooking 
                      ? parseFloat(detailedBooking.total_amount || '0').toLocaleString()
                      : booking?.totalAmount?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Amount Paid
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-success">
                    ₹{detailedBooking 
                      ? parseFloat(detailedBooking.total_paid || '0').toLocaleString()
                      : (booking?.totalPaid || booking?.preBookingAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Remaining Amount
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-warning">
                    ₹{detailedBooking 
                      ? parseFloat(detailedBooking.remaining_amount || '0').toLocaleString()
                      : booking?.remainingAmount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              {((detailedBooking?.bonus_amount && parseFloat(detailedBooking.bonus_amount) > 0) || (booking?.bonusAmount !== undefined && booking.bonusAmount > 0)) ? (
                <>
                  <Separator />
                  <div>
                    <p 
                      className="text-sm sm:text-base font-bold mb-1"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Company Bonus
                    </p>
                    <p 
                      className="text-base sm:text-lg font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      ₹{detailedBooking 
                        ? parseFloat(detailedBooking.bonus_amount || '0').toLocaleString()
                        : (booking?.bonusAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </>
              ) : null}
              <Separator />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Booking Amount
                </p>
                <p className="text-sm sm:text-base font-semibold text-foreground">
                  ₹{detailedBooking 
                    ? parseFloat(detailedBooking.booking_amount || '0').toLocaleString()
                    : booking?.preBookingAmount?.toLocaleString() || '0'}
                </p>
              </div>
              {(detailedBooking?.expires_at || booking?.paymentDueDate) && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Payment Due Date / Expires At
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm sm:text-base font-semibold ${
                        isOverdue ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {detailedBooking?.expires_at
                        ? format(new Date(detailedBooking.expires_at), "dd MMM yyyy HH:mm")
                        : booking?.paymentDueDate
                          ? format(new Date(booking.paymentDueDate), "dd MMM yyyy")
                          : 'N/A'}
                    </p>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {detailedBooking?.reservation_expires_at && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Reservation Expires At
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {format(new Date(detailedBooking.reservation_expires_at), "dd MMM yyyy HH:mm")}
                  </p>
                </div>
              )}
              {detailedBooking?.payment_gateway_ref && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Payment Gateway Reference
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground font-mono break-all">
                    {detailedBooking.payment_gateway_ref}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Late Payment Consequences Section - Removed per user request */}
          {/* {(detailedBooking?.expires_at || booking?.paymentDueDate) && 
           ((detailedBooking ? parseFloat(detailedBooking.remaining_amount || '0') : booking?.remainingAmount || 0) > 0) && (
            <Card
              className={
                isOverdue
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-warning/50 bg-warning/5"
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isOverdue ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Clock className="w-5 h-5 text-warning" />
                  )}
                  Payment Due Date & Consequences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isOverdue ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <p className="text-sm font-semibold text-destructive mb-2">
                        ⚠️ Payment Overdue
                      </p>
                      <p className="text-sm text-foreground">
                        Your payment is {daysOverdue} day
                        {daysOverdue > 1 ? "s" : ""} overdue. Please make the
                        payment immediately to avoid further consequences.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Consequences of Non-Payment:
                      </p>
                      <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Late Fee:</strong> A late payment fee of ₹
                            {lateFeeAmount.toLocaleString()} will be added to
                            your outstanding balance.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Order Hold:</strong> Your order will be put
                            on hold until payment is received.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                      <p className="text-sm font-semibold text-warning mb-2">
                        ⏰ Payment Due Soon
                      </p>
                      <p className="text-sm text-foreground">
                        Your payment is due on{" "}
                        {detailedBooking?.expires_at
                          ? format(new Date(detailedBooking.expires_at), "dd MMM yyyy")
                          : booking?.paymentDueDate
                            ? format(new Date(booking.paymentDueDate), "dd MMM yyyy")
                            : 'N/A'}
                        . Please ensure payment is made before the due date to
                        avoid late fees.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        If Payment is Not Made by Due Date:
                      </p>
                      <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Late Fee:</strong> A late payment fee of 2%
                            of the remaining amount per week (minimum ₹500) will
                            be charged.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Order Hold:</strong> Your order will be put
                            on hold until payment is received.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>After 30 Days:</strong> If payment is not
                            received within 30 days of the due date, your order
                            may be cancelled and the pre-booking amount will be
                            subject to cancellation charges (up to 20%).
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                      <p className="text-sm font-semibold text-success mb-1">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Recommended Action:
                      </p>
                      <p className="text-sm text-foreground">
                        Make the payment before the due date to avoid any late
                        fees or consequences. You can use the "Pay More" button
                        to make a payment.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )} */}

          {/* Additional Information */}
          {booking && 'redemptionPoints' in booking && booking.redemptionPoints > 0 && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  Redemption Points
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Points Earned
                </p>
                <p className="text-base sm:text-lg font-semibold text-foreground">
                  {booking.redemptionPoints} points
                </p>
                {'redemptionEligible' in booking && booking.redemptionEligible && (
                  <p className="text-[10px] sm:text-xs text-success mt-1">
                    Eligible for redemption
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

