import React from 'react';
import { Flame } from 'lucide-react';

interface LeadScoreBadgeProps {
  score: number;
  showLabel?: boolean;
}

export const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ score, showLabel = false }) => {
  let color = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let label = 'Cold';
  let flameColor = 'text-slate-400 dark:text-slate-500';

  if (score >= 81) {
    color = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    label = 'Very Hot';
    flameColor = 'text-rose-500 fill-rose-500';
  } else if (score >= 61) {
    color = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    label = 'Hot';
    flameColor = 'text-amber-500 fill-amber-500';
  } else if (score >= 31) {
    color = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    label = 'Warm';
    flameColor = 'text-blue-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}
      title={`Lead Score: ${score}/100 (${label})`}
    >
      <Flame className={`w-3.5 h-3.5 ${flameColor}`} />
      <span className="font-mono">{score}</span>
      {showLabel && <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">/ 100</span>}
    </span>
  );
};
