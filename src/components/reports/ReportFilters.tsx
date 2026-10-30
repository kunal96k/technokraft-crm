import React, { useMemo } from 'react';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { RoleScope } from '../../types/reports';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { useActiveEmployees } from '../../hooks/useActiveEmployees';

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
  const { employees } = useActiveEmployees();
  const availableTeams = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((emp) => {
      if (emp.department && emp.department.trim()) {
        depts.add(emp.department.trim());
      }
    });
    return ['All Teams', ...Array.from(depts).sort()];
  }, [employees]);

  const isFiltered =
    selectedEmployee !== 'All Employees' ||
    selectedTeam !== 'All Teams' ||
    selectedScope !== 'Company Overview' ||
    (isAnalytics &&
      ((selectedSource && selectedSource !== 'All Sources') ||
        (selectedService && selectedService !== 'All Services') ||
        (selectedStatus && selectedStatus !== 'All Statuses')));

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onEmployeeChange('All Employees');
      onTeamChange('All Teams');
      onScopeChange('Company Overview');
      if (onSourceChange) onSourceChange('All Sources');
      if (onServiceChange) onServiceChange('All Services');
      if (onStatusChange) onStatusChange('All Statuses');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs space-y-3.5">
      {/* Header with Title and Scope Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span>Report Scope & Filters</span>
        </div>

        {/* Scope Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs">
          {SCOPES.map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => onScopeChange(sc)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedScope === sc
                  ? 'bg-white dark:bg-slate-900 text-[#5B4DB7] dark:text-purple-300 shadow-xs ring-1 ring-slate-200/60 dark:ring-slate-700/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls */}
      {isAnalytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs items-end">
          {/* Employee */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
              Employee
            </label>
            <EmployeeSelect
              value={selectedEmployee === 'All Employees' ? '' : selectedEmployee}
              onChange={(e) => {
                const val = (typeof e === 'string' ? e : e?.target?.value) || 'All Employees';
                onEmployeeChange(val);
              }}
              placeholder="All Employees"
              showAllOption="All Employees"
              allowEmpty={true}
              className="h-9 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-xs shadow-2xs"
            />
          </div>

          {/* Team / Unit */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
              Team / Unit
            </label>
            <div className="relative">
              <select
                value={selectedTeam}
                onChange={(e) => onTeamChange(e.target.value)}
                className="h-9 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/20 focus:border-[#5B4DB7] dark:focus:border-purple-500 shadow-2xs appearance-none transition-all cursor-pointer"
              >
                {availableTeams.map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Lead Source */}
          {onSourceChange && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
                Lead Source
              </label>
              <div className="relative">
                <select
                  value={selectedSource || 'All Sources'}
                  onChange={(e) => onSourceChange(e.target.value)}
                  className="h-9 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/20 focus:border-[#5B4DB7] dark:focus:border-purple-500 shadow-2xs appearance-none transition-all cursor-pointer"
                >
                  {SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Service Domain */}
          {onServiceChange && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
                Service Domain
              </label>
              <div className="relative">
                <select
                  value={selectedService || 'All Services'}
                  onChange={(e) => onServiceChange(e.target.value)}
                  className="h-9 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/20 focus:border-[#5B4DB7] dark:focus:border-purple-500 shadow-2xs appearance-none transition-all cursor-pointer"
                >
                  {SERVICES.map((svc) => (
                    <option key={svc} value={svc}>
                      {svc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Pipeline Stage */}
          {onStatusChange && (
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
                Pipeline Stage
              </label>
              <div className="relative">
                <select
                  value={selectedStatus || 'All Statuses'}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="h-9 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/20 focus:border-[#5B4DB7] dark:focus:border-purple-500 shadow-2xs appearance-none transition-all cursor-pointer"
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Reset Filters Action */}
          <div>
            <button
              type="button"
              onClick={handleReset}
              className={`h-9 w-full inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all duration-150 cursor-pointer text-xs border shadow-2xs ${
                isFiltered
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/60'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 text-xs min-w-0">
          {/* Employee Search - Generous width */}
          <div className="w-full sm:flex-1 min-w-0 sm:min-w-[240px] max-w-sm">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
              Employee
            </label>
            <EmployeeSelect
              value={selectedEmployee === 'All Employees' ? '' : selectedEmployee}
              onChange={(e) => {
                const val = (typeof e === 'string' ? e : e?.target?.value) || 'All Employees';
                onEmployeeChange(val);
              }}
              placeholder="All Employees"
              showAllOption="All Employees"
              allowEmpty={true}
              className="h-9 w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-xs shadow-2xs"
            />
          </div>

          {/* Team / Unit */}
          <div className="w-full sm:flex-1 min-w-0 sm:min-w-[200px] max-w-xs">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider">
              Team / Unit
            </label>
            <div className="relative">
              <select
                value={selectedTeam}
                onChange={(e) => onTeamChange(e.target.value)}
                className="h-9 w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg pl-3 pr-8 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/20 focus:border-[#5B4DB7] dark:focus:border-purple-500 shadow-2xs appearance-none transition-all cursor-pointer"
              >
                {availableTeams.map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className={`h-9 w-full sm:w-auto px-4 inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all duration-150 cursor-pointer text-xs border shadow-2xs hover:shadow-xs ${
                isFiltered
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/60'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
