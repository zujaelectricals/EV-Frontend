import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { useGetBinaryStatsQuery } from '@/app/api/binaryApi';
import { StatsCard } from '@/shared/components/StatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const Earnings = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || '';
  const { data: binaryStats } = useGetBinaryStatsQuery(distributorId, { skip: !distributorId });
  const distributorInfo = user?.distributorInfo;

  // Calculate earnings breakdown - using totalEarnings from binaryStats (same as Team Network)
  const totalGross = binaryStats?.totalEarnings || 0;
  const totalTDS = binaryStats?.tdsDeducted || 0;
  const totalPool = binaryStats?.poolMoney || 0;
  const totalNet = totalGross - totalTDS - totalPool;
  
  // Breakdown components (for display purposes only - matches what's in totalEarnings)
  const activationBonus = binaryStats?.activationBonus || 0;
  const referralCommissionEarned = Math.min(distributorInfo?.totalReferrals || 0, 3) * 1000; // First 3 referrals only (as included in totalEarnings)
  const pairCommissionEarned = totalGross - referralCommissionEarned - activationBonus;
  
  const referralEarnings = referralCommissionEarned;
  const referralTDS = referralEarnings * 0.1;
  const referralNet = referralEarnings - referralTDS;
  
  const binaryEarnings = pairCommissionEarned;
  const binaryTDS = totalTDS - referralTDS;
  const binaryPool = totalPool;
  const binaryNet = binaryEarnings - binaryTDS - binaryPool;

  const earningsBreakdown = [
    {
      type: 'Referral Bonus',
      count: Math.min(distributorInfo?.totalReferrals || 0, 3),
      gross: referralEarnings,
      tds: referralTDS,
      pool: 0,
      net: referralNet,
      description: '₹1,000 per referral (first 3 referrals only, after 10% TDS)',
    },
    ...(activationBonus > 0 ? [{
      type: 'Account Enablement Bonus',
      count: 1,
      gross: activationBonus,
      tds: 0,
      pool: 0,
      net: activationBonus,
      description: '₹2,000 one-time bonus when Team Commission activates',
    }] : []),
    {
      type: 'Team Commission',
      count: binaryStats?.totalPairs || 0,
      gross: binaryEarnings,
      tds: binaryTDS,
      pool: binaryPool,
      net: binaryNet,
      description: `₹2,000 per team match (after TDS${binaryPool > 0 ? ' and reserve wallet' : ''}) - Max 10 pairs`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Earnings & Commissions</h1>
        <p className="text-muted-foreground mt-1">Track your complete earnings breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Gross Earnings"
          value={`₹${totalGross.toLocaleString()}`}
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title="Total TDS Deducted"
          value={`₹${totalTDS.toLocaleString()}`}
          icon={TrendingDown}
          variant="warning"
        />
        <StatsCard
          title="Reserve Wallet"
          value={`₹${totalPool.toLocaleString()}`}
          icon={Wallet}
          variant="info"
        />
        <StatsCard
          title="Net Earnings"
          value={`₹${totalNet.toLocaleString()}`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Earnings Breakdown</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {earningsBreakdown.map((earning, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{earning.type}</CardTitle>
                  <CardDescription>{earning.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Count:</span>
                      <span className="font-semibold">{earning.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gross:</span>
                      <span className="font-semibold">₹{earning.gross.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-warning">
                      <span className="text-sm">TDS (10%):</span>
                      <span>₹{earning.tds.toLocaleString()}</span>
                    </div>
                    {earning.pool > 0 && (
                      <div className="flex justify-between text-info">
                        <span className="text-sm">Reserve Wallet (20%):</span>
                        <span>₹{earning.pool.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold">Net Earnings:</span>
                        <span className="text-lg font-bold text-success">
                          ₹{earning.net.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Earnings</CardTitle>
              <CardDescription>Complete breakdown of all earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>TDS</TableHead>
                    <TableHead>Reserve Wallet</TableHead>
                    <TableHead>Net Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earningsBreakdown.map((earning, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{earning.type}</TableCell>
                      <TableCell>{earning.count}</TableCell>
                      <TableCell>₹{earning.gross.toLocaleString()}</TableCell>
                      <TableCell className="text-warning">
                        ₹{earning.tds.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-info">
                        ₹{earning.pool.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold text-success">
                        ₹{earning.net.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>
                      {(distributorInfo?.totalReferrals || 0) + (activationBonus > 0 ? 1 : 0) + (binaryStats?.totalPairs || 0)}
                    </TableCell>
                    <TableCell>₹{totalGross.toLocaleString()}</TableCell>
                    <TableCell className="text-warning">
                      ₹{totalTDS.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-info">
                      ₹{totalPool.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-success">
                      ₹{totalNet.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referral Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• ₹1,000 per successful referral</li>
              <li>• 10% TDS deduction (₹100)</li>
              <li>• Net: ₹900 per referral</li>
              <li>• Paid immediately after referral pre-books</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Activates after adding 3 users (not pairs) as referrals</li>
              <li>• ₹2,000 account enablement bonus (one-time)</li>
              <li>• ₹2,000 per team match commission (after account enablement)</li>
              <li>• Maximum 10 team matches (₹20,000 total)</li>
              <li>• 10% TDS deduction</li>
              <li>• ₹4,000 added to Reserve Wallet when reaching limit</li>
              <li>• Pairs beyond 10 are tracked but don't generate commission</li>
            </ul>
            {binaryStats?.pairsBeyondLimit && binaryStats.pairsBeyondLimit > 0 && (
              <div className="mt-3 p-2 bg-warning/10 rounded text-sm text-warning">
                <strong>Carry Forward:</strong> {binaryStats.pairsBeyondLimit} pair(s) beyond limit are being tracked
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

