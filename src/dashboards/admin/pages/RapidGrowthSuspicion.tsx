import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  BarChart3,
  User,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RapidGrowthSuspicion, RiskLevel, AlertStatus, ActionType } from '../types/compliance';

const mockRapidGrowth: RapidGrowthSuspicion[] = [
  {
    id: '1',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    growthType: 'team_size',
    currentValue: 500,
    previousValue: 50,
    growthPercentage: 900,
    growthPeriod: '7 days',
    expectedGrowth: 20,
    deviation: 880,
    riskScore: 95,
    riskLevel: 'critical',
    status: 'active',
    detectedAt: '2024-03-20T10:30:00',
    lastUpdated: '2024-03-22T10:30:00',
    suspiciousFactors: ['Unrealistic team growth', 'Suspicious recruitment pattern', 'Potential bot accounts'],
    recommendedAction: 'block',
    assignedTo: 'Compliance Team',
    notes: 'Team size increased from 50 to 500 in 7 days - highly suspicious',
  },
  {
    id: '2',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    growthType: 'investment',
    currentValue: 500000,
    previousValue: 50000,
    growthPercentage: 900,
    growthPeriod: '30 days',
    expectedGrowth: 25,
    deviation: 875,
    riskScore: 88,
    riskLevel: 'high',
    status: 'investigating',
    detectedAt: '2024-03-19T14:20:00',
    lastUpdated: '2024-03-21T14:20:00',
    suspiciousFactors: ['Unusual investment pattern', 'Large amount increase'],
    recommendedAction: 'flag',
    assignedTo: 'Security Team',
  },
];

const growthSummary = [
  { growthType: 'Team Size', count: 8, avgGrowth: 450, avgDeviation: 420, avgRiskScore: 88 },
  { growthType: 'Investment', count: 5, avgGrowth: 320, avgDeviation: 295, avgRiskScore: 82 },
  { growthType: 'Commission', count: 6, avgGrowth: 280, avgDeviation: 255, avgRiskScore: 75 },
  { growthType: 'Referrals', count: 10, avgGrowth: 380, avgDeviation: 350, avgRiskScore: 85 },
];

const getRiskBadge = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case 'critical':
      return <Badge className="bg-destructive text-white">Critical</Badge>;
    case 'high':
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
    case 'low':
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{riskLevel}</Badge>;
  }
};

const getStatusBadge = (status: AlertStatus) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-destructive text-white">Active</Badge>;
    case 'investigating':
      return <Badge className="bg-warning text-white">Investigating</Badge>;
    case 'resolved':
      return <Badge className="bg-success text-white">Resolved</Badge>;
    case 'false_positive':
      return <Badge variant="outline">False Positive</Badge>;
    case 'dismissed':
      return <Badge variant="secondary">Dismissed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getActionBadge = (action: ActionType) => {
  switch (action) {
    case 'block':
      return <Badge className="bg-destructive text-white">Block</Badge>;
    case 'flag':
      return <Badge className="bg-warning text-white">Flag</Badge>;
    case 'verify':
      return <Badge className="bg-info text-white">Verify</Badge>;
    case 'monitor':
      return <Badge variant="outline">Monitor</Badge>;
    case 'approve':
      return <Badge className="bg-success text-white">Approve</Badge>;
    case 'reject':
      return <Badge variant="destructive">Reject</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
};

const getGrowthTypeBadge = (type: string) => {
  switch (type) {
    case 'team_size':
      return <Badge className="bg-info text-white">Team Size</Badge>;
    case 'investment':
      return <Badge className="bg-success text-white">Investment</Badge>;
    case 'commission':
      return <Badge className="bg-warning text-white">Commission</Badge>;
    case 'referrals':
      return <Badge className="bg-primary text-white">Referrals</Badge>;
    case 'combined':
      return <Badge variant="default">Combined</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const RapidGrowthSuspicion = () => {
  const [rapidGrowth] = useState<RapidGrowthSuspicion[]>(mockRapidGrowth);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewingGrowth, setViewingGrowth] = useState<RapidGrowthSuspicion | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  const filteredGrowth = rapidGrowth.filter((growth) => {
    const matchesSearch =
      growth.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      growth.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      growth.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || growth.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || growth.status === statusFilter;
    const matchesType = typeFilter === 'all' || growth.growthType === typeFilter;
    return matchesSearch && matchesRisk && matchesStatus && matchesType;
  });

  const totalAlerts = rapidGrowth.length;
  const criticalRisks = rapidGrowth.filter((g) => g.riskLevel === 'critical').length;
  const activeAlerts = rapidGrowth.filter((g) => g.status === 'active').length;
  const avgDeviation = rapidGrowth.reduce((sum, g) => sum + g.deviation, 0) / rapidGrowth.length;

  const handleViewGrowth = (growth: RapidGrowthSuspicion) => {
    setViewingGrowth(growth);
    setIsDetailOpen(true);
  };

  const handleTakeAction = (action: ActionType) => {
    if (viewingGrowth) {
      console.log(`Taking action: ${action} on user ${viewingGrowth.userId}`, actionNotes);
      setIsDetailOpen(false);
      setActionNotes('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapid Growth Suspicion</h1>
          <p className="text-muted-foreground mt-1">
            Detect and investigate suspicious rapid growth patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalAlerts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Risks</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{criticalRisks}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-3xl font-bold text-warning mt-1">{activeAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Deviation</p>
                  <p className="text-3xl font-bold text-info mt-1">{Math.round(avgDeviation)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Growth Type Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Growth Type Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Growth Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Avg Growth %</TableHead>
                  <TableHead>Avg Deviation</TableHead>
                  <TableHead>Avg Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {growthSummary.map((summary) => (
                  <TableRow key={summary.growthType}>
                    <TableCell className="font-medium">{summary.growthType}</TableCell>
                    <TableCell>{summary.count}</TableCell>
                    <TableCell className="font-medium">{summary.avgGrowth.toFixed(1)}%</TableCell>
                    <TableCell className="font-medium text-destructive">{summary.avgDeviation.toFixed(1)}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${summary.avgRiskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{summary.avgRiskScore}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rapid Growth Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rapid Growth Alerts</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, email..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="team_size">Team Size</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="referrals">Referrals</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Growth Type</TableHead>
                <TableHead>Previous Value</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Growth %</TableHead>
                <TableHead>Expected Growth</TableHead>
                <TableHead>Deviation</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGrowth.map((growth) => (
                <TableRow key={growth.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{growth.userName}</p>
                      <p className="text-xs text-muted-foreground">{growth.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getGrowthTypeBadge(growth.growthType)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{growth.previousValue.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{growth.currentValue.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-destructive">{growth.growthPercentage.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{growth.expectedGrowth.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-destructive">{growth.deviation.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{growth.growthPeriod}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 w-16">
                        <div
                          className={`h-2 rounded-full ${
                            growth.riskScore >= 80 ? 'bg-destructive' :
                            growth.riskScore >= 60 ? 'bg-orange-500' :
                            growth.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                          style={{ width: `${growth.riskScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{growth.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRiskBadge(growth.riskLevel)}</TableCell>
                  <TableCell>{getStatusBadge(growth.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewGrowth(growth)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Growth Detail Dialog */}
      {viewingGrowth && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rapid Growth Alert Details</DialogTitle>
              <DialogDescription>
                Complete information for user {viewingGrowth.userName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="font-medium">{viewingGrowth.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingGrowth.userEmail}</p>
                  <p className="text-xs text-muted-foreground">ID: {viewingGrowth.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Growth Type</p>
                  <div className="mt-1">{getGrowthTypeBadge(viewingGrowth.growthType)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Previous Value</p>
                  <p className="font-medium">{viewingGrowth.previousValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                  <p className="font-medium">{viewingGrowth.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Growth Percentage</p>
                  <p className="font-medium text-destructive text-lg">{viewingGrowth.growthPercentage.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Growth</p>
                  <p className="font-medium">{viewingGrowth.expectedGrowth.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deviation</p>
                  <p className="font-medium text-destructive">{viewingGrowth.deviation.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Growth Period</p>
                  <p className="font-medium">{viewingGrowth.growthPeriod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          viewingGrowth.riskScore >= 80 ? 'bg-destructive' :
                          viewingGrowth.riskScore >= 60 ? 'bg-orange-500' :
                          viewingGrowth.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                        style={{ width: `${viewingGrowth.riskScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{viewingGrowth.riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <div className="mt-1">{getRiskBadge(viewingGrowth.riskLevel)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingGrowth.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommended Action</p>
                  <div className="mt-1">{getActionBadge(viewingGrowth.recommendedAction)}</div>
                </div>
                {viewingGrowth.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{viewingGrowth.assignedTo}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Detected At</p>
                  <p className="font-medium">{new Date(viewingGrowth.detectedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(viewingGrowth.lastUpdated).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Suspicious Factors</p>
                <div className="flex flex-wrap gap-2">
                  {viewingGrowth.suspiciousFactors.map((factor, idx) => (
                    <Badge key={idx} variant="destructive">{factor}</Badge>
                  ))}
                </div>
              </div>

              {viewingGrowth.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm p-3 bg-secondary rounded-lg">{viewingGrowth.notes}</p>
                </div>
              )}

              <div>
                <Label htmlFor="action-notes">Action Notes</Label>
                <Textarea
                  id="action-notes"
                  placeholder="Add notes about the action taken..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleTakeAction('block')}
                disabled={viewingGrowth.recommendedAction === 'block'}
              >
                Block User
              </Button>
              <Button
                onClick={() => handleTakeAction(viewingGrowth.recommendedAction)}
              >
                Take Recommended Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

