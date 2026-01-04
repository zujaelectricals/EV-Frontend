import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
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
import {
  scooters,
  brands,
  priceRanges,
  mileageRanges,
  categories,
} from "./data/scooters";
import { StoreNavbar } from "./StoreNavbar";
import { Footer } from "@/components/Footer";

export function ScootersPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Featured");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All Prices");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedMileageRange, setSelectedMileageRange] =
    useState("All Ranges");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredScooters = useMemo(() => {
    let result = [...scooters];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.brand.toLowerCase().includes(searchLower)
      );
    }

    // Brand filter
    if (selectedBrand !== "All") {
      result = result.filter(
        (s) => s.brand.toUpperCase() === selectedBrand.toUpperCase()
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter(
        (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    const priceRange = priceRanges.find(
      (pr) => pr.label === selectedPriceRange
    );
    if (priceRange && selectedPriceRange !== "All Prices") {
      result = result.filter(
        (s) => s.price >= priceRange.min && s.price <= priceRange.max
      );
    }

    // Mileage range filter
    const mileageRange = mileageRanges.find(
      (mr) => mr.label === selectedMileageRange
    );
    if (mileageRange && selectedMileageRange !== "All Ranges") {
      result = result.filter(
        (s) => s.range >= mileageRange.min && s.range <= mileageRange.max
      );
    }

    // Sorting
    switch (selectedSort) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Best Range":
        result.sort((a, b) => b.range - a.range);
        break;
      case "Top Speed":
        result.sort((a, b) => b.topSpeed - a.topSpeed);
        break;
      default:
        // Featured - bestsellers and new first
        result.sort((a, b) => {
          const aScore = (a.isBestseller ? 2 : 0) + (a.isNew ? 1 : 0);
          const bScore = (b.isBestseller ? 2 : 0) + (b.isNew ? 1 : 0);
          return bScore - aScore;
        });
    }

    return result;
  }, [
    search,
    selectedBrand,
    selectedCategory,
    selectedPriceRange,
    selectedMileageRange,
    selectedSort,
  ]);

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
              our collection of {scooters.length} high-performance models
            </p>
          </motion.div>

          {/* Filters Section - Responsive Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 sm:p-6 bg-card/50 border border-border rounded-2xl"
          >
            {/* Search Bar - Full Width on Mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 lg:mb-6">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search scooters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Search is already reactive, but we can add explicit handling if needed
                    }
                  }}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                type="button"
                onClick={() => {
                  // Search is already reactive via state, but button provides explicit action
                }}
                className="w-full sm:w-auto shrink-0"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filter Dropdowns - Grid Layout on Mobile, Row Layout on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-4">
              {/* Category Dropdown */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Brand Dropdown */}
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range Dropdown */}
              <Select
                value={selectedPriceRange}
                onValueChange={setSelectedPriceRange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mileage Range Dropdown */}
              <Select
                value={selectedMileageRange}
                onValueChange={setSelectedMileageRange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Mileage Range" />
                </SelectTrigger>
                <SelectContent>
                  {mileageRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Dropdown */}
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Featured">Featured</SelectItem>
                  <SelectItem value="Price: Low to High">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="Price: High to Low">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="Best Range">Best Range</SelectItem>
                  <SelectItem value="Top Speed">Top Speed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredScooters.length} of {scooters.length} scooters
          </div>

          {/* Scooters Grid */}
          {filteredScooters.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredScooters.map((scooter, i) => (
                <ScooterCard key={scooter.id} scooter={scooter} index={i} />
              ))}
            </div>
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
                  setSelectedBrand("All");
                  setSelectedCategory("All");
                  setSelectedPriceRange("All Prices");
                  setSelectedMileageRange("All Ranges");
                  setSelectedSort("Featured");
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
