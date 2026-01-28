import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetComprehensiveReportsQuery } from '@/app/api/reportsApi';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

export const BVLogs = () => {
  // Server-side pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Build API params with server-side pagination and filtering
  const apiParams = {
    sections: 'bv_logs',
    bv_page: currentPage,
    bv_page_size: pageSize,
    ...(statusFilter !== 'all' && { bv_status: statusFilter }),
  };

  // Console log API params for debugging
  console.log('[BVLogs] API Params:', apiParams);

  const { data: reportsData, isLoading, isFetching, isError, error } = useGetComprehensiveReportsQuery(apiParams);
  
  // Console log API response
  console.log('[BVLogs] API Response:', { 
    pagination: reportsData?.bv_logs?.pagination,
    isLoading, 
    isFetching 
  });

  const bvData = reportsData?.bv_logs;
  const apiPagination = bvData?.pagination;
  
  // Calculate pagination values - use API values if available, otherwise estimate
  const totalItems = apiPagination?.total_items ?? 0;
  const totalPages = apiPagination?.total_pages ?? (Math.ceil(totalItems / pageSize) || 1);
  const hasNext = apiPagination?.has_next ?? (currentPage < totalPages);
  const hasPrevious = apiPagination?.has_previous ?? (currentPage > 1);
  const hasData = (bvData?.bv_type_summary?.length ?? 0) > 0;

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

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
            <h1 className="text-3xl font-bold text-foreground">BV Logs</h1>
            <p className="text-muted-foreground mt-1">Track Business Volume transactions and distributions</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
            <h1 className="text-3xl font-bold text-foreground">BV Logs</h1>
            <p className="text-muted-foreground mt-1">Track Business Volume transactions and distributions</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <XCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Failed to load BV data</p>
              <p className="text-sm text-muted-foreground mt-2">
                {(error as Error)?.message || 'Please try again later'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryCards = bvData?.summary_cards;
  const totalBVGenerated = summaryCards?.total_bv_generated || '0';
  const totalBVDistributed = summaryCards?.total_bv_distributed || '0';
  const totalBVUsed = summaryCards?.total_bv_used || '0';
  const activeBV = summaryCards?.active_bv || '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">BV Logs</h1>
          <p className="text-muted-foreground mt-1">Track Business Volume transactions and distributions</p>
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
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total BV Generated</p>
                  <p className="text-3xl font-bold text-success mt-1">₹{totalBVGenerated}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total BV Distributed</p>
                  <p className="text-3xl font-bold text-info mt-1">₹{totalBVDistributed}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total BV Used</p>
                  <p className="text-3xl font-bold text-warning mt-1">₹{totalBVUsed}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active BV</p>
                  <p className="text-3xl font-bold text-primary mt-1">₹{activeBV}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* BV Type Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>BV Type Summary</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Avg Amount</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!bvData?.bv_type_summary?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No BV data found
                    </TableCell>
                  </TableRow>
                ) : (
                  bvData.bv_type_summary.map((summary) => (
                    <TableRow key={summary.type}>
                      <TableCell>
                        <Badge variant="outline">{summary.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{summary.count}</TableCell>
                      <TableCell className="font-medium">₹{summary.total_amount}</TableCell>
                      <TableCell>₹{summary.avg_amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-success text-white">{summary.active}</Badge>
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

      {/* BV Source Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>BV Source Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!bvData?.bv_source_summary?.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No source data found
                    </TableCell>
                  </TableRow>
                ) : (
                  bvData.bv_source_summary.map((summary) => (
                    <TableRow key={summary.source}>
                      <TableCell className="font-medium capitalize">{summary.source}</TableCell>
                      <TableCell>{summary.count}</TableCell>
                      <TableCell className="font-medium">₹{summary.total_amount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${summary.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{summary.percentage}%</span>
                        </div>
                      </TableCell>
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
