import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeFromWishlist } from '@/app/slices/wishlistSlice';

export function Wishlist() {
  const dispatch = useAppDispatch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const handleRemove = (id: string) => {
    dispatch(removeFromWishlist(id));
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `₹${(price / 1000).toFixed(0)}K`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-end mb-4">
        <Link to="/scooters">
          <Button size="sm" className="text-xs sm:text-sm">Continue Shopping</Button>
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">Add vehicles you like to your wishlist</p>
            <Link to="/scooters">
              <Button size="sm" className="text-xs sm:text-sm">Browse Vehicles</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white rounded-full shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                  </button>
                  {item.isNew && (
                    <Badge className="absolute top-2 left-2 text-[10px] sm:text-xs">NEW</Badge>
                  )}
                </div>
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-2">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">{item.brand}</p>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      {item.originalPrice && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </p>
                      )}
                      <p className="text-base sm:text-lg font-bold text-primary">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/scooters/${item.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span className="text-xs sm:text-sm">View</span>
                      </Button>
                    </Link>
                    <Link to={`/scooters/${item.id}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span className="text-xs sm:text-sm">Pre-Book</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

