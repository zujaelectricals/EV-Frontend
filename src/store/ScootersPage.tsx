import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScooterCard } from './ScooterCard';
import { scooters, brands, priceRanges } from './data/scooters';
import { StoreNavbar } from './StoreNavbar';

export function ScootersPage() {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const filteredScooters = useMemo(() => {
    let result = [...scooters];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(searchLower) || s.brand.toLowerCase().includes(searchLower)
      );
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter(s => s.brand === selectedBrand);
    }

    // Price range filter
    const priceRange = priceRanges[selectedPriceRange];
    if (priceRange) {
      result = result.filter(s => s.price >= priceRange.min && s.price <= priceRange.max);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'range':
        result.sort((a, b) => b.range - a.range);
        break;
      case 'speed':
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
  }, [search, selectedBrand, selectedPriceRange, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedBrand('All');
    setSelectedPriceRange(0);
    setSortBy('featured');
  };

  const hasActiveFilters = search || selectedBrand !== 'All' || selectedPriceRange !== 0;

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">Electric Scooters</h1>
            <p className="text-muted-foreground">
              Find your perfect ride from our collection of {scooters.length} premium scooters
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search and Toggle */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search scooters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-4 p-4 bg-card/50 border border-border/50 rounded-xl"
              >
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Brand</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Price Range</label>
                  <Select
                    value={selectedPriceRange.toString()}
                    onValueChange={(v) => setSelectedPriceRange(Number(v))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range, i) => (
                        <SelectItem key={i} value={i.toString()}>{range.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="range">Best Range</SelectItem>
                      <SelectItem value="speed">Top Speed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                      <X className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredScooters.length} of {scooters.length} scooters
          </div>

          {/* Scooters Grid */}
          {filteredScooters.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <p className="text-xl text-muted-foreground mb-4">No scooters found</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
