import React from 'react';
import { CheckSquare, PlayCircle, Clock, CheckCircle2, Flame } from 'lucide-react';

interface ProjectSummaryCardsProps {
  totalCount: number;
  inProgressCount: number;
  reviewCount: number;
  completedCount: number;
  totalHours: number;
  activeFilterStatus?: string;
  onSelectStatus?: (status: string) => void;
}

export const ProjectSummaryCards: React.FC<ProjectSummaryCardsProps> = ({
  totalCount,
  inProgressCount,
  reviewCount,
  completedCount,
  totalHours,
  activeFilterStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: 'total',
      label: 'Sprint Work Items',
      value: totalCount,
      subtext: 'Active tasks in delivery backlog',
      icon: CheckSquare,
      color: 'text-[#5B4DB7] dark:text-purple-400',
      bgColor: 'bg-purple-50/70 dark:bg-purple-950/50',
      borderColor: 'border-purple-100 dark:border-purple-900/50',
      statusFilter: '',
    },
    {
      id: 'in_progress',
      label: 'In Development',
      value: inProgressCount,
      subtext: 'Currently being coded by devs & interns',
      icon: PlayCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/70 dark:bg-blue-950/50',
      borderColor: 'border-blue-100 dark:border-blue-900/50',
      statusFilter: 'IN_PROGRESS',
    },
    {
      id: 'review_qa',
      label: 'Review & QA Testing',
      value: reviewCount,
      subtext: 'Under code review or QA validation',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/70 dark:bg-amber-950/50',
      borderColor: 'border-amber-100 dark:border-amber-900/50',
      statusFilter: 'QA_TESTING',
    },
    {
      id: 'completed',
      label: 'Completed / Released',
      value: completedCount,
      subtext: 'Verified and ready for client delivery',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/70 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-100 dark:border-emerald-900/50',
      statusFilter: 'COMPLETED',
    },
    {
      id: 'effort',
      label: 'Total Estimated Effort',
      value: `${totalHours}h`,
      subtext: 'Planned sprint delivery hours',
      icon: Flame,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/70 dark:bg-indigo-950/50',
      borderColor: 'border-indigo-100 dark:border-indigo-900/50',
      statusFilter: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilterStatus && card.statusFilter === activeFilterStatus;

        return (
          <div
            key={card.id}
            onClick={() => onSelectStatus?.(card.statusFilter)}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-slate-900 border-[#5B4DB7] ring-2 ring-[#5B4DB7]/20 shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center shrink-0 border ${card.borderColor}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white font-mono">
              {card.value}
            </div>

            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
