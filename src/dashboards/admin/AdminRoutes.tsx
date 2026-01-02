import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { GrowthAnalytics } from './GrowthAnalytics';
import { SalesMonitoring } from './SalesMonitoring';
import { DistributorIntelligence } from './DistributorIntelligence';
import { StaffPerformance } from './StaffPerformance';
import { BinaryEngineControl } from './BinaryEngineControl';
import { EVInventory } from './EVInventory';
import { PartnerShops } from './PartnerShops';
import { PoolWalletController } from './PoolWalletController';
import { PayoutEngine } from './PayoutEngine';
import { RiskCompliance } from './RiskCompliance';
import { AuditLogs } from './AuditLogs';

// Import new pages
import { LiveMetrics } from './pages/LiveMetrics';
import { AlertsCenter } from './pages/AlertsCenter';
import { SalesFunnel } from './pages/SalesFunnel';
import { BuyerGrowth } from './pages/BuyerGrowth';
import { DistributorExpansion } from './pages/DistributorExpansion';
import { NetworkSaturation } from './pages/NetworkSaturation';
import { RevenueForecast } from './pages/RevenueForecast';
import { PreBookings } from './pages/PreBookings';
import { EMIOrders } from './pages/EMIOrders';
import { CancelledOrders } from './pages/CancelledOrders';
import { DropOffUsers } from './pages/DropOffUsers';
import { PartnerRedemptions } from './pages/PartnerRedemptions';
import { BinaryTreeViewer } from './pages/BinaryTreeViewer';
import { WeakLegDetection } from './pages/WeakLegDetection';
import { PairMatchingHistory } from './pages/PairMatchingHistory';
import { CeilingAchievements } from './pages/CeilingAchievements';
import { TopPerformers } from './pages/TopPerformers';
import { DormantDistributors } from './pages/DormantDistributors';
import { StaffTargets } from './pages/StaffTargets';
import { StaffIncentives } from './pages/StaffIncentives';
import { ApprovalDelayReport } from './pages/ApprovalDelayReport';
import { LeadConversionRate } from './pages/LeadConversionRate';
import { PairRules } from './pages/PairRules';
import { CeilingSettings } from './pages/CeilingSettings';
import { CarryForwardLogic } from './pages/CarryForwardLogic';
import { MonthlyResetEngine } from './pages/MonthlyResetEngine';
import { UserManagement } from './pages/UserManagement';
import { PinManagement } from './pages/PinManagement';
import { PendingPayouts } from './pages/PendingPayouts';
import { SupportTickets } from './pages/SupportTickets';
import { DistributorApplications } from './pages/DistributorApplications';

// Placeholder components for nested routes (can be replaced with actual components later)
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-6 p-6">
    <div>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-1">This page is under development</p>
    </div>
  </div>
);

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dashboard Routes */}
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="dashboard/metrics" element={<LiveMetrics />} />
      <Route path="dashboard/alerts" element={<AlertsCenter />} />

      {/* Growth Analytics Routes */}
      <Route path="growth" element={<GrowthAnalytics />} />
      <Route path="growth/sales-funnel" element={<SalesFunnel />} />
      <Route path="growth/buyer-growth" element={<BuyerGrowth />} />
      <Route path="growth/distributor-expansion" element={<DistributorExpansion />} />
      <Route path="growth/network-saturation" element={<NetworkSaturation />} />
      <Route path="growth/revenue-forecast" element={<RevenueForecast />} />

      {/* Sales Monitoring Routes */}
      <Route path="sales" element={<SalesMonitoring />} />
      <Route path="sales/pre-bookings" element={<PreBookings />} />
      <Route path="sales/emi-orders" element={<EMIOrders />} />
      <Route path="sales/cancelled" element={<CancelledOrders />} />
      <Route path="sales/drop-off" element={<DropOffUsers />} />
      <Route path="sales/redemptions" element={<PartnerRedemptions />} />

      {/* Distributor Intelligence Routes */}
      <Route path="distributor-intel" element={<DistributorIntelligence />} />
      <Route path="distributor-intel/binary-tree" element={<BinaryTreeViewer />} />
      <Route path="distributor-intel/weak-leg" element={<WeakLegDetection />} />
      <Route path="distributor-intel/pair-history" element={<PairMatchingHistory />} />
      <Route path="distributor-intel/ceiling" element={<CeilingAchievements />} />
      <Route path="distributor-intel/top-performers" element={<TopPerformers />} />
      <Route path="distributor-intel/dormant" element={<DormantDistributors />} />

      {/* Staff Performance Routes */}
      <Route path="staff-performance" element={<StaffPerformance />} />
      <Route path="staff-performance/targets" element={<StaffTargets />} />
      <Route path="staff-performance/incentives" element={<StaffIncentives />} />
      <Route path="staff-performance/approval-delay" element={<ApprovalDelayReport />} />
      <Route path="staff-performance/conversion" element={<LeadConversionRate />} />

      {/* Binary Engine Control Routes */}
      <Route path="binary-engine" element={<BinaryEngineControl />} />
      <Route path="binary-engine/pair-rules" element={<PairRules />} />
      <Route path="binary-engine/ceiling" element={<CeilingSettings />} />
      <Route path="binary-engine/carry-forward" element={<CarryForwardLogic />} />
      <Route path="binary-engine/reset" element={<MonthlyResetEngine />} />

      {/* EV Inventory Routes */}
      <Route path="inventory" element={<EVInventory />} />
      <Route path="inventory/models" element={<PlaceholderPage title="Models" />} />
      <Route path="inventory/stock" element={<PlaceholderPage title="Stock Level" />} />
      <Route path="inventory/delivery" element={<PlaceholderPage title="Delivery Pipeline" />} />
      <Route path="inventory/allocations" element={<PlaceholderPage title="Pending Allocations" />} />

      {/* Partner Shops Routes */}
      <Route path="partners" element={<PartnerShops />} />
      <Route path="partners/shops" element={<PlaceholderPage title="Shop List" />} />
      <Route path="partners/products" element={<PlaceholderPage title="Product Mapping" />} />
      <Route path="partners/redemption" element={<PlaceholderPage title="Redemption Load" />} />
      <Route path="partners/commission" element={<PlaceholderPage title="Commission Ratio" />} />

      {/* Pool Wallet Controller Routes */}
      <Route path="pool-wallet" element={<PoolWalletController />} />
      <Route path="pool-wallet/balances" element={<PlaceholderPage title="Active Pool Balances" />} />
      <Route path="pool-wallet/withdrawals" element={<PlaceholderPage title="Emergency Withdrawals" />} />
      <Route path="pool-wallet/transfers" element={<PlaceholderPage title="Nominee Transfers" />} />
      <Route path="pool-wallet/utilization" element={<PlaceholderPage title="Pool Utilization" />} />

      {/* Payout Engine Routes */}
      <Route path="payout-engine" element={<PayoutEngine />} />
      <Route path="payout-engine/pending" element={<PendingPayouts />} />
      <Route path="payout-engine/approved" element={<PlaceholderPage title="Approved Payouts" />} />
      <Route path="payout-engine/rejected" element={<PlaceholderPage title="Rejected Payouts" />} />
      <Route path="payout-engine/settlement" element={<PlaceholderPage title="Bank Settlement Logs" />} />

      {/* Pin Management Routes */}
      <Route path="pin-management" element={<PinManagement />} />
      <Route path="pin-management/all" element={<PinManagement />} />
      <Route path="pin-management/user" element={<PinManagement />} />
      <Route path="pin-management/admin" element={<PinManagement />} />
      <Route path="pin-management/used" element={<PinManagement />} />
      <Route path="pin-management/unused" element={<PinManagement />} />

      {/* User Management Routes */}
      <Route path="users" element={<UserManagement />} />
      <Route path="users/active" element={<UserManagement />} />
      <Route path="users/paid" element={<UserManagement />} />
      <Route path="users/blocked" element={<UserManagement />} />
      <Route path="users/email-unverified" element={<UserManagement />} />
      <Route path="users/mobile-unverified" element={<UserManagement />} />
      <Route path="users/kyc-pending" element={<UserManagement />} />
      <Route path="users/kyc-rejected" element={<UserManagement />} />
      <Route path="users/notify" element={<UserManagement />} />
      <Route path="users/distributor-applications" element={<DistributorApplications />} />

      {/* Support Tickets Routes */}
      <Route path="tickets" element={<SupportTickets />} />
      <Route path="tickets/pending" element={<SupportTickets />} />
      <Route path="tickets/closed" element={<SupportTickets />} />
      <Route path="tickets/answered" element={<SupportTickets />} />
      <Route path="tickets/all" element={<SupportTickets />} />

      {/* Reports Routes */}
      <Route path="reports" element={<PlaceholderPage title="Reports" />} />
      <Route path="reports/transactions" element={<PlaceholderPage title="Transaction History" />} />
      <Route path="reports/investments" element={<PlaceholderPage title="Investment Logs" />} />
      <Route path="reports/bv" element={<PlaceholderPage title="BV Logs" />} />
      <Route path="reports/referral" element={<PlaceholderPage title="Referral Commission" />} />
      <Route path="reports/binary" element={<PlaceholderPage title="Binary Commission" />} />
      <Route path="reports/login" element={<PlaceholderPage title="Login History" />} />
      <Route path="reports/notifications" element={<PlaceholderPage title="Notification History" />} />

      {/* Risk & Compliance Routes */}
      <Route path="compliance" element={<RiskCompliance />} />
      <Route path="compliance/duplicate-pan" element={<PlaceholderPage title="Duplicate PAN Detection" />} />
      <Route path="compliance/bank-abuse" element={<PlaceholderPage title="Bank Abuse Monitor" />} />
      <Route path="compliance/referral-farming" element={<PlaceholderPage title="Referral Farming Alerts" />} />
      <Route path="compliance/rapid-growth" element={<PlaceholderPage title="Rapid Growth Suspicion" />} />

      {/* Audit Logs Routes */}
      <Route path="audit" element={<AuditLogs />} />
      <Route path="audit/wallet" element={<PlaceholderPage title="Wallet Changes" />} />
      <Route path="audit/payout" element={<PlaceholderPage title="Payout Modifications" />} />
      <Route path="audit/binary" element={<PlaceholderPage title="Binary Adjustments" />} />
      <Route path="audit/activity" element={<PlaceholderPage title="Admin Activity Logs" />} />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

