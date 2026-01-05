# EV Nexus Platform - Features by Role (Creation/Submission Features)

## Overview

This document lists all creation and submission features available to each role in the EV Nexus Platform. The system supports 3 main roles: **Admin**, **Staff**, and **User (Distributor)**.

---

## 👤 USER ROLE Features

### 1. **Pre-Booking Creation**

- **Location**: `/scooters/:id` (Scooter Detail Page)
- **Component**: `PreBookingModal`
- **Features**:
  - Create pre-booking with minimum ₹5000
  - Select payment method (Full, EMI, Flexible)
  - Enter referral code (optional)
  - Choose EMI tenure (12, 24, 36 months)
  - Join distributor program option
  - Automatic Active Buyer status assignment
  - Calculation of:
    - Referral bonus (₹1000 minus 10% TDS)
    - Redemption points (₹5000 eligible after 1 year)
    - Excess amount refund (after 15% tax/deductions)

### 2. **Distributor Application Creation**

- **Location**: `/become-distributor`
- **Component**: `DistributorApplication`
- **Features**:
  - Vehicle selection details:
    - Upload vehicle image
    - Select vehicle model
    - Enter vehicle MRP
    - Enter booking order number
  - Payment mode selection (Full/Installment)
  - Payment details:
    - Advance paid amount
    - Balance amount
    - Installment mode (Monthly/Weekly)
    - Installment amount
  - Applicant details:
    - Name, mobile number, date, place
  - KYC documents:
    - Aadhar number and document upload
    - PAN number and document upload
    - Bank account details (Account number, IFSC, Bank name)
    - Address details (Address, City, State, Pincode)
    - Bank statement upload
  - Terms and conditions acceptance:
    - Incentive consent
    - Declaration acceptance
    - Refund policy acceptance
    - OTP verification

### 3. **Profile Management**

- **Location**: `/profile`
- **Features**:
  - View and manage orders
  - Manage wishlist
  - Payment methods management
  - Address management
  - Redemption points view
  - Account settings

### 4. **Redemption Shop**

- **Location**: `/redemption`
- **Component**: `RedemptionShop`
- **Features**:
  - Browse partner shops
  - View product catalog
  - Redeem points for products
  - View redemption history

---

## 👨‍💼 STAFF ROLE Features

### 1. **Lead Creation**

- **Location**: `/staff/leads`
- **Component**: `LeadManagement`
- **Features**:
  - Add new leads
  - Lead information:
    - Name, email, phone
    - Source (Website, Referral, Social Media)
    - Status tracking (New, Contacted, Qualified)
  - Search and filter leads
  - View lead details
  - Contact leads
  - Update lead status

### 2. **Distributor Verification (Review & Approval)**

- **Location**: `/staff/verification`
- **Component**: `DistributorVerification`
- **Features**:
  - View pending distributor applications
  - Search applications by:
    - Applicant name
    - Distributor ID
    - Mobile number
  - Review application details:
    - Vehicle information
    - Payment details
    - Applicant information
    - KYC documents
  - Approve applications
  - Reject applications (with reason)
  - View application history

### 3. **Booking Approvals**

- **Location**: `/staff/approvals`
- **Component**: `BookingApprovals`
- **Features**:
  - View pending booking approvals
  - Review booking details:
    - Booking ID
    - Customer information
    - Amount
    - Date
  - Approve bookings
  - Reject bookings
  - View booking details

### 4. **Target Management**

- **Location**: `/staff/targets`
- **Component**: `StaffTargets`
- **Features**:
  - View assigned targets
  - Track target progress
  - View target deadlines

### 5. **Incentives Tracking**

- **Location**: `/staff/incentives`
- **Component**: `StaffIncentives`
- **Features**:
  - View earned incentives
  - Track incentive achievements
  - View incentive history

### 6. **Reports Generation**

- **Location**: `/staff/reports`
- **Component**: `StaffReports`
- **Features**:
  - Generate and view reports
  - Export report data

---

## 👑 ADMIN ROLE Features

### 1. **Platform Dashboard Management**

- **Location**: `/admin`
- **Features**:
  - Overview dashboard
  - Live metrics monitoring
  - Alerts center management

### 2. **Growth Analytics**

- **Location**: `/admin/growth/*`
- **Features**:
  - EV Sales Funnel analysis
  - Active Buyer Growth tracking
  - Distributor Expansion Graph
  - Network Saturation Map
  - Revenue Forecast

### 3. **Sales Monitoring**

- **Location**: `/admin/sales/*`
- **Features**:
  - Pre-Bookings management
  - EMI Orders tracking
  - Cancelled Orders review
  - Drop-off Users analysis
  - Partner Redemptions monitoring

### 4. **Distributor Intelligence**

- **Location**: `/admin/distributor-intel/*`
- **Features**:
  - Binary Tree Viewer
  - Weak-Leg Detection
  - Pair Matching History
  - Ceiling Achievements tracking
  - Top Performers analysis
  - Dormant Distributors identification

### 5. **Staff Performance Management**

- **Location**: `/admin/staff-performance/*`
- **Features**:
  - Staff Targets setting and tracking
  - Incentives Earned monitoring
  - Approval Delay Report
  - Lead Conversion Rate analysis

### 6. **Binary Engine Control**

- **Location**: `/admin/binary-engine/*`
- **Features**:
  - Pair Rules configuration
  - Ceiling Settings management
  - Carry Forward Logic configuration
  - Monthly Reset Engine control

### 7. **EV Inventory Management**

- **Location**: `/admin/inventory/*`
- **Features**:
  - Models management
  - Stock Level tracking
  - Delivery Pipeline management
  - Pending Allocations review

### 8. **Partner Shops Management**

- **Location**: `/admin/partners/*`
- **Features**:
  - Shop List management
  - Product Mapping
  - Redemption Load tracking
  - Commission Ratio configuration

### 9. **Pool Wallet Controller**

- **Location**: `/admin/pool-wallet/*`
- **Features**:
  - Withdrawal History review
  - Active Pool Balances monitoring
  - Emergency Withdrawals approval
  - Nominee Transfers management
  - Pool Utilization analysis

### 10. **Payout Engine**

- **Location**: `/admin/payout-engine/*`
- **Features**:
  - Pending Payouts review and approval
  - Approved Payouts tracking
  - Rejected Payouts management
  - Bank Settlement Logs

### 11. **Pin Management**

- **Location**: `/admin/pin-management/*`
- **Features**:
  - All Pins management
  - User Pins tracking
  - Admin Pins management
  - Used Pins history
  - Unused Pins tracking

### 12. **User Management**

- **Location**: `/admin/users/*`
- **Features**:
  - Active Users management
  - Paid Users tracking
  - Blocked Users management
  - Email Unverified users
  - Mobile Unverified users
  - KYC Pending review
  - KYC Rejected management
  - Send Notification to users

### 13. **Support Tickets Management**

- **Location**: `/admin/tickets/*`
- **Features**:
  - Pending Tickets review
  - Closed Tickets history
  - Answered Tickets tracking
  - All Tickets management

### 14. **Reports Generation**

- **Location**: `/admin/reports/*`
- **Features**:
  - Transaction History
  - Investment Logs
  - BV Logs
  - Referral Commission reports
  - Binary Commission reports
  - Login History
  - Notification History

### 15. **Risk & Compliance**

- **Location**: `/admin/compliance/*`
- **Features**:
  - Duplicate PAN Detection
  - Bank Abuse Monitor
  - Referral Farming Alerts
  - Rapid Growth Suspicion tracking

### 16. **Audit Logs**

- **Location**: `/admin/audit/*`
- **Features**:
  - Wallet Changes tracking
  - Payout Modifications history
  - Binary Adjustments log
  - Admin Activity Logs

---

## 📊 Summary by Creation/Submission Type

### User Creation Features:

1. ✅ Pre-Booking Creation
2. ✅ Distributor Application Submission
3. ✅ Profile Updates
4. ✅ Redemption Requests

### Staff Creation Features:

1. ✅ Lead Creation
2. ✅ Distributor Verification (Approval/Rejection)
3. ✅ Booking Approvals
4. ✅ Reports Generation

### Admin Creation Features:

1. ✅ System Configuration (Binary Engine, Ceiling Settings, etc.)
2. ✅ User Management Actions
3. ✅ Payout Approvals
4. ✅ Pool Wallet Withdrawal Approvals
5. ✅ Reports Generation
6. ✅ Notifications Creation
7. ✅ Target Setting for Staff
8. ✅ Inventory Management
9. ✅ Partner Shop Management

---

## 🔐 Access Control

- **User Role**: Can create pre-bookings and distributor applications
- **Staff Role**: Can create leads, approve/reject distributor applications and bookings
- **Admin Role**: Full system access with all creation and management capabilities

---

**Note**: This document focuses on creation and submission features. For viewing/read-only features, refer to the respective dashboard components.
