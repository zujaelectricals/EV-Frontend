import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/app/hooks';
import { Link } from 'react-router-dom';

export function MyOrders() {
  const { bookings } = useAppSelector((state) => state.booking);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success/10 text-success border-success/30';
      case 'confirmed':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'pre-booked':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pre-booked':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Orders</h2>
          <p className="text-muted-foreground">Track and manage your vehicle orders</p>
        </div>
        <Link to="/scooters">
          <Button>Browse Vehicles</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
            <Link to="/scooters">
              <Button>Browse Vehicles</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {booking.vehicleName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Order ID: {booking.id}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Order Date</p>
                            <p className="text-sm font-medium">
                              {new Date(booking.bookedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Total Amount</p>
                            <p className="text-sm font-medium">₹{booking.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        {booking.paymentDueDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Due Date</p>
                              <p className="text-sm font-medium">
                                {new Date(booking.paymentDueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Payment Method</p>
                            <p className="text-sm font-medium capitalize">{booking.paymentMethod}</p>
                          </div>
                        </div>
                      </div>

                      {booking.status === 'pre-booked' && (
                        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                          <p className="text-sm text-foreground">
                            <strong>Pre-booking Amount:</strong> ₹{booking.preBookingAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-foreground">
                            <strong>Remaining:</strong> ₹{booking.remainingAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link to={`/orders/${booking.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      {booking.status === 'pre-booked' && (
                        <Button className="w-full">
                          Complete Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

