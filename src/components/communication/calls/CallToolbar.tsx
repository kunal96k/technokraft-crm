import React from 'react';
import { CallFiltersState } from '../../../types/calls';
import { EmployeeSelect } from '../../common/EmployeeSelect';
import {
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  UserCheck,
  CalendarPlus,
  Download,
  CheckSquare,
} from 'lucide-react';

interface CallToolbarProps {
  filters: CallFiltersState;
  onFilterChange: <K extends keyof CallFiltersState>(key: K, value: CallFiltersState[K]) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  onOpenMobileFilters: () => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
  onBulkAssign: () => void;
  onBulkAddFollowUp: () => void;
  onBulkExport: () => void;
}

export const CallToolbar: React.FC<CallToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
  onOpenMobileFilters,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  isAllSelected,
  onBulkAssign,
  onBulkAddFollowUp,
  onBulkExport,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Main search and desktop filter controls */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5">
        {/* Search Bar: Full width on sm/md, flex-1 on xl */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search company, contact, phone, lead..."
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] focus:border-transparent transition-all shadow-2xs"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls: In one line on xl screens, neatly wrapped on next line on small & md screens without awkward vertical stacking */}
        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap shrink-0">
          {/* Date Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) =>
              onFilterChange('dateRange', e.target.value as CallFiltersState['dateRange'])
            }
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer shrink-0"
          >
            <option value="all">Date: All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
          </select>

          {/* Employee */}
          <EmployeeSelect
            value={filters.employee === 'all' ? '' : filters.employee}
            onChange={(e) => onFilterChange('employee', e.target.value || 'all')}
            placeholder="Employee: All"
            showRoleInLabel={false}
            containerClassName="relative w-36 sm:w-40 xl:w-44 shrink-0"
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
          />

          {/* Call Type */}
          <select
            value={filters.callType}
            onChange={(e) => onFilterChange('callType', e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer shrink-0"
          >
            <option value="all">Type: All</option>
            <option value="outbound">Outbound</option>
            <option value="inbound">Inbound</option>
            <option value="missed">Missed</option>
          </select>

          {/* Result */}
          <select
            value={filters.result}
            onChange={(e) => onFilterChange('result', e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer shrink-0"
          >
            <option value="all">Result: All</option>
            <option value="Interested">Interested</option>
            <option value="Requirement Received">Requirement Received</option>
            <option value="Proposal Requested">Proposal Requested</option>
            <option value="Meeting Requested">Meeting Requested</option>
            <option value="Callback Required">Callback Required</option>
            <option value="Not Interested">Not Interested</option>
            <option value="No Response">No Response</option>
            <option value="Busy">Busy</option>
          </select>

          {/* Reset Filters button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Optional drawer trigger for extra details on mobile screens */}
          {onOpenMobileFilters && (
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="sm:hidden p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
              title="More filter options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5B4DB7]" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar (Visible when rows are selected) */}
      {selectedCount > 0 && (
        <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/90 dark:border-purple-800/80 rounded-xl flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 dark:text-purple-200">
            <CheckSquare className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
            <span>
              {selectedCount} {selectedCount === 1 ? 'call' : 'calls'} selected
            </span>
            <span className="text-purple-400">|</span>
            <button
              type="button"
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="text-[11px] text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer"
            >
              {isAllSelected ? 'Deselect all' : `Select all (${totalCount})`}
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={onBulkAssign}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors shadow-2xs min-h-[36px]"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Assign</span>
            </button>

            <button
              type="button"
              onClick={onBulkAddFollowUp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold transition-colors shadow-2xs min-h-[36px]"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Add Follow-up</span>
            </button>

            <button
              type="button"
              onClick={onBulkExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors shadow-2xs min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
