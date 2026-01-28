import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FileText,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetComprehensiveReportsQuery } from '@/app/api/reportsApi';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

export const ReferralCommission = () => {
  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Build API params with server-side pagination
  const apiParams = {
    sections: 'referral_commission',
    referral_page: currentPage,
    referral_page_size: pageSize,
  };

  // Console log API params for debugging
  console.log('[ReferralCommission] API Params:', apiParams);

  const { data: reportsData, isLoading, isFetching, isError, error } = useGetComprehensiveReportsQuery(apiParams);
  
  // Console log API response
  console.log('[ReferralCommission] API Response:', { 
    pagination: reportsData?.referral_commission?.pagination,
    isLoading, 
    isFetching 
  });

  const referralData = reportsData?.referral_commission;
  const apiPagination = referralData?.pagination;
  
  // Calculate pagination values - use API values if available, otherwise estimate
  const totalItems = apiPagination?.total_items ?? referralData?.summary_cards?.total_commissions ?? 0;
  const totalPages = apiPagination?.total_pages ?? (Math.ceil(totalItems / pageSize) || 1);
  const hasNext = apiPagination?.has_next ?? (currentPage < totalPages);
  const hasPrevious = apiPagination?.has_previous ?? (currentPage > 1);
  const hasData = (referralData?.top_referrer_performance?.length ?? 0) > 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referral Commission</h1>
            <p className="text-muted-foreground mt-1">Track referral commission payouts and trends</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Referral Commission</h1>
            <p className="text-muted-foreground mt-1">Track referral commission payouts and trends</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <XCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Failed to load referral commission data</p>
              <p className="text-sm text-muted-foreground mt-2">
                {(error as Error)?.message || 'Please try again later'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryCards = referralData?.summary_cards;
  const totalCommissions = summaryCards?.total_commissions || 0;
  const totalAmount = summaryCards?.total_amount || '0';
  const paidAmount = summaryCards?.paid_amount || '0';
  const pendingAmount = summaryCards?.pending_amount || '0';
  const avgCommission = summaryCards?.avg_commission || '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Commission</h1>
          <p className="text-muted-foreground mt-1">Track referral commission payouts and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalCommissions}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold text-success mt-1">₹{totalAmount}</p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                  <p className="text-3xl font-bold text-info mt-1">₹{paidAmount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹{pendingAmount}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Commission</p>
                  <p className="text-3xl font-bold text-primary mt-1">₹{avgCommission}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referrer Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Referrer Performance</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {isFetching && !isLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!referralData?.top_referrer_performance?.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No referrer data found
                    </TableCell>
                  </TableRow>
                ) : (
                  referralData.top_referrer_performance.map((perf) => (
                    <TableRow key={perf.referrer}>
                      <TableCell className="font-medium">{perf.referrer}</TableCell>
                      <TableCell>{perf.referrals}</TableCell>
                      <TableCell className="font-medium">₹{perf.total_amount}</TableCell>
                      <TableCell>₹{perf.tds}</TableCell>
                      <TableCell className="font-medium text-success">₹{perf.net_amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-success text-white">{perf.paid}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{perf.pending}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination - Always show */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing page {currentPage} of {totalPages} ({totalItems} total items)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevious || isFetching}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isFetching}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext || isFetching}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commission Status Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Commission Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!referralData?.commission_status_summary?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No status data found
                    </TableCell>
                  </TableRow>
                ) : (
                  referralData.commission_status_summary.map((summary) => (
                    <TableRow key={summary.status}>
                      <TableCell>
                        <Badge variant={summary.status === 'Completed' ? 'default' : 'outline'}>
                          {summary.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{summary.count}</TableCell>
                      <TableCell className="font-medium">₹{summary.total_amount}</TableCell>
                      <TableCell>₹{summary.tds}</TableCell>
                      <TableCell className="font-medium text-success">₹{summary.net_amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
