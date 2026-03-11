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
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  FileText,
  Mail,
  Phone,
  Package,
} from "lucide-react";
import { Booking } from "@/app/slices/bookingSlice";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/utils";
import { useGetBookingDetailQuery } from "@/app/api/bookingApi";
import { BookingResponse } from "@/app/api/bookingApi";

function DetailRow({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold text-foreground break-words ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}

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

  // Distinct label styles per status so each status has its own visual
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700";
      case "active":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700";
      case "pending":
      case "pre-booked":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700";
      case "expired":
        return "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600";
      default:
        return "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600";
    }
  };

  // Show loading state
  if (bookingId && isLoadingDetail) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <div className="overflow-y-auto flex-1 p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Order Details</DialogTitle>
              <DialogDescription className="text-sm">Loading booking information...</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-8 sm:py-12">
              <LoadingSpinner size="md" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (bookingId && detailError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <div className="overflow-y-auto flex-1 p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Order Details</DialogTitle>
              <DialogDescription className="text-sm">Failed to load booking information</DialogDescription>
            </DialogHeader>
            <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">
              <p>Unable to load booking details. Please try again later.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Use detailed booking data or fallback to booking prop
  const displayBooking = detailedBooking || booking;
  if (!displayBooking) return null;

  const vehicleName = detailedBooking?.vehicle_details.name || booking?.vehicleName || 'Unknown Vehicle';
  const bookingNum = detailedBooking?.booking_number;
  const statusStr = (detailedBooking?.status || booking?.status || '').replace(/_/g, " ");
  const paymentStr = (detailedBooking?.payment_status || booking?.paymentStatus || '').replace(/_/g, " ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col rounded-xl border-0 shadow-xl">
        {/* Accent bar */}
        <div className="h-1 w-full rounded-t-xl bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

        <div className="overflow-y-auto flex-1">
          {/* Hero header */}
          <div className="px-4 sm:px-6 pt-5 pb-6 bg-gradient-to-b from-muted/40 to-background border-b border-border/50">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                Order Details
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Complete information about your booking
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  to={detailedBooking
                    ? `/scooters/vehicle-${detailedBooking.vehicle_details.name?.toLowerCase().replace(/\s+/g, '-') || 'vehicle'}-${detailedBooking.vehicle_details.id}`
                    : booking?.vehicleId ? `/scooters/${booking.vehicleId}` : '#'}
                  className="text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors break-words"
                >
                  {vehicleName}
                </Link>
                {bookingNum && (
                  <span className="text-xs sm:text-sm font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                    {bookingNum}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Order status:</span>
                  <Badge className={`${getStatusColor(detailedBooking?.status || booking?.status || '')} text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-md border`}>
                    {statusStr.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Payment status:</span>
                  <Badge className={`${getStatusColor(detailedBooking?.payment_status || booking?.paymentStatus || '')} text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-md border`}>
                    {paymentStr.toUpperCase()}
                  </Badge>
                </div>
                {(detailedBooking?.reservation_status || booking?.reservationStatus) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Reservation status:</span>
                    <Badge className={`${getStatusColor(detailedBooking?.reservation_status || booking?.reservationStatus || '')} text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-md border`}>
                      {(detailedBooking?.reservation_status || booking?.reservationStatus || '').replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Order & payment details */}
          <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-border/50 bg-muted/20">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Order & Payment
              </h3>
            </div>
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailRow label="Order ID" value={String(detailedBooking?.id ?? booking?.id ?? '—')} />
                {detailedBooking?.booking_number && <DetailRow label="Booking Number" value={detailedBooking.booking_number} mono />}
                <DetailRow
                  label="Order Date"
                  value={detailedBooking?.created_at ? formatDisplayDateTime(detailedBooking.created_at) : (booking?.bookedAt ? formatDisplayDate(booking.bookedAt) : 'N/A')}
                />
                {detailedBooking?.confirmed_at && (
                  <DetailRow label="Confirmed At" value={formatDisplayDateTime(detailedBooking.confirmed_at)} />
                )}
                <DetailRow
                  label="Payment Option"
                  value={detailedBooking?.payment_option?.replace(/_/g, " ") || booking?.paymentMethod || 'N/A'}
                  capitalize
                />
                {detailedBooking?.emi_duration_months && (
                  <>
                    <DetailRow label="EMI Duration" value={`${detailedBooking.emi_duration_months} months`} />
                    {detailedBooking.emi_amount && (
                      <DetailRow label="EMI Amount" value={`₹${parseFloat(detailedBooking.emi_amount).toLocaleString()}/month`} />
                    )}
                    {detailedBooking.emi_start_date && (
                      <DetailRow label="EMI Start" value={formatDisplayDate(detailedBooking.emi_start_date)} />
                    )}
                    <DetailRow label="EMI Progress" value={`${detailedBooking.emi_paid_count} / ${detailedBooking.emi_total_count} payments`} />
                  </>
                )}
                {detailedBooking?.referred_by && (
                  <DetailRow
                    label="Referred By"
                    value={detailedBooking.referred_by.fullname || detailedBooking.referred_by.email || `User #${detailedBooking.referred_by.id}`}
                  />
                )}
                {detailedBooking?.join_distributor_program && (
                  <div className="sm:col-span-2">
                    <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">ASA Program</p>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-medium px-2.5 py-1 rounded-md">Joined</Badge>
                  </div>
                )}
              </div>

              {/* Financial highlights */}
              <div className="mt-5 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(parseFloat(detailedBooking?.bonus_amount || '0') > 0 || (booking?.bonusAmount ?? 0) > 0) && (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10 px-4 py-3 border border-emerald-500/20">
                    <span className="text-xs font-medium text-muted-foreground">Company Bonus</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{detailedBooking ? parseFloat(detailedBooking.bonus_amount || '0').toLocaleString() : (booking?.bonusAmount || 0).toLocaleString()}
                    </span>
                  </div>
                )}
                {(parseFloat(detailedBooking?.deductions_applied || '0') > 0 || (booking?.deductionsApplied ?? 0) > 0) && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 border border-border/60">
                    <span className="text-xs font-medium text-muted-foreground">Deductions Applied</span>
                    <span className="text-sm font-bold text-foreground">
                      ₹{detailedBooking ? parseFloat(detailedBooking.deductions_applied || '0').toLocaleString() : (booking?.deductionsApplied || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Contact */}
          {detailedBooking && (
            <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-border/50 bg-muted/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Contact
                </h3>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-foreground break-all">{detailedBooking.user_email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Mobile</p>
                    <p className="text-sm font-semibold text-foreground">{detailedBooking.user_mobile}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Delivery */}
          {detailedBooking && (
            <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-border/50 bg-muted/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  Delivery
                </h3>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">City</p>
                  <p className="text-sm font-semibold text-foreground">{detailedBooking.delivery_city}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">State</p>
                  <p className="text-sm font-semibold text-foreground">{detailedBooking.delivery_state}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">PIN</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{detailedBooking.delivery_pin}</p>
                </div>
              </div>
            </section>
          )}

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
                          ? formatDisplayDate(detailedBooking.expires_at)
                            : booking?.paymentDueDate 
                              ? formatDisplayDate(booking.paymentDueDate)
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

          {/* Redemption Points */}
          {booking && 'redemptionPoints' in booking && booking.redemptionPoints > 0 && (
            <section className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-border/50 bg-muted/20">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  Redemption Points
                </h3>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-sm font-semibold text-foreground">{booking.redemptionPoints} points</p>
                {'redemptionEligible' in booking && booking.redemptionEligible && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Eligible for redemption</p>
                )}
              </div>
            </section>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

