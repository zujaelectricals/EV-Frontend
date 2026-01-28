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
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

  // Auto-rotate product images every 3 seconds when multiple images are available
  useEffect(() => {
    const images =
      stockData?.images && stockData.images.length > 0
        ? stockData.images
        : stockData?.primary_image_url
        ? [{ image_url: stockData.primary_image_url, is_primary: true }]
        : scooter?.image
        ? [{ image_url: scooter.image, is_primary: true }]
        : [];

    if (!images || images.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setSelectedImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [stockData, scooter?.image]);

  // Handle loading state
  if (stockLoading && variantId) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar solidBackground />
        <div className="pt-20 pb-16 flex items-center justify-center">
          <LoadingSpinner text="Loading scooter details..." size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  // Handle error state
  if (stockError && variantId) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar solidBackground />
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
        <StoreNavbar solidBackground />
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
      <StoreNavbar solidBackground />

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
                      <motion.img
                        key={selectedImageIndex}
                        src={currentImage}
                        alt={scooter.name}
                        className="w-full h-full object-contain p-8"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
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

              {/* Price & Stock Panel */}
              <div className="glass-card rounded-3xl border border-border/70 shadow-glass p-6 lg:p-7 space-y-6">
                {/* Price Row */}
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      On-Road Pre‑Booking Price
                    </p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl lg:text-5xl font-bold text-primary leading-none">
                        ₹{scooter.price.toLocaleString()}
                      </span>
                      {scooter.originalPrice && (
                        <span className="text-sm lg:text-base text-muted-foreground line-through">
                          ₹{scooter.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Small badge block */}
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    {stockData?.status && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          stockData.status === 'available'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : stockData.status === 'out_of_stock'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            stockData.status === 'available'
                              ? 'bg-emerald-500'
                              : stockData.status === 'out_of_stock'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        {stockData.status.replace(/_/g, ' ')}
                      </span>
                    )}
                    {stockData?.vehicle_model_code && (
                      <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                        Model: <span className="text-foreground">{stockData.vehicle_model_code}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Information */}
                {stockData ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4 lg:px-5 lg:py-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Stock Information
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Live availability for this exact color & battery variant.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] items-stretch">
                      {/* Big availability pill */}
                      <div className="flex flex-col justify-center rounded-2xl bg-emerald-500/5 border border-emerald-500/30 px-5 py-4 text-center">
                        <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                          Available Units
                        </span>
                        <div className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-300">
                          {Number(stockData.available_quantity ?? 0).toLocaleString()}
                        </div>
                        <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-200/90">
                          Ready to be reserved instantly
                        </p>
                        {(stockData.reserved_quantity || stockData.total_quantity) && (
                          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-emerald-900/70 dark:text-emerald-100/80">
                            {typeof stockData.reserved_quantity !== 'undefined' && (
                              <span>
                                <span className="font-semibold">
                                  {Number(stockData.reserved_quantity).toLocaleString()}
                                </span>{' '}
                                reserved
                              </span>
                            )}
                            {typeof stockData.total_quantity !== 'undefined' && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-emerald-500/60" />
                                <span>
                                  <span className="font-semibold">
                                    {Number(stockData.total_quantity).toLocaleString()}
                                  </span>{' '}
                                  in stock
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Meta list */}
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {stockData.vehicle_colors && stockData.vehicle_colors.length > 0 && (
                          <div className="flex items-center justify-between rounded-xl bg-card/70 px-4 py-2.5 border border-border/60">
                            <span className="text-xs text-muted-foreground">Color</span>
                            <span className="text-sm font-semibold capitalize text-foreground text-right">
                              {stockData.vehicle_colors.join(', ')}
                            </span>
                          </div>
                        )}
                        {stockData.battery_variants && stockData.battery_variants.length > 0 && (
                          <div className="flex items-center justify-between rounded-xl bg-card/70 px-4 py-2.5 border border-border/60">
                            <span className="text-xs text-muted-foreground">Battery</span>
                            <span className="text-sm font-semibold text-foreground text-right">
                              {stockData.battery_variants.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4 lg:px-5 lg:py-5">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Stock information unavailable
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          We’re fetching live stock for this variant. Please try again in a moment or contact our team.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
            <Tabs defaultValue="features" className="w-full space-y-6">
              {/* Tab labels */}
              <TabsList className="w-full justify-between bg-muted/60 rounded-full border border-border/70 shadow-sm overflow-hidden">
                <TabsTrigger value="features" className="flex-1 md:flex-none">
                  Features
                </TabsTrigger>
                <TabsTrigger value="specs" className="flex-1 md:flex-none">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 md:flex-none">
                  Reviews
                </TabsTrigger>
              </TabsList>

              {/* Features */}
              <TabsContent value="features" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative flex items-center gap-3 p-4 lg:p-5 bg-card/70 border border-border/70 rounded-2xl shadow-sm hover:shadow-lg hover:border-emerald-400/70 hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-200">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.18em]">
                          Key Feature
                        </p>
                        <p className="text-base lg:text-lg font-semibold text-foreground leading-snug">
                          {feature}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Specifications */}
              <TabsContent value="specs" className="mt-8">
                <div className="grid md:grid-cols-2 gap-5">
                  {stockData && stockData.specifications ? (
                    // Use specifications from API response
                    Object.entries(stockData.specifications)
                      .filter(([_, value]) => value && value.toString().trim() !== '')
                      .map(([label, value], i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-4 p-4 lg:p-5 bg-muted/40 rounded-2xl border border-border/70 hover:border-emerald-400/70 hover:bg-background/90 hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </span>
                          <span className="text-sm lg:text-base font-semibold text-foreground text-right">
                            {value}
                          </span>
                        </div>
                      ))
                  ) : scooter.specifications ? (
                    // Fallback to scooter specifications if stockData is not available
                    Object.entries(scooter.specifications)
                      .filter(([_, value]) => value && value.toString().trim() !== '')
                      .map(([label, value], i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-4 p-4 lg:p-5 bg-muted/40 rounded-2xl border border-border/70 hover:border-emerald-400/70 hover:bg-background/90 hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {label}
                          </span>
                          <span className="text-sm lg:text-base font-semibold text-foreground text-right">
                            {value}
                          </span>
                        </div>
                      ))
                  ) : (
                    // Fallback message if no specifications available
                    <div className="col-span-2">
                      <div className="text-center py-10 px-6 rounded-3xl border border-dashed border-border/70 bg-muted/40">
                        <p className="text-sm lg:text-base text-muted-foreground">
                          No specifications available for this scooter yet. We’re updating this section soon.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="mt-8">
                <div className="max-w-2xl mx-auto">
                  <div className="glass-card rounded-3xl px-8 py-10 text-center border border-border/70">
                    <div className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] mb-4">
                      <Star className="w-4 h-4 mr-1" />
                      Reviews
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                      Reviews coming soon
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground mb-6">
                      Be the first to share your experience once you own this scooter. Your review helps other riders decide.
                    </p>
                    <Button variant="outline" size="lg" className="rounded-full px-8">
                      Notify me when reviews are live
                    </Button>
                  </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {stockData.other_variants.map((variant, index) => {
                  const variantId = `vehicle-${stockData.vehicle_name?.toLowerCase().replace(/\s+/g, '-') || 'variant'}-${variant.id}`;
                  return (
                    <motion.div
                      key={variant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      onClick={() => navigate(`/scooters/${variantId}`)}
                      className="group relative cursor-pointer"
                    >
                      <div className="relative rounded-3xl bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/70 shadow-[0_18px_40px_rgba(15,23,42,0.18)] overflow-visible">
                        {/* Image Section */}
                        <div className="relative h-56 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl rounded-b-none overflow-hidden">
                          <motion.img
                            src={variant.primary_image_url || variant.images?.[0]?.image_url || '/placeholder.svg'}
                            alt={variant.model_code}
                            whileHover={{ y: -6 }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                          {/* Status Badge */}
                          <div className="absolute top-4 left-4 z-10">
                            <span
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-md ${
                                variant.status === 'available'
                                  ? 'bg-emerald-500 text-white'
                                  : variant.status === 'out_of_stock'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-600 text-white'
                              }`}
                            >
                              {variant.status === 'available'
                                ? 'Available'
                                : variant.status === 'out_of_stock'
                                ? 'Out of Stock'
                                : 'Discontinued'}
                            </span>
                          </div>
                        </div>

                        {/* Bottom content panel */}
                        <div className="relative -mt-6 px-4 pb-4">
                          <div className="relative rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] px-5 pt-5 pb-4 space-y-4">
                            {/* Model Code & Name */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-1">
                                  {stockData.vehicle_name}
                                </p>
                                <h4 className="text-base sm:text-lg font-semibold text-slate-900 line-clamp-1">
                                  {variant.model_code}
                                </h4>
                              </div>
                            </div>

                            {/* Color & Battery */}
                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                              {variant.vehicle_color && variant.vehicle_color.length > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                                  <span className="text-slate-500">Color</span>
                                  <span className="font-semibold capitalize text-slate-900">
                                    {variant.vehicle_color[0]}
                                  </span>
                                </div>
                              )}
                              {variant.battery_variant && variant.battery_variant.length > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 border border-slate-200">
                                  <span className="text-slate-500">Battery</span>
                                  <span className="font-semibold text-slate-900">
                                    {variant.battery_variant[0]}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Price & CTA */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-1">
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-[0.16em] mb-0.5">
                                  Ex‑showroom
                                </p>
                                <div className="text-xl font-bold text-emerald-600">
                                  ₹{parseFloat(variant.price || '0').toLocaleString()}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.45)] hover:shadow-[0_14px_34px_rgba(16,185,129,0.6)]"
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
