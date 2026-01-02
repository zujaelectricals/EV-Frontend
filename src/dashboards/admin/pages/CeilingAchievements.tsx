import { motion } from 'framer-motion';
import { Award, Target, TrendingUp, DollarSign } from 'lucide-react';
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

const achievements = [
  {
    distributorId: 'D001',
    distributorName: 'Rajesh Kumar',
    currentLevel: 'Gold',
    ceiling: 50000,
    achieved: 48500,
    percentage: 97,
    nextLevel: 'Platinum',
    nextCeiling: 100000,
  },
  {
    distributorId: 'D002',
    distributorName: 'Priya Sharma',
    currentLevel: 'Silver',
    ceiling: 25000,
    achieved: 24500,
    percentage: 98,
    nextLevel: 'Gold',
    nextCeiling: 50000,
  },
];

export const CeilingAchievements = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ceiling Achievements</h1>
        <p className="text-muted-foreground mt-1">Track distributor ceiling achievements and level progress</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Gold Level</p>
                  <p className="text-3xl font-bold text-foreground mt-1">125</p>
                </div>
                <Award className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Platinum Level</p>
                  <p className="text-3xl font-bold text-foreground mt-1">45</p>
                </div>
                <Award className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Near Ceiling</p>
                  <p className="text-3xl font-bold text-warning mt-1">28</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Achieved</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹12.5M</p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distributor Ceiling Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distributor</TableHead>
                <TableHead>Current Level</TableHead>
                <TableHead>Ceiling</TableHead>
                <TableHead>Achieved</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Next Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.map((achievement) => (
                <TableRow key={achievement.distributorId}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{achievement.distributorName}</p>
                      <p className="text-xs text-muted-foreground">{achievement.distributorId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{achievement.currentLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">₹{achievement.ceiling.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-foreground">₹{achievement.achieved.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{achievement.percentage}%</span>
                      </div>
                      <Progress value={achievement.percentage} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{achievement.nextLevel}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₹{achievement.nextCeiling.toLocaleString()}
                      </p>
                    </div>
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

