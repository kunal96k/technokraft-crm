import React from 'react';
import { formatCurrencyINR, formatLakhsINR } from '../../data/mockOpportunities';

interface OpportunityValueProps {
  value: number;
  probability?: number;
  showWeighted?: boolean;
  compact?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OpportunityValue: React.FC<OpportunityValueProps> = ({
  value,
  probability,
  showWeighted = false,
  compact = false,
  className = '',
  size = 'md',
}) => {
  const displayVal = compact ? formatLakhsINR(value) : formatCurrencyINR(value);
  const weightedVal = probability !== undefined ? Math.round((value * probability) / 100) : undefined;

  const sizeClasses = {
    sm: 'text-xs font-bold',
    md: 'text-sm font-bold',
    lg: 'text-lg sm:text-xl font-extrabold',
  }[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className={`${sizeClasses} text-slate-900 dark:text-white tracking-tight font-mono`}>
        {displayVal}
      </span>
      {showWeighted && weightedVal !== undefined && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium font-mono" title={`Value × ${probability}%`}>
          Weighted: {compact ? formatLakhsINR(weightedVal) : formatCurrencyINR(weightedVal)}
        </span>
      )}
    </div>
  );
};
