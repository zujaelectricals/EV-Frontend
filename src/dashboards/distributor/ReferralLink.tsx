import { useEffect } from 'react';
import { Link as LinkIcon, Copy, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { toast } from 'sonner';
import { useGetUserProfileQuery } from '@/app/api/userApi';
import { setCredentials } from '@/app/slices/authSlice';
import { Skeleton } from '@/components/ui/skeleton';

export const ReferralLink = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Fetch user profile to get referral_code from API
  const { data: profileData, isLoading, refetch } = useGetUserProfileQuery();
  
  // Update Redux state when profile data is fetched
  useEffect(() => {
    if (profileData) {
      console.log('📋 [REFERRAL LINK] Profile data received, updating Redux:', profileData);
      dispatch(setCredentials({ user: profileData }));
    }
  }, [profileData, dispatch]);
  
  // Use profileData if available, otherwise fallback to Redux user
  const currentUser = profileData || user;
  const distributorInfo = currentUser?.distributorInfo;
  
  // Get referral code from distributorInfo (populated from API's referral_code field)
  const referralCode = distributorInfo?.referralCode || 'N/A';

  const copyReferralCode = () => {
    if (referralCode !== 'N/A') {
      navigator.clipboard.writeText(referralCode);
      toast.success('ASA code copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ASA Code</h1>
          <p className="text-muted-foreground mt-1">Share your ASA code and earn commissions</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-8 w-8"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ASA Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Your ASA Code
            </CardTitle>
            <CardDescription>
              Share this code with friends and family to earn referral bonuses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ASA Code</Label>
              <div className="flex gap-2">
                {isLoading ? (
                  <Skeleton className="h-10 flex-1" />
                ) : (
                  <Input
                    value={referralCode}
                    readOnly
                    className="font-mono text-xl font-bold text-center tracking-wider"
                  />
                )}
                <Button onClick={copyReferralCode} size="icon" variant="outline" disabled={referralCode === 'N/A' || isLoading}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        <Card>
          <CardHeader>
            <CardTitle>ASA Statistics</CardTitle>
            <CardDescription>Track your referral performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Revenue Stream Left (RSL) Count</p>
                <p className="text-2xl font-bold text-primary">
                  {distributorInfo?.leftCount || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Revenue Stream Right (RSR) Count</p>
                <p className="text-2xl font-bold text-primary">
                  {distributorInfo?.rightCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      {/* <Card>
        <CardHeader>
          <CardTitle>How Referral System Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Share Your Code</h4>
                <p className="text-sm text-muted-foreground">
                  Share your ASA code with friends and family
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">They Pre-Book</h4>
                <p className="text-sm text-muted-foreground">
                  When someone pre-books an EV using your ASA code with at least ₹5,000
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">You Earn Commission</h4>
                <p className="text-sm text-muted-foreground">
                  You receive ₹1,000 referral bonus (₹900 after 10% TDS) for each successful referral
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Binary Account Enablement</h4>
                <p className="text-sm text-muted-foreground">
                  After 3 referrals, your binary system activates and you can earn pair commissions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

