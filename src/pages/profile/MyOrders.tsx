import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { updateBooking } from "@/app/slices/bookingSlice";
import { updatePreBooking } from "@/app/slices/authSlice";
import { Link } from "react-router-dom";
import { PaymentGateway } from "@/store/components/PaymentGateway";
import { toast } from "sonner";

export function MyOrders() {
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.booking);
  const { user } = useAppSelector((state) => state.auth);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showPaymentAmountDialog, setShowPaymentAmountDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [customPaymentAmount, setCustomPaymentAmount] = useState<string>("");
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pre-booked":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handlePayMore = (bookingId: string, remainingAmount: number) => {
    setSelectedBooking(bookingId);
    setMaxPaymentAmount(remainingAmount);
    setCustomPaymentAmount(remainingAmount.toString());
    setShowPaymentAmountDialog(true);
  };

  const handleConfirmPaymentAmount = () => {
    const amount = Number(customPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > maxPaymentAmount) {
      toast.error(
        `Amount cannot exceed remaining balance of ₹${maxPaymentAmount.toLocaleString()}`
      );
      return;
    }
    setPaymentAmount(amount);
    setShowPaymentAmountDialog(false);
    setShowPaymentGateway(true);
  };

  const handleAdditionalPaymentSuccess = () => {
    if (!selectedBooking) return;

    const booking = bookings.find((b) => b.id === selectedBooking);
    if (!booking) return;

    const newTotalPaid =
      (booking.totalPaid || booking.preBookingAmount) + paymentAmount;
    const newRemainingAmount = Math.max(0, booking.totalAmount - newTotalPaid);
    const newPaymentStatus = newRemainingAmount === 0 ? "completed" : "partial";

    // Update booking
    dispatch(
      updateBooking({
        id: selectedBooking,
        updates: {
          totalPaid: newTotalPaid,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
          status: newRemainingAmount === 0 ? "confirmed" : booking.status,
        },
      })
    );

    // Update user pre-booking info if this is their active booking
    if (user?.preBookingInfo?.vehicleId === booking.vehicleId) {
      dispatch(
        updatePreBooking({
          ...user.preBookingInfo,
          totalPaid: newTotalPaid,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
          isDistributorEligible: newTotalPaid >= 5000, // Update eligibility based on total paid
        })
      );
    }

    toast.success(
      `Payment of ₹${paymentAmount.toLocaleString()} processed successfully!`
    );
    setShowPaymentGateway(false);
    setSelectedBooking(null);
    setPaymentAmount(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end mb-4">
        <Link to="/scooters">
          <Button size="sm">Browse Vehicles</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No orders yet
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Start shopping to see your orders here
            </p>
            <Link to="/scooters">
              <Button size="sm">Browse Vehicles</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow relative">
                <CardContent className="p-4">
                  {/* Status Badge - Top Right Corner */}
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(booking.status)}>
                      <span className="flex items-center gap-1 text-xs">
                        {getStatusIcon(booking.status)}
                        {booking.status.replace("-", " ").toUpperCase()}
                      </span>
                    </Badge>
                  </div>

                  <div className="pr-20">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-foreground mb-1">
                        {booking.vehicleName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Order ID: {booking.id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Order Date
                          </p>
                          <p className="text-sm font-medium">
                            {new Date(booking.bookedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Amount
                          </p>
                          <p className="text-sm font-medium">
                            ₹{booking.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {booking.paymentDueDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Due Date
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(
                                booking.paymentDueDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Payment Method
                          </p>
                          <p className="text-sm font-medium capitalize">
                            {booking.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary with Buttons */}
                  {booking.status === "pre-booked" ||
                  booking.paymentStatus === "partial" ? (
                    <div className="p-3 bg-muted/30 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-foreground">
                            Payment Summary
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Amount Paid
                          </p>
                          <p className="text-base font-semibold text-foreground">
                            ₹
                            {(
                              booking.totalPaid || booking.preBookingAmount
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Balance to Pay
                          </p>
                          <p className="text-base font-semibold text-warning">
                            ₹{booking.remainingAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3 pb-3 border-b border-border/50">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Total Amount
                          </span>
                          <span className="font-medium text-foreground">
                            ₹{booking.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Link to={`/orders/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {booking.remainingAmount > 0 && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handlePayMore(booking.id, booking.remainingAmount)
                            }
                          >
                            Pay More
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end mt-3">
                      <Link to={`/orders/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Amount Dialog */}
      <Dialog
        open={showPaymentAmountDialog}
        onOpenChange={setShowPaymentAmountDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Payment Amount</DialogTitle>
            <DialogDescription>
              Enter the amount you want to pay (maximum: ₹
              {maxPaymentAmount.toLocaleString()})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="1"
                max={maxPaymentAmount}
                value={customPaymentAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (
                    value === "" ||
                    (!isNaN(Number(value)) && Number(value) >= 0)
                  ) {
                    setCustomPaymentAmount(value);
                  }
                }}
                placeholder="Enter amount"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Remaining balance: ₹{maxPaymentAmount.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCustomPaymentAmount(maxPaymentAmount.toString());
                }}
                className="flex-1"
              >
                Pay Full Balance
              </Button>
              <Button
                onClick={handleConfirmPaymentAmount}
                className="flex-1"
                disabled={
                  !customPaymentAmount || Number(customPaymentAmount) <= 0
                }
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway for Additional Payments */}
      {selectedBooking && (
        <PaymentGateway
          isOpen={showPaymentGateway}
          onClose={() => {
            setShowPaymentGateway(false);
            setSelectedBooking(null);
            setPaymentAmount(0);
            setCustomPaymentAmount("");
            setMaxPaymentAmount(0);
          }}
          amount={paymentAmount}
          onSuccess={handleAdditionalPaymentSuccess}
          vehicleName={
            bookings.find((b) => b.id === selectedBooking)?.vehicleName
          }
        />
      )}
    </div>
  );
}
