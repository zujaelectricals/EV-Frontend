import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Clock, Gift, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addTransaction, setAvailablePoints } from '@/app/slices/redemptionSlice';
import { updatePreBooking } from '@/app/slices/authSlice';
import { toast } from 'sonner';
import { RedemptionProduct, PartnerShop } from '@/app/slices/redemptionSlice';

// Mock data - replace with API calls
const mockShops: PartnerShop[] = [
  { id: 'shop1', name: 'Electronics Hub', category: 'Electronics', description: 'Premium electronics and gadgets' },
  { id: 'shop2', name: 'Fashion Store', category: 'Fashion', description: 'Trendy fashion and accessories' },
  { id: 'shop3', name: 'Home Essentials', category: 'Home', description: 'Home and kitchen products' },
  { id: 'shop4', name: 'Sports Zone', category: 'Sports', description: 'Sports and fitness equipment' },
];

const mockProducts: RedemptionProduct[] = [
  { id: 'p1', shopId: 'shop1', shopName: 'Electronics Hub', name: 'Wireless Earbuds', description: 'Premium quality wireless earbuds', points: 1500, category: 'Electronics', available: true },
  { id: 'p2', shopId: 'shop1', shopName: 'Electronics Hub', name: 'Smart Watch', description: 'Feature-rich smartwatch', points: 3000, category: 'Electronics', available: true },
  { id: 'p3', shopId: 'shop2', shopName: 'Fashion Store', name: 'Designer T-Shirt', description: 'Premium cotton t-shirt', points: 800, category: 'Fashion', available: true },
  { id: 'p4', shopId: 'shop2', shopName: 'Fashion Store', name: 'Leather Wallet', description: 'Genuine leather wallet', points: 1200, category: 'Fashion', available: true },
  { id: 'p5', shopId: 'shop3', shopName: 'Home Essentials', name: 'Coffee Maker', description: 'Automatic coffee maker', points: 2500, category: 'Home', available: true },
  { id: 'p6', shopId: 'shop4', shopName: 'Sports Zone', name: 'Yoga Mat', description: 'Premium yoga mat', points: 1000, category: 'Sports', available: true },
];

export function RedemptionShop() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<RedemptionProduct | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const availablePoints = user?.preBookingInfo?.redemptionPoints || 0;
  const redemptionEligible = user?.preBookingInfo?.redemptionEligible || false;
  const preBookingDate = user?.preBookingInfo?.preBookingDate;

  // Calculate days until eligibility
  const daysUntilEligible = useMemo(() => {
    if (!preBookingDate || redemptionEligible) return 0;
    const bookingDate = new Date(preBookingDate);
    const oneYearLater = new Date(bookingDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const today = new Date();
    const diffTime = oneYearLater.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [preBookingDate, redemptionEligible]);

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shopName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const categories = ['All', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const handleRedeem = (product: RedemptionProduct) => {
    if (!redemptionEligible) {
      toast.error('Redemption is only available after 1 year from pre-booking date');
      return;
    }

    if (availablePoints < product.points) {
      toast.error('Insufficient points');
      return;
    }

    setSelectedProduct(product);
    setShowRedeemModal(true);
  };

  const confirmRedeem = () => {
    if (!selectedProduct) return;

    // Create redemption transaction
    const transaction = {
      id: `redeem-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      points: selectedProduct.points,
      status: 'pending' as const,
      redeemedAt: new Date().toISOString(),
    };

    dispatch(addTransaction(transaction));

    // Update user points
    const newPoints = availablePoints - selectedProduct.points;
    dispatch(setAvailablePoints(newPoints));
    
    if (user?.preBookingInfo) {
      dispatch(updatePreBooking({
        ...user.preBookingInfo,
        redemptionPoints: newPoints,
      }));
    }

    toast.success(`Successfully redeemed ${selectedProduct.points} points for ${selectedProduct.name}`);
    setShowRedeemModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Redemption Points
          </CardTitle>
          <CardDescription>
            Redeem your points at partner shops after 1 year from pre-booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Points</p>
                <p className="text-4xl font-bold text-primary">{availablePoints.toLocaleString()}</p>
                {!redemptionEligible && daysUntilEligible > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Eligible in {daysUntilEligible} days
                  </p>
                )}
              </div>
              <Gift className="w-12 h-12 text-primary/50" />
            </div>
          </div>

          {!redemptionEligible && (
            <Alert className="mt-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {daysUntilEligible > 0 
                  ? `Your redemption points will be available in ${daysUntilEligible} days (1 year after pre-booking).`
                  : 'Your redemption points are being processed and will be available soon.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{product.category}</Badge>
                  {!product.available && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.shopName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Points Required</p>
                    <p className="text-2xl font-bold text-primary">{product.points.toLocaleString()}</p>
                  </div>
                  <Button
                    onClick={() => handleRedeem(product)}
                    disabled={!redemptionEligible || !product.available || availablePoints < product.points}
                    size="sm"
                  >
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      )}

      {/* Redeem Confirmation Modal */}
      <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this product?
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold mb-2">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground mb-3">{selectedProduct.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Points Required:</span>
                  <span className="font-semibold">{selectedProduct.points.toLocaleString()} points</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Points After Redemption:</span>
                  <span className="font-semibold">{(availablePoints - selectedProduct.points).toLocaleString()} points</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowRedeemModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={confirmRedeem} className="flex-1">
                  Confirm Redemption
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

