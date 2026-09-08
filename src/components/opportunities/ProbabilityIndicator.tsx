import React from 'react';

interface ProbabilityIndicatorProps {
  probability: number;
  showBar?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const ProbabilityIndicator: React.FC<ProbabilityIndicatorProps> = ({
  probability,
  showBar = false,
  className = '',
  size = 'md',
}) => {
  const getColor = (p: number) => {
    if (p >= 80) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
    if (p >= 60) return 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60';
    if (p >= 40) return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60';
    if (p >= 20) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60';
  };

  const getBarColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 60) return 'bg-[#5B4DB7]';
    if (p >= 40) return 'bg-blue-500';
    if (p >= 20) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono font-semibold border ${getColor(
          probability
        )} ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}
      >
        {probability}%
      </span>

      {showBar && (
        <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-600">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(probability)}`}
            style={{ width: `${Math.min(100, Math.max(0, probability))}%` }}
          />
        </div>
      )}
    </div>
  );
};
