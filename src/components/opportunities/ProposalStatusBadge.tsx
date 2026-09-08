import React from 'react';
import { ProposalStatus } from '../../types/opportunities';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const ProposalStatusBadge: React.FC<ProposalStatusBadgeProps> = ({
  status,
  className = '',
  size = 'sm',
}) => {
  const getStyles = (s: ProposalStatus) => {
    switch (s) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Prepared':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Viewed':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Negotiation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Expired':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border tracking-tight ${sizeClasses} ${getStyles(
        status
      )} ${className}`}
    >
      {status}
    </span>
  );
};
