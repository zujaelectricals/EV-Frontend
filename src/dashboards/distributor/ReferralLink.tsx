import { motion } from 'framer-motion';
import { Link as LinkIcon, Copy, Share2, QrCode, Mail, MessageSquare, MessageCircle, Share } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const ReferralLink = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorInfo = user?.distributorInfo;
  
  const referralCode = distributorInfo?.referralCode || user?.id?.slice(0, 8).toUpperCase() || 'N/A';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
  const referralMessage = `Join Zuja Electric and get amazing deals on electric vehicles! Use my referral code: ${referralCode}. Register here: ${referralLink}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(referralMessage)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Join Zuja Electric - Referral Invitation';
    const body = referralMessage;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(referralMessage)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Referral Link</h1>
        <p className="text-muted-foreground mt-1">Share your referral link and earn commissions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends and family to earn referral bonuses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Referral Link</Label>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyReferralLink} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Referral Code</Label>
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="font-mono text-lg font-bold text-center"
                />
                <Button onClick={copyReferralCode} size="icon" variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Share Via</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={shareViaWhatsApp} variant="outline" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                  WhatsApp
                </Button>
                <Button onClick={shareViaEmail} variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button onClick={shareViaFacebook} variant="outline" className="w-full">
                  <Share className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Button>
                <Button onClick={shareViaTwitter} variant="outline" className="w-full">
                  <Share className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Statistics</CardTitle>
            <CardDescription>Track your referral performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">
                  {distributorInfo?.totalReferrals || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Revenue Stream A (RSA) Count</p>
                <p className="text-2xl font-bold text-primary">
                  {distributorInfo?.leftCount || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Revenue Stream B (RSB) Count</p>
                <p className="text-2xl font-bold text-primary">
                  {distributorInfo?.rightCount || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Binary Status</p>
                <Badge className={distributorInfo?.binaryActivated ? 'bg-success' : 'bg-muted'}>
                  {distributorInfo?.binaryActivated ? 'Enabled' : 'Not Enabled'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Referral Bonus</p>
              <p className="text-lg font-semibold text-foreground">
                ₹1,000 per referral (after 10% TDS)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Earn ₹1,000 for each person who pre-books using your referral code
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
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
                <h4 className="font-semibold">Share Your Link</h4>
                <p className="text-sm text-muted-foreground">
                  Share your referral link or code with friends and family
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
                  When someone pre-books an EV using your referral code with at least ₹5,000
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
      </Card>
    </div>
  );
};

