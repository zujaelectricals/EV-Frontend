import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
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
import { BankAbuseRecord, RiskLevel, AlertStatus, ActionType } from '../types/compliance';

const mockBankAbuse: BankAbuseRecord[] = [
  {
    id: '1',
    bankAccountNumber: '1234567890123456',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0001234',
    userIds: ['U12345', 'U12350', 'U12355'],
    userNames: ['Rajesh Kumar', 'Rajesh K', 'R Kumar'],
    transactionCount: 45,
    totalAmount: 250000,
    suspiciousActivities: ['Multiple users sharing same account', 'High transaction frequency', 'Unusual withdrawal patterns'],
    riskScore: 92,
    riskLevel: 'critical',
    status: 'active',
    firstDetected: '2024-03-15T10:30:00',
    lastUpdated: '2024-03-22T10:30:00',
    flaggedReasons: ['Account sharing violation', 'Suspicious transaction pattern'],
    recommendedAction: 'block',
    assignedTo: 'Compliance Team',
    notes: 'Multiple accounts using same bank account - potential fraud',
  },
  {
    id: '2',
    bankAccountNumber: '9876543210987654',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0005678',
    userIds: ['U12346', 'U12351'],
    userNames: ['Priya Sharma', 'Priya S'],
    transactionCount: 28,
    totalAmount: 150000,
    suspiciousActivities: ['Rapid account changes', 'Frequent withdrawals'],
    riskScore: 78,
    riskLevel: 'high',
    status: 'investigating',
    firstDetected: '2024-03-18T14:20:00',
    lastUpdated: '2024-03-21T14:20:00',
    flaggedReasons: ['Unusual activity pattern'],
    recommendedAction: 'flag',
    assignedTo: 'Security Team',
  },
];

const bankAbuseSummary = [
  { riskLevel: 'Critical', count: 3, totalAccounts: 9, totalAmount: 750000, avgRiskScore: 94 },
  { riskLevel: 'High', count: 5, totalAccounts: 10, totalAmount: 500000, avgRiskScore: 82 },
  { riskLevel: 'Medium', count: 8, totalAccounts: 16, totalAmount: 400000, avgRiskScore: 65 },
  { riskLevel: 'Low', count: 12, totalAccounts: 24, totalAmount: 300000, avgRiskScore: 48 },
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

export const BankAbuseMonitor = () => {
  const [bankAbuse] = useState<BankAbuseRecord[]>(mockBankAbuse);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingRecord, setViewingRecord] = useState<BankAbuseRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  const filteredRecords = bankAbuse.filter((record) => {
    const matchesSearch =
      record.bankAccountNumber.includes(searchQuery) ||
      record.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.ifscCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.userNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRisk = riskFilter === 'all' || record.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const totalRecords = bankAbuse.length;
  const totalAccounts = bankAbuse.reduce((sum, r) => sum + r.userIds.length, 0);
  const criticalRisks = bankAbuse.filter((r) => r.riskLevel === 'critical').length;
  const activeAlerts = bankAbuse.filter((r) => r.status === 'active').length;
  const totalSuspiciousAmount = bankAbuse.reduce((sum, r) => sum + r.totalAmount, 0);

  const handleViewRecord = (record: BankAbuseRecord) => {
    setViewingRecord(record);
    setIsDetailOpen(true);
  };

  const handleTakeAction = (action: ActionType) => {
    if (viewingRecord) {
      console.log(`Taking action: ${action} on bank account ${viewingRecord.bankAccountNumber}`, actionNotes);
      setIsDetailOpen(false);
      setActionNotes('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Abuse Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Monitor suspicious bank account usage and detect abuse patterns
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
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalRecords}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Affected Accounts</p>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspicious Amount</p>
                  <p className="text-3xl font-bold text-destructive mt-1">₹{(totalSuspiciousAmount / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-destructive opacity-20" />
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
                  <TableHead>Total Accounts</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Avg Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAbuseSummary.map((summary) => (
                  <TableRow key={summary.riskLevel}>
                    <TableCell>{getRiskBadge(summary.riskLevel.toLowerCase() as RiskLevel)}</TableCell>
                    <TableCell className="font-medium">{summary.count}</TableCell>
                    <TableCell>{summary.totalAccounts}</TableCell>
                    <TableCell className="font-medium">₹{summary.totalAmount.toLocaleString()}</TableCell>
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

      {/* Bank Abuse Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bank Abuse Records</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by account, bank, IFSC..."
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
                <TableHead>Bank Account</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>IFSC Code</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded font-mono">
                      ****{record.bankAccountNumber.slice(-4)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{record.bankName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{record.ifscCode}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{record.userIds.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.transactionCount}</TableCell>
                  <TableCell>
                    <span className="font-medium">₹{record.totalAmount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-2 w-16">
                        <div
                          className={`h-2 rounded-full ${
                            record.riskScore >= 80 ? 'bg-destructive' :
                            record.riskScore >= 60 ? 'bg-orange-500' :
                            record.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                          style={{ width: `${record.riskScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{record.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRiskBadge(record.riskLevel)}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRecord(record)}
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

      {/* Record Detail Dialog */}
      {viewingRecord && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bank Abuse Record Details</DialogTitle>
              <DialogDescription>
                Complete information for bank account ending in {viewingRecord.bankAccountNumber.slice(-4)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Account Number</p>
                  <p className="font-medium font-mono">{viewingRecord.bankAccountNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{viewingRecord.bankName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">IFSC Code</p>
                  <p className="font-medium font-mono">{viewingRecord.ifscCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-secondary rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          viewingRecord.riskScore >= 80 ? 'bg-destructive' :
                          viewingRecord.riskScore >= 60 ? 'bg-orange-500' :
                          viewingRecord.riskScore >= 40 ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                        style={{ width: `${viewingRecord.riskScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{viewingRecord.riskScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <div className="mt-1">{getRiskBadge(viewingRecord.riskLevel)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingRecord.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction Count</p>
                  <p className="font-medium">{viewingRecord.transactionCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="font-medium">₹{viewingRecord.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recommended Action</p>
                  <div className="mt-1">{getActionBadge(viewingRecord.recommendedAction)}</div>
                </div>
                {viewingRecord.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{viewingRecord.assignedTo}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Detected</p>
                  <p className="font-medium">{new Date(viewingRecord.firstDetected).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(viewingRecord.lastUpdated).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Associated Users</p>
                <div className="space-y-2">
                  {viewingRecord.userIds.map((userId, idx) => (
                    <div key={userId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{viewingRecord.userNames[idx]}</p>
                          <p className="text-sm text-muted-foreground">ID: {userId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Flagged Reasons</p>
                <div className="flex flex-wrap gap-2">
                  {viewingRecord.flaggedReasons.map((reason, idx) => (
                    <Badge key={idx} variant="destructive">{reason}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Suspicious Activities</p>
                <div className="flex flex-wrap gap-2">
                  {viewingRecord.suspiciousActivities.map((activity, idx) => (
                    <Badge key={idx} variant="destructive">{activity}</Badge>
                  ))}
                </div>
              </div>

              {viewingRecord.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm p-3 bg-secondary rounded-lg">{viewingRecord.notes}</p>
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
                disabled={viewingRecord.recommendedAction === 'block'}
              >
                Block Account
              </Button>
              <Button
                onClick={() => handleTakeAction(viewingRecord.recommendedAction)}
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

