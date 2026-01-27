import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { DollarSign, Search, Filter, Download, CheckCircle, XCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Play, Check } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/app/hooks';
import {
  useGetPayoutsQuery,
  useProcessPayoutMutation,
  useCompletePayoutMutation,
  PayoutResponse,
  PayoutsListResponse,
} from '@/app/api/payoutApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

type PayoutStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';

const getStatusBadge = (status: PayoutStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-white">Completed</Badge>;
    case 'pending':
      return <Badge className="bg-warning text-white">Pending</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500 text-white">Processing</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    case 'cancelled':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const Payouts = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [period, setPeriod] = useState<'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'all_time' | ''>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [processingPayout, setProcessingPayout] = useState<PayoutResponse | null>(null);
  const [completingPayout, setCompletingPayout] = useState<PayoutResponse | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [processNotes, setProcessNotes] = useState('');
  const [completeTransactionId, setCompleteTransactionId] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      page_size: pageSize,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    if (dateFrom) {
      params.date_from = format(dateFrom, 'yyyy-MM-dd');
    }
    if (dateTo) {
      params.date_to = format(dateTo, 'yyyy-MM-dd');
    }
    if (period) {
      params.period = period;
    }

    return params;
  }, [currentPage, pageSize, statusFilter, dateFrom, dateTo, period]);

  // Fetch payouts list
  const { data: payoutsResponse, isLoading, error, refetch } = useGetPayoutsQuery(queryParams);
  
  // Console log API request and response
  useEffect(() => {
    // Log request
    console.log('📤 [PAYOUTS Component] ========================================');
    console.log('📤 [PAYOUTS Component] GET Payouts Request');
    console.log('📤 [PAYOUTS Component] Query Params (Formatted):', JSON.stringify(queryParams, null, 2));
    console.log('📤 [PAYOUTS Component] Query Params (Raw):', queryParams);
    console.log('📤 [PAYOUTS Component] Current Page:', currentPage);
    console.log('📤 [PAYOUTS Component] Page Size:', pageSize);
    console.log('📤 [PAYOUTS Component] Request Body: (GET request - no body)');
    console.log('📤 [PAYOUTS Component] ========================================');
    
    // Log response when available
    if (payoutsResponse) {
      console.log('📥 [PAYOUTS Component] ========================================');
      console.log('📥 [PAYOUTS Component] GET Payouts Response');
      console.log('📥 [PAYOUTS Component] Response (Formatted):', JSON.stringify(payoutsResponse, null, 2));
      console.log('📥 [PAYOUTS Component] Response (Raw):', payoutsResponse);
      console.log('📥 [PAYOUTS Component] Wallet Summary:', payoutsResponse.wallet_summary);
      console.log('📥 [PAYOUTS Component] Payouts Count:', payoutsResponse.payouts?.count);
      console.log('📥 [PAYOUTS Component] Payouts Results:', payoutsResponse.payouts?.results);
      console.log('📥 [PAYOUTS Component] ========================================');
    }
  }, [payoutsResponse, currentPage, pageSize, queryParams]);

  // Mutations
  const [processPayout, { isLoading: isProcessing }] = useProcessPayoutMutation();
  const [completePayout, { isLoading: isCompleting }] = useCompletePayoutMutation();

  // Filter payouts by search query (client-side)
  const filteredPayouts = useMemo(() => {
    if (!payoutsResponse?.payouts?.results) return [];
    
    let filtered = payoutsResponse.payouts.results;
    
    // Client-side search by email, account number, or user ID
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((payout) => 
        payout.user_email?.toLowerCase().includes(query) ||
        payout.account_number?.toLowerCase().includes(query) ||
        payout.account_holder_name?.toLowerCase().includes(query) ||
        payout.id.toString().includes(query)
      );
    }
    
    return filtered;
  }, [payoutsResponse?.payouts?.results, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!payoutsResponse?.payouts) return { total: 0, pending: 0, processing: 0, completed: 0 };
    
    const allPayouts = payoutsResponse.payouts.results;
    const total = payoutsResponse.payouts.count;
    const pending = allPayouts.filter(p => p.status === 'pending').length;
    const processing = allPayouts.filter(p => p.status === 'processing').length;
    const completed = allPayouts.filter(p => p.status === 'completed').length;
    
    return {
      total,
      pending,
      processing,
      completed,
    };
  }, [payoutsResponse]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFrom, dateTo, period]);

  const handleProcess = (payout: PayoutResponse) => {
    setProcessingPayout(payout);
    setProcessNotes('');
    setIsProcessDialogOpen(true);
  };

  const confirmProcess = async () => {
    if (!processingPayout) return;

    try {
      const requestBody = processNotes.trim() ? { notes: processNotes.trim() } : {};
      const requestPayload = {
        id: processingPayout.id,
        notes: processNotes.trim() || undefined,
      };
      
      console.log('📤 [PAYOUTS Component] ========================================');
      console.log('📤 [PAYOUTS Component] Processing Payout');
      console.log('📤 [PAYOUTS Component] Payout ID:', processingPayout.id);
      console.log('📤 [PAYOUTS Component] Request Payload (Formatted):', JSON.stringify(requestPayload, null, 2));
      console.log('📤 [PAYOUTS Component] Request Body (Formatted):', JSON.stringify(requestBody, null, 2));
      console.log('📤 [PAYOUTS Component] Request Body (Raw):', requestBody);
      console.log('📤 [PAYOUTS Component] ========================================');
      
      const result = await processPayout(requestPayload).unwrap();
      
      console.log('✅ [PAYOUTS Component] ========================================');
      console.log('✅ [PAYOUTS Component] Process Payout Success');
      console.log('✅ [PAYOUTS Component] Response (Formatted):', JSON.stringify(result, null, 2));
      console.log('✅ [PAYOUTS Component] Response (Raw):', result);
      console.log('✅ [PAYOUTS Component] ========================================');
      
      toast.success('Payout processed successfully');
      setIsProcessDialogOpen(false);
      setProcessingPayout(null);
      setProcessNotes('');
      await refetch();
    } catch (error: any) {
      console.error('❌ [PAYOUTS Component] Process payout error:', error);
      toast.error(error?.data?.message || error?.data?.detail || 'Failed to process payout');
    }
  };

  const handleComplete = (payout: PayoutResponse) => {
    setCompletingPayout(payout);
    setCompleteTransactionId('');
    setCompleteNotes('');
    setIsCompleteDialogOpen(true);
  };

  const confirmComplete = async () => {
    if (!completingPayout) return;

    try {
      const requestBody: { transaction_id?: string; notes?: string } = {};
      if (completeTransactionId.trim()) {
        requestBody.transaction_id = completeTransactionId.trim();
      }
      if (completeNotes.trim()) {
        requestBody.notes = completeNotes.trim();
      }
      
      const requestPayload = {
        id: completingPayout.id,
        transaction_id: completeTransactionId.trim() || undefined,
        notes: completeNotes.trim() || undefined,
      };
      
      console.log('📤 [PAYOUTS Component] ========================================');
      console.log('📤 [PAYOUTS Component] Completing Payout');
      console.log('📤 [PAYOUTS Component] Payout ID:', completingPayout.id);
      console.log('📤 [PAYOUTS Component] Request Payload (Formatted):', JSON.stringify(requestPayload, null, 2));
      console.log('📤 [PAYOUTS Component] Request Body (Formatted):', JSON.stringify(requestBody, null, 2));
      console.log('📤 [PAYOUTS Component] Request Body (Raw):', requestBody);
      console.log('📤 [PAYOUTS Component] ========================================');
      
      const result = await completePayout(requestPayload).unwrap();
      
      console.log('✅ [PAYOUTS Component] ========================================');
      console.log('✅ [PAYOUTS Component] Complete Payout Success');
      console.log('✅ [PAYOUTS Component] Response (Formatted):', JSON.stringify(result, null, 2));
      console.log('✅ [PAYOUTS Component] Response (Raw):', result);
      console.log('✅ [PAYOUTS Component] ========================================');
      
      toast.success('Payout completed successfully');
      setIsCompleteDialogOpen(false);
      setCompletingPayout(null);
      setCompleteTransactionId('');
      setCompleteNotes('');
      await refetch();
    } catch (error: any) {
      console.error('❌ [PAYOUTS Component] Complete payout error:', error);
      toast.error(error?.data?.message || error?.data?.detail || 'Failed to complete payout');
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPeriod('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const totalPages = payoutsResponse?.payouts ? Math.ceil(payoutsResponse.payouts.count / pageSize) : 0;

  if (isLoading && !payoutsResponse) {
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
            <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
            <p className="text-muted-foreground mt-1">Manage user payout requests</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Failed to load payouts. Please try again.</p>
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
          <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
          <p className="text-muted-foreground mt-1">Manage user payout requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Filters</Label>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PayoutStatus | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Period</Label>
                  <Select value={period || 'all_time'} onValueChange={(value) => setPeriod(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_time">All Time</SelectItem>
                      <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                      <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                      <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Payouts</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Processing</p>
                  <p className="text-3xl font-bold text-blue-500 mt-1">{stats.processing}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-success mt-1">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Wallet Summary */}
      {payoutsResponse?.wallet_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ₹{parseFloat(payoutsResponse.wallet_summary.current_balance || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ₹{parseFloat(payoutsResponse.wallet_summary.total_earned || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Withdrawn</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  ₹{parseFloat(payoutsResponse.wallet_summary.total_withdrawn || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout Requests</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email, account number, or ID..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>TDS</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No payouts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <span className="font-medium">#{payout.id}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{payout.user_email || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">Wallet: ₹{parseFloat(payout.wallet_balance || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{payout.account_holder_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{payout.bank_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">
                              {payout.account_number ? `${payout.account_number.slice(-4).padStart(payout.account_number.length, '*')}` : 'N/A'} | {payout.ifsc_code || 'N/A'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ₹{parseFloat(payout.requested_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            ₹{parseFloat(payout.tds_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-success">
                            ₹{parseFloat(payout.net_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {payout.created_at ? new Date(payout.created_at).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {payout.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={() => handleProcess(payout)}
                                disabled={isProcessing}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Process
                              </Button>
                            )}
                            {payout.status === 'processing' && (
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90"
                                onClick={() => handleComplete(payout)}
                                disabled={isCompleting}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}
                            {payout.status === 'completed' && (
                              <span className="text-sm text-muted-foreground">Completed</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {payoutsResponse?.payouts && payoutsResponse.payouts.count > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Rows per page:</Label>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, payoutsResponse.payouts.count)} of {payoutsResponse.payouts.count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Process Payout Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={(open) => {
        setIsProcessDialogOpen(open);
        if (!open) {
          setProcessingPayout(null);
          setProcessNotes('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Process payout request #{processingPayout?.id}. This will deduct the amount from the user's wallet and set status to 'processing'.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {processingPayout && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">User Email</Label>
                    <p className="text-sm font-medium">{processingPayout.user_email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Requested Amount</Label>
                    <p className="text-sm font-medium">₹{parseFloat(processingPayout.requested_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Net Amount</Label>
                    <p className="text-sm font-medium text-success">₹{parseFloat(processingPayout.net_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bank Account</Label>
                    <p className="text-sm font-medium">{processingPayout.account_holder_name} - {processingPayout.bank_name}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="process-notes">Notes (Optional)</Label>
              <Textarea
                id="process-notes"
                placeholder="Add any notes for processing..."
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmProcess} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Process Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Payout Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={(open) => {
        setIsCompleteDialogOpen(open);
        if (!open) {
          setCompletingPayout(null);
          setCompleteTransactionId('');
          setCompleteNotes('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payout</DialogTitle>
            <DialogDescription>
              Mark payout request #{completingPayout?.id} as completed after payment gateway confirms successful transfer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {completingPayout && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">User Email</Label>
                    <p className="text-sm font-medium">{completingPayout.user_email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Net Amount</Label>
                    <p className="text-sm font-medium text-success">₹{parseFloat(completingPayout.net_amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bank Account</Label>
                    <p className="text-sm font-medium">{completingPayout.account_holder_name} - {completingPayout.bank_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Account Number</Label>
                    <p className="text-sm font-medium">{completingPayout.account_number}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
              <Input
                id="transaction-id"
                placeholder="Enter transaction ID from payment gateway"
                value={completeTransactionId}
                onChange={(e) => setCompleteTransactionId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complete-notes">Notes (Optional)</Label>
              <Textarea
                id="complete-notes"
                placeholder="Add any notes for completion..."
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmComplete} disabled={isCompleting}>
              {isCompleting ? 'Completing...' : 'Complete Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

