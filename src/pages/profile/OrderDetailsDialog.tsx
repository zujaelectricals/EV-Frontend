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
} from "lucide-react";
import { Booking } from "@/app/slices/bookingSlice";
import { scooters } from "@/store/data/scooters";
import { format } from "date-fns";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  booking,
}: OrderDetailsDialogProps) {
  const vehicleDetails = useMemo(() => {
    if (!booking) return null;
    return scooters.find((s) => s.id === booking.vehicleId);
  }, [booking]);

  const isOverdue = useMemo(() => {
    if (!booking?.paymentDueDate) return false;
    const dueDate = new Date(booking.paymentDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return today > dueDate && booking.remainingAmount > 0;
  }, [booking]);

  const daysOverdue = useMemo(() => {
    if (!isOverdue || !booking?.paymentDueDate) return 0;
    const dueDate = new Date(booking.paymentDueDate);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [isOverdue, booking]);

  const lateFeeAmount = useMemo(() => {
    if (!isOverdue || !booking) return 0;
    // Calculate late fee: 2% of remaining amount per week overdue, minimum ₹500
    const weeksOverdue = Math.ceil(daysOverdue / 7);
    const lateFee = (booking.remainingAmount * 0.02 * weeksOverdue);
    return Math.max(lateFee, 500);
  }, [isOverdue, booking, daysOverdue]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success/10 text-success border-success/30";
      case "confirmed":
        return "bg-primary/10 text-primary border-primary/30";
      case "pre-booked":
        return "bg-warning/10 text-warning border-warning/30";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Order Details</DialogTitle>
          <DialogDescription>
            Complete information about your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Link
                  to={`/scooters/${booking.vehicleId}`}
                  className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer inline-block"
                >
                  {booking.vehicleName}
                </Link>
                {vehicleDetails && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Range</p>
                        <p className="text-sm font-medium">
                          {vehicleDetails.range}+ km
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Top Speed
                        </p>
                        <p className="text-sm font-medium">
                          {vehicleDetails.topSpeed} km/h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Battery</p>
                        <p className="text-sm font-medium">
                          {vehicleDetails.batteryVoltage ||
                            vehicleDetails.batteryCapacity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Charging
                        </p>
                        <p className="text-sm font-medium">
                          {vehicleDetails.chargingTime || "4-5h"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {vehicleDetails?.description && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {vehicleDetails.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Purchase Order Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Purchase Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Order ID
                  </p>
                  <p className="font-semibold text-foreground">{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Order Date
                  </p>
                  <p className="font-semibold text-foreground">
                    {format(new Date(booking.bookedAt), "dd MMM yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="font-semibold text-foreground capitalize">
                    {booking.paymentMethod}
                  </p>
                </div>
                {booking.emiPlan && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        EMI Plan
                      </p>
                      <p className="font-semibold text-foreground">
                        {booking.emiPlan.months} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Monthly Amount
                      </p>
                      <p className="font-semibold text-foreground">
                        ₹{booking.emiPlan.monthlyAmount.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
                {booking.referredBy && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Referred By
                    </p>
                    <p className="font-semibold text-foreground">
                      {booking.referredBy}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Amount Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment & Amount Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Amount
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    ₹{booking.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Amount Paid
                  </p>
                  <p className="text-lg font-semibold text-success">
                    ₹
                    {(
                      booking.totalPaid || booking.preBookingAmount
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Remaining Amount
                  </p>
                  <p className="text-lg font-semibold text-warning">
                    ₹{booking.remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Pre-booking Amount
                </p>
                <p className="font-semibold text-foreground">
                  ₹{booking.preBookingAmount.toLocaleString()}
                </p>
              </div>
              {booking.paymentDueDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Payment Due Date
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold ${
                        isOverdue ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {format(
                        new Date(booking.paymentDueDate),
                        "dd MMM yyyy"
                      )}
                    </p>
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Late Payment Consequences Section */}
          {booking.paymentDueDate && booking.remainingAmount > 0 && (
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

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Late Payment Fee:
                      </p>
                      <p className="text-lg font-bold text-destructive">
                        ₹{lateFeeAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (2% of remaining amount per week overdue, minimum ₹500)
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
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>After 30 Days:</strong> If payment is not
                            received within 30 days of the due date, your order
                            may be cancelled and the pre-booking amount will be
                            subject to cancellation charges (up to 20%).
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Credit Impact:</strong> Late payments may
                            affect your eligibility for future bookings and
                            financing options.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-sm font-semibold text-primary mb-1">
                        Recommended Action:
                      </p>
                      <p className="text-sm text-foreground">
                        Please make the payment immediately to avoid additional
                        late fees and potential order cancellation. Contact our
                        support team if you need assistance with payment
                        arrangements.
                      </p>
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
                        {format(
                          new Date(booking.paymentDueDate),
                          "dd MMM yyyy"
                        )}
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
          )}

          {/* Additional Information */}
          {booking.redemptionPoints > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Redemption Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">
                  Points Earned
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {booking.redemptionPoints} points
                </p>
                {booking.redemptionEligible && (
                  <p className="text-xs text-success mt-1">
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

