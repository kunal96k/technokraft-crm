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
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: UsersRound,
      iconBg: 'bg-purple-50 text-[#5B4DB7]',
    },
    {
      id: 'NEW',
      title: 'New Leads',
      value: '420',
      badge: 'Unassigned: 18',
      badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
      icon: Sparkles,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'INTERESTED',
      title: 'Interested',
      value: '220',
      badge: 'High Intent',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: ThumbsUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'QUALIFIED',
      title: 'Qualified',
      value: '145',
      badge: 'Ready for RFP',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      icon: Award,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'HOT',
      title: 'Hot Leads',
      value: '72',
      badge: 'Score > 80',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: Flame,
      iconBg: 'bg-rose-50 text-rose-600',
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
            className={`text-left p-3.5 sm:p-4 rounded-xl border bg-white transition-all shadow-2xs hover:shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 ${
              isSelected
                ? 'ring-2 ring-[#5B4DB7] border-[#5B4DB7] bg-purple-50/20'
                : 'border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight truncate">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 font-sans tracking-tight">
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
