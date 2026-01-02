import { motion } from 'framer-motion';
import { UserCheck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DistributorVerification = () => {
  const pendingVerifications = [
    { id: 1, name: 'John Doe', email: 'john@example.com', submittedAt: '2024-01-10', status: 'pending' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', submittedAt: '2024-01-12', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Distributor Verification</h1>
        <p className="text-muted-foreground mt-1">Review and verify distributor applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingVerifications.map((verification) => (
              <motion.div
                key={verification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{verification.name}</h3>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{verification.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Submitted: {verification.submittedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm" className="bg-success hover:bg-success/90">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="destructive" size="sm">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

