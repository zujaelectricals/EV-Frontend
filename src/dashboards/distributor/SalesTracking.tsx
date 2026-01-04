import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/shared/components/StatsCard';

export const SalesTracking = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor your sales and referrals</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sales"
          value="₹0"
          icon={ShoppingCart}
          variant="primary"
        />
        <StatsCard
          title="This Month"
          value="₹0"
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Referrals"
          value="0"
          icon={Package}
          variant="info"
        />
        <StatsCard
          title="Commission Earned"
          value="₹0"
          icon={DollarSign}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
          <CardDescription>Track your sales performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Sales analytics coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

