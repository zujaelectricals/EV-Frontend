import { motion } from 'framer-motion';
import { Target, Award, CheckCircle, Circle, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/app/hooks';
import { Milestone } from '@/app/slices/payoutSlice';

export function MilestoneTracker() {
  const { milestones } = useAppSelector((state) => state.payout);
  const { user } = useAppSelector((state) => state.auth);
  
  const distributorInfo = user?.distributorInfo;
  const totalReferrals = distributorInfo?.totalReferrals || 0;
  const totalPairs = distributorInfo?.binaryActivated 
    ? Math.min(distributorInfo.leftCount, distributorInfo.rightCount) 
    : 0;

  // Calculate milestone progress
  const milestoneProgress = milestones.map(milestone => {
    let current = 0;
    let target = milestone.target;
    
    switch (milestone.id) {
      case 'm1': // First 3 Referrals
        current = totalReferrals;
        break;
      case 'm2': // Binary Account Enablement
        current = totalReferrals >= 3 ? 3 : totalReferrals;
        break;
      case 'm3': // 5 Pairs
        current = totalPairs;
        break;
      case 'm4': // 10 Pairs
        current = totalPairs;
        break;
    }
    
    const progress = Math.min((current / target) * 100, 100);
    const achieved = current >= target;
    
    return { ...milestone, current, progress, achieved };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Milestone Tracker
          </CardTitle>
          <CardDescription>
            Track your progress and earn milestone rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {milestoneProgress.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 border rounded-xl transition-all ${
                milestone.achieved 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    milestone.achieved 
                      ? 'bg-success/20' 
                      : 'bg-muted'
                  }`}>
                    {milestone.achieved ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{milestone.name}</h3>
                      {milestone.achieved && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          <Award className="w-3 h-3 mr-1" />
                          Achieved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Target: {milestone.target} | Current: {milestone.current} | Reward: ₹{milestone.reward.toLocaleString()}
                    </p>
                    <Progress value={milestone.progress} className="h-2" />
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{milestone.current} / {milestone.target}</span>
                      <span>{Math.round(milestone.progress)}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-success font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-lg">₹{milestone.reward.toLocaleString()}</span>
                  </div>
                  {milestone.achieved && milestone.achievedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(milestone.achievedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Summary */}
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Milestones Achieved</p>
                <p className="text-2xl font-bold text-primary">
                  {milestoneProgress.filter(m => m.achieved).length} / {milestoneProgress.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total Rewards Earned</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{milestoneProgress
                    .filter(m => m.achieved)
                    .reduce((sum, m) => sum + m.reward, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

