import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Bell, Check, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCRM } from '@/contexts/CRMContext';
import type { Notification } from '@/types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRM();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!panelRef.current) return;

    if (isOpen) {
      gsap.fromTo(panelRef.current,
        { opacity: 0, x: 50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'expo.out' }
      );
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-100';
      case 'error':
        return 'bg-red-50 border-red-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-4 top-16 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
        style={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              filter === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              filter === 'unread' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={cn(
                    'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                    !notification.read && 'bg-blue-50/30',
                    getNotificationBg(notification.type)
                  )}
                  onClick={() => markNotificationRead(notification.notificationId)}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
