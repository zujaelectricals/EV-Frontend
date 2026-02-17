import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Award, Search, Filter, ArrowUpDown, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { useGetBinaryTreeQuery, useGetBinaryStatsQuery } from '@/app/api/binaryApi';
import { useGetDistributorDashboardQuery } from '@/app/api/distributorApi';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BinaryNode } from '@/app/api/binaryApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState<'all' | 'left' | 'right'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinedAt' | 'pv' | 'referrals'>('joinedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Extract team members from binary tree
  const teamMembers = useMemo(() => {
    if (!binaryTree) return [];
    return extractTeamMembers(binaryTree);
  }, [binaryTree]);

  // When there are no team members (same as Team Network empty state), redirect to Team Network
  const hasTeamMembers = ((binaryStats?.leftCount ?? 0) + (binaryStats?.rightCount ?? 0)) > 0;
  if (binaryStats !== undefined && !hasTeamMembers) {
    return <Navigate to="/distributor/binary-tree" replace />;
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

  // Filter and sort team members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = filterPosition === 'all' || member.position === filterPosition;
      return matchesSearch && matchesPosition;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'joinedAt':
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case 'pv':
          comparison = a.pv - b.pv;
          break;
        case 'referrals':
          comparison = a.referrals - b.referrals;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [teamMembers, searchQuery, filterPosition, sortBy, sortOrder]);

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

  // Distribution data from API or fallback
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
          color: COLORS[1] 
        },
      ];
    }
    // Fallback to calculated data
    return [
      { name: 'RSL', value: leftMembers, percentage: 0, color: COLORS[0] },
      { name: 'RSR', value: rightMembers, percentage: 0, color: COLORS[1] },
    ];
  }, [dashboardData?.team_distribution, leftMembers, rightMembers]);

  // Performance by level
  const levelData = useMemo(() => {
    const levels: Record<number, number> = {};
    teamMembers.forEach(member => {
      levels[member.level] = (levels[member.level] || 0) + 1;
    });
    return Object.entries(levels)
      .map(([level, count]) => ({ level: `Level ${level}`, count }))
      .sort((a, b) => parseInt(a.level.replace('Level ', '')) - parseInt(b.level.replace('Level ', '')));
  }, [teamMembers]);

  const handleSort = (field: 'name' | 'joinedAt' | 'pv' | 'referrals') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

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
                
                return (
                  <motion.div
                    key={`${name}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="relative mb-4">
                      <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className={`h-8 w-8 ${isTop ? 'text-warning' : 'text-primary'}`} />
                      </div>
                      {isTop && (
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="default">
                          Top
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">{name}</h3>
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

      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
          <CardDescription>View detailed performance metrics of your team members</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterPosition} onValueChange={(value: 'all' | 'left' | 'right') => setFilterPosition(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="left">RSL</SelectItem>
                <SelectItem value="right">RSR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Table */}
          {filteredMembers.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort('name')}
                      >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort('joinedAt')}
                      >
                        Joined
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort('pv')}
                      >
                        PV
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3"
                        onClick={() => handleSort('referrals')}
                      >
                        Referrals
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>
                        {new Date(member.joinedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.position === 'left' ? 'default' : 'secondary'}>
                          {member.position === 'left' ? 'RSL' : 'RSR'}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{member.pv.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {member.referrals}
                        </div>
                      </TableCell>
                      <TableCell>Level {member.level}</TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? 'default' : 'outline'}>
                          {member.isActive ? (
                            <>
                              <Activity className="mr-1 h-3 w-3" />
                              Active
                            </>
                          ) : (
                            'Inactive'
                          )}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members found</p>
              {searchQuery && <p className="text-sm mt-2">Try adjusting your search or filters</p>}
            </div>
          )}

          {/* Performance by Level Chart */}
          {levelData.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution by Level</CardTitle>
                  <CardDescription>Team members at each hierarchy level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={levelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

