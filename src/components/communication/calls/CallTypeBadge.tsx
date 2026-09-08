import React from 'react';
import { CallType } from '../../../types/calls';
import { PhoneOutgoing, PhoneIncoming, PhoneMissed } from 'lucide-react';

interface CallTypeBadgeProps {
  type: CallType;
  showIconOnly?: boolean;
}

export const CallTypeBadge: React.FC<CallTypeBadgeProps> = ({ type, showIconOnly = false }) => {
  switch (type) {
    case 'outbound':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800"
          title="Outbound Call"
        >
          <PhoneOutgoing className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
          {!showIconOnly && <span>Outbound</span>}
        </span>
      );

    case 'inbound':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800"
          title="Inbound Call"
        >
          <PhoneIncoming className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {!showIconOnly && <span>Inbound</span>}
        </span>
      );

    case 'missed':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800"
          title="Missed Call"
        >
          <PhoneMissed className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
          {!showIconOnly && <span>Missed</span>}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span>{type}</span>
        </span>
      );
  }
};
