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
      accent: 'text-indigo-600',
      bgHover: 'hover:border-indigo-300',
      bgActive: activeTab === 'today' ? 'ring-2 ring-indigo-500 bg-indigo-50/40' : 'bg-white',
      badge: 'Active Day',
    },
    {
      id: 'scheduled' as CallFilterTab,
      label: 'Scheduled',
      value: stats.scheduled,
      icon: CalendarClock,
      accent: 'text-blue-600',
      bgHover: 'hover:border-blue-300',
      bgActive: activeTab === 'scheduled' ? 'ring-2 ring-blue-500 bg-blue-50/40' : 'bg-white',
      badge: 'Pipeline',
    },
    {
      id: 'completed' as CallFilterTab,
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      accent: 'text-emerald-600',
      bgHover: 'hover:border-emerald-300',
      bgActive: activeTab === 'completed' ? 'ring-2 ring-emerald-500 bg-emerald-50/40' : 'bg-white',
      badge: 'Delivered',
    },
    {
      id: 'missed' as CallFilterTab,
      label: 'Missed',
      value: stats.missed,
      icon: PhoneMissed,
      accent: 'text-rose-600',
      bgHover: 'hover:border-rose-300',
      bgActive: activeTab === 'missed' ? 'ring-2 ring-rose-500 bg-rose-50/40' : 'bg-white',
      badge: 'Attention',
    },
    {
      id: 'all' as CallFilterTab,
      label: 'Follow-up Required',
      value: stats.followUpRequired,
      icon: ClockAlert,
      accent: 'text-amber-600',
      bgHover: 'hover:border-amber-300',
      bgActive: 'bg-white',
      badge: 'Actions',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeTab === card.id && card.label !== 'Follow-up Required';

        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectTab(card.id)}
            className={`p-3 sm:p-3.5 rounded-xl border border-slate-200/90 text-left transition-all cursor-pointer shadow-2xs ${card.bgActive} ${card.bgHover} hover:shadow-xs group`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[11px] font-medium text-slate-500 line-clamp-1 group-hover:text-slate-700">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg bg-slate-50 group-hover:bg-white border border-slate-100/80 ${card.accent}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100/70 px-1.5 py-0.5 rounded">
                {card.badge}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
