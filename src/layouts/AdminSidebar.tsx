import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  User,
  Users,
  Ticket,
  FileText,
  Key,
  Image as ImageIcon,
  FileCheck,
} from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface SubMenuItem {
  label: string;
  path: string;
  badge?: number;
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
}

interface MenuSection {
  label: string;
  icon: React.ElementType;
  value: string;
  path?: string; // Optional path for parent menu item
  children: SubMenuItem[];
  badge?: number;
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
}

const adminMenuSections: MenuSection[] = [
  {
    label: "Platform Dashboard",
    icon: LayoutDashboard,
    value: "dashboard",
    path: "/admin",
    children: [],
  },
  // {
  //   label: 'Growth Analytics',
  //   icon: TrendingUp,
  //   value: 'growth',
  //   children: [
  //     { label: 'EV Sales Funnel', path: '/admin/growth/sales-funnel' },
  //     { label: 'Active Buyer Growth', path: '/admin/growth/buyer-growth' },
  //     { label: 'Distributor Expansion Graph', path: '/admin/growth/distributor-expansion' },
  //     { label: 'Network Saturation Map', path: '/admin/growth/network-saturation' },
  //     { label: 'Revenue Forecast', path: '/admin/growth/revenue-forecast' },
  //   ],
  // },
  {
    label: "Sales Monitoring",
    icon: BarChart3,
    value: "sales",
    children: [
      { label: "Pre-Bookings", path: "/admin/sales/pre-bookings" },
      //{ label: "EMI Orders", path: "/admin/sales/emi-orders" },
      { label: "Cancelled Orders", path: "/admin/sales/cancelled" },
      // { label: "Drop-off Users", path: "/admin/sales/drop-off" },
      // { label: "Partner Redemptions", path: "/admin/sales/redemptions" },
    ],
  },
  // {
  //   label: "Distributor Intelligence",
  //   icon: Brain,
  //   value: "distributor-intel",
  //   children: [
  //     {
  //       label: "Binary Tree Viewer",
  //       path: "/admin/distributor-intel/binary-tree",
  //     },
  //     {
  //       label: "Weak-Leg Detection",
  //       path: "/admin/distributor-intel/weak-leg",
  //     },
  //     {
  //       label: "Pair Matching History",
  //       path: "/admin/distributor-intel/pair-history",
  //     },
  //     {
  //       label: "Ceiling Achievements",
  //       path: "/admin/distributor-intel/ceiling",
  //     },
  //     {
  //       label: "Top Performers",
  //       path: "/admin/distributor-intel/top-performers",
  //     },
  //     {
  //       label: "Dormant Distributors",
  //       path: "/admin/distributor-intel/dormant",
  //     },
  //   ],
  // },
  // {
  //   label: "Staff Performance",
  //   icon: Award,
  //   value: "staff-performance",
  //   children: [
  //     { label: "Staff Targets", path: "/admin/staff-performance/targets" },
  //     {
  //       label: "Incentives Earned",
  //       path: "/admin/staff-performance/incentives",
  //     },
  //     //{ label: 'Approval Delay Report', path: '/admin/staff-performance/approval-delay' },
  //     {
  //       label: "Lead Conversion Rate",
  //       path: "/admin/staff-performance/conversion",
  //     },
  //   ],
  // },
  {
    label: "EV Inventory",
    icon: Boxes,
    value: "inventory",
    children: [
      { label: "Models", path: "/admin/inventory/models" },
      { label: "Stock Level", path: "/admin/inventory/stock" },
      //{ label: "Delivery Pipeline", path: "/admin/inventory/delivery" },
      //{ label: 'Pending Allocations', path: '/admin/inventory/allocations' },
    ],
  },
  // {
  //   label: "Partner Shops",
  //   icon: Store,
  //   value: "partners",
  //   children: [
  //     { label: "Shop List", path: "/admin/partners/shops" },
  //     { label: "Product Mapping", path: "/admin/partners/products" },
  //     { label: "Redemption Load", path: "/admin/partners/redemption" },
  //     { label: "Commission Ratio", path: "/admin/partners/commission" },
  //   ],
  // },
  // {
  //   label: "Reserve Wallet Controller",
  //   icon: Landmark,
  //   value: "pool-wallet",
  //   children: [
  //     { label: "Withdrawal History", path: "/admin/pool-wallet" },
  //     { label: "Active Reserve Balances", path: "/admin/pool-wallet/balances" },
  //     {
  //       label: "Emergency Withdrawals",
  //       path: "/admin/pool-wallet/withdrawals",
  //     },
  //     { label: "Nominee Transfers", path: "/admin/pool-wallet/transfers" },
  //     { label: "Reserve Utilization", path: "/admin/pool-wallet/utilization" },
  //   ],
  // },
  // {
  //   label: "Payout Engine",
  //   icon: DollarSign,
  //   value: "payout-engine",
  //   badge: 12, // Mock pending payouts count
  //   badgeVariant: "destructive",
  //   children: [
  //     {
  //       label: "Pending Payouts",
  //       path: "/admin/payout-engine/pending",
  //       badge: 12,
  //       badgeVariant: "destructive",
  //     },
  //     { label: "Approved Payouts", path: "/admin/payout-engine/approved" },
  //     { label: "Rejected Payouts", path: "/admin/payout-engine/rejected" },
  //     {
  //       label: "Bank Settlement Logs",
  //       path: "/admin/payout-engine/settlement",
  //     },
  //   ],
  // },
  // {
  //   label: 'Pin Management',
  //   icon: Key,
  //   value: 'pin-management',
  //   children: [
  //     { label: 'All Pins', path: '/admin/pin-management/all' },
  //     { label: 'User Pins', path: '/admin/pin-management/user' },
  //     { label: 'Admin Pins', path: '/admin/pin-management/admin' },
  //     { label: 'Used Pins', path: '/admin/pin-management/used' },
  //     { label: 'Unused Pins', path: '/admin/pin-management/unused' },
  //   ],
  // },
  {
    label: "User Management",
    icon: Users,
    value: "users",
    children: [
      { label: "Users", path: "/admin/users/active" },
      {
        label: "Partners Management",
        path: "/admin/users/partners-management",
      },
      // { label: "Paid Users", path: "/admin/users/paid" },
      // { label: "Blocked Users", path: "/admin/users/blocked" },
      // { label: "Email Unverified", path: "/admin/users/email-unverified" },
      // { label: "Mobile Unverified", path: "/admin/users/mobile-unverified" },
      {
        label: "KYC Records",
        path: "/admin/users/kyc-records",
      },
      {
        label: "Payouts",
        path: "/admin/users/payouts",
      },
      {
        label: "Payment Management",
        path: "/admin/users/payment-management",
      },
      //{ label: "Send Notification", path: "/admin/users/notify" },
    ],
  },
  // {
  //   label: "Support Tickets",
  //   icon: Ticket,
  //   value: "tickets",
  //   badge: 5, // Mock pending tickets count
  //   badgeVariant: "destructive",
  //   children: [
  //     {
  //       label: "Pending Tickets",
  //       path: "/admin/tickets/pending",
  //       badge: 5,
  //       badgeVariant: "destructive",
  //     },
  //     { label: "Closed Tickets", path: "/admin/tickets/closed" },
  //     { label: "Answered Tickets", path: "/admin/tickets/answered" },
  //     { label: "All Tickets", path: "/admin/tickets/all" },
  //   ],
  // },
  {
    label: "Gallery",
    icon: ImageIcon,
    value: "gallery",
    path: "/admin/gallery",
    children: [],
  },
  {
    label: "Documents",
    icon: FileCheck,
    value: "documents",
    path: "/admin/documents",
    children: [],
  },
  {
    label: "Reports",
    icon: FileText,
    value: "reports",
    children: [
      { label: "Transaction History", path: "/admin/reports/transactions" },
      { label: "Investment Logs", path: "/admin/reports/investments" },
      { label: "BV Logs", path: "/admin/reports/bv" },
      //{ label: "Referral Commission", path: "/admin/reports/referral" },
      { label: "Team Commission", path: "/admin/reports/binary" },
      //{ label: "Login History", path: "/admin/reports/login" },
      //{ label: "Notification History", path: "/admin/reports/notifications" },
    ],
  },
  {
    label: "Binary Engine Control",
    icon: Settings,
    value: "binary-engine",
    path: "/admin/binary-engine/pair-rules",
    children: [],
  },
  // {
  //   label: "Risk & Compliance",
  //   icon: Shield,
  //   value: "compliance",
  //   children: [
  //     {
  //       label: "Duplicate PAN Detection",
  //       path: "/admin/compliance/duplicate-pan",
  //     },
  //     { label: "Bank Abuse Monitor", path: "/admin/compliance/bank-abuse" },
  //     {
  //       label: "Referral Farming Alerts",
  //       path: "/admin/compliance/referral-farming",
  //     },
  //     {
  //       label: "Rapid Growth Suspicion",
  //       path: "/admin/compliance/rapid-growth",
  //     },
  //   ],
  // },
  // {
  //   label: "Audit Logs",
  //   icon: ScrollText,
  //   value: "audit",
  //   children: [
  //     { label: "Wallet Changes", path: "/admin/audit/wallet" },
  //     { label: "Payout Modifications", path: "/admin/audit/payout" },
  //     { label: "Binary Adjustments", path: "/admin/audit/binary" },
  //     { label: "Admin Activity Logs", path: "/admin/audit/activity" },
  //   ],
  // },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('admin_sidebar_collapsed');
    return stored === 'true';
  });

  // Use static menu sections without KYC pending count
  const dynamicMenuSections = adminMenuSections;
  
  // Store collapsed state in localStorage
  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(collapsed));
    // Dispatch custom event for MainLayout to listen
    window.dispatchEvent(new CustomEvent('adminSidebarCollapsedChange', { detail: { collapsed } }));
  }, [collapsed]);

  // Auto-expand sections based on current route
  const getActiveSection = useCallback(() => {
    const path = location.pathname;
    // Find the best matching section
    // We'll check all sections and find the most specific match
    let bestMatch: { section: string; specificity: number } | null = null;

    for (const section of dynamicMenuSections) {
      // Check if current path matches parent path exactly (for direct path sections)
      if (section.path && section.path === path) {
        return section.value;
      }
      // Check if path starts with section path (for direct path sections with sub-routes)
      if (section.path && section.path !== "/admin" && path.startsWith(section.path)) {
        const specificity = section.path.length;
        if (!bestMatch || specificity > bestMatch.specificity) {
          bestMatch = { section: section.value, specificity };
        }
      }
      // Check children for matches
      for (const child of section.children) {
        // Exact match - highest priority
        if (path === child.path) {
          return section.value;
        }
        // Sub-path match (path starts with child.path + '/')
        // Special case: don't match '/admin' as a sub-path of '/admin/*' routes
        if (child.path !== "/admin" && path.startsWith(child.path + "/")) {
          // Use path length as specificity (longer = more specific)
          const specificity = child.path.length;
          if (!bestMatch || specificity > bestMatch.specificity) {
            bestMatch = { section: section.value, specificity };
          }
        }
      }
    }

    // Return the best sub-path match, or default to dashboard
    return bestMatch?.section || "dashboard";
  }, [location.pathname, dynamicMenuSections]);

  // Initialize open sections with active section
  const [openSections, setOpenSections] = useState<string[]>(() => {
    const activeSection = getActiveSection();
    return activeSection ? [activeSection] : ["dashboard"];
  });

  // Update open sections when route changes
  useEffect(() => {
    const activeSection = getActiveSection();
    if (activeSection) {
      setOpenSections([activeSection]);
    }
  }, [getActiveSection]);

  const isSubMenuActive = (path: string, allChildren: SubMenuItem[]) => {
    const currentPath = location.pathname;

    // Exact match
    if (currentPath === path) {
      return true;
    }

    // Special case: /admin is the root path, only match exactly (not as a prefix)
    if (path === "/admin") {
      return false;
    }

    // Check if current path starts with this path, but make sure it's not matching a sibling
    // For example, if path is '/admin/pool-wallet' and currentPath is '/admin/pool-wallet/withdrawals',
    // we should only match if there's no other child that matches more specifically
    if (currentPath.startsWith(path + "/")) {
      // Check if any other child path is a more specific match
      const moreSpecificMatch = allChildren.find(
        (child) => child.path !== path && currentPath.startsWith(child.path)
      );
      // Only match if no more specific child path exists
      return !moreSpecificMatch;
    }

    return false;
  };

  const isSectionActive = (section: MenuSection) => {
    // If section has a direct path, check if it matches
    if (section.path && section.children.length === 0) {
      return location.pathname === section.path || 
        (section.path !== "/admin" && location.pathname.startsWith(section.path));
    }
    // Otherwise check children
    return section.children.some((child) =>
      isSubMenuActive(child.path, section.children)
    );
  };

  const renderSubMenuItem = (
    item: SubMenuItem,
    sectionValue: string,
    allChildren: SubMenuItem[]
  ) => {
    const active = isSubMenuActive(item.path, allChildren);
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
            "group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ml-6",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                active ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
            {item.label}
          </span>
          {item.badge !== undefined && (
            <Badge
              variant={item.badgeVariant || "default"}
              className="h-5 min-w-5 px-1.5 text-xs"
            >
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
    const isParentPathActive =
      section.path && location.pathname === section.path;
    
    // If section has a direct path and no children, render as a simple link
    if (section.path && section.children.length === 0) {
      const isActive = location.pathname === section.path || 
        (section.path !== "/admin" && location.pathname.startsWith(section.path));
      
      return (
        <Link
          key={section.value}
          to={section.path}
          className={cn(
            "group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary"
              )}
            />
            {!collapsed && (
              <span className="truncate flex-1 text-left">{section.label}</span>
            )}
            {!collapsed && section.badge !== undefined && (
              <Badge
                variant={section.badgeVariant || "default"}
                className="h-5 min-w-5 px-1.5 text-xs"
              >
                {section.badge}
              </Badge>
            )}
          </div>
          {isActive && (
            <motion.div
              layoutId="activeSectionIndicator"
              className="absolute right-0 h-8 w-1 rounded-l-full bg-primary"
            />
          )}
        </Link>
      );
    }

    // Otherwise, render as accordion item with children
    return (
      <AccordionItem
        key={section.value}
        value={section.value}
        className="border-none"
      >
        <AccordionTrigger
          className={cn(
            "group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:no-underline",
            sectionActive || isParentPathActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            <Icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                sectionActive || isParentPathActive
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary"
              )}
            />
            {!collapsed && (
              <span className="truncate flex-1 text-left">{section.label}</span>
            )}
            {!collapsed && section.badge !== undefined && (
              <Badge
                variant={section.badgeVariant || "default"}
                className="h-5 min-w-5 px-1.5 text-xs"
              >
                {section.badge}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-1 pb-2">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 overflow-hidden"
          >
            {section.children.map((child) =>
              renderSubMenuItem(child, section.value, section.children)
            )}
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
        "fixed left-0 top-0 flex flex-col border-r border-border/50 transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-72"
      )}
      style={{
        height: "100vh",
        maxHeight: "100vh",
        background:
          "linear-gradient(160deg, rgba(241, 245, 249, 0.98) 0%, rgba(226, 232, 240, 0.95) 25%, rgba(238, 242, 255, 0.96) 50%, rgba(243, 244, 246, 0.97) 75%, rgba(248, 250, 252, 0.98) 100%)",
        backdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04), inset -1px 0 0 rgba(147, 197, 253, 0.1)",
      }}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Link to="/admin" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Zuja Electric"
            className={collapsed ? "h-7 w-auto" : "h-9 w-auto"}
          />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3">
        {collapsed ? (
          <div className="space-y-2">
            {dynamicMenuSections.map((section) => {
              const Icon = section.icon;
              const sectionActive = isSectionActive(section);
              const targetPath = section.path || section.children[0]?.path || "/admin";
              return (
                <Link
                  key={section.value}
                  to={targetPath}
                  className={cn(
                    "group relative flex items-center justify-center rounded-lg p-3 text-sm font-medium transition-all duration-200",
                    sectionActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  title={section.label}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      sectionActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  />
                  {section.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-white">
                      {section.badge > 9 ? "9+" : section.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {(() => {
              const result: JSX.Element[] = [];
              let accordionGroup: MenuSection[] = [];
              
              dynamicMenuSections.forEach((section, index) => {
                const isDirectPath = section.path && section.children.length === 0;
                const nextSection = dynamicMenuSections[index + 1];
                const isNextDirectPath = nextSection && nextSection.path && nextSection.children.length === 0;
                
                if (isDirectPath) {
                  // If we have accumulated accordion sections, render them first
                  if (accordionGroup.length > 0) {
                    result.push(
                      <Accordion
                        key={`accordion-${index}`}
                        type="multiple"
                        value={openSections}
                        onValueChange={setOpenSections}
                        className="space-y-1"
                        defaultValue={[getActiveSection()]}
                      >
                        {accordionGroup.map(renderSection)}
                      </Accordion>
                    );
                    accordionGroup = [];
                  }
                  // Render direct path section
                  result.push(
                    <div key={section.value}>
                      {renderSection(section)}
                    </div>
                  );
                } else {
                  // Accumulate accordion sections
                  accordionGroup.push(section);
                  // If next section is direct path or this is the last section, render accordion
                  if (isNextDirectPath || !nextSection) {
                    result.push(
                      <Accordion
                        key={`accordion-${index}`}
                        type="multiple"
                        value={openSections}
                        onValueChange={setOpenSections}
                        className="space-y-1"
                        defaultValue={[getActiveSection()]}
                      >
                        {accordionGroup.map(renderSection)}
                      </Accordion>
                    );
                    accordionGroup = [];
                  }
                }
              });
              
              return result;
            })()}
          </div>
        )}
      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 border-t border-border p-3"
        >
          <div className="glass-card flex items-center gap-3 rounded-lg p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};
