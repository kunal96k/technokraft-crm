import React from 'react';
import { X, Filter } from 'lucide-react';
import { EmployeeFiltersState } from '../../types/employees';
import { DEPARTMENTS, EMPLOYEE_ROLES, MANAGERS } from '../../data/mockEmployees';

interface EmployeeFiltersProps {
  filters: EmployeeFiltersState;
  onChange: (filters: EmployeeFiltersState) => void;
  onReset: () => void;
  onClose?: () => void;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onClose,
}) => {
  const hasActiveFilters =
    filters.department !== '' ||
    filters.role !== '' ||
    filters.status !== '' ||
    filters.employmentType !== '' ||
    filters.manager !== '';

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 transition-all">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Filter Employees
          </span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              Active Filters
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 transition-colors"
            >
              Reset All
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Department Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => onChange({ ...filters, role: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="">All Roles</option>
            {EMPLOYEE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Employment Type
          </label>
          <select
            value={filters.employmentType}
            onChange={(e) => onChange({ ...filters, employmentType: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="">All Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>
        </div>

        {/* Manager Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Reporting Manager
          </label>
          <select
            value={filters.manager}
            onChange={(e) => onChange({ ...filters, manager: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="">All Managers</option>
            {MANAGERS.map((mgr) => (
              <option key={mgr} value={mgr}>
                {mgr}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
