import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Car,
  CreditCard,
  Wallet,
  Package,
  User,
  UserPlus,
  Link as LinkIcon,
  GitBranch,
  History,
  DollarSign,
  Landmark,
  Users,
  ClipboardList,
  Target,
  Gift,
  CheckSquare,
  FileText,
  TrendingUp,
  BarChart3,
  Monitor,
  Brain,
  Award,
  Settings,
  Boxes,
  Store,
  Shield,
  ScrollText,
  ChevronLeft,
  UserCheck,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetBinaryStatsQuery } from '@/app/api/binaryApi';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: MenuItem[];
}

const userMenuItems: MenuItem[] = [
  { label: 'My Profile', icon: User, path: '/profile' },
  { label: 'Browse Vehicles', icon: Car, path: '/scooters' },
  { label: 'Become Authorized Partner', icon: UserPlus, path: '/become-distributor' },
];

const distributorMenuItems: MenuItem[] = [
  { label: 'Authorized Partner Dashboard', icon: LayoutDashboard, path: '/distributor' },
  { label: 'Referral Link', icon: LinkIcon, path: '/distributor/referral' },
  { label: 'Team Network', icon: GitBranch, path: '/distributor/binary-tree' },
  //{ label: 'Team Matching History', icon: History, path: '/distributor/pair-history' },
  //{ label: 'Earnings & Commissions', icon: DollarSign, path: '/distributor/earnings' },
  { label: 'Team Performance', icon: Users, path: '/distributor/team' },
  //{ label: 'Sales Tracking', icon: TrendingUp, path: '/distributor/sales' },
  { label: 'Order History', icon: Package, path: '/distributor/orders' },
  //{ label: 'Reserve Wallet', icon: Landmark, path: '/distributor/pool-wallet' },
  { label: 'Payout History', icon: ClipboardList, path: '/distributor/payouts' },
  //{ label: 'Milestone Tracker', icon: Award, path: '/distributor/milestones' },
  //{ label: 'Nominee Management', icon: UserCheck, path: '/distributor/nominee' },
];

const staffMenuItems: MenuItem[] = [
  { label: 'Lead Management', icon: ClipboardList, path: '/staff/leads' },
  { label: 'Authorized Partner Verification', icon: UserCheck, path: '/staff/verification' },
  { label: 'Targets', icon: Target, path: '/staff/targets' },
  { label: 'Incentives', icon: Gift, path: '/staff/incentives' },
  { label: 'Booking Approvals', icon: CheckSquare, path: '/staff/approvals' },
  //{ label: 'Reports', icon: FileText, path: '/staff/reports' },
];

const adminMenuItems: MenuItem[] = [
  { label: 'Platform Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Growth Analytics', icon: TrendingUp, path: '/admin/growth' },
  { label: 'Sales Monitoring', icon: BarChart3, path: '/admin/sales' },
  { label: 'Authorized Partner Intelligence', icon: Brain, path: '/admin/distributor-intel' },
  { label: 'Staff Performance', icon: Award, path: '/admin/staff-performance' },
  { label: 'Binary Engine Control', icon: Settings, path: '/admin/binary-engine' },
  { label: 'EV Inventory', icon: Boxes, path: '/admin/inventory' },
  { label: 'Partner Shops', icon: Store, path: '/admin/partners' },
  { label: 'Reserve Wallet Controller', icon: Landmark, path: '/admin/pool-wallet' },
  { label: 'Payout Engine', icon: DollarSign, path: '/admin/payout-engine' },
  { label: 'Risk & Compliance', icon: Shield, path: '/admin/compliance' },
  { label: 'Audit Logs', icon: ScrollText, path: '/admin/audit' },
];

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Sidebar = ({ open, onOpenChange }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Check if user is a verified distributor
  // Only show distributor options if:
  // 1. isDistributor is explicitly true from the API, OR
  // 2. distributorInfo.isDistributor is true, OR
  // 3. distributorInfo.isVerified is true, OR
  // 4. verificationStatus is 'approved'
  // IMPORTANT: If distributorInfo.isDistributor is explicitly false, do NOT show distributor options
  // Note: Having a referralCode does NOT make someone a distributor - it just means they were referred
  // Use useMemo to ensure this recalculates when user object changes
  const { isVerifiedDistributor, isExplicitlyNotDistributor } = useMemo(() => {
    const isVerified = (user?.isDistributor === true) || 
                       (user?.distributorInfo?.isDistributor === true) ||
                       (user?.distributorInfo?.isVerified === true) || 
                       (user?.distributorInfo?.verificationStatus === 'approved');
    
    const isExplicitlyNot = user?.distributorInfo?.isDistributor === false;
    
    return { isVerifiedDistributor: isVerified, isExplicitlyNotDistributor: isExplicitlyNot };
  }, [user?.isDistributor, user?.distributorInfo?.isDistributor, user?.distributorInfo?.isVerified, user?.distributorInfo?.verificationStatus]);

  // Binary stats: used to hide "Team Performance" when there are no team members
  // Must be called before any early returns to comply with React Hooks rules
  const distributorId = user?.id || '';
  const { data: binaryStats } = useGetBinaryStatsQuery(distributorId, {
    skip: !distributorId || !isVerifiedDistributor || isExplicitlyNotDistributor,
  });
  const hasTeamMembers = ((binaryStats?.leftCount ?? 0) + (binaryStats?.rightCount ?? 0)) > 0;

  // Debug logging (remove in production if needed)
  useEffect(() => {
    if (user) {
      console.log('🔍 [SIDEBAR] User distributor status check:', {
        isDistributor: user.isDistributor,
        hasDistributorInfo: !!user.distributorInfo,
        distributorInfoIsDistributor: user.distributorInfo?.isDistributor,
        distributorInfoIsVerified: user.distributorInfo?.isVerified,
        verificationStatus: user.distributorInfo?.verificationStatus,
        hasReferralCode: !!(user.distributorInfo?.referralCode),
        isExplicitlyNotDistributor,
        isVerifiedDistributor,
        finalResult: isVerifiedDistributor && !isExplicitlyNotDistributor,
      });
    }
  }, [user, isVerifiedDistributor, isExplicitlyNotDistributor]);

  // Render AdminSidebar for admin users
  if (user?.role === 'admin') {
    return <AdminSidebar />;
  }

  // All users are eligible for becoming a Distributor (static eligibility)
  // Only exclude users who are already distributors
  const isDistributorEligible = !user?.isDistributor;

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const isBecomeDistributor = item.path === '/become-distributor';
    const showEligibleBadge = isBecomeDistributor && isDistributorEligible;
    const showNotEligibleBadge = false; // Removed - all users are eligible

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-gradient-to-r from-[#18b3b2]/15 to-[#22cc7b]/15 text-[#0d9488] shadow-sm'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-colors',
            isActive ? 'text-[#18b3b2]' : 'text-muted-foreground group-hover:text-[#18b3b2]'
          )}
        />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="truncate flex-1"
          >
            {item.label}
          </motion.span>
        )}
        {showEligibleBadge && !collapsed && (
          <span className="px-2 py-0.5 text-xs bg-success/20 text-success rounded-full">
            Eligible
          </span>
        )}
        {showNotEligibleBadge && !collapsed && (
          <span className="px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
            Not Eligible
          </span>
        )}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute right-0 h-8 w-1 rounded-l-full bg-gradient-to-b from-[#18b3b2] to-[#22cc7b]"
          />
        )}
      </Link>
    );
  };

  // Get menu items based on user role
  const getMenuItems = (): MenuItem[] => {
    if (user?.role === 'staff') {
      return staffMenuItems;
    } else if (isVerifiedDistributor && !isExplicitlyNotDistributor) {
      // Filter out "Become Authorized Partner" for verified distributors
      const filteredUserMenuItems = userMenuItems.filter(item => item.path !== '/become-distributor');
      const items = [...filteredUserMenuItems, ...distributorMenuItems];
      // Hide "Team Performance" when there are no team members (match Team Network empty state)
      if (!hasTeamMembers) {
        return items.filter(item => item.path !== '/distributor/team');
      }
      return items;
    } else {
      return userMenuItems;
    }
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[#18b3b2]/30 px-4 bg-gradient-to-r from-[#f0fdfa] to-[#ccfbf1] backdrop-blur-sm shadow-sm">
        <Link 
          to={user?.role === 'staff' ? '/staff/leads' : '/'} 
          className="flex items-center gap-2"
          onClick={() => isMobile && onOpenChange?.(false)}
        >
          <img src="/logo.png" alt="Zuja Electric" className={collapsed ? "h-8 w-auto" : "h-10 w-auto"} />
        </Link>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-[#18b3b2]/10 hover:text-[#0d9488] transition-colors"
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-[#f0fdfa]/80 via-[#ecfdf5]/90 to-[#d1fae5]/80">
        <div className="space-y-1">
          {getMenuItems().map((item) => {
            const menuItem = renderMenuItem(item);
            return isMobile ? (
              <div key={item.path} onClick={() => onOpenChange?.(false)}>
                {menuItem}
              </div>
            ) : menuItem;
          })}
        </div>
      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <div className="border-t border-[#18b3b2]/25 p-4 bg-gradient-to-b from-transparent to-[#ccfbf1]/50">
          <div className="flex items-center gap-3 rounded-xl p-3 bg-white/90 border border-[#18b3b2]/20 shadow-md shadow-slate-200/50 ring-1 ring-[#18b3b2]/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#18b3b2]/20 to-[#22cc7b]/20">
              <User className="h-5 w-5 text-[#18b3b2]" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0 border-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full flex-col bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-[#d1fae5] border-r border-[#18b3b2]/30"
          >
            {sidebarContent}
          </motion.div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex h-screen flex-col border-r border-[#18b3b2]/30 transition-all duration-300',
        'bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-[#d1fae5]',
        'shadow-[4px_0_28px_-4px_rgba(24,179,178,0.18)]',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {sidebarContent}
    </motion.aside>
  );
};
