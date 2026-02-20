import { motion } from 'framer-motion';
import { RefreshCw, Calendar, AlertTriangle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const MonthlyResetEngine = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monthly Reset Engine</h1>
          <p className="text-muted-foreground mt-1">Manage monthly binary tree and commission resets</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Play className="h-4 w-4 mr-2" />
              Execute Reset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Monthly Reset</DialogTitle>
              <DialogDescription>
                This will reset all binary tree pairs and commissions for the current month. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive">Confirm Reset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Monthly reset will clear all pair matching data and reset commissions. Make sure to backup data before proceeding.
        </AlertDescription>
      </Alert>

      {/* Reset Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Reset Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Reset Schedule</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reset Time</Label>
              <Select defaultValue="midnight">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midnight">12:00 AM</SelectItem>
                  <SelectItem value="morning">6:00 AM</SelectItem>
                  <SelectItem value="noon">12:00 PM</SelectItem>
                  <SelectItem value="evening">6:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Reset Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <Label>Reset Total Partner Framework Counts</Label>
                  <p className="text-xs text-muted-foreground">Reset all pair matching counts to zero</p>
                </div>
                <Badge className="bg-success text-white">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <Label>Reset Commissions</Label>
                  <p className="text-xs text-muted-foreground">Reset commission calculations</p>
                </div>
                <Badge className="bg-success text-white">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <Label>Reset Ceiling Progress</Label>
                  <p className="text-xs text-muted-foreground">Reset distributor ceiling achievements</p>
                </div>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <Label>Carry Forward Unmatched</Label>
                  <p className="text-xs text-muted-foreground">Carry forward unmatched pairs to next period</p>
                </div>
                <Badge className="bg-success text-white">Enabled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset History */}
      <Card>
        <CardHeader>
          <CardTitle>Reset History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-03-01 00:00', status: 'completed', pairs: 1245, commissions: 62.25 },
              { date: '2024-02-01 00:00', status: 'completed', pairs: 1180, commissions: 59.0 },
              { date: '2024-01-01 00:00', status: 'completed', pairs: 1100, commissions: 55.0 },
            ].map((reset, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{reset.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {reset.pairs} pairs, ₹{reset.commissions}L commissions
                    </p>
                  </div>
                </div>
                <Badge className="bg-success text-white">{reset.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Reset Info */}
      <Card>
        <CardHeader>
          <CardTitle>Next Scheduled Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-foreground">April 1, 2024 at 12:00 AM</p>
              <p className="text-sm text-muted-foreground mt-1">5 days remaining</p>
            </div>
            <RefreshCw className="h-8 w-8 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

