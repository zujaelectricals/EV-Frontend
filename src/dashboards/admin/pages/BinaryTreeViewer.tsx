import { motion } from 'framer-motion';
import { GitBranch, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const BinaryTreeViewer = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Binary Tree Viewer</h1>
          <p className="text-muted-foreground mt-1">Visualize and analyze the authorized channel partner binary tree structure</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search authorized channel partner..." className="w-64" />
          <Button variant="outline" size="sm">
            Export Tree
          </Button>
        </div>
      </div>

      {/* Tree Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Nodes</p>
                  <p className="text-3xl font-bold text-foreground mt-1">692</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Revenue Stream Left (RSL)</p>
                  <p className="text-3xl font-bold text-foreground mt-1">345</p>
                </div>
                <Users className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Revenue Stream Right (RSR)</p>
                  <p className="text-3xl font-bold text-foreground mt-1">347</p>
                </div>
                <Users className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Pairs</p>
                  <p className="text-3xl font-bold text-foreground mt-1">1,245</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Binary Tree Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[400px] bg-secondary/20 rounded-lg border-2 border-dashed border-border">
            <div className="text-center">
              <GitBranch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Binary Tree Visualization</p>
              <p className="text-sm text-muted-foreground">
                Interactive tree viewer will be integrated here
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Use the search above to find specific authorized channel partners
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

