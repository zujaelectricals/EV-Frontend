import { motion } from "framer-motion";
import { History, GitBranch, DollarSign, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetPairHistoryQuery,
  useGetBinaryStatsQuery,
} from "@/app/api/binaryApi";
import { useAppSelector } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/shared/components/StatsCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const PairMatchingHistory = () => {
  const { user } = useAppSelector((state) => state.auth);
  const distributorId = user?.id || "";
  const { data: pairHistory = [], isLoading } = useGetPairHistoryQuery();
  const { data: binaryStats } = useGetBinaryStatsQuery(distributorId, {
    skip: !distributorId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading pair history..." size="md" />
      </div>
    );
  }

  const getStatusBadge = (index: number, totalPairs: number) => {
    if (index < totalPairs) {
      return <Badge className="bg-success text-white">Matched</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Team Matching History
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all your team matches and commissions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Team Matches"
          value={`${binaryStats?.totalPairs || 0}/${
            binaryStats?.maxPairs || 10
          }`}
          icon={GitBranch}
          variant="primary"
        />
        <StatsCard
          title="Total Commission"
          value={`₹${((binaryStats?.totalPairs || 0) * 2000).toLocaleString()}`}
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="TDS Deducted"
          value={`₹${(binaryStats?.tdsDeducted || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="warning"
        />
        <StatsCard
          title="Pool Money"
          value={`₹${(binaryStats?.poolMoney || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="info"
        />
      </div>

      {/* Pair History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Matching Details</CardTitle>
          <CardDescription>
            Complete history of all team matches and commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pairHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pair matches yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start referring users to both sides of your network to create
                team matches
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match #</TableHead>
                  <TableHead>RSA PV</TableHead>
                  <TableHead>RSB PV</TableHead>
                  <TableHead>Matched PV</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Pool Money</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Matched Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairHistory.map((pair, index) => (
                  <TableRow key={pair.id}>
                    <TableCell className="font-medium">
                      Team Match #{index + 1}
                    </TableCell>
                    <TableCell>₹{pair.leftPV.toLocaleString()}</TableCell>
                    <TableCell>₹{pair.rightPV.toLocaleString()}</TableCell>
                    <TableCell>₹{pair.matchedPV.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-success">
                      ₹{pair.commission.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-warning">
                      ₹{pair.tds.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-info">
                      ₹{pair.poolMoney.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{pair.netAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(pair.matchedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(index, binaryStats?.totalPairs || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Commission Summary */}
      {pairHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Commission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Gross Commission
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{((binaryStats?.totalPairs || 0) * 2000).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Before deductions
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Net Earnings</p>
                <p className="text-2xl font-bold text-success">
                  ₹{((binaryStats?.totalPairs || 0) * 1400).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  After TDS and pool money
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
