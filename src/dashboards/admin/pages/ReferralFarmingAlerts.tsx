import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  TrendingUp,
  User,
  Calendar,
  Globe,
  Monitor,
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
import { ReferralFarmingAlert, RiskLevel, AlertStatus, ActionType } from '../types/compliance';

const mockReferralFarming: ReferralFarmingAlert[] = [
  {
    id: '1',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    suspiciousPattern: 'Rapid referral rate',
    referralCount: 125,
    referralRate: 8.5,
    conversionRate: 15,
    duplicateIPs: 12,
    duplicateDevices: 8,
    suspiciousReferrals: ['U12350', 'U12351', 'U12352', 'U12353'],
    riskScore: 88,
    riskLevel: 'high',
    status: 'active',
    detectedAt: '2024-03-20T10:30:00',
    lastUpdated: '2024-03-22T10:30:00',
    recommendedAction: 'flag',
    assignedTo: 'Compliance Team',
    notes: 'Unusually high referral rate with low conversion - potential farming',
  },
  {
    id: '2',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    suspiciousPattern: 'Duplicate IP addresses',
    referralCount: 85,
    referralRate: 5.2,
    conversionRate: 8,
    duplicateIPs: 25,
    duplicateDevices: 15,
    suspiciousReferrals: ['U12354', 'U12355', 'U12356'],
    riskScore: 92,
    riskLevel: 'critical',
    status: 'investigating',
    detectedAt: '2024-03-19T14:20:00',
    lastUpdated: '2024-03-21T14:20:00',
    recommendedAction: 'block',
    assignedTo: 'Security Team',
  },
];

const referralFarmingSummary = [
  { riskLevel: 'Critical', count: 3, totalReferrals: 350, avgConversionRate: 7.5, avgRiskScore: 94 },
  { riskLevel: 'High', count: 8, totalReferrals: 680, avgConversionRate: 12.3, avgRiskScore: 82 },
  { riskLevel: 'Medium', count: 15, totalReferrals: 1200, avgConversionRate: 18.5, avgRiskScore: 65 },
  { riskLevel: 'Low', count: 25, totalReferrals: 2000, avgConversionRate: 25.2, avgRiskScore: 48 },
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

export const ReferralFarmingAlerts = () => {
  const [alerts] = useState<ReferralFarmingAlert[]>(mockReferralFarming);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingAlert, setViewingAlert] = useState<ReferralFarmingAlert | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || alert.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const totalAlerts = alerts.length;
  const totalReferrals = alerts.reduce((sum, a) => sum + a.referralCount, 0);
  const criticalRisks = alerts.filter((a) => a.riskLevel === 'critical').length;
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;
  const avgConversionRate = alerts.reduce((sum, a) => sum + a.conversionRate, 0) / alerts.length;

  const handleViewAlert = (alert: ReferralFarmingAlert) => {
    setViewingAlert(alert);
    setIsDetailOpen(true);
  };

  const handleTakeAction = (action: ActionType) => {
    if (viewingAlert) {
      console.log(`Taking action: ${action} on user ${viewingAlert.userId}`, actionNotes);
      setIsDetailOpen(false);
      setActionNotes('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Farming Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Detect suspicious referral patterns and potential farming activities
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
      <div className="grid gap-4 md:grid-cols-5">
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
                <Users className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{totalReferrals}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-destructive opacity-20" />
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
          transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Conversion Rate</p>
                  <p className="text-3xl font-bold text-info mt-1">{avgConversionRate.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Risk Level Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Referrals</TableHead>
                  <TableHead>Avg Conversion Rate</TableHead>
                  <TableHead>Avg Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralFarmingSummary.map((summary) => (
                  <TableRow key={summary.riskLevel}>
                    <TableCell>{getRiskBadge(summary.riskLevel.toLowerCase() as RiskLevel)}</TableCell>
                    <TableCell className="font-medium">{summary.count}</TableCell>
                    <TableCell>{summary.totalReferrals}</TableCell>
                    <TableCell>{summary.avgConversionRate.toFixed(1)}%</TableCell>
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

      {/* Referral Farming Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Referral Farming Alerts</CardTitle>
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
                <TableHead>Suspicious Pattern</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Referral Rate</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Duplicate IPs</TableHead>
                <TableHead>Duplicate Devices</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{alert.userName}</p>
                      <p className="text-xs text-muted-foreground">{alert.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{alert.suspiciousPattern}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{alert.referralCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{alert.referralRate.toFixed(1)}/day</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{alert.conversionRate.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{alert.duplicateIPs}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{alert.duplicateDevices}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 w-16">
                        <div
                          className={`h-2 rounded-full ${
                            alert.riskScore >= 80 ? 'bg-destructive' :
                            alert.riskScore >= 60 ? 'bg-orange-500' :
                            alert.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                          style={{ width: `${alert.riskScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{alert.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRiskBadge(alert.riskLevel)}</TableCell>
                  <TableCell>{getStatusBadge(alert.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewAlert(alert)}
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

      {/* Alert Detail Dialog */}
      {viewingAlert && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Referral Farming Alert Details</DialogTitle>
              <DialogDescription>
                Complete information for user {viewingAlert.userName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="font-medium">{viewingAlert.userName}</p>
                  <p className="text-sm text-muted-foreground">{viewingAlert.userEmail}</p>
                  <p className="text-xs text-muted-foreground">ID: {viewingAlert.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspicious Pattern</p>
                  <Badge variant="destructive" className="mt-1">{viewingAlert.suspiciousPattern}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          viewingAlert.riskScore >= 80 ? 'bg-destructive' :
                          viewingAlert.riskScore >= 60 ? 'bg-orange-500' :
                          viewingAlert.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                        style={{ width: `${viewingAlert.riskScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{viewingAlert.riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <div className="mt-1">{getRiskBadge(viewingAlert.riskLevel)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingAlert.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referral Count</p>
                  <p className="font-medium">{viewingAlert.referralCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Referral Rate</p>
                  <p className="font-medium">{viewingAlert.referralRate.toFixed(1)} referrals/day</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="font-medium">{viewingAlert.conversionRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duplicate IPs</p>
                  <p className="font-medium">{viewingAlert.duplicateIPs}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duplicate Devices</p>
                  <p className="font-medium">{viewingAlert.duplicateDevices}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommended Action</p>
                  <div className="mt-1">{getActionBadge(viewingAlert.recommendedAction)}</div>
                </div>
                {viewingAlert.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{viewingAlert.assignedTo}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Detected At</p>
                  <p className="font-medium">{new Date(viewingAlert.detectedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(viewingAlert.lastUpdated).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Suspicious Referrals</p>
                <div className="flex flex-wrap gap-2">
                  {viewingAlert.suspiciousReferrals.map((refId) => (
                    <Badge key={refId} variant="destructive">{refId}</Badge>
                  ))}
                </div>
              </div>

              {viewingAlert.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm p-3 bg-secondary rounded-lg">{viewingAlert.notes}</p>
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
                disabled={viewingAlert.recommendedAction === 'block'}
              >
                Block User
              </Button>
              <Button
                onClick={() => handleTakeAction(viewingAlert.recommendedAction)}
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

