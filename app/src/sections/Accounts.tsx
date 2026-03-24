import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
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
  Eye,
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
import { useAuth } from '@/contexts/AuthContext';
import type { Account } from '@/types';

export default function Accounts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { accounts, contacts, deals, addAccount, updateAccount, deleteAccount } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSize, setFilterSize] = useState<'all' | 'small' | 'medium' | 'enterprise'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountList, setAccountList] = useState<Account[]>(accounts);
  const [accountsLoadError, setAccountsLoadError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    size: '' as '' | 'small' | 'medium' | 'enterprise',
    website: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    industry: '',
    size: '' as '' | 'small' | 'medium' | 'enterprise',
    website: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const filteredAccounts = accountList.filter(account => {
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

  const resetForm = () => {
    setFormData({
      companyName: '',
      industry: '',
      size: '',
      website: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    });
    setFormError('');
  };

  const normalizeWebsite = (website: string) => {
    const value = website.trim();
    if (!value) return undefined;
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    return `https://${value}`;
  };

  const resolveAccountApiUrl = (action: 'create' | 'update' | 'delete' | 'list') => {
    const configuredApiUrl = import.meta.env.VITE_ACCOUNTS_API_URL?.trim();
    if (!configuredApiUrl || configuredApiUrl.includes('/rest/v1')) {
      if (action === 'list') return '/.netlify/functions/list-accounts';
      if (action === 'update') return '/.netlify/functions/update-account';
      if (action === 'delete') return '/.netlify/functions/delete-account';
      return '/.netlify/functions/create-account';
    }

    if (action === 'list') {
      return configuredApiUrl.replace(/\/create-account$/, '/list-accounts');
    }
    if (action === 'update') {
      return configuredApiUrl.replace(/\/create-account$/, '/update-account');
    }
    if (action === 'delete') {
      return configuredApiUrl.replace(/\/create-account$/, '/delete-account');
    }
    return configuredApiUrl;
  };

  const mapAccountRows = (rows: Array<{
    accountId: string;
    companyName: string;
    industry?: string;
    size?: 'small' | 'medium' | 'enterprise';
    website?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  }>) => rows.map((row) => ({
    accountId: row.accountId,
    companyName: row.companyName,
    industry: row.industry || undefined,
    size: row.size || undefined,
    website: row.website || undefined,
    phone: row.phone || undefined,
    address: [row.street, row.city, row.state, row.zip, row.country].some(Boolean)
      ? {
          street: row.street || undefined,
          city: row.city || undefined,
          state: row.state || undefined,
          zip: row.zip || undefined,
          country: row.country || undefined,
        }
      : undefined,
    ownerId: row.ownerId,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));

  const loadAccounts = useCallback(async () => {
    setAccountsLoadError('');
    try {
      const response = await fetch(resolveAccountApiUrl('list'));
      const raw = await response.text();
      let result: unknown = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch (_error) {
        result = null;
      }

      if (!response.ok) {
        const message =
          typeof result === 'object' &&
          result !== null &&
          'error' in result &&
          typeof (result as { error?: unknown }).error === 'string'
            ? (result as { error: string }).error
            : `Failed to load accounts (HTTP ${response.status}).`;
        throw new Error(message);
      }

      const accountRows = Array.isArray(result)
        ? result
        : (
            typeof result === 'object' &&
            result !== null &&
            'accounts' in result &&
            Array.isArray((result as { accounts?: unknown }).accounts)
          )
          ? (result as { accounts: unknown[] }).accounts
          : null;

      if (!accountRows) {
        throw new Error('Account list API returned an invalid response.');
      }

      setAccountList(mapAccountRows(accountRows as Array<{
        accountId: string;
        companyName: string;
        industry?: string;
        size?: 'small' | 'medium' | 'enterprise';
        website?: string;
        phone?: string;
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        ownerId: string;
        createdAt: string;
        updatedAt: string;
      }>));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load accounts.';
      setAccountsLoadError(message);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const openEditDialog = (account: Account) => {
    setEditingAccountId(account.accountId);
    setEditFormData({
      companyName: account.companyName,
      industry: account.industry || '',
      size: account.size || '',
      website: account.website || '',
      phone: account.phone || '',
      street: account.address?.street || '',
      city: account.address?.city || '',
      state: account.address?.state || '',
      zip: account.address?.zip || '',
      country: account.address?.country || '',
    });
    setEditFormError('');
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (account: Account) => {
    setSelectedAccount(account);
    setActionError('');
    setIsDetailsDialogOpen(true);
  };

  const handleCreateAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const companyName = formData.companyName.trim();
    if (!companyName) {
      setFormError('Company name is required.');
      return;
    }

    const addressFields = {
      street: formData.street.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip: formData.zip.trim(),
      country: formData.country.trim(),
    };

    setFormError('');
    setIsSubmitting(true);

    const payload = {
      companyName,
      industry: formData.industry.trim() || undefined,
      size: formData.size || undefined,
      website: normalizeWebsite(formData.website),
      phone: formData.phone.trim() || undefined,
      ...addressFields,
      ownerId: user?.uid?.trim() || 'user-1',
    };

    try {
      const apiUrl = resolveAccountApiUrl('create');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let result: unknown = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch (_error) {
        result = null;
      }

      if (!response.ok) {
        const message =
          typeof result === 'object' &&
          result !== null &&
          (('error' in result && typeof (result as { error?: unknown }).error === 'string') ||
            ('message' in result && typeof (result as { message?: unknown }).message === 'string'))
            ? String((result as { error?: string; message?: string }).error || (result as { message?: string }).message)
            : `Failed to save account (HTTP ${response.status}).`;
        throw new Error(message);
      }

      if (
        typeof result !== 'object' ||
        result === null ||
        !('ok' in result) ||
        !(result as { ok?: boolean }).ok ||
        !('account' in result)
      ) {
        throw new Error('Account API returned an invalid response.');
      }

      const createdAccount = (result as { account: unknown }).account as {
        accountId: string;
        companyName: string;
        industry?: string;
        size?: 'small' | 'medium' | 'enterprise';
        website?: string;
        phone?: string;
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        ownerId: string;
        createdAt: string;
        updatedAt: string;
      };

      const address = [createdAccount.street, createdAccount.city, createdAccount.state, createdAccount.zip, createdAccount.country]
        .some(Boolean)
        ? {
            street: createdAccount.street,
            city: createdAccount.city,
            state: createdAccount.state,
            zip: createdAccount.zip,
            country: createdAccount.country,
          }
        : undefined;

      addAccount({
        accountId: createdAccount.accountId,
        companyName: createdAccount.companyName,
        industry: createdAccount.industry,
        size: createdAccount.size,
        website: createdAccount.website,
        phone: createdAccount.phone,
        address,
        ownerId: createdAccount.ownerId,
        createdAt: new Date(createdAccount.createdAt),
        updatedAt: new Date(createdAccount.updatedAt),
      });

      resetForm();
      setIsCreateDialogOpen(false);
      await loadAccounts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save account.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditSubmitting || !editingAccountId) return;

    const companyName = editFormData.companyName.trim();
    if (!companyName) {
      setEditFormError('Company name is required.');
      return;
    }

    setEditFormError('');
    setIsEditSubmitting(true);

    const payload = {
      accountId: editingAccountId,
      companyName,
      industry: editFormData.industry.trim() || undefined,
      size: editFormData.size || undefined,
      website: normalizeWebsite(editFormData.website),
      phone: editFormData.phone.trim() || undefined,
      street: editFormData.street.trim() || undefined,
      city: editFormData.city.trim() || undefined,
      state: editFormData.state.trim() || undefined,
      zip: editFormData.zip.trim() || undefined,
      country: editFormData.country.trim() || undefined,
      ownerId: user?.uid?.trim() || 'user-1',
    };

    try {
      const response = await fetch(resolveAccountApiUrl('update'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let result: unknown = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch (_error) {
        result = null;
      }

      if (!response.ok) {
        const message =
          typeof result === 'object' &&
          result !== null &&
          (('error' in result && typeof (result as { error?: unknown }).error === 'string') ||
            ('message' in result && typeof (result as { message?: unknown }).message === 'string'))
            ? String((result as { error?: string; message?: string }).error || (result as { message?: string }).message)
            : `Failed to update account (HTTP ${response.status}).`;
        throw new Error(message);
      }

      if (
        typeof result !== 'object' ||
        result === null ||
        !('ok' in result) ||
        !(result as { ok?: boolean }).ok ||
        !('account' in result)
      ) {
        throw new Error('Account API returned an invalid response.');
      }

      const updatedAccount = (result as { account: unknown }).account as {
        accountId: string;
        companyName: string;
        industry?: string;
        size?: 'small' | 'medium' | 'enterprise';
        website?: string;
        phone?: string;
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        ownerId: string;
        createdAt: string;
        updatedAt: string;
      };

      const address = [updatedAccount.street, updatedAccount.city, updatedAccount.state, updatedAccount.zip, updatedAccount.country]
        .some(Boolean)
        ? {
            street: updatedAccount.street,
            city: updatedAccount.city,
            state: updatedAccount.state,
            zip: updatedAccount.zip,
            country: updatedAccount.country,
          }
        : undefined;

      updateAccount(updatedAccount.accountId, {
        companyName: updatedAccount.companyName,
        industry: updatedAccount.industry,
        size: updatedAccount.size,
        website: updatedAccount.website,
        phone: updatedAccount.phone,
        address,
        ownerId: updatedAccount.ownerId,
        updatedAt: new Date(updatedAccount.updatedAt),
      });

      setIsEditDialogOpen(false);
      setEditingAccountId(null);
      await loadAccounts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update account.';
      setEditFormError(message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    if (deletingAccountId) return;
    const shouldDelete = window.confirm(`Delete account "${account.companyName}"?`);
    if (!shouldDelete) return;

    setActionError('');
    setDeletingAccountId(account.accountId);

    try {
      const response = await fetch(resolveAccountApiUrl('delete'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: account.accountId }),
      });

      const raw = await response.text();
      let result: unknown = null;
      try {
        result = raw ? JSON.parse(raw) : null;
      } catch (_error) {
        result = null;
      }

      if (!response.ok) {
        const message =
          typeof result === 'object' &&
          result !== null &&
          (('error' in result && typeof (result as { error?: unknown }).error === 'string') ||
            ('message' in result && typeof (result as { message?: unknown }).message === 'string'))
            ? String((result as { error?: string; message?: string }).error || (result as { message?: string }).message)
            : `Failed to delete account (HTTP ${response.status}).`;
        throw new Error(message);
      }

      deleteAccount(account.accountId);
      setAccountList((prev) => prev.filter((item) => item.accountId !== account.accountId));
      if (selectedAccount?.accountId === account.accountId) {
        setIsDetailsDialogOpen(false);
        setSelectedAccount(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account.';
      setActionError(message);
    } finally {
      setDeletingAccountId(null);
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
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Account Master</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value as '' | 'small' | 'medium' | 'enterprise' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="acme.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555 123 4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <Input
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <Input
                    value={formData.zip}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="USA"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={(open) => {
            setIsDetailsDialogOpen(open);
            if (!open) setSelectedAccount(null);
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{selectedAccount.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Industry</p>
                    <p className="font-medium text-gray-900">{selectedAccount.industry || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Size</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedAccount.size || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Owner</p>
                    <p className="font-medium text-gray-900">{selectedAccount.ownerId}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Website</p>
                    <p className="font-medium text-gray-900">{selectedAccount.website || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedAccount.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contacts</p>
                    <p className="font-medium text-gray-900">{getAccountContacts(selectedAccount.accountId)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {[
                        selectedAccount.address?.street,
                        selectedAccount.address?.city,
                        selectedAccount.address?.state,
                        selectedAccount.address?.zip,
                        selectedAccount.address?.country,
                      ].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                </div>
                {actionError && <p className="text-sm text-red-600">{actionError}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => openEditDialog(selectedAccount)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteAccount(selectedAccount)}
                    disabled={deletingAccountId === selectedAccount.accountId}
                  >
                    {deletingAccountId === selectedAccount.accountId ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setEditFormError('');
              setEditingAccountId(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Account Master</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <Input
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <Input
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    value={editFormData.size}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, size: e.target.value as '' | 'small' | 'medium' | 'enterprise' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <Input
                    value={editFormData.website}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="acme.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 555 123 4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <Input
                    value={editFormData.street}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    value={editFormData.city}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <Input
                    value={editFormData.state}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <Input
                    value={editFormData.zip}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <Input
                    value={editFormData.country}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="USA"
                  />
                </div>
              </div>

              {editFormError && (
                <p className="text-sm text-red-600">{editFormError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isEditSubmitting}>
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Accounts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{accountList.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Enterprise</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {accountList.filter(a => a.size === 'enterprise').length}
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
      {accountsLoadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {accountsLoadError}
        </div>
      )}
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
                        <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(account)}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openDetailsDialog(account)}>
                          <Eye className="w-4 h-4" />
                          View Details
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
                          onClick={() => handleDeleteAccount(account)}
                          disabled={deletingAccountId === account.accountId}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingAccountId === account.accountId ? 'Deleting...' : 'Delete'}
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
