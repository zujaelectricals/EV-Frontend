import { motion } from 'framer-motion';
import { Settings, Save, AlertCircle, Loader2, Info } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/app/api/settingsApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Info button component for settings
const InfoButton = ({ info }: { info: string }) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="ml-1.5 inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        <p>{info}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

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
        toast.error('TDS threshold cannot be negative');
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
        toast.error('Daily Total Partner Framework limit must be at least 1');
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
        toast.error('Company ASA code must be between 3 and 20 characters');
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
            <h1 className="text-3xl font-bold text-foreground">Total Partner Framework</h1>
            <p className="text-muted-foreground mt-1">Configure Total Partner Framework matching rules and parameters</p>
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
          <h1 className="text-3xl font-bold text-foreground">Total Partner Framework</h1>
          <p className="text-muted-foreground mt-1">Configure Total Partner Framework matching rules and parameters</p>
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
                <span className="text-sm font-medium">Total Partner Framework Commission</span>
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
                <span className="text-sm font-medium">Daily Total Partner Framework Limit</span>
              </div>
              <p className="text-lg font-bold">{formData.binary_daily_pair_limit} Total Partner Framework</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* ASA(Authorized Sales Associate) Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>ASA(Authorized Sales Associate) Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label htmlFor="auto_approve">Auto-Approve ASA Applications</Label>
              <InfoButton info="When enabled, new ASA (Authorized Sales Associate) applications are automatically approved without requiring manual admin or staff review. When disabled, each application must be manually reviewed and approved by an admin or staff member before the applicant becomes an active ASA." />
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
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="booking_timeout">Booking Reservation Timeout (minutes)</Label>
                <InfoButton info="Sets the time limit (in minutes) for how long a booking reservation remains valid before it automatically expires. If left empty or set to null, the reservation never expires and remains active indefinitely until manually processed or cancelled." />
              </div>
              <Input
                id="booking_timeout"
                type="text"
                inputMode="numeric"
                placeholder="Leave empty for no timeout"
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="direct_commission">Direct User Commission Amount (₹)</Label>
                <InfoButton info="The commission amount (in rupees) paid to an ASA for each direct referral before their binary commission is activated. This is the initial commission earned per direct user signup before the ASA reaches the activation threshold." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="activation_amount">Activation Amount (₹)</Label>
                <InfoButton info="The minimum payment amount required per booking for senior ASAs (upline) to earn commission. If a booking payment is less than this amount, no commission is credited to seniors, but the user is still counted in the descendant calculation for the binary tree. When a booking is cancelled, this amount is withheld and can be used for future point redemption." />
              </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Binary Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Binary Commission Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="activation_count">Binary Activation Count (users)</Label>
                <InfoButton info="The number of direct referrals an ASA must have before their binary commission system becomes active. Until this threshold is reached, the ASA earns direct commission only. Once activated, they start earning from the Total Partner Framework matching system." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="pair_commission">Total Partner Framework Commission Amount (₹)</Label>
                <InfoButton info="The commission amount (in rupees) earned by an ASA for each successful Total Partner Framework match in the binary tree. A Total Partner Framework match occurs when there is at least one new member on both the left and right legs of the binary tree. This commission is earned after the binary activation threshold is met." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="daily_limit">Daily Total Partner Framework Limit</Label>
                <InfoButton info="The maximum number of Total Partner Framework matches an ASA can earn commission for in a single day. This limit helps control daily payouts and prevents excessive earnings. Any Total Partner Framework matches beyond this limit are carried forward or not counted for that day." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="max_earnings_before_active_buyer">Max Earnings Before Active Buyer</Label>
                <InfoButton info="The maximum number of Total Partner Framework matches a non-Active Buyer ASA can earn commission for. Once this limit is reached, additional Total Partner Framework matches are blocked until the ASA becomes an Active Buyer (by making their own purchase). This encourages ASAs to become customers themselves." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="default_side">Default Tree Placement Side</Label>
                <InfoButton info="Determines which side of the binary tree new users are placed by default when no specific placement preference is given. 'Left Side' places new users on the left leg first, while 'Right Side' places them on the right leg first. This affects the automatic spillover placement in the binary tree structure." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="initial_bonus">Binary Commission Initial Bonus (₹)</Label>
                <InfoButton info="A one-time bonus amount (in rupees) credited to the user's wallet and total earnings when their binary commission is first activated (after reaching the required number of direct referrals). TDS is deducted from this bonus amount, but TDS is NOT deducted from the booking balance portion." />
              </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TDS & Deduction Settings */}
      <Card>
        <CardHeader>
          <CardTitle>TDS & Deduction Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="tds_percentage">Binary Commission TDS Percentage (%)</Label>
                <InfoButton info="The Tax Deducted at Source (TDS) percentage applied to ALL binary commissions earned by ASAs. This percentage is automatically deducted from each commission payment before crediting to the user's wallet. Valid range is 0-100%." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="tds_threshold">TDS Threshold Total Partner Framework</Label>
                <InfoButton info="The number of Total Partner Framework matches an ASA can earn after activation before the extra deduction percentage kicks in. For example, if set to 5, the first 5 Total Partner Framework matches after activation have only TDS deducted, while the 6th match onwards will have both TDS and the extra deduction applied." />
              </div>
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="extra_deduction">Extra Deduction Percentage (%)</Label>
                <InfoButton info="An additional percentage deducted from binary commissions after the TDS threshold is exceeded. This extra deduction is applied on top of the regular TDS percentage for Total Partner Framework matches beyond the threshold. Valid range is 0-100%." />
              </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-between md:col-span-2">
              <div className="flex items-center">
                <Label htmlFor="payout_approval">Payout Approval Required</Label>
                <InfoButton info="When enabled, all payout/withdrawal requests from ASAs require manual approval by an admin before being processed. When disabled, payouts are automatically processed and transferred without admin intervention. Enable this for better control over fund disbursement." />
              </div>
              <Switch
                id="payout_approval"
                checked={formData.payout_approval_needed}
                onCheckedChange={(checked) => handleChange('payout_approval_needed', checked)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="payout_tds">Payout TDS Percentage (%)</Label>
                <InfoButton info="The Tax Deducted at Source (TDS) percentage applied specifically to payout withdrawals. This is separate from the binary commission TDS and is deducted when an ASA withdraws funds from their wallet. Set to 0 for no additional TDS on withdrawals. Valid range is 0-100%." />
              </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="company_referral_code">Company ASA Code</Label>
                <InfoButton info="A static referral code representing the company itself. This code is used for the very first booking in the system when there is no referring ASA. It serves as the root of the referral tree. Must be between 3-20 characters." />
              </div>
              <Input
                id="company_referral_code"
                type="text"
                placeholder="Enter company ASA code"
                value={formData.company_referral_code || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange('company_referral_code', val);
                }}
                maxLength={20}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
