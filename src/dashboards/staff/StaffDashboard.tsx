import { motion } from 'framer-motion';
import {
  ClipboardList,
  UserCheck,
  Target,
  CheckSquare,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
} from 'lucide-react';
import { StatsCard } from '@/shared/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const StaffDashboard = () => {
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

  const pendingTasks = [
    { id: 1, type: 'Lead', description: 'Follow up with Rahul Sharma', priority: 'high', dueIn: '2 hours' },
    { id: 2, type: 'Verification', description: 'Verify distributor documents', priority: 'medium', dueIn: '4 hours' },
    { id: 3, type: 'Approval', description: 'Review booking #EV2024-123', priority: 'high', dueIn: '1 hour' },
    { id: 4, type: 'Lead', description: 'Schedule demo for Priya Singh', priority: 'low', dueIn: '1 day' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden rounded-2xl p-8"
      >
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-info/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-info" />
            <span className="text-sm font-medium text-info">Staff Dashboard</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
            Your Daily Overview
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track your leads, approvals, and daily targets.
          </p>
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
            title="Pending Leads"
            value="24"
            icon={Users}
            variant="primary"
            change={-5}
            trend="down"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Verifications Due"
            value="8"
            icon={UserCheck}
            variant="warning"
            change={12}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Approvals Pending"
            value="5"
            icon={CheckSquare}
            variant="info"
            change={-20}
            trend="down"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Today's Incentive"
            value="₹2,500"
            icon={DollarSign}
            variant="success"
            change={15}
            trend="up"
          />
        </motion.div>
      </motion.div>

      {/* Target Progress & Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Target Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Monthly Targets</h3>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Lead Conversions', current: 42, target: 50, color: 'primary' },
              { label: 'Distributor Verifications', current: 28, target: 40, color: 'info' },
              { label: 'Booking Approvals', current: 35, target: 35, color: 'success' },
              { label: 'Revenue Generated', current: 180000, target: 250000, color: 'warning' },
            ].map((target, index) => (
              <motion.div
                key={target.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{target.label}</span>
                  <span className="font-medium text-foreground">
                    {target.label.includes('Revenue')
                      ? `₹${(target.current / 1000).toFixed(0)}K / ₹${(target.target / 1000).toFixed(0)}K`
                      : `${target.current} / ${target.target}`}
                  </span>
                </div>
                <Progress
                  value={(target.current / target.target) * 100}
                  className="h-2"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/20 p-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">Pending Tasks</h3>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`rounded-lg border p-4 transition-all hover:border-primary/50 ${
                  task.priority === 'high'
                    ? 'border-destructive/30 bg-destructive/5'
                    : task.priority === 'medium'
                    ? 'border-warning/30 bg-warning/5'
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          task.type === 'Lead'
                            ? 'bg-primary/20 text-primary'
                            : task.type === 'Verification'
                            ? 'bg-info/20 text-info'
                            : 'bg-success/20 text-success'
                        }`}
                      >
                        {task.type}
                      </span>
                      <span
                        className={`text-xs ${
                          task.priority === 'high'
                            ? 'text-destructive'
                            : task.priority === 'medium'
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{task.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Due: {task.dueIn}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid gap-4 md:grid-cols-4"
      >
        {[
          { icon: Users, label: 'Add Lead', color: 'primary' },
          { icon: UserCheck, label: 'Start Verification', color: 'info' },
          { icon: CheckSquare, label: 'Review Bookings', color: 'success' },
          { icon: TrendingUp, label: 'View Reports', color: 'warning' },
        ].map((action, index) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`glass-card flex items-center gap-3 rounded-xl p-4 transition-all hover:border-${action.color}/50`}
          >
            <div className={`rounded-lg bg-${action.color}/20 p-3`}>
              <action.icon className={`h-5 w-5 text-${action.color}`} />
            </div>
            <span className="font-medium text-foreground">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
