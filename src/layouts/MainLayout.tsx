import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { loadBookingsForUser } from '@/app/slices/bookingSlice';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Check if admin sidebar is being rendered (which is fixed)
  const isAdminLayout = user?.role === 'admin';
  
  // Track admin sidebar collapsed state
  const [adminSidebarCollapsed, setAdminSidebarCollapsed] = useState(() => {
    if (isAdminLayout) {
      const stored = localStorage.getItem('admin_sidebar_collapsed');
      return stored === 'true';
    }
    return false;
  });

  // Listen for admin sidebar collapse changes
  useEffect(() => {
    if (isAdminLayout) {
      const handleCollapsedChange = (e: CustomEvent) => {
        setAdminSidebarCollapsed(e.detail.collapsed);
      };
      window.addEventListener('adminSidebarCollapsedChange', handleCollapsedChange as EventListener);
      return () => {
        window.removeEventListener('adminSidebarCollapsedChange', handleCollapsedChange as EventListener);
      };
    }
  }, [isAdminLayout]);

  // Load bookings when user is available, clear when user logs out
  useEffect(() => {
    if (user?.id) {
      dispatch(loadBookingsForUser(user.id));
    } else {
      // Clear bookings when user logs out
      dispatch(loadBookingsForUser(null));
    }
  }, [user?.id, dispatch]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div 
        className="flex flex-1 flex-col w-full transition-all duration-300"
        style={isAdminLayout ? { marginLeft: adminSidebarCollapsed ? '64px' : '288px' } : undefined}
      >
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-auto p-3 sm:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};
