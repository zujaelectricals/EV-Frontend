import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Ticket,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  UserPlus,
  AlertTriangle,
  CheckCircle,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TicketExtended, TicketPriority, TicketCategory } from '../types/supportTickets';
import { TicketDetailView } from '../components/TicketDetailView';

const mockPendingTickets: TicketExtended[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    subject: 'Payment not received',
    description: 'I made a payment of ₹50,000 but it is not reflecting in my account. Please check and update.',
    userId: 'U12345',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    userPhone: '+91 98765 43210',
    status: 'pending',
    priority: 'high',
    category: 'payment',
    tags: ['payment', 'urgent'],
    replies: [],
    slaStatus: 'at_risk',
    responseTime: 90,
    createdAt: '2024-03-22T10:30:00',
    updatedAt: '2024-03-22T10:30:00',
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    subject: 'KYC verification pending',
    description: 'I submitted my KYC documents 5 days ago but still showing as pending. Please review.',
    userId: 'U12346',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    status: 'pending',
    priority: 'medium',
    category: 'kyc',
    tags: ['kyc', 'verification'],
    replies: [],
    slaStatus: 'on_time',
    responseTime: 45,
    createdAt: '2024-03-22T14:20:00',
    updatedAt: '2024-03-22T14:20:00',
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    subject: 'Product delivery delay',
    description: 'My order was supposed to be delivered on 20th March but still not received. Please update on delivery status.',
    userId: 'U12347',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    status: 'pending',
    priority: 'urgent',
    category: 'delivery',
    tags: ['delivery', 'delay'],
    replies: [],
    slaStatus: 'breached',
    responseTime: 150,
    createdAt: '2024-03-21T09:15:00',
    updatedAt: '2024-03-21T09:15:00',
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-004',
    subject: 'Account access issue',
    description: 'I cannot login to my account. Getting error message. Please help.',
    userId: 'U12348',
    userName: 'Sneha Reddy',
    userEmail: 'sneha@example.com',
    status: 'pending',
    priority: 'high',
    category: 'account',
    tags: ['account', 'login'],
    replies: [],
    slaStatus: 'at_risk',
    responseTime: 85,
    createdAt: '2024-03-22T11:00:00',
    updatedAt: '2024-03-22T11:00:00',
  },
  {
    id: '5',
    ticketNumber: 'TKT-2024-005',
    subject: 'Payout request status',
    description: 'I requested a payout 3 days ago. Can you please update on the status?',
    userId: 'U12349',
    userName: 'Vikram Singh',
    userEmail: 'vikram@example.com',
    status: 'pending',
    priority: 'medium',
    category: 'payout',
    tags: ['payout'],
    replies: [],
    slaStatus: 'on_time',
    responseTime: 30,
    createdAt: '2024-03-22T15:30:00',
    updatedAt: '2024-03-22T15:30:00',
  },
];

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

const getSLABadge = (slaStatus: string) => {
  switch (slaStatus) {
    case 'on_time':
      return <Badge className="bg-success text-white">On Time</Badge>;
    case 'at_risk':
      return <Badge className="bg-warning text-white">At Risk</Badge>;
    case 'breached':
      return <Badge variant="destructive">Breached</Badge>;
    default:
      return <Badge variant="outline">{slaStatus}</Badge>;
  }
};

export const PendingTickets = () => {
  const [tickets, setTickets] = useState<TicketExtended[]>(mockPendingTickets);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewingTicket, setViewingTicket] = useState<TicketExtended | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigningTicket, setAssigningTicket] = useState<TicketExtended | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('');

  const mockAgents = [
    { id: 'admin1', name: 'Admin User' },
    { id: 'staff1', name: 'Support Staff 1' },
    { id: 'staff2', name: 'Support Staff 2' },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    return matchesSearch && matchesPriority && matchesCategory && ticket.status === 'pending';
  });

  const totalPending = tickets.length;
  const highPriority = tickets.filter((t) => t.priority === 'high' || t.priority === 'urgent').length;
  const overdueSLA = tickets.filter((t) => t.slaStatus === 'breached').length;

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
    setTickets(tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    setViewingTicket(updatedTicket);
  };

  const handleAssign = (ticket: TicketExtended) => {
    setAssigningTicket(ticket);
    setSelectedAgent(ticket.assignedTo || '');
    setIsAssignDialogOpen(true);
  };

  const confirmAssign = () => {
    if (assigningTicket && selectedAgent) {
      const agent = mockAgents.find((a) => a.id === selectedAgent);
      const updatedTicket: TicketExtended = {
        ...assigningTicket,
        assignedTo: selectedAgent,
        assignedToName: agent?.name,
        assignedAt: new Date().toISOString(),
        status: 'in_progress',
        updatedAt: new Date().toISOString(),
      };
      handleUpdateTicket(updatedTicket);
      setIsAssignDialogOpen(false);
      setAssigningTicket(null);
      setSelectedAgent('');
    }
  };

  const handleBulkAssign = () => {
    if (selectedTickets.length > 0 && selectedAgent) {
      const agent = mockAgents.find((a) => a.id === selectedAgent);
      setTickets(
        tickets.map((t) =>
          selectedTickets.includes(t.id)
            ? {
                ...t,
                assignedTo: selectedAgent,
                assignedToName: agent?.name,
                assignedAt: new Date().toISOString(),
                status: t.status === 'pending' ? 'in_progress' : t.status,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
      setSelectedTickets([]);
      setSelectedAgent('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Tickets</h1>
          <p className="text-muted-foreground mt-1">Review and assign pending support tickets</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                  <p className="text-3xl font-bold text-warning mt-1">{totalPending}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{highPriority}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-20" />
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
                  <p className="text-sm font-medium text-muted-foreground">Overdue SLA</p>
                  <p className="text-3xl font-bold text-destructive mt-1">{overdueSLA}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive opacity-20" />
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
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleBulkAssign} disabled={!selectedAgent}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Selected
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
            <CardTitle>Pending Tickets</CardTitle>
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
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>Created</TableHead>
                <TableHead>SLA Status</TableHead>
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
                    <div>
                      <p className="font-medium text-foreground">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{ticket.description}</p>
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
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{ticket.createdAt.split('T')[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getSLABadge(ticket.slaStatus)}</TableCell>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssign(ticket)}
                      >
                        <UserPlus className="h-4 w-4" />
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

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Assign {assigningTicket?.ticketNumber} to a support agent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {mockAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssign} disabled={!selectedAgent}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

