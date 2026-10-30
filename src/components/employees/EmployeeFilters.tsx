import React, { useMemo } from 'react';
import { X, Filter, RotateCcw, Building2, Briefcase, UserCheck, ShieldCheck, Clock, ShieldAlert, Users } from 'lucide-react';
import { EmployeeFiltersState, EmployeeFilterOptions } from '../../types/employees';
import { getAllDepartments, getAllRoles } from '../../utils/customEmployeeFields';

interface EmployeeFiltersProps {
  filters: EmployeeFiltersState;
  onChange: (filters: EmployeeFiltersState) => void;
  onReset: () => void;
  onClose?: () => void;
  filterOptions?: EmployeeFilterOptions | null;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onClose,
  filterOptions,
}) => {
  // Dynamically compute options from filterOptions and custom employee fields
  const departmentOptions = useMemo(() => {
    return getAllDepartments(filterOptions?.departments || [filters.department]);
  }, [filterOptions?.departments, filters.department]);

  const roleOptions = useMemo(() => {
    return getAllRoles(filterOptions?.roles || [filters.role]);
  }, [filterOptions?.roles, filters.role]);

  const accessRoleOptions = useMemo(() => {
    const list = filterOptions?.accessRoles || [
      'Super Admin',
      'Admin',
      'Manager',
      'Sales Manager',
      'Project Manager',
      'Tech Lead / Solutions Architect',
      'Software Developer',
      'DevOps / AWS Cloud Engineer',
      'QA / Test Automation Engineer',
      'UI/UX Designer',
      'Technical Intern',
      'Business Analyst',
      'Sales Executive',
      'Employee',
    ];
    return Array.from(new Set(list));
  }, [filterOptions?.accessRoles]);

  const workStatusOptions = useMemo(() => {
    const list = filterOptions?.workStatuses || [
      'Working',
      'Break',
      'Logged Out',
      'Offline',
      'On Leave',
    ];
    return Array.from(new Set(list));
  }, [filterOptions?.workStatuses]);

  const employmentTypeOptions = useMemo(() => {
    const list = filterOptions?.employmentTypes || [
      'Full Time',
      'Part Time',
      'Contract',
      'Intern',
    ];
    return Array.from(new Set(list));
  }, [filterOptions?.employmentTypes]);

  const managerOptions = useMemo(() => {
    return filterOptions?.managers || [];
  }, [filterOptions?.managers]);

  const hasActiveFilters =
    Boolean(filters.department) ||
    Boolean(filters.role) ||
    Boolean(filters.accessRole) ||
    (Boolean(filters.status) && filters.status !== 'active_pool') ||
    Boolean(filters.workStatus) ||
    Boolean(filters.crmAccess) ||
    Boolean(filters.employmentType) ||
    Boolean(filters.manager);

  const activeCount = [
    Boolean(filters.department),
    Boolean(filters.role),
    Boolean(filters.accessRole),
    Boolean(filters.status && filters.status !== 'active_pool'),
    Boolean(filters.workStatus),
    Boolean(filters.crmAccess),
    Boolean(filters.employmentType),
    Boolean(filters.manager),
  ].filter(Boolean).length;

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm backdrop-blur-xs transition-all animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center border border-purple-200/50 dark:border-purple-800/50">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Filter Employees & Staff
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Multi-criteria dynamic database filtering
            </span>
          </div>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5B4DB7] text-white">
              {activeCount} Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close filter panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. Department Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>Department</span>
          </label>
          <select
            value={filters.department}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Designation / Role Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>Designation / Role</span>
          </label>
          <select
            value={filters.role}
            onChange={(e) => onChange({ ...filters, role: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="">All Roles & Designations</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* 3. System Access Role Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>System Access Role</span>
          </label>
          <select
            value={filters.accessRole || ''}
            onChange={(e) => onChange({ ...filters, accessRole: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="">All Access Roles</option>
            {accessRoleOptions.map((aRole) => (
              <option key={aRole} value={aRole}>
                {aRole}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Staff Account Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>Account Status</span>
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="active_pool">Active Operational (Default - Active & Leave)</option>
            <option value="all">All Records (Include Deactivated/Suspended)</option>
            <option value="Active">Active Only</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive / Deactivated</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* 5. Work / Shift Status Filter (NEW MISSING FILTER) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>Work / Shift Status</span>
          </label>
          <select
            value={filters.workStatus || ''}
            onChange={(e) => onChange({ ...filters, workStatus: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="">All Work Statuses</option>
            {workStatusOptions.map((ws) => (
              <option key={ws} value={ws}>
                {ws}
              </option>
            ))}
          </select>
        </div>

        {/* 6. Employment Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>Employment Type</span>
          </label>
          <select
            value={filters.employmentType}
            onChange={(e) => onChange({ ...filters, employmentType: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="">All Employment Types</option>
            {employmentTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 7. Reporting Manager (DYNAMIC FROM BACKEND) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>Reporting Manager</span>
          </label>
          <select
            value={filters.manager}
            onChange={(e) => onChange({ ...filters, manager: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="">All Managers</option>
            {managerOptions.map((mgr, idx) => (
              <option key={mgr.id || mgr.name || idx} value={mgr.name}>
                {mgr.name} {mgr.role ? `(${mgr.role})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 8. CRM Access Filter (NEW MISSING FILTER) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#5B4DB7] dark:text-purple-400" />
            <span>CRM Login Access</span>
          </label>
          <select
            value={filters.crmAccess || ''}
            onChange={(e) => onChange({ ...filters, crmAccess: e.target.value })}
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer transition-colors"
          >
            <option value="">All CRM Permissions</option>
            <option value="enabled">CRM Access Enabled</option>
            <option value="disabled">CRM Access Disabled</option>
          </select>
        </div>
      </div>
    </div>
  );
};
