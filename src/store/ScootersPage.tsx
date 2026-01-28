import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Zap, Battery, Clock, Weight, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScooterCard } from "./ScooterCard";
import { StoreNavbar } from "./StoreNavbar";
import { Footer } from "@/components/Footer";
import { useGetVehiclesQuery } from "@/app/api/inventoryApi";
import { mapVehicleGroupsToScooters } from "./utils/vehicleMapper";
import { InlineLoadingSpinner } from "@/components/ui/loading-spinner";

export function ScootersPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "available" | "out_of_stock" | "discontinued">("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedBattery, setSelectedBattery] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All Prices");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Build query parameters for API
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      page_size: pageSize,
    };

    // Search query
    if (search.trim()) {
      params.search = search.trim();
    }

    // Status filter
    if (selectedStatus !== "All") {
      params.status = selectedStatus;
    }

    // Color filter
    if (selectedColor !== "All") {
      params.color = selectedColor;
    }

    // Battery filter
    if (selectedBattery !== "All") {
      params.battery = selectedBattery;
    }

    // Price range filter
    if (selectedPriceRange !== "All Prices") {
      const priceRanges = [
        { label: 'All Prices', min: 0, max: Infinity },
        { label: 'Under ₹90,000', min: 0, max: 90000 },
        { label: '₹90,000 - ₹1,10,000', min: 90000, max: 110000 },
        { label: '₹1,10,000 - ₹1,30,000', min: 110000, max: 130000 },
        { label: 'Above ₹1,30,000', min: 130000, max: Infinity },
      ];
      const priceRange = priceRanges.find(pr => pr.label === selectedPriceRange);
      if (priceRange) {
        params.min_price = priceRange.min;
        // Only set max_price if it's not Infinity
        if (priceRange.max !== Infinity) {
          params.max_price = priceRange.max;
        }
      }
    }

    return params;
  }, [search, selectedStatus, selectedColor, selectedBattery, selectedPriceRange, currentPage]);

  // Fetch vehicles from API
  const { data: inventoryData, isLoading, error } = useGetVehiclesQuery(queryParams);

  // Map API response to Scooter format
  const scooters = useMemo(() => {
    return inventoryData?.results 
      ? mapVehicleGroupsToScooters(inventoryData.results)
      : [];
  }, [inventoryData]);

  // Extract available colors and batteries for filter options
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    inventoryData?.results.forEach(vehicle => {
      vehicle.colors_available.forEach(color => colors.add(color));
    });
    return Array.from(colors).sort();
  }, [inventoryData]);

  const availableBatteries = useMemo(() => {
    const batteries = new Set<string>();
    inventoryData?.results.forEach(vehicle => {
      vehicle.battery_capacities_available.forEach(battery => batteries.add(battery));
    });
    return Array.from(batteries).sort();
  }, [inventoryData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, selectedColor, selectedBattery, selectedPriceRange]);

  // Check if any filter/search is active (for "Clear all" action)
  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        search.trim() ||
          selectedStatus !== "All" ||
          selectedColor !== "All" ||
          selectedBattery !== "All" ||
          selectedPriceRange !== "All Prices"
      ),
    [search, selectedStatus, selectedColor, selectedBattery, selectedPriceRange]
  );

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar solidBackground />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
          {/* Header with Search */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
            {/* Left: Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 font-display">
                Electric Scooters
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Discover premium electric scooters from Zuja Electric. Choose from
                our collection of {inventoryData?.count || 0} high-performance models
              </p>
            </motion.div>

            {/* Right: Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-auto lg:min-w-[320px]"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search scooters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") return;
                  }}
                  className="w-full pl-11 pr-4 h-11 rounded-full bg-background border-input shadow-sm focus-visible:ring-1"
                />
              </div>
            </motion.div>
          </div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            {/* Filter Dropdowns - Grid Layout on Mobile, Row Layout on Desktop */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Status Dropdown */}
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as any)}
              >
                <SelectTrigger className="w-full h-11 rounded-full bg-background border-input shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              {/* Color Dropdown */}
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="w-full h-11 rounded-full bg-background border-input shadow-sm">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Colors</SelectItem>
                  {availableColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Battery Dropdown */}
              <Select value={selectedBattery} onValueChange={setSelectedBattery}>
                <SelectTrigger className="w-full h-11 rounded-full bg-background border-input shadow-sm">
                  <SelectValue placeholder="Battery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Batteries</SelectItem>
                  {availableBatteries.map((battery) => (
                    <SelectItem key={battery} value={battery}>
                      {battery}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range Dropdown */}
              <Select
                value={selectedPriceRange}
                onValueChange={setSelectedPriceRange}
              >
                <SelectTrigger className="w-full h-11 rounded-full bg-background border-input shadow-sm">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Prices">All Prices</SelectItem>
                  <SelectItem value="Under ₹90,000">Under ₹90,000</SelectItem>
                  <SelectItem value="₹90,000 - ₹1,10,000">₹90,000 - ₹1,10,000</SelectItem>
                  <SelectItem value="₹1,10,000 - ₹1,30,000">₹1,10,000 - ₹1,30,000</SelectItem>
                  <SelectItem value="Above ₹1,30,000">Above ₹1,30,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="mb-8 text-sm font-medium bg-gradient-to-r from-[#15b0bb] to-[#16bf9b] bg-clip-text text-transparent">
            {isLoading ? (
              <InlineLoadingSpinner />
            ) : (
              <>
                Showing {scooters.length} of {inventoryData?.count || 0} scooters
                {inventoryData && inventoryData.total_pages > 1 && (
                  <span className="ml-2">
                    (Page {inventoryData.current_page} of {inventoryData.total_pages})
                  </span>
                )}
              </>
            )}
          </div>

          {/* Scooters Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[380px] bg-card border border-border/50 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-muted-foreground mb-4">
                Failed to load scooters. Please try again later.
              </p>
            </motion.div>
          ) : scooters.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {scooters.map((scooter, i) => (
                  <ScooterCard key={scooter.id} scooter={scooter} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {inventoryData && inventoryData.total_pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!inventoryData.previous || currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, inventoryData.total_pages) }, (_, i) => {
                      let pageNum: number;
                      if (inventoryData.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= inventoryData.total_pages - 2) {
                        pageNum = inventoryData.total_pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(inventoryData.total_pages, prev + 1))}
                    disabled={!inventoryData.next || currentPage === inventoryData.total_pages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-xl text-muted-foreground mb-4">
                No scooters found
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedStatus("All");
                  setSelectedColor("All");
                  setSelectedBattery("All");
                  setSelectedPriceRange("All Prices");
                  setCurrentPage(1);
                }}
                className="text-primary hover:underline"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Features Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative py-10 overflow-hidden"
        style={{
          background: "linear-gradient(90deg, rgba(21,176,187,0.18) 0%, rgba(22,191,155,0.12) 20%, rgba(245,250,249,1) 50%, rgba(22,191,155,0.12) 80%, rgba(21,176,187,0.18) 100%)"
        }}
      >
        {/* Decorative dots */}
        <div className="absolute top-4 right-8 w-3 h-3 rounded-full bg-[#16bf9b]/70" />
        <div className="absolute bottom-4 left-12 w-3 h-3 rounded-full bg-[#15b0bb]/60" />
        <div className="absolute bottom-6 left-1/4 w-2 h-2 rounded-full bg-[#15b0bb]/50" />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-[#16bf9b]/40" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Zap, title: "Instant Power", subtitle: "Electric Motors" },
              { icon: Battery, title: "Long Range", subtitle: "Up to 120km" },
              { icon: Clock, title: "Fast Charging", subtitle: "2-4 Hours" },
              { icon: Weight, title: "Lightweight", subtitle: "28-48 kg" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#15b0bb]/15 to-[#16bf9b]/10 flex items-center justify-center border border-[#15b0bb]/10">
                  <feature.icon className="w-5 h-5 text-[#15b0bb]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Need Help Choosing Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative py-20 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-3 h-3 rounded-full bg-[#16bf9b]/30" />
        <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-[#15b0bb]/40" />
        <div className="absolute bottom-16 left-1/4 w-4 h-4 rounded-full bg-[#16bf9b]/20" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-orange-300/50" />
        <div className="absolute bottom-20 right-10 w-3 h-3 rounded-full bg-[#15b0bb]/30" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Need Help{" "}
              <span className="bg-gradient-to-r from-[#15b0bb] to-[#16bf9b] bg-clip-text text-transparent">
                Choosing?
              </span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Our experts are ready to help you find the perfect scooter for your needs
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Book a Test Ride Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100"
            >
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-orange-300/60" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">Book a Test Ride</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Experience our scooters firsthand. Visit our showroom or request a home test ride.
              </p>
              <Link to="/test-ride">
                <Button className="rounded-full bg-gradient-to-r from-[#15b0bb] to-[#16bf9b] hover:from-[#13a0aa] hover:to-[#14af8b] shadow-[0_8px_20px_rgba(21,176,187,0.35)] px-6">
                  Schedule Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Talk to an Expert Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative rounded-3xl p-8 shadow-[0_8px_30px_rgba(21,176,187,0.3)]"
              style={{
                background: "linear-gradient(135deg, #15b0bb 0%, #16bf9b 100%)"
              }}
            >
              <h3 className="text-xl font-bold text-white mb-3">Talk to an Expert</h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Get personalized recommendations based on your commute, preferences, and budget.
              </p>
              <Link to="/contact">
                <button className="relative rounded-full px-6 py-2.5 font-medium text-sm bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 transition-all duration-200 inline-flex items-center gap-2">
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
}
