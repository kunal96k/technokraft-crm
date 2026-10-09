import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  UserCheck,
  Clock,
  AlertTriangle,
  FileText,
  CheckCheck,
  Mail,
  ExternalLink,
  Loader2,
  Inbox,
} from 'lucide-react';
import { NotificationItem } from '../../types/navigation';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../../services/notificationService';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchNotifications({ size: 10 });
      setNotifications(res.content);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('[NotificationDropdown] Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and synchronization listeners
  useEffect(() => {
    loadNotifications();

    const handleSync = () => {
      loadNotifications();
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleSync);
    // Periodically poll every 45s for fresh notifications
    const interval = setInterval(loadNotifications, 45000);

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleSync);
      clearInterval(interval);
    };
  }, [loadNotifications]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationDropdown] Failed to mark all as read:', err);
    }
  };

  const handleItemClick = async (n: NotificationItem) => {
    try {
      if (n.unread) {
        await markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[NotificationDropdown] Failed to mark as read:', err);
    }

    setIsOpen(false);
    if (n.linkUrl) {
      navigate(n.linkUrl);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'lead':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-600" />;
      case 'followup':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'task':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'requirement':
        return <FileText className="w-3.5 h-3.5 text-sky-600" />;
      case 'proposal':
        return <Check className="w-3.5 h-3.5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadNotifications();
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="View notifications"
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-700 rounded-full">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full">
                  Up to date
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-[#5B4DB7] hover:text-[#4E41A2] hover:underline flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 px-4 text-center">
                <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You will be notified when leads, follow-ups, or proposals are updated.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 group ${
                    n.unread ? 'bg-purple-50/40' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-white group-hover:shadow-xs transition-all">
                    {getIconForType(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-[13px] truncate ${
                          n.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap ml-1">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {n.description}
                    </p>
                    {n.linkUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5B4DB7] mt-1 group-hover:underline">
                        View details
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#5B4DB7] shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 rounded-b-xl flex items-center justify-center">
            <button
              type="button"
              onClick={handleViewAll}
              className="text-xs font-semibold text-[#5B4DB7] hover:text-[#453896] hover:underline flex items-center gap-1.5 transition-colors py-0.5"
            >
              <span>View all notification history</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
