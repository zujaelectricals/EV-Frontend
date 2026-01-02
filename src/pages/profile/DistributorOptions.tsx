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
    toast.success('Referral link copied to clipboard!');
  };

  const distributorOptions = [
    {
      id: 'referral',
      title: 'Referral Link',
      description: 'Share your referral link to earn commissions',
      icon: LinkIcon,
      action: copyReferralLink,
      actionLabel: 'Copy Link',
      value: distributorInfo?.referralCode || 'N/A',
    },
    {
      id: 'binary',
      title: 'Binary Tree',
      description: 'View your network and track pairs',
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
      title: 'Pool Money',
      description: 'Manage your pool money withdrawals',
      icon: Wallet,
      action: () => window.location.href = '/distributor/pool-wallet',
      actionLabel: 'Manage Pool',
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Distributor Options</h2>
        <p className="text-muted-foreground">
          Manage your distributor account and track your earnings
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {distributorOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <option.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </div>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary">{option.value}</p>
                </div>
                <Button onClick={option.action} className="w-full" variant="outline">
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

