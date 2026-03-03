import { useState, useMemo } from 'react';
import { Users, Search, Mail, Phone, Calendar, ChevronLeft, ChevronRight, X, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserExtended } from '../types/userManagement';
import { useGetNormalUsersQuery, useUpdateTotalEarningsMutation, type UserProfileResponse } from '@/app/api/userApi';

/** User row for Update Payout Balance table (includes total_earnings from API) */
type PayoutBalanceUser = UserExtended & { totalEarnings?: string };
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const mapApiUserToExtended = (apiUser: UserProfileResponse): PayoutBalanceUser => {
  const fullName = `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.email;
  let kycStatus: 'pending' | 'verified' | 'rejected' | 'not_submitted' = 'not_submitted';
  if (apiUser.kyc_status === 'verified' || apiUser.kyc_status === 'approved') {
    kycStatus = 'verified';
  } else if (apiUser.kyc_status === 'pending') {
    kycStatus = 'pending';
  } else if (apiUser.kyc_status === 'rejected') {
    kycStatus = 'rejected';
  }
  return {
    id: String(apiUser.id),
    userId: `U${apiUser.id}`,
    name: fullName,
    email: apiUser.email,
    phone: apiUser.mobile || 'N/A',
    role: apiUser.is_distributor ? 'distributor' : 'user',
    status: apiUser.is_active_buyer === false ? 'inactive' : 'active',
    kycStatus,
    emailVerified: true,
    phoneVerified: !!apiUser.mobile,
    joinDate: apiUser.date_joined ? new Date(apiUser.date_joined).toISOString().split('T')[0] : '',
    totalOrders: 0,
    totalSpent: 0,
    paymentStatus: 'unpaid',
    distributorInfo: apiUser.is_distributor ? { referralCode: apiUser.referral_code, verified: apiUser.is_distributor } : undefined,
    address: {
      street: `${apiUser.address_line1 || ''} ${apiUser.address_line2 || ''}`.trim(),
      city: apiUser.city || '',
      state: apiUser.state || '',
      pincode: apiUser.pincode || '',
      country: apiUser.country || 'India',
    },
    totalEarnings: apiUser.total_earnings ?? undefined,
  };
};

// Validate total_earned: non-negative decimal, max 12 digits (10 before + 2 after decimal), 2 decimal places
function validateTotalEarned(value: string): { valid: boolean; message?: string } {
  if (value.trim() === '') {
    return { valid: false, message: 'Payout Wallet Balance is required.' };
  }
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) {
    return { valid: false, message: 'Enter a non-negative number.' };
  }
  if (!/^\d{0,10}(\.\d{1,2})?$/.test(value.trim())) {
    return { valid: false, message: 'Max 12 digits and 2 decimal places (e.g. 1234.56).' };
  }
  return { valid: true };
}

// Format for API: exactly 2 decimal places
function formatTotalEarned(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '0.00';
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 0) return '0.00';
  return num.toFixed(2);
}

export const UpdatePayoutBalance = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [ordering, setOrdering] = useState<string>('date_joined');

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      page_size: number;
      ordering: string;
      is_distributor?: boolean;
      search?: string;
    } = {
      page: currentPage,
      page_size: pageSize,
      ordering,
    };
    if (roleFilter === 'distributor') params.is_distributor = true;
    else if (roleFilter === 'user') params.is_distributor = false;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    return params;
  }, [currentPage, pageSize, roleFilter, ordering, searchQuery]);

  const { data: usersResponse, isLoading, error, refetch } = useGetNormalUsersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const users = useMemo((): PayoutBalanceUser[] => {
    if (!usersResponse) return [];
    const isArrayResponse = Array.isArray(usersResponse);
    const usersArray = isArrayResponse ? usersResponse : usersResponse.results;
    if (!usersArray || !Array.isArray(usersArray)) return [];
    return usersArray.map(mapApiUserToExtended);
  }, [usersResponse]);

  const totalCount = useMemo(() => {
    if (!usersResponse) return 0;
    if (Array.isArray(usersResponse)) return usersResponse.length;
    return usersResponse.count ?? users.length;
  }, [usersResponse, users.length]);

  const totalPages = useMemo(() => {
    if (!usersResponse) return 0;
    if (Array.isArray(usersResponse)) return Math.ceil(usersResponse.length / pageSize);
    return usersResponse.count ? Math.ceil(usersResponse.count / pageSize) : 0;
  }, [usersResponse, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Edit Balance modal state
  const [editBalanceUser, setEditBalanceUser] = useState<PayoutBalanceUser | null>(null);
  const [balanceInput, setBalanceInput] = useState('');
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [updateTotalEarnings, { isLoading: isUpdating }] = useUpdateTotalEarningsMutation();

  const openEditBalance = (user: PayoutBalanceUser) => {
    setEditBalanceUser(user);
    setBalanceInput(
      user.totalEarnings != null && user.totalEarnings !== ''
        ? formatTotalEarned(String(user.totalEarnings))
        : '0.00'
    );
    setBalanceError(null);
    setShowConfirm(false);
  };

  const closeEditBalance = () => {
    setEditBalanceUser(null);
    setBalanceInput('');
    setBalanceError(null);
    setShowConfirm(false);
  };

  const handleBalanceSubmit = () => {
    const validation = validateTotalEarned(balanceInput);
    if (!validation.valid) {
      setBalanceError(validation.message ?? 'Invalid value');
      return;
    }
    setBalanceError(null);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    if (!editBalanceUser) return;
    const validation = validateTotalEarned(balanceInput);
    if (!validation.valid) {
      setBalanceError(validation.message ?? 'Invalid value');
      return;
    }
    const total_earned = formatTotalEarned(balanceInput);
    try {
      const result = await updateTotalEarnings({
        userId: Number(editBalanceUser.id),
        total_earned,
      }).unwrap();
      toast.success(`Payout balance updated. New total_earned: ${result.total_earned}, wallet_balance: ${result.wallet_balance}`);
      closeEditBalance();
      refetch();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
        ? (err.data as { message: string }).message
        : 'Failed to update payout balance.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Update Payout Balance</h1>
          <p className="text-muted-foreground mt-1">Update payout wallet balance for users</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Failed to load users. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Update Payout Balance</h1>
        <p className="text-muted-foreground mt-1">Update payout wallet balance (total earned) for any user</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center gap-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 pr-10 w-64"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button onClick={handleSearch} disabled={isLoading} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ordering} onValueChange={setOrdering}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-date_joined">Newest First</SelectItem>
                  <SelectItem value="date_joined">Oldest First</SelectItem>
                  <SelectItem value="-id">ID Descending</SelectItem>
                  <SelectItem value="id">ID Ascending</SelectItem>
                  <SelectItem value="email">Email A-Z</SelectItem>
                  <SelectItem value="-email">Email Z-A</SelectItem>
                  <SelectItem value="first_name">First Name A-Z</SelectItem>
                  <SelectItem value="-first_name">First Name Z-A</SelectItem>
                  <SelectItem value="last_name">Last Name A-Z</SelectItem>
                  <SelectItem value="-last_name">Last Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.userId}</p>
                        {user.distributorInfo?.referralCode && (
                          <p className="text-xs text-primary mt-1">Ref: {user.distributorInfo.referralCode}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium tabular-nums">
                        {user.totalEarnings != null && user.totalEarnings !== ''
                          ? Number(user.totalEarnings).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.kycStatus === 'verified' ? (
                        <Badge className="bg-success text-white">Verified</Badge>
                      ) : user.kycStatus === 'pending' ? (
                        <Badge variant="default">Pending</Badge>
                      ) : (
                        <Badge variant="outline">Not Submitted</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.joinDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.joinDate}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditBalance(user)}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Edit Balance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalCount > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Rows per page:</Label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Balance Dialog */}
      <Dialog open={!!editBalanceUser} onOpenChange={(open) => !open && closeEditBalance()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payout Wallet Balance</DialogTitle>
            <DialogDescription>
              {editBalanceUser
                ? `Set total earned (payout wallet balance) for ${editBalanceUser.name} (${editBalanceUser.userId}). Non-negative decimal, max 12 digits, 2 decimal places.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {editBalanceUser && (
            <>
              {!showConfirm ? (
                <>
                  <div className="space-y-2 py-2">
                    <Label htmlFor="payout-balance">Payout Wallet Balance (total_earned)</Label>
                    <Input
                      id="payout-balance"
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 1234.56"
                      value={balanceInput}
                      onChange={(e) => {
                        setBalanceInput(e.target.value);
                        setBalanceError(null);
                      }}
                      className={balanceError ? 'border-destructive' : ''}
                    />
                    {balanceError && (
                      <p className="text-sm text-destructive">{balanceError}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={closeEditBalance}>
                      Cancel
                    </Button>
                    <Button onClick={handleBalanceSubmit}>
                      Continue
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground py-2">
                    Set total earned to <strong>{formatTotalEarned(balanceInput)}</strong> for {editBalanceUser.name}?
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirm(false)}>
                      Back
                    </Button>
                    <Button onClick={handleConfirmSubmit} disabled={isUpdating}>
                      {isUpdating ? 'Updating...' : 'Confirm & Submit'}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};
