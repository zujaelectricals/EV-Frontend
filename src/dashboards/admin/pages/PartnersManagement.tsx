import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useGetDistributorApplicationsQuery, useUpdateDistributorApplicationStatusMutation } from '@/app/api/userApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-pink-600 hover:bg-pink-700 text-white border-0 px-2 py-0.5 text-xs font-medium flex items-center gap-1.5 h-6">
          <CheckCircle2 className="h-3 w-3" />
          <span>Approved</span>
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive" className="px-2 py-0.5 text-xs font-medium flex items-center gap-1.5 h-6">
          <XCircle className="h-3 w-3" />
          <span>Rejected</span>
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="px-2 py-0.5 text-xs font-medium flex items-center gap-1.5 h-6">
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>
      );
    default:
      return <Badge variant="outline" className="px-2 py-0.5 text-xs h-6">{status}</Badge>;
  }
};

export const PartnersManagement = () => {
  const [searchInput, setSearchInput] = useState('');
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  // Fetch distributor applications
  const { data: applicationsResponse, isLoading, error, refetch } = useGetDistributorApplicationsQuery();

  // Update status mutation
  const [updateStatus, { isLoading: isUpdating }] = useUpdateDistributorApplicationStatusMutation();

  const applications = applicationsResponse?.results || [];
  const totalCount = applicationsResponse?.count || 0;

  // Filter applications based on search
  const filteredApplications = applications.filter((app) => {
    if (!searchInput) return true;
    const searchLower = searchInput.toLowerCase();
    return (
      app.user_full_name?.toLowerCase().includes(searchLower) ||
      app.user_email?.toLowerCase().includes(searchLower) ||
      app.user_username?.toLowerCase().includes(searchLower) ||
      app.company_name?.toLowerCase().includes(searchLower) ||
      String(app.id).includes(searchLower)
    );
  });

  const handleApprove = async () => {
    if (!approvingId) return;

    try {
      await updateStatus({
        applicationId: approvingId,
        status: 'approved',
      }).unwrap();
      toast.success('Distributor application approved successfully');
      setIsApproveDialogOpen(false);
      setApprovingId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve application');
    }
  };

  const handleApproveClick = (id: number) => {
    setApprovingId(id);
    setIsApproveDialogOpen(true);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Partners Management</h1>
            <p className="text-muted-foreground mt-1">View and manage distributor applications</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Failed to load distributor applications. Please try again.
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
          <h1 className="text-3xl font-bold text-foreground">Partners Management</h1>
          <p className="text-muted-foreground mt-1">View and manage distributor applications</p>
        </div>
      </div>

      {/* Total Count Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold text-pink-700 mt-1">{totalCount}</p>
              </div>
              <Users className="h-12 w-12 text-pink-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Distributor Applications</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchInput ? 'No applications found matching your search.' : 'No distributor applications found.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">User</TableHead>
                  <TableHead className="w-[30%]">Email</TableHead>
                  <TableHead className="w-[20%]">Submitted At</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="align-middle">
                      <div>
                        <div className="font-medium text-sm">{app.user_full_name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">ID: {app.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="text-sm">{app.user_email}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{app.user_username}</div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="text-sm text-muted-foreground">
                        {app.submitted_at
                          ? new Date(app.submitted_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center">
                        {getStatusBadge(app.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      {app.status !== 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleApproveClick(app.id)}
                          disabled={isUpdating}
                          className="bg-pink-600 hover:bg-pink-700 text-white h-7 px-3 text-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Distributor Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this distributor application? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isUpdating}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isUpdating ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

