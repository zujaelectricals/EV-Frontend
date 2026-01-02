import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const StaffTargets = () => {
  const targets = [
    { label: 'Sales Target', current: 45, target: 100, unit: 'vehicles' },
    { label: 'Lead Generation', current: 120, target: 150, unit: 'leads' },
    { label: 'Revenue Target', current: 850000, target: 1000000, unit: '₹' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Targets</h1>
        <p className="text-muted-foreground mt-1">Track your performance against targets</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {targets.map((target, index) => (
          <motion.div
            key={target.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {target.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-foreground">
                        {target.current.toLocaleString()} / {target.target.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">{target.unit}</span>
                    </div>
                    <Progress value={(target.current / target.target) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">
                      {((target.current / target.target) * 100).toFixed(1)}% completed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

