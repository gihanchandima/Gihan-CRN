import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Plus,
  Command,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationPanel from '@/components/custom/NotificationPanel';
import { useCRM } from '@/contexts/CRMContext';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useCRM();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const quickActions = [
    { label: 'New Lead', path: '/leads', shortcut: 'L' },
    { label: 'New Contact', path: '/contacts', shortcut: 'C' },
    { label: 'New Deal', path: '/deals', shortcut: 'D' },
    { label: 'New Task', path: '/tasks', shortcut: 'T' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-20',
          'transition-all duration-300',
          sidebarCollapsed ? 'left-16' : 'left-64'
        )}
      >
        <div className="h-full px-4 flex items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className={cn(
              'relative transition-all duration-300',
              searchFocused && 'scale-[1.02]'
            )}>
              <Search className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
                searchFocused ? 'text-blue-500' : 'text-gray-400'
              )} />
              <Input
                placeholder="Search leads, contacts, deals..."
                className={cn(
                  'pl-10 pr-10 py-2 bg-gray-50 border-gray-200 rounded-xl',
                  'focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100',
                  'transition-all duration-300'
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
                <Command className="w-3 h-3" />
                <span className="text-xs">K</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Add */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick Add</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {quickActions.map((action) => (
                  <DropdownMenuItem
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{action.label}</span>
                    <span className="text-xs text-gray-400">⌘{action.shortcut}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* AI Assistant Button */}
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-xl border-purple-200 hover:bg-purple-50 hover:border-purple-300"
              onClick={() => navigate('/ai-insights')}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            </Button>

            {/* Notifications */}
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-xl"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full bg-gray-100"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}
