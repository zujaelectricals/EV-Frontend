import { motion } from 'framer-motion';
import { Settings, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/app/api/settingsApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export const PairRules = () => {
  // Fetch current settings
  const { data: settings, isLoading, error, refetch } = useGetSettingsQuery();

  // Update mutation
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  // Form state
  const [formData, setFormData] = useState({
    booking_reservation_timeout_minutes: 1440,
    direct_user_commission_amount: 1000,
    binary_commission_activation_count: 3,
    binary_pair_commission_amount: 2000,
    binary_tds_threshold_pairs: 5,
    binary_commission_tds_percentage: 20,
    binary_extra_deduction_percentage: 20,
    binary_daily_pair_limit: 10,
    max_earnings_before_active_buyer: 5,
    binary_commission_initial_bonus: 0,
    binary_tree_default_placement_side: 'left' as 'left' | 'right',
    activation_amount: 5000,
    distributor_application_auto_approve: true,
    payout_approval_needed: true,
    payout_tds_percentage: 0,
    company_referral_code: 'COMPANY',
  });

  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false);

  // Populate form when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        booking_reservation_timeout_minutes: settings.booking_reservation_timeout_minutes ?? 1440,
        direct_user_commission_amount: settings.direct_user_commission_amount ?? 1000,
        binary_commission_activation_count: settings.binary_commission_activation_count ?? 3,
        binary_pair_commission_amount: settings.binary_pair_commission_amount ?? 2000,
        binary_tds_threshold_pairs: settings.binary_tds_threshold_pairs ?? 5,
        binary_commission_tds_percentage: settings.binary_commission_tds_percentage ?? 20,
        binary_extra_deduction_percentage: settings.binary_extra_deduction_percentage ?? 20,
        binary_daily_pair_limit: settings.binary_daily_pair_limit ?? 10,
        max_earnings_before_active_buyer: settings.max_earnings_before_active_buyer ?? 5,
        binary_commission_initial_bonus: settings.binary_commission_initial_bonus ?? 0,
        binary_tree_default_placement_side: settings.binary_tree_default_placement_side ?? 'left',
        activation_amount: settings.activation_amount ?? 5000,
        distributor_application_auto_approve: settings.distributor_application_auto_approve ?? true,
        payout_approval_needed: settings.payout_approval_needed ?? true,
        payout_tds_percentage: settings.payout_tds_percentage ?? 0,
        company_referral_code: settings.company_referral_code ?? 'COMPANY',
      });
      setIsDirty(false);
    }
  }, [settings]);

  // Handle input changes
  const handleChange = (field: keyof typeof formData, value: number | string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };


  // Handle save
  const handleSave = async () => {
    try {
      // Validate form data
      if (formData.binary_commission_activation_count < 1) {
        toast.error('Binary activation count must be at least 1');
        return;
      }
      if (formData.binary_tds_threshold_pairs < 0) {
        toast.error('TDS threshold pairs cannot be negative');
        return;
      }
      if (formData.binary_commission_tds_percentage < 0 || formData.binary_commission_tds_percentage > 100) {
        toast.error('TDS percentage must be between 0 and 100');
        return;
      }
      if (formData.binary_extra_deduction_percentage < 0 || formData.binary_extra_deduction_percentage > 100) {
        toast.error('Extra deduction percentage must be between 0 and 100');
        return;
      }
      if (formData.binary_daily_pair_limit < 1) {
        toast.error('Daily pair limit must be at least 1');
        return;
      }
      if (formData.max_earnings_before_active_buyer < 1) {
        toast.error('Max earnings before active buyer must be at least 1');
        return;
      }
      if (formData.activation_amount < 0) {
        toast.error('Activation amount cannot be negative');
        return;
      }
      if (formData.payout_tds_percentage < 0 || formData.payout_tds_percentage > 100) {
        toast.error('Payout TDS percentage must be between 0 and 100');
        return;
      }
      if (!formData.company_referral_code || formData.company_referral_code.length < 3 || formData.company_referral_code.length > 20) {
        toast.error('Company referral code must be between 3 and 20 characters');
        return;
      }

      await updateSettings(formData).unwrap();
      toast.success('Settings updated successfully');
      setIsDirty(false);
      refetch();
    } catch (err: unknown) {
      console.error('Failed to update settings:', err);
      const errorMessage = err && typeof err === 'object' && 'data' in err && 
        typeof err.data === 'object' && err.data !== null && 'message' in err.data &&
        typeof err.data.message === 'string' 
        ? err.data.message 
        : 'Failed to update settings';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold text-foreground">Pair Rules</h1>
            <p className="text-muted-foreground mt-1">Configure binary pair matching rules and parameters</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load settings. Please try again.</p>
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
          <h1 className="text-3xl font-bold text-foreground">Pair Rules</h1>
          <p className="text-muted-foreground mt-1">Configure binary pair matching rules and parameters</p>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Activation Required</span>
              </div>
              <p className="text-lg font-bold">{formData.binary_commission_activation_count} Users</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Pair Commission</span>
              </div>
              <p className="text-lg font-bold">₹{formData.binary_pair_commission_amount}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-info" />
                <span className="text-sm font-medium">Daily Pair Limit</span>
              </div>
              <p className="text-lg font-bold">{formData.binary_daily_pair_limit} Pairs</p>
            </motion.div>
          </div>
        </CardContent>
      </Card> 
      {/* ASA(Authorized Sales Associate) Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>ASA(Authorized Sales Associate) Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_approve">Auto-Approve ASA(Authorized Sales Associate) Applications</Label>
              <p className="text-xs text-muted-foreground">
                If enabled, ASA(Authorized Sales Associate) applications will be automatically approved. If disabled, admin/staff approval is required.
              </p>
            </div>
            <Switch
              id="auto_approve"
              checked={formData.distributor_application_auto_approve}
              onCheckedChange={(checked) => handleChange('distributor_application_auto_approve', checked)}
            />
          </div>
        </CardContent>
      </Card>
      {/* Booking & Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Booking & Direct Commission Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="booking_timeout">
                Booking Reservation Timeout (minutes)
                <span className="text-xs text-muted-foreground ml-2">Leave empty for no timeout</span>
              </Label>
              <Input
                id="booking_timeout"
                type="text"
                inputMode="numeric"
                placeholder="Enter minutes or leave empty"
                value={formData.booking_reservation_timeout_minutes ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    handleChange('booking_reservation_timeout_minutes', null);
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && isFinite(num) && num >= 0) {
                    handleChange('booking_reservation_timeout_minutes', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange('booking_reservation_timeout_minutes', null);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Time before booking reservation expires (null = never expires)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direct_commission">Direct User Commission Amount (₹)</Label>
              <Input
                id="direct_commission"
                type="text"
                inputMode="decimal"
                value={formData.direct_user_commission_amount === 0 ? '' : formData.direct_user_commission_amount || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val === '.') {
                    setFormData(prev => ({ ...prev, direct_user_commission_amount: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseFloat(val);
                  if (!isNaN(num) && isFinite(num)) {
                    handleChange('direct_user_commission_amount', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === '.') {
                    handleChange('direct_user_commission_amount', 1000);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Commission per direct user before binary activation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activation_amount">Activation Amount (₹)</Label>
              <Input
                id="activation_amount"
                type="text"
                inputMode="decimal"
                value={formData.activation_amount === 0 ? '' : formData.activation_amount || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val === '.') {
                    setFormData(prev => ({ ...prev, activation_amount: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseFloat(val);
                  if (!isNaN(num) && isFinite(num)) {
                    handleChange('activation_amount', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === '.') {
                    handleChange('activation_amount', 5000);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Minimum payment amount per booking required for seniors to earn commission. If payment is less than this amount, no commission is credited, but user is still counted in descendants calculation. On cancellation, this amount is withheld for future point redemption (min: 0)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Binary Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Binary Commission Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activation_count">Binary Activation Count (users)</Label>
              <Input
                id="activation_count"
                type="text"
                inputMode="numeric"
                value={formData.binary_commission_activation_count === 0 ? '' : formData.binary_commission_activation_count || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData(prev => ({ ...prev, binary_commission_activation_count: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && isFinite(num) && num >= 1) {
                    handleChange('binary_commission_activation_count', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange('binary_commission_activation_count', 3);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Number of direct users needed to activate binary commission (min: 1)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pair_commission">Binary Pair Commission Amount (₹)</Label>
              <Input
                id="pair_commission"
                type="text"
                inputMode="decimal"
                value={formData.binary_pair_commission_amount === 0 ? '' : formData.binary_pair_commission_amount || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val === '.') {
                    setFormData(prev => ({ ...prev, binary_pair_commission_amount: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseFloat(val);
                  if (!isNaN(num) && isFinite(num)) {
                    handleChange('binary_pair_commission_amount', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === '.') {
                    handleChange('binary_pair_commission_amount', 2000);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Commission per binary pair after activation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_limit">Daily Pair Limit (pairs)</Label>
              <Input
                id="daily_limit"
                type="text"
                inputMode="numeric"
                value={formData.binary_daily_pair_limit === 0 ? '' : formData.binary_daily_pair_limit || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData(prev => ({ ...prev, binary_daily_pair_limit: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && isFinite(num) && num >= 1) {
                    handleChange('binary_daily_pair_limit', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange('binary_daily_pair_limit', 10);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Maximum binary pairs per day after activation (min: 1)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_earnings_before_active_buyer">Max Earnings Before Active Buyer (pairs)</Label>
              <Input
                id="max_earnings_before_active_buyer"
                type="text"
                inputMode="numeric"
                value={formData.max_earnings_before_active_buyer === 0 ? '' : formData.max_earnings_before_active_buyer || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData(prev => ({ ...prev, max_earnings_before_active_buyer: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && isFinite(num) && num >= 1) {
                    handleChange('max_earnings_before_active_buyer', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange('max_earnings_before_active_buyer', 5);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of binary pairs non-Active Buyer ASA(Authorized Sales Associate) can earn commission for before becoming Active Buyer. 6th+ pairs are blocked until user becomes Active Buyer (default: 5, min: 1)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_side">Default Tree Placement Side</Label>
              <Select
                value={formData.binary_tree_default_placement_side}
                onValueChange={(value: 'left' | 'right') => handleChange('binary_tree_default_placement_side', value)}
              >
                <SelectTrigger id="default_side">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left Side</SelectItem>
                  <SelectItem value="right">Right Side</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default placement side for new users in binary tree
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_bonus">Binary Commission Initial Bonus (₹)</Label>
              <Input
                id="initial_bonus"
                type="text"
                inputMode="decimal"
                value={formData.binary_commission_initial_bonus === 0 ? '' : formData.binary_commission_initial_bonus || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || val === '.') {
                    setFormData(prev => ({ ...prev, binary_commission_initial_bonus: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseFloat(val);
                  if (!isNaN(num) && isFinite(num)) {
                    handleChange('binary_commission_initial_bonus', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || e.target.value === '.') {
                    handleChange('binary_commission_initial_bonus', 0);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Initial bonus amount (in rupees) credited to user's wallet and total_earnings when binary commission is activated (3 persons). TDS is deducted from this amount, but TDS is NOT deducted from booking balance (default: 0)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TDS & Deduction Settings */}
      <Card>
        <CardHeader>
          <CardTitle>TDS & Deduction Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tds_percentage">Binary Commission TDS Percentage (%)</Label>
              <Input
                id="tds_percentage"
                type="text"
                inputMode="numeric"
                value={formData.binary_commission_tds_percentage === 0 ? '' : formData.binary_commission_tds_percentage || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData(prev => ({ ...prev, binary_commission_tds_percentage: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && isFinite(num) && num >= 0 && num <= 100) {
                    handleChange('binary_commission_tds_percentage', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange('binary_commission_tds_percentage', 20);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                TDS percentage on ALL binary commissions (range: 0-100)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tds_threshold">TDS Threshold Pairs (pairs)</Label>
              <Input
                id="tds_threshold"
                type="text"
                inputMode="numeric"
                value={formData.binary_tds_threshold_pairs === 0 ? '' : formData.binary_tds_threshold_pairs || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData(prev => ({ ...prev, binary_tds_threshold_pairs: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && isFinite(num) && num >= 0) {
                    handleChange('binary_tds_threshold_pairs', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange('binary_tds_threshold_pairs', 5);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Number of pairs after activation before extra deduction starts (min: 0)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra_deduction">Extra Deduction Percentage (%)</Label>
              <Input
                id="extra_deduction"
                type="text"
                inputMode="numeric"
                value={formData.binary_extra_deduction_percentage === 0 ? '' : formData.binary_extra_deduction_percentage || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData(prev => ({ ...prev, binary_extra_deduction_percentage: 0 }));
                    setIsDirty(true);
                    return;
                  }
                  const num = parseInt(val, 10);
                  if (!isNaN(num) && isFinite(num) && num >= 0 && num <= 100) {
                    handleChange('binary_extra_deduction_percentage', num);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    handleChange('binary_extra_deduction_percentage', 20);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Extra deduction percentage on pairs beyond threshold (range: 0-100)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="payout_approval">Payout Approval Required</Label>
              <p className="text-xs text-muted-foreground">
                If enabled, payout requests require admin approval. If disabled, payouts are automatically processed upon creation.
              </p>
            </div>
            <Switch
              id="payout_approval"
              checked={formData.payout_approval_needed}
              onCheckedChange={(checked) => handleChange('payout_approval_needed', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payout_tds">Payout TDS Percentage (%)</Label>
            <Input
              id="payout_tds"
              type="text"
              inputMode="numeric"
              value={formData.payout_tds_percentage === 0 ? '' : formData.payout_tds_percentage || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setFormData(prev => ({ ...prev, payout_tds_percentage: 0 }));
                  setIsDirty(true);
                  return;
                }
                const num = parseInt(val, 10);
                if (!isNaN(num) && isFinite(num) && num >= 0 && num <= 100) {
                  handleChange('payout_tds_percentage', num);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  handleChange('payout_tds_percentage', 0);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              TDS percentage applied on payout withdrawals (default: 0, meaning no payout TDS, range: 0-100)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company_referral_code">Company Referral Code</Label>
            <Input
              id="company_referral_code"
              type="text"
              placeholder="Enter company referral code"
              value={formData.company_referral_code || ''}
              onChange={(e) => {
                const val = e.target.value;
                handleChange('company_referral_code', val);
              }}
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              Static referral code representing the company (used for first booking in the system, default: "COMPANY", min length: 3, max length: 20)
            </p>
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
};
