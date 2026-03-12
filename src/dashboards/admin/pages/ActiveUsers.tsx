import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { Users, Search, Filter, Download, Eye, Edit, Ban, Mail, Phone, Calendar, ChevronLeft, ChevronRight, X, FileText } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserExtended } from '../types/userManagement';
import { useGetNormalUsersQuery, useGetUserByIdQuery, useUpdateUserByIdMutation, useDeleteUserByIdMutation, useGetUserDocumentsQuery, type UserProfileResponse } from '@/app/api/userApi';
import { LoadingSpinner, InlineLoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { formatDisplayDate } from '@/lib/utils';


const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-success text-white">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'blocked':
      return <Badge variant="destructive">Blocked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'distributor':
      return <Badge variant="default">Distributor</Badge>;
    case 'user':
      return <Badge variant="outline">User</Badge>;
    case 'staff':
      return <Badge className="bg-info text-white">Staff</Badge>;
    case 'admin':
      return <Badge className="bg-primary text-white">Admin</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
};

// Map API response to UserExtended type
const mapApiUserToExtended = (apiUser: UserProfileResponse): UserExtended => {
  const fullName = `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.email;

  // Map KYC status from API to component format
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
    // Default to 'active' if is_active_buyer is not explicitly false
    // Since this is the Active Users page, assume users returned by API are active
    status: apiUser.is_active_buyer === false ? 'inactive' : 'active',
    kycStatus,
    emailVerified: true, // Assuming verified if email exists
    phoneVerified: !!apiUser.mobile,
    joinDate: apiUser.date_joined ? new Date(apiUser.date_joined).toISOString().split('T')[0] : '',
    lastLogin: (apiUser as UserProfileResponse & { last_login?: string | null }).last_login
      ? new Date((apiUser as UserProfileResponse & { last_login?: string | null }).last_login!).toISOString().split('T')[0]
      : undefined,
    totalOrders: 0, // Not provided in API response
    totalSpent: 0, // Not provided in API response
    paymentStatus: 'unpaid',
    distributorInfo: apiUser.is_distributor ? {
      referralCode: apiUser.referral_code,
      verified: apiUser.is_distributor,
    } : undefined,
    address: {
      street: `${apiUser.address_line1 || ''} ${apiUser.address_line2 || ''}`.trim(),
      city: apiUser.city || '',
      state: apiUser.state || '',
      pincode: apiUser.pincode || '',
      country: apiUser.country || 'India',
    },
  };
};

export const ActiveUsers = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filter state
  const [searchInput, setSearchInput] = useState(''); // Input field value
  const [searchQuery, setSearchQuery] = useState(''); // Submitted search query
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [ordering, setOrdering] = useState<string>('date_joined');

  // Build query parameters
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

    // Map role filter to is_distributor parameter
    if (roleFilter === 'distributor') {
      params.is_distributor = true;
    } else if (roleFilter === 'user') {
      params.is_distributor = false;
    }
    // If roleFilter is 'all', don't include is_distributor parameter

    // Add search parameter if search query is provided
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    return params;
  }, [currentPage, pageSize, roleFilter, ordering, searchQuery]);

  const { data: usersResponse, isLoading, error, refetch } = useGetNormalUsersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  // Debug: Log query params changes
  useEffect(() => {
    console.log('🔍 [ActiveUsers] Query params changed:', queryParams);
  }, [queryParams]);

  // Debug: Log response structure
  useEffect(() => {
    if (usersResponse) {
      console.log('🔍 [ActiveUsers] Response structure:', {
        isArray: Array.isArray(usersResponse),
        hasResults: !Array.isArray(usersResponse) && 'results' in usersResponse,
        hasCount: !Array.isArray(usersResponse) && 'count' in usersResponse,
        response: usersResponse,
      });
    }
  }, [usersResponse]);
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
  const [documentsUserId, setDocumentsUserId] = useState<number | null>(null);

  // Reset to page 1 when filters change (but not when searchQuery changes, as handleSearch handles it)
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, ordering]);

  // Handle search button click
  const handleSearch = () => {
    console.log('🔍 [ActiveUsers] Search button clicked, searchInput:', searchInput);
    const trimmedSearch = searchInput.trim();
    console.log('🔍 [ActiveUsers] Setting searchQuery to:', trimmedSearch);
    // Reset to page 1 and update search query
    // Using separate state updates to ensure proper re-render
    setCurrentPage(1);
    setSearchQuery(trimmedSearch);
  };

  // Debug: Log searchQuery changes
  useEffect(() => {
    console.log('🔍 [ActiveUsers] searchQuery state changed to:', searchQuery);
  }, [searchQuery]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Fetch user details when viewingUserId is set
  const { data: userDetails, isLoading: isLoadingUserDetails } = useGetUserByIdQuery(
    viewingUserId!,
    { skip: !viewingUserId }
  );

  // Fetch user documents when documentsUserId is set
  const { data: userDocuments, isLoading: isLoadingDocuments } = useGetUserDocumentsQuery(
    documentsUserId!,
    { skip: !documentsUserId }
  );

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    gender: '',
    date_of_birth: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  // Fetch user details for editing when editingUserId is set
  const { data: editingUserDetails } = useGetUserByIdQuery(
    editingUserId!,
    { skip: !editingUserId }
  );

  // Populate edit form when editing user details are loaded
  useEffect(() => {
    if (editingUserDetails && editingUserId) {
      setEditFormData({
        first_name: editingUserDetails.first_name || '',
        last_name: editingUserDetails.last_name || '',
        email: editingUserDetails.email || '',
        mobile: editingUserDetails.mobile || '',
        gender: editingUserDetails.gender || '',
        date_of_birth: editingUserDetails.date_of_birth || '',
        address_line1: editingUserDetails.address_line1 || '',
        address_line2: editingUserDetails.address_line2 || '',
        city: editingUserDetails.city || '',
        state: editingUserDetails.state || '',
        pincode: editingUserDetails.pincode || '',
        country: editingUserDetails.country || 'India',
      });
      setIsEditDialogOpen(true);
    }
  }, [editingUserDetails, editingUserId]);

  // Update mutation
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserByIdMutation();

  // Delete dialog state
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserExtended | null>(null);

  // Delete mutation
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserByIdMutation();

  // Map API users to UserExtended format
  // Handle both response formats: array directly or object with results property
  const users = useMemo(() => {
    if (!usersResponse) return [];
    
    // Check if response is an array directly
    const isArrayResponse = Array.isArray(usersResponse);
    const usersArray = isArrayResponse ? usersResponse : usersResponse.results;
    
    if (!usersArray || !Array.isArray(usersArray)) {
      console.warn('🔍 [ActiveUsers] Invalid response format:', usersResponse);
      return [];
    }
    
    const mappedUsers = usersArray.map(mapApiUserToExtended);
    console.log('🔍 [ActiveUsers] Mapped users:', mappedUsers);
    console.log('🔍 [ActiveUsers] Users with status:', mappedUsers.map(u => ({ id: u.id, name: u.name, status: u.status, is_active_buyer: usersArray.find(r => String(r.id) === u.id)?.is_active_buyer })));
    return mappedUsers;
  }, [usersResponse]);

  // Show all users returned by API (API handles filtering)
  // Note: Removed client-side filtering by status since API should return appropriate users
  const filteredUsers = useMemo(() => {
    console.log('🔍 [ActiveUsers] All users from API:', users.length);
    console.log('🔍 [ActiveUsers] Users breakdown:', {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      distributors: users.filter(u => u.role === 'distributor').length,
      regular: users.filter(u => u.role === 'user').length,
    });
    // Return all users - API is responsible for filtering
    return users;
  }, [users]);

  // Calculate stats from current page results (for display)
  // Handle both response formats: array directly or object with count property
  const totalActive = useMemo(() => {
    if (!usersResponse) return 0;
    // If response is an array, use its length
    if (Array.isArray(usersResponse)) {
      return usersResponse.length;
    }
    // If response is an object with count, use count
    return usersResponse.count || users.length;
  }, [usersResponse, users.length]);
  
  const totalPages = useMemo(() => {
    if (!usersResponse) return 0;
    // If response is an array, calculate pages from array length
    if (Array.isArray(usersResponse)) {
      return Math.ceil(usersResponse.length / pageSize);
    }
    // If response is an object with count, use count
    return usersResponse.count ? Math.ceil(usersResponse.count / pageSize) : 0;
  }, [usersResponse, pageSize]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Active Users</h1>
            <p className="text-muted-foreground mt-1">View and manage all active platform users</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Failed to load users. Please try again.</p>
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
          <h1 className="text-3xl font-bold text-foreground">Active Users</h1>
          <p className="text-muted-foreground mt-1">View and manage all active platform users</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div> */}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Users List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10 pr-10 w-64"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  size="sm"
                >
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
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No users found matching your search.' : 'No active users found.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
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
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingUserId(Number(user.id));
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Set editing user ID to trigger fetch and open edit dialog
                            setEditingUserId(Number(user.id));
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteUserId(Number(user.id));
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Ban className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalActive > 0 && (
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
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalActive)} of {totalActive}
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
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setViewingUserId(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {userDetails ? `Complete information about ${userDetails.first_name} ${userDetails.last_name}` : 'Loading user details...'}
            </DialogDescription>
          </DialogHeader>
          {isLoadingUserDetails ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : userDetails ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="font-medium">U{userDetails.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{userDetails.first_name} {userDetails.last_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{userDetails.email}</p>
                    <Badge className="bg-success text-white text-xs">Verified</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{userDetails.mobile || 'N/A'}</p>
                    {userDetails.mobile ? (
                      <Badge className="bg-success text-white text-xs">Verified</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Unverified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Gender</Label>
                  <p className="font-medium capitalize">{userDetails.gender || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                  <p className="font-medium">{formatDisplayDate(userDetails.date_of_birth)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <div className="mt-1">{getRoleBadge(userDetails.is_distributor ? 'distributor' : userDetails.role)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(userDetails.is_active_buyer ? 'active' : 'inactive')}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">KYC Status</Label>
                  <div className="mt-1">
                    {userDetails.kyc_status === 'verified' || userDetails.kyc_status === 'approved' ? (
                      <Badge className="bg-success text-white">Verified</Badge>
                    ) : userDetails.kyc_status === 'pending' ? (
                      <Badge variant="default">Pending</Badge>
                    ) : userDetails.kyc_status === 'rejected' ? (
                      <Badge variant="destructive">Rejected</Badge>
                    ) : (
                      <Badge variant="outline">Not Submitted</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date Joined</Label>
                  <p className="font-medium">
                    {userDetails.date_joined ? new Date(userDetails.date_joined).toLocaleString() : 'N/A'}
                  </p>
                </div>
                {(userDetails as UserProfileResponse & { last_login?: string | null }).last_login && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Login</Label>
                    <p className="font-medium">{new Date((userDetails as UserProfileResponse & { last_login?: string | null }).last_login!).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Address Information */}
              <div className="p-3 bg-secondary rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Address Information</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Address Line 1</Label>
                    <p className="font-medium">{userDetails.address_line1 || 'N/A'}</p>
                  </div>
                  {userDetails.address_line2 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Address Line 2</Label>
                      <p className="font-medium">{userDetails.address_line2}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <p className="font-medium">{userDetails.city || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State</Label>
                    <p className="font-medium">{userDetails.state || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Pincode</Label>
                    <p className="font-medium">{userDetails.pincode || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <p className="font-medium">{userDetails.country || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Distributor Information */}
              {userDetails.is_distributor && (
                <div className="p-3 bg-secondary rounded-lg">
                  <Label className="text-xs text-muted-foreground mb-2 block">Distributor Information</Label>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">ASA Code</Label>
                      <p className="font-medium">{userDetails.referral_code || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Is Distributor</Label>
                      <p className="font-medium">{userDetails.is_distributor ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load user details
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsViewDialogOpen(false);
              setViewingUserId(null);
            }}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (viewingUserId) {
                  setDocumentsUserId(viewingUserId);
                  setIsDocumentsDialogOpen(true);
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
            <Button
              onClick={() => {
                // Set editing user ID to trigger fetch and open edit dialog
                if (viewingUserId) {
                  setEditingUserId(viewingUserId);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingUserId(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {editingUserDetails ? `${editingUserDetails.first_name} ${editingUserDetails.last_name}` : 'user'}
            </DialogDescription>
          </DialogHeader>
          {!editingUserDetails && editingUserId ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingUserId) return;

                try {
                  const updateData = {
                    first_name: editFormData.first_name,
                    last_name: editFormData.last_name,
                    email: editFormData.email,
                    mobile: editFormData.mobile,
                    gender: editFormData.gender,
                    date_of_birth: editFormData.date_of_birth,
                    address_line1: editFormData.address_line1,
                    address_line2: editFormData.address_line2 || '',
                    city: editFormData.city,
                    state: editFormData.state,
                    pincode: editFormData.pincode,
                    country: editFormData.country || 'India',
                  };

                  console.log('📤 [UPDATE USER] Request Body:', JSON.stringify(updateData, null, 2));
                  console.log('📤 [UPDATE USER] User ID:', viewingUserId);

                  const result = await updateUser({
                    userId: editingUserId,
                    data: updateData,
                  }).unwrap();

                  console.log('✅ [UPDATE USER] Response:', JSON.stringify(result, null, 2));

                  toast.success('User updated successfully');
                  setIsEditDialogOpen(false);
                  setIsViewDialogOpen(false);
                  setViewingUserId(null);
                  setEditingUserId(null);
                  // Refetch users list to update the cache
                  refetch();
                } catch (error: unknown) {
                  const err = error as { data?: { message?: string } };
                  toast.error(err?.data?.message || 'Failed to update user');
                }
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">
                    Mobile <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editFormData.gender}
                    onValueChange={(value) => setEditFormData({ ...editFormData, gender: value })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={editFormData.date_of_birth}
                    onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line1">
                    Address Line 1 <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address_line1"
                    value={editFormData.address_line1}
                    onChange={(e) => setEditFormData({ ...editFormData, address_line1: e.target.value })}
                    required
                    disabled={isUpdating}
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                  <Textarea
                    id="address_line2"
                    value={editFormData.address_line2}
                    onChange={(e) => setEditFormData({ ...editFormData, address_line2: e.target.value })}
                    disabled={isUpdating}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="state"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">
                    Pincode <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    value={editFormData.pincode}
                    onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                    required
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country (Optional)</Label>
                  <Input
                    id="country"
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <InlineLoadingSpinner className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={isDocumentsDialogOpen} onOpenChange={(open) => {
        setIsDocumentsDialogOpen(open);
        if (!open) {
          setDocumentsUserId(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Documents</DialogTitle>
            <DialogDescription>
              {userDocuments ? `Documents for ${userDocuments.user_full_name} (${userDocuments.user_email})` : 'Loading documents...'}
            </DialogDescription>
          </DialogHeader>
          {isLoadingDocuments ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : userDocuments ? (
            <div className="space-y-4">
              {/* ASA Document Acceptance */}
              {userDocuments.asa_document_acceptance_url && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">ASA Document Acceptance</Label>
                      <p className="text-xs text-muted-foreground mt-1">Agreement document</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!userDocuments.asa_document_acceptance_url) {
                          toast.error('Document URL not available');
                          return;
                        }
                        window.open(userDocuments.asa_document_acceptance_url, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Terms Acceptance Document */}
              {userDocuments.payment_terms_acceptance_document_url && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Payment Terms Acceptance</Label>
                      <p className="text-xs text-muted-foreground mt-1">Payment terms document</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!userDocuments.payment_terms_acceptance_document_url) {
                          toast.error('Document URL not available');
                          return;
                        }
                        window.open(userDocuments.payment_terms_acceptance_document_url, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Receipts */}
              {userDocuments.payment_receipt_urls && userDocuments.payment_receipt_urls.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Receipts ({userDocuments.payment_receipt_urls.length})</Label>
                  {userDocuments.payment_receipt_urls.map((url, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Receipt #{index + 1}</Label>
                          <p className="text-xs text-muted-foreground mt-1">Payment receipt document</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!url) {
                              toast.error('Document URL not available');
                              return;
                            }
                            window.open(url, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No documents message */}
              {!userDocuments.asa_document_acceptance_url && 
               !userDocuments.payment_terms_acceptance_document_url && 
               (!userDocuments.payment_receipt_urls || userDocuments.payment_receipt_urls.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents available for this user.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load documents
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDocumentsDialogOpen(false);
              setDocumentsUserId(null);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user <strong>{userToDelete?.name}</strong> (ID: {userToDelete?.userId})?
              <br />
              <br />
              This action cannot be undone. All user data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteUserId) return;

                try {
                  console.log('📤 [DELETE USER] User ID:', deleteUserId);

                  const result = await deleteUser(deleteUserId).unwrap();

                  console.log('✅ [DELETE USER] Response:', JSON.stringify(result, null, 2));

                  toast.success(result.message || 'User deleted successfully');
                  setIsDeleteDialogOpen(false);
                  setDeleteUserId(null);
                  setUserToDelete(null);
                  // Refetch users list to update the cache
                  refetch();
                } catch (error: unknown) {
                  const err = error as { data?: { message?: string } };
                  toast.error(err?.data?.message || 'Failed to delete user');
                }
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <InlineLoadingSpinner className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

