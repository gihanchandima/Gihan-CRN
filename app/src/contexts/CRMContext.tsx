import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { 
  Lead, Contact, Account, Deal, Task, Activity, 
  AIInsight, Notification, Workflow, DashboardMetrics 
} from '@/types';
import { 
  mockLeads, mockContacts, mockAccounts, mockDeals, 
  mockTasks, mockActivities, mockAIInsights, 
  mockNotifications, mockWorkflows, mockDashboardMetrics 
} from '@/data/mockData';

interface CRMContextType {
  // Data
  leads: Lead[];
  contacts: Contact[];
  accounts: Account[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  aiInsights: AIInsight[];
  notifications: Notification[];
  workflows: Workflow[];
  dashboardMetrics: DashboardMetrics;
  
  // Actions
  addLead: (lead: Omit<Lead, 'leadId' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
  
  addContact: (contact: Omit<Contact, 'contactId' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => void;
  
  addAccount: (account: Omit<Account, 'accountId' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (accountId: string, updates: Partial<Account>) => void;
  deleteAccount: (accountId: string) => void;
  
  addDeal: (deal: Omit<Deal, 'dealId' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  deleteDeal: (dealId: string) => void;
  
  addTask: (task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  
  addActivity: (activity: Omit<Activity, 'activityId' | 'timestamp'>) => void;
  
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  
  toggleWorkflow: (workflowId: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [aiInsights] = useState<AIInsight[]>(mockAIInsights);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [dashboardMetrics] = useState<DashboardMetrics>(mockDashboardMetrics);

  // Lead Actions
  const addLead = useCallback((lead: Omit<Lead, 'leadId' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      leadId: `lead-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLeads(prev => [newLead, ...prev]);
  }, []);

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.leadId === leadId 
        ? { ...lead, ...updates, updatedAt: new Date() }
        : lead
    ));
  }, []);

  const deleteLead = useCallback((leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.leadId !== leadId));
  }, []);

  // Contact Actions
  const addContact = useCallback((contact: Omit<Contact, 'contactId' | 'createdAt' | 'updatedAt'>) => {
    const newContact: Contact = {
      ...contact,
      contactId: `contact-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setContacts(prev => [newContact, ...prev]);
  }, []);

  const updateContact = useCallback((contactId: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(contact => 
      contact.contactId === contactId 
        ? { ...contact, ...updates, updatedAt: new Date() }
        : contact
    ));
  }, []);

  const deleteContact = useCallback((contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.contactId !== contactId));
  }, []);

  // Account Actions
  const addAccount = useCallback((account: Omit<Account, 'accountId' | 'createdAt' | 'updatedAt'>) => {
    const newAccount: Account = {
      ...account,
      accountId: `account-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAccounts(prev => [newAccount, ...prev]);
  }, []);

  const updateAccount = useCallback((accountId: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(account => 
      account.accountId === accountId 
        ? { ...account, ...updates, updatedAt: new Date() }
        : account
    ));
  }, []);

  const deleteAccount = useCallback((accountId: string) => {
    setAccounts(prev => prev.filter(account => account.accountId !== accountId));
  }, []);

  // Deal Actions
  const addDeal = useCallback((deal: Omit<Deal, 'dealId' | 'createdAt' | 'updatedAt'>) => {
    const newDeal: Deal = {
      ...deal,
      dealId: `deal-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDeals(prev => [newDeal, ...prev]);
  }, []);

  const updateDeal = useCallback((dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(deal => 
      deal.dealId === dealId 
        ? { ...deal, ...updates, updatedAt: new Date() }
        : deal
    ));
  }, []);

  const deleteDeal = useCallback((dealId: string) => {
    setDeals(prev => prev.filter(deal => deal.dealId !== dealId));
  }, []);

  // Task Actions
  const addTask = useCallback((task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      taskId: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.taskId === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.taskId !== taskId));
  }, []);

  // Activity Actions
  const addActivity = useCallback((activity: Omit<Activity, 'activityId' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      activityId: `activity-${Date.now()}`,
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  // Notification Actions
  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.notificationId === notificationId 
        ? { ...notif, read: true }
        : notif
    ));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  // Workflow Actions
  const toggleWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.workflowId === workflowId 
        ? { ...workflow, active: !workflow.active }
        : workflow
    ));
  }, []);

  const value = useMemo(() => ({
    leads,
    contacts,
    accounts,
    deals,
    tasks,
    activities,
    aiInsights,
    notifications,
    workflows,
    dashboardMetrics,
    addLead,
    updateLead,
    deleteLead,
    addContact,
    updateContact,
    deleteContact,
    addAccount,
    updateAccount,
    deleteAccount,
    addDeal,
    updateDeal,
    deleteDeal,
    addTask,
    updateTask,
    deleteTask,
    addActivity,
    markNotificationRead,
    markAllNotificationsRead,
    toggleWorkflow,
  }), [
    leads, contacts, accounts, deals, tasks, activities, aiInsights, 
    notifications, workflows, dashboardMetrics,
    addLead, updateLead, deleteLead,
    addContact, updateContact, deleteContact,
    addAccount, updateAccount, deleteAccount,
    addDeal, updateDeal, deleteDeal,
    addTask, updateTask, deleteTask,
    addActivity, markNotificationRead, markAllNotificationsRead, toggleWorkflow,
  ]);

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
