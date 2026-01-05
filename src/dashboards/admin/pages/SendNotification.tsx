import { motion } from 'framer-motion';
import { useState } from 'react';
import { Bell, Send, Mail, MessageSquare, Smartphone, Plus, Search, Filter, Download, Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationCampaign, NotificationTemplate } from '../types/userManagement';

const mockTemplates: NotificationTemplate[] = [
  {
    id: 't1',
    title: 'KYC Verification Reminder',
    message: 'Your KYC verification is pending. Please complete your KYC to continue using our services.',
    type: 'email',
    category: 'kyc',
    createdAt: '2024-01-15',
  },
  {
    id: 't2',
    title: 'Payment Success',
    message: 'Your payment of ₹{amount} has been processed successfully. Thank you for your purchase!',
    type: 'sms',
    category: 'transaction',
    createdAt: '2024-01-20',
  },
  {
    id: 't3',
    title: 'Payout Approved',
    message: 'Your payout request of ₹{amount} has been approved and will be processed shortly.',
    type: 'push',
    category: 'payout',
    createdAt: '2024-02-01',
  },
];

const mockCampaigns: NotificationCampaign[] = [
  {
    id: 'c1',
    title: 'KYC Verification Campaign',
    message: 'Complete your KYC verification to unlock all features',
    type: 'email',
    targetUsers: 'kyc_pending',
    status: 'sent',
    totalRecipients: 245,
    sentCount: 245,
    failedCount: 0,
    sentAt: '2024-03-20 10:00',
    createdAt: '2024-03-20 09:30',
    createdBy: 'Admin User',
  },
  {
    id: 'c2',
    title: 'Payment Reminder',
    message: 'Your payment is due. Please complete your payment to avoid service interruption.',
    type: 'sms',
    targetUsers: 'custom',
    customUserIds: ['U12345', 'U12346'],
    status: 'scheduled',
    totalRecipients: 2,
    sentCount: 0,
    failedCount: 0,
    scheduledAt: '2024-03-25 14:00',
    createdAt: '2024-03-22 11:00',
    createdBy: 'Admin User',
  },
  {
    id: 'c3',
    title: 'New Feature Announcement',
    message: 'We have launched new features! Check them out now.',
    type: 'in_app',
    targetUsers: 'all',
    status: 'sending',
    totalRecipients: 11000,
    sentCount: 8500,
    failedCount: 12,
    createdAt: '2024-03-22 15:00',
    createdBy: 'Admin User',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'sent':
      return <Badge className="bg-success text-white">Sent</Badge>;
    case 'scheduled':
      return <Badge variant="default">Scheduled</Badge>;
    case 'sending':
      return <Badge variant="secondary">Sending</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'sms':
      return <MessageSquare className="h-4 w-4" />;
    case 'push':
      return <Bell className="h-4 w-4" />;
    case 'in_app':
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const SendNotification = () => {
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>(mockCampaigns);
  const [templates] = useState<NotificationTemplate[]>(mockTemplates);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'email' as 'email' | 'sms' | 'push' | 'in_app',
    targetUsers: 'all' as 'all' | 'active' | 'paid' | 'kyc_pending' | 'custom',
    customUserIds: '',
    scheduledAt: '',
  });

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateCampaign = () => {
    const newCampaign: NotificationCampaign = {
      id: `c${Date.now()}`,
      title: formData.title,
      message: formData.message,
      type: formData.type,
      targetUsers: formData.targetUsers,
      customUserIds: formData.targetUsers === 'custom' ? formData.customUserIds.split(',').map((id) => id.trim()) : undefined,
      scheduledAt: formData.scheduledAt || undefined,
      status: formData.scheduledAt ? 'scheduled' : 'draft',
      totalRecipients: 0,
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin User',
    };
    setCampaigns([...campaigns, newCampaign]);
    setIsCreateDialogOpen(false);
    setFormData({
      title: '',
      message: '',
      type: 'email',
      targetUsers: 'all',
      customUserIds: '',
      scheduledAt: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Send Notification</h1>
          <p className="text-muted-foreground mt-1">Create and manage notification campaigns</p>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Notification Campaign</DialogTitle>
                <DialogDescription>Send notifications to users</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Campaign Details</TabsTrigger>
                  <TabsTrigger value="template">Use Template</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      placeholder="Campaign title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message *</Label>
                    <Textarea
                      placeholder="Notification message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notification Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'email' | 'sms' | 'push' | 'in_app') =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="in_app">In-App Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Users *</Label>
                    <Select
                      value={formData.targetUsers}
                      onValueChange={(value: 'all' | 'active' | 'paid' | 'kyc_pending' | 'custom') =>
                        setFormData({ ...formData, targetUsers: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active Users</SelectItem>
                        <SelectItem value="paid">Paid Users</SelectItem>
                        <SelectItem value="kyc_pending">KYC Pending</SelectItem>
                        <SelectItem value="custom">Custom Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.targetUsers === 'custom' && (
                    <div className="space-y-2">
                      <Label>User IDs (comma-separated) *</Label>
                      <Input
                        placeholder="U12345, U12346, U12347"
                        value={formData.customUserIds}
                        onChange={(e) => setFormData({ ...formData, customUserIds: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Schedule (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="template" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Template preview will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign} disabled={!formData.title || !formData.message}>
                  {formData.scheduledAt ? 'Schedule' : 'Create'} Campaign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{campaigns.length}</p>
                </div>
                <Bell className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Sent</p>
                  <p className="text-3xl font-bold text-success mt-1">
                    {campaigns.filter((c) => c.status === 'sent').length}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    {campaigns.filter((c) => c.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                  <p className="text-3xl font-bold text-info mt-1">
                    {campaigns.reduce((sum, c) => sum + c.sentCount, 0)}
                  </p>
                </div>
                <Send className="h-8 w-8 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notification Campaigns</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sending">Sending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{campaign.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{campaign.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(campaign.type)}
                      <span className="text-sm capitalize">{campaign.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {campaign.targetUsers.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{campaign.totalRecipients}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent: {campaign.sentCount} | Failed: {campaign.failedCount}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{campaign.createdAt.split('T')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
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

