import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User, Package, Heart, CreditCard, MapPin, Gift, Settings, Award, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout, isUserAuthenticated } from '@/app/slices/authSlice';
import { useLogoutMutation } from '@/app/api/authApi';
import { getAuthTokens } from '@/app/api/baseApi';
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
import { ProfileSwitcher } from '@/components/ProfileSwitcher';

export function StoreNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
      
      // Clear Redux state and localStorage
      dispatch(logout());
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      // Even if API call fails, clear local data
      console.error('🔴 [LOGOUT HANDLER] Logout error:', error);
      dispatch(logout());
      toast.success('Logged out');
      navigate('/');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/scooters', label: 'Scooters' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    // { href: '/login', label: 'Become a Distributor' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Zuja Electric" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative text-sm font-medium transition-colors ${
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {authenticated && <ProfileSwitcher />}
            
            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {isDistributor && (
                        <Badge className="mt-1 w-fit bg-success text-success-foreground text-xs">
                          Distributor
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=orders')}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                    {bookings.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {bookings.length}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                    {wishlistItems.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {wishlistItems.length}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=payments')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Payment Methods</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=addresses')}>
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Addresses</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=redemption')}>
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Redemption Points</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => navigate('/profile?tab=settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  
                  {isDistributor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile?tab=distributor')}>
                        <Award className="mr-2 h-4 w-4" />
                        <span>Distributor Options</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card border-b border-border"
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex gap-3">
              {authenticated ? (
                <div className="w-full space-y-2">
                  <Link to="/profile?tab=orders" onClick={() => setIsOpen(false)} className="block py-2 text-sm">
                    My Orders
                  </Link>
                  <Link to="/profile?tab=wishlist" onClick={() => setIsOpen(false)} className="block py-2 text-sm">
                    Wishlist
                  </Link>
                  <Link to="/profile?tab=settings" onClick={() => setIsOpen(false)} className="block py-2 text-sm">
                    Account Settings
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full mt-2" size="sm">
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
