import { motion } from 'framer-motion';
import { CheckSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const BookingApprovals = () => {
  const pendingApprovals = [
    { id: 1, bookingId: 'EV2024-001', customer: 'Rahul Sharma', amount: 80000, date: '2024-01-15', status: 'pending' },
    { id: 2, bookingId: 'EV2024-002', customer: 'Priya Singh', amount: 95000, date: '2024-01-16', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Booking Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve vehicle bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{approval.bookingId}</h3>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>Customer: {approval.customer}</p>
                    <p>Amount: ₹{approval.amount.toLocaleString()}</p>
                    <p className="text-xs">Date: {approval.date}</p>
                  </div>
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

