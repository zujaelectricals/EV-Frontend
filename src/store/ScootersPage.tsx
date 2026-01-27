import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
      <StoreNavbar />

      <div className="pt-24 pb-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 font-display">
              Electric Scooters
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover premium electric scooters from Zuja Electric. Choose from
              our collection of {inventoryData?.count || 0} high-performance models
            </p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <div className="mb-3 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
              <div className="relative w-full sm:w-[360px] lg:w-[420px] sm:ml-auto">
                <Input
                  placeholder="Search scooters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") return;
                  }}
                  className="w-full pr-12 rounded-full bg-background/80 border-input shadow-sm focus-visible:ring-1"
                />
                {/* Search icon button overlayed on the right of the input on desktop */}
                <div className="pointer-events-none absolute inset-y-0 right-2 hidden sm:flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* Mobile search button (below input) */}
              <div className="sm:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground shadow-sm"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 p-3 sm:p-4 bg-card/70 border border-border rounded-2xl shadow-sm"
          >
            {/* Filter Dropdowns - Grid Layout on Mobile, Row Layout on Desktop */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 sm:gap-4 lg:gap-4">
              {/* Status Dropdown */}
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as any)}
              >
                <SelectTrigger className="w-full rounded-full bg-background/80 border-input shadow-sm">
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
                <SelectTrigger className="w-full rounded-full bg-background/80 border-input shadow-sm">
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
                <SelectTrigger className="w-full rounded-full bg-background/80 border-input shadow-sm">
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
                <SelectTrigger className="w-full rounded-full bg-background/80 border-input shadow-sm">
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
          <div className="mb-6 text-sm text-muted-foreground">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-card border border-border/80 rounded-2xl animate-pulse" />
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
      <Footer />
    </div>
  );
}
