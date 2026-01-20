import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Battery, Gauge, Zap, Shield, Check, Star, 
  ChevronRight, Clock, Package, ChevronLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreNavbar } from './StoreNavbar';
import { PreBookingModal } from './components/PreBookingModal';
import { useAppSelector } from '@/app/hooks';
import { Footer } from '@/components/Footer';
import { useGetStockQuery } from '@/app/api/inventoryApi';
import { Scooter } from './ScooterCard';

export function ScooterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedColor, setSelectedColor] = useState(0);
  const [showPreBookingModal, setShowPreBookingModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const referralCode = searchParams.get('ref');

  // Scroll to top when component mounts or when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Extract variant ID from the scooter ID
  // ID format: vehicle-{name}-{variantId} or just numeric ID
  const variantId = useMemo(() => {
    if (!id) return null;
    
    // First, try to parse the entire ID as a number (for direct variant IDs)
    const directId = parseInt(id, 10);
    if (!isNaN(directId)) {
      return directId;
    }
    
    // Otherwise, extract from format: vehicle-{name}-{variantId}
    // Find the last numeric segment in the ID
    const parts = id.split('-');
    // Try the last part first
    const lastPart = parts[parts.length - 1];
    let parsedId = parseInt(lastPart, 10);
    
    // If last part is not a number, try to find a number at the end of the ID
    if (isNaN(parsedId)) {
      const match = id.match(/-(\d+)$/);
      if (match) {
        parsedId = parseInt(match[1], 10);
      }
    }
    
    return isNaN(parsedId) ? null : parsedId;
  }, [id]);

  // Fetch stock details if variant ID is available
  const { data: stockData, isLoading: stockLoading, error: stockError } = useGetStockQuery(
    variantId!,
    { skip: !variantId }
  );

  // Reset selected image index when stockData changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [stockData?.id]);

  // Create scooter object from stock data if available
  const scooter = useMemo<Scooter | null>(() => {
    if (stockData) {
      // Create scooter from stock data using actual API response structure
      const specs = stockData.specifications || {};
      const batteryInfo = specs['Battery'] || '';
      const batteryVoltage = batteryInfo ? batteryInfo.split('×')[0]?.trim() || batteryInfo : '';
      const batteryCapacity = batteryInfo ? batteryInfo.split('×')[1]?.trim() || batteryInfo : '';
      const maxSpeedText = specs['Max Speed'] || specs['Top Speed'] || '0 km/h';
      const topSpeed = maxSpeedText ? parseFloat(maxSpeedText.replace(/[^0-9.]/g, '')) || 0 : 0;

      return {
        id: id || `variant-${stockData.id}`,
        name: stockData.vehicle_name || 'Unknown Vehicle',
        brand: 'ZUJA ELECTRIC',
        price: parseFloat(stockData.price || '0'),
        image: stockData.primary_image_url || stockData.images?.[0]?.image_url || '/placeholder.svg',
        range: 0,
        topSpeed,
        batteryCapacity: batteryCapacity || stockData.battery_variants?.[0] || '',
        batteryVoltage,
        motorPower: specs['Motor Power'] || specs['Power'] || '',
        rating: 4.5,
        reviews: 0,
        colors: stockData.vehicle_colors || [],
        isNew: false,
        isBestseller: false,
        isComingSoon: stockData.status === 'out_of_stock',
        description: stockData.description || '',
        category: 'scooter' as const,
        functions: stockData.features || [],
        specifications: specs,
        variant: stockData,
      } as Scooter;
    }
    return null;
  }, [stockData, id]);

  // Handle loading state
  if (stockLoading && variantId) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading scooter details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle error state
  if (stockError && variantId) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Scooter</h1>
            <p className="text-muted-foreground mb-4">Failed to load scooter details. Please try again.</p>
            <Link to="/scooters">
              <Button>Back to Scooters</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle not found state
  if (!scooter) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Scooter Not Found</h1>
            <Link to="/scooters">
              <Button>Back to Scooters</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = [
    { label: 'Range', value: `${scooter.range}+ km`, icon: Battery },
    { label: 'Top Speed', value: `${scooter.topSpeed} km/h`, icon: Gauge },
    { label: 'Battery', value: scooter.batteryVoltage || scooter.batteryCapacity, icon: Zap },
    { label: 'Charging', value: scooter.chargingTime || '4-5h', icon: Clock },
  ];

  const features = scooter.functions || [
    'USB Charging Port',
    'Parking Mode',
    'Reverse Gear',
    'Digital Meter',
    'LED Projector Light',
    'Eco-Power-Sport Mode',
    'Tubeless Tyres',
    'Disc & Drum Brakes',
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
              {/* Main Image with Navigation */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted rounded-3xl overflow-hidden group">
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

                {/* Get images from stockData or fallback to scooter.image */}
                {(() => {
                  const images = stockData?.images && stockData.images.length > 0 
                    ? stockData.images 
                    : stockData?.primary_image_url 
                      ? [{ image_url: stockData.primary_image_url, is_primary: true }]
                      : scooter.image 
                        ? [{ image_url: scooter.image, is_primary: true }]
                        : [];
                  
                  const currentImage = images[selectedImageIndex]?.image_url || scooter.image || '/placeholder.svg';
                  const hasMultipleImages = images.length > 1;

                  return (
                    <>
                      <img
                        key={selectedImageIndex}
                        src={currentImage}
                        alt={scooter.name}
                        className="w-full h-full object-contain p-8 transition-opacity duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />

                      {/* Navigation Arrows - Only show if multiple images */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex((prev) => 
                                prev === 0 ? images.length - 1 : prev - 1
                              );
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border border-border/50"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-6 h-6 text-foreground" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex((prev) => 
                                prev === images.length - 1 ? 0 : prev + 1
                              );
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border border-border/50"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-6 h-6 text-foreground" />
                          </button>
                        </>
                      )}

                      {/* Image Counter - Only show if multiple images */}
                      {hasMultipleImages && (
                        <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground border border-border/50">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Thumbnail Images - Only show if multiple images */}
              {(() => {
                const images = stockData?.images && stockData.images.length > 0 
                  ? stockData.images 
                  : stockData?.primary_image_url 
                    ? [{ image_url: stockData.primary_image_url, is_primary: true }]
                    : scooter.image 
                      ? [{ image_url: scooter.image, is_primary: true }]
                      : [];
                
                if (images.length <= 1) return null;

                return (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, index) => {
                      const imageUrl = img.image_url || img;
                      const isSelected = selectedImageIndex === index;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected 
                              ? 'border-primary scale-105 shadow-md' 
                              : 'border-border/50 hover:border-border'
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`${scooter.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 border-2 border-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

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
                {/* <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(128 reviews)</span>
                </div> */}
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
              </div>

              {/* Quick Specs */}
              {/* <div className="grid grid-cols-4 gap-3">
                {specs.map((spec, i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-xl text-center">
                    <spec.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-sm font-semibold">{spec.value}</div>
                    <div className="text-xs text-muted-foreground">{spec.label}</div>
                  </div>
                ))}
              </div> */}

              {/* Stock Information */}
              {stockData && (
                <div className="p-6 bg-card/50 border border-border/50 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Stock Information</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                      <div className="text-2xl font-bold text-primary">{stockData.total_quantity || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total Stock</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stockData.available_quantity || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Available</div>
                    </div>
                    <div className="text-center p-3 bg-amber-500/10 rounded-xl">
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {stockData.reserved_quantity || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Reserved</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Model Code:</span>
                      <span className="text-sm font-semibold">{stockData.vehicle_model_code || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={`text-sm font-semibold capitalize ${
                        stockData.status === 'available' ? 'text-emerald-600' :
                        stockData.status === 'out_of_stock' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {stockData.status ? stockData.status.replace(/_/g, ' ') : 'Unknown'}
                      </span>
                    </div>
                    {stockData.vehicle_colors && stockData.vehicle_colors.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Color:</span>
                        <span className="text-sm font-semibold capitalize">
                          {stockData.vehicle_colors.join(', ')}
                        </span>
                      </div>
                    )}
                    {stockData.battery_variants && stockData.battery_variants.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Battery:</span>
                        <span className="text-sm font-semibold">
                          {stockData.battery_variants.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div>
                {isAuthenticated ? (
                  <Button 
                    onClick={() => setShowPreBookingModal(true)} 
                    className="w-full text-lg py-6"
                  >
                    Pre-Book Now
                  </Button>
                ) : (
                  <Link to={`/login${referralCode ? `?ref=${referralCode}` : ''}`} className="block">
                    <Button className="w-full text-lg py-6">Login to Pre-Book</Button>
                  </Link>
                )}
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
                  {stockData && stockData.specifications ? (
                    // Use specifications from API response
                    Object.entries(stockData.specifications)
                      .filter(([_, value]) => value && value.toString().trim() !== '')
                      .map(([label, value], i) => (
                        <div key={i} className="flex justify-between p-4 bg-muted/30 rounded-xl">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))
                  ) : scooter.specifications ? (
                    // Fallback to scooter specifications if stockData is not available
                    Object.entries(scooter.specifications)
                      .filter(([_, value]) => value && value.toString().trim() !== '')
                      .map(([label, value], i) => (
                        <div key={i} className="flex justify-between p-4 bg-muted/30 rounded-xl">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))
                  ) : (
                    // Fallback message if no specifications available
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      No specifications available
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="text-center py-12 text-muted-foreground">
                  <p>Reviews coming soon. Be the first to review this scooter!</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Other Variants Section */}
          {stockData && stockData.other_variants && stockData.other_variants.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Other Variants</h2>
                <p className="text-muted-foreground">
                  Explore other variants of {stockData.vehicle_name || 'this vehicle'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stockData.other_variants.map((variant, index) => {
                  const variantId = `vehicle-${stockData.vehicle_name?.toLowerCase().replace(/\s+/g, '-') || 'variant'}-${variant.id}`;
                  return (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      onClick={() => navigate(`/scooters/${variantId}`)}
                      className="group relative bg-card border border-border/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer"
                    >
                      {/* Variant Image */}
                      <div className="relative h-64 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/30 overflow-hidden">
                        <img
                          src={variant.primary_image_url || variant.images?.[0]?.image_url || '/placeholder.svg'}
                          alt={variant.model_code}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-lg ${
                            variant.status === 'available' ? 'bg-emerald-500 text-white' :
                            variant.status === 'out_of_stock' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {variant.status === 'available' ? 'Available' : 
                             variant.status === 'out_of_stock' ? 'Out of Stock' : 
                             'Discontinued'}
                          </span>
                        </div>
                      </div>

                      {/* Variant Details */}
                      <div className="p-5 space-y-4">
                        {/* Model Code & Name */}
                        <div>
                          <h4 className="font-bold text-foreground text-base mb-1 line-clamp-1">
                            {variant.model_code}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {stockData.vehicle_name}
                          </p>
                        </div>

                        {/* Color & Battery */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {variant.vehicle_color && variant.vehicle_color.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                              <span className="text-muted-foreground">Color:</span>
                              <span className="font-semibold capitalize">{variant.vehicle_color[0]}</span>
                            </div>
                          )}
                          {variant.battery_variant && variant.battery_variant.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
                              <span className="text-muted-foreground">Battery:</span>
                              <span className="font-semibold">{variant.battery_variant[0]}</span>
                            </div>
                          )}
                        </div>

                        {/* Stock Info */}
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                          <div className="text-center p-2 bg-emerald-500/10 rounded-lg">
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {variant.stock_available_quantity || 0}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Available</div>
                          </div>
                          <div className="text-center p-2 bg-amber-500/10 rounded-lg">
                            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                              {variant.stock_reserved_quantity || 0}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Reserved</div>
                          </div>
                          <div className="text-center p-2 bg-primary/10 rounded-lg">
                            <div className="text-lg font-bold text-primary">
                              {variant.stock_total_quantity || 0}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Total</div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="pt-3 border-t border-border/50">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                ₹{parseFloat(variant.price || '0').toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">Ex-showroom</div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/scooters/${variantId}`);
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Pre-Booking Modal */}
      {showPreBookingModal && (
        <PreBookingModal
          scooter={scooter}
          isOpen={showPreBookingModal}
          onClose={() => setShowPreBookingModal(false)}
          referralCode={referralCode || undefined}
          stockData={stockData || undefined}
        />
      )}
      <Footer />
    </div>
  );
}
