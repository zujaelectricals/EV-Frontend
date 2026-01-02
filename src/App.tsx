import { Provider } from 'react-redux';
import { store } from './app/store';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './auth/LoginPage';
import { UserDashboard } from './dashboards/user/UserDashboard';
import { DistributorDashboard } from './dashboards/distributor/DistributorDashboard';
import { AdminDashboard } from './dashboards/admin/AdminDashboard';
import { StaffDashboard } from './dashboards/staff/StaffDashboard';
import { HomePage } from './store/HomePage';
import { ScootersPage } from './store/ScootersPage';
import { ScooterDetailPage } from './store/ScooterDetailPage';
import { useAppSelector } from './app/hooks';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  return (
    <Routes>
      {/* Public Store Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/scooters" element={<ScootersPage />} />
      <Route path="/scooters/:id" element={<ScooterDetailPage />} />
      
      {/* Auth */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/distributor" element={<ProtectedRoute><DistributorDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/staff/*" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </Provider>
);

export default App;
