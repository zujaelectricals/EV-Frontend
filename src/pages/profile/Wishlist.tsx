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
          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:opacity-90 text-xs sm:text-sm shadow-md shadow-pink-500/20">Continue Shopping</Button>
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-b from-white to-slate-50/50 ring-2 ring-pink-500/20">
            <CardContent className="py-12 sm:py-14 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#18b3b2]/15 to-[#22cc7b]/15 mb-4"
              >
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm mx-auto">Add vehicles you like to your wishlist</p>
              <Link to="/scooters">
                <Button size="sm" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:opacity-90 text-xs sm:text-sm shadow-lg shadow-pink-500/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">Browse Vehicles</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
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

