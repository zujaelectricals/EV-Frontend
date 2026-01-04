import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { loadBookingsForUser } from '@/app/slices/bookingSlice';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

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
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNav />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};
