import { motion } from 'framer-motion';
import { Battery, Zap, Gauge, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  colors: string[];
  isNew?: boolean;
  isBestseller?: boolean;
}

interface ScooterCardProps {
  scooter: Scooter;
  index?: number;
}

export function ScooterCard({ scooter, index = 0 }: ScooterCardProps) {
  const discount = scooter.originalPrice 
    ? Math.round(((scooter.originalPrice - scooter.price) / scooter.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
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
        {discount > 0 && (
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative h-56 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
        <motion.img
          src={scooter.image}
          alt={scooter.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{scooter.brand}</p>
          <h3 className="text-xl font-bold text-foreground mt-1">{scooter.name}</h3>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Battery className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Range</span>
            <span className="text-sm font-semibold">{scooter.range} km</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Gauge className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Speed</span>
            <span className="text-sm font-semibold">{scooter.topSpeed} km/h</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
            <Zap className="w-4 h-4 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">Battery</span>
            <span className="text-sm font-semibold">{scooter.batteryCapacity}</span>
          </div>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Colors:</span>
          <div className="flex gap-1">
            {scooter.colors.map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-border/50"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-2 border-t border-border/50">
          <div>
            {scooter.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{scooter.originalPrice.toLocaleString()}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">
              ₹{scooter.price.toLocaleString()}
            </p>
          </div>
          <Link to={`/scooters/${scooter.id}`}>
            <Button size="sm" className="group/btn">
              View Details
              <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
