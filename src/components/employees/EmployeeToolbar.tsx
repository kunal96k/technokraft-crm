import React from 'react';
import { Search, Filter, Plus, Download, X } from 'lucide-react';

interface EmployeeToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  onAddEmployee: () => void;
  onExport: () => void;
}

export const EmployeeToolbar: React.FC<EmployeeToolbarProps> = ({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  activeFilterCount,
  onAddEmployee,
  onExport,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search employee name, email, employee ID..."
          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-8 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Toggle Filters Button */}
        <button
          type="button"
          onClick={onToggleFilters}
          className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
            showFilters || activeFilterCount > 0
              ? 'border-purple-300 dark:border-purple-600/60 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Add Employee Button (Primary) */}
        <button
          type="button"
          onClick={onAddEmployee}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>
    </div>
  );
};
