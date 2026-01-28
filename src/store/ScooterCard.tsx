import { motion } from "framer-motion";
import { Heart, Star, ArrowUpRight } from "lucide-react";
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
  specifications?: Record<string, string>;
  vehicleGroup?: any;
  variant?: any;
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
    ? Math.round(((scooter.originalPrice - scooter.price) / scooter.originalPrice) * 100)
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
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={handleCardClick}
      className="group relative cursor-pointer"
    >
      {/* Clean card design */}
      <div className="relative rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-[#16bf9b]/10 shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_40px_rgba(21,176,187,0.18)] transition-shadow duration-300 overflow-hidden">
        {/* Image Section - Light background */}
        <div className="relative h-52 bg-gradient-to-br from-slate-100/80 via-gray-50 to-white rounded-t-3xl overflow-hidden">
          <motion.img
            src={scooter.image}
            alt={scooter.name}
            whileHover={{ scale: 1.05 }}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/600x400/f8fafc/94a3b8?text=EV+Scooter";
            }}
          />

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
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:scale-110 hover:bg-white transition-all duration-200"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorited ? "fill-destructive text-destructive" : "text-slate-400 hover:text-slate-600",
              )}
            />
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {scooter.isNew && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-[#15b0bb] to-[#16bf9b] text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                <Star className="w-3 h-3" />
                New
              </span>
            )}
            {discount > 0 && (
              <span className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-full shadow-md">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Bottom content panel */}
        <div className="relative bg-white px-5 py-5">
          {/* Brand & Name */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-1 bg-gradient-to-r from-[#15b0bb] to-[#16bf9b] bg-clip-text text-transparent">
              {scooter.brand}
            </p>
            <h3 className="text-lg font-bold text-slate-900">
              {scooter.name}
            </h3>
          </div>

          {/* Price & CTA */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              {scooter.originalPrice && (
                <p className="text-xs text-slate-400 line-through mb-0.5">
                  {formatPrice(scooter.originalPrice)}
                </p>
              )}
              <p className="text-xl font-bold bg-gradient-to-r from-[#15b0bb] to-[#16bf9b] bg-clip-text text-transparent">
                {formatPrice(scooter.price)}
              </p>
            </div>

            <div
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Link to={`/scooters/${scooter.id}`}>
                <Button
                  size="icon"
                  className={cn(
                    "rounded-full bg-gradient-to-r from-[#15b0bb] to-[#16bf9b] hover:from-[#13a0aa] hover:to-[#14af8b] shadow-[0_8px_20px_rgba(21,176,187,0.4)] hover:shadow-[0_12px_28px_rgba(22,191,155,0.5)] transition-all duration-200",
                    scooter.isComingSoon &&
                      "bg-slate-200 bg-none text-slate-700 shadow-none hover:shadow-none hover:bg-slate-300",
                  )}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
