import { motion } from 'framer-motion';
import { Map, Users, AlertTriangle, TrendingDown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const saturationData = [
  { region: 'Mumbai', current: 245, capacity: 500, saturation: 49, status: 'healthy' },
  { region: 'Delhi', current: 320, capacity: 600, saturation: 53.3, status: 'moderate' },
  { region: 'Bangalore', current: 198, capacity: 450, saturation: 44, status: 'healthy' },
  { region: 'Chennai', current: 156, capacity: 400, saturation: 39, status: 'healthy' },
  { region: 'Kolkata', current: 285, capacity: 350, saturation: 81.4, status: 'high' },
  { region: 'Hyderabad', current: 142, capacity: 380, saturation: 37.4, status: 'healthy' },
  { region: 'Pune', current: 95, capacity: 300, saturation: 31.7, status: 'healthy' },
  { region: 'Ahmedabad', current: 178, capacity: 320, saturation: 55.6, status: 'moderate' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'healthy':
      return <Badge className="bg-success text-white">Healthy</Badge>;
    case 'moderate':
      return <Badge variant="default">Moderate</Badge>;
    case 'high':
      return <Badge variant="destructive">High Saturation</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const NetworkSaturation = () => {
  const overallSaturation = 48.5;
  const avgSaturation = saturationData.reduce((sum, r) => sum + r.saturation, 0) / saturationData.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Network Saturation Map</h1>
        <p className="text-muted-foreground mt-1">Monitor distributor network saturation across regions</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Saturation</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{overallSaturation}%</div>
              <Progress value={overallSaturation} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">Healthy range: 30-60%</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3,300</div>
              <div className="text-xs text-muted-foreground mt-1">Distributors</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Usage</CardTitle>
              <Map className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,601</div>
              <div className="text-xs text-muted-foreground mt-1">Active distributors</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">High Saturation</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div>
              <div className="text-xs text-muted-foreground mt-1">Regions need attention</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Regional Saturation */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Saturation Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {saturationData.map((region, index) => (
              <motion.div
                key={region.region}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Map className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-semibold text-foreground">{region.region}</h4>
                          <p className="text-xs text-muted-foreground">
                            {region.current} / {region.capacity} distributors
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{region.saturation}%</p>
                          <p className="text-xs text-muted-foreground">Saturation</p>
                        </div>
                        {getStatusBadge(region.status)}
                      </div>
                    </div>
                    <Progress
                      value={region.saturation}
                      className={`h-2 ${
                        region.saturation > 70
                          ? '[&>div]:bg-destructive'
                          : region.saturation > 50
                          ? '[&>div]:bg-warning'
                          : '[&>div]:bg-success'
                      }`}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

