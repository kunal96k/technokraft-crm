import React, { useState } from 'react';
import { Search, Filter, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { PipelineFilterState, OpportunityService, OpportunityStage } from '../../types/opportunities';
import { EmployeeSelect } from '../common/EmployeeSelect';

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
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

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
      {/* Top row: Search input + Dedicated Filter Toggle Button */}
      <div className="flex items-center gap-2.5">
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

        {/* Dedicated Filter Toggle Button near search */}
        <button
          type="button"
          onClick={() => setIsFilterExpanded((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none shrink-0 ${
            isFilterExpanded || activeFilterCount > 0
              ? 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border-purple-200 dark:border-purple-800 shadow-2xs'
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
          {isFilterExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expandable Filter Grid Panel (shown when isFilterExpanded is true) */}
      {isFilterExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Stage Filter */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Sales Stage
              </label>
              <select
                value={filters.stage}
                onChange={(e) => onChange('stage', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
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
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Assigned Owner
              </label>
              <EmployeeSelect
                value={filters.assignedTo}
                onChange={(e) => onChange('assignedTo', e.target.value)}
                placeholder="All Owners"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
              />
            </div>

            {/* Service */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Service Line
              </label>
              <select
                value={filters.service}
                onChange={(e) => onChange('service', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
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
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Win Probability
              </label>
              <select
                value={filters.probability}
                onChange={(e) => onChange('probability', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
              >
                <option value="">Any Probability</option>
                <option value="high">High (&ge; 70%)</option>
                <option value="medium">Medium (40% - 69%)</option>
                <option value="low">Low (&lt; 40%)</option>
              </select>
            </div>

            {/* Deal Value */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Deal Value Range
              </label>
              <select
                value={filters.opportunityValue}
                onChange={(e) => onChange('opportunityValue', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
              >
                <option value="">Any Value</option>
                <option value="under5L">&lt; ₹5 Lakhs</option>
                <option value="5Lto15L">₹5L - ₹15 Lakhs</option>
                <option value="above15L">&gt; ₹15 Lakhs</option>
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                Industry
              </label>
              <select
                value={filters.industry}
                onChange={(e) => onChange('industry', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
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
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Active:
          </span>

          {filters.stage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800">
              Stage: {filters.stage}
              <button
                type="button"
                onClick={() => onChange('stage', '')}
                className="hover:text-purple-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.assignedTo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800">
              Owner: {filters.assignedTo}
              <button
                type="button"
                onClick={() => onChange('assignedTo', '')}
                className="hover:text-purple-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.service && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800">
              Service: {filters.service}
              <button
                type="button"
                onClick={() => onChange('service', '')}
                className="hover:text-purple-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.probability && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800">
              Prob: {filters.probability}
              <button
                type="button"
                onClick={() => onChange('probability', '')}
                className="hover:text-purple-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.opportunityValue && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800">
              Value: {filters.opportunityValue}
              <button
                type="button"
                onClick={() => onChange('opportunityValue', '')}
                className="hover:text-purple-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.industry && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800">
              Industry: {filters.industry}
              <button
                type="button"
                onClick={() => onChange('industry', '')}
                className="hover:text-purple-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 font-semibold ml-auto cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
