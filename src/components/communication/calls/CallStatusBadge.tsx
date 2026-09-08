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
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-blue-600" />
          <span>Scheduled</span>
        </span>
      );

    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );

    case 'missed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}
        >
          <PhoneMissed className="w-3 h-3 text-rose-600" />
          <span>Missed</span>
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <XCircle className="w-3 h-3 text-slate-500" />
          <span>Cancelled</span>
        </span>
      );

    case 'failed':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>Failed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};
