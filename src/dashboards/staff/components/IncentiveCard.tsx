import { motion } from 'framer-motion';
import { Gift, DollarSign, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { EnhancedIncentive } from '../types';
import { format } from 'date-fns';

interface IncentiveCardProps {
  incentive: EnhancedIncentive;
  variant?: 'default' | 'compact';
}

export const IncentiveCard = ({ incentive, variant = 'default' }: IncentiveCardProps) => {
  const getStatusConfig = () => {
    switch (incentive.status) {
      case 'earned':
        return {
          color: 'text-success border-success/30 bg-success/5',
          icon: CheckCircle2,
          badge: 'default' as const,
          badgeLabel: 'Earned',
        };
      case 'pending':
        return {
          color: 'text-warning border-warning/30 bg-warning/5',
          icon: Clock,
          badge: 'secondary' as const,
          badgeLabel: 'Pending',
        };
      case 'processing':
        return {
          color: 'text-info border-info/30 bg-info/5',
          icon: AlertCircle,
          badge: 'outline' as const,
          badgeLabel: 'Processing',
        };
      case 'paid':
        return {
          color: 'text-primary border-primary/30 bg-primary/5',
          icon: CheckCircle2,
          badge: 'default' as const,
          badgeLabel: 'Paid',
        };
      default:
        return {
          color: 'text-foreground border-border',
          icon: Gift,
          badge: 'outline' as const,
          badgeLabel: incentive.status,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const progressPercentage = incentive.progress
    ? (incentive.progress.current / incentive.progress.target) * 100
    : 0;

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn('rounded-lg border p-4 transition-all hover:shadow-md', statusConfig.color)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{incentive.type}</h3>
              <Badge variant={statusConfig.badge} className="text-xs">
                {statusConfig.badgeLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{incentive.description}</p>
            {incentive.progress && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress: {incentive.progress.current} / {incentive.progress.target}</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            )}
          </div>
          <div className="ml-4 text-right">
            <div className="flex items-center gap-1 justify-end">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="text-xl font-bold text-foreground">
                {formatAmount(incentive.amount)}
              </span>
            </div>
            {incentive.date && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(incentive.date), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className={cn('relative overflow-hidden transition-all', statusConfig.color)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={cn('rounded-lg p-2.5', statusConfig.color)}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{incentive.type}</h3>
                  <Badge variant={statusConfig.badge}>
                    {statusConfig.badgeLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{incentive.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <DollarSign className="h-5 w-5 text-success" />
                <span className="text-3xl font-bold text-foreground">
                  {formatAmount(incentive.amount)}
                </span>
              </div>
              {incentive.taxAmount && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tax: {formatAmount(incentive.taxAmount)}
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar for Pending Incentives */}
          {incentive.status === 'pending' && incentive.progress && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Progress to unlock</span>
                <span className="text-xs font-medium">
                  {incentive.progress.current} / {incentive.progress.target}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-warning" />
                <span className="text-xs text-muted-foreground">
                  {incentive.progress.target - incentive.progress.current} more needed
                </span>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-xs">
              {incentive.earnedDate && (
                <span className="text-muted-foreground">
                  Earned: {format(new Date(incentive.earnedDate), 'MMM dd, yyyy')}
                </span>
              )}
              {incentive.paidDate && (
                <span className="text-muted-foreground">
                  Paid: {format(new Date(incentive.paidDate), 'MMM dd, yyyy')}
                </span>
              )}
              {!incentive.earnedDate && !incentive.paidDate && incentive.date && (
                <span className="text-muted-foreground">
                  Date: {format(new Date(incentive.date), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
            {incentive.transactionId && (
              <p className="text-xs text-muted-foreground">
                Transaction ID: {incentive.transactionId}
              </p>
            )}
            {incentive.paymentMethod && (
              <p className="text-xs text-muted-foreground">
                Payment Method: {incentive.paymentMethod}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

