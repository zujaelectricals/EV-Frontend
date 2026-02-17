import { Provider } from 'react-redux';
import { store } from './app/store';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './auth/LoginPage';
import { AdminLoginPage } from './auth/AdminLoginPage';
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
import { Gallery } from './pages/Gallery';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
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
import { useAppSelector, useAppDispatch } from './app/hooks';
import { isUserAuthenticated, setCredentials } from './app/slices/authSlice';
import { useGetUserProfileQuery } from './app/api/userApi';
import { getAuthTokens, getLogoutLogs } from './app/api/baseApi';
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

// Component to handle ASA link redirects
const ReferralRedirect = () => {
  const { referralCode } = useParams<{ referralCode: string }>();
  
  // Store referral code in localStorage
  if (referralCode && typeof window !== 'undefined') {
    localStorage.setItem('ev_nexus_referral_code', referralCode);
    console.log('✅ [ASA REDIRECT] Stored ASA code in localStorage:', referralCode);
  }
  
  return <Navigate to={`/login?ref=${referralCode}&signup=true`} replace />;
};

// Component to clean up old localStorage keys and manage automatic token refresh
const AuthInitializer = () => {
  // Clean up old localStorage keys on mount and set up multi-tab synchronization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // MULTI-TAB SYNC: Listen for token updates from other tabs
      const handleStorageChange = (e: StorageEvent | CustomEvent) => {
        if (e instanceof StorageEvent) {
          // StorageEvent from other tabs
          if (e.key === 'ev_nexus_auth_data' && e.newValue) {
            try {
              const newData = JSON.parse(e.newValue);
              console.log('📡 [MULTI-TAB SYNC] Token update received from another tab', {
                hasAccessToken: !!newData.accessToken,
                hasRefreshToken: !!newData.refreshToken,
                newRefreshTokenPrefix: newData.refreshToken?.substring(0, 20) + '...',
              });
              // Tokens are already updated in localStorage by the other tab
              // Clear any refresh locks since tokens were updated
              // Import the release function - we'll need to export it
              // For now, just clear the localStorage lock key
              try {
                const lockData = localStorage.getItem('ev_nexus_refresh_lock');
                if (lockData) {
                  const lock = JSON.parse(lockData);
                  const currentTabId = sessionStorage.getItem('ev_nexus_tab_id');
                  // Only clear if it's not our lock (we don't want to clear our own active refresh)
                  if (lock.tabId !== currentTabId) {
                    localStorage.removeItem('ev_nexus_refresh_lock');
                    console.log('🔓 [MULTI-TAB SYNC] Cleared refresh lock from another tab');
                  }
                }
              } catch (lockError) {
                // Ignore lock errors
              }
            } catch (error) {
              console.error('❌ [MULTI-TAB SYNC] Error parsing token update:', error);
            }
          }
        } else if (e instanceof CustomEvent && e.type === 'authTokensUpdated') {
          // CustomEvent from same tab (for consistency)
          console.log('📡 [MULTI-TAB SYNC] Token update received (same tab)', {
            hasAccessToken: !!e.detail?.accessToken,
            hasRefreshToken: !!e.detail?.refreshToken,
          });
        }
      };
      
      // Listen for storage events from other tabs
      window.addEventListener('storage', handleStorageChange as EventListener);
      // Listen for custom events from same tab
      window.addEventListener('authTokensUpdated', handleStorageChange as EventListener);
      
      // Check for logout logs from previous session
      const logoutLogs = getLogoutLogs();
      if (logoutLogs.length > 0) {
        const lastLogout = logoutLogs[logoutLogs.length - 1];
        console.group('🔴 [LOGOUT DETECTED] Previous logout event detected');
        console.log('Last logout reason:', lastLogout.reason);
        console.log('Last logout details:', lastLogout.details);
        console.log('Last logout timestamp:', lastLogout.timestamp);
        console.log('All logout logs:', logoutLogs);
        console.log('To view logs programmatically, use: getLogoutLogs()');
        console.groupEnd();
      }
      
      // Remove ev_nexus_multiple_accounts if it exists
      localStorage.removeItem('ev_nexus_multiple_accounts');
      
      // Ensure ev_nexus_auth_data only contains tokens + minimal user info
      const authData = localStorage.getItem('ev_nexus_auth_data');
      console.log('🔵 [AUTH INITIALIZER] Checking auth data on mount...');
      
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const accessToken = parsed.accessToken || parsed.token;
          const refreshToken = parsed.refreshToken;
          
          console.log('🔵 [AUTH INITIALIZER] Found auth data:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasUser: !!parsed.user,
          });
          
          // Only proceed if we have at least an access token
          if (accessToken) {
            // Keep tokens + essential user info needed for UI (including distributor status)
            const cleaned = {
              accessToken,
              token: accessToken, // Keep for backward compatibility
              ...(refreshToken ? { refreshToken } : {}), // Only include if exists
              ...(parsed.user ? {
                user: {
                  id: parsed.user.id,
                  email: parsed.user.email,
                  name: parsed.user.name,
                  role: parsed.user.role,
                  // Preserve distributor-related fields for sidebar menu display
                  isDistributor: parsed.user.isDistributor,
                  distributorInfo: parsed.user.distributorInfo,
                  phone: parsed.user.phone,
                  joinedAt: parsed.user.joinedAt,
                  kycStatus: parsed.user.kycStatus,
                }
              } : {}),
            };
            localStorage.setItem('ev_nexus_auth_data', JSON.stringify(cleaned));
            console.log('✅ [AUTH INITIALIZER] Preserved tokens and user data in localStorage');
          } else {
            console.warn('⚠️ [AUTH INITIALIZER] No access token found, skipping cleanup');
          }
          // If no access token, don't overwrite - might be in the middle of a refresh
        } catch (e) {
          console.error('❌ [AUTH INITIALIZER] Error parsing auth data:', e);
          // Don't overwrite if parsing fails - preserve existing data
        }
      } else {
        console.log('ℹ️ [AUTH INITIALIZER] No auth data found in localStorage');
      }
    }
  }, []);

  return null;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  // Always fetch user profile on mount if authenticated to ensure we have the latest data
  // This is especially important for distributor status which affects sidebar visibility
  // Skip for admin users - they don't need user-based APIs
  const { data: profileData } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated || user?.role === 'admin',
    refetchOnMountOrArgChange: true, // Always refetch on mount to get latest data
  });

  // Update Redux state when user profile is fetched
  useEffect(() => {
    if (profileData && isAuthenticated) {
      // Update Redux state with complete user data
      dispatch(setCredentials({ user: profileData }));
      console.log('✅ [APP ROUTES] User profile loaded and Redux state updated');
    }
  }, [profileData, isAuthenticated, dispatch]);
  
  return (
    <Routes>
      {/* Public Store Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/scooters" element={<ScootersPage />} />
      <Route path="/scooters/:id" element={<ScooterDetailPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      
      {/* ASA Link Route */}
      <Route path="/ref/:referralCode" element={<ReferralRedirect />} />
      
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Protected Routes - User/Distributor */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<RoleProtectedRoute allowedRoles={['user', 'staff']}><ProfilePage /></RoleProtectedRoute>} />
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
        <AuthInitializer />
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </Provider>
);

export default App;
