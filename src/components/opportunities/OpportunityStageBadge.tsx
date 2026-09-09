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
        return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60';
      case 'Requirement Received':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60';
      case 'Proposal':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60';
      case 'Negotiation':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
      case 'Won':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
      case 'Lost':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
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
