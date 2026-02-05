import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle, Calendar as CalendarIcon, Eye, RotateCcw, User as UserIcon } from 'lucide-react';
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
  useCreateRefundMutation,
  PaymentResponse,
} from '@/app/api/bookingApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

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

  // View dialog state
  const [viewingPayment, setViewingPayment] = useState<PaymentResponse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Refund dialog state
  const [refundingPayment, setRefundingPayment] = useState<PaymentResponse | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [isFullRefund, setIsFullRefund] = useState(true);

  // Mutations
  const [acceptPayment, { isLoading: isAccepting }] = useAcceptPaymentMutation();
  const [createRefund, { isLoading: isRefunding }] = useCreateRefundMutation();

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
  const refundedPayments = paymentsResponse?.results?.filter(
    (payment) => payment.refund_details !== null
  ) || [];

  const stats = {
    total: paymentsResponse?.count || 0,
    pending: nonCompletedPayments.length,
    completed: completedPayments.length,
    refunded: refundedPayments.length,
    totalAmount: paymentsResponse?.results?.reduce(
      (sum, p) => sum + parseFloat(p.amount || '0'),
      0
    ) || 0,
    totalRefunded: refundedPayments.reduce(
      (sum, p) => sum + parseFloat(p.refund_details?.refund_amount || '0'),
      0
    ),
  };

  const handleAccept = (payment: PaymentResponse) => {
    setAcceptingPayment(payment);
    setPaymentAmount(payment.amount);
    setPaymentMethod('cash');
    setTransactionId('');
    setNotes('');
    setIsAcceptDialogOpen(true);
  };

  const handleView = (payment: PaymentResponse) => {
    setViewingPayment(payment);
    setIsViewDialogOpen(true);
  };

  const handleRefund = (payment: PaymentResponse) => {
    setRefundingPayment(payment);
    setIsFullRefund(true);
    setRefundAmount('');
    setIsRefundDialogOpen(true);
  };

  const confirmRefund = async () => {
    if (!refundingPayment || !refundingPayment.transaction_id) {
      toast.error('Payment transaction ID not found. Cannot process refund.');
      return;
    }

    try {
      const requestBody: {
        payment_id: string;
        amount?: number | null;
      } = {
        payment_id: refundingPayment.transaction_id,
      };

      // Only include amount if it's a partial refund
      if (!isFullRefund && refundAmount) {
        const amount = parseFloat(refundAmount);
        if (isNaN(amount) || amount <= 0) {
          toast.error('Please enter a valid refund amount');
          return;
        }
        if (amount > parseFloat(refundingPayment.amount)) {
          toast.error('Refund amount cannot exceed payment amount');
          return;
        }
        requestBody.amount = amount;
      }

      console.log('📤 [PAYMENT MANAGEMENT Component] ========================================');
      console.log('📤 [PAYMENT MANAGEMENT Component] Creating Refund');
      console.log('📤 [PAYMENT MANAGEMENT Component] Payment ID:', refundingPayment.id);
      console.log('📤 [PAYMENT MANAGEMENT Component] Razorpay Payment ID:', refundingPayment.transaction_id);
      console.log('📤 [PAYMENT MANAGEMENT Component] Request Body (Formatted):', JSON.stringify(requestBody, null, 2));
      console.log('📤 [PAYMENT MANAGEMENT Component] ========================================');

      const result = await createRefund(requestBody).unwrap();

      console.log('✅ [PAYMENT MANAGEMENT Component] ========================================');
      console.log('✅ [PAYMENT MANAGEMENT Component] Refund Success');
      console.log('✅ [PAYMENT MANAGEMENT Component] Response (Formatted):', JSON.stringify(result, null, 2));
      console.log('✅ [PAYMENT MANAGEMENT Component] Response (Raw):', result);
      console.log('✅ [PAYMENT MANAGEMENT Component] ========================================');

      toast.success(result.message || 'Refund created successfully');
      setIsRefundDialogOpen(false);
      setRefundingPayment(null);
      setRefundAmount('');
      setIsFullRefund(true);
      await refetch();
    } catch (error: any) {
      console.error('❌ [PAYMENT MANAGEMENT Component] Refund error:', error);
      toast.error(error?.data?.message || error?.data?.detail || 'Failed to create refund');
    }
  };

  const confirmAccept = async () => {
    if (!acceptingPayment) return;

    try {
      // Extract booking ID from payment - API response includes 'booking' field
      const bookingId = acceptingPayment.booking || acceptingPayment.booking_id || null;
      
      if (!bookingId) {
        toast.error('Booking ID not found in payment record. Please check API response includes booking ID.');
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
      <div className="grid gap-4 md:grid-cols-5">
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
                  <p className="text-sm font-medium text-muted-foreground">Refunded</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.refunded}</p>
                </div>
                <RotateCcw className="h-8 w-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    ₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {stats.totalRefunded > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Refunded: ₹{stats.totalRefunded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
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
                  <TableHead>User</TableHead>
                  <TableHead>Booking Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!paymentsResponse?.results || paymentsResponse.results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{payment.user_details?.fullname || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">{payment.user_details?.email || ''}</span>
                          <span className="text-xs text-muted-foreground">{payment.user_details?.mobile || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{payment.booking_number}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            ₹{parseFloat(payment.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {payment.refund_details && (
                            <span className="text-xs text-orange-600 mt-1">
                              Refunded: ₹{parseFloat(payment.refund_details.refund_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.payment_method)}</TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">
                          {payment.transaction_id || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(payment.status)}
                          {payment.refund_details && (
                            <Badge className="bg-orange-500 text-white text-xs">
                              Refunded ({payment.refund_details.refund_status})
                            </Badge>
                          )}
                        </div>
                      </TableCell>
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
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(payment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {payment.status.toLowerCase() === 'completed' && 
                           payment.payment_method === 'online' && 
                           payment.transaction_id && 
                           !payment.refund_details ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => handleRefund(payment)}
                              disabled={isRefunding}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Refund
                            </Button>
                          ) : payment.status.toLowerCase() !== 'completed' ? (
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleAccept(payment)}
                              disabled={isAccepting}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Payment Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setViewingPayment(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View complete details for payment #{viewingPayment?.id}
            </DialogDescription>
          </DialogHeader>
          {viewingPayment && (
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Payment ID</Label>
                  <p className="text-sm font-medium">#{viewingPayment.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Booking Number</Label>
                  <p className="text-sm font-medium">{viewingPayment.booking_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="text-sm font-medium">
                    ₹{parseFloat(viewingPayment.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Method</Label>
                  <div className="mt-1">{getPaymentMethodBadge(viewingPayment.payment_method)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingPayment.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <p className="text-sm font-mono text-muted-foreground">
                    {viewingPayment.transaction_id || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Date</Label>
                  <p className="text-sm">
                    {viewingPayment.payment_date
                      ? new Date(viewingPayment.payment_date).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
                {viewingPayment.completed_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Completed At</Label>
                    <p className="text-sm">
                      {new Date(viewingPayment.completed_at).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">User Details</Label>
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="text-sm font-medium">{viewingPayment.user_details?.fullname || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm">{viewingPayment.user_details?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Mobile</Label>
                    <p className="text-sm">{viewingPayment.user_details?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">User ID</Label>
                    <p className="text-sm">{viewingPayment.user_details?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {viewingPayment.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Notes</Label>
                    <p className="text-sm p-3 bg-muted/50 rounded-lg">{viewingPayment.notes}</p>
                  </div>
                </>
              )}
              
              {viewingPayment.refund_details && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Refund Details</Label>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Refund ID</Label>
                          <p className="text-sm font-mono font-medium">{viewingPayment.refund_details.refund_id}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Refund Status</Label>
                          <Badge className="bg-orange-500 text-white mt-1">
                            {viewingPayment.refund_details.refund_status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Refund Amount</Label>
                          <p className="text-sm font-medium text-orange-600">
                            ₹{parseFloat(viewingPayment.refund_details.refund_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Original Amount</Label>
                          <p className="text-sm font-medium">
                            ₹{parseFloat(viewingPayment.refund_details.original_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Balance Amount</Label>
                          <p className="text-sm font-medium">
                            ₹{parseFloat(viewingPayment.refund_details.balance_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Refund Created At</Label>
                          <p className="text-sm">
                            {new Date(viewingPayment.refund_details.refund_created_at * 1000).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      {viewingPayment.refund_details.refund_notes && (
                        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                          <Label className="text-xs text-muted-foreground mb-2 block">Refund Notes</Label>
                          {viewingPayment.refund_details.refund_notes.original_order_id && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Order ID:</span> {viewingPayment.refund_details.refund_notes.original_order_id}
                            </p>
                          )}
                          {viewingPayment.refund_details.refund_notes.refund_reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Reason:</span> {viewingPayment.refund_details.refund_notes.refund_reason}
                            </p>
                          )}
                        </div>
                      )}
                      {viewingPayment.refund_details.refund_speed && (
                        <div className="mt-2">
                          <Label className="text-xs text-muted-foreground">Refund Speed</Label>
                          <p className="text-sm">{viewingPayment.refund_details.refund_speed}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog
        open={isRefundDialogOpen}
        onOpenChange={(open) => {
          setIsRefundDialogOpen(open);
          if (!open) {
            setRefundingPayment(null);
            setRefundAmount('');
            setIsFullRefund(true);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Refund</DialogTitle>
            <DialogDescription>
              Create a refund for payment #{refundingPayment?.id} - {refundingPayment?.booking_number}
            </DialogDescription>
          </DialogHeader>
          {refundingPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Payment ID</Label>
                  <p className="text-sm font-medium">#{refundingPayment.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Booking Number</Label>
                  <p className="text-sm font-medium">{refundingPayment.booking_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Amount</Label>
                  <p className="text-sm font-medium">
                    ₹{parseFloat(refundingPayment.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <p className="text-sm font-mono text-muted-foreground">
                    {refundingPayment.transaction_id || 'N/A'}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Refund Type</Label>
                <Select
                  value={isFullRefund ? 'full' : 'partial'}
                  onValueChange={(value) => {
                    setIsFullRefund(value === 'full');
                    if (value === 'full') {
                      setRefundAmount('');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Refund</SelectItem>
                    <SelectItem value="partial">Partial Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!isFullRefund && (
                <div className="space-y-2">
                  <Label htmlFor="refund-amount">Refund Amount (₹) *</Label>
                  <Input
                    id="refund-amount"
                    type="number"
                    placeholder={`Enter amount (max: ₹${parseFloat(refundingPayment.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    max={refundingPayment.amount}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum refundable: ₹{parseFloat(refundingPayment.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Only successful online payments can be refunded. The refund will be processed through Razorpay.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRefund}
              disabled={isRefunding || (!isFullRefund && !refundAmount)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isRefunding ? 'Processing...' : isFullRefund ? 'Refund Full Amount' : 'Refund Partial Amount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

