import { motion } from 'framer-motion';
import { useState } from 'react';
import { Phone, PhoneCall, Search, Filter, Download, Send, CheckCircle } from 'lucide-react';
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

const mockMobileUnverified: UserExtended[] = [
  {
    id: '1',
    userId: 'U40001',
    name: 'Kiran Desai',
    email: 'kiran@example.com',
    phone: '+91 98765 43240',
    role: 'user',
    status: 'active',
    kycStatus: 'not_submitted',
    emailVerified: true,
    phoneVerified: false,
    joinDate: '2024-03-12',
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: '2',
    userId: 'U40002',
    name: 'Meera Nair',
    email: 'meera@example.com',
    phone: '+91 98765 43241',
    role: 'user',
    status: 'active',
    kycStatus: 'not_submitted',
    emailVerified: false,
    phoneVerified: false,
    joinDate: '2024-03-16',
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: '3',
    userId: 'U40003',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 98765 43242',
    role: 'distributor',
    status: 'active',
    kycStatus: 'pending',
    emailVerified: true,
    phoneVerified: false,
    joinDate: '2024-03-19',
    totalOrders: 1,
    totalSpent: 50000,
  },
];

export const MobileUnverified = () => {
  const [users, setUsers] = useState<UserExtended[]>(mockMobileUnverified);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    return matchesSearch && !user.phoneVerified;
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

  const handleSendVerificationSMS = (id?: string) => {
    const userIds = id ? [id] : selectedUsers;
    // Send verification SMS
    console.log('Sending verification SMS to:', userIds);
    setSelectedUsers([]);
  };

  const handleMarkAsVerified = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, phoneVerified: true } : u)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mobile Unverified Users</h1>
          <p className="text-muted-foreground mt-1">Manage users with unverified mobile numbers</p>
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
            <Button size="sm" onClick={() => handleSendVerificationSMS()}>
              <Send className="h-4 w-4 mr-2" />
              Send SMS ({selectedUsers.length})
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
                  <p className="text-sm font-medium text-muted-foreground">Unverified Mobile</p>
                  <p className="text-3xl font-bold text-warning mt-1">{filteredUsers.length}</p>
                </div>
                <Phone className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">SMS Sent</p>
                  <p className="text-3xl font-bold text-info mt-1">189</p>
                </div>
                <PhoneCall className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-3xl font-bold text-success mt-1">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unverified Mobile Users</CardTitle>
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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Email Verified</TableHead>
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
                      <Phone className="h-4 w-4 text-destructive" />
                      <span className="text-sm">{user.phone}</span>
                      <Badge variant="destructive" className="text-xs">Unverified</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
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
                      <Button variant="outline" size="sm" onClick={() => handleSendVerificationSMS(user.id)}>
                        <Send className="h-4 w-4 mr-1" />
                        Send SMS
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

