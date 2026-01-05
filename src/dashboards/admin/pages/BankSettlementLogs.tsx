import { motion } from 'framer-motion';
import { useState } from 'react';
import { Building2, DollarSign, CheckCircle, Clock, XCircle, Search, Filter, Download, FileText, Eye, Calendar } from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
} from 'recharts';
import { SettlementBatch } from '../types/payoutEngine';

const mockSettlements: SettlementBatch[] = [
  {
    id: 'SET001',
    batchNumber: 'BATCH-2024-001',
    settlementDate: '2024-03-20',
    totalPayouts: 45,
    totalAmount: 1125000,
    status: 'completed',
    bankReference: 'BANK-REF-20240320-001',
    transactionId: 'TXN-SET-20240320-001',
    initiatedAt: '2024-03-20 10:00',
    completedAt: '2024-03-20 14:30',
    initiatedBy: 'Admin User',
    payoutIds: ['PO101', 'PO102', 'PO103'],
    fileUrl: '/settlements/batch-2024-001.xlsx',
  },
  {
    id: 'SET002',
    batchNumber: 'BATCH-2024-002',
    settlementDate: '2024-03-21',
    totalPayouts: 52,
    totalAmount: 1300000,
    status: 'completed',
    bankReference: 'BANK-REF-20240321-001',
    transactionId: 'TXN-SET-20240321-001',
    initiatedAt: '2024-03-21 10:00',
    completedAt: '2024-03-21 15:00',
    initiatedBy: 'Admin User',
    payoutIds: ['PO104', 'PO105', 'PO106'],
    fileUrl: '/settlements/batch-2024-002.xlsx',
  },
  {
    id: 'SET003',
    batchNumber: 'BATCH-2024-003',
    settlementDate: '2024-03-22',
    totalPayouts: 38,
    totalAmount: 950000,
    status: 'processing',
    initiatedAt: '2024-03-22 10:00',
    initiatedBy: 'Admin User',
    payoutIds: ['PO107', 'PO108'],
  },
  {
    id: 'SET004',
    batchNumber: 'BATCH-2024-004',
    settlementDate: '2024-03-19',
    totalPayouts: 42,
    totalAmount: 1050000,
    status: 'failed',
    bankReference: 'BANK-REF-20240319-001',
    initiatedAt: '2024-03-19 10:00',
    failedAt: '2024-03-19 12:00',
    failureReason: 'Insufficient funds in settlement account',
    initiatedBy: 'Admin User',
    payoutIds: ['PO099', 'PO100'],
  },
];

const settlementTrend = [
  { month: 'Jan', batches: 12, amount: 3000000 },
  { month: 'Feb', batches: 15, amount: 3750000 },
  { month: 'Mar', batches: 18, amount: 4500000 },
  { month: 'Apr', batches: 20, amount: 5000000 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-white">Completed</Badge>;
    case 'processing':
      return <Badge variant="default">Processing</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'reversed':
      return <Badge variant="outline">Reversed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const BankSettlementLogs = () => {
  const [settlements] = useState<SettlementBatch[]>(mockSettlements);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewingSettlement, setViewingSettlement] = useState<SettlementBatch | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredSettlements = settlements.filter((settlement) => {
    const matchesSearch =
      settlement.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.bankReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      settlement.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || settlement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBatches = settlements.length;
  const totalAmount = settlements.reduce((sum, s) => sum + s.totalAmount, 0);
  const completedBatches = settlements.filter((s) => s.status === 'completed').length;
  const failedBatches = settlements.filter((s) => s.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Settlement Logs</h1>
          <p className="text-muted-foreground mt-1">Track bank settlement batches and reconciliation</p>
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
          <Button size="sm">
            <Building2 className="h-4 w-4 mr-2" />
            Create Settlement
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
                  <p className="text-sm font-medium text-muted-foreground">Total Batches</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalBatches}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹{(totalAmount / 100000).toFixed(1)}L</p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-success mt-1">{completedBatches}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{failedBatches}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Settlement Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Settlement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={settlementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="batches" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Batches" />
                <Line type="monotone" dataKey="amount" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Amount (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settlements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Settlement Batches</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="reversed">Reversed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Settlement Date</TableHead>
                <TableHead>Payouts</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Bank Reference</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Initiated By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSettlements.map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{settlement.batchNumber}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{settlement.settlementDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{settlement.totalPayouts}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{settlement.totalAmount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    {settlement.bankReference ? (
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{settlement.bankReference}</code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {settlement.transactionId ? (
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{settlement.transactionId}</code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{settlement.initiatedBy}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setViewingSettlement(settlement);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {settlement.fileUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={settlement.fileUrl} download>
                            <FileText className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Settlement Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Settlement Batch Details</DialogTitle>
            <DialogDescription>Complete information about {viewingSettlement?.batchNumber}</DialogDescription>
          </DialogHeader>
          {viewingSettlement && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Batch Number</Label>
                  <p className="font-medium">{viewingSettlement.batchNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingSettlement.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Settlement Date</Label>
                  <p className="font-medium">{viewingSettlement.settlementDate}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Payouts</Label>
                  <p className="font-medium">{viewingSettlement.totalPayouts}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Amount</Label>
                  <p className="font-bold text-lg">₹{viewingSettlement.totalAmount.toLocaleString()}</p>
                </div>
                {viewingSettlement.bankReference && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Bank Reference</Label>
                    <p className="font-medium">{viewingSettlement.bankReference}</p>
                  </div>
                )}
                {viewingSettlement.transactionId && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                    <p className="font-medium">{viewingSettlement.transactionId}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Initiated By</Label>
                  <p className="font-medium">{viewingSettlement.initiatedBy}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Initiated At</Label>
                  <p className="font-medium">{viewingSettlement.initiatedAt}</p>
                </div>
                {viewingSettlement.completedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Completed At</Label>
                    <p className="font-medium">{viewingSettlement.completedAt}</p>
                  </div>
                )}
                {viewingSettlement.failedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Failed At</Label>
                    <p className="font-medium">{viewingSettlement.failedAt}</p>
                  </div>
                )}
              </div>
              {viewingSettlement.failureReason && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <Label className="text-xs text-destructive mb-2 block">Failure Reason</Label>
                  <p className="text-sm">{viewingSettlement.failureReason}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Payout IDs in Batch</Label>
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {viewingSettlement.payoutIds.map((id) => (
                      <code key={id} className="text-xs bg-background px-2 py-1 rounded">
                        {id}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
              {viewingSettlement.fileUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Settlement File</Label>
                  <Button variant="outline" size="sm" asChild>
                    <a href={viewingSettlement.fileUrl} download>
                      <FileText className="h-4 w-4 mr-2" />
                      Download Settlement File
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

