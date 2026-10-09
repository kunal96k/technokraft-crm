import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  UserCheck,
  Clock,
  AlertTriangle,
  FileText,
  CheckCheck,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Mail,
  ShieldAlert,
  Inbox,
  Eye,
  EyeOff,
  Sparkles,
  PlusCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import { NotificationItem } from '../../types/navigation';
import {
  fetchNotifications,
  markAsRead,
  toggleNotificationRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
  NOTIFICATIONS_UPDATED_EVENT,
} from '../../services/notificationService';

type FilterCategory = 'all' | 'unread' | 'lead' | 'followup' | 'task' | 'proposal' | 'system';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [simulateForm, setSimulateForm] = useState({
    title: '',
    description: '',
    type: 'lead',
    priority: 'HIGH',
    linkUrl: '',
  });

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const res = await fetchNotifications({ size: 100 });
      setNotifications(res.content);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('[NotificationsPage] Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleSync);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleSync);
    };
  }, [loadData]);

  // Actions
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationsPage] Error marking all read:', err);
    }
  };

  const handleToggleRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const updated = await toggleNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, unread: updated.unread } : item))
      );
      setUnreadCount((prev) => (updated.unread ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error('[NotificationsPage] Error toggling read status:', err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      setUnreadCount((prev) => {
        const item = notifications.find((n) => n.id === id);
        return item?.unread ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('[NotificationsPage] Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notification records?')) {
      return;
    }
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationsPage] Error clearing notifications:', err);
    }
  };

  const handleOpenItem = async (n: NotificationItem) => {
    if (n.unread) {
      try {
        await markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('[NotificationsPage] Error marking read:', err);
      }
    }
    if (n.linkUrl) {
      navigate(n.linkUrl);
    }
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulateForm.title.trim()) return;
    try {
      await createNotification(simulateForm);
      setShowSimulateModal(false);
      setSimulateForm({
        title: '',
        description: '',
        type: 'lead',
        priority: 'HIGH',
        linkUrl: '',
      });
      loadData(true);
    } catch (err) {
      console.error('[NotificationsPage] Error creating simulation notification:', err);
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category filter
      if (activeCategory === 'unread' && !n.unread) return false;
      if (activeCategory === 'lead' && n.type !== 'lead') return false;
      if (activeCategory === 'followup' && n.type !== 'followup') return false;
      if (activeCategory === 'task' && n.type !== 'task' && n.type !== 'requirement') return false;
      if (activeCategory === 'proposal' && n.type !== 'proposal') return false;
      if (activeCategory === 'system' && n.type !== 'system' && n.type !== 'email') return false;

      // Priority filter
      if (priorityFilter !== 'all') {
        const itemPrio = (n.priority || '').toUpperCase();
        if (priorityFilter === 'urgent' && itemPrio !== 'URGENT') return false;
        if (priorityFilter === 'high' && itemPrio !== 'HIGH' && itemPrio !== 'URGENT') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesDesc = n.description.toLowerCase().includes(q);
        const matchesLead = n.leadCode?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesLead;
      }

      return true;
    });
  }, [notifications, activeCategory, priorityFilter, searchQuery]);

  // Metric counts
  const metrics = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => n.unread).length;
    const leads = notifications.filter((n) => n.type === 'lead').length;
    const followups = notifications.filter((n) => n.type === 'followup').length;
    const urgent = notifications.filter(
      (n) => (n.priority || '').toUpperCase() === 'URGENT' || (n.priority || '').toUpperCase() === 'HIGH'
    ).length;
    return { total, unread, leads, followups, urgent };
  }, [notifications]);

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'lead':
        return <UserCheck className="w-5 h-5 text-indigo-600" />;
      case 'followup':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'task':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'requirement':
        return <FileText className="w-5 h-5 text-sky-600" />;
      case 'proposal':
        return <Check className="w-5 h-5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'lead':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Lead Assignment
          </span>
        );
      case 'followup':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Follow-up
          </span>
        );
      case 'task':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Task Alert
          </span>
        );
      case 'requirement':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Requirement
          </span>
        );
      case 'proposal':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Proposal
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Email System
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            System
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B4DB7] to-[#7B68EE] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
              <p className="text-sm text-slate-500">
                Track assignments, follow-up deadlines, customer interactions, and system updates
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-colors disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] shadow-sm shadow-purple-500/20 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create notification
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Alerts</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics.total}</h3>
            <span className="text-[11px] text-slate-400">All registered notifications</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Unread Alerts</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{metrics.unread}</h3>
            <span className="text-[11px] text-slate-400">Pending your attention</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lead Assignments</p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{metrics.leads}</h3>
            <span className="text-[11px] text-slate-400">Pipeline opportunities</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Urgent & High</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{metrics.urgent}</h3>
            <span className="text-[11px] text-slate-400">High priority events</span>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Toolbar: Search & Category Pills */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description, or lead ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30 focus:border-[#5B4DB7] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Priority:
              </span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent Only</option>
                <option value="high">High & Urgent</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#5B4DB7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('unread')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'unread'
                  ? 'bg-[#5B4DB7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('lead')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'lead'
                  ? 'bg-[#5B4DB7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Leads ({metrics.leads})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('followup')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'followup'
                  ? 'bg-[#5B4DB7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Follow-ups ({metrics.followups})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('task')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'task'
                  ? 'bg-[#5B4DB7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tasks & RFP
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('proposal')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'proposal'
                  ? 'bg-[#5B4DB7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Proposals
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('system')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === 'system'
                  ? 'bg-[#5B4DB7] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Email & System
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#5B4DB7] mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading notifications from server...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {searchQuery
                ? `No notifications matched your query "${searchQuery}". Try a different filter.`
                : activeCategory === 'unread'
                ? "You're all caught up! No unread notifications pending."
                : 'There are currently no notifications matching this category.'}
            </p>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setPriorityFilter('all');
                }}
                className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#5B4DB7] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleOpenItem(n)}
                className={`p-4 transition-all hover:bg-slate-50 flex items-start gap-4 cursor-pointer group ${
                  n.unread ? 'bg-purple-50/30' : ''
                }`}
              >
                {/* Left Type Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    n.unread
                      ? 'bg-white border-purple-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-white'
                  }`}
                >
                  {getIconForType(n.type)}
                </div>

                {/* Center Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {getTypeBadge(n.type)}

                    {n.priority && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          n.priority.toUpperCase() === 'URGENT'
                            ? 'bg-rose-100 text-rose-700'
                            : n.priority.toUpperCase() === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {n.priority}
                      </span>
                    )}

                    {n.leadCode && (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {n.leadCode}
                      </span>
                    )}

                    <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </span>
                  </div>

                  <h3
                    className={`text-sm ${
                      n.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                    }`}
                  >
                    {n.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.description}</p>

                  {/* Deep link indicator */}
                  {n.linkUrl && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#5B4DB7] group-hover:underline">
                      <span>Go to associated record</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>

                {/* Right Quick Actions */}
                <div className="flex items-center gap-1 shrink-0 pt-1">
                  {/* Mark Read/Unread Toggle */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(n.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                    title={n.unread ? 'Mark as read' : 'Mark as unread'}
                  >
                    {n.unread ? <Eye className="w-4 h-4 text-purple-600" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(n.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Unread dot */}
                  {n.unread && (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-[#5B4DB7] shrink-0 ml-1"
                      title="Unread notification"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredNotifications.length}</strong> of{' '}
            <strong>{notifications.length}</strong> notifications
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Synchronized live with TechnoKraft CRM backend
          </span>
        </div>
      </div>

      {/* Modal: Create / Simulate Custom Notification */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Create In-App Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Client signed proposal contract"
                  value={simulateForm.title}
                  onChange={(e) => setSimulateForm({ ...simulateForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes or context regarding this alert..."
                  value={simulateForm.description}
                  onChange={(e) => setSimulateForm({ ...simulateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={simulateForm.type}
                    onChange={(e) => setSimulateForm({ ...simulateForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  >
                    <option value="lead">Lead Assignment</option>
                    <option value="followup">Follow-up Due</option>
                    <option value="task">Task Overdue</option>
                    <option value="proposal">Proposal Update</option>
                    <option value="requirement">Requirement Document</option>
                    <option value="email">Email System</option>
                    <option value="system">System Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={simulateForm.priority}
                    onChange={(e) => setSimulateForm({ ...simulateForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Link URL (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. /leads/1 or /follow-ups"
                  value={simulateForm.linkUrl}
                  onChange={(e) => setSimulateForm({ ...simulateForm, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] transition-colors"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
