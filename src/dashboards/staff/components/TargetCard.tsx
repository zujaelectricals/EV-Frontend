import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EnhancedTarget } from '../types';
import { format, differenceInDays } from 'date-fns';

interface TargetCardProps {
  target: EnhancedTarget;
  showSparkline?: boolean;
}

export const TargetCard = ({ target, showSparkline = false }: TargetCardProps) => {
  const percentage = (target.current / target.target) * 100;
  const daysRemaining = differenceInDays(new Date(target.deadline), new Date());
  const isOverdue = daysRemaining < 0;
  const dailyRequired = target.dailyAverageRequired || 0;

  const getStatusColor = () => {
    switch (target.status) {
      case 'on-track':
        return 'text-success border-success/30 bg-success/5';
      case 'at-risk':
        return 'text-warning border-warning/30 bg-warning/5';
      case 'exceeded':
        return 'text-primary border-primary/30 bg-primary/5';
      case 'not-started':
        return 'text-muted-foreground border-border bg-muted/20';
      default:
        return 'text-foreground border-border';
    }
  };

  const getStatusIcon = () => {
    switch (target.status) {
      case 'on-track':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'at-risk':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'exceeded':
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatValue = (value: number) => {
    if (target.unit === '₹') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return value.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={cn('relative overflow-hidden transition-all h-full flex flex-col', getStatusColor())}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('rounded-lg p-2', getStatusColor())}>
                <Target className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{target.label}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {target.period.charAt(0).toUpperCase() + target.period.slice(1)} Target
                </p>
              </div>
            </div>
            <Badge variant={target.status === 'exceeded' ? 'default' : 'outline'}>
              {target.status.replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {/* Progress Numbers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {formatValue(target.current)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {formatValue(target.target)} {target.unit !== '₹' && target.unit}
                </span>
              </div>
              
              {/* Progress Bar with Milestones */}
              <div className="relative">
                <Progress value={Math.min(percentage, 100)} className="h-3" />
                {target.milestones?.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 h-3 w-0.5 bg-foreground/30"
                    style={{ left: `${milestone.percentage}%` }}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="text-sm font-medium">
                    {percentage.toFixed(1)}% completed
                  </span>
                </div>
                {target.current >= target.target ? (
                  <Badge variant="default" className="bg-primary">
                    Achieved!
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {formatValue(target.target - target.current)} remaining
                  </span>
                )}
              </div>
            </div>

            {/* Deadline & Daily Required */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  'text-muted-foreground',
                  isOverdue && 'text-destructive font-medium'
                )}>
                  {isOverdue 
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days remaining`
                  }
                </span>
              </div>
              {dailyRequired > 0 && target.current < target.target && (
                <div className="text-xs text-muted-foreground">
                  {formatValue(dailyRequired)}/{target.unit} daily needed
                </div>
              )}
            </div>

            {/* Last Updated */}
            {target.lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Updated: {format(new Date(target.lastUpdated), 'MMM dd, yyyy HH:mm')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

