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
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80"
          title="Outbound Call"
        >
          <PhoneOutgoing className="w-3 h-3 text-sky-600 shrink-0" />
          {!showIconOnly && <span>Outbound</span>}
        </span>
      );

    case 'inbound':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80"
          title="Inbound Call"
        >
          <PhoneIncoming className="w-3 h-3 text-emerald-600 shrink-0" />
          {!showIconOnly && <span>Inbound</span>}
        </span>
      );

    case 'missed':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80"
          title="Missed Call"
        >
          <PhoneMissed className="w-3 h-3 text-rose-600 shrink-0" />
          {!showIconOnly && <span>Missed</span>}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
          <span>{type}</span>
        </span>
      );
  }
};
