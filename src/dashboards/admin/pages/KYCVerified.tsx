import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CheckCircle, Search, Filter, Download, Eye, Shield } from 'lucide-react';
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
import { KYCDetails } from '@/app/slices/authSlice';

interface VerifiedKYCUser {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  kycStatus: 'verified';
  kycDetails: KYCDetails;
}

export const KYCVerified = () => {
  const [users, setUsers] = useState<VerifiedKYCUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<VerifiedKYCUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    // Load verified KYC users from localStorage
    const loadVerifiedUsers = () => {
      const kycDataStr = localStorage.getItem('ev_nexus_kyc_data');
      if (!kycDataStr) {
        setUsers([]);
        return;
      }

      try {
        const kycData = JSON.parse(kycDataStr);
        const verifiedUsers: VerifiedKYCUser[] = [];

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

        // Check multiple accounts
        const multipleAccountsKey = 'ev_nexus_multiple_accounts';
        const multipleAccountsStr = localStorage.getItem(multipleAccountsKey);
        let multipleAccounts: any[] = [];
        if (multipleAccountsStr) {
          try {
            multipleAccounts = JSON.parse(multipleAccountsStr);
          } catch (e) {
            console.error('Error parsing multiple accounts:', e);
          }
        }

        Object.entries(kycData).forEach(([userId, kyc]: [string, any]) => {
          if (kyc.kycStatus === 'verified') {
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
              } else {
                // Check multiple accounts
                const account = multipleAccounts.find((acc: any) => acc.user?.id === userId);
                if (account?.user) {
                  userName = account.user.name || 'Unknown User';
                  userEmail = account.user.email || '';
                  userPhone = account.user.phone || '';
                }
              }
            }

            verifiedUsers.push({
              userId,
              name: userName,
              email: userEmail,
              phone: userPhone,
              kycStatus: 'verified',
              kycDetails: kyc.kycDetails,
            });
          }
        });

        setUsers(verifiedUsers);
      } catch (error) {
        console.error('Error loading verified KYC users:', error);
        setUsers([]);
      }
    };

    loadVerifiedUsers();
    // Refresh every 5 seconds
    const interval = setInterval(loadVerifiedUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalVerified = users.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KYC Verified</h1>
          <p className="text-muted-foreground mt-1">View all users with verified KYC documents</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Verified</p>
                  <p className="text-3xl font-bold text-success mt-1">{totalVerified}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {users.filter((user) => {
                      if (!user.kycDetails?.verifiedAt) return false;
                      const verifiedDate = new Date(user.kycDetails.verifiedAt);
                      const now = new Date();
                      return verifiedDate.getMonth() === now.getMonth() && 
                             verifiedDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Verified Today</p>
                  <p className="text-3xl font-bold text-info mt-1">
                    {users.filter((user) => {
                      if (!user.kycDetails?.verifiedAt) return false;
                      const verifiedDate = new Date(user.kycDetails.verifiedAt);
                      const today = new Date();
                      return verifiedDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verified KYC Users</CardTitle>
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
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No verified KYC users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Aadhar</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Verified Date</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.userId}>
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
                      {user.kycDetails?.verifiedAt ? (
                        <span className="text-sm">{new Date(user.kycDetails.verifiedAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.kycDetails?.verifiedBy ? (
                        <span className="text-sm font-medium">{user.kycDetails.verifiedBy}</span>
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
          )}
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verified KYC Details</DialogTitle>
            <DialogDescription>KYC verification information for {viewingUser?.name}</DialogDescription>
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
                  <Badge className="bg-success text-white">Verified</Badge>
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
                {viewingUser.kycDetails?.verifiedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Verified At</Label>
                    <p className="font-medium">{new Date(viewingUser.kycDetails.verifiedAt).toLocaleString()}</p>
                  </div>
                )}
                {viewingUser.kycDetails?.verifiedBy && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Verified By</Label>
                    <p className="font-medium">{viewingUser.kycDetails.verifiedBy}</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <Label className="text-xs text-success mb-2 block">Verification Status</Label>
                <p className="text-sm">This user's KYC has been successfully verified and approved.</p>
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

