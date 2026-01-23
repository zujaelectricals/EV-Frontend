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
    binary_tree_default_placement_side: 'left' as 'left' | 'right',
    distributor_application_auto_approve: true,
  });

  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false);

  // Populate form when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        booking_reservation_timeout_minutes: settings.booking_reservation_timeout_minutes ?? 1440,
        direct_user_commission_amount: settings.direct_user_commission_amount,
        binary_commission_activation_count: settings.binary_commission_activation_count,
        binary_pair_commission_amount: settings.binary_pair_commission_amount,
        binary_tds_threshold_pairs: settings.binary_tds_threshold_pairs,
        binary_commission_tds_percentage: settings.binary_commission_tds_percentage,
        binary_extra_deduction_percentage: settings.binary_extra_deduction_percentage,
        binary_daily_pair_limit: settings.binary_daily_pair_limit,
        binary_tree_default_placement_side: settings.binary_tree_default_placement_side,
        distributor_application_auto_approve: settings.distributor_application_auto_approve ?? true,
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
      {/* Distributor Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Distributor Application Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_approve">Auto-Approve Distributor Applications</Label>
              <p className="text-xs text-muted-foreground">
                If enabled, distributor applications will be automatically approved. If disabled, admin/staff approval is required.
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
                type="number"
                min="0"
                placeholder="Enter minutes or leave empty"
                value={formData.booking_reservation_timeout_minutes ?? ''}
                onChange={(e) => handleChange('booking_reservation_timeout_minutes', e.target.value ? parseInt(e.target.value) : null)}
              />
              <p className="text-xs text-muted-foreground">
                Time before booking reservation expires (null = never expires)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direct_commission">Direct User Commission Amount (₹)</Label>
              <Input
                id="direct_commission"
                type="number"
                min="0"
                value={formData.direct_user_commission_amount}
                onChange={(e) => handleChange('direct_user_commission_amount', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Commission per direct user before binary activation
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
                type="number"
                min="1"
                value={formData.binary_commission_activation_count}
                onChange={(e) => handleChange('binary_commission_activation_count', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Number of direct users needed to activate binary commission (min: 1)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pair_commission">Binary Pair Commission Amount (₹)</Label>
              <Input
                id="pair_commission"
                type="number"
                min="0"
                value={formData.binary_pair_commission_amount}
                onChange={(e) => handleChange('binary_pair_commission_amount', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Commission per binary pair after activation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_limit">Daily Pair Limit (pairs)</Label>
              <Input
                id="daily_limit"
                type="number"
                min="1"
                value={formData.binary_daily_pair_limit}
                onChange={(e) => handleChange('binary_daily_pair_limit', parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum binary pairs per day after activation (min: 1)
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
                type="number"
                min="0"
                max="100"
                value={formData.binary_commission_tds_percentage}
                onChange={(e) => handleChange('binary_commission_tds_percentage', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                TDS percentage on ALL binary commissions (range: 0-100)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tds_threshold">TDS Threshold Pairs (pairs)</Label>
              <Input
                id="tds_threshold"
                type="number"
                min="0"
                value={formData.binary_tds_threshold_pairs}
                onChange={(e) => handleChange('binary_tds_threshold_pairs', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Number of pairs after activation before extra deduction starts (min: 0)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra_deduction">Extra Deduction Percentage (%)</Label>
              <Input
                id="extra_deduction"
                type="number"
                min="0"
                max="100"
                value={formData.binary_extra_deduction_percentage}
                onChange={(e) => handleChange('binary_extra_deduction_percentage', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Extra deduction percentage on pairs beyond threshold (range: 0-100)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      

      
    </div>
  );
};
