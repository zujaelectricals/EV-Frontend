import { motion } from 'framer-motion';
import { Target, Award, DollarSign, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ceilingLevels = [
  {
    level: 'Bronze',
    ceiling: 10000,
    commission: 5,
    color: 'hsl(38 92% 50%)',
  },
  {
    level: 'Silver',
    ceiling: 25000,
    commission: 7.5,
    color: 'hsl(215 16% 47%)',
  },
  {
    level: 'Gold',
    ceiling: 50000,
    commission: 10,
    color: 'hsl(38 92% 50%)',
  },
  {
    level: 'Platinum',
    ceiling: 100000,
    commission: 12.5,
    color: 'hsl(199 89% 48%)',
  },
  {
    level: 'Diamond',
    ceiling: 250000,
    commission: 15,
    color: 'hsl(221 83% 53%)',
  },
];

export const CeilingSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ceiling Settings</h1>
          <p className="text-muted-foreground mt-1">Configure distributor ceiling levels and limits</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Ceiling Levels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ceiling Level Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Ceiling Amount (₹)</TableHead>
                <TableHead>Commission Rate (%)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ceilingLevels.map((level) => (
                <TableRow key={level.level}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" style={{ color: level.color }} />
                      <span className="font-medium">{level.level}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={level.ceiling}
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={level.commission}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-success text-white">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Global Ceiling Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Global Ceiling Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Maximum Ceiling (₹)</Label>
              <Input type="number" placeholder="500000" defaultValue="500000" />
              <p className="text-xs text-muted-foreground">
                Maximum ceiling amount allowed for any distributor
              </p>
            </div>

            <div className="space-y-2">
              <Label>Default Starting Ceiling (₹)</Label>
              <Input type="number" placeholder="10000" defaultValue="10000" />
              <p className="text-xs text-muted-foreground">
                Default ceiling for new distributors
              </p>
            </div>

            <div className="space-y-2">
              <Label>Ceiling Reset Period</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Ceiling Increase Rate (%)</Label>
              <Input type="number" step="0.1" placeholder="10" defaultValue="10" />
              <p className="text-xs text-muted-foreground">
                Percentage increase when ceiling is achieved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Levels</p>
                  <p className="text-3xl font-bold text-foreground mt-1">5</p>
                </div>
                <Target className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Max Ceiling</p>
                  <p className="text-3xl font-bold text-foreground mt-1">₹2.5L</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Distributors at Ceiling</p>
                  <p className="text-3xl font-bold text-foreground mt-1">28</p>
                </div>
                <Award className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

