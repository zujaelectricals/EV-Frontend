import { motion } from 'framer-motion';
import { Award, Link as LinkIcon, GitBranch, DollarSign, Users, Wallet, FileText, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/app/hooks';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function DistributorOptions() {
  const { user } = useAppSelector((state) => state.auth);
  const distributorInfo = user?.distributorInfo;

  const referralLink = `https://zuja.com/ref/${distributorInfo?.referralCode || user?.id}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('ASA link copied to clipboard!');
  };

  const distributorOptions = [
    {
      id: 'referral',
      title: 'ASA Link',
      description: 'Share your ASA link to earn commissions',
      icon: LinkIcon,
      action: copyReferralLink,
      actionLabel: 'Copy Link',
      value: distributorInfo?.referralCode || 'N/A',
    },
    {
      id: 'binary',
      title: 'Team Network',
      description: 'View your referral network and track team performance',
      icon: GitBranch,
      action: () => window.location.href = '/distributor/binary-tree',
      actionLabel: 'View Tree',
      value: `${distributorInfo?.totalPairs || 0} pairs`,
    },
    {
      id: 'earnings',
      title: 'Earnings',
      description: 'Track your commissions and payouts',
      icon: DollarSign,
      action: () => window.location.href = '/distributor/earnings',
      actionLabel: 'View Earnings',
      value: `₹${(distributorInfo?.poolMoney || 0).toLocaleString()}`,
    },
    {
      id: 'referrals',
      title: 'My Referrals',
      description: 'View all users you referred',
      icon: Users,
      action: () => window.location.href = '/distributor/referral',
      actionLabel: 'View Referrals',
      value: `${distributorInfo?.totalReferrals || 0} referrals`,
    },
    {
      id: 'pool',
      title: 'Reserve Wallet',
      description: 'Manage your reserve wallet withdrawals',
      icon: Wallet,
      action: () => window.location.href = '/distributor/pool-wallet',
      actionLabel: 'Manage Reserve',
      value: `₹${(distributorInfo?.poolMoney || 0).toLocaleString()}`,
    },
    {
      id: 'nominee',
      title: 'Nominee',
      description: 'Manage nominee information',
      icon: FileText,
      action: () => window.location.href = '/distributor/nominee',
      actionLabel: 'Manage Nominee',
      value: distributorInfo?.nominee ? 'Added' : 'Not Added',
    },
    {
      id: 'payouts',
      title: 'Payout History',
      description: 'View your payout requests and history',
      icon: DollarSign,
      action: () => window.location.href = '/distributor/payouts',
      actionLabel: 'View History',
      value: 'View Details',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">ASA(Authorized Sales Associate) Options</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your ASA(Authorized Sales Associate) account and track your earnings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {distributorOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <option.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">{option.title}</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="mb-3 sm:mb-4">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{option.value}</p>
                </div>
                <Button onClick={option.action} className="w-full text-xs sm:text-sm" variant="outline" size="sm">
                  {option.actionLabel}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

