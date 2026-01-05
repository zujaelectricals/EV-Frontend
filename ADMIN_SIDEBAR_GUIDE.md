# Admin Sidebar Usage Guide

## Complete Guide to Admin Sidebar Sections and Sub-Menus

This document explains the purpose and usage of each section in the Admin Sidebar for the EV Nexus MLM Platform.

---

## 🏠 **1. Platform Dashboard**

**Purpose:** Central command center providing real-time overview of platform health and key metrics.

### Sub-Menus:

#### **Overview** (`/admin`)

- **Usage:** Main dashboard landing page
- **Shows:**
  - Key performance indicators (KPIs)
  - EV booking trends
  - Active buyers count
  - Revenue metrics
  - Staff performance charts
  - Active alerts summary
- **When to use:** Daily monitoring, executive briefings, quick health checks

#### **Live Metrics** (`/admin/dashboard/metrics`)

- **Usage:** Real-time system performance monitoring
- **Shows:**
  - Active users count (live)
  - Transactions per minute
  - Revenue (24-hour)
  - System status (uptime, CPU, memory)
  - API response times
  - Database query performance
- **When to use:** During peak hours, troubleshooting, performance monitoring

#### **Alerts Center** (`/admin/dashboard/alerts`)

- **Usage:** Centralized alert management system
- **Shows:**
  - Critical alerts (fraud, compliance issues)
  - Warning alerts (threshold breaches)
  - Info alerts (system notifications)
  - Alert categories (Fraud, Compliance, System, Risk, Growth)
- **When to use:** Daily review, incident response, compliance monitoring

---

## 📈 **2. Growth Analytics**

**Purpose:** Track and analyze business growth metrics across all dimensions.

### Sub-Menus:

#### **EV Sales Funnel** (`/admin/growth/sales-funnel`)

- **Usage:** Visualize conversion rates through sales pipeline
- **Shows:**
  - Visitor → Interested → Pre-Booked → Paid → Delivered
  - Conversion rates at each stage
  - Drop-off points identification
  - Monthly funnel trends
- **When to use:** Marketing analysis, conversion optimization, identifying bottlenecks

#### **Active Buyer Growth** (`/admin/growth/buyer-growth`)

- **Usage:** Monitor buyer acquisition and retention
- **Shows:**
  - Total buyers count
  - Active vs inactive buyers
  - New buyer acquisition rate
  - Buyer segments breakdown
  - Growth trends over time
- **When to use:** Marketing campaigns, retention strategies, growth planning

#### **Distributor Expansion Graph** (`/admin/growth/distributor-expansion`)

- **Usage:** Track distributor network growth
- **Shows:**
  - Total distributors count
  - New distributors per month
  - Active vs total distributors
  - Regional distribution
  - Growth rate trends
- **When to use:** Network expansion planning, recruitment strategies, regional analysis

#### **Network Saturation Map** (`/admin/growth/network-saturation`)

- **Usage:** Monitor distributor network saturation by region
- **Shows:**
  - Regional saturation percentages
  - Capacity vs current usage
  - High saturation alerts
  - Healthy vs critical regions
- **When to use:** Expansion planning, market saturation analysis, territory management

#### **Revenue Forecast** (`/admin/growth/revenue-forecast`)

- **Usage:** Project future revenue based on trends
- **Shows:**
  - Historical revenue data
  - Forecasted revenue (Q3, Q4)
  - Revenue source breakdown
  - Growth rate projections
- **When to use:** Financial planning, budget allocation, investor reporting

---

## 🛒 **3. Sales Monitoring**

**Purpose:** Monitor all sales activities, orders, and customer interactions.

### Sub-Menus:

#### **Pre-Bookings** (`/admin/sales/pre-bookings`)

- **Usage:** Manage pre-booking orders
- **Shows:**
  - All pre-booking requests
  - Pending, confirmed, expired status
  - Pre-booking amounts
  - Expiry dates
- **When to use:** Order management, follow-up on pending bookings, revenue tracking

#### **EMI Orders** (`/admin/sales/emi-orders`)

- **Usage:** Track EMI-based orders and payments
- **Shows:**
  - Active EMI orders
  - Payment progress (paid/remaining installments)
  - Next due dates
  - Monthly EMI collection
  - Pending amounts
- **When to use:** Cash flow management, payment follow-ups, EMI collection tracking

#### **Cancelled Orders** (`/admin/sales/cancelled`)

- **Usage:** Monitor order cancellations and refunds
- **Shows:**
  - Cancelled order details
  - Cancellation reasons
  - Refund status
  - Cancellation trends
  - Total refund amounts
- **When to use:** Customer retention analysis, refund processing, identifying cancellation patterns

#### **Drop-off Users** (`/admin/sales/drop-off`)

- **Usage:** Identify users who abandoned the purchase process
- **Shows:**
  - Users who left at different stages
  - Days since last activity
  - Drop-off reasons
  - Re-engagement opportunities
- **When to use:** Marketing campaigns, customer re-engagement, conversion optimization

#### **Partner Redemptions** (`/admin/sales/redemptions`)

- **Usage:** Track redemption transactions at partner shops
- **Shows:**
  - Redemption history
  - Partner shop performance
  - Points/value redeemed
  - Redemption trends by shop
- **When to use:** Partner management, redemption program analysis, commission calculations

---

## 🌳 **4. Distributor Intelligence**

**Purpose:** Deep insights into distributor network performance and MLM structure.

### Sub-Menus:

#### **Binary Tree Viewer** (`/admin/distributor-intel/binary-tree`)

- **Usage:** Visualize the binary MLM tree structure
- **Shows:**
  - Complete binary tree hierarchy
  - Left and right leg distributions
  - Total nodes (distributors)
  - Active pairs count
- **When to use:** Network structure analysis, identifying top performers, tree balance review

#### **Weak-Leg Detection** (`/admin/distributor-intel/weak-leg`)

- **Usage:** Identify distributors with imbalanced binary legs
- **Shows:**
  - Distributors with weak left/right legs
  - Imbalance percentages
  - Critical imbalance alerts
  - Action required list
- **When to use:** Network balance optimization, distributor support, pair matching improvement

#### **Pair Matching History** (`/admin/distributor-intel/pair-history`)

- **Usage:** Track binary pair matching and commissions
- **Shows:**
  - Historical pair matches
  - Commission payouts per match
  - Monthly pair trends
  - Total commissions paid
- **When to use:** Commission verification, payout reconciliation, performance analysis

#### **Ceiling Achievements** (`/admin/distributor-intel/ceiling`)

- **Usage:** Monitor distributor ceiling level progress
- **Shows:**
  - Current ceiling levels (Bronze, Silver, Gold, Platinum, Diamond)
  - Progress toward next level
  - Achieved vs ceiling amounts
  - Distributors near ceiling
- **When to use:** Incentive management, level progression tracking, reward planning

#### **Top Performers** (`/admin/distributor-intel/top-performers`)

- **Usage:** Identify and recognize top-performing distributors
- **Shows:**
  - Rankings by sales/commissions
  - Top 3 performers (highlighted)
  - Performance metrics
  - Referral counts
- **When to use:** Recognition programs, incentive planning, best practices identification

#### **Dormant Distributors** (`/admin/distributor-intel/dormant`)

- **Usage:** Identify inactive distributors needing re-engagement
- **Shows:**
  - Distributors inactive for 30+ days
  - Last activity dates
  - Risk levels (high/medium/low)
  - Re-engagement opportunities
- **When to use:** Retention campaigns, network health monitoring, reactivation strategies

---

## 🧑‍💼 **5. Staff Performance**

**Purpose:** Monitor and manage internal staff performance and productivity.

### Sub-Menus:

#### **Staff Targets** (`/admin/staff-performance/targets`)

- **Usage:** Track staff target achievement
- **Shows:**
  - Individual staff targets
  - Achievement percentages
  - On-track vs needs-attention status
  - Progress bars
- **When to use:** Performance reviews, target setting, incentive calculations

#### **Incentives Earned** (`/admin/staff-performance/incentives`)

- **Usage:** Track staff incentive payouts
- **Shows:**
  - Base incentives
  - Performance bonuses
  - Target bonuses
  - Total incentives per staff
  - Monthly trends
- **When to use:** Payroll processing, incentive planning, performance rewards

#### **Approval Delay Report** (`/admin/staff-performance/approval-delay`)

- **Usage:** Monitor approval processing delays
- **Shows:**
  - Average approval delay times
  - Pending approvals count
  - Staff-wise delay analysis
  - On-time rate
- **When to use:** Process optimization, bottleneck identification, staff training needs

#### **Lead Conversion Rate** (`/admin/staff-performance/conversion`)

- **Usage:** Track staff lead conversion performance
- **Shows:**
  - Leads assigned per staff
  - Conversion rates
  - Converted leads count
  - Performance rankings
- **When to use:** Sales team evaluation, training needs, performance improvement

---

## ⚙️ **6. Binary Engine Control**

**Purpose:** Configure and manage the binary MLM commission system.

### Sub-Menus:

#### **Pair Rules** (`/admin/binary-engine/pair-rules`)

- **Usage:** Configure binary pair matching rules
- **Shows:**
  - Pair matching type (Binary/Unilevel/Matrix)
  - Minimum pair amount
  - Matching frequency
  - Commission per pair
  - Auto-matching settings
- **When to use:** System configuration, rule changes, commission structure updates

#### **Ceiling Settings** (`/admin/binary-engine/ceiling`)

- **Usage:** Configure distributor ceiling levels
- **Shows:**
  - Ceiling levels (Bronze to Diamond)
  - Ceiling amounts per level
  - Commission rates per level
  - Reset periods
  - Increase rates
- **When to use:** Level structure changes, incentive program updates, ceiling adjustments

#### **Carry Forward Logic** (`/admin/binary-engine/carry-forward`)

- **Usage:** Configure how unmatched pairs are handled
- **Shows:**
  - Carry forward enable/disable
  - Carry forward type (Full/Partial/Capped)
  - Maximum periods
  - Percentage settings
- **When to use:** Policy changes, fairness adjustments, commission optimization

#### **Monthly Reset Engine** (`/admin/binary-engine/reset`)

- **Usage:** Manage monthly binary tree resets
- **Shows:**
  - Reset schedule configuration
  - Reset options (pairs, commissions, ceilings)
  - Reset history
  - Next reset date
- **When to use:** Monthly operations, system maintenance, reset execution

---

## 🚗 **7. EV Inventory**

**Purpose:** Manage EV product inventory and delivery pipeline.

### Sub-Menus:

#### **Models** (`/admin/inventory/models`)

- **Usage:** Manage EV models catalog
- **Shows:** Product listings, specifications, pricing
- **When to use:** Product management, pricing updates, catalog maintenance

#### **Stock Level** (`/admin/inventory/stock`)

- **Usage:** Monitor inventory levels
- **Shows:** Current stock, low stock alerts, warehouse locations
- **When to use:** Inventory management, reorder planning, stock optimization

#### **Delivery Pipeline** (`/admin/inventory/delivery`)

- **Usage:** Track delivery status and pipeline
- **Shows:** Orders in transit, delivery schedules, status updates
- **When to use:** Delivery management, customer communication, logistics planning

#### **Pending Allocations** (`/admin/inventory/allocations`)

- **Usage:** Manage pending vehicle allocations
- **Shows:** Allocated but not delivered vehicles, allocation dates
- **When to use:** Allocation management, delivery scheduling, customer updates

---

## 🏪 **8. Partner Shops**

**Purpose:** Manage partner shops and redemption program.

### Sub-Menus:

#### **Shop List** (`/admin/partners/shops`)

- **Usage:** Manage partner shop listings
- **Shows:** Shop details, locations, contact info, status
- **When to use:** Partner onboarding, shop management, contact updates

#### **Product Mapping** (`/admin/partners/products`)

- **Usage:** Map products available at each shop
- **Shows:** Shop-product relationships, product availability, pricing
- **When to use:** Product catalog management, shop configuration, availability updates

#### **Redemption Load** (`/admin/partners/redemption`)

- **Usage:** Monitor redemption activity per shop
- **Shows:** Redemption volume, value, trends per shop
- **When to use:** Performance analysis, commission calculations, partner evaluation

#### **Commission Ratio** (`/admin/partners/commission`)

- **Usage:** Configure commission rates for partners
- **Shows:** Commission percentages, payment terms, settlement schedules
- **When to use:** Partner agreements, commission updates, payment processing

---

## 💼 **9. Reserve Wallet Controller** (Pool Wallet)

**Purpose:** Manage the reserve/pool wallet system for MLM operations.

### Sub-Menus:

#### **Withdrawal History** (`/admin/pool-wallet`)

- **Usage:** View all pool wallet withdrawal transactions
- **Shows:** Historical withdrawals, amounts, status, dates
- **When to use:** Transaction review, audit trails, financial reconciliation

#### **Active Reserve Balances** (`/admin/pool-wallet/balances`)

- **Usage:** Monitor current pool wallet balances
- **Shows:** Active balances per distributor, total pool amount, utilization
- **When to use:** Financial monitoring, balance verification, risk assessment

#### **Emergency Withdrawals** (`/admin/pool-wallet/withdrawals`)

- **Usage:** Process emergency withdrawal requests
- **Shows:** Pending emergency requests, approval workflow, processing status
- **When to use:** Emergency processing, approval workflows, urgent requests

#### **Nominee Transfers** (`/admin/pool-wallet/transfers`)

- **Usage:** Manage nominee transfer requests
- **Shows:** Transfer requests, nominee details, approval status
- **When to use:** Nominee management, transfer approvals, beneficiary updates

#### **Reserve Utilization** (`/admin/pool-wallet/utilization`)

- **Usage:** Analyze pool wallet utilization patterns
- **Shows:** Utilization rates, trends, peak usage periods
- **When to use:** Capacity planning, risk management, financial forecasting

---

## 💸 **10. Payout Engine**

**Purpose:** Manage all commission and payout processing.

### Sub-Menus:

#### **Pending Payouts** (`/admin/payout-engine/pending`) ⚠️ Badge: 12

- **Usage:** Review and approve pending payout requests
- **Shows:** Pending requests, amounts, bank details, request dates
- **When to use:** Daily payout processing, approval workflows, payment verification

#### **Approved Payouts** (`/admin/payout-engine/approved`)

- **Usage:** View approved payout history
- **Shows:** Approved payouts, payment dates, transaction IDs
- **When to use:** Payment verification, reconciliation, audit trails

#### **Rejected Payouts** (`/admin/payout-engine/rejected`)

- **Usage:** Review rejected payout requests
- **Shows:** Rejected requests, rejection reasons, resubmission options
- **When to use:** Issue resolution, customer support, payment corrections

#### **Bank Settlement Logs** (`/admin/payout-engine/settlement`)

- **Usage:** Track bank settlement transactions
- **Shows:** Settlement batches, amounts, dates, status
- **When to use:** Financial reconciliation, bank statement matching, audit compliance

---

## 📌 **11. Pin Management**

**Purpose:** Manage e-PINs used for user registrations and transactions.

### Sub-Menus:

#### **All Pins** (`/admin/pin-management/all`)

- **Usage:** View all PINs in the system
- **Shows:** Complete PIN list with status, type, usage
- **When to use:** Complete PIN overview, bulk operations

#### **User Pins** (`/admin/pin-management/user`)

- **Usage:** Manage user-issued PINs
- **Shows:** PINs issued to users, usage status, values
- **When to use:** User PIN distribution, usage tracking

#### **Admin Pins** (`/admin/pin-management/admin`)

- **Usage:** Manage admin-issued PINs
- **Shows:** Admin PINs, special privileges, usage
- **When to use:** Admin operations, special promotions

#### **Used Pins** (`/admin/pin-management/used`)

- **Usage:** View all used PINs
- **Shows:** PINs that have been redeemed, user details, dates
- **When to use:** Usage verification, audit trails

#### **Unused Pins** (`/admin/pin-management/unused`)

- **Usage:** View available PINs for distribution
- **Shows:** Unused PIN inventory, values, generation dates
- **When to use:** PIN distribution planning, inventory management

---

## 👥 **12. User Management**

**Purpose:** Comprehensive user account management and segmentation.

### Sub-Menus:

#### **Active Users** (`/admin/users/active`)

- **Usage:** View all active platform users
- **Shows:** Active user list, last login, activity status
- **When to use:** User engagement analysis, active user metrics

#### **Paid Users** (`/admin/users/paid`)

- **Usage:** View users who have made payments
- **Shows:** Paid users, transaction history, payment amounts
- **When to use:** Revenue analysis, customer segmentation

#### **Blocked Users** (`/admin/users/blocked`)

- **Usage:** Manage blocked/suspended accounts
- **Shows:** Blocked users, block reasons, block dates
- **When to use:** Account management, security review, unblock requests

#### **Email Unverified** (`/admin/users/email-unverified`)

- **Usage:** Identify users with unverified emails
- **Shows:** Users needing email verification
- **When to use:** Verification campaigns, account security

#### **Mobile Unverified** (`/admin/users/mobile-unverified`)

- **Usage:** Identify users with unverified mobile numbers
- **Shows:** Users needing mobile verification
- **When to use:** Verification campaigns, account security

#### **KYC Pending** (`/admin/users/kyc-pending`) ⚠️ Badge: 8

- **Usage:** Review pending KYC verifications
- **Shows:** Users awaiting KYC approval, submission dates
- **When to use:** Daily KYC processing, compliance management

#### **KYC Rejected** (`/admin/users/kyc-rejected`)

- **Usage:** Review rejected KYC submissions
- **Shows:** Rejected KYCs, rejection reasons, resubmission options
- **When to use:** Issue resolution, customer support, compliance review

#### **Send Notification** (`/admin/users/notify`)

- **Usage:** Send notifications to user segments
- **Shows:** Notification composer, user segment selection
- **When to use:** Marketing campaigns, important announcements, user communication

---

## 🎫 **13. Support Tickets**

**Purpose:** Manage customer support tickets and inquiries.

### Sub-Menus:

#### **Pending Tickets** (`/admin/tickets/pending`) ⚠️ Badge: 5

- **Usage:** Handle new/unanswered support tickets
- **Shows:** Pending tickets, priorities, categories, creation dates
- **When to use:** Daily support operations, ticket assignment

#### **Closed Tickets** (`/admin/tickets/closed`)

- **Usage:** View resolved support tickets
- **Shows:** Closed tickets, resolution details, closure dates
- **When to use:** Performance review, resolution analysis

#### **Answered Tickets** (`/admin/tickets/answered`)

- **Usage:** View tickets with responses awaiting customer reply
- **Shows:** Answered tickets, response dates, follow-up needed
- **When to use:** Follow-up management, customer satisfaction

#### **All Tickets** (`/admin/tickets/all`)

- **Usage:** Complete ticket overview
- **Shows:** All tickets across all statuses
- **When to use:** Comprehensive review, analytics, reporting

---

## 📊 **14. Reports**

**Purpose:** Generate comprehensive reports and analytics.

### Sub-Menus:

#### **Transaction History** (`/admin/reports/transactions`)

- **Usage:** View all platform transactions
- **Shows:** Complete transaction log, filters, export options
- **When to use:** Financial audits, transaction verification, reconciliation

#### **Investment Logs** (`/admin/reports/investments`)

- **Usage:** Track all investment transactions
- **Shows:** Investment history, amounts, dates, users
- **When to use:** Investment analysis, financial reporting

#### **BV Logs** (`/admin/reports/bv`)

- **Usage:** Track Business Volume (BV) transactions
- **Shows:** BV generation, distribution, calculations
- **When to use:** Commission calculations, BV verification

#### **Referral Commission** (`/admin/reports/referral`)

- **Usage:** Report on referral commissions
- **Shows:** Referral earnings, payout history, trends
- **When to use:** Commission verification, payout reconciliation

#### **Team Commission** (`/admin/reports/binary`)

- **Usage:** Report on binary/team commissions
- **Shows:** Binary commission payouts, pair matching, trends
- **When to use:** MLM commission analysis, payout verification

#### **Login History** (`/admin/reports/login`)

- **Usage:** Track user login activities
- **Shows:** Login logs, IP addresses, devices, timestamps
- **When to use:** Security audits, user activity analysis

#### **Notification History** (`/admin/reports/notifications`)

- **Usage:** Track all sent notifications
- **Shows:** Notification logs, delivery status, open rates
- **When to use:** Campaign analysis, engagement metrics

---

## ⚠️ **15. Risk & Compliance**

**Purpose:** Monitor and prevent fraud, abuse, and compliance violations.

### Sub-Menus:

#### **Duplicate PAN Detection** (`/admin/compliance/duplicate-pan`)

- **Usage:** Detect multiple accounts with same PAN
- **Shows:** Duplicate PAN alerts, account details, risk assessment
- **When to use:** Fraud prevention, KYC compliance, account verification

#### **Bank Abuse Monitor** (`/admin/compliance/bank-abuse`)

- **Usage:** Monitor suspicious bank account usage
- **Shows:** Multiple payouts to same account, unusual patterns
- **When to use:** Fraud detection, payment security, abuse prevention

#### **Referral Farming Alerts** (`/admin/compliance/referral-farming`)

- **Usage:** Detect artificial referral generation
- **Shows:** Suspicious referral patterns, farming indicators
- **When to use:** Fraud prevention, network integrity, policy enforcement

#### **Rapid Growth Suspicion** (`/admin/compliance/rapid-growth`)

- **Usage:** Flag unusually rapid network growth
- **Shows:** Rapid expansion alerts, growth patterns, verification needed
- **When to use:** Fraud detection, network quality control, compliance review

---

## 🧾 **16. Audit Logs**

**Purpose:** Complete audit trail of all system changes and admin activities.

### Sub-Menus:

#### **Wallet Changes** (`/admin/audit/wallet`)

- **Usage:** Track all wallet balance modifications
- **Shows:** Wallet transaction logs, admin modifications, user transactions
- **When to use:** Financial audits, dispute resolution, transaction verification

#### **Payout Modifications** (`/admin/audit/payout`)

- **Usage:** Track payout changes and adjustments
- **Shows:** Payout edit history, approval changes, amount modifications
- **When to use:** Payment audits, compliance verification, dispute resolution

#### **Binary Adjustments** (`/admin/audit/binary`)

- **Usage:** Track binary tree and commission adjustments
- **Shows:** Pair matching adjustments, commission corrections, tree modifications
- **When to use:** MLM system audits, commission verification, corrections tracking

#### **Admin Activity Logs** (`/admin/audit/activity`)

- **Usage:** Track all admin user activities
- **Shows:** Admin actions, login history, system changes, IP addresses
- **When to use:** Security audits, accountability tracking, compliance requirements

---

## 🎯 **Key Usage Patterns**

### **Daily Operations:**

1. **Platform Dashboard** → Overview (morning check)
2. **Payout Engine** → Pending Payouts (approve payments)
3. **Support Tickets** → Pending Tickets (handle support)
4. **User Management** → KYC Pending (process verifications)
5. **Alerts Center** → Review critical alerts

### **Weekly Reviews:**

1. **Growth Analytics** → All sub-menus (growth analysis)
2. **Sales Monitoring** → All sub-menus (sales performance)
3. **Staff Performance** → All sub-menus (team evaluation)
4. **Reports** → Generate weekly reports

### **Monthly Operations:**

1. **Binary Engine Control** → Monthly Reset Engine (execute reset)
2. **Distributor Intelligence** → Top Performers (recognition)
3. **Reports** → Generate monthly financial reports
4. **Audit Logs** → Complete audit review

### **Compliance & Security:**

1. **Risk & Compliance** → All sub-menus (fraud monitoring)
2. **Audit Logs** → All sub-menus (compliance verification)
3. **User Management** → Blocked Users, KYC sections

---

## 📱 **Badge Indicators**

The sidebar shows badges to highlight urgent items:

- **Red Badge (12)** on Payout Engine → 12 pending payouts need approval
- **Red Badge (8)** on User Management → 8 KYC verifications pending
- **Red Badge (5)** on Support Tickets → 5 pending tickets need attention

These badges help prioritize daily tasks and ensure nothing critical is missed.

---

## 🔄 **Navigation Tips**

1. **Auto-Expansion:** Sections automatically expand when you navigate to their sub-pages
2. **Active Highlighting:** Current page is highlighted in blue
3. **Collapsible:** Click section headers to expand/collapse
4. **Search:** Use browser search (Ctrl+F) to find specific menu items
5. **Breadcrumbs:** Use browser back button to navigate between related pages

---

This comprehensive sidebar structure ensures all aspects of the MLM platform can be efficiently managed from a single interface.
