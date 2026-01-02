import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, XCircle, Bell, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const alerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Suspicious duplicate registrations detected',
    description: 'Multiple accounts registered with same PAN number detected in last 24 hours',
    category: 'Fraud',
    timestamp: '2 minutes ago',
    count: 5,
    action: 'Review',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Pool wallet liability exceeds threshold',
    description: 'Current pool balance is ₹2.5M, exceeding safe threshold of ₹2M',
    category: 'Compliance',
    timestamp: '15 minutes ago',
    count: 1,
    action: 'View Details',
  },
  {
    id: 3,
    type: 'info',
    title: 'Binary engine sync delayed by 15 mins',
    description: 'Last sync completed at 10:45 AM, expected at 10:30 AM',
    category: 'System',
    timestamp: '1 hour ago',
    count: 1,
    action: 'Check Status',
  },
  {
    id: 4,
    type: 'critical',
    title: 'Unusual payout pattern detected',
    description: 'Multiple large payouts to same bank account in last 2 hours',
    category: 'Risk',
    timestamp: '2 hours ago',
    count: 8,
    action: 'Investigate',
  },
  {
    id: 5,
    type: 'warning',
    title: 'High distributor churn rate',
    description: '15% increase in inactive distributors this week',
    category: 'Growth',
    timestamp: '3 hours ago',
    count: 1,
    action: 'Analyze',
  },
  {
    id: 6,
    type: 'info',
    title: 'Scheduled maintenance reminder',
    description: 'System maintenance scheduled for tonight 11 PM - 1 AM',
    category: 'System',
    timestamp: '5 hours ago',
    count: 1,
    action: 'View Schedule',
  },
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'critical':
      return <XCircle className="h-5 w-5 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case 'info':
      return <Info className="h-5 w-5 text-info" />;
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
  }
};

const getAlertBadgeVariant = (type: string) => {
  switch (type) {
    case 'critical':
      return 'destructive';
    case 'warning':
      return 'default';
    case 'info':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const AlertsCenter = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alerts Center</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage system alerts and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-destructive mt-1">3</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                  <p className="text-3xl font-bold text-warning mt-1">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Info</p>
                  <p className="text-3xl font-bold text-info mt-1">2</p>
                </div>
                <Info className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-success mt-1">124</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Alerts</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search alerts..." className="w-64" />
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="warning">Warnings</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-destructive">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground">{alert.title}</h4>
                                <Badge variant={getAlertBadgeVariant(alert.type) as any}>
                                  {alert.category}
                                </Badge>
                                {alert.count > 1 && (
                                  <Badge variant="outline">{alert.count} occurrences</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{alert.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            {alert.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

