import React from 'react';
import { Filter, RotateCcw, User, Users, Shield, Briefcase, Globe, Layers } from 'lucide-react';
import { RoleScope } from '../../types/reports';

interface ReportFiltersProps {
  selectedEmployee: string;
  onEmployeeChange: (emp: string) => void;
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  selectedScope: RoleScope;
  onScopeChange: (scope: RoleScope) => void;
  // Optional Analytics filters
  selectedSource?: string;
  onSourceChange?: (src: string) => void;
  selectedService?: string;
  onServiceChange?: (svc: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  onReset?: () => void;
  isAnalytics?: boolean;
}

const EMPLOYEES = [
  'All Employees',
  'Kunal Patil',
  'Shruti Raundal',
  'Pranav Jejurkar',
  'Ankush Pandit',
  'Rohan Patil',
];

const TEAMS = [
  'All Teams',
  'Enterprise Sales',
  'Inside Sales',
  'Solutions & BA',
];

const SCOPES: RoleScope[] = [
  'Company Overview',
  'My Team',
  'All Employees',
  'My Performance',
];

const SOURCES = [
  'All Sources',
  'LinkedIn',
  'Cold Calling',
  'Website',
  'Referral',
  'IndiaMART',
  'Email Campaign',
  'Existing Customer',
];

const SERVICES = [
  'All Services',
  'Custom Software Development',
  'Web Development',
  'Mobile App Development',
  'Cloud / DevOps',
  'AI / ML',
  'Cybersecurity',
  'UI/UX Design',
  'IT Consulting',
];

const LEAD_STATUSES = [
  'All Statuses',
  'New Leads',
  'Contacted',
  'Interested',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedEmployee,
  onEmployeeChange,
  selectedTeam,
  onTeamChange,
  selectedScope,
  onScopeChange,
  selectedSource,
  onSourceChange,
  selectedService,
  onServiceChange,
  selectedStatus,
  onStatusChange,
  onReset,
  isAnalytics = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Filter className="w-3.5 h-3.5 text-[#5B4DB7]" />
          <span>Report Scope & Filters</span>
        </div>

        {/* Manager vs Employee Scope Pill Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs overflow-x-auto">
          {SCOPES.map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => onScopeChange(sc)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedScope === sc
                  ? 'bg-white text-[#5B4DB7] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Select Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 text-xs">
        {/* Employee */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => onEmployeeChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
          >
            {EMPLOYEES.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
          </select>
        </div>

        {/* Team */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Team / Unit
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
          >
            {TEAMS.map((tm) => (
              <option key={tm} value={tm}>
                {tm}
              </option>
            ))}
          </select>
        </div>

        {/* If Analytics: Lead Source */}
        {isAnalytics && onSourceChange && (
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Lead Source
            </label>
            <select
              value={selectedSource || 'All Sources'}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
            >
              {SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* If Analytics: Service */}
        {isAnalytics && onServiceChange && (
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Service Domain
            </label>
            <select
              value={selectedService || 'All Services'}
              onChange={(e) => onServiceChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
            >
              {SERVICES.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* If Analytics: Status */}
        {isAnalytics && onStatusChange && (
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Pipeline Stage
            </label>
            <select
              value={selectedStatus || 'All Statuses'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
            >
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Filters */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg w-full transition-colors cursor-pointer text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
