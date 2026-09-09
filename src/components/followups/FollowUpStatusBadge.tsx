import React from 'react';
import { FollowUpStatus } from '../../types/followUps';
import { Clock, CheckCircle2, AlertTriangle, XCircle, RotateCcw, PlayCircle } from 'lucide-react';

interface FollowUpStatusBadgeProps {
  status: FollowUpStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const FollowUpStatusBadge: React.FC<FollowUpStatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  switch (status) {
    case 'OVERDUE':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md border bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <AlertTriangle className={isSm ? 'w-3 h-3 text-red-600 dark:text-red-400 animate-pulse' : 'w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse'} />
          <span>Overdue</span>
        </span>
      );

    case 'PENDING':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <Clock className={isSm ? 'w-3 h-3 text-amber-600 dark:text-amber-400' : 'w-3.5 h-3.5 text-amber-600 dark:text-amber-400'} />
          <span>Pending</span>
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <PlayCircle className={isSm ? 'w-3 h-3 text-blue-600 dark:text-blue-400' : 'w-3.5 h-3.5 text-blue-600 dark:text-blue-400'} />
          <span>In Progress</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3 text-emerald-600 dark:text-emerald-400' : 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400'} />
          <span>Completed</span>
        </span>
      );

    case 'RESCHEDULED':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <RotateCcw className={isSm ? 'w-3 h-3 text-purple-600 dark:text-purple-400' : 'w-3.5 h-3.5 text-purple-600 dark:text-purple-400'} />
          <span>Rescheduled</span>
        </span>
      );

    case 'CANCELLED':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <XCircle className={isSm ? 'w-3 h-3 text-slate-500 dark:text-slate-400' : 'w-3.5 h-3.5 text-slate-500 dark:text-slate-400'} />
          <span>Cancelled</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}>
          {status}
        </span>
      );
  }
};
