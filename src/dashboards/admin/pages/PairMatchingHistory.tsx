import { motion } from 'framer-motion';
import { GitBranch, CheckCircle, DollarSign, Calendar } from 'lucide-react';
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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const pairHistory = [
  {
    id: 'PM001',
    distributorId: 'D001',
    distributorName: 'Rajesh Kumar',
    leftLeg: 145,
    rightLeg: 200,
    matched: 145,
    commission: 7250,
    date: '2024-03-20',
    status: 'completed',
  },
  {
    id: 'PM002',
    distributorId: 'D002',
    distributorName: 'Priya Sharma',
    leftLeg: 180,
    rightLeg: 95,
    matched: 95,
    commission: 4750,
    date: '2024-03-21',
    status: 'completed',
  },
];

const monthlyPairs = [
  { month: 'Jan', pairs: 245, commission: 12.25 },
  { month: 'Feb', pairs: 285, commission: 14.25 },
  { month: 'Mar', pairs: 320, commission: 16.0 },
  { month: 'Apr', pairs: 350, commission: 17.5 },
];

export const PairMatchingHistory = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pair Matching History</h1>
          <p className="text-muted-foreground mt-1">Track binary pair matching and commission payouts</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search..." className="w-64" />
          <Button variant="outline" size="sm">
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
                  <p className="text-sm font-medium text-muted-foreground">Total Pairs</p>
                  <p className="text-3xl font-bold text-foreground mt-1">1,245</p>
                </div>
                <GitBranch className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold text-foreground mt-1">350</p>
                </div>
                <Calendar className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹62.25L</p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Commission</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹5,000</p>
                </div>
                <CheckCircle className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Pair Matching Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPairs}>
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
                <Bar dataKey="pairs" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pair History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pair Matching</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match ID</TableHead>
                <TableHead>Authorized Channel Partner</TableHead>
                <TableHead>Revenue Stream Left (RSL)</TableHead>
                <TableHead>Revenue Stream Right (RSR)</TableHead>
                <TableHead>Matched</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairHistory.map((pair) => (
                <TableRow key={pair.id}>
                  <TableCell className="font-medium">{pair.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{pair.distributorName}</p>
                      <p className="text-xs text-muted-foreground">{pair.distributorId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{pair.leftLeg}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{pair.rightLeg}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{pair.matched} pairs</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{pair.commission.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{pair.date}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-success text-white">{pair.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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

