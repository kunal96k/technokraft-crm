import React from 'react';
import { Send, Clock, CornerDownLeft, AlertCircle } from 'lucide-react';
import { CommunicationStats, EmailCategoryTab } from '../../types/communication';

interface CommunicationSummaryCardsProps {
  stats: CommunicationStats;
  activeTab: EmailCategoryTab;
  onSelectTab: (tab: EmailCategoryTab) => void;
}

export const CommunicationSummaryCards: React.FC<CommunicationSummaryCardsProps> = ({
  stats,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'sent' as EmailCategoryTab,
      label: 'Sent Today',
      value: stats.sentToday,
      subtext: '+12% from yesterday',
      icon: Send,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20',
    },
    {
      id: 'scheduled' as EmailCategoryTab,
      label: 'Scheduled',
      value: stats.scheduled,
      subtext: 'Next batch at 04:30 PM',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20',
    },
    {
      id: 'all' as EmailCategoryTab,
      label: 'Replies',
      value: stats.replies,
      subtext: '26.7% response rate',
      icon: CornerDownLeft,
      color: 'text-[#5B4DB7] dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      activeBorder: 'border-[#5B4DB7] dark:border-purple-500 ring-2 ring-[#5B4DB7]/20 dark:ring-purple-500/20 bg-purple-50/20 dark:bg-purple-950/20',
    },
    {
      id: 'failed' as EmailCategoryTab,
      label: 'Failed',
      value: stats.failed,
      subtext: 'Requires email review',
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeTab === card.id;

        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectTab(card.id)}
            className={`text-left rounded-xl border p-3.5 sm:p-4 transition-all shadow-2xs hover:shadow-xs focus:outline-none ${
              isActive
                ? card.activeBorder
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {card.subtext}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
