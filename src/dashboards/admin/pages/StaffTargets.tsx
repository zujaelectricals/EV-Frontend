import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const staffTargets = [
  {
    staffId: 'S001',
    staffName: 'Rajesh Kumar',
    role: 'Sales Manager',
    target: 50,
    achieved: 45,
    percentage: 90,
    status: 'on-track',
  },
  {
    staffId: 'S002',
    staffName: 'Priya Sharma',
    role: 'Lead Manager',
    target: 75,
    achieved: 68,
    percentage: 90.7,
    status: 'on-track',
  },
  {
    staffId: 'S003',
    staffName: 'Amit Patel',
    role: 'Verification Officer',
    target: 100,
    achieved: 85,
    percentage: 85,
    status: 'needs-attention',
  },
];

export const StaffTargets = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Targets</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage staff performance targets</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                  <p className="text-3xl font-bold text-foreground mt-1">25</p>
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
                  <p className="text-sm font-medium text-muted-foreground">On Track</p>
                  <p className="text-3xl font-bold text-success mt-1">18</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                  <p className="text-3xl font-bold text-warning mt-1">5</p>
                </div>
                <Target className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Achievement</p>
                  <p className="text-3xl font-bold text-foreground mt-1">88.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Staff Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Target Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Achieved</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffTargets.map((staff) => (
                <TableRow key={staff.staffId}>
                  <TableCell className="font-medium">{staff.staffId}</TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{staff.staffName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{staff.target}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">{staff.achieved}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{staff.percentage}%</span>
                      </div>
                      <Progress
                        value={staff.percentage}
                        className={`h-2 ${
                          staff.percentage >= 90
                            ? '[&>div]:bg-success'
                            : staff.percentage >= 75
                            ? '[&>div]:bg-warning'
                            : '[&>div]:bg-destructive'
                        }`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        staff.status === 'on-track'
                          ? 'bg-success text-white'
                          : 'bg-warning text-white'
                      }
                    >
                      {staff.status === 'on-track' ? 'On Track' : 'Needs Attention'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="cursor-pointer">
                      View Details
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

