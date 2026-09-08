import React from 'react';
import { CallFilterTab } from '../../../types/calls';
import { ListFilter, Clock, CheckCircle2, PhoneMissed, Calendar, Users, LayoutList } from 'lucide-react';

interface CallTabsProps {
  activeTab: CallFilterTab;
  onTabChange: (tab: CallFilterTab) => void;
  counts: {
    all: number;
    today: number;
    scheduled: number;
    completed: number;
    missed: number;
  };
  viewMode: 'list' | 'timeline' | 'team';
  onViewModeChange: (mode: 'list' | 'timeline' | 'team') => void;
}

export const CallTabs: React.FC<CallTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  viewMode,
  onViewModeChange,
}) => {
  const tabs: { id: CallFilterTab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all', label: 'All Calls', icon: ListFilter, count: counts.all },
    { id: 'today', label: 'Today', icon: Calendar, count: counts.today },
    { id: 'scheduled', label: 'Scheduled', icon: Clock, count: counts.scheduled },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: counts.completed },
    { id: 'missed', label: 'Missed', icon: PhoneMissed, count: counts.missed },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
      {/* Status / Category filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#5B4DB7] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* View Mode Switcher (List vs. Today Timeline vs. Team Workload) */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 self-start sm:self-auto shrink-0">
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            viewMode === 'list'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Table / Card View"
        >
          <LayoutList className="w-3.5 h-3.5" />
          <span className="hidden md:inline">List</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('timeline')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            viewMode === 'timeline'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Chronological Timeline"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Timeline</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('team')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            viewMode === 'team'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Employee Performance"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Employees</span>
        </button>
      </div>
    </div>
  );
};
