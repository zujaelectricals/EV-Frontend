import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileX, Search, Filter, Download, Eye, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { PendingKYCUser } from '@/app/api/kycApi';
import { KYCDetails } from '@/app/slices/authSlice';

interface RejectedKYCUser {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  kycStatus: 'rejected';
  kycDetails: KYCDetails;
}

export const KYCRejected = () => {
  const [users, setUsers] = useState<RejectedKYCUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<RejectedKYCUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    // Load rejected KYC users from localStorage
    const loadRejectedUsers = () => {
      const kycDataStr = localStorage.getItem('ev_nexus_kyc_data');
      if (!kycDataStr) {
        setUsers([]);
        return;
      }

      try {
        const kycData = JSON.parse(kycDataStr);
        const rejectedUsers: RejectedKYCUser[] = [];

        // Get all users from localStorage
        const usersKey = 'ev_nexus_users';
        const storedUsers = localStorage.getItem(usersKey);
        let allUsers: any[] = [];
        if (storedUsers) {
          try {
            allUsers = JSON.parse(storedUsers);
          } catch (e) {
            console.error('Error parsing users:', e);
          }
        }

        // Get current auth
        const authDataStr = localStorage.getItem('ev_nexus_auth_data');
        let authData: any = null;
        if (authDataStr) {
          try {
            authData = JSON.parse(authDataStr);
          } catch (e) {
            console.error('Error parsing auth data:', e);
          }
        }

        Object.entries(kycData).forEach(([userId, kyc]: [string, any]) => {
          if (kyc.kycStatus === 'rejected') {
            let userName = 'Unknown User';
            let userEmail = '';
            let userPhone = '';

            // Check current auth
            if (authData?.user?.id === userId) {
              userName = authData.user.name || 'Unknown User';
              userEmail = authData.user.email || '';
              userPhone = authData.user.phone || '';
            } else {
              // Check stored users
              const user = allUsers.find((u: any) => u.id === userId);
              if (user) {
                userName = user.name || 'Unknown User';
                userEmail = user.email || '';
                userPhone = user.phone || '';
              }
            }

            rejectedUsers.push({
              userId,
              name: userName,
              email: userEmail,
              phone: userPhone,
              kycStatus: 'rejected',
              kycDetails: kyc.kycDetails,
            });
          }
        });

        setUsers(rejectedUsers);
      } catch (error) {
        console.error('Error loading rejected KYC users:', error);
        setUsers([]);
      }
    };

    loadRejectedUsers();
    // Refresh every 5 seconds
    const interval = setInterval(loadRejectedUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalRejected = users.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KYC Rejected</h1>
          <p className="text-muted-foreground mt-1">View rejected KYC applications and rejection reasons</p>
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
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rejected</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{totalRejected}</p>
                </div>
                <FileX className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold text-foreground mt-1">12</p>
                </div>
                <XCircle className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Resubmissions</p>
                  <p className="text-3xl font-bold text-info mt-1">3</p>
                </div>
                <RefreshCw className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rejected KYC Applications</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Aadhar</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Rejection Reason</TableHead>
                <TableHead>Rejected Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.kycDetails?.aadharNumber ? (
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{user.kycDetails.aadharNumber}</code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.kycDetails?.panNumber ? (
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{user.kycDetails.panNumber}</code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2 max-w-md">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {user.kycDetails?.rejectionReason || 'No reason provided'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.kycDetails?.rejectedAt ? (
                      <span className="text-sm">{new Date(user.kycDetails.rejectedAt).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setViewingUser(user);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rejected KYC Details</DialogTitle>
            <DialogDescription>KYC rejection information for {viewingUser?.name}</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="font-medium">{viewingUser.name}</p>
                  <p className="text-xs text-muted-foreground">{viewingUser.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">KYC Status</Label>
                  <Badge variant="destructive">Rejected</Badge>
                </div>
                {viewingUser.kycDetails?.aadharNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Aadhar Number</Label>
                    <p className="font-medium">{viewingUser.kycDetails.aadharNumber}</p>
                  </div>
                )}
                {viewingUser.kycDetails?.panNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">PAN Number</Label>
                    <p className="font-medium">{viewingUser.kycDetails.panNumber}</p>
                  </div>
                )}
                {viewingUser.kycDetails?.submittedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Submitted At</Label>
                    <p className="font-medium">{new Date(viewingUser.kycDetails.submittedAt).toLocaleString()}</p>
                  </div>
                )}
                {viewingUser.kycDetails?.rejectedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Rejected At</Label>
                    <p className="font-medium">{new Date(viewingUser.kycDetails.rejectedAt).toLocaleString()}</p>
                  </div>
                )}
                {viewingUser.kycDetails?.verifiedBy && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Rejected By</Label>
                    <p className="font-medium">{viewingUser.kycDetails.verifiedBy}</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Label className="text-xs text-destructive mb-2 block">Rejection Reason</Label>
                <p className="text-sm">{viewingUser.kycDetails?.rejectionReason || 'No reason provided'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

