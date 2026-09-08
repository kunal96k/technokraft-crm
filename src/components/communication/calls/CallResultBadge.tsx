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
      <span className="text-slate-400 text-[11px] italic">
        Pending
      </span>
    );
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (result) {
    case 'Interested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Interested</span>
        </span>
      );

    case 'Requirement Received':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-purple-50 text-[#5B4DB7] border border-purple-200 shadow-2xs ${sizeClasses}`}
        >
          <Sparkles className="w-3 h-3 text-[#5B4DB7]" />
          <span>Requirement Received</span>
        </span>
      );

    case 'Proposal Requested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200 ${sizeClasses}`}
        >
          <FileCheck2 className="w-3 h-3 text-teal-600" />
          <span>Proposal Requested</span>
        </span>
      );

    case 'Meeting Requested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 ${sizeClasses}`}
        >
          <CalendarCheck className="w-3 h-3 text-indigo-600" />
          <span>Meeting Requested</span>
        </span>
      );

    case 'Callback Required':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <PhoneForwarded className="w-3 h-3 text-amber-600" />
          <span>Callback Required</span>
        </span>
      );

    case 'Not Interested':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <XCircle className="w-3 h-3 text-slate-500" />
          <span>Not Interested</span>
        </span>
      );

    case 'No Response':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <PhoneOff className="w-3 h-3 text-rose-500" />
          <span>No Response</span>
        </span>
      );

    case 'Busy':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-orange-500" />
          <span>Busy</span>
        </span>
      );

    case 'Wrong Number':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 ${sizeClasses}`}
        >
          <UserX className="w-3 h-3 text-zinc-500" />
          <span>Wrong Number</span>
        </span>
      );

    case 'Other':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>{result}</span>
        </span>
      );
  }
};
