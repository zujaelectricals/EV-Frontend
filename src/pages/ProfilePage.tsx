import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Package,
  Heart,
  CreditCard,
  Settings,
  Gift,
  FileText,
  Award,
  Users,
  DollarSign,
  Link as LinkIcon,
  GitBranch,
  Wallet,
  MapPin,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/app/hooks";
import { Link } from "react-router-dom";
import { MyOrders } from "./profile/MyOrders";
import { Wishlist } from "./profile/Wishlist";
import { PaymentMethods } from "./profile/PaymentMethods";
import { DistributorOptions } from "./profile/DistributorOptions";
import { Addresses } from "./profile/Addresses";

export function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { bookings } = useAppSelector((state) => state.booking);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "orders"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Check if user is a distributor - either verified or has distributor info
  const isDistributor =
    (user?.isDistributor && user?.distributorInfo?.isVerified) ||
    (user?.distributorInfo &&
      user.distributorInfo.verificationStatus === "approved");

  const profileSections = [
    { id: "orders", label: "My Orders", icon: Package, count: bookings.length },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      count: wishlistItems.length,
    },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "redemption", label: "Redemption Points", icon: Gift },
    { id: "settings", label: "Account Settings", icon: Settings },
    ...(isDistributor
      ? [{ id: "distributor", label: "Distributor", icon: Award }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full px-3 sm:px-4 py-4">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Account
              </h1>
              <p className="text-muted-foreground">
                Manage your orders, profile, and preferences
              </p>
            </div>
            {/* Navigation Menu - Inline with Header */}
            <nav className="flex flex-wrap items-center gap-1 md:gap-2">
              {profileSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id);
                    setSearchParams({ tab: section.id });
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    activeTab === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <section.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{section.label}</span>
                  {section.count !== undefined && section.count > 0 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {section.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Profile Section - Horizontal Layout */}
        <Card className="mb-4"></Card>

        {/* Main Content - Full Width */}
        <div className="w-full">
          {activeTab === "orders" && <MyOrders />}
          {activeTab === "wishlist" && <Wishlist />}
          {activeTab === "payments" && <PaymentMethods />}
          {activeTab === "addresses" && <Addresses />}
          {activeTab === "redemption" && (
            <Card>
              <CardContent className="p-6">
                <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Available Points
                      </p>
                      <p className="text-4xl font-bold text-primary">
                        {user?.preBookingInfo?.redemptionPoints?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                    <Gift className="w-12 h-12 text-primary/50" />
                  </div>
                </div>
                <Link to="/redemption">
                  <Button className="w-full">Browse Redemption Shop</Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {activeTab === "settings" && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    defaultValue={user?.phone}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}
          {isDistributor && activeTab === "distributor" && (
            <DistributorOptions />
          )}
        </div>
      </div>
    </div>
  );
}
