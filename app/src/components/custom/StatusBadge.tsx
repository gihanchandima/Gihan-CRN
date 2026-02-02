import { cn } from '@/lib/utils';
import type { LeadStatus, DealStage, TaskStatus, TaskPriority } from '@/types';

interface StatusBadgeProps {
  status: LeadStatus | DealStage | TaskStatus | TaskPriority | string;
  type?: 'lead' | 'deal' | 'task' | 'priority';
  size?: 'sm' | 'md';
}

const leadStatusColors: Record<LeadStatus, string> = {
  'new': 'bg-blue-50 text-blue-700 border-blue-200',
  'contacted': 'bg-purple-50 text-purple-700 border-purple-200',
  'qualified': 'bg-teal-50 text-teal-700 border-teal-200',
  'proposal': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'negotiation': 'bg-orange-50 text-orange-700 border-orange-200',
  'closed-won': 'bg-green-50 text-green-700 border-green-200',
  'closed-lost': 'bg-red-50 text-red-700 border-red-200',
};

const dealStageColors: Record<DealStage, string> = {
  'prospecting': 'bg-gray-50 text-gray-700 border-gray-200',
  'qualification': 'bg-blue-50 text-blue-700 border-blue-200',
  'proposal': 'bg-purple-50 text-purple-700 border-purple-200',
  'negotiation': 'bg-orange-50 text-orange-700 border-orange-200',
  'closed-won': 'bg-green-50 text-green-700 border-green-200',
  'closed-lost': 'bg-red-50 text-red-700 border-red-200',
};

const taskStatusColors: Record<TaskStatus, string> = {
  'pending': 'bg-gray-50 text-gray-700 border-gray-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'completed': 'bg-green-50 text-green-700 border-green-200',
  'overdue': 'bg-red-50 text-red-700 border-red-200',
};

const priorityColors: Record<TaskPriority, string> = {
  'low': 'bg-gray-50 text-gray-700 border-gray-200',
  'medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'high': 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels: Record<string, string> = {
  'new': 'New',
  'contacted': 'Contacted',
  'qualified': 'Qualified',
  'proposal': 'Proposal',
  'negotiation': 'Negotiation',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost',
  'prospecting': 'Prospecting',
  'qualification': 'Qualification',
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'overdue': 'Overdue',
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
};

export default function StatusBadge({ status, type = 'lead', size = 'md' }: StatusBadgeProps) {
  const getColorClass = () => {
    switch (type) {
      case 'lead':
        return leadStatusColors[status as LeadStatus] || 'bg-gray-50 text-gray-700 border-gray-200';
      case 'deal':
        return dealStageColors[status as DealStage] || 'bg-gray-50 text-gray-700 border-gray-200';
      case 'task':
        return taskStatusColors[status as TaskStatus] || 'bg-gray-50 text-gray-700 border-gray-200';
      case 'priority':
        return priorityColors[status as TaskPriority] || 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full border',
      sizeClasses[size],
      getColorClass()
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5',
        getColorClass().replace('bg-', 'bg-').replace('text-', '').split(' ')[0].replace('bg-', 'bg-')
      )} style={{ 
        backgroundColor: 'currentColor',
        opacity: 0.5
      }} />
      {statusLabels[status] || status}
    </span>
  );
}
