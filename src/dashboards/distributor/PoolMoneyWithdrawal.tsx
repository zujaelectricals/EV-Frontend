import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle, XCircle, FileText, Car, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateDistributorInfo } from '@/app/slices/authSlice';
import { addPayout } from '@/app/slices/payoutSlice';
import { toast } from 'sonner';
import { useGetBinaryStatsQuery } from '@/app/api/binaryApi';
import { useSubmitWithdrawalRequestMutation, useGetUserWithdrawalRequestsQuery } from '@/app/api/poolWithdrawalApi';

type WithdrawalReason = 'vehicle_purchase' | 'emergency' | 'pf' | 'resignation' | 'other';

interface WithdrawalRequest {
  id: string;
  amount: number;
  reason: WithdrawalReason;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export function PoolMoneyWithdrawal() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || '';
  const { data: binaryStats } = useGetBinaryStatsQuery(distributorId, { skip: !distributorId });
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [reason, setReason] = useState<WithdrawalReason>('vehicle_purchase');
  const [description, setDescription] = useState('');
  const [submitWithdrawalRequest] = useSubmitWithdrawalRequestMutation();
  const { data: withdrawalHistory = [], refetch: refetchWithdrawals } = useGetUserWithdrawalRequestsQuery(distributorId, { skip: !distributorId });

  // Sync pool money from localStorage to Redux state and trigger calculation
  useEffect(() => {
    if (user?.id && binaryStats) {
      try {
        const authDataStr = localStorage.getItem('ev_nexus_auth_data');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          if (authData.user && authData.user.distributorInfo && 
              (authData.user.id === user.id || 
               authData.user.id?.startsWith(user.id) || 
               user.id.startsWith(authData.user.id))) {
            const storedPoolMoney = authData.user.distributorInfo.poolMoney || 0;
            const currentPoolMoney = user.distributorInfo?.poolMoney || 0;
            
            // Update Redux if localStorage has different value
            if (Math.abs(storedPoolMoney - currentPoolMoney) > 0.01) {
              dispatch(updateDistributorInfo({
                poolMoney: storedPoolMoney,
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error syncing pool money:', error);
      }
    }
  }, [user?.id, binaryStats, dispatch, user?.distributorInfo?.poolMoney]);

  // Use pool money from Redux state, fallback to binaryStats, then 0
  const poolMoney = user?.distributorInfo?.poolMoney ?? binaryStats?.poolMoney ?? 0;

  const reasonOptions = [
    { value: 'vehicle_purchase', label: 'Future Vehicle Purchase', icon: Car },
    { value: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { value: 'pf', label: 'Provident Fund (PF)', icon: Home },
    { value: 'resignation', label: 'Resignation', icon: FileText },
    { value: 'other', label: 'Other Valid Reason', icon: FileText },
  ];

  const handleWithdrawal = async () => {
    if (withdrawalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > poolMoney) {
      toast.error('Insufficient pool money balance');
      return;
    }

    if (!description.trim() && reason === 'other') {
      toast.error('Please provide a description for your withdrawal reason');
      return;
    }

    try {
      // Submit withdrawal request to centralized storage
      const result = await submitWithdrawalRequest({
        userId: distributorId,
        distributorId: distributorId,
        distributorName: user?.name || 'Distributor',
        amount: withdrawalAmount,
        reason,
        description,
      }).unwrap();

      if (result.success) {
        // Temporarily deduct pool money (will be finalized after admin approval)
        // If rejected, it will be restored
        dispatch(updateDistributorInfo({
          poolMoney: poolMoney - withdrawalAmount,
        }));

        // Create payout request
        dispatch(addPayout({
          id: result.request.id,
          amount: withdrawalAmount,
          type: 'pool',
          status: 'pending',
          description: `Pool money withdrawal: ${reasonOptions.find(r => r.value === reason)?.label}`,
          requestedAt: result.request.requestedAt,
        }));

        // Refetch withdrawal history
        refetchWithdrawals();

        toast.success('Withdrawal request submitted. Awaiting admin approval.');
        setShowWithdrawalModal(false);
        setWithdrawalAmount(0);
        setDescription('');
        setReason('vehicle_purchase');
      }
    } catch (error: any) {
      console.error('Error submitting withdrawal request:', error);
      toast.error(error?.data?.data || 'Failed to submit withdrawal request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/10 text-success border-success/30';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-warning/10 text-warning border-warning/30';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Reserve Wallet
          </CardTitle>
          <CardDescription>
            Your reserve wallet is 20% of your team commission earnings, saved for future use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Display */}
          <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Reserve Wallet</p>
                <p className="text-4xl font-bold text-primary">₹{poolMoney.toLocaleString()}</p>
              </div>
              <Wallet className="w-12 h-12 text-primary/50" />
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Reserve wallet can be withdrawn for: Future vehicle purchases, Emergencies, PF contributions, 
              Resignation, or other valid reasons. All withdrawals require admin approval.
            </AlertDescription>
          </Alert>

          {/* Withdraw Button */}
          <Button 
            onClick={() => setShowWithdrawalModal(true)} 
            className="w-full" 
            size="lg"
            disabled={poolMoney === 0}
          >
            Request Withdrawal
          </Button>

          {/* Withdrawal History */}
          {withdrawalHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Withdrawal History</h3>
              <div className="space-y-3">
                {withdrawalHistory.map((request: any) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg ${getStatusColor(request.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(request.status)}
                          <span className="font-semibold capitalize">{request.status}</span>
                        </div>
                        <p className="text-sm mb-1">
                          <strong>Amount:</strong> ₹{request.amount.toLocaleString()}
                        </p>
                        <p className="text-sm mb-1">
                          <strong>Reason:</strong> {reasonOptions.find(r => r.value === request.reason)?.label}
                        </p>
                        {request.description && (
                          <p className="text-sm mb-1">
                            <strong>Description:</strong> {request.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Requested: {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Modal */}
      <Dialog open={showWithdrawalModal} onOpenChange={setShowWithdrawalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Pool Money Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the amount and reason for withdrawal. All requests require admin approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                max={poolMoney}
                value={withdrawalAmount || ''}
                onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
              <p className="text-xs text-muted-foreground">
                Available: ₹{poolMoney.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Withdrawal Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as WithdrawalReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description {reason === 'other' && '*'}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your withdrawal request"
                rows={4}
                required={reason === 'other'}
              />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your withdrawal request will be reviewed by the admin team. 
                Processing typically takes 2-3 business days.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowWithdrawalModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleWithdrawal} className="flex-1" disabled={withdrawalAmount <= 0 || withdrawalAmount > poolMoney}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

