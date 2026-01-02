import { motion } from 'framer-motion';
import { ArrowRight, Settings, Save, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const CarryForwardLogic = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Carry Forward Logic</h1>
          <p className="text-muted-foreground mt-1">Configure how unmatched pairs are carried forward</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Carry forward logic determines how unmatched pairs from previous periods are handled in the current period.
        </AlertDescription>
      </Alert>

      {/* Carry Forward Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Carry Forward Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-1">
              <Label>Enable Carry Forward</Label>
              <p className="text-sm text-muted-foreground">
                Allow unmatched pairs to carry forward to next period
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Carry Forward Type</Label>
              <Select defaultValue="full">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Amount</SelectItem>
                  <SelectItem value="partial">Partial (Percentage)</SelectItem>
                  <SelectItem value="capped">Capped Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maximum Carry Forward Periods</Label>
              <Input type="number" placeholder="3" defaultValue="3" />
              <p className="text-xs text-muted-foreground">
                Maximum number of periods to carry forward
              </p>
            </div>

            <div className="space-y-2">
              <Label>Carry Forward Percentage (%)</Label>
              <Input type="number" step="0.1" placeholder="100" defaultValue="100" />
              <p className="text-xs text-muted-foreground">
                Percentage of unmatched amount to carry forward (if partial type)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Maximum Carry Forward Amount (₹)</Label>
              <Input type="number" placeholder="50000" defaultValue="50000" />
              <p className="text-xs text-muted-foreground">
                Maximum amount that can be carried forward (if capped type)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-1">
              <Label>Apply to Weak Leg Only</Label>
              <p className="text-sm text-muted-foreground">
                Only carry forward from the weaker leg
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Carry Forward Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Pending Carry Forward</span>
              </div>
              <p className="text-lg font-bold">₹2.45L</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-info" />
                <span className="text-sm font-medium">Affected Distributors</span>
              </div>
              <p className="text-lg font-bold">45</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-success text-white">Active</Badge>
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className="text-sm text-muted-foreground">Carry forward enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

