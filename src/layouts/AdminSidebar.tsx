import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Brain,
  Award,
  Settings,
  Boxes,
  Store,
  Landmark,
  DollarSign,
  Shield,
  ScrollText,
  ChevronLeft,
  Zap,
  User,
  Users,
  Ticket,
  FileText,
  Key,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface SubMenuItem {
  label: string;
  path: string;
  badge?: number;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
}

interface MenuSection {
  label: string;
  icon: React.ElementType;
  value: string;
  children: SubMenuItem[];
  badge?: number;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
}

const adminMenuSections: MenuSection[] = [
  {
    label: 'Platform Dashboard',
    icon: LayoutDashboard,
    value: 'dashboard',
    children: [
      { label: 'Overview', path: '/admin' },
      { label: 'Live Metrics', path: '/admin/dashboard/metrics' },
      { label: 'Alerts Center', path: '/admin/dashboard/alerts' },
    ],
  },
  {
    label: 'Growth Analytics',
    icon: TrendingUp,
    value: 'growth',
    children: [
      { label: 'EV Sales Funnel', path: '/admin/growth/sales-funnel' },
      { label: 'Active Buyer Growth', path: '/admin/growth/buyer-growth' },
      { label: 'Distributor Expansion Graph', path: '/admin/growth/distributor-expansion' },
      { label: 'Network Saturation Map', path: '/admin/growth/network-saturation' },
      { label: 'Revenue Forecast', path: '/admin/growth/revenue-forecast' },
    ],
  },
  {
    label: 'Sales Monitoring',
    icon: BarChart3,
    value: 'sales',
    children: [
      { label: 'Pre-Bookings', path: '/admin/sales/pre-bookings' },
      { label: 'EMI Orders', path: '/admin/sales/emi-orders' },
      { label: 'Cancelled Orders', path: '/admin/sales/cancelled' },
      { label: 'Drop-off Users', path: '/admin/sales/drop-off' },
      { label: 'Partner Redemptions', path: '/admin/sales/redemptions' },
    ],
  },
  {
    label: 'Distributor Intelligence',
    icon: Brain,
    value: 'distributor-intel',
    children: [
      { label: 'Binary Tree Viewer', path: '/admin/distributor-intel/binary-tree' },
      { label: 'Weak-Leg Detection', path: '/admin/distributor-intel/weak-leg' },
      { label: 'Pair Matching History', path: '/admin/distributor-intel/pair-history' },
      { label: 'Ceiling Achievements', path: '/admin/distributor-intel/ceiling' },
      { label: 'Top Performers', path: '/admin/distributor-intel/top-performers' },
      { label: 'Dormant Distributors', path: '/admin/distributor-intel/dormant' },
    ],
  },
  {
    label: 'Staff Performance',
    icon: Award,
    value: 'staff-performance',
    children: [
      { label: 'Staff Targets', path: '/admin/staff-performance/targets' },
      { label: 'Incentives Earned', path: '/admin/staff-performance/incentives' },
      { label: 'Approval Delay Report', path: '/admin/staff-performance/approval-delay' },
      { label: 'Lead Conversion Rate', path: '/admin/staff-performance/conversion' },
    ],
  },
  {
    label: 'Binary Engine Control',
    icon: Settings,
    value: 'binary-engine',
    children: [
      { label: 'Pair Rules', path: '/admin/binary-engine/pair-rules' },
      { label: 'Ceiling Settings', path: '/admin/binary-engine/ceiling' },
      { label: 'Carry Forward Logic', path: '/admin/binary-engine/carry-forward' },
      { label: 'Monthly Reset Engine', path: '/admin/binary-engine/reset' },
    ],
  },
  {
    label: 'EV Inventory',
    icon: Boxes,
    value: 'inventory',
    children: [
      { label: 'Models', path: '/admin/inventory/models' },
      { label: 'Stock Level', path: '/admin/inventory/stock' },
      { label: 'Delivery Pipeline', path: '/admin/inventory/delivery' },
      { label: 'Pending Allocations', path: '/admin/inventory/allocations' },
    ],
  },
  {
    label: 'Partner Shops',
    icon: Store,
    value: 'partners',
    children: [
      { label: 'Shop List', path: '/admin/partners/shops' },
      { label: 'Product Mapping', path: '/admin/partners/products' },
      { label: 'Redemption Load', path: '/admin/partners/redemption' },
      { label: 'Commission Ratio', path: '/admin/partners/commission' },
    ],
  },
  {
    label: 'Pool Wallet Controller',
    icon: Landmark,
    value: 'pool-wallet',
    children: [
      { label: 'Active Pool Balances', path: '/admin/pool-wallet/balances' },
      { label: 'Emergency Withdrawals', path: '/admin/pool-wallet/withdrawals' },
      { label: 'Nominee Transfers', path: '/admin/pool-wallet/transfers' },
      { label: 'Pool Utilization', path: '/admin/pool-wallet/utilization' },
    ],
  },
  {
    label: 'Payout Engine',
    icon: DollarSign,
    value: 'payout-engine',
    badge: 12, // Mock pending payouts count
    badgeVariant: 'destructive',
    children: [
      { label: 'Pending Payouts', path: '/admin/payout-engine/pending', badge: 12, badgeVariant: 'destructive' },
      { label: 'Approved Payouts', path: '/admin/payout-engine/approved' },
      { label: 'Rejected Payouts', path: '/admin/payout-engine/rejected' },
      { label: 'Bank Settlement Logs', path: '/admin/payout-engine/settlement' },
    ],
  },
  {
    label: 'Pin Management',
    icon: Key,
    value: 'pin-management',
    children: [
      { label: 'All Pins', path: '/admin/pin-management/all' },
      { label: 'User Pins', path: '/admin/pin-management/user' },
      { label: 'Admin Pins', path: '/admin/pin-management/admin' },
      { label: 'Used Pins', path: '/admin/pin-management/used' },
      { label: 'Unused Pins', path: '/admin/pin-management/unused' },
    ],
  },
  {
    label: 'User Management',
    icon: Users,
    value: 'users',
    badge: 8, // Mock pending KYC count
    badgeVariant: 'destructive',
    children: [
      { label: 'Active Users', path: '/admin/users/active' },
      { label: 'Paid Users', path: '/admin/users/paid' },
      { label: 'Blocked Users', path: '/admin/users/blocked' },
      { label: 'Email Unverified', path: '/admin/users/email-unverified' },
      { label: 'Mobile Unverified', path: '/admin/users/mobile-unverified' },
      { label: 'KYC Pending', path: '/admin/users/kyc-pending', badge: 8, badgeVariant: 'destructive' },
      { label: 'KYC Rejected', path: '/admin/users/kyc-rejected' },
      { label: 'Send Notification', path: '/admin/users/notify' },
    ],
  },
  {
    label: 'Support Tickets',
    icon: Ticket,
    value: 'tickets',
    badge: 5, // Mock pending tickets count
    badgeVariant: 'destructive',
    children: [
      { label: 'Pending Tickets', path: '/admin/tickets/pending', badge: 5, badgeVariant: 'destructive' },
      { label: 'Closed Tickets', path: '/admin/tickets/closed' },
      { label: 'Answered Tickets', path: '/admin/tickets/answered' },
      { label: 'All Tickets', path: '/admin/tickets/all' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    value: 'reports',
    children: [
      { label: 'Transaction History', path: '/admin/reports/transactions' },
      { label: 'Investment Logs', path: '/admin/reports/investments' },
      { label: 'BV Logs', path: '/admin/reports/bv' },
      { label: 'Referral Commission', path: '/admin/reports/referral' },
      { label: 'Binary Commission', path: '/admin/reports/binary' },
      { label: 'Login History', path: '/admin/reports/login' },
      { label: 'Notification History', path: '/admin/reports/notifications' },
    ],
  },
  {
    label: 'Risk & Compliance',
    icon: Shield,
    value: 'compliance',
    children: [
      { label: 'Duplicate PAN Detection', path: '/admin/compliance/duplicate-pan' },
      { label: 'Bank Abuse Monitor', path: '/admin/compliance/bank-abuse' },
      { label: 'Referral Farming Alerts', path: '/admin/compliance/referral-farming' },
      { label: 'Rapid Growth Suspicion', path: '/admin/compliance/rapid-growth' },
    ],
  },
  {
    label: 'Audit Logs',
    icon: ScrollText,
    value: 'audit',
    children: [
      { label: 'Wallet Changes', path: '/admin/audit/wallet' },
      { label: 'Payout Modifications', path: '/admin/audit/payout' },
      { label: 'Binary Adjustments', path: '/admin/audit/binary' },
      { label: 'Admin Activity Logs', path: '/admin/audit/activity' },
    ],
  },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  // Auto-expand sections based on current route
  const getActiveSection = () => {
    const path = location.pathname;
    for (const section of adminMenuSections) {
      if (section.children.some((child) => path === child.path || path.startsWith(child.path))) {
        return section.value;
      }
    }
    return 'dashboard'; // Default to dashboard
  };

  // Initialize open sections with active section
  const [openSections, setOpenSections] = useState<string[]>(() => {
    const activeSection = getActiveSection();
    return activeSection ? [activeSection] : ['dashboard'];
  });

  // Update open sections when route changes
  useEffect(() => {
    const activeSection = getActiveSection();
    if (activeSection) {
      setOpenSections((prev) => {
        if (!prev.includes(activeSection)) {
          return [...prev, activeSection];
        }
        return prev;
      });
    }
  }, [location.pathname]);

  const isSubMenuActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSectionActive = (section: MenuSection) => {
    return section.children.some((child) => isSubMenuActive(child.path));
  };

  const renderSubMenuItem = (item: SubMenuItem, sectionValue: string) => {
    const active = isSubMenuActive(item.path);
    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to={item.path}
          className={cn(
            'group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ml-6',
            active
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <span className="flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-primary' : 'bg-muted-foreground/30')} />
            {item.label}
          </span>
          {item.badge !== undefined && (
            <Badge variant={item.badgeVariant || 'default'} className="h-5 min-w-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
          {active && (
            <motion.div
              layoutId="activeSubMenuIndicator"
              className="absolute right-0 h-6 w-1 rounded-l-full bg-primary"
            />
          )}
        </Link>
      </motion.div>
    );
  };

  const renderSection = (section: MenuSection) => {
    const Icon = section.icon;
    const sectionActive = isSectionActive(section);

    return (
      <AccordionItem key={section.value} value={section.value} className="border-none">
        <AccordionTrigger
          className={cn(
            'group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:no-underline',
            sectionActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            <Icon
              className={cn(
                'h-5 w-5 shrink-0 transition-colors',
                sectionActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              )}
            />
            {!collapsed && (
              <span className="truncate flex-1 text-left">{section.label}</span>
            )}
            {!collapsed && section.badge !== undefined && (
              <Badge variant={section.badgeVariant || 'default'} className="h-5 min-w-5 px-1.5 text-xs">
                {section.badge}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-1 pb-2">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 overflow-hidden"
          >
            {section.children.map((child) => renderSubMenuItem(child, section.value))}
          </motion.div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex h-screen flex-col border-r border-border transition-all duration-300 glass',
        collapsed ? 'w-16' : 'w-72'
      )}
      style={{
        background: 'linear-gradient(135deg, hsl(0 0% 100% / 0.95), hsl(210 40% 98% / 0.9))',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link
            to="/admin"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display text-lg font-bold gradient-text">Zuja</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {collapsed ? (
          <div className="space-y-2">
            {adminMenuSections.map((section) => {
              const Icon = section.icon;
              const sectionActive = isSectionActive(section);
              return (
                <Link
                  key={section.value}
                  to={section.children[0]?.path || '/admin'}
                  className={cn(
                    'group relative flex items-center justify-center rounded-lg p-3 text-sm font-medium transition-all duration-200',
                    sectionActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                  title={section.label}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      sectionActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )}
                  />
                  {section.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-white">
                      {section.badge > 9 ? '9+' : section.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-1"
            defaultValue={[getActiveSection()]}
          >
            {adminMenuSections.map(renderSection)}
          </Accordion>
        )}
      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border p-4"
        >
          <div className="glass-card flex items-center gap-3 rounded-lg p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

