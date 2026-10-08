import React from 'react';
import {
  CalendarClock,
  CheckSquare,
  Video,
  Plus,
  RotateCcw,
  SearchX,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export interface FollowUpEmptyStateProps {
  module?: 'followups' | 'tasks' | 'meetings';
  tab?: string;
  hasFilters?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  onResetFilters?: () => void;
  onRefresh?: () => void;
  title?: string;
  description?: string;
}

export const FollowUpEmptyState: React.FC<FollowUpEmptyStateProps> = ({
  module = 'followups',
  tab = 'all',
  hasFilters = false,
  onAction,
  actionLabel,
  onResetFilters,
  onRefresh,
  title,
  description,
}) => {
  // Determine icon, heading and description based on context
  let icon = <CalendarClock className="w-8 h-8 text-[#5B4DB7] dark:text-purple-400" />;
  let heading = title || 'No Follow-ups Found';
  let subtext =
    description ||
    'There are no follow-ups scheduled yet. Create your first follow-up to start tracking client communications.';
  let primaryButtonLabel = actionLabel || 'New Follow-up';

  if (hasFilters) {
    icon = <SearchX className="w-8 h-8 text-amber-500 dark:text-amber-400" />;
    heading = title || 'No Matching Records';
    subtext =
      description ||
      'No records match your active search and filter criteria. Try adjusting or clearing your filters.';
  } else if (module === 'tasks') {
    icon = <CheckSquare className="w-8 h-8 text-blue-500 dark:text-blue-400" />;
    primaryButtonLabel = actionLabel || 'New Task';

    if (tab === 'TODO') {
      heading = 'No Pending Tasks';
      subtext = 'You have no open tasks on your to-do list. Create a task or review completed deliverables.';
    } else if (tab === 'IN_PROGRESS') {
      heading = 'No Tasks In Progress';
      subtext = 'There are currently no tasks actively marked in progress.';
    } else if (tab === 'OVERDUE') {
      icon = <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />;
      heading = 'No Overdue Tasks!';
      subtext = 'Awesome work! All team tasks and deliverables are on track and within SLA windows.';
    } else if (tab === 'COMPLETED') {
      heading = 'No Completed Tasks Yet';
      subtext = 'When tasks are finished and marked as done, they will be archived here for tracking.';
    } else {
      heading = title || 'No Tasks Found';
      subtext = description || 'There are no tasks recorded in your workspace yet. Create a task to track deliverables.';
    }
  } else if (module === 'meetings') {
    icon = <Video className="w-8 h-8 text-[#5B4DB7] dark:text-purple-400" />;
    primaryButtonLabel = actionLabel || 'Schedule Meeting';

    if (tab === 'today') {
      heading = 'No Meetings Today';
      subtext = 'You have no client or internal meetings scheduled for today. Check the upcoming calendar or book a session.';
    } else if (tab === 'upcoming') {
      heading = 'No Upcoming Meetings';
      subtext = 'No future meetings are on the calendar yet. Schedule a discovery call, demo, or review.';
    } else if (tab === 'completed') {
      heading = 'No Completed Meetings';
      subtext = 'Completed client meetings with logged minutes and outcomes will appear here.';
    } else {
      heading = title || 'No Meetings Scheduled';
      subtext =
        description ||
        'No client meetings, discovery calls, or presentations are scheduled. Click below to schedule a meeting.';
    }
  } else {
    // Follow-ups module
    if (tab === 'today') {
      icon = <Calendar className="w-8 h-8 text-[#5B4DB7] dark:text-purple-400" />;
      heading = 'No Follow-ups for Today';
      subtext = "You're all caught up for today! Check the Upcoming tab or schedule a new customer touchpoint.";
    } else if (tab === 'upcoming') {
      icon = <CalendarClock className="w-8 h-8 text-blue-500 dark:text-blue-400" />;
      heading = 'No Upcoming Follow-ups';
      subtext = 'There are no future follow-ups scheduled. Plan ahead by adding reminders for hot or contacted leads.';
    } else if (tab === 'overdue') {
      icon = <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />;
      heading = 'No Overdue Follow-ups!';
      subtext = 'Great job! All scheduled customer communications are completed or on track.';
    } else if (tab === 'completed') {
      heading = 'No Completed Follow-ups Yet';
      subtext = 'When follow-ups are closed with outcomes and notes, they will appear in this history tab.';
    }
  }

  return (
    <div
      id="crm-empty-state-card"
      className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/90 dark:border-slate-800 rounded-2xl p-10 sm:p-14 text-center shadow-xs transition-all animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Background soft ambient glowing ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#5B4DB7]/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Icon badge with double ring */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-b from-purple-50 to-purple-100/70 dark:from-purple-950/60 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
        {icon}
      </div>

      {/* Text block */}
      <div className="relative z-10 max-w-md mx-auto space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {heading}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {subtext}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-6">
        {hasFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#5B4DB7] to-[#4d3fa5] hover:from-[#4d3fa5] hover:to-[#3e3288] text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{primaryButtonLabel}</span>
          </button>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
};
