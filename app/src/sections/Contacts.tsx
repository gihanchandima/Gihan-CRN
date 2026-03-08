import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap } from 'gsap';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Eye,
  Edit,
  Trash2,
  Mail as MailIcon
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
import { useAuth } from '@/contexts/AuthContext';
import type { Account, Contact } from '@/types';

export default function Contacts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { contacts, addContact, updateContact, deleteContact } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactsLoadError, setContactsLoadError] = useState('');
  const [accountOptions, setAccountOptions] = useState<Account[]>([]);
  const [contactList, setContactList] = useState<Contact[]>(contacts);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    accountId: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    accountId: '',
  });

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
  }, []);

  const filteredContacts = contactList.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const resolveContactApiUrl = (action: 'create' | 'update' | 'delete' | 'list') => {
    const configuredUrl = import.meta.env.VITE_CONTACTS_API_URL?.trim();
    if (!configuredUrl) {
      if (action === 'create') return '/.netlify/functions/create-contact';
      if (action === 'update') return '/.netlify/functions/update-contact';
      if (action === 'delete') return '/.netlify/functions/delete-contact';
      return '/.netlify/functions/list-contacts';
    }
    if (action === 'update') return configuredUrl.replace(/\/create-contact$/, '/update-contact');
    if (action === 'delete') return configuredUrl.replace(/\/create-contact$/, '/delete-contact');
    if (action === 'list') return configuredUrl.replace(/\/create-contact$/, '/list-contacts');
    return configuredUrl;
  };

  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/list-accounts');
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok || !result?.ok || !Array.isArray(result.accounts)) return;

      const mapped = (result.accounts as Array<{
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
      }>).map((item) => ({
        accountId: item.accountId,
        companyName: item.companyName,
        industry: item.industry || undefined,
        size: item.size || undefined,
        website: item.website || undefined,
        phone: item.phone || undefined,
        address: [item.street, item.city, item.state, item.zip, item.country].some(Boolean)
          ? {
              street: item.street || undefined,
              city: item.city || undefined,
              state: item.state || undefined,
              zip: item.zip || undefined,
              country: item.country || undefined,
            }
          : undefined,
        ownerId: item.ownerId,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
      setAccountOptions(mapped);
    } catch (_error) {
      // account options are optional for rendering
    }
  }, []);

  const loadContacts = useCallback(async () => {
    setContactsLoadError('');
    try {
      const response = await fetch(resolveContactApiUrl('list'));
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) {
        throw new Error(result?.error || `Failed to load contacts (HTTP ${response.status}).`);
      }
      if (!result?.ok || !Array.isArray(result.contacts)) {
        throw new Error('Contact list API returned an invalid response.');
      }

      const mapped = (result.contacts as Array<{
        contactId: string;
        name: string;
        email: string;
        phone?: string;
        title?: string;
        accountId?: string;
        assignedTo: string;
        createdAt: string;
        updatedAt: string;
      }>).map((item) => ({
        contactId: item.contactId,
        name: item.name,
        email: item.email,
        phone: item.phone || undefined,
        title: item.title || undefined,
        accountId: item.accountId || undefined,
        assignedTo: item.assignedTo,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
      setContactList(mapped);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load contacts.';
      setContactsLoadError(message);
    }
  }, []);

  useEffect(() => {
    loadContacts();
    loadAccounts();
  }, [loadContacts, loadAccounts]);

  const getAccountName = (accountId?: string) => {
    if (!accountId) return null;
    return accountOptions.find((a) => a.accountId === accountId)?.companyName || null;
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', title: '', accountId: '' });
    setFormError('');
  };

  const handleCreateContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) return setFormError('Name is required.');
    if (!email) return setFormError('Email is required.');

    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(resolveContactApiUrl('create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: formData.phone.trim() || undefined,
          title: formData.title.trim() || undefined,
          accountId: formData.accountId || undefined,
          assignedTo: user?.uid?.trim() || 'user-1',
        }),
      });

      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) throw new Error(result?.error || `Failed to save contact (HTTP ${response.status}).`);
      if (!result?.ok || !result?.contact) throw new Error('Contact API returned an invalid response.');

      const created = result.contact as {
        contactId: string;
        name: string;
        email: string;
        phone?: string;
        title?: string;
        accountId?: string;
        assignedTo: string;
        createdAt: string;
        updatedAt: string;
      };

      addContact({
        name: created.name,
        email: created.email,
        phone: created.phone || undefined,
        title: created.title || undefined,
        accountId: created.accountId || undefined,
        assignedTo: created.assignedTo,
      });

      setContactList((prev) => [
        {
          contactId: created.contactId,
          name: created.name,
          email: created.email,
          phone: created.phone || undefined,
          title: created.title || undefined,
          accountId: created.accountId || undefined,
          assignedTo: created.assignedTo,
          createdAt: new Date(created.createdAt),
          updatedAt: new Date(created.updatedAt),
        },
        ...prev,
      ]);

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContactId(contact.contactId);
    setEditFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      title: contact.title || '',
      accountId: contact.accountId || '',
    });
    setEditFormError('');
    setIsEditDialogOpen(true);
  };

  const handleUpdateContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingContactId || isEditSubmitting) return;

    const name = editFormData.name.trim();
    const email = editFormData.email.trim();
    if (!name) return setEditFormError('Name is required.');
    if (!email) return setEditFormError('Email is required.');

    setEditFormError('');
    setIsEditSubmitting(true);

    try {
      const response = await fetch(resolveContactApiUrl('update'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: editingContactId,
          name,
          email,
          phone: editFormData.phone.trim() || undefined,
          title: editFormData.title.trim() || undefined,
          accountId: editFormData.accountId || null,
          assignedTo: user?.uid?.trim() || 'user-1',
        }),
      });
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) throw new Error(result?.error || `Failed to update contact (HTTP ${response.status}).`);
      if (!result?.ok || !result?.contact) throw new Error('Contact API returned an invalid response.');

      const updated = result.contact as {
        contactId: string;
        name: string;
        email: string;
        phone?: string;
        title?: string;
        accountId?: string;
        assignedTo: string;
        updatedAt: string;
      };

      updateContact(updated.contactId, {
        name: updated.name,
        email: updated.email,
        phone: updated.phone || undefined,
        title: updated.title || undefined,
        accountId: updated.accountId || undefined,
        assignedTo: updated.assignedTo,
        updatedAt: new Date(updated.updatedAt),
      });

      setContactList((prev) =>
        prev.map((item) =>
          item.contactId === updated.contactId
            ? {
                ...item,
                name: updated.name,
                email: updated.email,
                phone: updated.phone || undefined,
                title: updated.title || undefined,
                accountId: updated.accountId || undefined,
                assignedTo: updated.assignedTo,
                updatedAt: new Date(updated.updatedAt),
              }
            : item
        )
      );

      setIsEditDialogOpen(false);
      setEditingContactId(null);
    } catch (error) {
      setEditFormError(error instanceof Error ? error.message : 'Failed to update contact.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (deletingContactId) return;
    const confirmed = window.confirm(`Delete contact "${contact.name}"?`);
    if (!confirmed) return;

    setActionError('');
    setDeletingContactId(contact.contactId);
    try {
      const response = await fetch(resolveContactApiUrl('delete'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.contactId }),
      });
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) throw new Error(result?.error || `Failed to delete contact (HTTP ${response.status}).`);

      deleteContact(contact.contactId);
      setContactList((prev) => prev.filter((item) => item.contactId !== contact.contactId));
      if (selectedContact?.contactId === contact.contactId) {
        setSelectedContact(null);
        setIsDetailsDialogOpen(false);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete contact.');
    } finally {
      setDeletingContactId(null);
    }
  };

  const openDetailsDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setActionError('');
    setIsDetailsDialogOpen(true);
  };

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-500 mt-1">Manage your contacts and relationships</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Contact Master</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+1 555 123 4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Sales Manager" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Account</label>
                  <select value={formData.accountId} onChange={(e) => setFormData((prev) => ({ ...prev, accountId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-100">
                    <option value="">No account</option>
                    {accountOptions.map((account) => (
                      <option key={account.accountId} value={account.accountId}>{account.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Contact'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => {
        setIsDetailsDialogOpen(open);
        if (!open) setSelectedContact(null);
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><p className="text-gray-500">Name</p><p className="font-medium text-gray-900">{selectedContact.name}</p></div>
                <div><p className="text-gray-500">Title</p><p className="font-medium text-gray-900">{selectedContact.title || '-'}</p></div>
                <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{selectedContact.email}</p></div>
                <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{selectedContact.phone || '-'}</p></div>
                <div className="md:col-span-2"><p className="text-gray-500">Linked Account</p><p className="font-medium text-gray-900">{getAccountName(selectedContact.accountId) || '-'}</p></div>
              </div>
              {actionError && <p className="text-red-600">{actionError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => openEditDialog(selectedContact)}>Edit</Button>
                <Button type="button" variant="destructive" onClick={() => handleDeleteContact(selectedContact)} disabled={deletingContactId === selectedContact.contactId}>
                  {deletingContactId === selectedContact.contactId ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingContactId(null);
          setEditFormError('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact Master</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateContact} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input value={editFormData.name} onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <Input type="email" value={editFormData.email} onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input value={editFormData.phone} onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+1 555 123 4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input value={editFormData.title} onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Sales Manager" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Account</label>
                <select value={editFormData.accountId} onChange={(e) => setEditFormData((prev) => ({ ...prev, accountId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-100">
                  <option value="">No account</option>
                  {accountOptions.map((account) => (
                    <option key={account.accountId} value={account.accountId}>{account.companyName}</option>
                  ))}
                </select>
              </div>
            </div>
            {editFormError && <p className="text-sm text-red-600">{editFormError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isEditSubmitting}>{isEditSubmitting ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Contacts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{contactList.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">With Accounts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{contactList.filter((c) => c.accountId).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-green-600 mt-1">+{contactList.filter((c) => c.createdAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{contactList.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search contacts..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {contactsLoadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{contactsLoadError}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Contact</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => {
              const accountName = getAccountName(contact.accountId);
              return (
                <TableRow key={contact.contactId} className="hover:bg-gray-50/50 cursor-pointer group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-700">{contact.name.split(' ').map((n) => n[0]).join('')}</span>
                      </div>
                      <div><p className="font-medium text-gray-900">{contact.name}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm text-gray-600">{contact.title || '-'}</span></TableCell>
                  <TableCell>
                    {accountName ? (
                      <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-sm">{accountName}</span></div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900" onClick={(e) => e.stopPropagation()}>
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(contact)}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => openDetailsDialog(contact)}>
                          <Eye className="w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <MailIcon className="w-4 h-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleDeleteContact(contact)} disabled={deletingContactId === contact.contactId}>
                          <Trash2 className="w-4 h-4" />
                          {deletingContactId === contact.contactId ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredContacts.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No contacts found</h3>
            <p className="text-gray-500 mt-1">Add your first contact to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
