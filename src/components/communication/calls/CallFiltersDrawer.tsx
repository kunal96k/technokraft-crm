import React from 'react';
import { CallFiltersState } from '../../../types/calls';
import { X, RotateCcw, Check } from 'lucide-react';

interface CallFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CallFiltersState;
  onFilterChange: <K extends keyof CallFiltersState>(key: K, value: CallFiltersState[K]) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

export const CallFiltersDrawer: React.FC<CallFiltersDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Filter Calls</h3>
            <p className="text-xs text-slate-500">Refine call logs by parameters</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Fields */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Date Filter */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onFilterChange('dateRange', e.target.value as CallFiltersState['dateRange'])
              }
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#5B4DB7] min-h-[44px]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today (07 Sep 2026)</option>
              <option value="yesterday">Yesterday (06 Sep 2026)</option>
              <option value="last7days">Last 7 Days</option>
              <option value="thisMonth">This Month (September 2026)</option>
            </select>
          </div>

          {/* Employee */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Employee (Caller)</label>
            <select
              value={filters.employee}
              onChange={(e) => onFilterChange('employee', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#5B4DB7] min-h-[44px]"
            >
              <option value="all">All Employees</option>
              <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
              <option value="Shruti Raundal">Shruti Raundal (Senior Sales Executive)</option>
              <option value="Pranav Jejurkar">Pranav Jejurkar (Business Analyst)</option>
              <option value="Ankush Pandit">Ankush Pandit (Sales Executive)</option>
              <option value="Rohan Patil">Rohan Patil (Enterprise BDM)</option>
            </select>
          </div>

          {/* Call Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Call Direction / Type</label>
            <select
              value={filters.callType}
              onChange={(e) => onFilterChange('callType', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#5B4DB7] min-h-[44px]"
            >
              <option value="all">All Types</option>
              <option value="outbound">Outbound Calls</option>
              <option value="inbound">Inbound Calls</option>
              <option value="missed">Missed Calls</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Call Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#5B4DB7] min-h-[44px]"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="missed">Missed</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Result */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Call Outcome / Result</label>
            <select
              value={filters.result}
              onChange={(e) => onFilterChange('result', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#5B4DB7] min-h-[44px]"
            >
              <option value="all">All Results</option>
              <option value="Interested">Interested</option>
              <option value="Requirement Received">Requirement Received</option>
              <option value="Proposal Requested">Proposal Requested</option>
              <option value="Meeting Requested">Meeting Requested</option>
              <option value="Callback Required">Callback Required</option>
              <option value="Not Interested">Not Interested</option>
              <option value="No Response">No Response</option>
              <option value="Busy">Busy</option>
              <option value="Wrong Number">Wrong Number</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Lead Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Lead Status</label>
            <select
              value={filters.leadStatus}
              onChange={(e) => onFilterChange('leadStatus', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#5B4DB7] min-h-[44px]"
            >
              <option value="all">All Lead Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="REQUIREMENT_RECEIVED">Requirement Received</option>
              <option value="PROPOSAL">Proposal Sent</option>
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">TechnoKraft Service</label>
            <select
              value={filters.service}
              onChange={(e) => onFilterChange('service', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-[#5B4DB7] min-h-[44px]"
            >
              <option value="all">All Services</option>
              <option value="Custom Software Development">Custom Software Development</option>
              <option value="Cloud / DevOps">Cloud / DevOps</option>
              <option value="Enterprise ERP / CRM">Enterprise ERP / CRM</option>
              <option value="AI / ML Solutions">AI / ML Solutions</option>
              <option value="UI/UX Design">UI/UX Design</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 flex items-center gap-1.5 min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white font-semibold flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px]"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
