import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CRMProvider } from '@/contexts/CRMContext';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import Dashboard from '@/sections/Dashboard';
import Leads from '@/sections/Leads';
import Contacts from '@/sections/Contacts';
import Accounts from '@/sections/Accounts';
import Deals from '@/sections/Deals';
import Tasks from '@/sections/Tasks';
import Activities from '@/sections/Activities';
import AIInsights from '@/sections/AIInsights';
import Workflows from '@/sections/Workflows';
import Settings from '@/sections/Settings';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      
      <main 
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CRMProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CRMProvider>
    </AuthProvider>
  );
}

export default App;
