import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetPaymentsQuery,
  useAcceptPaymentMutation,
  PaymentResponse,
} from '@/app/api/bookingApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge className="bg-success text-white">Completed</Badge>;
    case 'pending':
      return <Badge className="bg-warning text-white">Pending</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500 text-white">Processing</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentMethodBadge = (method: string) => {
  switch (method) {
    case 'online':
      return <Badge variant="default">Online</Badge>;
    case 'bank_transfer':
      return <Badge variant="secondary">Bank Transfer</Badge>;
    case 'cash':
      return <Badge variant="outline">Cash</Badge>;
    case 'wallet':
      return <Badge className="bg-purple-500 text-white">Wallet</Badge>;
    default:
      return <Badge variant="outline">{method}</Badge>;
  }
};

export const PaymentManagement = () => {
  // Fetch payments
  const { data: paymentsResponse, isLoading, error, refetch } = useGetPaymentsQuery();
  
  // Dialog state
  const [acceptingPayment, setAcceptingPayment] = useState<PaymentResponse | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'bank_transfer' | 'cash' | 'wallet'>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Mutation
  const [acceptPayment, { isLoading: isAccepting }] = useAcceptPaymentMutation();

  // Console log API request and response
  useEffect(() => {
    console.log('📤 [PAYMENT MANAGEMENT Component] ========================================');
    console.log('📤 [PAYMENT MANAGEMENT Component] GET Payments Request');
    console.log('📤 [PAYMENT MANAGEMENT Component] Request Body: (GET request - no body)');
    console.log('📤 [PAYMENT MANAGEMENT Component] ========================================');
    
    if (paymentsResponse) {
      console.log('📥 [PAYMENT MANAGEMENT Component] ========================================');
      console.log('📥 [PAYMENT MANAGEMENT Component] GET Payments Response');
      console.log('📥 [PAYMENT MANAGEMENT Component] Response (Formatted):', JSON.stringify(paymentsResponse, null, 2));
      console.log('📥 [PAYMENT MANAGEMENT Component] Response (Raw):', paymentsResponse);
      console.log('📥 [PAYMENT MANAGEMENT Component] Payments Count:', paymentsResponse.count);
      console.log('📥 [PAYMENT MANAGEMENT Component] Payments Results:', paymentsResponse.results);
      console.log('📥 [PAYMENT MANAGEMENT Component] ========================================');
    }
  }, [paymentsResponse]);

  // Filter non-completed payments
  const nonCompletedPayments = paymentsResponse?.results?.filter(
    (payment) => payment.status.toLowerCase() !== 'completed'
  ) || [];

  const completedPayments = paymentsResponse?.results?.filter(
    (payment) => payment.status.toLowerCase() === 'completed'
  ) || [];

  // Calculate stats
  const stats = {
    total: paymentsResponse?.count || 0,
    pending: nonCompletedPayments.length,
    completed: completedPayments.length,
    totalAmount: paymentsResponse?.results?.reduce(
      (sum, p) => sum + parseFloat(p.amount || '0'),
      0
    ) || 0,
  };

  const handleAccept = (payment: PaymentResponse) => {
    setAcceptingPayment(payment);
    setPaymentAmount(payment.amount);
    setPaymentMethod('cash');
    setTransactionId('');
    setNotes('');
    setIsAcceptDialogOpen(true);
  };

  const confirmAccept = async () => {
    if (!acceptingPayment) return;

    // Extract booking ID from payment - we need to get it from the payment object
    // Since the API response doesn't include booking_id, we might need to extract it
    // from booking_number or use the payment id. Let me check the API response structure.
    // Based on the user's requirement, the endpoint is booking/bookings/{id}/accept_payment/
    // We need the booking ID. Since the payment response has booking_number, we might need
    // to find the booking by booking_number or the payment might have a booking_id field.
    // For now, I'll assume we can use the payment id or we need to fetch booking details.
    // Actually, looking at the endpoint pattern, it seems like we need the booking ID.
    // Let me check if payment has a booking_id field or if we need to extract it differently.
    
    // Based on the user's example: booking/bookings/149/accept_payment/
    // The 149 is likely the booking ID. We might need to add booking_id to the PaymentResponse
    // or extract it from booking_number. For now, I'll add a booking_id field assumption.
    
    // Actually, let me check the payment structure - the user said the response has:
    // booking_number, amount, payment_method, status, payment_date
    // But we need booking_id for the endpoint. Let me assume the payment object might have
    // a booking field or we need to add it. For now, I'll add a booking_id to the interface
    // or we can try to extract it from booking_number if it contains the ID.
    
    // Since we don't have booking_id in the response, I'll need to add it to the interface
    // or make an assumption. Let me update the interface to include booking_id.
    
    try {
      // Extract booking ID from payment
      // Try booking_id, booking, or extract from booking_number if needed
      const bookingId = acceptingPayment.booking_id || acceptingPayment.booking || null;
      
      if (!bookingId) {
        // If booking_id is not in response, we might need to fetch it from booking_number
        // For now, show error and suggest checking API response
        toast.error('Booking ID not found in payment record. Please check API response includes booking_id.');
        console.error('Payment object:', acceptingPayment);
        return;
      }

      const requestBody: {
        amount: number;
        payment_method: 'online' | 'bank_transfer' | 'cash' | 'wallet';
        transaction_id?: string;
        notes?: string;
      } = {
        amount: parseFloat(paymentAmount) || parseFloat(acceptingPayment.amount),
        payment_method: paymentMethod,
      };

      if (transactionId.trim()) {
        requestBody.transaction_id = transactionId.trim();
      }

      if (notes.trim()) {
        requestBody.notes = notes.trim();
      }

      console.log('📤 [PAYMENT MANAGEMENT Component] ========================================');
      console.log('📤 [PAYMENT MANAGEMENT Component] Accepting Payment');
      console.log('📤 [PAYMENT MANAGEMENT Component] Payment ID:', acceptingPayment.id);
      console.log('📤 [PAYMENT MANAGEMENT Component] Booking ID:', bookingId);
      console.log('📤 [PAYMENT MANAGEMENT Component] Request Body (Formatted):', JSON.stringify(requestBody, null, 2));
      console.log('📤 [PAYMENT MANAGEMENT Component] Request Body (Raw):', requestBody);
      console.log('📤 [PAYMENT MANAGEMENT Component] ========================================');

      const result = await acceptPayment({
        bookingId,
        paymentData: requestBody,
      }).unwrap();

      console.log('✅ [PAYMENT MANAGEMENT Component] ========================================');
      console.log('✅ [PAYMENT MANAGEMENT Component] Accept Payment Success');
      console.log('✅ [PAYMENT MANAGEMENT Component] Response (Formatted):', JSON.stringify(result, null, 2));
      console.log('✅ [PAYMENT MANAGEMENT Component] Response (Raw):', result);
      console.log('✅ [PAYMENT MANAGEMENT Component] ========================================');

      toast.success('Payment accepted successfully');
      setIsAcceptDialogOpen(false);
      setAcceptingPayment(null);
      setPaymentAmount('');
      setPaymentMethod('cash');
      setTransactionId('');
      setNotes('');
      await refetch();
    } catch (error: any) {
      console.error('❌ [PAYMENT MANAGEMENT Component] Accept payment error:', error);
      toast.error(error?.data?.message || error?.data?.detail || 'Failed to accept payment');
    }
  };

  if (isLoading && !paymentsResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
            <p className="text-muted-foreground mt-1">Manage user payments</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Failed to load payments. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Manage user payments and accept manual payments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
                </div>
                <DollarSign className="h-8 w-8 text-foreground opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{stats.pending}</p>
                </div>
                <DollarSign className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-success mt-1">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payments</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Booking Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!paymentsResponse?.results || paymentsResponse.results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentsResponse.results.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <span className="font-medium">#{payment.id}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{payment.booking_number}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₹{parseFloat(payment.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.payment_method)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {payment.status.toLowerCase() !== 'completed' ? (
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90"
                            onClick={() => handleAccept(payment)}
                            disabled={isAccepting}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Completed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Accept Payment Dialog */}
      <Dialog
        open={isAcceptDialogOpen}
        onOpenChange={(open) => {
          setIsAcceptDialogOpen(open);
          if (!open) {
            setAcceptingPayment(null);
            setPaymentAmount('');
            setPaymentMethod('cash');
            setTransactionId('');
            setNotes('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Payment</DialogTitle>
            <DialogDescription>
              Accept payment for booking {acceptingPayment?.booking_number}. This will mark the payment as completed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {acceptingPayment && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Booking Number</Label>
                    <p className="text-sm font-medium">{acceptingPayment.booking_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current Amount</Label>
                    <p className="text-sm font-medium">
                      ₹{parseFloat(acceptingPayment.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount *</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
              <Input
                id="transaction-id"
                placeholder="Enter transaction reference"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes for this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAccept} disabled={isAccepting || !paymentAmount}>
              {isAccepting ? 'Accepting...' : 'Accept Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

