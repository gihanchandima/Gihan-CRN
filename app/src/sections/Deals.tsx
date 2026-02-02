import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Building2,
  Calendar,
  ArrowRight,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
import StatusBadge from '@/components/custom/StatusBadge';
import { useCRM } from '@/contexts/CRMContext';
import type { DealStage } from '@/types';

const stageColumns: DealStage[] = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

export default function Deals() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { deals, accounts, deleteDeal } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [selectedStage, setSelectedStage] = useState<DealStage | 'all'>('all');

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const filteredDeals = deals.filter(deal => {
    const account = accounts.find(a => a.accountId === deal.accountId);
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account?.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = selectedStage === 'all' || deal.stage === selectedStage;
    
    return matchesSearch && matchesStage;
  });

  const getStageDeals = (stage: DealStage) => filteredDeals.filter(d => d.stage === stage);

  const getTotalValue = (deals: typeof filteredDeals) => deals.reduce((sum, d) => sum + d.value, 0);

  const getStageColor = (stage: DealStage) => {
    const colors: Record<DealStage, string> = {
      'prospecting': 'bg-gray-100 border-gray-200',
      'qualification': 'bg-blue-50 border-blue-200',
      'proposal': 'bg-purple-50 border-purple-200',
      'negotiation': 'bg-orange-50 border-orange-200',
      'closed-won': 'bg-green-50 border-green-200',
      'closed-lost': 'bg-red-50 border-red-200',
    };
    return colors[stage];
  };

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 mt-1">Track and manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              )}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              )}
            >
              List
            </button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Deal</DialogTitle>
              </DialogHeader>
              <div className="p-4 text-center text-gray-500">
                Deal creation form coming soon...
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stageColumns.map(stage => {
          const stageDeals = getStageDeals(stage);
          const value = getTotalValue(stageDeals);
          return (
            <div 
              key={stage}
              className={cn(
                'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                getStageColor(stage),
                selectedStage === stage && 'ring-2 ring-blue-500'
              )}
              onClick={() => setSelectedStage(selectedStage === stage ? 'all' : stage)}
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stage.replace('-', ' ')}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stageDeals.length}</p>
              <p className="text-sm text-gray-600">${(value / 1000).toFixed(0)}k</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search deals..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stageColumns.map(stage => {
            const stageDeals = getStageDeals(stage);
            return (
              <div 
                key={stage}
                className="flex-shrink-0 w-80"
              >
                <div className={cn(
                  'p-3 rounded-t-xl border-t border-x',
                  getStageColor(stage)
                )}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {stage.replace('-', ' ')}
                    </h3>
                    <span className="text-sm text-gray-500">{stageDeals.length}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ${(getTotalValue(stageDeals) / 1000).toFixed(0)}k
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-b-xl border border-t-0 p-3 space-y-3 min-h-[200px]">
                  {stageDeals.map(deal => {
                    const account = accounts.find(a => a.accountId === deal.accountId);
                    return (
                      <div 
                        key={deal.dealId}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{deal.title}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-red-600" onClick={() => deleteDeal(deal.dealId)}>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {account && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Building2 className="w-4 h-4" />
                            {account.companyName}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900">
                            ${deal.value.toLocaleString()}
                          </span>
                          <span className={cn(
                            'text-sm',
                            deal.probability >= 70 ? 'text-green-600' :
                            deal.probability >= 40 ? 'text-yellow-600' : 'text-red-600'
                          )}>
                            {deal.probability}%
                          </span>
                        </div>
                        
                        <Progress value={deal.probability} className="h-1.5" />
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                  
                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Deal</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => {
                const account = accounts.find(a => a.accountId === deal.accountId);
                return (
                  <TableRow 
                    key={deal.dealId}
                    className="hover:bg-gray-50/50 cursor-pointer group"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-500">ID: {deal.dealId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {account ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{account.companyName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={deal.stage} type="deal" size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        ${deal.value.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={deal.probability} className="w-20 h-2" />
                        <span className="text-sm text-gray-600">{deal.probability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
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
                          <DropdownMenuItem 
                            className="gap-2 text-red-600"
                            onClick={() => deleteDeal(deal.dealId)}
                          >
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
        </div>
      )}
    </div>
  );
}
