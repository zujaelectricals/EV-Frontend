import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Clock,
  TrendingUp,
  Calendar,
  User,
} from 'lucide-react';
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
import { TicketExtended } from '../types/supportTickets';
import { TicketDetailView } from '../components/TicketDetailView';

const mockAnsweredTickets: TicketExtended[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-101',
    subject: 'Account verification issue',
    description: 'I am unable to verify my account. The OTP is not being received.',
    userId: 'U12001',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    status: 'answered',
    priority: 'medium',
    category: 'account',
    tags: ['account', 'verification'],
    replies: [
      {
        id: 'r1',
        ticketId: '1',
        message: 'We have sent a new OTP to your registered email. Please check your inbox and spam folder.',
        authorId: 'admin1',
        authorName: 'Admin User',
        authorRole: 'admin',
        isInternal: false,
        createdAt: '2024-03-21T14:30:00',
      },
    ],
    slaStatus: 'on_time',
    responseTime: 45,
    firstResponseAt: '2024-03-21T14:30:00',
    createdAt: '2024-03-21T14:20:00',
    updatedAt: '2024-03-21T14:30:00',
    assignedTo: 'admin1',
    assignedToName: 'Admin User',
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-102',
    subject: 'Payout inquiry',
    description: 'When will my payout be processed? I submitted the request 2 days ago.',
    userId: 'U12002',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    status: 'answered',
    priority: 'medium',
    category: 'payout',
    tags: ['payout'],
    replies: [
      {
        id: 'r2',
        ticketId: '2',
        message: 'Your payout request is under review and will be processed within 24-48 hours. You will receive a notification once it is approved.',
        authorId: 'staff1',
        authorName: 'Support Staff 1',
        authorRole: 'staff',
        isInternal: false,
        createdAt: '2024-03-20T16:00:00',
      },
    ],
    slaStatus: 'on_time',
    responseTime: 120,
    firstResponseAt: '2024-03-20T16:00:00',
    createdAt: '2024-03-20T14:00:00',
    updatedAt: '2024-03-20T16:00:00',
    assignedTo: 'staff1',
    assignedToName: 'Support Staff 1',
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-103',
    subject: 'Technical support needed',
    description: 'I am facing issues while accessing the dashboard. Getting error 500.',
    userId: 'U12003',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    status: 'answered',
    priority: 'high',
    category: 'technical',
    tags: ['technical', 'error'],
    replies: [
      {
        id: 'r3',
        ticketId: '3',
        message: 'We have identified the issue and are working on a fix. Please try clearing your browser cache and cookies. If the issue persists, please let us know.',
        authorId: 'admin1',
        authorName: 'Admin User',
        authorRole: 'admin',
        isInternal: false,
        createdAt: '2024-03-19T10:15:00',
      },
    ],
    slaStatus: 'on_time',
    responseTime: 30,
    firstResponseAt: '2024-03-19T10:15:00',
    createdAt: '2024-03-19T09:45:00',
    updatedAt: '2024-03-19T10:15:00',
    assignedTo: 'admin1',
    assignedToName: 'Admin User',
  },
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'high':
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case 'medium':
      return <Badge variant="default">Medium</Badge>;
    case 'low':
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

const formatTime = (minutes?: number) => {
  if (!minutes) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const AnsweredTickets = () => {
  const [tickets] = useState<TicketExtended[]>(mockAnsweredTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewingTicket, setViewingTicket] = useState<TicketExtended | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    return matchesSearch && matchesCategory && ticket.status === 'answered';
  });

  const totalAnswered = tickets.length;
  const awaitingResponse = tickets.filter((t) => {
    const lastReply = t.replies[t.replies.length - 1];
    if (!lastReply) return false;
    const lastReplyDate = new Date(lastReply.createdAt);
    const daysSinceReply = (Date.now() - lastReplyDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceReply > 1; // Awaiting response if no reply in 1 day
  }).length;
  const avgResponseTime = tickets.reduce((sum, t) => sum + (t.responseTime || 0), 0) / tickets.length;

  const handleViewTicket = (ticket: TicketExtended) => {
    setViewingTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleUpdateTicket = (updatedTicket: TicketExtended) => {
    // Update logic would go here
    setViewingTicket(updatedTicket);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Answered Tickets</h1>
          <p className="text-muted-foreground mt-1">Tickets with responses awaiting customer reply</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Answered</p>
                  <p className="text-3xl font-bold text-info mt-1">{totalAnswered}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Awaiting Response</p>
                  <p className="text-3xl font-bold text-warning mt-1">{awaitingResponse}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <p className="text-3xl font-bold text-success mt-1">{formatTime(Math.round(avgResponseTime))}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Answered Tickets</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Last Reply</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const lastReply = ticket.replies[ticket.replies.length - 1];
                const lastReplyDate = lastReply ? new Date(lastReply.createdAt) : null;
                const daysSinceReply = lastReplyDate
                  ? Math.floor((Date.now() - lastReplyDate.getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      <code className="text-sm bg-secondary px-2 py-1 rounded">{ticket.ticketNumber}</code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{ticket.subject}</p>
                        {lastReply && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            Last reply: {lastReply.message.substring(0, 60)}...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{ticket.userName}</p>
                          <p className="text-xs text-muted-foreground">{ticket.userEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>
                      {lastReplyDate ? (
                        <div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{lastReplyDate.toLocaleDateString()}</span>
                          </div>
                          {daysSinceReply > 1 && (
                            <Badge variant="outline" className="text-xs text-warning mt-1">
                              {daysSinceReply} days ago
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{formatTime(ticket.responseTime)}</span>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedToName ? (
                        <span className="text-sm">{ticket.assignedToName}</span>
                      ) : (
                        <Badge variant="outline" className="text-xs">Unassigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticket Detail View */}
      {viewingTicket && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <TicketDetailView
              ticket={viewingTicket}
              onUpdate={handleUpdateTicket}
              onClose={() => {
                setIsDetailOpen(false);
                setViewingTicket(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

