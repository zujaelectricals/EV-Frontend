import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isUserAuthenticated } from '@/app/slices/authSlice';
import { MainLayout } from '@/layouts/MainLayout';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'staff' | 'user')[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Check both Redux state and localStorage
  const authenticated = isAuthenticated || isUserAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'staff') {
      return <Navigate to="/staff/leads" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  return <MainLayout>{children}</MainLayout>;
};

