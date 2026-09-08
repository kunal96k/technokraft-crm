import React, { useState } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { PipelineFilterState, OpportunityService, OpportunityStage } from '../../types/opportunities';

interface PipelineFiltersProps {
  filters: PipelineFilterState;
  onChange: (key: keyof PipelineFilterState, value: string) => void;
  onReset: () => void;
  uniqueOwners: string[];
  uniqueIndustries: string[];
}

export const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  filters,
  onChange,
  onReset,
  uniqueOwners,
  uniqueIndustries,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const stages: OpportunityStage[] = [
    'Qualified',
    'Requirement Received',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];

  const services: OpportunityService[] = [
    'Custom Software Development',
    'Web Development',
    'Mobile App Development',
    'Cloud / DevOps',
    'AI / ML',
    'Cybersecurity',
    'UI/UX',
    'IT Consulting',
    'Other',
  ];

  const activeFilterCount = [
    filters.stage,
    filters.assignedTo,
    filters.service,
    filters.probability,
    filters.opportunityValue,
    filters.industry,
    filters.expectedClose,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/90 dark:border-slate-700/80 p-3 sm:p-4 mb-5 shadow-2xs transition-colors duration-200">
      {/* Top row: Search input + Mobile Filter trigger / View switch */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
          <input
            type="text"
            placeholder="Search company, opportunity name, lead code, contact..."
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange('search', '')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button (< lg) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[40px] ${
              activeFilterCount > 0
                ? 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#5B4DB7] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              title="Reset Filters"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Filter Row (Visible on lg+) */}
      <div className="hidden lg:grid grid-cols-7 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Stage Filter */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 mb-1">
            Sales Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => onChange('stage', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
          >
            <option value="">All Stages</option>
            {stages.map((stg) => (
              <option key={stg} value={stg}>
                {stg}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Owner */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 mb-1">
            Assigned To
          </label>
          <select
            value={filters.assignedTo}
            onChange={(e) => onChange('assignedTo', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
          >
            <option value="">All Owners</option>
            {uniqueOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 mb-1">
            Service
          </label>
          <select
            value={filters.service}
            onChange={(e) => onChange('service', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
          >
            <option value="">All Services</option>
            {services.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>
        </div>

        {/* Probability */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 mb-1">
            Probability
          </label>
          <select
            value={filters.probability}
            onChange={(e) => onChange('probability', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
          >
            <option value="">Any Probability</option>
            <option value="high">High (&ge; 70%)</option>
            <option value="medium">Medium (40% - 69%)</option>
            <option value="low">Low (&lt; 40%)</option>
          </select>
        </div>

        {/* Value Range */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 mb-1">
            Opportunity Value
          </label>
          <select
            value={filters.opportunityValue}
            onChange={(e) => onChange('opportunityValue', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
          >
            <option value="">All Values</option>
            <option value="under5L">Under ₹5 Lakhs</option>
            <option value="5Lto15L">₹5L – ₹15 Lakhs</option>
            <option value="above15L">Above ₹15 Lakhs</option>
          </select>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 mb-1">
            Industry
          </label>
          <select
            value={filters.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
          >
            <option value="">All Industries</option>
            {uniqueIndustries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            disabled={activeFilterCount === 0 && !filters.search}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeFilterCount > 0 || filters.search
                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/40 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* MOBILE FILTER MODAL / DRAWER (< lg) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pipeline Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5B4DB7] text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sales Stage</label>
                <select
                  value={filters.stage}
                  onChange={(e) => onChange('stage', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Stages</option>
                  {stages.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Owner</label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => onChange('assignedTo', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Owners</option>
                  {uniqueOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                <select
                  value={filters.service}
                  onChange={(e) => onChange('service', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Services</option>
                  {services.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Probability</label>
                <select
                  value={filters.probability}
                  onChange={(e) => onChange('probability', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="">Any Probability</option>
                  <option value="high">High (&ge; 70%)</option>
                  <option value="medium">Medium (40% - 69%)</option>
                  <option value="low">Low (&lt; 40%)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Opportunity Value</label>
                <select
                  value={filters.opportunityValue}
                  onChange={(e) => onChange('opportunityValue', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Values</option>
                  <option value="under5L">Under ₹5 Lakhs</option>
                  <option value="5Lto15L">₹5L – ₹15 Lakhs</option>
                  <option value="above15L">Above ₹15 Lakhs</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => onChange('industry', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-100"
                >
                  <option value="">All Industries</option>
                  {uniqueIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 rounded-b-2xl flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setIsMobileDrawerOpen(false);
                }}
                className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-semibold rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-2.5 text-white bg-[#5B4DB7] hover:bg-[#4E41A2] font-semibold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
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
