import React from 'react';
import { FollowUpPriority } from '../../types/followUps';

interface FollowUpPriorityBadgeProps {
  priority: FollowUpPriority;
  className?: string;
  size?: 'sm' | 'md';
}

export const FollowUpPriorityBadge: React.FC<FollowUpPriorityBadgeProps> = ({
  priority,
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  switch (priority) {
    case 'URGENT':
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-bold rounded uppercase tracking-wider bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          Urgent
        </span>
      );

    case 'HIGH':
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-semibold rounded uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </span>
      );

    case 'MEDIUM':
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-medium rounded uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Medium
        </span>
      );

    case 'LOW':
    default:
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-normal rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          Low
        </span>
      );
  }
};
