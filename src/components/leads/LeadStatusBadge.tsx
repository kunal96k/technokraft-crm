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
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
        };
      case 'CONTACTED':
        return {
          label: 'Contacted',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'CALLBACK':
        return {
          label: 'Callback',
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          dot: 'bg-cyan-500',
        };
      case 'INTERESTED':
        return {
          label: 'Interested',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'QUALIFIED':
        return {
          label: 'Qualified',
          bg: 'bg-purple-50 text-[#5B4DB7] border-purple-200',
          dot: 'bg-[#5B4DB7]',
        };
      case 'REQUIREMENT_PENDING':
        return {
          label: 'Req. Pending',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'REQUIREMENT_RECEIVED':
        return {
          label: 'Req. Received',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      case 'PROPOSAL':
        return {
          label: 'Proposal',
          bg: 'bg-violet-50 text-violet-700 border-violet-200',
          dot: 'bg-violet-500',
        };
      case 'NEGOTIATION':
        return {
          label: 'Negotiation',
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500',
        };
      case 'WON':
        return {
          label: 'Won',
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          dot: 'bg-teal-500',
        };
      case 'LOST':
        return {
          label: 'Lost',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'NOT_INTERESTED':
        return {
          label: 'Not Interested',
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
      default:
        return {
          label: s,
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
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
