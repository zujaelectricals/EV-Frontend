import { motion } from 'framer-motion';
import {
  GitBranch,
  Users,
  DollarSign,
  TrendingUp,
  Link as LinkIcon,
  Copy,
  ArrowRight,
  Target,
  Award,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetBinaryStatsQuery, useGetPairHistoryQuery } from '@/app/api/binaryApi';
import { useGetWalletsQuery } from '@/app/api/walletApi';
import { StatsCard } from '@/shared/components/StatsCard';
import { WalletCard } from '@/wallet/components/WalletCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const DistributorDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: binaryStats } = useGetBinaryStatsQuery();
  const { data: pairHistory } = useGetPairHistoryQuery();
  const { data: wallets } = useGetWalletsQuery();

  const referralLink = `https://evplatform.com/ref/${user?.id || 'demo'}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const ceilingPercentage = binaryStats
    ? (binaryStats.ceilingUsed / binaryStats.ceilingLimit) * 100
    : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden rounded-2xl p-8"
      >
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-info/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Distributor Dashboard</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
              Welcome, {user?.name}! 🚀
            </h1>
            <p className="mt-2 text-muted-foreground">
              Grow your network and maximize your earnings with our binary system.
            </p>
          </div>

          {/* Referral Link Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-xl border border-primary/30 p-4"
          >
            <p className="mb-2 text-xs font-medium text-muted-foreground">Your Referral Link</p>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              <code className="flex-1 truncate text-sm text-foreground">{referralLink}</code>
              <Button size="sm" variant="outline" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <StatsCard
            title="Total Left PV"
            value={binaryStats?.totalLeftPV.toLocaleString() || '0'}
            icon={GitBranch}
            variant="info"
            change={8.5}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Total Right PV"
            value={binaryStats?.totalRightPV.toLocaleString() || '0'}
            icon={GitBranch}
            variant="success"
            change={12.3}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Total Pairs"
            value={binaryStats?.totalPairs || 0}
            icon={Users}
            variant="primary"
            change={15}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Monthly Earnings"
            value={`₹${(binaryStats?.monthlyEarnings || 0).toLocaleString()}`}
            icon={DollarSign}
            variant="warning"
            change={22}
            trend="up"
          />
        </motion.div>
      </motion.div>

      {/* Ceiling Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-3">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Monthly Ceiling Progress</h3>
              <p className="text-sm text-muted-foreground">
                ₹{binaryStats?.ceilingUsed.toLocaleString()} of ₹{binaryStats?.ceilingLimit.toLocaleString()}
              </p>
            </div>
          </div>
          <span className="font-display text-2xl font-bold text-primary">
            {ceilingPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="mt-4">
          <Progress value={ceilingPercentage} className="h-3" />
        </div>
        {ceilingPercentage >= 80 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-warning"
          >
            ⚠️ You're approaching your monthly ceiling. Consider upgrading your plan!
          </motion.p>
        )}
      </motion.div>

      {/* Binary Tree Preview & Wallets */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Binary Tree Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">Binary Network</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/distributor/binary-tree">
                View Full Tree <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Simplified Tree Preview */}
          <div className="flex flex-col items-center py-8">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-8 rounded-xl border-2 border-primary bg-primary/20 p-4 shadow-neon"
            >
              <p className="text-center text-sm font-semibold text-primary">You</p>
            </motion.div>
            
            <div className="flex w-full justify-center gap-16">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-px bg-gradient-to-b from-info to-transparent" />
                <div className="rounded-lg border border-info/50 bg-info/10 p-3">
                  <p className="text-xs text-muted-foreground">Left Leg</p>
                  <p className="font-semibold text-info">{binaryStats?.totalLeftPV} PV</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-px bg-gradient-to-b from-success to-transparent" />
                <div className="rounded-lg border border-success/50 bg-success/10 p-3">
                  <p className="text-xs text-muted-foreground">Right Leg</p>
                  <p className="font-semibold text-success">{binaryStats?.totalRightPV} PV</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallets */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="font-display text-lg font-semibold text-foreground">My Wallets</h3>
          <div className="grid gap-4">
            <WalletCard
              title="Binary Wallet"
              balance={wallets?.find((w) => w.type === 'binary')?.balance || 45600}
              locked={0}
              variant="binary"
            />
            <WalletCard
              title="Pool Wallet"
              balance={wallets?.find((w) => w.type === 'pool')?.balance || 15000}
              locked={15000}
              variant="pool"
              isLocked
            />
          </div>
        </motion.div>
      </div>

      {/* Pair Matching History */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Recent Pair Matches
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/distributor/pair-history">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="glass-card overflow-hidden rounded-xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                  Left PV
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                  Right PV
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                  Matched
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                  Bonus
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                  Carry Forward
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pairHistory?.map((match, index) => (
                <motion.tr
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-muted/20"
                >
                  <td className="px-4 py-3 text-sm text-foreground">{match.matchedAt}</td>
                  <td className="px-4 py-3 text-sm text-info">{match.leftPV.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-success">{match.rightPV.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary">
                    {match.matchedPV.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-warning">
                    +₹{match.bonus.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    L: {match.carryForward.left} | R: {match.carryForward.right}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};
