import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileCheck, Search, Filter, Download, Eye, CheckCircle, XCircle, FileText, Image as ImageIcon } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSelector } from '@/app/hooks';
import {
  useGetPendingKYCQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
} from '@/app/api/kycApi';
import { toast } from 'sonner';
import type { PendingKYCUser } from '@/app/api/kycApi';

export const KYCPending = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingUser, setViewingUser] = useState<PendingKYCUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectingUser, setRejectingUser] = useState<PendingKYCUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: pendingUsers = [], refetch } = useGetPendingKYCQuery();
  const [approveKYC] = useApproveKYCMutation();
  const [rejectKYC] = useRejectKYCMutation();

  const filteredUsers = pendingUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPending = pendingUsers.length;

  const handleApprove = async (userId: string) => {
    try {
      await approveKYC({
        userId,
        verifiedBy: currentUser?.name || 'Admin',
      }).unwrap();
      toast.success('KYC approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data || 'Failed to approve KYC');
    }
  };

  const handleReject = (user: PendingKYCUser) => {
    setRejectingUser(user);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (rejectingUser && rejectionReason) {
      try {
        await rejectKYC({
          userId: rejectingUser.userId,
          rejectionReason,
          rejectedBy: currentUser?.name || 'Admin',
        }).unwrap();
        toast.success('KYC rejected successfully');
        setIsRejectDialogOpen(false);
        setRejectingUser(null);
        setRejectionReason('');
        refetch();
      } catch (error: any) {
        toast.error(error?.data || 'Failed to reject KYC');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KYC Pending</h1>
          <p className="text-muted-foreground mt-1">Review and verify KYC documents</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
                  <p className="text-3xl font-bold text-warning mt-1">{totalPending}</p>
                </div>
                <FileCheck className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                  <p className="text-3xl font-bold text-success mt-1">5</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Rejected Today</p>
                  <p className="text-3xl font-bold text-destructive mt-1">2</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending KYC Applications</CardTitle>
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
                <TableHead>Submitted Date</TableHead>
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
                    {user.kycDetails?.submittedAt ? (
                      <span className="text-sm">{new Date(user.kycDetails.submittedAt).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingUser(user);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleApprove(user.userId)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(user)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View KYC Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Review</DialogTitle>
            <DialogDescription>Review KYC documents for {viewingUser?.name}</DialogDescription>
          </DialogHeader>
          {viewingUser && (
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
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{viewingUser.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">User ID</Label>
                      <p className="font-medium">{viewingUser.userId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{viewingUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="font-medium">{viewingUser.phone}</p>
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
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {viewingUser.kycDetails?.documents?.aadhar && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Aadhar Card</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingUser.kycDetails.documents.aadhar}
                            alt="Aadhar Card"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                    {viewingUser.kycDetails?.documents?.pan && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">PAN Card</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingUser.kycDetails.documents.pan}
                            alt="PAN Card"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                    {viewingUser.kycDetails?.documents?.bankStatement && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Bank Statement</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={viewingUser.kycDetails.documents.bankStatement}
                            alt="Bank Statement"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="bank" className="space-y-4">
                  {viewingUser.bankDetails && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Holder Name</Label>
                        <p className="font-medium">{viewingUser.bankDetails.accountHolderName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Number</Label>
                        <p className="font-medium">{viewingUser.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">IFSC Code</Label>
                        <p className="font-medium">{viewingUser.bankDetails.ifsc}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Bank Name</Label>
                        <p className="font-medium">{viewingUser.bankDetails.bankName}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="address" className="space-y-4">
                  {viewingUser.address && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Street</Label>
                        <p className="font-medium">{viewingUser.address.street}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">City</Label>
                        <p className="font-medium">{viewingUser.address.city}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">State</Label>
                        <p className="font-medium">{viewingUser.address.state}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Pincode</Label>
                        <p className="font-medium">{viewingUser.address.pincode}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Country</Label>
                        <p className="font-medium">{viewingUser.address.country}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (viewingUser) {
                  setIsViewDialogOpen(false);
                  handleReject(viewingUser);
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={() => {
                if (viewingUser) {
                  handleApprove(viewingUser.userId);
                  setIsViewDialogOpen(false);
                }
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve KYC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject KYC Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>Provide a reason for rejecting KYC for {rejectingUser?.name}</DialogDescription>
          </DialogHeader>
          {rejectingUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">User</Label>
                <p className="font-medium">{rejectingUser.name}</p>
                <p className="text-xs text-muted-foreground">{rejectingUser.userId}</p>
                <p className="text-xs text-muted-foreground">{rejectingUser.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  placeholder="Enter reason for rejection..."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

