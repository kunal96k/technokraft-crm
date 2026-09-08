import React from 'react';
import {
  Search,
  Filter,
  X,
  List,
  CalendarDays,
  Users,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { FollowUpTab, FollowUpStats } from '../../types/followUps';

export interface FollowUpFilters {
  search: string;
  status: string;
  assignedTo: string;
  priority: string;
  type: string;
  service: string;
}

interface FollowUpToolbarProps {
  filters: FollowUpFilters;
  onFilterChange: (key: keyof FollowUpFilters, value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  activeTab: FollowUpTab;
  onSelectTab: (tab: FollowUpTab) => void;
  stats: FollowUpStats;
  viewMode: 'list' | 'calendar' | 'timeline';
  onChangeViewMode: (mode: 'list' | 'calendar' | 'timeline') => void;
  isTeamView: boolean;
  onToggleTeamView: () => void;
  employees: string[];
  types: string[];
}

export const FollowUpToolbar: React.FC<FollowUpToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  activeTab,
  onSelectTab,
  stats,
  viewMode,
  onChangeViewMode,
  isTeamView,
  onToggleTeamView,
  employees,
  types,
}) => {
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  const tabs: { id: FollowUpTab; label: string; count?: number; highlight?: boolean }[] = [
    { id: 'all', label: 'All Follow-ups' },
    { id: 'today', label: 'Today', count: stats.today },
    { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
    { id: 'overdue', label: 'Overdue', count: stats.overdue, highlight: stats.overdue > 0 },
    { id: 'completed', label: 'Completed', count: stats.completed },
  ];

  return (
    <div id="followup-toolbar" className="space-y-3">
      {/* Top Row: Tabs & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap focus:outline-none ${
                  isActive
                    ? 'bg-[#5B4DB7] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.highlight
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: View Mode Toggle & Team Mode Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          {/* Manager Team Mode Switch */}
          <button
            type="button"
            onClick={onToggleTeamView}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isTeamView
                ? 'bg-purple-100 text-[#5B4DB7] border-purple-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle between personal and team-wide visibility"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isTeamView ? 'Team View' : 'My Follow-ups'}
            </span>
          </button>

          {/* List vs Timeline vs Calendar Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => onChangeViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table / List View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('timeline')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Timeline Schedule"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('calendar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Calendar Month View"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: Search, Fast Filters, Mobile Filter Drawer Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search lead, company, contact, or purpose..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] text-slate-900 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Desktop Filter Dropdowns */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="RESCHEDULED">Rescheduled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Follow-up Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30"
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assigned To Filter */}
          <select
            value={filters.assignedTo}
            onChange={(e) => onFilterChange('assignedTo', e.target.value)}
            className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30"
          >
            <option value="">All Assignees</option>
            {employees.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Mobile / Tablet Filter Button */}
        <div className="flex lg:hidden items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              showMobileFilters || hasActiveFilters
                ? 'bg-purple-50 text-[#5B4DB7] border-purple-300'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">All Types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => onFilterChange('priority', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Assigned To
              </label>
              <select
                value={filters.assignedTo}
                onChange={(e) => onFilterChange('assignedTo', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">All Assignees</option>
                {employees.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
