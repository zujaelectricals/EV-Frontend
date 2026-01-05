import { useState } from 'react';
import {
  Ticket,
  User,
  Clock,
  Tag,
  MessageSquare,
  Paperclip,
  Send,
  CheckCircle,
  XCircle,
  Edit,
  UserPlus,
  AlertTriangle,
  FileText,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketExtended, TicketReply, TicketStatus, TicketPriority, TicketCategory } from '../types/supportTickets';

interface TicketDetailViewProps {
  ticket: TicketExtended;
  onUpdate: (ticket: TicketExtended) => void;
  onClose: () => void;
}

const getStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case 'pending':
      return <Badge variant="default">Pending</Badge>;
    case 'in_progress':
      return <Badge className="bg-info text-white">In Progress</Badge>;
    case 'answered':
      return <Badge className="bg-warning text-white">Answered</Badge>;
    case 'closed':
      return <Badge className="bg-success text-white">Closed</Badge>;
    case 'resolved':
      return <Badge className="bg-success text-white">Resolved</Badge>;
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

export const TicketDetailView = ({ ticket, onUpdate, onClose }: TicketDetailViewProps) => {
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(ticket.assignedTo || '');

  const mockAgents = [
    { id: 'admin1', name: 'Admin User' },
    { id: 'staff1', name: 'Support Staff 1' },
    { id: 'staff2', name: 'Support Staff 2' },
  ];

  const handleReply = () => {
    if (!replyMessage.trim()) return;

    const newReply: TicketReply = {
      id: `reply-${Date.now()}`,
      ticketId: ticket.id,
      message: replyMessage,
      authorId: 'admin1',
      authorName: 'Admin User',
      authorRole: 'admin',
      isInternal: isInternalNote,
      createdAt: new Date().toISOString(),
    };

    const updatedTicket: TicketExtended = {
      ...ticket,
      replies: [...ticket.replies, newReply],
      status: isInternalNote ? ticket.status : 'answered',
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedTicket);
    setReplyMessage('');
    setIsInternalNote(false);
  };

  const handleStatusChange = (status: TicketStatus) => {
    const updatedTicket: TicketExtended = {
      ...ticket,
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'closed' || status === 'resolved'
        ? {
            closedAt: new Date().toISOString(),
            resolvedBy: 'admin1',
            resolvedByName: 'Admin User',
          }
        : {}),
    };
    onUpdate(updatedTicket);
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    const updatedTicket: TicketExtended = {
      ...ticket,
      priority,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedTicket);
  };

  const handleCategoryChange = (category: TicketCategory) => {
    const updatedTicket: TicketExtended = {
      ...ticket,
      category,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedTicket);
  };

  const handleAssign = () => {
    const agent = mockAgents.find((a) => a.id === selectedAgent);
    const updatedTicket: TicketExtended = {
      ...ticket,
      assignedTo: selectedAgent,
      assignedToName: agent?.name,
      assignedAt: new Date().toISOString(),
      status: ticket.status === 'pending' ? 'in_progress' : ticket.status,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedTicket);
    setIsAssignDialogOpen(false);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{ticket.ticketNumber}</h1>
            <p className="text-sm text-muted-foreground">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{ticket.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">SLA Status</Label>
                  <div className="mt-1">{getSLABadge(ticket.slaStatus)}</div>
                </div>
              </div>
              {ticket.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ticket.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation Thread */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Initial Ticket */}
                <div className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{ticket.userName}</span>
                      <Badge variant="outline" className="text-xs">Customer</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{ticket.createdAt.split('T')[0]}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {/* Replies */}
                {ticket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 rounded-lg ${
                      reply.isInternal ? 'bg-warning/10 border border-warning/20' : 'bg-secondary'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {reply.authorRole === 'admin' || reply.authorRole === 'staff' ? (
                          <User className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">{reply.authorName}</span>
                        <Badge variant="outline" className="text-xs capitalize">{reply.authorRole}</Badge>
                        {reply.isInternal && (
                          <Badge variant="outline" className="text-xs text-warning">
                            <FileText className="h-3 w-3 mr-1" />
                            Internal Note
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                    {reply.attachments && reply.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {reply.attachments.map((att, idx) => (
                          <Button key={idx} variant="outline" size="sm" asChild>
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {att.name}
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Reply Composer */}
                <div className="p-4 border rounded-lg">
                  <Tabs defaultValue="reply" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="reply">Reply</TabsTrigger>
                      <TabsTrigger value="internal">Internal Note</TabsTrigger>
                    </TabsList>
                    <TabsContent value="reply" className="space-y-3 mt-3">
                      <div>
                        <Label>Message</Label>
                        <Textarea
                          placeholder="Type your reply..."
                          rows={4}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm">
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attach File
                        </Button>
                        <Button onClick={handleReply} disabled={!replyMessage.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="internal" className="space-y-3 mt-3">
                      <div>
                        <Label>Internal Note</Label>
                        <Textarea
                          placeholder="Add internal note (only visible to admins)..."
                          rows={4}
                          value={internalNote}
                          onChange={(e) => setInternalNote(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (internalNote.trim()) {
                            const newReply: TicketReply = {
                              id: `reply-${Date.now()}`,
                              ticketId: ticket.id,
                              message: internalNote,
                              authorId: 'admin1',
                              authorName: 'Admin User',
                              authorRole: 'admin',
                              isInternal: true,
                              createdAt: new Date().toISOString(),
                            };
                            const updatedTicket: TicketExtended = {
                              ...ticket,
                              replies: [...ticket.replies, newReply],
                              internalNotes: ticket.internalNotes
                                ? `${ticket.internalNotes}\n\n${internalNote}`
                                : internalNote,
                              updatedAt: new Date().toISOString(),
                            };
                            onUpdate(updatedTicket);
                            setInternalNote('');
                          }
                        }}
                        disabled={!internalNote.trim()}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={ticket.status} onValueChange={(value: TicketStatus) => handleStatusChange(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <Select
                  value={ticket.priority}
                  onValueChange={(value: TicketPriority) => handlePriorityChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={ticket.category}
                  onValueChange={(value: TicketCategory) => handleCategoryChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAssignDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {ticket.assignedToName || 'Assign Agent'}
              </Button>
              {(ticket.status === 'closed' || ticket.status === 'resolved') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('pending')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reopen Ticket
                </Button>
              )}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">{ticket.userName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm">{ticket.userEmail}</p>
                </div>
              </div>
              {ticket.userPhone && (
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm">{ticket.userPhone}</p>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full">
                View User Profile
              </Button>
            </CardContent>
          </Card>

          {/* SLA Information */}
          <Card>
            <CardHeader>
              <CardTitle>SLA Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">SLA Status</Label>
                <div className="mt-1">{getSLABadge(ticket.slaStatus)}</div>
              </div>
              {ticket.responseTime !== undefined && (
                <div>
                  <Label className="text-xs text-muted-foreground">Response Time</Label>
                  <p className="font-medium">{formatTime(ticket.responseTime)}</p>
                </div>
              )}
              {ticket.resolutionTime !== undefined && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution Time</Label>
                  <p className="font-medium">{formatTime(ticket.resolutionTime)}</p>
                </div>
              )}
              {ticket.firstResponseAt && (
                <div>
                  <Label className="text-xs text-muted-foreground">First Response</Label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm">{ticket.firstResponseAt.split('T')[0]}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Last Updated</Label>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm">{new Date(ticket.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              {ticket.assignedToName && (
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned To</Label>
                  <p className="text-sm">{ticket.assignedToName}</p>
                </div>
              )}
              {ticket.resolvedByName && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resolved By</Label>
                  <p className="text-sm">{ticket.resolvedByName}</p>
                </div>
              )}
              {ticket.closedAt && (
                <div>
                  <Label className="text-xs text-muted-foreground">Closed At</Label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm">{new Date(ticket.closedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Agent Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>Assign this ticket to a support agent</DialogDescription>
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
            <Button onClick={handleAssign} disabled={!selectedAgent}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

