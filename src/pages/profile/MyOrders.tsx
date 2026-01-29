import { useState, useEffect, useMemo } from "react";
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
  RefreshCw,
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
import { useAddReferralNodeMutation } from "@/app/api/binaryApi";
import { useGetBookingsQuery, useMakePaymentMutation } from "@/app/api/bookingApi";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Booking, PaymentMethod } from "@/app/slices/bookingSlice";
import { setBookings } from "@/app/slices/bookingSlice";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/app/api/baseApi";

const DISTRIBUTOR_ELIGIBILITY_AMOUNT = 5000;

export function MyOrders() {
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.booking);
  const { user } = useAppSelector((state) => state.auth);
  const [addReferralNode] = useAddReferralNodeMutation();
  const [makePayment, { isLoading: isMakingPayment }] = useMakePaymentMutation();
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showPaymentAmountDialog, setShowPaymentAmountDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [customPaymentAmount, setCustomPaymentAmount] = useState<string>("");
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key

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

  // Get bookings with status filter - uses RTK Query caching
  // Each status filter creates a separate cache entry
  const apiStatus = statusFilter === "all" ? undefined : getApiStatus(statusFilter);
  const queryParams = apiStatus ? { status: apiStatus } : undefined;
  
  const { 
    data: bookingsData, 
    isLoading: isLoadingBookings, 
    error: bookingsError, 
    refetch,
    isFetching,
    currentData // Use currentData to ensure we get the latest from cache
  } = useGetBookingsQuery(
    queryParams,
    {
      // Refetch when status changes (forceRefetch handles this in the query definition)
      refetchOnMountOrArgChange: true, // Refetch if status changed
      refetchOnFocus: false, // Don't refetch on window focus (use cache)
      refetchOnReconnect: true, // Refetch when reconnecting to network
      // RTK Query caching:
      // - Each status filter (all, pending, active, completed, cancelled, expired) gets its own cache
      // - Cache persists during browser session
      // - Switching between tabs uses cached data if available
      // - Manual refresh (refetch) will update the cache
    }
  );

  // Use currentData if available, otherwise fallback to data
  // currentData is the most up-to-date data in the cache
  const activeBookingsData = currentData ?? bookingsData;

  // Handle refresh button click - force fresh data fetch
  const handleRefresh = async () => {
    try {
      // Invalidate cache tags to ensure fresh data is fetched
      // This forces RTK Query to discard cached data and fetch fresh from server
      const status = apiStatus || 'all';
      dispatch(
        api.util.invalidateTags([
          { type: 'Booking', id: 'LIST' },
          { type: 'Booking', id: `LIST-${status}` },
        ])
      );
      
      // Force refetch - this bypasses cache and fetches fresh data
      const result = await refetch();
      if (result.data) {
        console.log("✅ [REFRESH] Bookings refreshed, data:", result.data);
        console.log("✅ [REFRESH] First booking total_paid:", result.data.results?.[0]?.total_paid);
        console.log("✅ [REFRESH] First booking remaining_amount:", result.data.results?.[0]?.remaining_amount);
        
        // Force component re-render by updating refresh key
        // This ensures React detects the change even if bookingsData reference is the same
        setRefreshKey(prev => prev + 1);
        
        toast.success("Orders refreshed successfully");
      } else if (result.error) {
        console.error("❌ [REFRESH] Error in response:", result.error);
        toast.error("Failed to refresh orders");
      }
    } catch (error) {
      console.error("❌ [REFRESH] Error refreshing orders:", error);
      toast.error("Failed to refresh orders");
    }
  };

  // Map API bookings to local booking format (memoized to prevent unnecessary recalculations)
  // Include refreshKey to force recalculation when refresh is triggered
  // Use activeBookingsData to ensure we have the latest cached data
  const mappedBookings = useMemo(() => {
    if (!activeBookingsData?.results) return [];
    
    console.log("🔄 [MAPPED BOOKINGS] Recalculating with refreshKey:", refreshKey);
    console.log("🔄 [MAPPED BOOKINGS] First booking total_paid:", activeBookingsData.results[0]?.total_paid);
    console.log("🔄 [MAPPED BOOKINGS] First booking remaining_amount:", activeBookingsData.results[0]?.remaining_amount);
    
    return activeBookingsData.results.map((apiBooking) => {
      // IMPORTANT:
      // Use payment_status and reservation_status (NOT status field) for display logic
      const remainingAmount = parseFloat(apiBooking.remaining_amount) || 0;

      let displayStatus: Booking['status'] = "pending";

      // If the reservation has been released, treat as expired
      if (apiBooking.reservation_status === "released") {
        displayStatus = "expired";
      }
      // Explicitly cancelled payments/bookings
      else if (
        apiBooking.payment_status === "cancelled" ||
        apiBooking.status === "cancelled"
      ) {
        displayStatus = "cancelled";
      }
      // Fully paid bookings
      else if (remainingAmount === 0) {
        // If delivered timestamp exists, mark as delivered
        if (apiBooking.delivered_at || apiBooking.completed_at) {
          displayStatus = "delivered";
        } else {
          // Payment completed, reservation completed -> confirmed
          displayStatus = "confirmed";
        }
      }
      // Partially / only booking-amount paid -> pre-booked
      else if (
        apiBooking.reservation_status === "completed" ||
        apiBooking.reservation_status === "pending" ||
        apiBooking.payment_status === "completed" ||
        apiBooking.payment_status === "pending"
      ) {
        displayStatus = "pre-booked";
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
        referredBy: apiBooking.referred_by || undefined,
        addedToTeamNetwork: false,
        bookingNumber: apiBooking.booking_number,
        vehicleColor: apiBooking.vehicle_color,
        batteryVariant: apiBooking.battery_variant,
        reservationStatus: apiBooking.reservation_status,
      };
    });
  }, [activeBookingsData, refreshKey]); // Use activeBookingsData instead of bookingsData

  // Log when activeBookingsData changes to debug refresh issues
  useEffect(() => {
    if (activeBookingsData) {
      console.log("🔄 [BOOKINGS DATA CHANGED] New activeBookingsData received:", activeBookingsData);
      console.log("🔄 [BOOKINGS DATA CHANGED] First booking total_paid:", activeBookingsData.results?.[0]?.total_paid);
      console.log("🔄 [BOOKINGS DATA CHANGED] First booking remaining_amount:", activeBookingsData.results?.[0]?.remaining_amount);
      console.log("🔄 [BOOKINGS DATA CHANGED] bookingsData reference:", bookingsData === activeBookingsData);
    }
  }, [activeBookingsData, bookingsData]);

  // Update Redux store when bookings data changes - this ensures Redux is always in sync with API data
  useEffect(() => {
    if (mappedBookings.length > 0 || activeBookingsData) {
      // Always sync Redux with the latest API data
      console.log("🔄 [REDUX SYNC] Updating Redux with mappedBookings:", mappedBookings.length);
      dispatch(setBookings(mappedBookings));
    }
  }, [mappedBookings, dispatch, activeBookingsData]);

  // Always use API data when available - never fallback to Redux for display
  // This ensures we always show the latest data from the API after refresh
  // Deduplicate bookings by ID to prevent duplicate displays
  const displayBookings = useMemo(() => {
    // If we have API data (even if empty), use it - don't use Redux fallback
    // This ensures refresh always shows fresh data from the server
    const source = activeBookingsData !== undefined ? mappedBookings : bookings;
    // Remove duplicates by ID, keeping the first occurrence
    const seen = new Set<string>();
    return source.filter((booking) => {
      if (seen.has(booking.id)) {
        return false;
      }
      seen.add(booking.id);
      return true;
    });
  }, [mappedBookings, bookings, activeBookingsData]);

  // Note: Console logs for API calls are in bookingApi.ts
  // They only appear when actual API calls are made, not when using cached data

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

  const handleAdditionalPaymentSuccess = async (paymentGatewayRef?: string, paymentMethod: 'online' | 'bank_transfer' | 'cash' | 'wallet' = 'online') => {
    if (!selectedBooking) return;

    const booking = bookings.find((b) => b.id === selectedBooking);
    if (!booking) return;

    try {
      // Call the make payment API
      const bookingId = parseInt(selectedBooking, 10);
      if (isNaN(bookingId)) {
        toast.error("Invalid booking ID");
        return;
      }

      const paymentResponse = await makePayment({
        bookingId,
        paymentData: {
          amount: paymentAmount,
          payment_method: paymentMethod,
        },
      }).unwrap();

      console.log("✅ [PAYMENT] Payment API response:", paymentResponse);

      // Update local state with API response
      const newTotalPaid = parseFloat(paymentResponse.total_paid) || 0;
      const newRemainingAmount = parseFloat(paymentResponse.remaining_amount) || 0;
      const newPaymentStatus = newRemainingAmount === 0 ? "completed" : "partial";

      // Get previous total paid for distributor eligibility check
      const previousTotalPaid = booking.totalPaid || booking.preBookingAmount || 0;

      // Check if user should be added to distributor's team network
      // Conditions:
      // 1. User has a referral code in the booking
      // 2. Previous total paid was < 5000
      // 3. New total paid >= 5000
      // 4. User hasn't been added to team network yet
      const shouldAddToTeamNetwork =
        booking.referredBy &&
        booking.referredBy.trim() &&
        previousTotalPaid < DISTRIBUTOR_ELIGIBILITY_AMOUNT &&
        newTotalPaid >= DISTRIBUTOR_ELIGIBILITY_AMOUNT &&
        !booking.addedToTeamNetwork;

    let addedToTeamNetwork = booking.addedToTeamNetwork || false;

    if (shouldAddToTeamNetwork && user) {
      try {
        // Find distributor ID by referral code - check both current auth and multiple accounts
        let distributorId: string | null = null;

        // First check current auth data
        const authDataStr = localStorage.getItem("ev_nexus_auth_data");
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            if (
              authData.user?.distributorInfo?.referralCode ===
                booking.referredBy.trim() &&
              authData.user?.distributorInfo?.isDistributor === true &&
              authData.user?.distributorInfo?.isVerified === true
            ) {
              distributorId = authData.user.id;
            }
          } catch (e) {
            console.error("Error parsing auth data:", e);
          }
        }

        // If not found in current auth, check multiple accounts
        if (!distributorId) {
          const accountsKey = "ev_nexus_multiple_accounts";
          const stored = localStorage.getItem(accountsKey);
          if (stored) {
            const accounts: Array<{
              user?: {
                id?: string;
                distributorInfo?: {
                  referralCode?: string;
                  isDistributor?: boolean;
                  isVerified?: boolean;
                };
              };
            }> = JSON.parse(stored);
            const distributor = accounts.find(
              (acc) =>
                acc.user?.distributorInfo?.referralCode ===
                  booking.referredBy?.trim() &&
                acc.user?.distributorInfo?.isDistributor === true &&
                acc.user?.distributorInfo?.isVerified === true
            );

            if (distributor?.user?.id) {
              distributorId = distributor.user.id;
            }
          }
        }

        if (distributorId) {
          await addReferralNode({
            distributorId: distributorId,
            userId: user.id,
            userName: user.name,
            pv: newTotalPaid,
            referralCode: booking.referredBy.trim(),
          }).unwrap();

          addedToTeamNetwork = true;
          toast.success(
            "You have been added to the distributor's team network!"
          );
        }
      } catch (error) {
        console.error("Error adding user to binary tree:", error);
        // Don't fail the payment if this fails
      }
    }

    // Update booking
    dispatch(
      updateBooking({
        id: selectedBooking,
        updates: {
          totalPaid: newTotalPaid,
          remainingAmount: newRemainingAmount,
          paymentStatus: newPaymentStatus,
          status: newRemainingAmount === 0 ? "confirmed" : booking.status,
          addedToTeamNetwork: addedToTeamNetwork,
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
          isDistributorEligible: newTotalPaid >= DISTRIBUTOR_ELIGIBILITY_AMOUNT, // Update eligibility based on total paid
        })
      );
    }

      toast.success(
        `Payment of ₹${paymentAmount.toLocaleString()} processed successfully!`
      );
      setShowPaymentGateway(false);
      setSelectedBooking(null);
      setPaymentAmount(0);
      
      // Refetch bookings to get updated data from server
      await refetch();
    } catch (error) {
      console.error("❌ [PAYMENT] Error making payment:", error);
      const errorData = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string; detail?: string } }).data 
        : undefined;
      const errorMessage = errorData?.message || errorData?.detail || "Failed to process payment. Please try again.";
      toast.error(errorMessage);
      // Don't close the payment gateway on error so user can retry
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 gap-2">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex-1">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1.5 rounded-xl bg-muted/50 border border-border/70 shadow-sm">
            <TabsTrigger value="all" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#18b3b2] data-[state=active]:to-[#22cc7b] data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md rounded-lg">
              All
              {activeBookingsData?.count !== undefined && (
                <span className="ml-1 text-[10px]">({activeBookingsData.count})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#18b3b2] data-[state=active]:to-[#22cc7b] data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md rounded-lg">Pending</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#18b3b2] data-[state=active]:to-[#22cc7b] data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#18b3b2] data-[state=active]:to-[#22cc7b] data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md rounded-lg">Completed</TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#18b3b2] data-[state=active]:to-[#22cc7b] data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md rounded-lg">Cancelled</TabsTrigger>
            <TabsTrigger value="expired" className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#18b3b2] data-[state=active]:to-[#22cc7b] data-[state=active]:text-white data-[state=active]:border-0 data-[state=active]:shadow-md rounded-lg">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingBookings || isFetching}
            className="text-xs sm:text-sm"
            title="Refresh orders"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${(isLoadingBookings || isFetching) ? 'animate-spin' : ''}`} />
          </Button>
          <Link to="/scooters">
            <Button size="sm" className="bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] text-white border-0 hover:opacity-90 text-xs sm:text-sm">Browse Vehicles</Button>
          </Link>
        </div>
      </div>

      {isLoadingBookings ? (
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardContent className="py-12 text-center">
            <LoadingSpinner text="Loading orders..." size="md" />
          </CardContent>
        </Card>
      ) : bookingsError ? (
        <Card className="border-0 shadow-lg shadow-slate-200/50 ring-2 ring-destructive/20">
          <CardContent className="py-10 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error loading orders
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Failed to load your orders. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : displayBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-b from-white to-slate-50/50 ring-2 ring-[#18b3b2]/20">
            <CardContent className="py-12 sm:py-14 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#18b3b2]/15 to-[#22cc7b]/15 mb-4"
              >
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#18b3b2]" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                No orders found
              </h3>
              <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
                {statusFilter !== "all" 
                  ? `No ${statusFilter.replace(/-/g, ' ')} orders found. Try selecting a different filter.`
                  : "Start shopping to see your orders here"}
              </p>
              <Link to="/scooters">
                <Button size="sm" className="bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] text-white border-0 hover:opacity-90 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                  Browse Vehicles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Results Count */}
          {activeBookingsData?.count !== undefined && (
            <div className="text-sm text-muted-foreground mb-2">
              Showing {displayBookings.length} of {activeBookingsData.count} orders
              {activeBookingsData.total_pages && activeBookingsData.total_pages > 1 && (
                <span className="ml-2">
                  (Page {activeBookingsData.current_page || 1} of {activeBookingsData.total_pages})
                </span>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            {displayBookings.map((booking, index) => (
            <motion.div
              key={`booking-${booking.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow relative">
                <CardContent className="p-3 sm:p-4">
                  {/* Status Badge - Top Right Corner */}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <Badge className={getStatusColor(booking.status)}>
                      <span className="flex items-center gap-1 text-[10px] sm:text-xs">
                        {getStatusIcon(booking.status)}
                        {(() => {
                          const baseText =
                            (booking.status === "pre-booked" || booking.status === "expired") &&
                            (booking as Booking).reservationStatus
                              ? (booking as Booking).reservationStatus!
                              : booking.status.replace("-", " ");

                          const label = baseText.toUpperCase();

                          return (
                            <>
                              <span className="hidden sm:inline">{label}</span>
                              <span className="sm:hidden">{label.slice(0, 3)}</span>
                            </>
                          );
                        })()}
                      </span>
                    </Badge>
                  </div>

                  <div className="pr-16 sm:pr-20">
                    <div className="mb-3">
                      <Link
                        to={`/scooters/${booking.vehicleId}`}
                        className="text-sm sm:text-base font-semibold text-foreground mb-1 hover:text-primary transition-colors cursor-pointer inline-block"
                      >
                        {booking.vehicleName}
                      </Link>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Order ID: {booking.id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Order Date
                          </p>
                          <p className="text-xs sm:text-sm font-medium truncate">
                            {new Date(booking.bookedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Total Amount
                          </p>
                          <p className="text-xs sm:text-sm font-medium truncate">
                            ₹{(booking.totalAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {booking.paymentDueDate && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              Due Date
                            </p>
                            <p className="text-xs sm:text-sm font-medium truncate">
                              {new Date(
                                booking.paymentDueDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            Payment Method
                          </p>
                          <p className="text-xs sm:text-sm font-medium capitalize truncate">
                            {booking.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary with Buttons */}
                  {booking.status === "pre-booked" ||
                  booking.paymentStatus === "partial" ? (
                    <div className="p-2 sm:p-3 bg-muted/30 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                          <span className="text-[10px] sm:text-xs font-medium text-foreground">
                            Payment Summary
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                            Amount Paid
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-foreground">
                            ₹
                            {(
                              booking.totalPaid || booking.preBookingAmount || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">
                            Balance to Pay
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-warning">
                            ₹{(booking.remainingAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-border/50">
                        <div className="flex justify-between text-[10px] sm:text-xs">
                          <span className="text-muted-foreground">
                            Total Amount
                          </span>
                          <span className="font-medium text-foreground">
                            ₹{(booking.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                          onClick={() => {
                            setSelectedBookingForDetails(booking);
                            setShowOrderDetails(true);
                          }}
                        >
                          View Details
                        </Button>
                        {booking.remainingAmount > 0 && (
                          <Button
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm bg-gradient-to-r from-[#18b3b2] to-[#22cc7b] text-white border-0 hover:opacity-90 shadow-md shadow-emerald-500/25"
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => {
                          setSelectedBookingForDetails(booking);
                          setShowOrderDetails(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            ))}
          </div>
        </>
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
          onSuccess={(paymentGatewayRef, paymentMethod) => 
            handleAdditionalPaymentSuccess(paymentGatewayRef, paymentMethod)
          }
          vehicleName={
            bookings.find((b) => b.id === selectedBooking)?.vehicleName
          }
        />
      )}

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
        booking={selectedBookingForDetails}
        bookingId={selectedBookingForDetails?.id ? parseInt(selectedBookingForDetails.id, 10) : null}
      />
    </div>
  );
}
