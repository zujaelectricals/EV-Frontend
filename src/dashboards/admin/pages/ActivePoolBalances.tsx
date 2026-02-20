import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Landmark, DollarSign, Users, TrendingUp, Search, Filter, Download, Eye, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGetAllPoolBalancesQuery, useGetDistributorPoolDetailsQuery } from '@/app/api/poolBalancesApi';
import { format } from 'date-fns';

type SortField = 'distributorName' | 'poolBalance' | 'totalWithdrawals' | 'lastWithdrawalDate';
type SortDirection = 'asc' | 'desc';

export const ActivePoolBalances = () => {
  const { data: balances = [], isLoading } = useGetAllPoolBalancesQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [balanceRange, setBalanceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [sortField, setSortField] = useState<SortField>('poolBalance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: distributorDetails } = useGetDistributorPoolDetailsQuery(selectedDistributor || '', {
    skip: !selectedDistributor,
  });

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalPoolMoney = balances.reduce((sum, b) => sum + b.poolBalance, 0);
    const averageBalance = balances.length > 0 ? totalPoolMoney / balances.length : 0;
    const activeDistributors = balances.filter(b => b.status === 'active').length;
    const totalWithdrawals = balances.reduce((sum, b) => sum + b.totalWithdrawals, 0);
    return { totalPoolMoney, averageBalance, activeDistributors, totalWithdrawals };
  }, [balances]);

  // Filter and sort data
  const filteredAndSorted = useMemo(() => {
    let filtered = balances.filter((balance) => {
      // Search filter
      const matchesSearch = !searchTerm || 
        balance.distributorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balance.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balance.distributorId.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || balance.status === statusFilter;

      // Balance range filter
      const balanceValue = balance.poolBalance;
      const minBalance = balanceRange.min ? parseFloat(balanceRange.min) : 0;
      const maxBalance = balanceRange.max ? parseFloat(balanceRange.max) : Infinity;
      const matchesBalance = balanceValue >= minBalance && balanceValue <= maxBalance;

      return matchesSearch && matchesStatus && matchesBalance;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'distributorName':
          aValue = a.distributorName.toLowerCase();
          bValue = b.distributorName.toLowerCase();
          break;
        case 'poolBalance':
          aValue = a.poolBalance;
          bValue = b.poolBalance;
          break;
        case 'totalWithdrawals':
          aValue = a.totalWithdrawals;
          bValue = b.totalWithdrawals;
          break;
        case 'lastWithdrawalDate':
          aValue = a.lastWithdrawalDate ? new Date(a.lastWithdrawalDate).getTime() : 0;
          bValue = b.lastWithdrawalDate ? new Date(b.lastWithdrawalDate).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [balances, searchTerm, statusFilter, balanceRange, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['ASA(Authorized Sales Associate) Name', 'ID', 'Email', 'Phone', 'Pool Balance', 'Total Withdrawals', 'Last Withdrawal Date', 'Status'];
    const rows = filteredAndSorted.map(b => [
      b.distributorName,
      b.distributorId,
      b.email,
      b.phone,
      b.poolBalance.toString(),
      b.totalWithdrawals.toString(),
      b.lastWithdrawalDate || 'N/A',
      b.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pool-balances-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort(field)}>
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading pool balances..." size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Active Reserve Balances</h1>
          <p className="text-muted-foreground mt-1">View and manage all ASA(Authorized Sales Associate) reserve wallet balances</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reserve Wallet</CardTitle>
              <Landmark className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{summaryStats.totalPoolMoney.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all ASA(Authorized Sales Associate)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{summaryStats.averageBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per ASA(Authorized Sales Associate)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active ASA(Authorized Sales Associate)</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.activeDistributors}</div>
              <p className="text-xs text-muted-foreground mt-1">With pool balance</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summaryStats.totalWithdrawals}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>ASA(Authorized Sales Associate) Pool Balances</CardTitle>
              <CardDescription>View and manage pool money balances for all ASA(Authorized Sales Associate)</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Balance Range Filter */}
          <div className="flex items-center gap-2 mt-4">
            <Label className="text-sm">Balance Range:</Label>
            <Input
              type="number"
              placeholder="Min"
              value={balanceRange.min}
              onChange={(e) => {
                setBalanceRange(prev => ({ ...prev, min: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-32"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={balanceRange.max}
              onChange={(e) => {
                setBalanceRange(prev => ({ ...prev, max: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-32"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No ASA(Authorized Sales Associate) found matching your filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="distributorName">ASA(Authorized Sales Associate) Name</SortableHeader>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <SortableHeader field="poolBalance">Pool Balance</SortableHeader>
                    <SortableHeader field="totalWithdrawals">Total Withdrawals</SortableHeader>
                    <SortableHeader field="lastWithdrawalDate">Last Withdrawal</SortableHeader>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((balance) => (
                    <TableRow key={balance.distributorId}>
                      <TableCell className="font-medium">{balance.distributorName}</TableCell>
                      <TableCell className="font-mono text-xs">{balance.distributorId}</TableCell>
                      <TableCell>{balance.email}</TableCell>
                      <TableCell>{balance.phone}</TableCell>
                      <TableCell className="font-bold">₹{balance.poolBalance.toLocaleString()}</TableCell>
                      <TableCell>{balance.totalWithdrawals}</TableCell>
                      <TableCell>
                        {balance.lastWithdrawalDate
                          ? format(new Date(balance.lastWithdrawalDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={balance.status === 'active' ? 'bg-success text-white' : 'bg-muted'}>
                          {balance.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDistributor(balance.distributorId)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Rows per page:</Label>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ASA(Authorized Sales Associate) Details Dialog */}
      <Dialog open={!!selectedDistributor} onOpenChange={(open) => !open && setSelectedDistributor(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ASA(Authorized Sales Associate) Pool Details</DialogTitle>
            <DialogDescription>
              Detailed pool money information for {distributorDetails?.distributorName}
            </DialogDescription>
          </DialogHeader>
          {distributorDetails && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">ASA(Authorized Sales Associate) Name</Label>
                  <p className="font-medium">{distributorDetails.distributorName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{distributorDetails.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">{distributorDetails.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Pool Balance</Label>
                  <p className="font-bold text-lg">₹{distributorDetails.poolBalance.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Withdrawals</Label>
                  <p className="font-medium">{distributorDetails.totalWithdrawals}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Withdrawal Amount</Label>
                  <p className="font-medium">₹{distributorDetails.totalWithdrawalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Partner Framework</Label>
                  <p className="font-medium">{distributorDetails.totalPairs || 0}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Total Earnings</Label>
                  <p className="font-medium">₹{(distributorDetails.totalEarnings || 0).toLocaleString()}</p>
                </div>
              </div>

              {distributorDetails.withdrawalHistory.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Withdrawal History</Label>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distributorDetails.withdrawalHistory.slice(0, 10).map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-mono text-xs">{req.id}</TableCell>
                            <TableCell>₹{req.amount.toLocaleString()}</TableCell>
                            <TableCell>{req.reason}</TableCell>
                            <TableCell>
                              <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'outline'}>
                                {req.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(req.requestedAt), 'MMM dd, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

