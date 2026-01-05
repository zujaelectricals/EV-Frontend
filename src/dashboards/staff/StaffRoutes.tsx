import { Routes, Route, Navigate } from 'react-router-dom';
import { StaffDashboard } from './StaffDashboard';
import { LeadManagement } from './LeadManagement';
import { DistributorVerification } from './DistributorVerification';
import { StaffTargets } from './StaffTargets';
import { StaffIncentives } from './StaffIncentives';
import { BookingApprovals } from './BookingApprovals';
import { StaffReports } from './StaffReports';
import { StaffKYCVerification } from './KYCVerification';

export const StaffRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/staff/leads" replace />} />
      <Route path="dashboard" element={<StaffDashboard />} />
      <Route path="leads" element={<LeadManagement />} />
      <Route path="verification" element={<DistributorVerification />} />
      <Route path="kyc-verification" element={<StaffKYCVerification />} />
      <Route path="targets" element={<StaffTargets />} />
      <Route path="incentives" element={<StaffIncentives />} />
      <Route path="approvals" element={<BookingApprovals />} />
      <Route path="reports" element={<StaffReports />} />
      <Route path="*" element={<Navigate to="/staff/leads" replace />} />
    </Routes>
  );
};

