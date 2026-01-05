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
import { SupportTickets } from './SupportTickets';
import { DistributorApplications } from './pages/DistributorApplications';
import { ActivePoolBalances } from './pages/ActivePoolBalances';
import { EmergencyWithdrawals } from './pages/EmergencyWithdrawals';
import { NomineeTransfers } from './pages/NomineeTransfers';
import { PoolUtilization } from './pages/PoolUtilization';
import { Models } from './pages/Models';
import { StockLevel } from './pages/StockLevel';
import { DeliveryPipeline } from './pages/DeliveryPipeline';
import { PendingAllocations } from './pages/PendingAllocations';
import { ShopList } from './pages/ShopList';
import { ProductMapping } from './pages/ProductMapping';
import { RedemptionLoad } from './pages/RedemptionLoad';
import { CommissionRatio } from './pages/CommissionRatio';
import { ApprovedPayouts } from './pages/ApprovedPayouts';
import { RejectedPayouts } from './pages/RejectedPayouts';
import { BankSettlementLogs } from './pages/BankSettlementLogs';
import { ActiveUsers } from './pages/ActiveUsers';
import { PaidUsers } from './pages/PaidUsers';
import { BlockedUsers } from './pages/BlockedUsers';
import { EmailUnverified } from './pages/EmailUnverified';
import { MobileUnverified } from './pages/MobileUnverified';
import { KYCPending } from './pages/KYCPending';
import { KYCRejected } from './pages/KYCRejected';
import { SendNotification } from './pages/SendNotification';
import { PendingTickets } from './pages/PendingTickets';
import { AnsweredTickets } from './pages/AnsweredTickets';
import { ClosedTickets } from './pages/ClosedTickets';
import { AllTickets } from './pages/AllTickets';
import { Reports } from './Reports';
import { TransactionHistory } from './pages/TransactionHistory';
import { InvestmentLogs } from './pages/InvestmentLogs';
import { BVLogs } from './pages/BVLogs';
import { ReferralCommission } from './pages/ReferralCommission';
import { TeamCommission } from './pages/TeamCommission';
import { LoginHistory } from './pages/LoginHistory';
import { NotificationHistory } from './pages/NotificationHistory';
import { DuplicatePANDetection } from './pages/DuplicatePANDetection';
import { BankAbuseMonitor } from './pages/BankAbuseMonitor';
import { ReferralFarmingAlerts } from './pages/ReferralFarmingAlerts';
import { RapidGrowthSuspicion } from './pages/RapidGrowthSuspicion';

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
      <Route path="inventory/models" element={<Models />} />
      <Route path="inventory/stock" element={<StockLevel />} />
      <Route path="inventory/delivery" element={<DeliveryPipeline />} />
      <Route path="inventory/allocations" element={<PendingAllocations />} />

      {/* Partner Shops Routes */}
      <Route path="partners" element={<PartnerShops />} />
      <Route path="partners/shops" element={<ShopList />} />
      <Route path="partners/products" element={<ProductMapping />} />
      <Route path="partners/redemption" element={<RedemptionLoad />} />
      <Route path="partners/commission" element={<CommissionRatio />} />

      {/* Pool Wallet Controller Routes */}
      <Route path="pool-wallet" element={<PoolWalletController />} />
      <Route path="pool-wallet/balances" element={<ActivePoolBalances />} />
      <Route path="pool-wallet/withdrawals" element={<EmergencyWithdrawals />} />
      <Route path="pool-wallet/transfers" element={<NomineeTransfers />} />
      <Route path="pool-wallet/utilization" element={<PoolUtilization />} />

      {/* Payout Engine Routes */}
      <Route path="payout-engine" element={<PayoutEngine />} />
      <Route path="payout-engine/pending" element={<PendingPayouts />} />
      <Route path="payout-engine/approved" element={<ApprovedPayouts />} />
      <Route path="payout-engine/rejected" element={<RejectedPayouts />} />
      <Route path="payout-engine/settlement" element={<BankSettlementLogs />} />

      {/* Pin Management Routes */}
      <Route path="pin-management" element={<PinManagement />} />
      <Route path="pin-management/all" element={<PinManagement />} />
      <Route path="pin-management/user" element={<PinManagement />} />
      <Route path="pin-management/admin" element={<PinManagement />} />
      <Route path="pin-management/used" element={<PinManagement />} />
      <Route path="pin-management/unused" element={<PinManagement />} />

      {/* User Management Routes */}
      <Route path="users" element={<UserManagement />} />
      <Route path="users/active" element={<ActiveUsers />} />
      <Route path="users/paid" element={<PaidUsers />} />
      <Route path="users/blocked" element={<BlockedUsers />} />
      <Route path="users/email-unverified" element={<EmailUnverified />} />
      <Route path="users/mobile-unverified" element={<MobileUnverified />} />
      <Route path="users/kyc-pending" element={<KYCPending />} />
      <Route path="users/kyc-rejected" element={<KYCRejected />} />
      <Route path="users/notify" element={<SendNotification />} />
      <Route path="users/distributor-applications" element={<DistributorApplications />} />

      {/* Support Tickets Routes */}
      <Route path="tickets" element={<SupportTickets />} />
      <Route path="tickets/pending" element={<PendingTickets />} />
      <Route path="tickets/closed" element={<ClosedTickets />} />
      <Route path="tickets/answered" element={<AnsweredTickets />} />
      <Route path="tickets/all" element={<AllTickets />} />

      {/* Reports Routes */}
      <Route path="reports" element={<Reports />} />
      <Route path="reports/transactions" element={<TransactionHistory />} />
      <Route path="reports/investments" element={<InvestmentLogs />} />
      <Route path="reports/bv" element={<BVLogs />} />
      <Route path="reports/referral" element={<ReferralCommission />} />
      <Route path="reports/binary" element={<TeamCommission />} />
      <Route path="reports/login" element={<LoginHistory />} />
      <Route path="reports/notifications" element={<NotificationHistory />} />

      {/* Risk & Compliance Routes */}
      <Route path="compliance" element={<RiskCompliance />} />
      <Route path="compliance/duplicate-pan" element={<DuplicatePANDetection />} />
      <Route path="compliance/bank-abuse" element={<BankAbuseMonitor />} />
      <Route path="compliance/referral-farming" element={<ReferralFarmingAlerts />} />
      <Route path="compliance/rapid-growth" element={<RapidGrowthSuspicion />} />

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

