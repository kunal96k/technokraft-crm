import React from 'react';
import { Search, Filter, Calendar, Download, X } from 'lucide-react';
import { AttendanceFiltersState, Employee } from '../../types/employees';
import { DEPARTMENTS } from '../../data/mockEmployees';

interface AttendanceToolbarProps {
  filters: AttendanceFiltersState;
  onChange: (filters: AttendanceFiltersState) => void;
  onReset: () => void;
  employees: Employee[];
  onExport: () => void;
}

export const AttendanceToolbar: React.FC<AttendanceToolbarProps> = ({
  filters,
  onChange,
  onReset,
  employees,
  onExport,
}) => {
  const datePresets: ('Today' | 'This Week' | 'This Month' | 'Custom Range')[] = [
    'Today',
    'This Week',
    'This Month',
    'Custom Range',
  ];

  return (
    <div className="space-y-3">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Date Presets Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto shrink-0">
          {datePresets.map((preset) => {
            const isSelected = filters.datePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...filters, datePreset: preset })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search employee by name, ID or role..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-8 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Log</span>
          </button>
        </div>
      </div>

      {/* Filter Selects Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs">
        {/* Filter by Department */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Attendance Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late Logins</option>
            <option value="Half Day">Half Day</option>
            <option value="Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {/* Filter by Employee */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
            Specific Employee
          </label>
          <select
            value={filters.employeeId}
            onChange={(e) => onChange({ ...filters, employeeId: e.target.value })}
            className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none"
          >
            <option value="">All Employees ({employees.length})</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeCode})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
