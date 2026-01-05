import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, MailCheck, Search, Filter, Download, Send, CheckCircle, XCircle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { UserExtended } from '../types/userManagement';

const mockEmailUnverified: UserExtended[] = [
  {
    id: '1',
    userId: 'U30001',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91 98765 43230',
    role: 'user',
    status: 'active',
    kycStatus: 'not_submitted',
    emailVerified: false,
    phoneVerified: true,
    joinDate: '2024-03-10',
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: '2',
    userId: 'U30002',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '+91 98765 43231',
    role: 'user',
    status: 'active',
    kycStatus: 'not_submitted',
    emailVerified: false,
    phoneVerified: false,
    joinDate: '2024-03-15',
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: '3',
    userId: 'U30003',
    name: 'Ravi Kumar',
    email: 'ravi@example.com',
    phone: '+91 98765 43232',
    role: 'distributor',
    status: 'active',
    kycStatus: 'pending',
    emailVerified: false,
    phoneVerified: true,
    joinDate: '2024-03-18',
    totalOrders: 1,
    totalSpent: 50000,
  },
];

export const EmailUnverified = () => {
  const [users, setUsers] = useState<UserExtended[]>(mockEmailUnverified);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && !user.emailVerified;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    }
  };

  const handleSendVerificationEmail = (id?: string) => {
    const userIds = id ? [id] : selectedUsers;
    // Send verification emails
    console.log('Sending verification emails to:', userIds);
    setSelectedUsers([]);
  };

  const handleMarkAsVerified = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, emailVerified: true } : u)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Unverified Users</h1>
          <p className="text-muted-foreground mt-1">Manage users with unverified email addresses</p>
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
          {selectedUsers.length > 0 && (
            <Button size="sm" onClick={() => handleSendVerificationEmail()}>
              <Send className="h-4 w-4 mr-2" />
              Send Verification ({selectedUsers.length})
            </Button>
          )}
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
                  <p className="text-sm font-medium text-muted-foreground">Unverified Emails</p>
                  <p className="text-3xl font-bold text-warning mt-1">{filteredUsers.length}</p>
                </div>
                <Mail className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Verification Sent</p>
                  <p className="text-3xl font-bold text-info mt-1">245</p>
                </div>
                <Send className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-3xl font-bold text-success mt-1">12</p>
                </div>
                <MailCheck className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unverified Email Users</CardTitle>
            <div className="flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Phone Verified</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-destructive" />
                      <span className="text-sm">{user.email}</span>
                      <Badge variant="destructive" className="text-xs">Unverified</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.phone}</span>
                  </TableCell>
                  <TableCell>
                    {user.phoneVerified ? (
                      <Badge className="bg-success text-white">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.joinDate}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSendVerificationEmail(user.id)}>
                        <Send className="h-4 w-4 mr-1" />
                        Send Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsVerified(user.id)}
                        className="bg-success hover:bg-success/90 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Verified
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

