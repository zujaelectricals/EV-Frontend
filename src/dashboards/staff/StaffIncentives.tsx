import { motion } from 'framer-motion';
import { Gift, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StaffIncentives = () => {
  const incentives = [
    { id: 1, type: 'Sales Bonus', amount: 5000, description: 'Achieved 50+ sales this month', date: '2024-01-15', status: 'earned' },
    { id: 2, type: 'Lead Generation', amount: 2000, description: 'Generated 100+ leads', date: '2024-01-10', status: 'earned' },
    { id: 3, type: 'Performance Bonus', amount: 10000, description: 'Top performer of the month', date: '2024-01-20', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Incentives</h1>
        <p className="text-muted-foreground mt-1">View your earned and pending incentives</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Incentive History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incentives.map((incentive) => (
              <motion.div
                key={incentive.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{incentive.type}</h3>
                    <Badge variant={incentive.status === 'earned' ? 'default' : 'secondary'}>
                      {incentive.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{incentive.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Date: {incentive.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span className="text-2xl font-bold text-foreground">₹{incentive.amount.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

