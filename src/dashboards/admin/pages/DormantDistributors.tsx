import { motion } from 'framer-motion';
import { UserX, Clock, AlertTriangle, Mail, Phone, TrendingDown } from 'lucide-react';
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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const dormantDistributors = [
  {
    id: 'D001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 98765 43210',
    lastActive: '2024-01-15',
    daysInactive: 75,
    totalSales: 125000,
    referrals: 12,
    status: 'dormant',
    riskLevel: 'high',
  },
  {
    id: 'D002',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43211',
    lastActive: '2024-02-20',
    daysInactive: 40,
    totalSales: 85000,
    referrals: 8,
    status: 'dormant',
    riskLevel: 'medium',
  },
  {
    id: 'D003',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43212',
    lastActive: '2024-01-10',
    daysInactive: 80,
    totalSales: 45000,
    referrals: 5,
    status: 'dormant',
    riskLevel: 'high',
  },
];

const dormancyData = [
  { period: '30-60 days', count: 45 },
  { period: '60-90 days', count: 28 },
  { period: '90-120 days', count: 15 },
  { period: '120+ days', count: 8 },
];

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case 'high':
      return <Badge variant="destructive">High Risk</Badge>;
    case 'medium':
      return <Badge variant="default">Medium Risk</Badge>;
    case 'low':
      return <Badge variant="secondary">Low Risk</Badge>;
    default:
      return <Badge variant="outline">{risk}</Badge>;
  }
};

export const DormantDistributors = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dormant Distributors</h1>
          <p className="text-muted-foreground mt-1">Identify and re-engage inactive distributors</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export List
          </Button>
          <Button size="sm">
            Send Re-engagement Campaign
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
                  <p className="text-sm font-medium text-muted-foreground">Total Dormant</p>
                  <p className="text-3xl font-bold text-foreground mt-1">96</p>
                </div>
                <UserX className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                  <p className="text-3xl font-bold text-destructive mt-1">23</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Inactive Days</p>
                  <p className="text-3xl font-bold text-foreground mt-1">65</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Re-engaged</p>
                  <p className="text-3xl font-bold text-success mt-1">12</p>
                </div>
                <TrendingDown className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dormancy Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Dormancy Period Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dormancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                <XAxis dataKey="period" stroke="hsl(215 16% 47%)" fontSize={12} />
                <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(214 32% 91%)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dormant Distributors Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dormant Distributors List</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search..." className="w-64" />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distributor ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Days Inactive</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dormantDistributors.map((distributor) => (
                <TableRow key={distributor.id}>
                  <TableCell className="font-medium">{distributor.id}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{distributor.name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{distributor.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{distributor.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{distributor.lastActive}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{distributor.daysInactive} days</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{distributor.totalSales.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{distributor.referrals}</span>
                  </TableCell>
                  <TableCell>{getRiskBadge(distributor.riskLevel)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
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

