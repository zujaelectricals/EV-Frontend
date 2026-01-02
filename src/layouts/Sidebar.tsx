import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronLeft,
  Zap,
  UserCheck,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
  children?: MenuItem[];
}

const userMenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'EV Pre-Booking', icon: Car, path: '/bookings' },
  { label: 'EMI & Payments', icon: CreditCard, path: '/payments' },
  { label: 'Redemption Wallet', icon: Wallet, path: '/redemption' },
  { label: 'Orders', icon: Package, path: '/orders' },
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Become Distributor', icon: UserPlus, path: '/become-distributor' },
];

const distributorMenuItems: MenuItem[] = [
  { label: 'Distributor Dashboard', icon: LayoutDashboard, path: '/distributor' },
  { label: 'Referral Link', icon: LinkIcon, path: '/distributor/referral' },
  { label: 'Binary Tree View', icon: GitBranch, path: '/distributor/binary-tree' },
  { label: 'Pair Matching History', icon: History, path: '/distributor/pair-history' },
  { label: 'Earnings', icon: DollarSign, path: '/distributor/earnings' },
  { label: 'Pool Wallet', icon: Landmark, path: '/distributor/pool-wallet' },
  { label: 'Nominee', icon: Users, path: '/distributor/nominee' },
  { label: 'Payout History', icon: ClipboardList, path: '/distributor/payouts' },
];

const staffMenuItems: MenuItem[] = [
  { label: 'Lead Management', icon: ClipboardList, path: '/staff/leads' },
  { label: 'Distributor Verification', icon: UserCheck, path: '/staff/verification' },
  { label: 'Targets', icon: Target, path: '/staff/targets' },
  { label: 'Incentives', icon: Gift, path: '/staff/incentives' },
  { label: 'Booking Approvals', icon: CheckSquare, path: '/staff/approvals' },
  { label: 'Reports', icon: FileText, path: '/staff/reports' },
];

const adminMenuItems: MenuItem[] = [
  { label: 'Platform Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Growth Analytics', icon: TrendingUp, path: '/admin/growth' },
  { label: 'Sales Monitoring', icon: BarChart3, path: '/admin/sales' },
  { label: 'Distributor Intelligence', icon: Brain, path: '/admin/distributor-intel' },
  { label: 'Staff Performance', icon: Award, path: '/admin/staff-performance' },
  { label: 'Binary Engine Control', icon: Settings, path: '/admin/binary-engine' },
  { label: 'EV Inventory', icon: Boxes, path: '/admin/inventory' },
  { label: 'Partner Shops', icon: Store, path: '/admin/partners' },
  { label: 'Pool Wallet Controller', icon: Landmark, path: '/admin/pool-wallet' },
  { label: 'Payout Engine', icon: DollarSign, path: '/admin/payout-engine' },
  { label: 'Risk & Compliance', icon: Shield, path: '/admin/compliance' },
  { label: 'Audit Logs', icon: ScrollText, path: '/admin/audit' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['user']);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary neon-glow'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          )}
        />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute right-0 h-8 w-1 rounded-l-full bg-primary"
          />
        )}
      </Link>
    );
  };

  const renderSection = (title: string, items: MenuItem[], sectionKey: string) => {
    const isExpanded = expandedSections.includes(sectionKey);

    return (
      <div key={sectionKey} className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {!collapsed && <span>{title}</span>}
          {!collapsed && (
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
            />
          )}
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative space-y-1 overflow-hidden"
            >
              {items.map(renderMenuItem)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display text-lg font-bold gradient-text">EV Platform</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {renderSection('User', userMenuItems, 'user')}
        
        {user?.isDistributor && renderSection('Distributor', distributorMenuItems, 'distributor')}
        
        {user?.role === 'staff' && renderSection('Staff', staffMenuItems, 'staff')}
        
        {user?.role === 'admin' && renderSection('Admin', adminMenuItems, 'admin')}
      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <div className="border-t border-border p-4">
          <div className="glass-card flex items-center gap-3 rounded-lg p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};
