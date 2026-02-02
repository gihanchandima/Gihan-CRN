import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Phone,
  Mail,
  Users,
  CheckSquare,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
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
import type { Activity } from '@/types';

export default function Activities() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { activities, leads, contacts, deals } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesType;
  });

  const getRelatedEntityName = (activity: Activity) => {
    const { entityType, entityId } = activity.relatedTo;
    if (entityType === 'lead') {
      return leads.find(l => l.leadId === entityId)?.name;
    } else if (entityType === 'contact') {
      return contacts.find(c => c.contactId === entityId)?.name;
    } else if (entityType === 'deal') {
      return deals.find(d => d.dealId === entityId)?.title;
    }
    return null;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Users;
      case 'note': return CheckSquare;
      case 'task': return Clock;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-600';
      case 'email': return 'bg-purple-100 text-purple-600';
      case 'meeting': return 'bg-green-100 text-green-600';
      case 'note': return 'bg-gray-100 text-gray-600';
      case 'task': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const stats = {
    total: activities.length,
    calls: activities.filter(a => a.type === 'call').length,
    emails: activities.filter(a => a.type === 'email').length,
    meetings: activities.filter(a => a.type === 'meeting').length,
    notes: activities.filter(a => a.type === 'note').length,
  };

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-red-100">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
            <p className="text-gray-500 mt-1">Track all your sales activities</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
              <Plus className="w-4 h-4" />
              Log Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center text-gray-500">
              Activity logging form coming soon...
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Calls</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.calls}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Emails</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.emails}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Meetings</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.meetings}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.notes}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Types</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="note">Notes</option>
            <option value="task">Tasks</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Related To</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.map((activity) => {
              const relatedName = getRelatedEntityName(activity);
              const ActivityIcon = getActivityIcon(activity.type);
              const activityColorClass = getActivityColor(activity.type);
              
              return (
                <TableRow 
                  key={activity.activityId}
                  className="hover:bg-gray-50/50 cursor-pointer group"
                >
                  <TableCell>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activityColorClass}`}>
                      <ActivityIcon className="w-5 h-5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{activity.subject}</p>
                      {activity.notes && (
                        <p className="text-sm text-gray-500 line-clamp-1">{activity.notes}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {relatedName ? (
                      <span className="text-sm text-blue-600">{relatedName}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{activity.createdBy}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {new Date(activity.timestamp).toLocaleString()}
                      {activity.duration && (
                        <span className="text-gray-400">
                          ({activity.duration} min)
                        </span>
                      )}
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
                          <Edit className="w-4 h-4" />
                          Edit
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
        
        {filteredActivities.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No activities found</h3>
            <p className="text-gray-500 mt-1">Log your first activity to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
