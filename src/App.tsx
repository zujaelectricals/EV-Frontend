import { Provider } from 'react-redux';
import { store } from './app/store';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './auth/LoginPage';
import { UserDashboard } from './dashboards/user/UserDashboard';
import { DistributorDashboard } from './dashboards/distributor/DistributorDashboard';
import { AdminRoutes } from './dashboards/admin/AdminRoutes';
import { StaffRoutes } from './dashboards/staff/StaffRoutes';
import { AdminDashboard } from './dashboards/admin/AdminDashboard';
import { GrowthAnalytics } from './dashboards/admin/GrowthAnalytics';
import { SalesMonitoring } from './dashboards/admin/SalesMonitoring';
import { DistributorIntelligence } from './dashboards/admin/DistributorIntelligence';
import { StaffPerformance } from './dashboards/admin/StaffPerformance';
import { BinaryEngineControl } from './dashboards/admin/BinaryEngineControl';
import { EVInventory } from './dashboards/admin/EVInventory';
import { PartnerShops } from './dashboards/admin/PartnerShops';
import { PoolWalletController } from './dashboards/admin/PoolWalletController';
import { PayoutEngine } from './dashboards/admin/PayoutEngine';
import { RiskCompliance } from './dashboards/admin/RiskCompliance';
import { AuditLogs } from './dashboards/admin/AuditLogs';
import { HomePage } from './store/HomePage';
import { ScootersPage } from './store/ScootersPage';
import { ScooterDetailPage } from './store/ScooterDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutUs } from './pages/AboutUs';
import { Contact } from './pages/Contact';
import { DistributorApplication } from './dashboards/user/DistributorApplication';
import { RedemptionShop } from './dashboards/user/RedemptionShop';
import { PoolMoneyWithdrawal } from './dashboards/distributor/PoolMoneyWithdrawal';
import { NomineeManagement } from './dashboards/distributor/NomineeManagement';
import { MilestoneTracker } from './dashboards/distributor/MilestoneTracker';
import { TeamPerformance } from './dashboards/distributor/TeamPerformance';
import { SalesTracking } from './dashboards/distributor/SalesTracking';
import { ReferralLink } from './dashboards/distributor/ReferralLink';
import { BinaryTreeView } from './dashboards/distributor/BinaryTreeView';
import { PairMatchingHistory } from './dashboards/distributor/PairMatchingHistory';
import { Earnings } from './dashboards/distributor/Earnings';
import { PayoutHistory } from './dashboards/distributor/PayoutHistory';
import { OrderHistory } from './dashboards/distributor/OrderHistory';
import { RoleProtectedRoute } from './components/routes/RoleProtectedRoute';
import { useAppSelector } from './app/hooks';
import { isUserAuthenticated } from './app/slices/authSlice';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  
  // Check both Redux state and localStorage
  const authenticated = isAuthenticated || isUserAuthenticated();
  
  if (!authenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
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
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes - User/Distributor */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/become-distributor" element={<ProtectedRoute><DistributorApplication /></ProtectedRoute>} />
      <Route path="/redemption" element={<ProtectedRoute><RedemptionShop /></ProtectedRoute>} />
      <Route path="/distributor" element={<ProtectedRoute><DistributorDashboard /></ProtectedRoute>} />
      <Route path="/distributor/referral" element={<ProtectedRoute><ReferralLink /></ProtectedRoute>} />
      <Route path="/distributor/binary-tree" element={<ProtectedRoute><BinaryTreeView /></ProtectedRoute>} />
      <Route path="/distributor/pair-history" element={<ProtectedRoute><PairMatchingHistory /></ProtectedRoute>} />
      <Route path="/distributor/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
      <Route path="/distributor/team" element={<ProtectedRoute><TeamPerformance /></ProtectedRoute>} />
      <Route path="/distributor/sales" element={<ProtectedRoute><SalesTracking /></ProtectedRoute>} />
      <Route path="/distributor/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/distributor/pool-wallet" element={<ProtectedRoute><PoolMoneyWithdrawal /></ProtectedRoute>} />
      <Route path="/distributor/payouts" element={<ProtectedRoute><PayoutHistory /></ProtectedRoute>} />
      <Route path="/distributor/nominee" element={<ProtectedRoute><NomineeManagement /></ProtectedRoute>} />
      <Route path="/distributor/milestones" element={<ProtectedRoute><MilestoneTracker /></ProtectedRoute>} />
      
      {/* Protected Routes - Admin Only */}
      <Route path="/admin/*" element={<RoleProtectedRoute allowedRoles={['admin']}><AdminRoutes /></RoleProtectedRoute>} />
      
      {/* Protected Routes - Staff Only */}
      <Route path="/staff/*" element={<RoleProtectedRoute allowedRoles={['staff']}><StaffRoutes /></RoleProtectedRoute>} />
      
      {/* 404 Not Found - must be last */}
      <Route path="*" element={<NotFound />} />
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
