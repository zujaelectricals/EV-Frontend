import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  Award,
  Users,
  BarChart3,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/shared/components/StatsCard";
import { TargetCard } from "./components/TargetCard";
import { TargetTrendsChart } from "./components/TargetTrendsChart";
import { EnhancedTarget } from "./types";
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subDays,
} from "date-fns";
import { cn } from "@/lib/utils";

type PeriodFilter = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

// Mock data - In real app, this would come from API
const mockTargets: EnhancedTarget[] = [
  {
    id: "1",
    label: "Sales Target",
    category: "sales",
    current: 45,
    target: 100,
    unit: "vehicles",
    period: "monthly",
    deadline: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    status: "on-track",
    progressHistory: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), "yyyy-MM-dd"),
      value: Math.floor((45 * (i + 1)) / 30),
    })),
    milestones: [
      { percentage: 25, reward: 1000 },
      { percentage: 50, reward: 2500 },
      { percentage: 75, reward: 5000 },
      { percentage: 100, reward: 10000 },
    ],
    dailyAverageRequired: 1.83,
    lastUpdated: new Date().toISOString(),
  },
  // {
  //   id: '2',
  //   label: 'Lead Generation',
  //   category: 'leads',
  //   current: 120,
  //   target: 150,
  //   unit: 'leads',
  //   period: 'monthly',
  //   deadline: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  //   status: 'on-track',
  //   progressHistory: Array.from({ length: 30 }, (_, i) => ({
  //     date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
  //     value: Math.floor(120 * (i + 1) / 30),
  //   })),
  //   milestones: [
  //     { percentage: 50, reward: 1500 },
  //     { percentage: 100, reward: 3000 },
  //   ],
  //   dailyAverageRequired: 1.0,
  //   lastUpdated: new Date().toISOString(),
  // },
  {
    id: "3",
    label: "Revenue Target",
    category: "revenue",
    current: 850000,
    target: 1000000,
    unit: "₹",
    period: "monthly",
    deadline: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    status: "at-risk",
    progressHistory: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), "yyyy-MM-dd"),
      value: Math.floor((850000 * (i + 1)) / 30),
    })),
    milestones: [
      { percentage: 50, reward: 5000 },
      { percentage: 75, reward: 7500 },
      { percentage: 100, reward: 15000 },
    ],
    dailyAverageRequired: 5000,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    label: "Distributor Verifications",
    category: "verifications",
    current: 28,
    target: 40,
    unit: "verifications",
    period: "monthly",
    deadline: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    status: "at-risk",
    progressHistory: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), "yyyy-MM-dd"),
      value: Math.floor((28 * (i + 1)) / 30),
    })),
    dailyAverageRequired: 0.4,
    lastUpdated: new Date().toISOString(),
  },
];

export const StaffTargets = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("monthly");

  // Filter targets based on period
  const filteredTargets = useMemo(() => {
    return mockTargets.filter((target) => target.period === periodFilter);
  }, [periodFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTargets = filteredTargets.length;
    const onTrack = filteredTargets.filter(
      (t) => t.status === "on-track" || t.status === "exceeded"
    ).length;
    const atRisk = filteredTargets.filter((t) => t.status === "at-risk").length;
    const achieved = filteredTargets.filter(
      (t) => t.current >= t.target
    ).length;
    const overallCompletion =
      (filteredTargets.reduce((sum, t) => sum + t.current / t.target, 0) /
        totalTargets) *
      100;
    const daysRemaining = Math.min(
      ...filteredTargets.map((t) =>
        differenceInDays(new Date(t.deadline), new Date())
      )
    );

    return {
      totalTargets,
      onTrack,
      atRisk,
      achieved,
      overallCompletion: overallCompletion.toFixed(1),
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    };
  }, [filteredTargets]);

  const getPeriodRange = () => {
    const now = new Date();
    switch (periodFilter) {
      case "daily":
        return format(now, "MMMM dd, yyyy");
      case "weekly": {
        const weekStart = subDays(now, now.getDay());
        const weekEnd = subDays(now, now.getDay() - 6);
        return `${format(weekStart, "MMM dd")} - ${format(
          weekEnd,
          "MMM dd, yyyy"
        )}`;
      }
      case "monthly":
        return format(now, "MMMM yyyy");
      case "quarterly": {
        const quarterStart = startOfQuarter(now);
        const quarterEnd = endOfQuarter(now);
        return `${format(quarterStart, "MMM dd")} - ${format(
          quarterEnd,
          "MMM dd, yyyy"
        )}`;
      }
      case "yearly":
        return format(now, "yyyy");
      default:
        return "";
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Targets</h1>
          <p className="text-muted-foreground mt-1">
            Track your performance against targets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{getPeriodRange()}</span>
          </div>
          <Select
            value={periodFilter}
            onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Statistics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        <motion.div variants={item} className="h-full">
          <StatsCard
            title="Overall Completion"
            value={`${summaryStats.overallCompletion}%`}
            icon={Target}
            variant="primary"
          />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <StatsCard
            title="On Track"
            value={summaryStats.onTrack}
            icon={CheckCircle2}
            variant="success"
            change={Number(
              (
                (summaryStats.onTrack / summaryStats.totalTargets) *
                100
              ).toFixed(0)
            )}
            trend="up"
          />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <StatsCard
            title="At Risk"
            value={summaryStats.atRisk}
            icon={AlertTriangle}
            variant="warning"
          />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <StatsCard
            title="Achieved"
            value={summaryStats.achieved}
            icon={Award}
            variant="info"
          />
        </motion.div>
        <motion.div variants={item} className="h-full">
          <StatsCard
            title="Days Remaining"
            value={summaryStats.daysRemaining}
            icon={Clock}
            variant={summaryStats.daysRemaining < 7 ? "warning" : "default"}
          />
        </motion.div>
      </motion.div>

      {/* Targets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTargets.map((target, index) => (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <TargetCard target={target} />
          </motion.div>
        ))}
      </div>

      {/* Tabs for Detailed Views */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">
            <BarChart3 className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <Users className="h-4 w-4 mr-2" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <Target className="h-4 w-4 mr-2" />
            Detailed Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <TargetTrendsChart targets={filteredTargets} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTargets.map((target) => {
                    const percentage = (target.current / target.target) * 100;
                    const teamAverage = percentage * 0.85; // Mock team average
                    const topPerformer = percentage * 1.15; // Mock top performer

                    return (
                      <div key={target.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{target.label}</span>
                          <span className="text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-20 text-xs text-muted-foreground">
                              You
                            </div>
                            <Progress
                              value={percentage}
                              className="flex-1 h-2"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 text-xs text-muted-foreground">
                              Team Avg
                            </div>
                            <Progress
                              value={teamAverage}
                              className="flex-1 h-2"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 text-xs text-muted-foreground">
                              Top
                            </div>
                            <Progress
                              value={topPerformer}
                              className="flex-1 h-2"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTargets
                    .filter(
                      (t) => t.status === "at-risk" || t.current < t.target
                    )
                    .map((target) => (
                      <div
                        key={target.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{target.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Need {target.dailyAverageRequired?.toLocaleString()}{" "}
                            {target.unit} daily to reach target
                          </p>
                        </div>
                      </div>
                    ))}
                  {filteredTargets.filter(
                    (t) => t.status === "at-risk" || t.current < t.target
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success opacity-50" />
                      <p>All targets are on track! Keep up the great work.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Target Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTargets.map((target) => {
                    const percentage = (target.current / target.target) * 100;
                    return (
                      <TableRow key={target.id}>
                        <TableCell className="font-medium">
                          {target.label}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{target.category}</Badge>
                        </TableCell>
                        <TableCell>{target.current.toLocaleString()}</TableCell>
                        <TableCell>{target.target.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-24 h-2" />
                            <span className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              target.status === "on-track" ||
                              target.status === "exceeded"
                                ? "default"
                                : target.status === "at-risk"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {target.status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(target.deadline), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
