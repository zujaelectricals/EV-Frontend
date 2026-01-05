import { motion } from 'framer-motion';
import { useState } from 'react';
import { UserX, Ban, Search, Filter, Download, Eye, Unlock, AlertTriangle, Calendar } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { UserExtended } from '../types/userManagement';

const mockBlockedUsers: UserExtended[] = [
  {
    id: '1',
    userId: 'U20001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43220',
    role: 'user',
    status: 'blocked',
    kycStatus: 'rejected',
    emailVerified: true,
    phoneVerified: true,
    joinDate: '2024-01-05',
    totalOrders: 0,
    totalSpent: 0,
    blockReason: 'Suspicious activity detected. Multiple failed payment attempts.',
    blockedAt: '2024-03-15 10:30',
    blockedBy: 'Admin User',
  },
  {
    id: '2',
    userId: 'U20002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 98765 43221',
    role: 'user',
    status: 'blocked',
    kycStatus: 'rejected',
    emailVerified: false,
    phoneVerified: false,
    joinDate: '2024-02-10',
    totalOrders: 0,
    totalSpent: 0,
    blockReason: 'Violation of terms of service. Fraudulent activity.',
    blockedAt: '2024-03-18 14:20',
    blockedBy: 'Admin User',
  },
  {
    id: '3',
    userId: 'U20003',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+91 98765 43222',
    role: 'distributor',
    status: 'blocked',
    kycStatus: 'rejected',
    emailVerified: true,
    phoneVerified: true,
    joinDate: '2023-12-20',
    totalOrders: 2,
    totalSpent: 85000,
    blockReason: 'KYC documents rejected multiple times. Invalid documents submitted.',
    blockedAt: '2024-03-20 09:15',
    blockedBy: 'Admin User',
  },
];

export const BlockedUsers = () => {
  const [users, setUsers] = useState<UserExtended[]>(mockBlockedUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<UserExtended | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const [unblockingUser, setUnblockingUser] = useState<UserExtended | null>(null);
  const [unblockReason, setUnblockReason] = useState('');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && user.status === 'blocked';
  });

  const totalBlocked = users.length;

  const handleUnblock = (user: UserExtended) => {
    setUnblockingUser(user);
    setIsUnblockDialogOpen(true);
  };

  const confirmUnblock = () => {
    if (unblockingUser) {
      setUsers(
        users.map((u) =>
          u.id === unblockingUser.id
            ? {
                ...u,
                status: 'active' as const,
                blockReason: undefined,
                blockedAt: undefined,
                blockedBy: undefined,
              }
            : u
        )
      );
      setIsUnblockDialogOpen(false);
      setUnblockingUser(null);
      setUnblockReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blocked Users</h1>
          <p className="text-muted-foreground mt-1">Manage blocked and suspended user accounts</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Blocked</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{totalBlocked}</p>
                </div>
                <UserX className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-3xl font-bold text-foreground mt-1">8</p>
                </div>
                <Ban className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Unblocked</p>
                  <p className="text-3xl font-bold text-success mt-1">3</p>
                </div>
                <Unlock className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Blocked Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Blocked Users List</CardTitle>
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
                <TableHead>Block Reason</TableHead>
                <TableHead>Blocked Date</TableHead>
                <TableHead>Blocked By</TableHead>
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
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2 max-w-md">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{user.blockReason || 'No reason provided'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.blockedAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{user.blockedAt.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.blockedBy || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setViewingUser(user);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleUnblock(user)}>
                        <Unlock className="h-4 w-4 mr-1" />
                        Unblock
                      </Button>
                    </div>
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
            <DialogTitle>Blocked User Details</DialogTitle>
            <DialogDescription>Complete information about {viewingUser?.name}</DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="font-medium">{viewingUser.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{viewingUser.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{viewingUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{viewingUser.phone}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant="destructive">Blocked</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Join Date</Label>
                  <p className="font-medium">{viewingUser.joinDate}</p>
                </div>
              </div>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Label className="text-xs text-destructive mb-2 block">Block Reason</Label>
                <p className="text-sm">{viewingUser.blockReason || 'No reason provided'}</p>
              </div>
              {viewingUser.blockedAt && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Blocked At</Label>
                    <p className="font-medium">{viewingUser.blockedAt}</p>
                  </div>
                  {viewingUser.blockedBy && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Blocked By</Label>
                      <p className="font-medium">{viewingUser.blockedBy}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (viewingUser) {
                  setIsViewDialogOpen(false);
                  handleUnblock(viewingUser);
                }
              }}
            >
              <Unlock className="h-4 w-4 mr-2" />
              Unblock User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock User Dialog */}
      <Dialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock User</DialogTitle>
            <DialogDescription>Confirm unblocking {unblockingUser?.name}</DialogDescription>
          </DialogHeader>
          {unblockingUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">User</Label>
                <p className="font-medium">{unblockingUser.name}</p>
                <p className="text-xs text-muted-foreground">{unblockingUser.userId}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Block Reason</Label>
                <p className="text-sm text-muted-foreground">{unblockingUser.blockReason}</p>
              </div>
              <div className="space-y-2">
                <Label>Unblock Reason (Optional)</Label>
                <Textarea
                  placeholder="Enter reason for unblocking..."
                  rows={3}
                  value={unblockReason}
                  onChange={(e) => setUnblockReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnblockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUnblock}>
              <Unlock className="h-4 w-4 mr-2" />
              Confirm Unblock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

