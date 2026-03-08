import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { gsap } from 'gsap';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Calendar,
  TrendingUp,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
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
import StatusBadge from '@/components/custom/StatusBadge';
import LeadScoreBadge from '@/components/custom/LeadScoreBadge';
import { useCRM } from '@/contexts/CRMContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Lead, LeadStatus } from '@/types';

const statusFilters: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

type LeadApiShape = {
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
  lastContacted?: string | null;
  estimatedValue?: number | null;
  createdAt: string;
  updatedAt: string;
};

const toLead = (row: LeadApiShape): Lead => ({
  leadId: row.leadId,
  name: row.name,
  email: row.email,
  phone: row.phone || undefined,
  company: row.company || undefined,
  source: row.source,
  status: row.status,
  score: Number(row.score || 0),
  assignedTo: row.assignedTo,
  notes: row.notes || undefined,
  lastContacted: row.lastContacted ? new Date(row.lastContacted) : undefined,
  estimatedValue: row.estimatedValue === null || row.estimatedValue === undefined ? undefined : Number(row.estimatedValue),
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

export default function Leads() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { leads, addLead, updateLead, deleteLead } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const [leadList, setLeadList] = useState<Lead[]>(leads);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'manual',
    status: 'new' as LeadStatus,
    score: 50,
    notes: '',
    estimatedValue: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'manual',
    status: 'new' as LeadStatus,
    score: 50,
    notes: '',
    estimatedValue: '',
  });

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
  }, []);

  const resolveLeadApiUrl = (action: 'create' | 'update' | 'delete' | 'list') => {
    const configuredUrl = import.meta.env.VITE_LEADS_API_URL?.trim();
    if (!configuredUrl) {
      if (action === 'create') return '/.netlify/functions/create-lead';
      if (action === 'update') return '/.netlify/functions/update-lead';
      if (action === 'delete') return '/.netlify/functions/delete-lead';
      return '/.netlify/functions/list-leads';
    }
    if (action === 'update') return configuredUrl.replace(/\/create-lead$/, '/update-lead');
    if (action === 'delete') return configuredUrl.replace(/\/create-lead$/, '/delete-lead');
    if (action === 'list') return configuredUrl.replace(/\/create-lead$/, '/list-leads');
    return configuredUrl;
  };

  const loadLeads = useCallback(async () => {
    setLoadError('');
    try {
      const response = await fetch(resolveLeadApiUrl('list'));
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) throw new Error(result?.error || `Failed to load leads (HTTP ${response.status}).`);
      if (!result?.ok || !Array.isArray(result?.leads)) throw new Error('Lead list API returned an invalid response.');
      setLeadList((result.leads as LeadApiShape[]).map(toLead));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load leads.');
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const filteredLeads = leadList.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const resetCreateForm = () => {
    setFormData({ name: '', email: '', phone: '', company: '', source: 'manual', status: 'new', score: 50, notes: '', estimatedValue: '' });
    setFormError('');
  };

  const handleCreateLead = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    const name = formData.name.trim();
    const email = formData.email.trim();
    if (!name) return setFormError('Name is required.');
    if (!email) return setFormError('Email is required.');
    if (formData.score < 0 || formData.score > 100) return setFormError('Score must be between 0 and 100.');

    setFormError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(resolveLeadApiUrl('create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: formData.phone.trim() || undefined,
          company: formData.company.trim() || undefined,
          source: formData.source.trim() || 'manual',
          status: formData.status,
          score: formData.score,
          notes: formData.notes.trim() || undefined,
          estimatedValue: formData.estimatedValue.trim() ? Number(formData.estimatedValue) : undefined,
          assignedTo: user?.uid?.trim() || 'user-1',
        }),
      });
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) throw new Error(result?.error || `Failed to create lead (HTTP ${response.status}).`);
      if (!result?.ok || !result?.lead) throw new Error('Lead API returned an invalid response.');
      const mapped = toLead(result.lead as LeadApiShape);
      addLead({
        name: mapped.name,
        email: mapped.email,
        phone: mapped.phone,
        company: mapped.company,
        source: mapped.source,
        status: mapped.status,
        score: mapped.score,
        assignedTo: mapped.assignedTo,
        notes: mapped.notes,
        estimatedValue: mapped.estimatedValue,
      });
      setLeadList((prev) => [mapped, ...prev]);
      resetCreateForm();
      setIsCreateOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (lead: Lead) => {
    setEditingLeadId(lead.leadId);
    setEditFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'manual',
      status: lead.status,
      score: lead.score,
      notes: lead.notes || '',
      estimatedValue: lead.estimatedValue !== undefined ? String(lead.estimatedValue) : '',
    });
    setEditFormError('');
    setIsEditOpen(true);
  };

  const handleUpdateLead = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLeadId || isEditSubmitting) return;
    const name = editFormData.name.trim();
    const email = editFormData.email.trim();
    if (!name) return setEditFormError('Name is required.');
    if (!email) return setEditFormError('Email is required.');
    if (editFormData.score < 0 || editFormData.score > 100) return setEditFormError('Score must be between 0 and 100.');

    setEditFormError('');
    setIsEditSubmitting(true);
    try {
      const response = await fetch(resolveLeadApiUrl('update'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: editingLeadId,
          name,
          email,
          phone: editFormData.phone.trim() || undefined,
          company: editFormData.company.trim() || undefined,
          source: editFormData.source.trim() || 'manual',
          status: editFormData.status,
          score: editFormData.score,
          notes: editFormData.notes.trim() || undefined,
          estimatedValue: editFormData.estimatedValue.trim() ? Number(editFormData.estimatedValue) : null,
          assignedTo: user?.uid?.trim() || 'user-1',
        }),
      });
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) throw new Error(result?.error || `Failed to update lead (HTTP ${response.status}).`);
      if (!result?.ok || !result?.lead) throw new Error('Lead API returned an invalid response.');
      const mapped = toLead(result.lead as LeadApiShape);
      updateLead(mapped.leadId, {
        name: mapped.name,
        email: mapped.email,
        phone: mapped.phone,
        company: mapped.company,
        source: mapped.source,
        status: mapped.status,
        score: mapped.score,
        assignedTo: mapped.assignedTo,
        notes: mapped.notes,
        estimatedValue: mapped.estimatedValue,
        lastContacted: mapped.lastContacted,
        updatedAt: mapped.updatedAt,
      });
      setLeadList((prev) => prev.map((item) => (item.leadId === mapped.leadId ? mapped : item)));
      setIsEditOpen(false);
      setEditingLeadId(null);
    } catch (error) {
      setEditFormError(error instanceof Error ? error.message : 'Failed to update lead.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (deletingLeadId) return;
    if (!window.confirm(`Delete lead \"${lead.name}\"?`)) return;
    setActionError('');
    setDeletingLeadId(lead.leadId);
    try {
      const response = await fetch(resolveLeadApiUrl('delete'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.leadId }),
      });
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) : null;
      if (!response.ok) throw new Error(result?.error || `Failed to delete lead (HTTP ${response.status}).`);
      deleteLead(lead.leadId);
      setLeadList((prev) => prev.filter((item) => item.leadId !== lead.leadId));
      if (selectedLead?.leadId === lead.leadId) {
        setSelectedLead(null);
        setIsDetailsOpen(false);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete lead.');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const averageScore = leadList.length ? Math.round(leadList.reduce((acc, l) => acc + l.score, 0) / leadList.length) : 0;

  return (
    <div ref={sectionRef} className="p-6 space-y-6" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">Manage and track your sales leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2"><Upload className="w-4 h-4" />Import</Button>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Export</Button>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetCreateForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2"><Plus className="w-4 h-4" />Add Lead</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Name *" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                  <Input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                  <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
                  <Input placeholder="Company" value={formData.company} onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))} />
                  <Input placeholder="Source" value={formData.source} onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value }))} />
                  <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as LeadStatus }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    {statusFilters.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <Input type="number" min={0} max={100} placeholder="Score" value={formData.score} onChange={(e) => setFormData((p) => ({ ...p, score: Number(e.target.value || 0) }))} />
                  <Input type="number" min={0} placeholder="Estimated Value" value={formData.estimatedValue} onChange={(e) => setFormData((p) => ({ ...p, estimatedValue: e.target.value }))} />
                  <div className="md:col-span-2">
                    <Input placeholder="Notes" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
                {formError && <p className="text-sm text-red-600">{formError}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Lead'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={(open) => { setIsDetailsOpen(open); if (!open) setSelectedLead(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Lead Details</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><p className="text-gray-500">Name</p><p className="font-medium text-gray-900">{selectedLead.name}</p></div>
                <div><p className="text-gray-500">Company</p><p className="font-medium text-gray-900">{selectedLead.company || '-'}</p></div>
                <div><p className="text-gray-500">Email</p><p className="font-medium text-gray-900">{selectedLead.email}</p></div>
                <div><p className="text-gray-500">Phone</p><p className="font-medium text-gray-900">{selectedLead.phone || '-'}</p></div>
                <div><p className="text-gray-500">Status</p><p className="font-medium text-gray-900">{selectedLead.status}</p></div>
                <div><p className="text-gray-500">Score</p><p className="font-medium text-gray-900">{selectedLead.score}</p></div>
              </div>
              {actionError && <p className="text-red-600">{actionError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => openEditDialog(selectedLead)}>Edit</Button>
                <Button type="button" variant="destructive" onClick={() => handleDeleteLead(selectedLead)} disabled={deletingLeadId === selectedLead.leadId}>
                  {deletingLeadId === selectedLead.leadId ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingLeadId(null); setEditFormError(''); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Lead</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateLead} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Name *" value={editFormData.name} onChange={(e) => setEditFormData((p) => ({ ...p, name: e.target.value }))} />
              <Input type="email" placeholder="Email *" value={editFormData.email} onChange={(e) => setEditFormData((p) => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Phone" value={editFormData.phone} onChange={(e) => setEditFormData((p) => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Company" value={editFormData.company} onChange={(e) => setEditFormData((p) => ({ ...p, company: e.target.value }))} />
              <Input placeholder="Source" value={editFormData.source} onChange={(e) => setEditFormData((p) => ({ ...p, source: e.target.value }))} />
              <select value={editFormData.status} onChange={(e) => setEditFormData((p) => ({ ...p, status: e.target.value as LeadStatus }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {statusFilters.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <Input type="number" min={0} max={100} placeholder="Score" value={editFormData.score} onChange={(e) => setEditFormData((p) => ({ ...p, score: Number(e.target.value || 0) }))} />
              <Input type="number" min={0} placeholder="Estimated Value" value={editFormData.estimatedValue} onChange={(e) => setEditFormData((p) => ({ ...p, estimatedValue: e.target.value }))} />
              <div className="md:col-span-2">
                <Input placeholder="Notes" value={editFormData.notes} onChange={(e) => setEditFormData((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            {editFormError && <p className="text-sm text-red-600">{editFormError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isEditSubmitting}>{isEditSubmitting ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search leads by name, email, or company..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | 'all')} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="all">All Status</option>
            {statusFilters.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex items-center gap-6 py-4 border-y border-gray-100">
        <div className="flex items-center gap-2"><span className="text-2xl font-bold text-gray-900">{leadList.length}</span><span className="text-sm text-gray-500">Total Leads</span></div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-2"><span className="text-2xl font-bold text-green-600">{leadList.filter((l) => l.status === 'closed-won').length}</span><span className="text-sm text-gray-500">Converted</span></div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-2"><span className="text-2xl font-bold text-blue-600">{leadList.filter((l) => l.status === 'new').length}</span><span className="text-sm text-gray-500">New</span></div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-600" /><span className="text-sm text-gray-500">Avg Score: {averageScore}</span></div>
      </div>

      {loadError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Lead</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.leadId} className="hover:bg-gray-50/50 cursor-pointer group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700">{lead.name.split(' ').map((n) => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500"><Mail className="w-3 h-3" />{lead.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {lead.company ? <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-sm">{lead.company}</span></div> : <span className="text-sm text-gray-400">-</span>}
                </TableCell>
                <TableCell><StatusBadge status={lead.status} type="lead" size="sm" /></TableCell>
                <TableCell><LeadScoreBadge score={lead.score} size="sm" /></TableCell>
                <TableCell>{lead.estimatedValue ? <span className="font-medium text-gray-900">${lead.estimatedValue.toLocaleString()}</span> : <span className="text-sm text-gray-400">-</span>}</TableCell>
                <TableCell>
                  {lead.lastContacted ? <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar className="w-3 h-3" />{new Date(lead.lastContacted).toLocaleDateString()}</div> : <span className="text-sm text-gray-400">Never</span>}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(lead)}><Edit className="w-4 h-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => { setSelectedLead(lead); setIsDetailsOpen(true); }}><Eye className="w-4 h-4" />View Details</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Mail className="w-4 h-4" />Send Email</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Phone className="w-4 h-4" />Call</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleDeleteLead(lead)} disabled={deletingLeadId === lead.leadId}>
                        <Trash2 className="w-4 h-4" />
                        {deletingLeadId === lead.leadId ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLeads.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-gray-400" /></div>
            <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
