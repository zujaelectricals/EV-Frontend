import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  FileDown,
  Save,
  Clock,
  CheckCircle,
  MessageSquare,
  XCircle,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { TicketExtended, TicketStatus, TicketPriority, TicketCategory } from '../types/supportTickets';
import { TicketDetailView } from '../components/TicketDetailView';

const mockAllTickets: TicketExtended[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    subject: 'Payment not received',
    description: 'Payment issue description',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    status: 'pending',
    priority: 'high',
    category: 'payment',
    tags: ['payment'],
    replies: [],
    slaStatus: 'at_risk',
    responseTime: 90,
    createdAt: '2024-03-22T10:30:00',
    updatedAt: '2024-03-22T10:30:00',
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    subject: 'Account verification issue',
    description: 'Account issue description',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    status: 'answered',
    priority: 'medium',
    category: 'account',
    tags: ['account'],
    replies: [
      {
        id: 'r1',
        ticketId: '2',
        message: 'Response message',
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
    id: '3',
    ticketNumber: 'TKT-2024-003',
    subject: 'Product delivery delay',
    description: 'Delivery issue description',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    status: 'closed',
    priority: 'high',
    category: 'delivery',
    tags: ['delivery'],
    replies: [
      {
        id: 'r2',
        ticketId: '3',
        message: 'Resolution message',
        authorId: 'staff1',
        authorName: 'Support Staff 1',
        authorRole: 'staff',
        isInternal: false,
        createdAt: '2024-03-20T15:00:00',
      },
    ],
    slaStatus: 'on_time',
    responseTime: 60,
    resolutionTime: 120,
    firstResponseAt: '2024-03-20T15:00:00',
    createdAt: '2024-03-20T14:00:00',
    updatedAt: '2024-03-20T16:00:00',
    closedAt: '2024-03-20T16:00:00',
    resolvedBy: 'staff1',
    resolvedByName: 'Support Staff 1',
    customerSatisfaction: 5,
  },
];

const getStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="default">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge className="bg-info text-white">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case 'answered':
      return (
        <Badge className="bg-warning text-white">
          <MessageSquare className="h-3 w-3 mr-1" />
          Answered
        </Badge>
      );
    case 'closed':
      return (
        <Badge className="bg-success text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Closed
        </Badge>
      );
    case 'resolved':
      return (
        <Badge className="bg-success text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: TicketPriority) => {
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

export const AllTickets = () => {
  const [tickets] = useState<TicketExtended[]>(mockAllTickets);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewingTicket, setViewingTicket] = useState<TicketExtended | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter((t) => t.status === 'pending').length;
  const answeredTickets = tickets.filter((t) => t.status === 'answered').length;
  const closedTickets = tickets.filter((t) => t.status === 'closed' || t.status === 'resolved').length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(filteredTickets.map((t) => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTickets([...selectedTickets, id]);
    } else {
      setSelectedTickets(selectedTickets.filter((t) => t !== id));
    }
  };

  const handleViewTicket = (ticket: TicketExtended) => {
    setViewingTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleUpdateTicket = (updatedTicket: TicketExtended) => {
    // Update logic would go here
    setViewingTicket(updatedTicket);
  };

  const handleExport = () => {
    // Export logic would go here
    console.log('Exporting tickets...', filteredTickets);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Tickets</h1>
          <p className="text-muted-foreground mt-1">Comprehensive view of all support tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save View
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalTickets}</p>
                </div>
                <Ticket className="h-8 w-8 text-primary opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{pendingTickets}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Answered</p>
                  <p className="text-3xl font-bold text-info mt-1">{answeredTickets}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-info opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Closed</p>
                  <p className="text-3xl font-bold text-success mt-1">{closedTickets}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bulk Actions */}
      {selectedTickets.length > 0 && (
        <Card className="border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">
                  {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Change Status
                </Button>
                <Button variant="outline" size="sm">
                  Change Priority
                </Button>
                <Button variant="outline" size="sm">
                  Assign Agent
                </Button>
                <Button variant="outline" size="sm">
                  Add Tags
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tickets</CardTitle>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="answered">Answered</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue />
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
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>
            <TabsContent value="table" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.includes(ticket.id)}
                          onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                        />
                      </TableCell>
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
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{ticket.createdAt.split('T')[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedToName ? (
                          <span className="text-sm">{ticket.assignedToName}</span>
                        ) : (
                          <Badge variant="outline" className="text-xs">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <Card key={ticket.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => handleViewTicket(ticket)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="text-sm bg-secondary px-2 py-1 rounded">{ticket.ticketNumber}</code>
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                          <h3 className="font-medium text-foreground mb-1">{ticket.subject}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{ticket.userName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{ticket.createdAt.split('T')[0]}</span>
                            </div>
                            {ticket.assignedToName && (
                              <div className="flex items-center gap-1">
                                <span>Assigned to: {ticket.assignedToName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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

