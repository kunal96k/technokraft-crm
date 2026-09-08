import React from 'react';
import { Target, CheckCircle2, FileText, Handshake, IndianRupee } from 'lucide-react';
import { formatLakhsINR } from '../../data/mockOpportunities';

interface OpportunitySummaryCardsProps {
  totalCount: number;
  qualifiedCount: number;
  proposalCount: number;
  negotiationCount: number;
  pipelineValue: number;
  activeFilterStage?: string;
  onSelectStage?: (stage: string) => void;
}

export const OpportunitySummaryCards: React.FC<OpportunitySummaryCardsProps> = ({
  totalCount,
  qualifiedCount,
  proposalCount,
  negotiationCount,
  pipelineValue,
  activeFilterStage,
  onSelectStage,
}) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Opportunities',
      value: totalCount,
      subtext: 'Active pipeline opportunities',
      icon: Target,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50/70 dark:bg-indigo-950/50',
      borderColor: 'border-indigo-100 dark:border-indigo-900/50',
      stageFilter: '',
    },
    {
      id: 'qualified',
      label: 'Qualified',
      value: qualifiedCount,
      subtext: 'Passed initial discovery',
      icon: CheckCircle2,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50/70 dark:bg-sky-950/50',
      borderColor: 'border-sky-100 dark:border-sky-900/50',
      stageFilter: 'Qualified',
    },
    {
      id: 'proposal',
      label: 'Proposal Sent',
      value: proposalCount,
      subtext: 'Commercials under client review',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/70 dark:bg-purple-950/50',
      borderColor: 'border-purple-100 dark:border-purple-900/50',
      stageFilter: 'Proposal',
    },
    {
      id: 'negotiation',
      label: 'Negotiation',
      value: negotiationCount,
      subtext: 'Contract & pricing discussions',
      icon: Handshake,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/70 dark:bg-amber-950/50',
      borderColor: 'border-amber-100 dark:border-amber-900/50',
      stageFilter: 'Negotiation',
    },
    {
      id: 'pipeline-value',
      label: 'Pipeline Value',
      value: formatLakhsINR(pipelineValue),
      subtext: 'Cumulative active deal value',
      icon: IndianRupee,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/70 dark:bg-emerald-950/50',
      borderColor: 'border-emerald-100 dark:border-emerald-900/50',
      stageFilter: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = card.stageFilter && activeFilterStage === card.stageFilter;

        return (
          <div
            key={card.id}
            onClick={() => card.stageFilter && onSelectStage?.(isSelected ? '' : card.stageFilter)}
            className={`relative bg-white dark:bg-[#1E293B] rounded-xl border p-3.5 sm:p-4 transition-all duration-200 shadow-2xs ${
              card.stageFilter ? 'cursor-pointer hover:border-[#5B4DB7]/50 hover:shadow-sm' : ''
            } ${isSelected ? 'ring-2 ring-[#5B4DB7] border-transparent bg-indigo-50/20 dark:bg-indigo-950/30' : 'border-slate-200/90 dark:border-slate-700/80'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                {card.value}
              </span>
            </div>

            <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
