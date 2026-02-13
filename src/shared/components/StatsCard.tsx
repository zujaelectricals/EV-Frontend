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
  /** Optional delay for stagger animation (seconds) */
  transitionDelay?: number;
}

export const StatsCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  variant = 'default',
  transitionDelay = 0,
}: StatsCardProps) => {
  const cardVariants = {
    default: 'border-border bg-white shadow-lg shadow-slate-200/50',
    primary: 'border-pink-500/30 bg-gradient-to-br from-white to-pink-50/30 shadow-lg shadow-pink-500/10',
    success: 'border-pink-400/30 bg-gradient-to-br from-white to-pink-50/30 shadow-lg shadow-pink-500/10',
    warning: 'border-amber-400/30 bg-gradient-to-br from-white to-amber-50/30 shadow-lg shadow-amber-500/10',
    info: 'border-sky-400/30 bg-gradient-to-br from-white to-sky-50/30 shadow-lg shadow-sky-500/10',
  };

  const iconVariants = {
    default: 'bg-muted text-foreground',
    primary: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-600',
    success: 'bg-gradient-to-br from-pink-400/20 to-pink-600/20 text-pink-600',
    warning: 'bg-gradient-to-br from-amber-400/20 to-orange-400/20 text-amber-600',
    info: 'bg-gradient-to-br from-sky-400/20 to-blue-500/20 text-sky-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: transitionDelay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 p-6 transition-all h-full',
        'ring-2 ring-transparent hover:ring-pink-500/20',
        cardVariants[variant]
      )}
    >
      {/* Gradient accent strip */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-1 rounded-l-2xl',
          variant === 'primary' && 'bg-gradient-to-b from-pink-500 to-rose-500',
          variant === 'success' && 'bg-gradient-to-b from-pink-400 to-pink-600',
          variant === 'warning' && 'bg-gradient-to-b from-amber-400 to-orange-400',
          variant === 'info' && 'bg-gradient-to-b from-sky-400 to-blue-500',
          variant === 'default' && 'bg-gradient-to-b from-slate-300 to-slate-400'
        )}
      />
      {/* Background glow */}
      <div
        className={cn(
          'absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15 blur-3xl',
          variant === 'primary' && 'bg-pink-500',
          variant === 'success' && 'bg-pink-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'info' && 'bg-sky-500'
        )}
      />

      <div className="relative flex items-start justify-between pl-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
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
        <div className={cn('rounded-xl p-3.5 shrink-0', iconVariants[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};
