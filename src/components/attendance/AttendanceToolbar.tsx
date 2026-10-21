import React from 'react';
import { Search, Filter, Calendar, Download, X, ArrowRight, CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import { AttendanceFiltersState, Employee, DEPARTMENTS } from '../../types/employees';
import { useAuth } from '../../context/AuthContext';
import { shouldMaskForSecurity } from '../../utils/securityUtils';

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
  const { user } = useAuth();
  const datePresets: ('Today' | 'This Week' | 'This Month' | 'Custom Range')[] = [
    'Today',
    'This Week',
    'This Month',
    'Custom Range',
  ];

  const getToday = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getDaysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const getStartOfMonth = (): string => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return d.toISOString().split('T')[0];
  };

  const handlePresetClick = (preset: 'Today' | 'This Week' | 'This Month' | 'Custom Range') => {
    if (preset === 'Custom Range') {
      const today = getToday();
      const defaultStart = filters.startDate || getDaysAgo(6);
      const defaultEnd = filters.endDate || today;
      onChange({
        ...filters,
        datePreset: 'Custom Range',
        startDate: defaultStart,
        endDate: defaultEnd,
      });
    } else {
      onChange({
        ...filters,
        datePreset: preset,
        startDate: '',
        endDate: '',
      });
    }
  };

  const handleDateChange = (newStart: string, newEnd: string) => {
    let start = newStart;
    let end = newEnd;
    if (start && end && start > end) {
      end = start;
    }
    onChange({
      ...filters,
      datePreset: 'Custom Range',
      startDate: start,
      endDate: end,
    });
  };

  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getRangeDayCount = (start?: string, end?: string): number => {
    if (!start || !end) return 0;
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 0;
    }
  };

  const isCustomRange = filters.datePreset === 'Custom Range';
  const rangeDayCount = getRangeDayCount(filters.startDate, filters.endDate);

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
                onClick={() => handlePresetClick(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-purple-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {preset === 'Custom Range' && <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                <span>{preset}</span>
                {preset === 'Custom Range' && isSelected && filters.startDate && filters.endDate && (
                  <span className="hidden sm:inline-block text-[10px] font-mono font-normal opacity-80">
                    ({rangeDayCount}d)
                  </span>
                )}
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

      {/* Custom Range Calendar UI Selector Box */}
      {isCustomRange && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-50/90 via-indigo-50/40 to-slate-50 dark:from-purple-950/30 dark:via-slate-900/60 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/60 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 dark:border-purple-900/40 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600/10 dark:bg-purple-400/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Custom Date Range Filter</span>
                  {filters.startDate && filters.endDate && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {rangeDayCount} {rangeDayCount === 1 ? 'day' : 'days'} selected
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {filters.startDate && filters.endDate ? (
                    <span>
                      Filtering records from{' '}
                      <strong className="text-purple-700 dark:text-purple-300 font-semibold">{formatDateLabel(filters.startDate)}</strong> to{' '}
                      <strong className="text-purple-700 dark:text-purple-300 font-semibold">{formatDateLabel(filters.endDate)}</strong>
                    </span>
                  ) : (
                    <span>Choose start and end dates to filter attendance across that period</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Presets inside Custom Range */}
            <div className="flex items-center gap-1 flex-wrap self-end sm:self-auto">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 hidden lg:inline">
                Quick:
              </span>
              <button
                type="button"
                onClick={() => handleDateChange(getDaysAgo(6), getToday())}
                className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer shadow-2xs"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(getDaysAgo(13), getToday())}
                className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer shadow-2xs"
              >
                Last 14 Days
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(getDaysAgo(29), getToday())}
                className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer shadow-2xs"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(getStartOfMonth(), getToday())}
                className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer shadow-2xs"
              >
                This Month
              </button>
            </div>
          </div>

          {/* Calendar Date Selectors Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* From Date Picker */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs focus-within:ring-2 focus-within:ring-purple-500/40 transition-all">
              <div className="flex items-center gap-1.5 pl-1 shrink-0">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  From:
                </span>
              </div>
              <input
                type="date"
                value={filters.startDate || ''}
                max={filters.endDate || undefined}
                onChange={(e) => handleDateChange(e.target.value, filters.endDate || '')}
                className="w-full text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              />
            </div>

            <div className="hidden sm:flex items-center justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            {/* To Date Picker */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs focus-within:ring-2 focus-within:ring-purple-500/40 transition-all">
              <div className="flex items-center gap-1.5 pl-1 shrink-0">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  To:
                </span>
              </div>
              <input
                type="date"
                value={filters.endDate || ''}
                min={filters.startDate || undefined}
                onChange={(e) => handleDateChange(filters.startDate || '', e.target.value)}
                className="w-full text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              />
            </div>

            {/* Reset to 7 Days Button */}
            {(filters.startDate || filters.endDate) && (
              <button
                type="button"
                onClick={() => handleDateChange(getDaysAgo(6), getToday())}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                title="Reset to default 7 days"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

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
            {employees.map((emp) => {
              const isMasked = shouldMaskForSecurity(emp, user);
              return (
                <option key={emp.id} value={emp.id}>
                  {isMasked ? `System Administrator (${emp.employeeCode})` : `${emp.name} (${emp.employeeCode})`}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};
