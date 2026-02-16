import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  GitBranch,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Link as LinkIcon,
  Copy,
  ArrowRight,
  Award,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useGetBinaryStatsQuery } from '@/app/api/binaryApi';
import { updateDistributorInfo } from '@/app/slices/authSlice';
import { StatsCard } from '@/shared/components/StatsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const DistributorDashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const distributorId = user?.id || '';
  const { data: binaryStats } = useGetBinaryStatsQuery(distributorId, { skip: !distributorId });

  // Sync pool money from localStorage to Redux state when binaryStats change
  useEffect(() => {
    if (user?.id && binaryStats) {
      try {
        const authDataStr = localStorage.getItem('ev_nexus_auth_data');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          if (authData.user && authData.user.distributorInfo && 
              authData.user.id === user.id) {
            const storedPoolMoney = authData.user.distributorInfo.poolMoney || 0;
            // Update Redux state if pool money has changed
            if (user.distributorInfo?.poolMoney !== storedPoolMoney) {
              dispatch(updateDistributorInfo({
                poolMoney: storedPoolMoney,
                totalReferrals: binaryStats.totalReferrals,
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error syncing pool money:', error);
      }
    }
  }, [binaryStats, user?.id, dispatch, user?.distributorInfo?.poolMoney]);

  const referralLink = `https://zuja.com/ref/${user?.distributorInfo?.referralCode || user?.id || 'demo'}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  // Calculate earnings breakdown - KPA cards
  const totalGross = binaryStats?.totalEarnings || 0;
  const totalTDS = binaryStats?.tdsDeducted || 0;
  const totalPool = binaryStats?.poolMoney || 0;
  const totalNet = totalGross - totalTDS - totalPool;

  // Check if user is a verified distributor - isDistributor from API is sufficient
  const isVerified = user?.isDistributor === true || user?.distributorInfo?.isVerified;

  if (!isVerified) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground mb-2">ASA(Authorized Sales Associate) Application Pending</h2>
          <p className="text-muted-foreground mb-6">
            Your ASA(Authorized Sales Associate) application is under review. You'll be notified once it's approved.
          </p>
          <Button onClick={() => navigate('/profile?tab=distributor')}>
            View Application Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">ASA(Authorized Sales Associate) Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your referrals, earnings, and quick actions
        </p>
      </div>

      {/* All KPI Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Total Referrals"
          value={(binaryStats?.totalReferrals || 0).toLocaleString()}
          icon={Users}
          variant="primary"
          transitionDelay={0}
        />
        <StatsCard
          title="Total Partner Framework"
          value={(binaryStats?.totalPairs || 0).toString()}
          icon={GitBranch}
          variant="info"
          transitionDelay={0.05}
        />
        <StatsCard
          title="Total Gross Earnings"
          value={`₹${totalGross.toLocaleString()}`}
          icon={DollarSign}
          variant="primary"
          transitionDelay={0.1}
        />
        <StatsCard
          title="Total TDS Deducted"
          value={`₹${totalTDS.toLocaleString()}`}
          icon={TrendingDown}
          variant="warning"
          transitionDelay={0.15}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-2 gap-4"
      >
        <Link to="/distributor/binary-tree">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02, y: -6 }}
            className="group relative flex items-center gap-4 rounded-2xl border-2 border-pink-500/20 bg-gradient-to-br from-white to-pink-50/40 p-6 shadow-lg shadow-slate-200/50 transition-all hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/15"
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-4">
              <GitBranch className="h-6 w-6 text-pink-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">Team Network</p>
              <p className="text-sm text-muted-foreground">View network</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-pink-500" />
          </motion.div>
        </Link>

        <Link to="/distributor/orders">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -6 }}
            className="group relative flex items-center gap-4 rounded-2xl border-2 border-amber-400/20 bg-gradient-to-br from-white to-amber-50/40 p-6 shadow-lg shadow-slate-200/50 transition-all hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/15"
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 p-4">
              <Package className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">Order History</p>
              <p className="text-sm text-muted-foreground">View and manage orders</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
          </motion.div>
        </Link>

        <Link to="/distributor/payouts">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.02, y: -6 }}
            className="group relative flex items-center gap-4 rounded-2xl border-2 border-pink-400/20 bg-gradient-to-br from-white to-pink-50/40 p-6 shadow-lg shadow-slate-200/50 transition-all hover:border-rose-500/40 hover:shadow-xl hover:shadow-pink-500/15"
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-4">
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">Payouts</p>
              <p className="text-sm text-muted-foreground">View history</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-rose-500" />
          </motion.div>
        </Link>

        <Link to="/distributor/sales">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -6 }}
            className="group relative flex items-center gap-4 rounded-2xl border-2 border-sky-400/20 bg-gradient-to-br from-white to-sky-50/40 p-6 shadow-lg shadow-slate-200/50 transition-all hover:border-sky-400/40 hover:shadow-xl hover:shadow-sky-500/15"
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="rounded-xl bg-gradient-to-br from-sky-400/20 to-blue-500/20 p-4">
              <TrendingUp className="h-6 w-6 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">Sales Tracking</p>
              <p className="text-sm text-muted-foreground">Monitor sales and referrals</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-sky-600" />
          </motion.div>
        </Link>
      </motion.div>

      {/* CTA */}
      {/* <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground mb-4">
          For detailed options and management, visit your profile
        </p>
        <Button onClick={() => navigate('/profile?tab=distributor')}>
          Go to Profile <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div> */}
    </div>
  );
};
