import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { StatsCard } from '@/shared/components/StatsCard';

export const TeamPerformance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorInfo = user?.distributorInfo;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Performance</h1>
        <p className="text-muted-foreground mt-1">Track your team's growth and performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Team Members"
          value={distributorInfo?.totalReferrals?.toLocaleString() || '0'}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Active Members"
          value="0"
          icon={UserPlus}
          variant="success"
        />
        <StatsCard
          title="Team Growth"
          value="+0%"
          icon={TrendingUp}
          variant="info"
        />
        <StatsCard
          title="Top Performers"
          value="0"
          icon={Award}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
          <CardDescription>View detailed performance metrics of your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Team performance details coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

