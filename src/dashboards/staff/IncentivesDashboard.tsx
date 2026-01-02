import { motion } from 'framer-motion';
import { Target, Award, TrendingUp, DollarSign, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/shared/components/StatsCard';
import { useAppSelector } from '@/app/hooks';

export interface StaffIncentive {
  id: string;
  name: string;
  type: 'target' | 'performance' | 'milestone';
  target: number;
  current: number;
  reward: number;
  achieved: boolean;
  achievedAt?: string;
}

export interface StaffTarget {
  id: string;
  name: string;
  category: 'bookings' | 'verifications' | 'referrals' | 'revenue';
  target: number;
  current: number;
  deadline: string;
  reward: number;
}

export function IncentivesDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  
  // Mock data - replace with API calls
  const incentives: StaffIncentive[] = [
    {
      id: 'i1',
      name: 'Monthly Booking Target',
      type: 'target',
      target: 50,
      current: 42,
      reward: 5000,
      achieved: false,
    },
    {
      id: 'i2',
      name: 'Distributor Verifications',
      type: 'performance',
      target: 20,
      current: 18,
      reward: 3000,
      achieved: false,
    },
    {
      id: 'i3',
      name: 'Top Performer',
      type: 'milestone',
      target: 100,
      current: 95,
      reward: 10000,
      achieved: false,
    },
  ];

  const targets: StaffTarget[] = [
    {
      id: 't1',
      name: 'Q1 Booking Target',
      category: 'bookings',
      target: 150,
      current: 120,
      deadline: '2024-03-31',
      reward: 15000,
    },
    {
      id: 't2',
      name: 'Verification Target',
      category: 'verifications',
      target: 60,
      current: 45,
      deadline: '2024-03-31',
      reward: 9000,
    },
  ];

  const totalEarned = incentives
    .filter(i => i.achieved)
    .reduce((sum, i) => sum + i.reward, 0);

  const pendingRewards = incentives
    .filter(i => !i.achieved)
    .reduce((sum, i) => {
      const progress = (i.current / i.target) * 100;
      return progress >= 80 ? sum + i.reward : sum;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Incentives"
          value={`₹${totalEarned.toLocaleString()}`}
          icon={Award}
          variant="primary"
        />
        <StatsCard
          title="Pending Rewards"
          value={`₹${pendingRewards.toLocaleString()}`}
          icon={DollarSign}
          variant="warning"
        />
        <StatsCard
          title="Active Targets"
          value={targets.length.toString()}
          icon={Target}
          variant="info"
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round((incentives.filter(i => i.achieved).length / incentives.length) * 100)}%`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Incentives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Incentives
          </CardTitle>
          <CardDescription>
            Track your performance-based incentives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {incentives.map((incentive, index) => {
            const progress = (incentive.current / incentive.target) * 100;
            return (
              <motion.div
                key={incentive.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-5 border rounded-xl ${
                  incentive.achieved 
                    ? 'bg-success/10 border-success/30' 
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{incentive.name}</h3>
                      <Badge variant="outline">
                        {incentive.type}
                      </Badge>
                      {incentive.achieved && (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Achieved
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Current: {incentive.current}</span>
                      <span>Target: {incentive.target}</span>
                      <span className="font-semibold text-foreground">
                        Reward: ₹{incentive.reward.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{incentive.current} / {incentive.target}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">
                      ₹{incentive.reward.toLocaleString()}
                    </div>
                    {incentive.achieved && incentive.achievedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(incentive.achievedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Targets
          </CardTitle>
          <CardDescription>
            Quarterly and monthly targets with rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {targets.map((target, index) => {
            const progress = (target.current / target.target) * 100;
            const daysRemaining = Math.ceil(
              (new Date(target.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 border border-border rounded-xl bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{target.name}</h3>
                      <Badge variant="outline">{target.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>Current: {target.current}</span>
                      <span>Target: {target.target}</span>
                      <span>Deadline: {new Date(target.deadline).toLocaleDateString()}</span>
                      <span className={daysRemaining < 7 ? 'text-destructive font-semibold' : ''}>
                        {daysRemaining} days left
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{target.current} / {target.target}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">
                      ₹{target.reward.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Reward</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

