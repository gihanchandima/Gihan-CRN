import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Globe,
  Users,
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

export default function Accounts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { accounts, contacts, deals, deleteAccount } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSize, setFilterSize] = useState<'all' | 'small' | 'medium' | 'enterprise'>('all');

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSize = filterSize === 'all' || account.size === filterSize;
    
    return matchesSearch && matchesSize;
  });

  const getAccountContacts = (accountId: string) => 
    contacts.filter(c => c.accountId === accountId).length;

  const getAccountDeals = (accountId: string) => 
    deals.filter(d => d.accountId === accountId);

  const getAccountValue = (accountId: string) => 
    getAccountDeals(accountId).reduce((sum, d) => sum + d.value, 0);

  const getSizeColor = (size?: string) => {
    switch (size) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'medium':
        return 'bg-blue-100 text-blue-700';
      case 'small':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-500 mt-1">Manage your customer accounts</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center text-gray-500">
              Account creation form coming soon...
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Accounts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{accounts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Enterprise</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {accounts.filter(a => a.size === 'enterprise').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Contacts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            ${(deals.reduce((sum, d) => sum + d.value, 0) / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search accounts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value as 'all' | 'small' | 'medium' | 'enterprise')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Sizes</option>
            <option value="enterprise">Enterprise</option>
            <option value="medium">Medium</option>
            <option value="small">Small</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Active Deals</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map((account) => {
              const contactCount = getAccountContacts(account.accountId);
              const accountDeals = getAccountDeals(account.accountId);
              const activeDeals = accountDeals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length;
              const totalValue = getAccountValue(account.accountId);
              
              return (
                <TableRow 
                  key={account.accountId}
                  className="hover:bg-gray-50/50 cursor-pointer group"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{account.companyName}</p>
                        {account.website && (
                          <a 
                            href={account.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="w-3 h-3" />
                            {account.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{account.industry || '-'}</span>
                  </TableCell>
                  <TableCell>
                    {account.size ? (
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium capitalize',
                        getSizeColor(account.size)
                      )}>
                        {account.size}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contactCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{activeDeals}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      ${totalValue.toLocaleString()}
                    </span>
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
                        <DropdownMenuItem className="gap-2">
                          <Users className="w-4 h-4" />
                          View Contacts
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <TrendingUp className="w-4 h-4" />
                          View Deals
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 text-red-600"
                          onClick={() => deleteAccount(account.accountId)}
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
        
        {filteredAccounts.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No accounts found</h3>
            <p className="text-gray-500 mt-1">Add your first account to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
