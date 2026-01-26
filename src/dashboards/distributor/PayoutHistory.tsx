import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Wallet, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { Payout, PayoutStatus, setPayouts } from '@/app/slices/payoutSlice';
import { StatsCard } from '@/shared/components/StatsCard';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useGetPayoutsQuery, useCreatePayoutMutation, CreatePayoutRequest } from '@/app/api/payoutApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { api } from '@/app/api/baseApi';

const getStatusBadge = (status: PayoutStatus | 'rejected') => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-white"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
    case 'processing':
      return <Badge className="bg-blue-500 text-white"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
    case 'pending':
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'failed':
    case 'rejected':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{status === 'rejected' ? 'Rejected' : 'Failed'}</Badge>;
    case 'cancelled':
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    referral: 'Referral Bonus',
    binary: 'Team Commission',
    pool: 'Pool Money',
    incentive: 'Incentive',
    milestone: 'Milestone Reward',
  };
  return labels[type] || type;
};

export const PayoutHistory = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { payouts } = useAppSelector((state) => state.payout);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreatePayoutDialog, setShowCreatePayoutDialog] = useState(false);
  const [createPayout, { isLoading: isCreatingPayout }] = useCreatePayoutMutation();
  const [selectedBankIndex, setSelectedBankIndex] = useState<number>(0);
  
  // Form state for create payout
  const [payoutForm, setPayoutForm] = useState<CreatePayoutRequest>({
    requested_amount: 0,
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: user?.name || '',
    emi_auto_filled: false,
    reason: '',
  });

  // Map API status to query parameter
  const getApiStatus = (localStatus: string): string | undefined => {
    if (localStatus === 'all') return undefined;
    return localStatus;
  };

  // Get payouts with status filter
  const apiStatus = getApiStatus(statusFilter);
  const queryParams = useMemo(() => {
    return apiStatus ? { status: apiStatus } : undefined;
  }, [apiStatus]);

  const { 
    data: payoutsData, 
    isLoading: isLoadingPayouts, 
    error: payoutsError, 
    refetch,
    isFetching,
    currentData
  } = useGetPayoutsQuery(
    queryParams,
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: false,
      refetchOnReconnect: true,
    }
  );

  // Use currentData if available, otherwise fallback to data
  const activePayoutsData = currentData ?? payoutsData;

  // Get bank details from API response
  const bankDetails = activePayoutsData?.bank_details || [];

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      const status = apiStatus || 'all';
      dispatch(
        api.util.invalidateTags([
          { type: 'Payout', id: 'LIST' },
          { type: 'Payout', id: `LIST-${status}` },
        ])
      );
      
      const result = await refetch();
      if (result.data) {
        setRefreshKey(prev => prev + 1);
        toast.success("Payouts refreshed successfully");
      } else if (result.error) {
        toast.error("Failed to refresh payouts");
      }
    } catch (error) {
      console.error("Error refreshing payouts:", error);
      toast.error("Failed to refresh payouts");
    }
  };

  // Map API payouts to local payout format
  const mappedPayouts = useMemo(() => {
    if (!activePayoutsData?.payouts?.results) return [];
    
    return activePayoutsData.payouts.results.map((apiPayout) => {
      // Derive description from payout details
      const description = apiPayout.notes || 
        `Payout to ${apiPayout.account_holder_name} (${apiPayout.bank_name})`;
      
      // Map 'rejected' status to 'failed' for compatibility with PayoutStatus type
      const mappedStatus = apiPayout.status === 'rejected' ? 'failed' : apiPayout.status;
      
      return {
        id: apiPayout.id.toString(),
        amount: parseFloat(apiPayout.requested_amount) || 0,
        type: 'binary' as Payout['type'], // Default type since API doesn't provide it
        status: mappedStatus as PayoutStatus,
        description: description,
        requestedAt: apiPayout.created_at,
        processedAt: apiPayout.processed_at || undefined,
        tds: apiPayout.tds_amount ? parseFloat(apiPayout.tds_amount) : undefined,
        netAmount: apiPayout.net_amount ? parseFloat(apiPayout.net_amount) : undefined,
      };
    });
  }, [activePayoutsData, refreshKey]);

  // Update Redux store when payouts data changes
  useEffect(() => {
    if (mappedPayouts.length > 0 || activePayoutsData) {
      dispatch(setPayouts(mappedPayouts));
    }
  }, [mappedPayouts, dispatch, activePayoutsData]);

  // Always use API data when available
  const displayPayouts = useMemo(() => {
    // If we have API data, use mapped payouts, otherwise use Redux payouts
    const source = activePayoutsData !== undefined ? mappedPayouts : payouts;
    // Remove duplicates by ID
    const seen = new Set<string>();
    return source.filter((payout) => {
      if (seen.has(payout.id)) {
        return false;
      }
      seen.add(payout.id);
      return true;
    });
  }, [mappedPayouts, payouts, activePayoutsData]);

  // Debug: Log wallet summary when available
  useEffect(() => {
    if (activePayoutsData?.wallet_summary) {
      console.log('💰 [PAYOUT HISTORY] Wallet Summary:', activePayoutsData.wallet_summary);
      console.log('💰 [PAYOUT HISTORY] Total Withdrawn:', activePayoutsData.wallet_summary.total_withdrawn);
    }
  }, [activePayoutsData]);

  // Filter payouts by tab status
  const filteredPayouts = useMemo(() => {
    if (statusFilter === 'all') return displayPayouts;
    if (statusFilter === 'pending') {
      return displayPayouts.filter(p => p.status === 'pending' || p.status === 'processing');
    }
    if (statusFilter === 'completed') {
      return displayPayouts.filter(p => p.status === 'completed');
    }
    return displayPayouts;
  }, [displayPayouts, statusFilter]);

  // Calculate stats from wallet_summary and payouts
  const walletSummary = activePayoutsData?.wallet_summary;
  
  // Total Payouts: Use total_withdrawn from wallet_summary if available, otherwise sum from payouts
  const totalPayouts = useMemo(() => {
    if (walletSummary?.total_withdrawn) {
      const withdrawn = parseFloat(walletSummary.total_withdrawn);
      return isNaN(withdrawn) ? 0 : withdrawn;
    }
    return displayPayouts.reduce((sum, p) => sum + (p.netAmount || p.amount), 0);
  }, [walletSummary, displayPayouts]);
  
  // Pending payouts: Filter from displayPayouts
  const pendingPayouts = useMemo(() => 
    displayPayouts.filter(p => p.status === 'pending' || p.status === 'processing'),
    [displayPayouts]
  );
  const totalPending = useMemo(() => 
    pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0),
    [pendingPayouts]
  );
  
  // Completed payouts: Filter from displayPayouts
  const completedPayouts = useMemo(() => 
    displayPayouts.filter(p => p.status === 'completed'),
    [displayPayouts]
  );
  
  // Total Transactions: Use count from API response
  const totalTransactions = activePayoutsData?.payouts?.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payout History</h1>
        <p className="text-muted-foreground mt-1">View all your payout requests and transaction history</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Payouts"
          value={isLoadingPayouts ? '...' : `₹${totalPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="Pending Amount"
          value={isLoadingPayouts ? '...' : `₹${totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Completed"
          value={isLoadingPayouts ? '...' : completedPayouts.length.toString()}
          icon={CheckCircle}
          variant="primary"
        />
        <StatsCard
          title="Total Transactions"
          value={isLoadingPayouts ? '...' : totalTransactions.toString()}
          icon={ClipboardList}
          variant="info"
        />
      </div>

      {/* Wallet Summary Card */}
      {walletSummary && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Wallet Summary</CardTitle>
              <CardDescription>Your current wallet balance and earnings overview</CardDescription>
            </div>
            <Button
              onClick={() => {
                // Auto-fill bank details from API response if available
                const currentBalance = parseFloat(walletSummary.current_balance || '0');
                const defaultBank = bankDetails.length > 0 ? bankDetails[0] : null;
                
                setSelectedBankIndex(0);
                setPayoutForm({
                  requested_amount: currentBalance > 0 ? currentBalance : 0,
                  // Auto-fill from bank_details if available
                  bank_name: defaultBank?.bank_name || '',
                  account_number: defaultBank?.account_number || '',
                  ifsc_code: defaultBank?.ifsc_code || '',
                  account_holder_name: defaultBank?.account_holder_name || user?.name || '',
                  emi_auto_filled: false,
                  reason: '',
                });
                setShowCreatePayoutDialog(true);
              }}
              disabled={parseFloat(walletSummary.current_balance || '0') <= 0}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Payout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{parseFloat(walletSummary.current_balance || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-success">
                  ₹{parseFloat(walletSummary.total_earned || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{parseFloat(walletSummary.total_withdrawn || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Payouts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingPayouts || isFetching}
            title="Refresh payouts"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(isLoadingPayouts || isFetching) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Payouts</CardTitle>
              <CardDescription>Complete history of all payout transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPayouts ? (
                <div className="text-center py-12">
                  <LoadingSpinner text="Loading payouts..." size="md" />
                </div>
              ) : payoutsError ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <p className="text-muted-foreground mb-4">Failed to load payouts. Please try again.</p>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : filteredPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No payout history available</p>
                </div>
              ) : (
                <>
                  {activePayoutsData?.payouts?.count !== undefined && (
                    <div className="text-sm text-muted-foreground mb-4">
                      Showing {filteredPayouts.length} of {activePayoutsData.payouts.count} payouts
                      {activePayoutsData.payouts.total_pages && activePayoutsData.payouts.total_pages > 1 && (
                        <span className="ml-2">
                          (Page {activePayoutsData.payouts.page || 1} of {activePayoutsData.payouts.total_pages})
                        </span>
                      )}
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>TDS</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(payout.type)}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payout.description}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{payout.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-warning">
                          {payout.tds ? `₹${payout.tds.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-success">
                          ₹{(payout.netAmount || payout.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payout.status as PayoutStatus | 'rejected')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
              <CardDescription>Payouts awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPayouts ? (
                <div className="text-center py-12">
                  <LoadingSpinner text="Loading payouts..." size="md" />
                </div>
              ) : pendingPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                  <p className="text-muted-foreground">No pending payouts</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(payout.type)}</Badge>
                        </TableCell>
                        <TableCell>{payout.description}</TableCell>
                        <TableCell className="font-semibold">
                          ₹{payout.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Payouts</CardTitle>
              <CardDescription>Successfully processed payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPayouts ? (
                <div className="text-center py-12">
                  <LoadingSpinner text="Loading payouts..." size="md" />
                </div>
              ) : completedPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No completed payouts yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Processed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(payout.type)}</Badge>
                        </TableCell>
                        <TableCell>{payout.description}</TableCell>
                        <TableCell className="font-semibold text-success">
                          ₹{(payout.netAmount || payout.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {payout.processedAt 
                            ? new Date(payout.processedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Payout Dialog */}
      <Dialog open={showCreatePayoutDialog} onOpenChange={setShowCreatePayoutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payout Request</DialogTitle>
            <DialogDescription>
              Request a payout from your wallet balance. Bank details will be used for the transfer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Available Balance Info */}
            {walletSummary && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{parseFloat(walletSummary.current_balance || '0').toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {/* Requested Amount */}
            <div className="space-y-2">
              <Label htmlFor="requested_amount">
                Requested Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="requested_amount"
                type="number"
                min="1"
                max={walletSummary ? parseFloat(walletSummary.current_balance || '0') : undefined}
                step="0.01"
                placeholder="Enter amount"
                value={payoutForm.requested_amount || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setPayoutForm(prev => ({ ...prev, requested_amount: value }));
                }}
              />
              {walletSummary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const maxAmount = parseFloat(walletSummary.current_balance || '0');
                    setPayoutForm(prev => ({ ...prev, requested_amount: maxAmount }));
                  }}
                  className="mt-1"
                >
                  Use Full Balance
                </Button>
              )}
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h4 className="font-medium">Bank Details</h4>
              
              {/* Bank Account Selection Dropdown (if multiple accounts) */}
              {bankDetails.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="bank_account_select">
                    Select Bank Account <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedBankIndex.toString()}
                    onValueChange={(value) => {
                      const index = parseInt(value, 10);
                      const selectedBank = bankDetails[index];
                      if (selectedBank) {
                        setSelectedBankIndex(index);
                        setPayoutForm(prev => ({
                          ...prev,
                          bank_name: selectedBank.bank_name,
                          account_number: selectedBank.account_number,
                          ifsc_code: selectedBank.ifsc_code,
                          account_holder_name: selectedBank.account_holder_name,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger id="bank_account_select">
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankDetails.map((bank, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {bank.bank_name} - {bank.account_number.slice(-4)} ({bank.account_holder_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {bankDetails.length === 1 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Using saved bank account</p>
                  <p className="text-sm font-medium">
                    {bankDetails[0].bank_name} - {bankDetails[0].account_number.slice(-4)}
                  </p>
                </div>
              )}

              {bankDetails.length === 0 && (
                <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm text-warning">
                    No saved bank accounts found. Please enter your bank details manually.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="bank_name">
                  Bank Name <span className="text-destructive">*</span>
                </Label>
                  <Input
                  id="bank_name"
                  placeholder="e.g., State Bank of India"
                  value={payoutForm.bank_name}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, bank_name: e.target.value }))}
                  disabled={bankDetails.length > 0}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                    <Input
                    id="account_number"
                    placeholder="1234567890"
                    value={payoutForm.account_number}
                    onChange={(e) => setPayoutForm(prev => ({ ...prev, account_number: e.target.value }))}
                    disabled={bankDetails.length > 0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc_code">
                    IFSC Code <span className="text-destructive">*</span>
                  </Label>
                    <Input
                    id="ifsc_code"
                    placeholder="SBIN0001234"
                    value={payoutForm.ifsc_code}
                    onChange={(e) => setPayoutForm(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
                    className="uppercase"
                    disabled={bankDetails.length > 0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_holder_name">
                  Account Holder Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="account_holder_name"
                  placeholder="John Doe"
                  value={payoutForm.account_holder_name}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, account_holder_name: e.target.value }))}
                  disabled={bankDetails.length > 0}
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emi_auto_filled"
                  checked={payoutForm.emi_auto_filled || false}
                  onCheckedChange={(checked) => 
                    setPayoutForm(prev => ({ ...prev, emi_auto_filled: checked as boolean }))
                  }
                />
                <Label htmlFor="emi_auto_filled" className="cursor-pointer">
                  Auto-fill EMI from payout
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Need funds for emergency expenses"
                  value={payoutForm.reason || ''}
                  onChange={(e) => setPayoutForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreatePayoutDialog(false);
                setSelectedBankIndex(0);
                const defaultBank = bankDetails.length > 0 ? bankDetails[0] : null;
                setPayoutForm({
                  requested_amount: 0,
                  bank_name: defaultBank?.bank_name || '',
                  account_number: defaultBank?.account_number || '',
                  ifsc_code: defaultBank?.ifsc_code || '',
                  account_holder_name: defaultBank?.account_holder_name || user?.name || '',
                  emi_auto_filled: false,
                  reason: '',
                });
              }}
              disabled={isCreatingPayout}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Validation
                if (!payoutForm.requested_amount || payoutForm.requested_amount <= 0) {
                  toast.error('Please enter a valid amount');
                  return;
                }
                if (walletSummary && payoutForm.requested_amount > parseFloat(walletSummary.current_balance || '0')) {
                  toast.error('Requested amount cannot exceed available balance');
                  return;
                }
                if (!payoutForm.bank_name || !payoutForm.account_number || !payoutForm.ifsc_code || !payoutForm.account_holder_name) {
                  toast.error('Please fill in all required bank details');
                  return;
                }

                try {
                  const result = await createPayout(payoutForm).unwrap();
                  toast.success(result.message || 'Payout request created successfully!');
                  setShowCreatePayoutDialog(false);
                  setSelectedBankIndex(0);
                  const defaultBank = bankDetails.length > 0 ? bankDetails[0] : null;
                  setPayoutForm({
                    requested_amount: 0,
                    bank_name: defaultBank?.bank_name || '',
                    account_number: defaultBank?.account_number || '',
                    ifsc_code: defaultBank?.ifsc_code || '',
                    account_holder_name: defaultBank?.account_holder_name || user?.name || '',
                    emi_auto_filled: false,
                    reason: '',
                  });
                  // Refresh payouts list
                  await refetch();
                } catch (error: any) {
                  const errorMessage = error?.data?.message || error?.data?.detail || 'Failed to create payout request';
                  toast.error(errorMessage);
                }
              }}
              disabled={isCreatingPayout}
            >
              {isCreatingPayout ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Payout Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

