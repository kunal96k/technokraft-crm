import React from 'react';
import { FollowUpPriority } from '../../types/followUps';

interface FollowUpPriorityBadgeProps {
  priority: FollowUpPriority;
  className?: string;
  size?: 'sm' | 'md';
}

export const FollowUpPriorityBadge: React.FC<FollowUpPriorityBadgeProps> = ({
  priority,
  className = '',
  size = 'md',
}) => {
  const isSm = size === 'sm';

  switch (priority) {
    case 'URGENT':
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-bold rounded uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200/80 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          Urgent
        </span>
      );

    case 'HIGH':
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-semibold rounded uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200/80 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          High
        </span>
      );

    case 'MEDIUM':
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-medium rounded uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Medium
        </span>
      );

    case 'LOW':
    default:
      return (
        <span
          id={`followup-priority-${priority.toLowerCase()}`}
          className={`inline-flex items-center gap-1 font-normal rounded uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/80 ${
            isSm ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-[11px]'
          } ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Low
        </span>
      );
  }
};
