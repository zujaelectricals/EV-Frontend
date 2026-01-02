import { motion } from 'framer-motion';
import {
  Car,
  CreditCard,
  Wallet,
  Package,
  TrendingUp,
  Calendar,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetWalletsQuery, useGetTransactionsQuery } from '@/app/api/walletApi';
import { StatsCard } from '@/shared/components/StatsCard';
import { WalletCard } from '@/wallet/components/WalletCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const UserDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: wallets } = useGetWalletsQuery();
  const { data: transactions } = useGetTransactionsQuery({ limit: 5 });

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
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden rounded-2xl p-8"
      >
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Welcome back</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
            Hello, {user?.name || 'User'}! 👋
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Your electric journey awaits. Browse our latest EV models and take advantage of
            exclusive pre-booking offers.
          </p>
          <div className="mt-6 flex gap-4">
            <Button asChild className="group">
              <Link to="/bookings">
                Book an EV
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            {!user?.isDistributor && (
              <Button variant="outline" asChild>
                <Link to="/become-distributor">Become a Distributor</Link>
              </Button>
            )}
          </div>
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
            title="Active Bookings"
            value="2"
            icon={Car}
            variant="primary"
            change={50}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="EMI Pending"
            value="₹25,000"
            icon={CreditCard}
            variant="warning"
            change={-10}
            trend="down"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Wallet Balance"
            value="₹1,25,000"
            icon={Wallet}
            variant="success"
            change={15}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Orders Delivered"
            value="5"
            icon={Package}
            variant="info"
            change={25}
            trend="up"
          />
        </motion.div>
      </motion.div>

      {/* Wallets Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">My Wallets</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/redemption">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets?.slice(0, 3).map((wallet) => (
            <WalletCard
              key={wallet.type}
              title={`${wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet`}
              balance={wallet.balance}
              locked={wallet.locked}
              available={wallet.available}
              variant={wallet.type}
              isLocked={wallet.type === 'pool'}
            />
          ))}
        </div>
      </motion.section>

      {/* Recent Transactions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent Transactions</h2>
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="glass-card rounded-xl">
          <div className="divide-y divide-border">
            {transactions?.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      tx.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingUp className="h-5 w-5 rotate-180 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.createdAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === 'credit' ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                      tx.status === 'completed'
                        ? 'bg-success/20 text-success'
                        : tx.status === 'pending'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Link to="/bookings">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card flex items-center gap-4 rounded-xl p-6 transition-all hover:border-primary/50"
          >
            <div className="rounded-xl bg-primary/20 p-4">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Browse EVs</p>
              <p className="text-sm text-muted-foreground">Explore our collection</p>
            </div>
          </motion.div>
        </Link>
        <Link to="/payments">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card flex items-center gap-4 rounded-xl p-6 transition-all hover:border-primary/50"
          >
            <div className="rounded-xl bg-warning/20 p-4">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Pay EMI</p>
              <p className="text-sm text-muted-foreground">Manage your payments</p>
            </div>
          </motion.div>
        </Link>
        <Link to="/orders">
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card flex items-center gap-4 rounded-xl p-6 transition-all hover:border-primary/50"
          >
            <div className="rounded-xl bg-info/20 p-4">
              <Package className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Track Orders</p>
              <p className="text-sm text-muted-foreground">View order status</p>
            </div>
          </motion.div>
        </Link>
      </motion.section>
    </div>
  );
};
