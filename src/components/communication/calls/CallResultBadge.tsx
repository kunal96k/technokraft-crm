import React from 'react';
import { CallResult } from '../../../types/calls';
import {
  Sparkles,
  CalendarCheck,
  FileCheck2,
  PhoneForwarded,
  XCircle,
  PhoneOff,
  UserX,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface CallResultBadgeProps {
  result?: CallResult;
  size?: 'sm' | 'md';
}

export const CallResultBadge: React.FC<CallResultBadgeProps> = ({ result, size = 'sm' }) => {
  if (!result) {
    return (
      <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">
        Pending
      </span>
    );
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (result) {
    case 'Interested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Interested</span>
        </span>
      );

    case 'Requirement Received':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs ${sizeClasses}`}
        >
          <Sparkles className="w-3 h-3 text-[#5B4DB7] dark:text-purple-300" />
          <span>Requirement Received</span>
        </span>
      );

    case 'Proposal Requested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 ${sizeClasses}`}
        >
          <FileCheck2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          <span>Proposal Requested</span>
        </span>
      );

    case 'Meeting Requested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 ${sizeClasses}`}
        >
          <CalendarCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>Meeting Requested</span>
        </span>
      );

    case 'Callback Required':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${sizeClasses}`}
        >
          <PhoneForwarded className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Callback Required</span>
        </span>
      );

    case 'Not Interested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses}`}
        >
          <XCircle className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          <span>Not Interested</span>
        </span>
      );

    case 'No Response':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 ${sizeClasses}`}
        >
          <PhoneOff className="w-3 h-3 text-rose-500 dark:text-rose-400" />
          <span>No Response</span>
        </span>
      );

    case 'Busy':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-orange-500 dark:text-orange-400" />
          <span>Busy</span>
        </span>
      );

    case 'Wrong Number':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 ${sizeClasses}`}
        >
          <UserX className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          <span>Wrong Number</span>
        </span>
      );

    case 'Other':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${sizeClasses}`}
        >
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>{result}</span>
        </span>
      );
  }
};
