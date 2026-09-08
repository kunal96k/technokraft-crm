import React from 'react';
import { OpportunityStage } from '../../types/opportunities';

interface OpportunityStageBadgeProps {
  stage: OpportunityStage;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const OpportunityStageBadge: React.FC<OpportunityStageBadgeProps> = ({
  stage,
  className = '',
  size = 'sm',
}) => {
  const getStyles = (s: OpportunityStage) => {
    switch (s) {
      case 'Qualified':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'Requirement Received':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Proposal':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Negotiation':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'Won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
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
      className={`inline-flex items-center font-semibold rounded-md border tracking-tight uppercase ${sizeClasses} ${getStyles(
        stage
      )} ${className}`}
    >
      {stage}
    </span>
  );
};
