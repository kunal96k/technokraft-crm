import React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { LeadFilterState } from '../../types/leads';

interface LeadFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: LeadFilterState;
  onChangeFilter: (key: keyof LeadFilterState, value: string) => void;
  onResetFilters: () => void;
  onApply: () => void;
}

export const LeadFiltersModal: React.FC<LeadFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilter,
  onResetFilters,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#5B4DB7]" />
            <h3 className="text-sm font-bold text-slate-900">Filter Leads</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Lead Status</label>
            <select
              value={filters.status}
              onChange={(e) => onChangeFilter('status', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CALLBACK">Callback</option>
              <option value="INTERESTED">Interested</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="REQUIREMENT_PENDING">Requirement Pending</option>
              <option value="REQUIREMENT_RECEIVED">Requirement Received</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
          </div>

          {/* Lead Source */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Lead Source</label>
            <select
              value={filters.source}
              onChange={(e) => onChangeFilter('source', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Cold Calling">Cold Calling</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="IndiaMART">IndiaMART</option>
              <option value="Google Search">Google Search</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Event">Event</option>
            </select>
          </div>

          {/* Service */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Interested Service</label>
            <select
              value={filters.service}
              onChange={(e) => onChangeFilter('service', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="">All TechnoKraft Services</option>
              <option value="Custom Software Development">Custom Software Development</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="Cloud / DevOps">Cloud / DevOps</option>
              <option value="AI / ML Solutions">AI / ML Solutions</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="IT Consulting">IT Consulting</option>
              <option value="Enterprise ERP / CRM">Enterprise ERP / CRM</option>
            </select>
          </div>

          {/* Assigned Employee */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => onChangeFilter('assignedTo', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="">All Employees</option>
              <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
              <option value="Shruti Raundal">Shruti Raundal (Sales Executive)</option>
              <option value="Ankush Pandit">Ankush Pandit (Sales Executive)</option>
              <option value="Pranav Jejurkar">Pranav Jejurkar (Senior BA)</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => onChangeFilter('priority', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Created Date</label>
            <select
              value={filters.dateRange}
              onChange={(e) => onChangeFilter('dateRange', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
