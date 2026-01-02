import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Users, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const weakLegs = [
  {
    distributorId: 'D001',
    distributorName: 'Rajesh Kumar',
    leftLeg: 145,
    rightLeg: 200,
    difference: 55,
    weakLeg: 'left',
    imbalance: 27.5,
  },
  {
    distributorId: 'D002',
    distributorName: 'Priya Sharma',
    leftLeg: 180,
    rightLeg: 95,
    difference: 85,
    weakLeg: 'right',
    imbalance: 47.2,
  },
  {
    distributorId: 'D003',
    distributorName: 'Amit Patel',
    leftLeg: 220,
    rightLeg: 165,
    difference: 55,
    weakLeg: 'right',
    imbalance: 25.0,
  },
];

export const WeakLegDetection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Weak-Leg Detection</h1>
        <p className="text-muted-foreground mt-1">Identify distributors with imbalanced binary tree legs</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Imbalanced Trees</p>
                  <p className="text-3xl font-bold text-foreground mt-1">45</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Critical Imbalance</p>
                  <p className="text-3xl font-bold text-destructive mt-1">12</p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Imbalance</p>
                  <p className="text-3xl font-bold text-foreground mt-1">18.5%</p>
                </div>
                <GitBranch className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Action Required</p>
                  <p className="text-3xl font-bold text-warning mt-1">8</p>
                </div>
                <Users className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weak Legs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distributors with Weak Legs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distributor</TableHead>
                <TableHead>Left Leg</TableHead>
                <TableHead>Right Leg</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Weak Leg</TableHead>
                <TableHead>Imbalance %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weakLegs.map((distributor) => (
                <TableRow key={distributor.distributorId}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{distributor.distributorName}</p>
                      <p className="text-xs text-muted-foreground">{distributor.distributorId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-info" />
                      <span className="font-medium">{distributor.leftLeg}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-success" />
                      <span className="font-medium">{distributor.rightLeg}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">{distributor.difference}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={distributor.weakLeg === 'left' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {distributor.weakLeg} Leg
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="text-sm font-medium">{distributor.imbalance}%</span>
                      <Progress value={distributor.imbalance} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={distributor.imbalance > 40 ? 'destructive' : 'default'}
                    >
                      {distributor.imbalance > 40 ? 'Critical' : 'Warning'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Tree
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

