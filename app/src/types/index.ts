// User Types
export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales';
  teamId: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

// Team Types
export interface Team {
  teamId: string;
  name: string;
  managerId: string;
  members: string[];
  createdAt: Date;
}

// Lead Types
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface Lead {
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: LeadStatus;
  score: number;
  assignedTo: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContacted?: Date;
  estimatedValue?: number;
}

// Contact Types
export interface Contact {
  contactId: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  accountId?: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

// Account Types
export interface Account {
  accountId: string;
  companyName: string;
  industry?: string;
  size?: 'small' | 'medium' | 'enterprise';
  website?: string;
  phone?: string;
  address?: Address;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

// Deal Types
export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface Deal {
  dealId: string;
  title: string;
  accountId: string;
  contactId?: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Types
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

export interface Activity {
  activityId: string;
  type: ActivityType;
  relatedTo: {
    entityType: 'lead' | 'contact' | 'deal' | 'account';
    entityId: string;
  };
  subject: string;
  notes?: string;
  createdBy: string;
  timestamp: Date;
  duration?: number;
}

// Task Types
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  taskId: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  relatedTo?: {
    entityType: 'lead' | 'contact' | 'deal' | 'account';
    entityId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// AI Insight Types
export interface AIInsight {
  insightId: string;
  entityType: 'lead' | 'deal' | 'contact' | 'account';
  entityId: string;
  summary: string;
  recommendations: string[];
  confidence: number;
  generatedAt: Date;
}

// Dashboard Types
export interface DashboardMetrics {
  totalLeads: number;
  newLeadsThisMonth: number;
  totalDeals: number;
  dealsWonThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  conversionRate: number;
  averageDealSize: number;
  tasksPending: number;
  tasksOverdue: number;
}

export interface PipelineData {
  stage: DealStage;
  count: number;
  value: number;
}

export interface ActivityData {
  date: string;
  calls: number;
  emails: number;
  meetings: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

// Notification Types
export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: Date;
}

// Workflow Types
export interface Workflow {
  workflowId: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowTrigger = 
  | 'lead_created' 
  | 'lead_status_changed' 
  | 'deal_created' 
  | 'deal_stage_changed' 
  | 'task_created' 
  | 'task_overdue'
  | 'email_received';

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface WorkflowAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'assign_user' | 'send_notification';
  config: Record<string, any>;
}

// Auth Context Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// View Types
export type ViewType = 'grid' | 'list' | 'kanban' | 'calendar';

// Filter Types
export interface Filter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between';
  value: string | number | Date | [Date, Date];
}

// Sort Types
export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
