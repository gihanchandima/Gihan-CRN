import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  Calendar,
  Settings,
  Zap,
  Brain,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: Building2, label: 'Accounts', path: '/accounts' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: Handshake, label: 'Deals', path: '/deals' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Activities', path: '/activities' },
  { icon: Brain, label: 'AI Insights', path: '/ai-insights' },
  { icon: Zap, label: 'Workflows', path: '/workflows' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30',
        'transition-all duration-300 ease-expo-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-xl text-gray-900">NexaCRM</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }: { isActive: boolean }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              'hover:bg-gray-50 group relative',
              isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600'
            )}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <item.icon className={cn(
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              hoveredItem === item.path && 'scale-110'
            )} />
            
            {!collapsed && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && hoveredItem === item.path && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
            
            {/* Active indicator */}
            {!collapsed && (
              <div className={cn(
                'ml-auto w-1.5 h-1.5 rounded-full transition-all duration-200',
                'opacity-0 group-hover:opacity-100',
                'bg-blue-500'
              )} />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-100">
        {/* User Info */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2 mb-2',
          collapsed && 'justify-center'
        )}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full bg-gray-100"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Logout & Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors',
              collapsed && 'justify-center w-full'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          
          <button
            onClick={onToggle}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
