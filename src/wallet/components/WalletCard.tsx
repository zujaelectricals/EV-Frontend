import { motion } from 'framer-motion';
import { Wallet, Lock, ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletCardProps {
  title: string;
  balance: number;
  locked?: number;
  available?: number;
  currency?: string;
  icon?: LucideIcon;
  variant?: 'main' | 'binary' | 'pool' | 'redemption' | 'emi';
  isLocked?: boolean;
}

const variantStyles = {
  main: {
    gradient: 'from-primary/30 via-primary/10 to-transparent',
    border: 'border-primary/30',
    glow: 'shadow-[0_0_30px_hsl(160_100%_50%/0.2)]',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
  },
  binary: {
    gradient: 'from-info/30 via-info/10 to-transparent',
    border: 'border-info/30',
    glow: 'shadow-[0_0_30px_hsl(200_100%_50%/0.2)]',
    iconBg: 'bg-info/20',
    iconColor: 'text-info',
  },
  pool: {
    gradient: 'from-warning/30 via-warning/10 to-transparent',
    border: 'border-warning/30',
    glow: 'shadow-[0_0_30px_hsl(45_100%_50%/0.2)]',
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning',
  },
  redemption: {
    gradient: 'from-success/30 via-success/10 to-transparent',
    border: 'border-success/30',
    glow: 'shadow-[0_0_30px_hsl(160_100%_50%/0.2)]',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
  },
  emi: {
    gradient: 'from-destructive/30 via-destructive/10 to-transparent',
    border: 'border-destructive/30',
    glow: 'shadow-[0_0_30px_hsl(0_72%_51%/0.2)]',
    iconBg: 'bg-destructive/20',
    iconColor: 'text-destructive',
  },
};

export const WalletCard = ({
  title,
  balance,
  locked = 0,
  available,
  currency = 'INR',
  icon: Icon = Wallet,
  variant = 'main',
  isLocked = false,
}: WalletCardProps) => {
  const styles = variantStyles[variant];
  const availableBalance = available ?? balance - locked;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl',
        styles.border,
        styles.glow,
        'bg-gradient-to-br from-card/80 to-card/40',
        isLocked && 'opacity-70'
      )}
    >
      {/* Gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', styles.gradient)} />

      {/* Shimmer effect */}
      <div className="absolute inset-0 animate-shimmer" />

      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {isLocked && <Lock className="h-4 w-4 text-warning" />}
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-foreground">
              {formatCurrency(balance)}
            </p>
          </div>
          <div className={cn('rounded-xl p-3', styles.iconBg)}>
            <Icon className={cn('h-6 w-6', styles.iconColor)} />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success" />
              Available
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatCurrency(availableBalance)}
            </p>
          </div>
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3 text-warning" />
              Locked
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(locked)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
