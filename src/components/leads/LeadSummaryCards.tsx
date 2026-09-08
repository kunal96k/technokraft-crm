import React from 'react';
import { UsersRound, Sparkles, ThumbsUp, Award, Flame, TrendingUp } from 'lucide-react';

interface LeadSummaryCardsProps {
  activeFilter?: string;
  onSelectFilter?: (status: string) => void;
}

export const LeadSummaryCards: React.FC<LeadSummaryCardsProps> = ({
  activeFilter = 'ALL',
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'ALL',
      title: 'Total Leads',
      value: '1,284',
      badge: '+12% this month',
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      icon: UsersRound,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-400',
    },
    {
      id: 'NEW',
      title: 'New Leads',
      value: '420',
      badge: 'Unassigned: 18',
      badgeColor: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      icon: Sparkles,
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'INTERESTED',
      title: 'Interested',
      value: '220',
      badge: 'High Intent',
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      icon: ThumbsUp,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'QUALIFIED',
      title: 'Qualified',
      value: '145',
      badge: 'Ready for RFP',
      badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      icon: Award,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'HOT',
      title: 'Hot Leads',
      value: '72',
      badge: 'Score > 80',
      badgeColor: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      icon: Flame,
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 ${
              isSelected
                ? 'ring-2 ring-purple-500/50 border-purple-400 dark:border-purple-600 bg-purple-50/20 dark:bg-purple-950/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight truncate">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${card.badgeColor}`}
              >
                {card.id === 'ALL' && <TrendingUp className="w-2.5 h-2.5" />}
                {card.badge}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
