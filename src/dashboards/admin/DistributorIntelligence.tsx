import { motion } from 'framer-motion';
import { Brain, Users, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const DistributorIntelligence = () => {
  const topDistributors = [
    { id: 1, name: 'John Doe', referrals: 45, revenue: 3200000, commission: 64000, status: 'active' },
    { id: 2, name: 'Jane Smith', referrals: 38, revenue: 2800000, commission: 56000, status: 'active' },
    { id: 3, name: 'Mike Johnson', referrals: 32, revenue: 2400000, commission: 48000, status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Distributor Intelligence</h1>
        <p className="text-muted-foreground mt-1">Analyze distributor performance and insights</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Distributors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">245</div>
            <p className="text-xs text-success mt-1">+12 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Distributors</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">198</div>
            <p className="text-xs text-muted-foreground mt-1">80.8% active rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹12.5L</div>
            <p className="text-xs text-success mt-1">+28% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <Brain className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">87%</div>
            <p className="text-xs text-success mt-1">+5% improvement</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Distributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDistributors.map((distributor) => (
              <motion.div
                key={distributor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{distributor.name}</h3>
                    <Badge variant="default">{distributor.status}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Referrals: </span>
                      <span className="font-medium">{distributor.referrals}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue: </span>
                      <span className="font-medium">₹{(distributor.revenue / 100000).toFixed(1)}L</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Commission: </span>
                      <span className="font-medium">₹{distributor.commission.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">View Details</Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

