import { motion } from 'framer-motion';
import { Trophy, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const topPerformers = [
  {
    rank: 1,
    distributorId: 'D001',
    distributorName: 'Rajesh Kumar',
    totalSales: 1250000,
    commissions: 125000,
    referrals: 45,
    level: 'Platinum',
  },
  {
    rank: 2,
    distributorId: 'D002',
    distributorName: 'Priya Sharma',
    totalSales: 980000,
    commissions: 98000,
    referrals: 38,
    level: 'Gold',
  },
  {
    rank: 3,
    distributorId: 'D003',
    distributorName: 'Amit Patel',
    totalSales: 850000,
    commissions: 85000,
    referrals: 32,
    level: 'Gold',
  },
];

const performanceData = [
  { name: 'Rajesh Kumar', sales: 125, commissions: 12.5 },
  { name: 'Priya Sharma', sales: 98, commissions: 9.8 },
  { name: 'Amit Patel', sales: 85, commissions: 8.5 },
];

export const TopPerformers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Top Performers</h1>
        <p className="text-muted-foreground mt-1">Recognize and track top-performing authorized channel partners</p>
      </div>

      {/* Top 3 Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {topPerformers.slice(0, 3).map((performer, index) => (
          <motion.div
            key={performer.distributorId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={index === 0 ? 'border-warning border-2' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy
                      className={`h-6 w-6 ${
                        index === 0
                          ? 'text-warning'
                          : index === 1
                          ? 'text-muted-foreground'
                          : 'text-warning/60'
                      }`}
                    />
                    <Badge variant="outline" className="text-lg font-bold">
                      #{performer.rank}
                    </Badge>
                  </div>
                  <Badge variant="default">{performer.level}</Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{performer.distributorName}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Sales</span>
                    <span className="font-bold text-foreground">
                      ₹{(performer.totalSales / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Commissions</span>
                    <span className="font-bold text-success">
                      ₹{(performer.commissions / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Referrals</span>
                    <span className="font-bold text-info">{performer.referrals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Performers Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="name" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="sales" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commissions" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Tier</TableHead>
                <TableHead>Authorized Channel Partner</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Commissions</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((performer) => (
                <TableRow key={performer.distributorId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {performer.rank <= 3 && (
                        <Trophy className="h-4 w-4 text-warning" />
                      )}
                      <span className="font-bold">#{performer.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{performer.distributorName}</p>
                      <p className="text-xs text-muted-foreground">{performer.distributorId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{performer.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">
                      ₹{performer.totalSales.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-success">
                      ₹{performer.commissions.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{performer.referrals}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="cursor-pointer">
                      View Profile
                    </Badge>
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

