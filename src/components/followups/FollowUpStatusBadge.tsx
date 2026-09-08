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
          className={`inline-flex items-center gap-1.5 font-semibold rounded-md border bg-red-50 text-red-700 border-red-200 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <AlertTriangle className={isSm ? 'w-3 h-3 text-red-600 animate-pulse' : 'w-3.5 h-3.5 text-red-600 animate-pulse'} />
          <span>Overdue</span>
        </span>
      );

    case 'PENDING':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-amber-50 text-amber-700 border-amber-200 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <Clock className={isSm ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>Pending</span>
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-blue-50 text-blue-700 border-blue-200 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <PlayCircle className={isSm ? 'w-3 h-3 text-blue-600' : 'w-3.5 h-3.5 text-blue-600'} />
          <span>In Progress</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <CheckCircle2 className={isSm ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          <span>Completed</span>
        </span>
      );

    case 'RESCHEDULED':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-purple-50 text-purple-700 border-purple-200 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <RotateCcw className={isSm ? 'w-3 h-3 text-purple-600' : 'w-3.5 h-3.5 text-purple-600'} />
          <span>Rescheduled</span>
        </span>
      );

    case 'CANCELLED':
      return (
        <span
          id={`followup-status-${status.toLowerCase()}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-md border bg-slate-100 text-slate-600 border-slate-200 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <XCircle className={isSm ? 'w-3 h-3 text-slate-500' : 'w-3.5 h-3.5 text-slate-500'} />
          <span>Cancelled</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 ${className}`}>
          {status}
        </span>
      );
  }
};
