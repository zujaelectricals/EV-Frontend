import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Star,
  TrendingDown,
  Calendar,
  User,
  FileDown,
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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TicketExtended } from '../types/supportTickets';
import { TicketDetailView } from '../components/TicketDetailView';

const mockClosedTickets: TicketExtended[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-201',
    subject: 'Password reset request',
    description: 'I forgot my password and need to reset it.',
    userId: 'U11001',
    userName: 'Robert Brown',
    userEmail: 'robert@example.com',
    status: 'closed',
    priority: 'medium',
    category: 'account',
    tags: ['password', 'reset'],
    replies: [
      {
        id: 'r1',
        ticketId: '1',
        message: 'We have sent a password reset link to your email. Please check your inbox.',
        authorId: 'admin1',
        authorName: 'Admin User',
        authorRole: 'admin',
        isInternal: false,
        createdAt: '2024-03-15T10:00:00',
      },
    ],
    slaStatus: 'on_time',
    responseTime: 30,
    resolutionTime: 45,
    firstResponseAt: '2024-03-15T10:00:00',
    createdAt: '2024-03-15T09:30:00',
    updatedAt: '2024-03-15T10:00:00',
    closedAt: '2024-03-15T10:15:00',
    resolvedBy: 'admin1',
    resolvedByName: 'Admin User',
    customerSatisfaction: 5,
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-202',
    subject: 'Order cancellation',
    description: 'I want to cancel my order #ORD12345',
    userId: 'U11002',
    userName: 'Sarah Wilson',
    userEmail: 'sarah@example.com',
    status: 'resolved',
    priority: 'high',
    category: 'general',
    tags: ['order', 'cancellation'],
    replies: [
      {
        id: 'r2',
        ticketId: '2',
        message: 'Your order has been cancelled and refund will be processed within 5-7 business days.',
        authorId: 'staff1',
        authorName: 'Support Staff 1',
        authorRole: 'staff',
        isInternal: false,
        createdAt: '2024-03-14T14:30:00',
      },
    ],
    slaStatus: 'on_time',
    responseTime: 60,
    resolutionTime: 120,
    firstResponseAt: '2024-03-14T14:30:00',
    createdAt: '2024-03-14T13:30:00',
    updatedAt: '2024-03-14T15:30:00',
    closedAt: '2024-03-14T15:30:00',
    resolvedBy: 'staff1',
    resolvedByName: 'Support Staff 1',
    customerSatisfaction: 4,
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-203',
    subject: 'Refund inquiry',
    description: 'When will I receive my refund?',
    userId: 'U11003',
    userName: 'David Lee',
    userEmail: 'david@example.com',
    status: 'closed',
    priority: 'medium',
    category: 'payment',
    tags: ['refund'],
    replies: [
      {
        id: 'r3',
        ticketId: '3',
        message: 'Your refund has been processed and will reflect in your account within 3-5 business days.',
        authorId: 'admin1',
        authorName: 'Admin User',
        authorRole: 'admin',
        isInternal: false,
        createdAt: '2024-03-13T11:00:00',
      },
    ],
    slaStatus: 'on_time',
    responseTime: 45,
    resolutionTime: 90,
    firstResponseAt: '2024-03-13T11:00:00',
    createdAt: '2024-03-13T10:15:00',
    updatedAt: '2024-03-13T12:45:00',
    closedAt: '2024-03-13T12:45:00',
    resolvedBy: 'admin1',
    resolvedByName: 'Admin User',
    customerSatisfaction: 5,
  },
];

const monthlyResolutionData = [
  { month: 'Jan', closed: 45, avgTime: 120 },
  { month: 'Feb', closed: 52, avgTime: 115 },
  { month: 'Mar', closed: 68, avgTime: 110 },
  { month: 'Apr', closed: 75, avgTime: 105 },
];

const satisfactionDistribution = [
  { rating: 5, count: 120 },
  { rating: 4, count: 85 },
  { rating: 3, count: 30 },
  { rating: 2, count: 10 },
  { rating: 1, count: 5 },
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

const renderStars = (rating?: number) => {
  if (!rating) return <span className="text-sm text-muted-foreground">No rating</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
        />
      ))}
      <span className="text-sm ml-1">({rating})</span>
    </div>
  );
};

export const ClosedTickets = () => {
  const [tickets, setTickets] = useState<TicketExtended[]>(mockClosedTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [satisfactionFilter, setSatisfactionFilter] = useState<string>('all');
  const [viewingTicket, setViewingTicket] = useState<TicketExtended | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesSatisfaction =
      satisfactionFilter === 'all' ||
      (satisfactionFilter === 'rated' && ticket.customerSatisfaction !== undefined) ||
      (satisfactionFilter !== 'all' &&
        satisfactionFilter !== 'rated' &&
        ticket.customerSatisfaction === parseInt(satisfactionFilter));
    return matchesSearch && matchesStatus && matchesSatisfaction;
  });

  const totalClosed = tickets.length;
  const avgResolutionTime =
    tickets.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / tickets.length;
  const satisfactionRate =
    tickets.filter((t) => t.customerSatisfaction !== undefined).length / tickets.length;
  const avgSatisfaction =
    tickets
      .filter((t) => t.customerSatisfaction !== undefined)
      .reduce((sum, t) => sum + (t.customerSatisfaction || 0), 0) /
    tickets.filter((t) => t.customerSatisfaction !== undefined).length;

  const handleViewTicket = (ticket: TicketExtended) => {
    setViewingTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleUpdateTicket = (updatedTicket: TicketExtended) => {
    setTickets(tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    setViewingTicket(updatedTicket);
  };

  const handleReopen = (ticket: TicketExtended) => {
    const updatedTicket: TicketExtended = {
      ...ticket,
      status: 'pending',
      closedAt: undefined,
      resolvedBy: undefined,
      resolvedByName: undefined,
      updatedAt: new Date().toISOString(),
    };
    handleUpdateTicket(updatedTicket);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Closed Tickets</h1>
          <p className="text-muted-foreground mt-1">View resolved and closed support tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Closed</p>
                  <p className="text-3xl font-bold text-success mt-1">{totalClosed}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                  <p className="text-3xl font-bold text-info mt-1">{formatTime(Math.round(avgResolutionTime))}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction Rate</p>
                  <p className="text-3xl font-bold text-success mt-1">
                    {Math.round(satisfactionRate * 100)}%
                  </p>
                </div>
                <Star className="h-8 w-8 text-success opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Satisfaction</p>
                  <p className="text-3xl font-bold text-warning mt-1">
                    {avgSatisfaction.toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Resolution Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyResolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="month" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="closed" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Closed Tickets" />
                  <Line type="monotone" dataKey="avgTime" stroke="hsl(221 83% 53%)" strokeWidth={2} name="Avg Time (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={satisfactionDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="rating" stroke="hsl(215 16% 47%)" fontSize={12} />
                  <YAxis stroke="hsl(215 16% 47%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid hsl(214 32% 91%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Closed Tickets</CardTitle>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={satisfactionFilter} onValueChange={setSatisfactionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="rated">Rated Only</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
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
                <TableHead>Resolution Time</TableHead>
                <TableHead>Closed Date</TableHead>
                <TableHead>Resolved By</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    <code className="text-sm bg-secondary px-2 py-1 rounded">{ticket.ticketNumber}</code>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-foreground">{ticket.subject}</p>
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
                    <span className="text-sm font-medium">{formatTime(ticket.resolutionTime)}</span>
                  </TableCell>
                  <TableCell>
                    {ticket.closedAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(ticket.closedAt).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.resolvedByName ? (
                      <span className="text-sm">{ticket.resolvedByName}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{renderStars(ticket.customerSatisfaction)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReopen(ticket)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

