import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Battery, Gauge, Zap, Shield, Check, Star, 
  ChevronRight, Truck, Clock, CreditCard, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { scooters } from './data/scooters';
import { StoreNavbar } from './StoreNavbar';

export function ScooterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(0);
  const [paymentType, setPaymentType] = useState<'full' | 'emi'>('full');

  const scooter = scooters.find(s => s.id === id);

  if (!scooter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Scooter Not Found</h1>
          <Link to="/scooters">
            <Button>Back to Scooters</Button>
          </Link>
        </div>
      </div>
    );
  }

  const emiOptions = [
    { months: 12, rate: Math.round(scooter.price / 12) + 500 },
    { months: 18, rate: Math.round(scooter.price / 18) + 400 },
    { months: 24, rate: Math.round(scooter.price / 24) + 300 },
  ];

  const specs = [
    { label: 'Range', value: `${scooter.range} km`, icon: Battery },
    { label: 'Top Speed', value: `${scooter.topSpeed} km/h`, icon: Gauge },
    { label: 'Battery', value: scooter.batteryCapacity, icon: Zap },
    { label: 'Warranty', value: '5 Years', icon: Shield },
  ];

  const features = [
    'Smart Digital Display',
    'LED DRL Headlamps',
    'Regenerative Braking',
    'Mobile App Connectivity',
    'GPS Navigation',
    'Anti-Theft Alarm',
    'USB Charging Port',
    'Boot Storage 22L',
  ];

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/scooters" className="hover:text-primary">Scooters</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{scooter.name}</span>
          </motion.div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted rounded-3xl overflow-hidden">
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  {scooter.isNew && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      NEW
                    </span>
                  )}
                  {scooter.isBestseller && (
                    <span className="px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                      BESTSELLER
                    </span>
                  )}
                </div>
                <img
                  src={scooter.image}
                  alt={scooter.name}
                  className="w-full h-full object-contain p-8"
                />
              </div>

              {/* Color Selection */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Color:</span>
                <div className="flex gap-2">
                  {scooter.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(i)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === i ? 'border-primary scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">{scooter.brand}</p>
                <h1 className="text-4xl font-bold text-foreground mt-1">{scooter.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(128 reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="p-6 bg-card/50 border border-border/50 rounded-2xl">
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-4xl font-bold text-primary">
                    ₹{scooter.price.toLocaleString()}
                  </span>
                  {scooter.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{scooter.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  *Ex-showroom price. On-road price may vary.
                </p>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-4 gap-3">
                {specs.map((spec, i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-xl text-center">
                    <spec.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-sm font-semibold">{spec.value}</div>
                    <div className="text-xs text-muted-foreground">{spec.label}</div>
                  </div>
                ))}
              </div>

              {/* Payment Options */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Payment Options</h3>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(v) => setPaymentType(v as 'full' | 'emi')}
                  className="space-y-3"
                >
                  <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-colors ${
                    paymentType === 'full' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="flex-1 cursor-pointer">
                      <div className="font-medium">Full Payment</div>
                      <div className="text-sm text-muted-foreground">
                        Pay ₹{scooter.price.toLocaleString()} upfront
                      </div>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-colors ${
                    paymentType === 'emi' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    <RadioGroupItem value="emi" id="emi" />
                    <Label htmlFor="emi" className="flex-1 cursor-pointer">
                      <div className="font-medium">EMI Options</div>
                      <div className="text-sm text-muted-foreground">
                        Starting from ₹{emiOptions[2].rate.toLocaleString()}/month
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentType === 'emi' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-muted/30 rounded-xl space-y-3"
                  >
                    {emiOptions.map((opt, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{opt.months} months</span>
                        <span className="font-medium">₹{opt.rate.toLocaleString()}/mo</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <Link to="/login" className="flex-1">
                  <Button className="w-full text-lg py-6">Book Now</Button>
                </Link>
                <Button variant="outline" className="py-6 px-6">
                  <MapPin className="w-5 h-5" />
                </Button>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4 text-primary" />
                  Free Delivery
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  2-3 Weeks
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Easy EMI
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="w-full justify-start bg-muted/30 p-1 rounded-xl">
                <TabsTrigger value="features" className="flex-1 md:flex-none">Features</TabsTrigger>
                <TabsTrigger value="specs" className="flex-1 md:flex-none">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 md:flex-none">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-4 bg-card/50 border border-border/50 rounded-xl"
                    >
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-8">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Motor Power', value: '3.5 kW' },
                    { label: 'Battery Type', value: 'Lithium-ion' },
                    { label: 'Charging Time', value: '4-5 hours' },
                    { label: 'Ground Clearance', value: '165 mm' },
                    { label: 'Kerb Weight', value: '95 kg' },
                    { label: 'Seat Height', value: '780 mm' },
                    { label: 'Wheel Size', value: '12 inch' },
                    { label: 'Braking', value: 'Disc (F&R)' },
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between p-4 bg-muted/30 rounded-xl">
                      <span className="text-muted-foreground">{spec.label}</span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="text-center py-12 text-muted-foreground">
                  <p>Reviews coming soon. Be the first to review this scooter!</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
