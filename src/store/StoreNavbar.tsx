import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Package, Heart, CreditCard, MapPin, Gift, Settings, Award, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout, isUserAuthenticated } from '@/app/slices/authSlice';
import { useLogoutMutation } from '@/app/api/authApi';
import { getAuthTokens, api } from '@/app/api/baseApi';
import { clearBookings } from '@/app/slices/bookingSlice';
import { clearWishlist } from '@/app/slices/wishlistSlice';
import { clearWallets } from '@/app/slices/walletSlice';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function StoreNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { bookings } = useAppSelector((state) => state.booking);

  // Check both Redux state and localStorage
  const authenticated = isAuthenticated || isUserAuthenticated();
  const isDistributor = user?.isDistributor && user?.distributorInfo?.isVerified;

  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const { refreshToken } = getAuthTokens();
      
      if (refreshToken) {
        console.log('🔵 [LOGOUT HANDLER] Calling logout API with refresh token');
        await logoutMutation({ refresh: refreshToken }).unwrap();
        console.log('🟢 [LOGOUT HANDLER] Logout API call successful');
      } else {
        console.log('⚠️ [LOGOUT HANDLER] No refresh token found, clearing local data only');
      }
      
      // Clear all user-specific Redux state
      dispatch(logout());
      dispatch(clearBookings());
      dispatch(clearWishlist());
      dispatch(clearWallets());
      
      // Clear RTK Query cache to remove previous user's cached data
      dispatch(api.util.resetApiState());
      
      console.log('✅ [LOGOUT HANDLER] All user data cleared from Redux and RTK Query cache');
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      // Even if API call fails, clear local data
      console.error('🔴 [LOGOUT HANDLER] Logout error:', error);
      
      // Clear all user-specific Redux state
      dispatch(logout());
      dispatch(clearBookings());
      dispatch(clearWishlist());
      dispatch(clearWallets());
      
      // Clear RTK Query cache
      dispatch(api.util.resetApiState());
      
      console.log('✅ [LOGOUT HANDLER] All user data cleared from Redux and RTK Query cache (after error)');
      toast.success('Logged out');
      navigate('/');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/scooters', label: 'Scooters' },
    { href: '/contact', label: 'Contact' },
    // { href: '/login', label: 'Become a Distributor' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-border/40 py-2 shadow-sm' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img src="/logo.png" alt="Zuja Electric" className="h-9 md:h-11 w-auto transition-transform duration-300 group-hover:scale-105" />
              {!isScrolled && (
                <div className="absolute -inset-2 bg-primary/5 blur-2xl rounded-full -z-10" />
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12 font-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`group relative text-[16px] md:text-[18px] font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? 'text-[#3CB2B2]'
                    : 'text-[#424242] hover:text-[#3CB2B2]'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                
                {/* Gradient Underline for Active Link */}
                {isActive(link.href) ? (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-0 right-0 h-[2px]"
                    style={{
                      background: 'linear-gradient(to right, #3CB2B2 0%, #3CB2B2 50%, #59F09F 50%, #59F09F 100%)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2px] w-0 bg-[#3CB2B2]/40 rounded-full transition-all duration-300 group-hover:w-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-5">
            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 group outline-none">
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary/20 to-transparent group-hover:from-primary/40 transition-all duration-300">
                      <div className="bg-background rounded-full p-1.5 border border-border/50">
                        <User className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[13px] font-semibold text-foreground/90">{user?.name?.split(' ')[0] || 'Profile'}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2 p-2 rounded-2xl border-border/40 shadow-2xl backdrop-blur-xl bg-background/95">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold tracking-tight">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground font-medium truncate">{user?.email}</p>
                      {isDistributor && (
                        <Badge className="mt-2 w-fit bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-0">
                          Verified Distributor
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/40" />
                  
                  <div className="py-1">
                    <DropdownMenuItem onClick={() => navigate('/profile?tab=orders')} className="rounded-xl focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer py-2.5">
                      <Package className="mr-3 h-4 w-4" />
                      <span className="font-medium text-[13.5px]">My Orders</span>
                      {bookings.length > 0 && (
                        <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                          {bookings.length}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/profile?tab=wishlist')} className="rounded-xl focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer py-2.5">
                      <Heart className="mr-3 h-4 w-4" />
                      <span className="font-medium text-[13.5px]">Wishlist</span>
                      {wishlistItems.length > 0 && (
                        <Badge variant="secondary" className="ml-auto text-[10px] h-5 min-w-[20px] px-1.5">
                          {wishlistItems.length}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => navigate('/profile?tab=payments')} className="rounded-xl focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer py-2.5">
                      <CreditCard className="mr-3 h-4 w-4" />
                      <span className="font-medium text-[13.5px]">Payments</span>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-border/40" />
                  
                  <div className="py-1">
                    <DropdownMenuItem onClick={() => navigate('/profile?tab=settings')} className="rounded-xl focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer py-2.5">
                      <Settings className="mr-3 h-4 w-4" />
                      <span className="font-medium text-[13.5px]">Settings</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-destructive focus:bg-destructive/5 focus:text-destructive transition-colors cursor-pointer py-2.5">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium text-[13.5px]">Logout</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="group">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2.5 rounded-full px-7 h-11 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 font-semibold tracking-wide"
                >
                  <User className="w-4 h-4 transition-transform group-hover:scale-110" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden p-2.5 rounded-2xl transition-all duration-300 ${
              isScrolled ? 'bg-background/80' : 'bg-white/10 backdrop-blur-md'
            } border border-border/40 shadow-sm`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white backdrop-blur-2xl border-b border-border/40 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8 space-y-4">
              {navLinks.map((link, idx) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={link.href}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-2xl px-5 py-3.5 text-[16px] md:text-[18px] font-medium tracking-widest transition-all font-nav ${
                      isActive(link.href)
                        ? 'bg-[#3CB2B2]/10 text-[#3CB2B2] shadow-sm'
                        : 'text-[#424242] hover:bg-muted hover:text-[#3CB2B2]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-6 border-t border-border/40"
              >
                {authenticated ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/profile?tab=orders'); setIsOpen(false); }}
                      className="rounded-2xl h-12 border-border/60"
                    >
                      Orders
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="rounded-2xl h-12 shadow-lg shadow-destructive/20"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-2xl h-14 text-base font-bold shadow-xl shadow-primary/20">
                      Sign In / Register
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
