import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const RiskCompliance = () => {
  const complianceItems = [
    { id: 1, title: 'TDS Compliance', status: 'compliant', lastCheck: '2024-01-15', score: 98 },
    { id: 2, title: 'Data Privacy', status: 'compliant', lastCheck: '2024-01-14', score: 95 },
    { id: 3, title: 'Financial Regulations', status: 'warning', lastCheck: '2024-01-13', score: 87 },
    { id: 4, title: 'User Verification', status: 'compliant', lastCheck: '2024-01-12', score: 92 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Risk & Compliance</h1>
        <p className="text-muted-foreground mt-1">Monitor compliance and risk management</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">93%</div>
            <p className="text-xs text-success mt-1">Excellent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliant Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 14</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
            <FileText className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2024-01-15</div>
            <p className="text-xs text-muted-foreground mt-1">Recent</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Last check: {item.lastCheck}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{item.score}%</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

