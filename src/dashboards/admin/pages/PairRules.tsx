import { motion } from 'framer-motion';
import { Settings, GitBranch, DollarSign, Save } from 'lucide-react';
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

export const PairRules = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pair Rules</h1>
          <p className="text-muted-foreground mt-1">Configure binary pair matching rules and parameters</p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Pair Matching Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Pair Matching Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Pair Matching Type</Label>
              <Select defaultValue="binary">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binary">Binary (Left/Right)</SelectItem>
                  <SelectItem value="unilevel">Unilevel</SelectItem>
                  <SelectItem value="matrix">Matrix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum Pair Amount</Label>
              <Input type="number" placeholder="5000" defaultValue="5000" />
            </div>

            <div className="space-y-2">
              <Label>Pair Matching Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-time">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Commission per Pair (₹)</Label>
              <Input type="number" placeholder="50" defaultValue="50" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-1">
              <Label>Enable Auto Pair Matching</Label>
              <p className="text-sm text-muted-foreground">
                Automatically match pairs when conditions are met
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-1">
              <Label>Allow Partial Pairs</Label>
              <p className="text-sm text-muted-foreground">
                Match pairs even if one leg is incomplete
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Commission Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Calculation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Base Commission Rate (%)</Label>
              <Input type="number" placeholder="10" defaultValue="10" />
            </div>

            <div className="space-y-2">
              <Label>Maximum Commission per Pair (₹)</Label>
              <Input type="number" placeholder="5000" defaultValue="5000" />
            </div>

            <div className="space-y-2">
              <Label>Commission Calculation Method</Label>
              <Select defaultValue="percentage">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Based</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="tiered">Tiered Structure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum BV for Commission</Label>
              <Input type="number" placeholder="1000" defaultValue="1000" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Pair Type</span>
              </div>
              <p className="text-lg font-bold">Binary</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Commission/Pair</span>
              </div>
              <p className="text-lg font-bold">₹50</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-info" />
                <span className="text-sm font-medium">Matching Frequency</span>
              </div>
              <p className="text-lg font-bold">Daily</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

