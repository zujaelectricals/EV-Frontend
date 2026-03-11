import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { useGetBinaryTreeQuery, useGetBinaryStatsQuery } from '@/app/api/binaryApi';
import { useGetDistributorDashboardQuery } from '@/app/api/distributorApi';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BinaryNode } from '@/app/api/binaryApi';

interface TeamMember {
  id: string;
  name: string;
  userId?: string;
  joinedAt: string;
  position: 'left' | 'right';
  pv: number;
  level: number;
  referrals: number;
  isActive: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--info))', 'hsl(var(--warning))'];
const RSR_BLUE = 'hsl(217, 91%, 60%)'; // blue for RSR in pie chart

// Helper function to extract team members from binary tree
function extractTeamMembers(node: BinaryNode | null, level = 0, position: 'left' | 'right' = 'left'): TeamMember[] {
  if (!node || node.position === 'root') {
    const members: TeamMember[] = [];
    if (node?.children.left) {
      members.push(...extractTeamMembers(node.children.left, level + 1, 'left'));
    }
    if (node?.children.right) {
      members.push(...extractTeamMembers(node.children.right, level + 1, 'right'));
    }
    return members;
  }

  const member: TeamMember = {
    id: node.id,
    name: node.name,
    userId: node.userId,
    joinedAt: node.joinedAt,
    position: position,
    pv: node.pv,
    level: level,
    referrals: countDescendants(node),
    isActive: node.isActive,
  };

  const members = [member];
  if (node.children.left) {
    members.push(...extractTeamMembers(node.children.left, level + 1, 'left'));
  }
  if (node.children.right) {
    members.push(...extractTeamMembers(node.children.right, level + 1, 'right'));
  }

  return members;
}

function countDescendants(node: BinaryNode | null): number {
  if (!node) return 0;
  let count = 0;
  if (node.children.left) count += 1 + countDescendants(node.children.left);
  if (node.children.right) count += 1 + countDescendants(node.children.right);
  return count;
}

export const TeamPerformance = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || '';
  const distributorInfo = user?.distributorInfo;
  const { data: binaryTree } = useGetBinaryTreeQuery(distributorId, { skip: !distributorId });
  const { data: binaryStats } = useGetBinaryStatsQuery(distributorId, { skip: !distributorId });
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetDistributorDashboardQuery();

  // Extract team members from binary tree
  const teamMembers = useMemo(() => {
    if (!binaryTree) return [];
    return extractTeamMembers(binaryTree);
  }, [binaryTree]);

  // When there are no team members (same as Team Network empty state), redirect to Team Network
  const hasTeamMembers = ((binaryStats?.leftCount ?? 0) + (binaryStats?.rightCount ?? 0)) > 0;
  if (binaryStats !== undefined && !hasTeamMembers) {
    return <Navigate to="/distributor/team-network" replace />;
  }

  // Calculate metrics
  const totalMembers = teamMembers.length || distributorInfo?.totalReferrals || 0;
  const activeMembers = teamMembers.filter(m => m.isActive).length;
  const leftMembers = teamMembers.filter(m => m.position === 'left').length;
  const rightMembers = teamMembers.filter(m => m.position === 'right').length;
  
  // Calculate growth (mock for now - would need historical data)
  const previousMonthMembers = Math.max(0, totalMembers - 2);
  const growthPercentage = previousMonthMembers > 0 
    ? ((totalMembers - previousMonthMembers) / previousMonthMembers * 100).toFixed(1)
    : '0';

  // Top performers from API or fallback to calculated
  const topPerformers = useMemo(() => {
    if (dashboardData?.top_performers && dashboardData.top_performers.length > 0) {
      return dashboardData.top_performers.slice(0, 5);
    }
    // Fallback to calculated from team members
    return [...teamMembers]
      .sort((a, b) => b.referrals - a.referrals)
      .slice(0, 5);
  }, [dashboardData?.top_performers, teamMembers]);

  // Chart data for team growth from API or fallback
  const growthData = useMemo(() => {
    if (dashboardData?.team_growth_trend) {
      return dashboardData.team_growth_trend.months.map((month, index) => ({
        month,
        members: dashboardData.team_growth_trend.counts[index] || 0,
      }));
    }
    // Fallback to calculated data
    return [
      { month: 'Jul', members: Math.max(0, totalMembers - 10) },
      { month: 'Aug', members: Math.max(0, totalMembers - 8) },
      { month: 'Sep', members: Math.max(0, totalMembers - 6) },
      { month: 'Oct', members: Math.max(0, totalMembers - 4) },
      { month: 'Nov', members: Math.max(0, totalMembers - 2) },
      { month: 'Dec', members: totalMembers },
    ];
  }, [dashboardData?.team_growth_trend, totalMembers]);

  // Distribution data from API or fallback — RSL: primary color, RSR: blue
  const distributionData = useMemo(() => {
    if (dashboardData?.team_distribution) {
      return [
        { 
          name: 'RSL', 
          value: dashboardData.team_distribution.rsa_count, 
          percentage: dashboardData.team_distribution.rsa_percentage,
          color: COLORS[0] 
        },
        { 
          name: 'RSR', 
          value: dashboardData.team_distribution.rsb_count, 
          percentage: dashboardData.team_distribution.rsb_percentage,
          color: RSR_BLUE 
        },
      ];
    }
    // Fallback to calculated data
    return [
      { name: 'RSL', value: leftMembers, percentage: 0, color: COLORS[0] },
      { name: 'RSR', value: rightMembers, percentage: 0, color: RSR_BLUE },
    ];
  }, [dashboardData?.team_distribution, leftMembers, rightMembers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Performance</h1>
        <p className="text-muted-foreground mt-1">Track your team's growth and performance</p>
      </div>

      {/* Top Performers */}
      {isLoadingDashboard ? (
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Team members with highest referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      ) : topPerformers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Team members with highest referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {topPerformers.map((performer, index) => {
                // Handle both API format (TopPerformer) and calculated format (TeamMember)
                const name = 'name' in performer ? performer.name : (performer as any).name || 'Unknown';
                const referrals = 'referrals' in performer ? performer.referrals : (performer as any).referrals || 0;
                const team = 'team' in performer 
                  ? (performer.team === 'RSA' ? 'RSL' : performer.team === 'RSB' ? 'RSR' : performer.team)
                  : ('position' in performer 
                      ? ((performer as any).position === 'left' ? 'RSL' : 'RSR')
                      : 'RSL');
                const isTop = index === 0;
                const isSecond = index === 1;
                
                // Determine icon and background colors based on rank
                const getIconColor = () => {
                  if (isTop) return 'text-yellow-500'; // Gold for 1st
                  if (isSecond) return 'text-slate-400'; // Silver for 2nd
                  return 'text-pink-500'; // Pink for others
                };
                
                const getBgColor = () => {
                  if (isTop) return 'bg-gradient-to-br from-yellow-100 to-amber-200'; // Gold background
                  if (isSecond) return 'bg-gradient-to-br from-slate-100 to-slate-300'; // Silver background
                  return 'bg-pink-100'; // Pink for others
                };
                
                return (
                  <motion.div
                    key={`${name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="relative mb-4">
                      <div className={`mx-auto h-16 w-16 rounded-full ${getBgColor()} flex items-center justify-center shadow-md`}>
                        <Award className={`h-8 w-8 ${getIconColor()} ${isTop || isSecond ? 'drop-shadow-sm' : ''}`} style={isTop ? { filter: 'drop-shadow(0 1px 2px rgba(234, 179, 8, 0.5))' } : isSecond ? { filter: 'drop-shadow(0 1px 2px rgba(148, 163, 184, 0.5))' } : {}} />
                      </div>
                      {isTop && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 font-bold shadow-md shadow-yellow-500/30">
                          Top
                        </Badge>
                      )}
                    </div>
                    <h3 className={`font-semibold text-sm ${isTop ? 'text-yellow-700' : isSecond ? 'text-slate-600' : ''}`}>{name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {referrals} {referrals === 1 ? 'referral' : 'referrals'}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {team}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Growth Trend</CardTitle>
            <CardDescription>Monthly team member growth</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="members" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Distribution</CardTitle>
            <CardDescription>RSL vs RSR distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, percentage }) => {
                      // Use percentage from API if available, otherwise use calculated percent
                      const displayPercent = percentage !== undefined ? percentage : (percent * 100);
                      return `${name} ${displayPercent.toFixed(0)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

