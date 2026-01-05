import { motion } from 'framer-motion';
import { Settings, GitBranch, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const BinaryEngineControl = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Binary Engine Control</h1>
        <p className="text-muted-foreground mt-1">Configure and manage team commission system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Pairs</CardTitle>
            <GitBranch className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,245</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹24.9L</div>
            <p className="text-xs text-success mt-1">Paid out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Binary Users</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">623</div>
            <p className="text-xs text-muted-foreground mt-1">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Max Pairs</CardTitle>
            <Settings className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">10</div>
            <p className="text-xs text-muted-foreground mt-1">Per distributor</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Binary System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="pairCommission">Pair Commission (₹)</Label>
              <Input id="pairCommission" type="number" defaultValue="2000" />
            </div>
            <div>
              <Label htmlFor="maxPairs">Max Pairs per Distributor</Label>
              <Input id="maxPairs" type="number" defaultValue="10" />
            </div>
            <div>
              <Label htmlFor="tdsRate">TDS Rate (%)</Label>
              <Input id="tdsRate" type="number" defaultValue="10" />
            </div>
            <div>
              <Label htmlFor="poolCut">Pool Money Cut (%)</Label>
              <Input id="poolCut" type="number" defaultValue="20" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button>Save Configuration</Button>
            <Button variant="outline">Reset to Default</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

