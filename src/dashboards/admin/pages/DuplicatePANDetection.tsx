import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  DollarSign,
  Users,
  FileText,
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
import { DuplicatePANRecord, RiskLevel, AlertStatus, ActionType } from '../types/compliance';

const mockDuplicatePANs: DuplicatePANRecord[] = [
  {
    id: '1',
    panNumber: 'ABCDE1234F',
    userIds: ['U12345', 'U12350', 'U12355'],
    userNames: ['Rajesh Kumar', 'Rajesh K', 'R Kumar'],
    userEmails: ['rajesh@example.com', 'rajesh.k@example.com', 'r.kumar@example.com'],
    registrationDates: ['2024-01-15', '2024-02-20', '2024-03-10'],
    riskScore: 95,
    riskLevel: 'critical',
    status: 'active',
    firstDetected: '2024-03-10T10:30:00',
    lastUpdated: '2024-03-22T10:30:00',
    totalAccounts: 3,
    totalInvestments: 250000,
    totalCommissions: 15000,
    suspiciousPatterns: ['Same PAN, different names', 'Rapid account creation', 'Similar email patterns'],
    recommendedAction: 'block',
    assignedTo: 'Admin User',
    notes: 'High priority - requires immediate investigation',
  },
  {
    id: '2',
    panNumber: 'XYZAB5678G',
    userIds: ['U12346', 'U12351'],
    userNames: ['Priya Sharma', 'Priya S'],
    userEmails: ['priya@example.com', 'priya.s@example.com'],
    registrationDates: ['2024-02-10', '2024-03-15'],
    riskScore: 85,
    riskLevel: 'high',
    status: 'investigating',
    firstDetected: '2024-03-15T14:20:00',
    lastUpdated: '2024-03-21T14:20:00',
    totalAccounts: 2,
    totalInvestments: 150000,
    totalCommissions: 8000,
    suspiciousPatterns: ['Duplicate PAN with name variations'],
    recommendedAction: 'flag',
    assignedTo: 'Compliance Team',
  },
  {
    id: '3',
    panNumber: 'MNOPQ9012H',
    userIds: ['U12347', 'U12352', 'U12357', 'U12362'],
    userNames: ['Amit Patel', 'A Patel', 'Amit P', 'A. Patel'],
    userEmails: ['amit@example.com', 'a.patel@example.com', 'amit.p@example.com', 'a.p@example.com'],
    registrationDates: ['2024-01-20', '2024-02-05', '2024-02-18', '2024-03-01'],
    riskScore: 98,
    riskLevel: 'critical',
    status: 'active',
    firstDetected: '2024-03-01T09:15:00',
    lastUpdated: '2024-03-20T09:15:00',
    totalAccounts: 4,
    totalInvestments: 500000,
    totalCommissions: 35000,
    suspiciousPatterns: ['Multiple accounts with same PAN', 'Systematic name variations', 'High investment amounts'],
    recommendedAction: 'block',
    assignedTo: 'Admin User',
  },
];

const panSummary = [
  { riskLevel: 'Critical', count: 5, totalAccounts: 15, totalInvestments: 1250000, avgRiskScore: 96 },
  { riskLevel: 'High', count: 8, totalAccounts: 16, totalInvestments: 800000, avgRiskScore: 85 },
  { riskLevel: 'Medium', count: 12, totalAccounts: 24, totalInvestments: 600000, avgRiskScore: 65 },
  { riskLevel: 'Low', count: 20, totalAccounts: 40, totalInvestments: 400000, avgRiskScore: 45 },
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

export const DuplicatePANDetection = () => {
  const [duplicatePANs] = useState<DuplicatePANRecord[]>(mockDuplicatePANs);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingPAN, setViewingPAN] = useState<DuplicatePANRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  const filteredPANs = duplicatePANs.filter((pan) => {
    const matchesSearch =
      pan.panNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pan.userNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRisk = riskFilter === 'all' || pan.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || pan.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const totalDuplicates = duplicatePANs.length;
  const totalAccounts = duplicatePANs.reduce((sum, pan) => sum + pan.totalAccounts, 0);
  const criticalRisks = duplicatePANs.filter((pan) => pan.riskLevel === 'critical').length;
  const activeAlerts = duplicatePANs.filter((pan) => pan.status === 'active').length;

  const handleViewPAN = (pan: DuplicatePANRecord) => {
    setViewingPAN(pan);
    setIsDetailOpen(true);
  };

  const handleTakeAction = (action: ActionType) => {
    if (viewingPAN) {
      // In real implementation, this would call an API
      console.log(`Taking action: ${action} on PAN ${viewingPAN.panNumber}`, actionNotes);
      setIsDetailOpen(false);
      setActionNotes('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Duplicate PAN Detection</h1>
          <p className="text-muted-foreground mt-1">
            Detect and manage multiple accounts registered with the same PAN number
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
                  <p className="text-sm font-medium text-muted-foreground">Total Duplicates</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalDuplicates}</p>
                </div>
                <Shield className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{totalAccounts}</p>
                </div>
                <Users className="h-8 w-8 text-destructive opacity-20" />
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
                <XCircle className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Risk Level Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
                  <TableHead>Total Accounts</TableHead>
                  <TableHead>Total Investments</TableHead>
                  <TableHead>Avg Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panSummary.map((summary) => (
                  <TableRow key={summary.riskLevel}>
                    <TableCell>{getRiskBadge(summary.riskLevel.toLowerCase() as RiskLevel)}</TableCell>
                    <TableCell className="font-medium">{summary.count}</TableCell>
                    <TableCell>{summary.totalAccounts}</TableCell>
                    <TableCell className="font-medium">₹{summary.totalInvestments.toLocaleString()}</TableCell>
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

      {/* Duplicate PANs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Duplicate PAN Records</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by PAN or name..."
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
                <TableHead>PAN Number</TableHead>
                <TableHead>Accounts</TableHead>
                <TableHead>User Names</TableHead>
                <TableHead>Total Investments</TableHead>
                <TableHead>Total Commissions</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recommended Action</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPANs.map((pan) => (
                <TableRow key={pan.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">{pan.panNumber}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{pan.totalAccounts}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {pan.userNames.slice(0, 2).map((name, idx) => (
                        <p key={idx} className="text-sm truncate">{name}</p>
                      ))}
                      {pan.userNames.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{pan.userNames.length - 2} more</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{pan.totalInvestments.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{pan.totalCommissions.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 w-16">
                        <div
                          className={`h-2 rounded-full ${
                            pan.riskScore >= 80 ? 'bg-destructive' :
                            pan.riskScore >= 60 ? 'bg-orange-500' :
                            pan.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                          style={{ width: `${pan.riskScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{pan.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRiskBadge(pan.riskLevel)}</TableCell>
                  <TableCell>{getStatusBadge(pan.status)}</TableCell>
                  <TableCell>{getActionBadge(pan.recommendedAction)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPAN(pan)}
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

      {/* PAN Detail Dialog */}
      {viewingPAN && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Duplicate PAN Details</DialogTitle>
              <DialogDescription>
                Complete information for PAN {viewingPAN.panNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">PAN Number</p>
                  <p className="font-medium font-mono text-lg">{viewingPAN.panNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          viewingPAN.riskScore >= 80 ? 'bg-destructive' :
                          viewingPAN.riskScore >= 60 ? 'bg-orange-500' :
                          viewingPAN.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                        style={{ width: `${viewingPAN.riskScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{viewingPAN.riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <div className="mt-1">{getRiskBadge(viewingPAN.riskLevel)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingPAN.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                  <p className="font-medium">{viewingPAN.totalAccounts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
                  <p className="font-medium">₹{viewingPAN.totalInvestments.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                  <p className="font-medium">₹{viewingPAN.totalCommissions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommended Action</p>
                  <div className="mt-1">{getActionBadge(viewingPAN.recommendedAction)}</div>
                </div>
                {viewingPAN.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{viewingPAN.assignedTo}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Detected</p>
                  <p className="font-medium">{new Date(viewingPAN.firstDetected).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(viewingPAN.lastUpdated).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Associated Accounts</p>
                <div className="space-y-2">
                  {viewingPAN.userIds.map((userId, idx) => (
                    <div key={userId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{viewingPAN.userNames[idx]}</p>
                          <p className="text-sm text-muted-foreground">{viewingPAN.userEmails[idx]}</p>
                          <p className="text-xs text-muted-foreground">ID: {userId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Registered: {new Date(viewingPAN.registrationDates[idx]).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Suspicious Patterns</p>
                <div className="flex flex-wrap gap-2">
                  {viewingPAN.suspiciousPatterns.map((pattern, idx) => (
                    <Badge key={idx} variant="destructive">{pattern}</Badge>
                  ))}
                </div>
              </div>

              {viewingPAN.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm p-3 bg-secondary rounded-lg">{viewingPAN.notes}</p>
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
                disabled={viewingPAN.recommendedAction === 'block'}
              >
                Block All Accounts
              </Button>
              <Button
                onClick={() => handleTakeAction(viewingPAN.recommendedAction)}
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

