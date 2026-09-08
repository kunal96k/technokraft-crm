import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, UserCheck, Clock, AlertTriangle, FileText, CheckCheck } from 'lucide-react';
import { SAMPLE_NOTIFICATIONS } from '../../config/navigation';
import { NotificationItem } from '../../types/navigation';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
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
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="View notifications"
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-2xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-[#5B4DB7] hover:text-[#4E41A2] flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markItemAsRead(n.id)}
                className={`p-3 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                  n.unread ? 'bg-purple-50/40' : ''
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getIconForType(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-[13px] ${n.unread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {n.description}
                  </p>
                </div>
                {n.unread && (
                  <span className="w-2 h-2 rounded-full bg-[#5B4DB7] flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 text-center">
            <span className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
              View all notification history
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
