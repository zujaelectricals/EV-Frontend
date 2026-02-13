import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { FileCheck, Search, Filter, Download, Eye, CheckCircle, XCircle, FileText, Image as ImageIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSelector } from '@/app/hooks';
import {
  useGetKYCListQuery,
  useUpdateKYCStatusMutation,
  useApproveNomineeKYCMutation,
  useRejectNomineeKYCMutation,
} from '@/app/api/userApi';
import { LoadingSpinner, InlineLoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

type KYCStatus = 'pending' | 'approved' | 'rejected';

interface KYCApplication {
  kyc_type: string;
  id: number;
  user_id: number;
  user_email: string;
  user_username: string;
  user_full_name: string;
  reviewed_by: {
    id: number;
    fullname: string;
    email: string;
    profile_picture_url: string | null;
  } | null;
  status: KYCStatus;
  pan_number: string | null;
  aadhaar_number: string | null;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string | null;
  pan_document: string | null;
  aadhaar_front: string | null;
  aadhaar_back: string | null;
  bank_name: string | null;
  account_number: string | null;
  ifsc_code: string | null;
  account_holder_name: string | null;
  bank_passbook: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string;
  // Nominee-specific fields
  nominee_full_name?: string;
  relationship?: string;
  date_of_birth?: string;
  mobile?: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  id_proof_document?: string;
}

const getStatusBadge = (status: KYCStatus) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-success text-white">Approved</Badge>;
    case 'pending':
      return <Badge className="bg-warning text-white">Pending</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const KYCPending = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<KYCStatus | 'all'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'staff' | 'user'>('all');
  const [submittedDateFrom, setSubmittedDateFrom] = useState<Date | undefined>(undefined);
  const [submittedDateTo, setSubmittedDateTo] = useState<Date | undefined>(undefined);
  const [reviewedDateFrom, setReviewedDateFrom] = useState<Date | undefined>(undefined);
  const [reviewedDateTo, setReviewedDateTo] = useState<Date | undefined>(undefined);
  const [ordering, setOrdering] = useState<string>('-submitted_at');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUserId, setSearchUserId] = useState<string>('');
  
  // Dialog state
  const [viewingKYC, setViewingKYC] = useState<KYCApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [rejectingKYC, setRejectingKYC] = useState<KYCApplication | null>(null);
  const [approvingKYC, setApprovingKYC] = useState<KYCApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      page_size: pageSize,
      ordering,
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    if (userRoleFilter !== 'all') {
      params.user_role = userRoleFilter;
    }
    if (submittedDateFrom) {
      params.submitted_date_from = format(submittedDateFrom, 'yyyy-MM-dd');
    }
    if (submittedDateTo) {
      params.submitted_date_to = format(submittedDateTo, 'yyyy-MM-dd');
    }
    if (reviewedDateFrom) {
      params.reviewed_date_from = format(reviewedDateFrom, 'yyyy-MM-dd');
    }
    if (reviewedDateTo) {
      params.reviewed_date_to = format(reviewedDateTo, 'yyyy-MM-dd');
    }
    if (searchUserId.trim()) {
      const userId = parseInt(searchUserId.trim());
      if (!isNaN(userId)) {
        params.user_id = userId;
      }
    }

    return params;
  }, [currentPage, pageSize, statusFilter, userRoleFilter, submittedDateFrom, submittedDateTo, reviewedDateFrom, reviewedDateTo, ordering, searchUserId]);

  // Fetch KYC list
  const { data: kycResponse, isLoading, error, refetch } = useGetKYCListQuery(queryParams);
  
  // Console log API response
  useEffect(() => {
    if (kycResponse) {
      console.log('📥 [KYC Pending Component] API Response:', JSON.stringify(kycResponse, null, 2));
      console.log('📥 [KYC Pending Component] Total Count:', kycResponse.count);
      console.log('📥 [KYC Pending Component] Results:', kycResponse.results);
      console.log('📥 [KYC Pending Component] Current Page:', currentPage);
      console.log('📥 [KYC Pending Component] Page Size:', pageSize);
      console.log('📥 [KYC Pending Component] Query Params:', queryParams);
    }
  }, [kycResponse, currentPage, pageSize, queryParams]);
  
  // User details are now included in the API response, no need to fetch separately

  // Mutations
  const [updateKYCStatus, { isLoading: isUpdatingStatus }] = useUpdateKYCStatusMutation();
  const [approveNomineeKYC, { isLoading: isApprovingNominee }] = useApproveNomineeKYCMutation();
  const [rejectNomineeKYC, { isLoading: isRejectingNominee }] = useRejectNomineeKYCMutation();

  // Filter KYC applications by search query (client-side for name/email search)
  const filteredApplications = useMemo(() => {
    if (!kycResponse?.results) return [];
    
    let filtered = kycResponse.results;
    
    // Client-side search by PAN/Aadhaar/Account Name/User Name if search query is provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((kyc) => {
        const panMatch = kyc.pan_number?.toLowerCase().includes(query) || false;
        const aadhaarMatch = kyc.aadhaar_number?.toLowerCase().includes(query) || false;
        const accountNameMatch = kyc.account_holder_name?.toLowerCase().includes(query) || false;
        const userNameMatch = kyc.user_full_name?.toLowerCase().includes(query) || false;
        const userEmailMatch = kyc.user_email?.toLowerCase().includes(query) || false;
        const nomineeNameMatch = kyc.nominee_full_name?.toLowerCase().includes(query) || false;
        const idProofMatch = kyc.id_proof_number?.toLowerCase().includes(query) || false;
        
        return panMatch || aadhaarMatch || accountNameMatch || userNameMatch || userEmailMatch || nomineeNameMatch || idProofMatch;
      });
    }
    
    return filtered;
  }, [kycResponse?.results, searchQuery]);

  // Calculate stats - based on current page results
  const stats = useMemo(() => {
    if (!kycResponse || !kycResponse.results) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    
    const total = kycResponse.count;
    const pending = kycResponse.results.filter(k => k.status === 'pending').length;
    const approved = kycResponse.results.filter(k => k.status === 'approved').length;
    const rejected = kycResponse.results.filter(k => k.status === 'rejected').length;
    
    return {
      total,
      pending,
      approved,
      rejected,
    };
  }, [kycResponse]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, userRoleFilter, submittedDateFrom, submittedDateTo, reviewedDateFrom, reviewedDateTo, ordering, searchUserId]);

  const handleApprove = (kyc: KYCApplication) => {
    setApprovingKYC(kyc);
    setIsApproveDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!approvingKYC) return;

    try {
      // Check if this is a nominee KYC
      if (approvingKYC.kyc_type === 'nominee') {
        await approveNomineeKYC({
          nomineeId: approvingKYC.id,
        }).unwrap();
        toast.success('Nominee KYC approved successfully');
      } else {
        await updateKYCStatus({
          kycId: approvingKYC.id,
          status: 'approved',
        }).unwrap();
        toast.success('KYC approved successfully');
      }
      setIsApproveDialogOpen(false);
      setApprovingKYC(null);
      // Refetch the KYC list to update the data
      await refetch();
      if (viewingKYC && viewingKYC.id === approvingKYC.id) {
        setIsViewDialogOpen(false);
        setViewingKYC(null);
      }
    } catch (error) {
      const err = error as FetchBaseQueryError | SerializedError;
      const errorMessage = 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
        ? (err.data as { message?: string }).message
        : 'data' in err && err.data && typeof err.data === 'object' && 'detail' in err.data
        ? (err.data as { detail?: string }).detail
        : 'message' in err
        ? err.message
        : approvingKYC?.kyc_type === 'nominee'
        ? 'Failed to approve nominee KYC'
        : 'Failed to approve KYC';
      toast.error(errorMessage || 'Failed to approve KYC');
    }
  };

  const handleReject = (kyc: KYCApplication) => {
    setRejectingKYC(kyc);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectingKYC || !rejectionReason.trim()) return;

    try {
      // Check if this is a nominee KYC
      if (rejectingKYC.kyc_type === 'nominee') {
        await rejectNomineeKYC({
          nomineeId: rejectingKYC.id,
          reason: rejectionReason.trim(),
        }).unwrap();
        toast.success('Nominee KYC rejected successfully');
      } else {
        await updateKYCStatus({
          kycId: rejectingKYC.id,
          status: 'rejected',
          reason: rejectionReason.trim(),
        }).unwrap();
        toast.success('KYC rejected successfully');
      }
      setIsRejectDialogOpen(false);
      setRejectingKYC(null);
      setRejectionReason('');
      // Refetch the KYC list to update the data
      await refetch();
      if (viewingKYC && viewingKYC.id === rejectingKYC.id) {
        setIsViewDialogOpen(false);
        setViewingKYC(null);
      }
    } catch (error) {
      const err = error as FetchBaseQueryError | SerializedError;
      const errorMessage = 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data
        ? (err.data as { message?: string }).message
        : 'data' in err && err.data && typeof err.data === 'object' && 'detail' in err.data
        ? (err.data as { detail?: string }).detail
        : 'message' in err
        ? err.message
        : rejectingKYC?.kyc_type === 'nominee'
        ? 'Failed to reject nominee KYC'
        : 'Failed to reject KYC';
      toast.error(errorMessage || 'Failed to reject KYC');
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setUserRoleFilter('all');
    setSubmittedDateFrom(undefined);
    setSubmittedDateTo(undefined);
    setReviewedDateFrom(undefined);
    setReviewedDateTo(undefined);
    setSearchQuery('');
    setSearchUserId('');
    setOrdering('-submitted_at');
    setCurrentPage(1);
  };

  const totalPages = kycResponse ? Math.ceil(kycResponse.count / pageSize) : 0;

  if (isLoading && !kycResponse) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">KYC Pending</h1>
            <p className="text-muted-foreground mt-1">Review and verify KYC documents</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Failed to load KYC applications. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KYC Records</h1>
          <p className="text-muted-foreground mt-1">View and manage all KYC applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Filters</Label>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as KYCStatus | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">User Role</Label>
                  <Select value={userRoleFilter} onValueChange={(value) => setUserRoleFilter(value as 'all' | 'admin' | 'staff' | 'user')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Sort By</Label>
                  <Select value={ordering} onValueChange={setOrdering}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-submitted_at">Submitted Date (Newest)</SelectItem>
                      <SelectItem value="submitted_at">Submitted Date (Oldest)</SelectItem>
                      <SelectItem value="-reviewed_at">Reviewed Date (Newest)</SelectItem>
                      <SelectItem value="reviewed_at">Reviewed Date (Oldest)</SelectItem>
                      <SelectItem value="-status">Status (Desc)</SelectItem>
                      <SelectItem value="status">Status (Asc)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Submitted Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {submittedDateFrom ? format(submittedDateFrom, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={submittedDateFrom}
                        onSelect={setSubmittedDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Submitted Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {submittedDateTo ? format(submittedDateTo, 'MMM dd, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={submittedDateTo}
                        onSelect={setSubmittedDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">User ID</Label>
                  <Input
                    placeholder="Enter user ID"
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    type="number"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {/* <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button> */}
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
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
                </div>
                <FileCheck className="h-8 w-8 text-foreground opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{stats.pending}</p>
                </div>
                <FileCheck className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-success mt-1">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* KYC Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>KYC Applications</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by PAN, Aadhaar, or Account Name..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Aadhaar</TableHead>
                    <TableHead>PAN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No KYC applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((kyc) => {
                      const userName = kyc.user_full_name || kyc.user_email || `U${kyc.user_id}`;
                      
                      return (
                        <TableRow key={kyc.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{userName}</p>
                              <p className="text-xs text-muted-foreground">U{kyc.user_id}</p>
                              {kyc.kyc_type === 'nominee' && kyc.nominee_full_name && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Nominee: {kyc.nominee_full_name}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{kyc.user_email}</p>
                              {kyc.mobile && (
                                <p className="text-xs text-muted-foreground">{kyc.mobile}</p>
                              )}
                            </div>
                          </TableCell>
                        <TableCell>
                          {kyc.aadhaar_number ? (
                            <code className="text-xs bg-secondary px-2 py-1 rounded">{kyc.aadhaar_number}</code>
                          ) : kyc.id_proof_type === 'Aadhar' && kyc.id_proof_number ? (
                            <code className="text-xs bg-secondary px-2 py-1 rounded">{kyc.id_proof_number}</code>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {kyc.pan_number ? (
                            <code className="text-xs bg-secondary px-2 py-1 rounded">{kyc.pan_number}</code>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(kyc.submitted_at).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewingKYC(kyc);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            {kyc.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-success hover:bg-success/90"
                                  onClick={() => handleApprove(kyc)}
                                  disabled={isUpdatingStatus || isApprovingNominee || isRejectingNominee}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(kyc)}
                                  disabled={isUpdatingStatus || isApprovingNominee || isRejectingNominee}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {kycResponse && kycResponse.count > 0 && (
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
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, kycResponse.count)} of {kycResponse.count}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View KYC Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setViewingKYC(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Review</DialogTitle>
            <DialogDescription>
              Review KYC documents for User ID: {viewingKYC?.user_id}
              {viewingKYC?.user_full_name && ` - ${viewingKYC.user_full_name}`}
              {viewingKYC?.kyc_type === 'nominee' && viewingKYC.nominee_full_name && ` (Nominee: ${viewingKYC.nominee_full_name})`}
            </DialogDescription>
          </DialogHeader>
          {viewingKYC && (
            <div className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="bank">Bank Details</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                </TabsList>
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">User ID</Label>
                      <p className="font-medium">U{viewingKYC.user_id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{viewingKYC.user_full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{viewingKYC.user_email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">KYC Type</Label>
                      <p className="font-medium capitalize">{viewingKYC.kyc_type || 'Standard'}</p>
                    </div>
                    {viewingKYC.kyc_type === 'nominee' && (
                      <>
                        <div>
                          <Label className="text-xs text-muted-foreground">Nominee Name</Label>
                          <p className="font-medium">{viewingKYC.nominee_full_name || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Relationship</Label>
                          <p className="font-medium capitalize">{viewingKYC.relationship || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                          <p className="font-medium">{viewingKYC.date_of_birth ? new Date(viewingKYC.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Nominee Email</Label>
                          <p className="font-medium">{viewingKYC.email || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Nominee Mobile</Label>
                          <p className="font-medium">{viewingKYC.mobile || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">ID Proof Type</Label>
                          <p className="font-medium">{viewingKYC.id_proof_type || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">ID Proof Number</Label>
                          <p className="font-medium">{viewingKYC.id_proof_number || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Aadhaar Number</Label>
                      <p className="font-medium">{viewingKYC.aadhaar_number || (viewingKYC.id_proof_type === 'Aadhar' ? viewingKYC.id_proof_number || 'N/A' : 'N/A')}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">PAN Number</Label>
                      <p className="font-medium">{viewingKYC.pan_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="mt-1">{getStatusBadge(viewingKYC.status)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Submitted At</Label>
                      <p className="font-medium">{new Date(viewingKYC.submitted_at).toLocaleString()}</p>
                    </div>
                    {viewingKYC.reviewed_at && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Reviewed At</Label>
                        <p className="font-medium">{new Date(viewingKYC.reviewed_at).toLocaleString()}</p>
                      </div>
                    )}
                    {viewingKYC.reviewed_by && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Reviewed By</Label>
                        <p className="font-medium">{viewingKYC.reviewed_by.fullname || viewingKYC.reviewed_by.email}</p>
                      </div>
                    )}
                    {viewingKYC.rejection_reason && (
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                        <p className="font-medium text-destructive">{viewingKYC.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {viewingKYC.pan_document && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">PAN Document</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingKYC.pan_document}
                            alt="PAN Card"
                            className="w-full h-48 object-contain bg-secondary"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(viewingKYC.pan_document!, '_blank')}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                    {viewingKYC.aadhaar_front && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Aadhaar Front</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingKYC.aadhaar_front}
                            alt="Aadhaar Front"
                            className="w-full h-48 object-contain bg-secondary"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(viewingKYC.aadhaar_front!, '_blank')}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                    {viewingKYC.aadhaar_back && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Aadhaar Back</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingKYC.aadhaar_back}
                            alt="Aadhaar Back"
                            className="w-full h-48 object-contain bg-secondary"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(viewingKYC.aadhaar_back!, '_blank')}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                    {viewingKYC.id_proof_document && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">ID Proof Document ({viewingKYC.id_proof_type})</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingKYC.id_proof_document}
                            alt="ID Proof"
                            className="w-full h-48 object-contain bg-secondary"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(viewingKYC.id_proof_document!, '_blank')}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                    {viewingKYC.bank_passbook && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Bank Passbook</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingKYC.bank_passbook}
                            alt="Bank Passbook"
                            className="w-full h-48 object-contain bg-secondary"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => window.open(viewingKYC.bank_passbook!, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                    {!viewingKYC.pan_document && !viewingKYC.aadhaar_front && !viewingKYC.aadhaar_back && !viewingKYC.id_proof_document && !viewingKYC.bank_passbook && (
                      <div className="col-span-2 text-center text-muted-foreground py-8">
                        No documents available
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="bank" className="space-y-4">
                  {viewingKYC.account_holder_name || viewingKYC.account_number || viewingKYC.ifsc_code || viewingKYC.bank_name ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Holder Name</Label>
                        <p className="font-medium">{viewingKYC.account_holder_name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Number</Label>
                        <p className="font-medium">{viewingKYC.account_number || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">IFSC Code</Label>
                        <p className="font-medium">{viewingKYC.ifsc_code || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Bank Name</Label>
                        <p className="font-medium">{viewingKYC.bank_name || 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No bank details available
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="address" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">Address Line 1</Label>
                      <p className="font-medium">{viewingKYC.address_line1}</p>
                    </div>
                    {viewingKYC.address_line2 && (
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">Address Line 2</Label>
                        <p className="font-medium">{viewingKYC.address_line2}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">City</Label>
                      <p className="font-medium">{viewingKYC.city}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">State</Label>
                      <p className="font-medium">{viewingKYC.state}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Pincode</Label>
                      <p className="font-medium">{viewingKYC.pincode}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Country</Label>
                      <p className="font-medium">{viewingKYC.country || 'N/A'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingKYC?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleReject(viewingKYC);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-success hover:bg-success/90"
                  onClick={() => handleApprove(viewingKYC)}
                  disabled={isUpdatingStatus || isApprovingNominee || isRejectingNominee}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve KYC
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve KYC Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve KYC Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the KYC application for User ID: <strong>U{approvingKYC?.user_id}</strong>?
              {approvingKYC?.user_full_name && (
                <> - <strong>{approvingKYC.user_full_name}</strong></>
              )}
              <br />
              <br />
              <div className="text-sm space-y-1 mt-2">
                <p><strong>PAN:</strong> {approvingKYC?.pan_number || 'N/A'}</p>
                <p><strong>Aadhaar:</strong> {approvingKYC?.aadhaar_number || approvingKYC?.id_proof_number || 'N/A'}</p>
                {approvingKYC?.kyc_type === 'nominee' && approvingKYC.nominee_full_name && (
                  <p><strong>Nominee:</strong> {approvingKYC.nominee_full_name}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus || isApprovingNominee}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={isUpdatingStatus || isApprovingNominee}
              className="bg-success hover:bg-success/90"
            >
              {isUpdatingStatus || isApprovingNominee ? (
                <>
                  <InlineLoadingSpinner className="mr-2" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve KYC
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject KYC Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting KYC for User ID: <strong>U{rejectingKYC?.user_id}</strong>
              {rejectingKYC?.user_full_name && (
                <> - <strong>{rejectingKYC.user_full_name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          {rejectingKYC && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">User ID</Label>
                <p className="font-medium">U{rejectingKYC.user_id}</p>
                <Label className="text-xs text-muted-foreground">PAN</Label>
                <p className="font-medium">{rejectingKYC.pan_number || 'N/A'}</p>
                <Label className="text-xs text-muted-foreground">Aadhaar</Label>
                <p className="font-medium">{rejectingKYC.aadhaar_number || rejectingKYC.id_proof_number || 'N/A'}</p>
                {rejectingKYC.kyc_type === 'nominee' && rejectingKYC.nominee_full_name && (
                  <>
                    <Label className="text-xs text-muted-foreground">Nominee</Label>
                    <p className="font-medium">{rejectingKYC.nominee_full_name}</p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Enter reason for rejection (e.g., PAN document is not clear)..."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={isUpdatingStatus || isApprovingNominee || isRejectingNominee}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason('');
              }}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || isUpdatingStatus || isRejectingNominee}
            >
              {isUpdatingStatus || isRejectingNominee ? (
                <>
                  <InlineLoadingSpinner className="mr-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
