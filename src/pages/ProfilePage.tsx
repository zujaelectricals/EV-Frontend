import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Package, Heart, CreditCard, Settings, 
  Gift, FileText, Award, Users, DollarSign, 
  Link as LinkIcon, GitBranch, Wallet, MapPin,
  ChevronRight, ShoppingBag, Calendar, Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/app/hooks';
import { Link } from 'react-router-dom';
import { MyOrders } from './profile/MyOrders';
import { Wishlist } from './profile/Wishlist';
import { PaymentMethods } from './profile/PaymentMethods';
import { DistributorOptions } from './profile/DistributorOptions';
import { Addresses } from './profile/Addresses';

export function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { bookings } = useAppSelector((state) => state.booking);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Check if user is a distributor - either verified or has distributor info
  const isDistributor = (user?.isDistributor && user?.distributorInfo?.isVerified) || 
                        (user?.distributorInfo && user.distributorInfo.verificationStatus === 'approved');

  const profileSections = [
    { id: 'orders', label: 'My Orders', icon: Package, count: bookings.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlistItems.length },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'redemption', label: 'Redemption Points', icon: Gift },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    ...(isDistributor ? [
      { id: 'distributor', label: 'Distributor', icon: Award },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your orders, profile, and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{user?.name || 'User'}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {isDistributor && (
                      <Badge className="mt-1 bg-success text-success-foreground">
                        Distributor
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {profileSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveTab(section.id);
                        setSearchParams({ tab: section.id });
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        activeTab === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className="w-5 h-5" />
                        <span className="font-medium">{section.label}</span>
                      </div>
                      {section.count !== undefined && section.count > 0 && (
                        <Badge variant="secondary">{section.count}</Badge>
                      )}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && <MyOrders />}
            {activeTab === 'wishlist' && <Wishlist />}
            {activeTab === 'payments' && <PaymentMethods />}
            {activeTab === 'addresses' && <Addresses />}
            {activeTab === 'redemption' && (
              <Card>
                <CardHeader>
                  <CardTitle>Redemption Points</CardTitle>
                  <CardDescription>
                    Redeem your points at partner shops after 1 year from pre-booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Available Points</p>
                        <p className="text-4xl font-bold text-primary">
                          {user?.preBookingInfo?.redemptionPoints?.toLocaleString() || '0'}
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
            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account information and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
            {isDistributor && activeTab === 'distributor' && <DistributorOptions />}
          </div>
        </div>
      </div>
    </div>
  );
}

