import React from 'react';
import { CallSummaryStats, CallFilterTab } from '../../../types/calls';
import { PhoneCall, CalendarClock, CheckCircle2, PhoneMissed, ClockAlert } from 'lucide-react';

interface CallSummaryCardsProps {
  stats: CallSummaryStats;
  activeTab: CallFilterTab;
  onSelectTab: (tab: CallFilterTab) => void;
}

export const CallSummaryCards: React.FC<CallSummaryCardsProps> = ({
  stats,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'today' as CallFilterTab,
      label: 'Calls Today',
      value: stats.callsToday,
      icon: PhoneCall,
      accent: 'text-indigo-600 dark:text-indigo-400',
      bgHover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
      bgActive: activeTab === 'today' ? 'ring-2 ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
      badge: 'Active Day',
    },
    {
      id: 'scheduled' as CallFilterTab,
      label: 'Scheduled',
      value: stats.scheduled,
      icon: CalendarClock,
      accent: 'text-blue-600 dark:text-blue-400',
      bgHover: 'hover:border-blue-400 dark:hover:border-blue-500',
      bgActive: activeTab === 'scheduled' ? 'ring-2 ring-blue-500 bg-blue-50/40 dark:bg-blue-950/30 border-blue-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
      badge: 'Pipeline',
    },
    {
      id: 'completed' as CallFilterTab,
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      accent: 'text-emerald-600 dark:text-emerald-400',
      bgHover: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      bgActive: activeTab === 'completed' ? 'ring-2 ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
      badge: 'Delivered',
    },
    {
      id: 'missed' as CallFilterTab,
      label: 'Missed',
      value: stats.missed,
      icon: PhoneMissed,
      accent: 'text-rose-600 dark:text-rose-400',
      bgHover: 'hover:border-rose-400 dark:hover:border-rose-500',
      bgActive: activeTab === 'missed' ? 'ring-2 ring-rose-500 bg-rose-50/40 dark:bg-rose-950/30 border-rose-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
      badge: 'Attention',
    },
    {
      id: 'all' as CallFilterTab,
      label: 'Follow-up Required',
      value: stats.followUpRequired,
      icon: ClockAlert,
      accent: 'text-amber-600 dark:text-amber-400',
      bgHover: 'hover:border-amber-400 dark:hover:border-amber-500',
      bgActive: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
      badge: 'Actions',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectTab(card.id)}
            className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${card.bgActive} ${card.bgHover} hover:shadow-xs group`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 border border-slate-100/80 dark:border-slate-700/80 ${card.accent}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-700">
                {card.badge}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
