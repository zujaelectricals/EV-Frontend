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
      {/* Card shell inspired by shoe cards */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/70 shadow-[0_18px_40px_rgba(15,23,42,0.18)] overflow-visible">
        {/* Image Section */}
        <div className="relative h-60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl rounded-b-none overflow-hidden">
        <motion.img
          src={scooter.image}
          alt={scooter.name}
          whileHover={{ y: -6 }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            // Fallback to a placeholder if image fails to load
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/600x400/cccccc/666666?text=EV+Motorcycle";
          }}
        />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

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
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/40 shadow-sm hover:scale-110 transition-transform duration-200"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorited ? "fill-destructive text-destructive" : "text-white/80",
              )}
            />
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {scooter.isNew && (
              <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-md backdrop-blur-sm">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="px-3 py-1.5 bg-black/60 text-white text-xs font-bold rounded-full shadow-md backdrop-blur-sm">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Bottom content panel */}
        <div className="relative -mt-6 px-5 pb-5">
          <div className="relative rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] px-5 pt-5 pb-4">
            {/* Brand & Name */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-1">
                {scooter.brand}
              </p>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                {scooter.name}
              </h3>
            </div>

            {/* Price & CTA */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                {scooter.originalPrice && (
                  <p className="text-[11px] text-slate-400 line-through mb-0.5">
                    {formatPrice(scooter.originalPrice)}
                  </p>
                )}
                <p className="text-lg font-bold text-slate-900">
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
                      "rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.45)] hover:shadow-[0_14px_34px_rgba(16,185,129,0.6)]",
                      scooter.isComingSoon &&
                        "bg-slate-200 text-slate-700 shadow-none hover:shadow-none",
                    )}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
