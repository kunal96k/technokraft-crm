import React from 'react';
import { Flame } from 'lucide-react';

interface LeadScoreBadgeProps {
  score: number;
  showLabel?: boolean;
}

export const LeadScoreBadge: React.FC<LeadScoreBadgeProps> = ({ score, showLabel = false }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = 'Cold';
  let flameColor = 'text-slate-400';

  if (score >= 81) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'Very Hot';
    flameColor = 'text-rose-500 fill-rose-500';
  } else if (score >= 61) {
    color = 'bg-amber-50 text-amber-800 border-amber-200';
    label = 'Hot';
    flameColor = 'text-amber-500 fill-amber-500';
  } else if (score >= 31) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
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
      {showLabel && <span className="text-[10px] uppercase font-bold text-slate-500">/ 100</span>}
    </span>
  );
};
