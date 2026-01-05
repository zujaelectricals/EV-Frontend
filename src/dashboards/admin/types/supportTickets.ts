export type TicketStatus = 'pending' | 'in_progress' | 'answered' | 'closed' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'payment' | 'account' | 'delivery' | 'technical' | 'kyc' | 'payout' | 'general';
export type SLStatus = 'on_time' | 'at_risk' | 'breached';

export interface TicketReply {
  id: string;
  ticketId: string;
  message: string;
  authorId: string;
  authorName: string;
  authorRole: 'user' | 'admin' | 'staff';
  isInternal: boolean; // Internal notes (admin-only)
  attachments?: {
    name: string;
    url: string;
    size: number;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface TicketExtended {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  tags: string[];
  replies: TicketReply[];
  slaStatus: SLStatus;
  responseTime?: number; // minutes
  resolutionTime?: number; // minutes
  firstResponseAt?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  customerSatisfaction?: number; // 1-5
  internalNotes?: string;
  relatedTicketIds?: string[];
}

export interface TicketAnalytics {
  totalTickets: number;
  pendingTickets: number;
  answeredTickets: number;
  closedTickets: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // minutes
  slaComplianceRate: number; // percentage
  customerSatisfactionScore: number; // average rating
  monthlyData: {
    month: string;
    tickets: number;
    resolved: number;
  }[];
  categoryDistribution: {
    category: TicketCategory;
    count: number;
    percentage: number;
  }[];
  priorityDistribution: {
    priority: TicketPriority;
    count: number;
    percentage: number;
  }[];
}

export interface SLAConfig {
  priority: TicketPriority;
  responseTime: number; // minutes
  resolutionTime: number; // minutes
  warningThreshold: number; // percentage (e.g., 80% means warn at 80% of SLA time)
}

