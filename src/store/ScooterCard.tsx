import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { addToWishlist, removeFromWishlist } from "@/app/slices/wishlistSlice";
import { toast } from "sonner";

export interface Scooter {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  range: number;
  topSpeed: number;
  batteryCapacity: string;
  batteryVoltage?: string;
  power?: string;
  motorType?: string;
  motorPower?: string;
  chargingTime?: string;
  brakeType?: string;
  tyreType?: string;
  tyreSize?: string;
  frameType?: string;
  dimension?: string;
  wheelBase?: string;
  netWeight?: string;
  meterType?: string;
  headLight?: string;
  functions?: string[];
  ridingMode?: string;
  rating?: number;
  reviews?: number;
  colors: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  isComingSoon?: boolean;
  description?: string;
  category?: "scooter" | "loader";
}

interface ScooterCardProps {
  scooter: Scooter;
  index?: number;
}

export function ScooterCard({ scooter, index = 0 }: ScooterCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const isFavorited = wishlistItems.some((item) => item.id === scooter.id);

  const discount = scooter.originalPrice
    ? Math.round(
        ((scooter.originalPrice - scooter.price) / scooter.originalPrice) * 100
      )
    : 0;

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 1000).toFixed(0)}K`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const handleCardClick = () => {
    navigate(`/scooters/${scooter.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={handleCardClick}
      className="group relative bg-card border border-border/80 rounded-2xl overflow-hidden hover:shadow-neon-strong hover:border-primary/30 transition-all duration-300 glass-card cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-64 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/30 overflow-hidden">
        <motion.img
          src={scooter.image}
          alt={scooter.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/600x400/cccccc/666666?text=EV+Motorcycle";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isFavorited) {
              dispatch(removeFromWishlist(scooter.id));
              toast.success("Removed from wishlist");
            } else {
              dispatch(addToWishlist(scooter));
              toast.success("Added to wishlist");
            }
          }}
          className="absolute top-4 right-4 z-10 p-2.5 bg-background/95 backdrop-blur-md rounded-full hover:bg-background shadow-lg hover:scale-110 transition-all duration-200 border border-border/50"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isFavorited
                ? "fill-destructive text-destructive"
                : "text-muted-foreground hover:text-destructive"
            )}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {scooter.isNew && (
            <span className="px-3 py-1.5 bg-success text-success-foreground text-xs font-bold rounded-full shadow-md backdrop-blur-sm">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full shadow-md backdrop-blur-sm">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4 bg-card">
        {/* Brand & Name */}
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            {scooter.brand}
          </p>
          <h3 className="text-lg font-bold text-foreground mb-2 font-display">
            {scooter.name}
          </h3>

          {/* Description */}
          {scooter.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {scooter.description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">
                {scooter.rating?.toFixed(1) || "4.5"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({scooter.reviews?.toLocaleString() || "0"})
            </span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-4 border-t border-border/60">
          <div>
            {scooter.originalPrice && (
              <p className="text-xs text-muted-foreground line-through mb-1">
                {formatPrice(scooter.originalPrice)}
              </p>
            )}
            <p className="text-2xl font-bold text-foreground font-display">
              {formatPrice(scooter.price)}
            </p>
          </div>
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Link to={`/scooters/${scooter.id}`}>
              <Button
                size="sm"
                className={cn(
                  "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200 font-semibold",
                  scooter.isComingSoon &&
                    "bg-muted hover:bg-muted/80 text-foreground"
                )}
              >
                {scooter.isComingSoon ? "Notify Me" : "Pre-Book"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
