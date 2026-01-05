import { motion } from 'framer-motion';
import { ClipboardList, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { Payout, PayoutStatus } from '@/app/slices/payoutSlice';
import { StatsCard } from '@/shared/components/StatsCard';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Mock payout data - in real app, this would come from API
const mockPayouts: Payout[] = [
  {
    id: 'p1',
    amount: 900,
    type: 'referral',
    status: 'completed',
    description: 'Referral bonus for user registration',
    requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    processedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    tds: 100,
    netAmount: 900,
  },
  {
    id: 'p2',
    amount: 1400,
    type: 'binary',
    status: 'completed',
    description: 'Binary pair commission (Pair #1)',
    requestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    processedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    tds: 200,
    netAmount: 1400,
  },
];

const getStatusBadge = (status: PayoutStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-white"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500 text-white"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
    case 'pending':
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'failed':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    case 'cancelled':
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    referral: 'Referral Bonus',
    binary: 'Team Commission',
    pool: 'Pool Money',
    incentive: 'Incentive',
    milestone: 'Milestone Reward',
  };
  return labels[type] || type;
};

export const PayoutHistory = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { payouts } = useAppSelector((state) => state.payout);
  
  // Use Redux payouts if available, otherwise use mock data
  const displayPayouts = payouts.length > 0 ? payouts : mockPayouts;

  const totalPayouts = displayPayouts.reduce((sum, p) => sum + (p.netAmount || p.amount), 0);
  const pendingPayouts = displayPayouts.filter(p => p.status === 'pending' || p.status === 'processing');
  const completedPayouts = displayPayouts.filter(p => p.status === 'completed');
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payout History</h1>
        <p className="text-muted-foreground mt-1">View all your payout requests and transaction history</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Payouts"
          value={`₹${totalPayouts.toLocaleString()}`}
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="Pending Amount"
          value={`₹${totalPending.toLocaleString()}`}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Completed"
          value={completedPayouts.length.toString()}
          icon={CheckCircle}
          variant="primary"
        />
        <StatsCard
          title="Total Transactions"
          value={displayPayouts.length.toString()}
          icon={ClipboardList}
          variant="info"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payouts</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Payouts</CardTitle>
              <CardDescription>Complete history of all payout transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {displayPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No payout history available</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>TDS</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(payout.type)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payout.description}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{payout.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-warning">
                          {payout.tds ? `₹${payout.tds.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-success">
                          ₹{(payout.netAmount || payout.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payout.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>Payouts awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p className="text-muted-foreground">No pending payouts</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(payout.type)}</Badge>
                        </TableCell>
                        <TableCell>{payout.description}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{payout.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Payouts</CardTitle>
              <CardDescription>Successfully processed payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {completedPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No completed payouts yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Processed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(payout.type)}</Badge>
                        </TableCell>
                        <TableCell>{payout.description}</TableCell>
                        <TableCell className="font-semibold text-success">
                          ₹{(payout.netAmount || payout.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {payout.processedAt 
                            ? new Date(payout.processedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

