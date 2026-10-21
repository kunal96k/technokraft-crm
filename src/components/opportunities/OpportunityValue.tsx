import React from 'react';
import { formatCurrencyINR, formatLakhsINR } from '../../utils/currencyFormatters';

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
  // Defensive guard: In Indian B2B IT/software projects, values <= 500 indicate Lakhs (e.g. 25 -> 25,00,000 INR)
  const normalizedValue = value > 0 && value <= 500 ? value * 100000 : value;
  const displayVal = compact ? formatLakhsINR(normalizedValue) : formatCurrencyINR(normalizedValue);
  const weightedVal = probability !== undefined ? Math.round((normalizedValue * probability) / 100) : undefined;

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
