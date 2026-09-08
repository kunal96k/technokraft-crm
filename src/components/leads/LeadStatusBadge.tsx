import React from 'react';
import { LeadStatus } from '../../types/leads';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (s: LeadStatus) => {
    switch (s) {
      case 'NEW':
        return {
          label: 'New',
          bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          dot: 'bg-sky-500',
        };
      case 'CONTACTED':
        return {
          label: 'Contacted',
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'CALLBACK':
        return {
          label: 'Callback',
          bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          dot: 'bg-cyan-500',
        };
      case 'INTERESTED':
        return {
          label: 'Interested',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'QUALIFIED':
        return {
          label: 'Qualified',
          bg: 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border-purple-200 dark:border-purple-800',
          dot: 'bg-[#5B4DB7] dark:bg-purple-400',
        };
      case 'REQUIREMENT_PENDING':
        return {
          label: 'Req. Pending',
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'REQUIREMENT_RECEIVED':
        return {
          label: 'Req. Received',
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          dot: 'bg-indigo-500',
        };
      case 'PROPOSAL':
        return {
          label: 'Proposal',
          bg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
          dot: 'bg-violet-500',
        };
      case 'NEGOTIATION':
        return {
          label: 'Negotiation',
          bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          dot: 'bg-orange-500',
        };
      case 'WON':
        return {
          label: 'Won',
          bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          dot: 'bg-teal-500',
        };
      case 'LOST':
        return {
          label: 'Lost',
          bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
        };
      case 'NOT_INTERESTED':
        return {
          label: 'Not Interested',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
      default:
        return {
          label: s,
          bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="truncate">{config.label}</span>
    </span>
  );
};
