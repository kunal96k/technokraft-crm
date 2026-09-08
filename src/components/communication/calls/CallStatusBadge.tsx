import React from 'react';
import { CallStatus } from '../../../types/calls';
import { Clock, CheckCircle2, PhoneMissed, XCircle, AlertTriangle } from 'lucide-react';

interface CallStatusBadgeProps {
  status: CallStatus;
  size?: 'sm' | 'md';
}

export const CallStatusBadge: React.FC<CallStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'scheduled':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>Scheduled</span>
        </span>
      );

    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Completed</span>
        </span>
      );

    case 'missed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 ${sizeClasses}`}
        >
          <PhoneMissed className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Missed</span>
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses}`}
        >
          <XCircle className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          <span>Cancelled</span>
        </span>
      );

    case 'failed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
          <span>Failed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ${sizeClasses}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};
