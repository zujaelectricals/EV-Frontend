import { motion } from 'framer-motion';
import { DollarSign, Clock, CheckCircle, XCircle, Filter, Download } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';

const pendingPayouts = [
  {
    id: 'PO001',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    amount: 25000,
    type: 'binary',
    requestDate: '2024-03-20',
    bankAccount: '****1234',
    ifsc: 'HDFC0001234',
    status: 'pending',
  },
  {
    id: 'PO002',
    userId: 'U12346',
    userName: 'Priya Sharma',
    amount: 15000,
    type: 'referral',
    requestDate: '2024-03-21',
    bankAccount: '****5678',
    ifsc: 'ICIC0005678',
    status: 'pending',
  },
  {
    id: 'PO003',
    userId: 'U12347',
    userName: 'Amit Patel',
    amount: 35000,
    type: 'binary',
    requestDate: '2024-03-22',
    bankAccount: '****9012',
    ifsc: 'SBIN0009012',
    status: 'pending',
  },
];

export const PendingPayouts = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Payouts</h1>
          <p className="text-muted-foreground mt-1">Review and approve pending payout requests</p>
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
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Selected
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Count</p>
                  <p className="text-3xl font-bold text-foreground mt-1">12</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-3xl font-bold text-foreground mt-1">₹2.85L</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Amount</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹23,750</p>
                </div>
                <DollarSign className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Payout Requests</CardTitle>
            <Input placeholder="Search..." className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Payout ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bank Details</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{payout.userName}</p>
                      <p className="text-xs text-muted-foreground">{payout.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{payout.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payout.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{payout.bankAccount}</p>
                      <p className="text-xs text-muted-foreground">{payout.ifsc}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{payout.requestDate}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-success/90">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

