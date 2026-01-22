import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  GitBranch,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Authorized Partner Application Pending</h2>
          <p className="text-muted-foreground mb-6">
            Your authorized partner application is under review. You'll be notified once it's approved.
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
      {/* All KPA Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      >
        <StatsCard
          title="Total Referrals"
          value={(binaryStats?.totalReferrals || 0).toLocaleString()}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Total Pairs"
          value={(binaryStats?.totalPairs || 0).toString()}
          icon={GitBranch}
          variant="info"
        />
        <StatsCard
          title="Reserve Wallet"
          value={`₹${(binaryStats?.poolMoney || user?.distributorInfo?.poolMoney || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="warning"
        />
        <StatsCard
          title="Total Gross Earnings"
          value={`₹${totalGross.toLocaleString()}`}
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title="Total TDS Deducted"
          value={`₹${totalTDS.toLocaleString()}`}
          icon={TrendingDown}
          variant="warning"
        />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/distributor/binary-tree">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card flex items-center gap-4 rounded-xl p-6 transition-all hover:border-primary/50"
          >
            <div className="rounded-xl bg-primary/20 p-4">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Team Network</p>
              <p className="text-sm text-muted-foreground">View network</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
          </motion.div>
        </Link>

        <Link to="/distributor/pool-wallet">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card flex items-center gap-4 rounded-xl p-6 transition-all hover:border-primary/50"
          >
            <div className="rounded-xl bg-warning/20 p-4">
              <DollarSign className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Pool Money</p>
              <p className="text-sm text-muted-foreground">Manage withdrawals</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
          </motion.div>
        </Link>

        <Link to="/distributor/payouts">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card flex items-center gap-4 rounded-xl p-6 transition-all hover:border-primary/50"
          >
            <div className="rounded-xl bg-success/20 p-4">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Payouts</p>
              <p className="text-sm text-muted-foreground">View history</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
          </motion.div>
        </Link>
      </div>

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
