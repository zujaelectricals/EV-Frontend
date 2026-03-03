import {
  Bell,
  LogOut,
  Menu,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/app/slices/authSlice";
import { useLogoutMutation } from "@/app/api/authApi";
import { getAuthTokens, api, getProfilePicture, clearProfilePicture } from "@/app/api/baseApi";
import { clearBookings } from "@/app/slices/bookingSlice";
import { clearWishlist } from "@/app/slices/wishlistSlice";
import { clearWallets } from "@/app/slices/walletSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TopNavProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
  read: boolean;
}

export const TopNav = ({ onMenuClick }: TopNavProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isMobile = useIsMobile();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Load profile picture from localStorage or Redux state
  useEffect(() => {
    const storedPicture = getProfilePicture();
    const userPicture = user?.avatar;
    setProfilePictureState(userPicture || storedPicture || null);
  }, [user?.avatar]);

  // Mock notifications - in a real app, these would come from your API/state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Welcome to Zuja Electricals!",
      message: "Your account has been successfully created.",
      type: "success",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      title: "New Order Placed",
      message: "You have a new order #12345 for review.",
      type: "info",
      time: "5 hours ago",
      read: false,
    },
    {
      id: "3",
      title: "Payment Received",
      message: "Your payout of ₹5,000 has been processed.",
      type: "success",
      time: "1 day ago",
      read: true,
    },
    {
      id: "4",
      title: "Profile Update Required",
      message: "Please complete your KYC verification.",
      type: "warning",
      time: "2 days ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const { refreshToken } = getAuthTokens();
      
      if (refreshToken) {
        console.log('🔵 [ADMIN LOGOUT HANDLER] Calling logout API with refresh token');
        await logoutMutation({ refresh: refreshToken }).unwrap();
        console.log('🟢 [ADMIN LOGOUT HANDLER] Logout API call successful');
      } else {
        console.log('⚠️ [ADMIN LOGOUT HANDLER] No refresh token found, clearing local data only');
      }
      
      // Clear all user-specific Redux state
      dispatch(logout());
      dispatch(clearBookings());
      dispatch(clearWishlist());
      dispatch(clearWallets());
      
      // Clear profile picture from localStorage
      clearProfilePicture();
      
      // Clear referral code from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ev_nexus_referral_code');
        localStorage.removeItem('ev_nexus_referrer_name');
        console.log('✅ [ADMIN LOGOUT HANDLER] Cleared referral code from localStorage');
      }
      
      // Clear RTK Query cache to remove previous user's cached data
      dispatch(api.util.resetApiState());
      
      console.log('✅ [ADMIN LOGOUT HANDLER] All user data cleared from Redux and RTK Query cache');
      toast.success('Successfully logged out');
      navigate("/login");
    } catch (error) {
      // Even if API call fails, clear local data
      console.error('🔴 [ADMIN LOGOUT HANDLER] Logout error:', error);
      
      // Clear all user-specific Redux state
      dispatch(logout());
      dispatch(clearBookings());
      dispatch(clearWishlist());
      dispatch(clearWallets());
      
      // Clear profile picture from localStorage
      clearProfilePicture();
      
      // Clear referral code from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ev_nexus_referral_code');
        localStorage.removeItem('ev_nexus_referrer_name');
        console.log('✅ [ADMIN LOGOUT HANDLER] Cleared referral code from localStorage (after error)');
      }
      
      // Clear RTK Query cache
      dispatch(api.util.resetApiState());
      
      console.log('✅ [ADMIN LOGOUT HANDLER] All user data cleared from Redux and RTK Query cache (after error)');
      toast.success('Logged out');
      navigate("/login");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    setNotificationsOpen(false);
    // Navigate based on notification type if needed
    if (notification.title.includes("Order")) {
      navigate("/profile?tab=orders");
    } else if (notification.title.includes("KYC")) {
      navigate("/profile?tab=kyc");
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-pink-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <>
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/30 px-3 sm:px-6 backdrop-blur-lg">
      {/* Mobile Menu Button */}
      {isMobile && onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="mr-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {/* Notification bell icon - commented out
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <motion.button
              whileHover={{ scale: isMobile ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
              )}
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </motion.button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 sm:w-96 p-0"
            align="end"
            sideOffset={8}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 hover:bg-secondary/50 transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-medium ${
                                !notification.read ? "font-semibold" : ""
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => {
                      setNotificationsOpen(false);
                      // Navigate to full notifications page if you have one
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>
        */}


        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: isMobile ? 1 : 1.02 }}
              className="flex items-center gap-1 sm:gap-2 rounded-lg bg-secondary/50 px-2 sm:px-3 py-2"
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={user?.name || "User"}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border-2 border-primary/20"
                  onError={() => {
                    // Fallback to initial if image fails to load
                    setProfilePictureState(null);
                  }}
                />
              ) : (
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <span className="hidden text-sm font-medium sm:block">
                {user?.name || "User"}
              </span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-card border-border"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate("/profile?tab=settings")}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowLogoutDialog(true)}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    {/* Logout Confirmation Dialog */}
    <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <DialogContent className="sm:max-w-sm rounded-2xl border-border shadow-2xl bg-card p-8">
        <DialogHeader className="items-center text-center space-y-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-1">
            <LogOut className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Sign out?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Are you sure you want to sign out of your account?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            variant="outline"
            className="flex-1 h-11 border-border font-semibold"
            onClick={() => setShowLogoutDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-11 font-semibold"
            onClick={() => { setShowLogoutDialog(false); handleLogout(); }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Yes, sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
