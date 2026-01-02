import { motion } from 'framer-motion';
import { Landmark, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const PoolWalletController = () => {
  const poolTransactions = [
    { id: 1, distributor: 'John Doe', amount: 4000, type: 'deposit', date: '2024-01-15', status: 'completed' },
    { id: 2, distributor: 'Jane Smith', amount: 4000, type: 'deposit', date: '2024-01-14', status: 'completed' },
    { id: 3, distributor: 'Mike Johnson', amount: 2000, type: 'withdrawal', date: '2024-01-13', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pool Wallet Controller</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor pool money transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pool Money</CardTitle>
            <Landmark className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹24.5L</div>
            <p className="text-xs text-muted-foreground mt-1">Accumulated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹4.2L</div>
            <p className="text-xs text-success mt-1">+18% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">623</div>
            <p className="text-xs text-muted-foreground mt-1">With pool money</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹1.2L</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Pool Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poolTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{transaction.distributor}</h3>
                    <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                      {transaction.type}
                    </Badge>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Date: {transaction.date}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${transaction.type === 'deposit' ? 'text-success' : 'text-warning'}`}>
                    {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

