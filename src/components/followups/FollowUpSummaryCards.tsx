import React from 'react';
import { Calendar, CalendarCheck, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';
import { FollowUpStats, FollowUpTab } from '../../types/followUps';

interface FollowUpSummaryCardsProps {
  stats: FollowUpStats;
  activeTab: FollowUpTab;
  onSelectTab: (tab: FollowUpTab) => void;
  onSelectPriorityFilter?: () => void;
  className?: string;
}

export const FollowUpSummaryCards: React.FC<FollowUpSummaryCardsProps> = ({
  stats,
  activeTab,
  onSelectTab,
  onSelectPriorityFilter,
  className = '',
}) => {
  return (
    <div
      id="followup-summary-cards"
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ${className}`}
    >
      {/* 1. Today's Follow-ups */}
      <button
        type="button"
        onClick={() => onSelectTab('today')}
        className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 ${
          activeTab === 'today'
            ? 'bg-purple-50/80 dark:bg-purple-950/40 border-[#5B4DB7] shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Schedule</span>
          <div className="w-8 h-8 rounded-lg bg-purple-100/70 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.today}
          </span>
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">Scheduled</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Action required today</span>
        </div>
      </button>

      {/* 2. Upcoming */}
      <button
        type="button"
        onClick={() => onSelectTab('upcoming')}
        className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 ${
          activeTab === 'upcoming'
            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Upcoming</span>
          <div className="w-8 h-8 rounded-lg bg-blue-100/70 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.upcoming}
          </span>
          <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">Pipeline</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Tomorrow & next 7 days</span>
        </div>
      </button>

      {/* 3. Overdue */}
      <button
        type="button"
        onClick={() => onSelectTab('overdue')}
        className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500/40 ${
          activeTab === 'overdue'
            ? 'bg-red-50/80 dark:bg-red-950/40 border-red-500 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue</span>
          <div className="w-8 h-8 rounded-lg bg-red-100/80 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">
            {stats.overdue}
          </span>
          <span className="text-[11px] text-red-700 dark:text-red-300 font-medium">Attention</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
          <span>Immediate follow-up</span>
        </div>
      </button>

      {/* 4. Completed */}
      <button
        type="button"
        onClick={() => onSelectTab('completed')}
        className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
          activeTab === 'completed'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.completed}
          </span>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Logged</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Success & outcomes</span>
        </div>
      </button>

      {/* 5. High Priority */}
      <button
        type="button"
        onClick={() => {
          if (onSelectPriorityFilter) {
            onSelectPriorityFilter();
          } else {
            onSelectTab('all');
          }
        }}
        className="col-span-2 sm:col-span-1 text-left p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-xs transition-all duration-150 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500/40"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">High / Urgent</span>
          <div className="w-8 h-8 rounded-lg bg-amber-100/80 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 tracking-tight">
            {stats.highPriority}
          </span>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Priority</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>VIP accounts & deals</span>
        </div>
      </button>
    </div>
  );
};
