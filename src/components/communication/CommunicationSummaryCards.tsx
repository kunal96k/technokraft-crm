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
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20',
    },
    {
      id: 'scheduled' as EmailCategoryTab,
      label: 'Scheduled',
      value: stats.scheduled,
      subtext: 'Next batch at 04:30 PM',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    },
    {
      id: 'all' as EmailCategoryTab,
      label: 'Replies',
      value: stats.replies,
      subtext: '26.7% response rate',
      icon: CornerDownLeft,
      color: 'text-[#5B4DB7]',
      bgColor: 'bg-purple-50',
      activeBorder: 'border-[#5B4DB7] ring-2 ring-[#5B4DB7]/20',
    },
    {
      id: 'failed' as EmailCategoryTab,
      label: 'Failed',
      value: stats.failed,
      subtext: 'Requires email review',
      icon: AlertCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20',
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
            className={`text-left bg-white border rounded-xl p-3.5 sm:p-4 transition-all shadow-2xs hover:shadow-xs hover:border-slate-300 focus:outline-none ${
              isActive
                ? card.activeBorder
                : 'border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {card.subtext}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
