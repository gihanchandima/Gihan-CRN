import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Zap, 
  Plus, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  Mail,
  UserPlus,
  Bell,
  RefreshCw,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCRM } from '@/contexts/CRMContext';
import type { WorkflowTrigger } from '@/types';

const triggerIcons: Record<WorkflowTrigger, React.ComponentType<{ className?: string }>> = {
  'lead_created': UserPlus,
  'lead_status_changed': RefreshCw,
  'deal_created': Zap,
  'deal_stage_changed': ArrowRight,
  'task_created': CheckCircle,
  'task_overdue': Bell,
  'email_received': Mail,
};

const triggerLabels: Record<WorkflowTrigger, string> = {
  'lead_created': 'Lead Created',
  'lead_status_changed': 'Lead Status Changed',
  'deal_created': 'Deal Created',
  'deal_stage_changed': 'Deal Stage Changed',
  'task_created': 'Task Created',
  'task_overdue': 'Task Overdue',
  'email_received': 'Email Received',
};

export default function Workflows() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { workflows, toggleWorkflow } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && workflow.active) ||
                         (filterStatus === 'inactive' && !workflow.active);
    return matchesSearch && matchesStatus;
  });

  const activeCount = workflows.filter(w => w.active).length;
  const totalExecutions = 1247;
  const successRate = 98.5;

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100">
            <Zap className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
            <p className="text-gray-500 mt-1">Automate your sales processes</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 gap-2">
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center text-gray-500">
              Workflow builder coming soon...
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active Workflows</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</p>
          <p className="text-sm text-green-600 mt-1">of {workflows.length} total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Executions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalExecutions.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+123 this week</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{successRate}%</p>
          <p className="text-sm text-green-600 mt-1">+0.5% from last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Time Saved</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">156h</p>
          <p className="text-sm text-green-600 mt-1">This month</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search workflows..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Workflow</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkflows.map((workflow) => {
              const WfIcon = triggerIcons[workflow.trigger];
              return (
                <TableRow 
                  key={workflow.workflowId}
                  className="hover:bg-gray-50/50 group"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{workflow.name}</p>
                      {workflow.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{workflow.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <WfIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm">{triggerLabels[workflow.trigger]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {workflow.conditions.length} condition{workflow.conditions.length !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex -space-x-1">
                        {workflow.actions.slice(0, 3).map((action, i) => {
                          const ActionIcon = action.type === 'send_email' ? Mail :
                                            action.type === 'create_task' ? CheckCircle :
                                            action.type === 'assign_user' ? UserPlus :
                                            action.type === 'send_notification' ? Bell : Mail;
                          return (
                            <div 
                              key={i}
                              className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
                            >
                              <ActionIcon className="w-3 h-3" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={workflow.active}
                        onCheckedChange={() => toggleWorkflow(workflow.workflowId)}
                      />
                      <span className={cn(
                        'text-sm font-medium',
                        workflow.active ? 'text-green-600' : 'text-gray-500'
                      )}>
                        {workflow.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredWorkflows.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No workflows found</h3>
            <p className="text-gray-500 mt-1">Create your first workflow to automate tasks</p>
            <Button className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Create Workflow
            </Button>
          </div>
        )}
      </div>

      {/* Workflow Templates */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Lead Auto-Assignment',
              description: 'Automatically assign new leads based on territory',
              icon: UserPlus,
              color: 'blue',
            },
            {
              title: 'Follow-up Reminders',
              description: 'Create tasks for overdue leads and deals',
              icon: Bell,
              color: 'yellow',
            },
            {
              title: 'Deal Stage Alerts',
              description: 'Notify team when deals move to key stages',
              icon: Bell,
              color: 'purple',
            },
          ].map((template, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                template.color === 'blue' && 'bg-blue-100 text-blue-600',
                template.color === 'yellow' && 'bg-yellow-100 text-yellow-600',
                template.color === 'purple' && 'bg-purple-100 text-purple-600',
              )}>
                <template.icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900">{template.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
