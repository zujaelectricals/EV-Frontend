import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

export const StatsCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  variant = 'default',
}: StatsCardProps) => {
  const variants = {
    default: 'border-border',
    primary: 'border-primary/30',
    success: 'border-success/30',
    warning: 'border-warning/30',
    info: 'border-info/30',
  };

  const iconVariants = {
    default: 'bg-secondary text-foreground',
    primary: 'bg-primary/20 text-primary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    info: 'bg-info/20 text-info',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'glass-card relative overflow-hidden rounded-xl border p-6 transition-all',
        variants[variant]
      )}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          'absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl',
          variant === 'primary' && 'bg-primary',
          variant === 'success' && 'bg-success',
          variant === 'warning' && 'bg-warning',
          variant === 'info' && 'bg-info'
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-success' : 'text-destructive'
                )}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconVariants[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};
