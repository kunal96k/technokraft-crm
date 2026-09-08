import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { EmailCategoryTab } from '../../types/communication';

interface EmailToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (employee: string) => void;
  onResetFilters: () => void;
  onOpenCompose: () => void;
  onOpenTemplates: () => void;
  totalCount: number;
}

export const EmailToolbar: React.FC<EmailToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  employeeFilter,
  onEmployeeFilterChange,
  onResetFilters,
  onOpenCompose,
  onOpenTemplates,
  totalCount,
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== '' || employeeFilter !== '';

  return (
    <div className="space-y-3">
      {/* Main Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search recipient, company, subject, lead ID..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Desktop Filters & Actions */}
        <div className="flex items-center gap-2">
          {/* Status filter (Desktop/Tablet) */}
          <div className="hidden md:block">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="scheduled">Scheduled</option>
              <option value="reply_received">Reply Received</option>
              <option value="draft">Draft</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Employee filter (Desktop/Tablet) */}
          <div className="hidden lg:block">
            <select
              value={employeeFilter}
              onChange={(e) => onEmployeeFilterChange(e.target.value)}
              className="text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 shadow-2xs"
            >
              <option value="">All Senders</option>
              <option value="Kunal Patil">Kunal Patil</option>
              <option value="Sneha Kulkarni">Sneha Kulkarni</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors shadow-2xs"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#5B4DB7]" />
            )}
          </button>

          {/* Templates Modal Trigger */}
          <button
            type="button"
            onClick={onOpenTemplates}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* + Compose Email Action Button */}
          <button
            type="button"
            onClick={onOpenCompose}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg shadow-xs transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Compose Email</span>
          </button>
        </div>
      </div>

      {/* Mobile Filters Drawer / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#5B4DB7]" />
                <span>Filter Emails</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700"
                >
                  <option value="">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="reply_received">Reply Received</option>
                  <option value="draft">Draft</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sender / Employee
                </label>
                <select
                  value={employeeFilter}
                  onChange={(e) => onEmployeeFilterChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700"
                >
                  <option value="">All Senders</option>
                  <option value="Kunal Patil">Kunal Patil</option>
                  <option value="Sneha Kulkarni">Sneha Kulkarni</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] rounded-lg shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
