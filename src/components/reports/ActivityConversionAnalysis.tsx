import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Target,
  Sparkles,
} from 'lucide-react';
import { EmployeePerformanceRecord, ActivityConversion } from '../../types/reports';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

interface ActivityConversionAnalysisProps {
  employees?: EmployeePerformanceRecord[];
  conversions?: ActivityConversion[];
  onSelectEmployee?: (emp: EmployeePerformanceRecord) => void;
}

type SortField = 'name' | 'calls' | 'emails' | 'followUps' | 'qualified' | 'won' | 'effortRatio';

export const ActivityConversionAnalysis: React.FC<ActivityConversionAnalysisProps> = ({
  employees = [],
  conversions,
  onSelectEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('won');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Compute effort ratio and filtered/sorted list
  const processedEmployees = useMemo(() => {
    return employees.map((emp) => {
      const totalOutreach = (emp.calls || 0) + (emp.emails || 0) + (emp.followUps || 0);
      const wonDeals = emp.won || 0;
      const effortRatio = wonDeals > 0 ? Math.round(totalOutreach / wonDeals) : totalOutreach;
      return {
        ...emp,
        totalOutreach,
        effortRatio,
      };
    });
  }, [employees]);

  // Filter based on search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return processedEmployees;
    const q = searchQuery.toLowerCase().trim();
    return processedEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.role && e.role.toLowerCase().includes(q)) ||
        (e.team && e.team.toLowerCase().includes(q))
    );
  }, [processedEmployees, searchQuery]);

  // Sort list
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortField === 'calls') {
        aVal = a.calls || 0;
        bVal = b.calls || 0;
      } else if (sortField === 'emails') {
        aVal = a.emails || 0;
        bVal = b.emails || 0;
      } else if (sortField === 'followUps') {
        aVal = a.followUps || 0;
        bVal = b.followUps || 0;
      } else if (sortField === 'qualified') {
        aVal = a.qualified || 0;
        bVal = b.qualified || 0;
      } else if (sortField === 'won') {
        aVal = a.won || 0;
        bVal = b.won || 0;
      } else if (sortField === 'effortRatio') {
        aVal = a.effortRatio;
        bVal = b.effortRatio;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filtered, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, activePage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 ml-1 inline opacity-70 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#5B4DB7] dark:text-purple-300 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#5B4DB7] dark:text-purple-300 ml-1 inline" />
    );
  };

  if ((!employees || employees.length === 0) && (!conversions || conversions.length === 0)) {
    return null;
  }

  const startRecord = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const endRecord = Math.min(activePage * pageSize, totalItems);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs h-full flex flex-col justify-between min-w-0">
      <div className="space-y-3.5 flex-1">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Activity → Conversion Yield Correlation
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Evaluating if outreach volume translates directly into closed wins
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-full sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search rep..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Mobile View: High-Impact Card Layout */}
        <div className="block md:hidden space-y-2.5">
          {paginatedEmployees.length > 0 ? (
            paginatedEmployees.map((emp) => {
              const wonDeals = emp.won || 0;
              const hasWon = wonDeals > 0;

              return (
                <div
                  key={emp.id}
                  onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                  className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 transition-all cursor-pointer shadow-2xs space-y-3"
                >
                  {/* Top Bar: Rep Avatar, Name & Ratio Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <EmployeeAvatar
                        name={emp.name}
                        avatar={emp.avatar}
                        profilePhoto={emp.profilePhoto}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {emp.team || 'Sales'} • {emp.role || 'Sales Executive'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border shrink-0 ${
                        hasWon
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {hasWon ? `${emp.effortRatio} outreach/win` : 'No wins yet'}
                    </span>
                  </div>

                  {/* Metrics 5-Column Grid */}
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase tracking-tight">Calls</div>
                      <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        {emp.calls || 0}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase tracking-tight">Emails</div>
                      <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        {emp.emails || 0}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase tracking-tight">Follow-ups</div>
                      <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        {emp.followUps || 0}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      <div className="text-[9px] text-[#5B4DB7] dark:text-purple-300 uppercase tracking-tight font-semibold">
                        Qualified
                      </div>
                      <div className="text-xs font-mono font-bold text-[#5B4DB7] dark:text-purple-300 mt-0.5">
                        {emp.qualified || 0}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                      <div className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase tracking-tight font-semibold">
                        Won Deals
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {emp.won || 0}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No salespeople match your search criteria.
            </div>
          )}
        </div>

        {/* Desktop View: Precision Paginated Table */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 select-none">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                >
                  Salesperson {renderSortIndicator('name')}
                </th>
                <th
                  onClick={() => handleSort('calls')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                >
                  Calls {renderSortIndicator('calls')}
                </th>
                <th
                  onClick={() => handleSort('emails')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                >
                  Emails {renderSortIndicator('emails')}
                </th>
                <th
                  onClick={() => handleSort('followUps')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                >
                  Follow-ups {renderSortIndicator('followUps')}
                </th>
                <th
                  onClick={() => handleSort('qualified')}
                  className="py-2.5 px-3 text-right text-[#5B4DB7] dark:text-purple-300 font-bold cursor-pointer hover:opacity-80 group"
                >
                  Qualified {renderSortIndicator('qualified')}
                </th>
                <th
                  onClick={() => handleSort('won')}
                  className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold cursor-pointer hover:opacity-80 group"
                >
                  Won Deals {renderSortIndicator('won')}
                </th>
                <th
                  onClick={() => handleSort('effortRatio')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 group"
                >
                  Effort / Win Ratio {renderSortIndicator('effortRatio')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((emp) => {
                  const hasWon = (emp.won || 0) > 0;

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <EmployeeAvatar
                            name={emp.name}
                            avatar={emp.avatar}
                            profilePhoto={emp.profilePhoto}
                            size="xs"
                          />
                          <span className="truncate max-w-[130px] lg:max-w-[160px]">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {emp.calls || 0}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {emp.emails || 0}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {emp.followUps || 0}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                        {emp.qualified || 0}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {emp.won || 0}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[11px]">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            hasWon
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {hasWon ? `${emp.effortRatio} touchpoints / win` : 'No wins recorded'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    No salespeople match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{startRecord}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{endRecord}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong> reps
          </span>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1 ml-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            disabled={activePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`min-w-[24px] h-6 px-1.5 text-xs font-medium rounded border transition-colors ${
                page === activePage
                  ? 'bg-[#5B4DB7] text-white border-[#5B4DB7]'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={activePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
