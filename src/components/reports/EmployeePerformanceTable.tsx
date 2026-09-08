import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';
import { formatLakhsINR } from '../../data/mockReports';

interface EmployeePerformanceTableProps {
  employees: EmployeePerformanceRecord[];
  onSelectEmployee: (emp: EmployeePerformanceRecord) => void;
}

type SortField =
  | 'name'
  | 'leadsAssigned'
  | 'calls'
  | 'emails'
  | 'followUps'
  | 'meetings'
  | 'qualified'
  | 'proposals'
  | 'won'
  | 'targetRevenue'
  | 'targetAchievementRate'
  | 'conversionRate';

export const EmployeePerformanceTable: React.FC<EmployeePerformanceTableProps> = ({
  employees,
  onSelectEmployee,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('targetAchievementRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#5B4DB7] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#5B4DB7] ml-1 inline" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Header & Search */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Employee Productivity & Target Matrix
          </h2>
          <p className="text-xs text-slate-500">
            Cross-funnel conversion and quota achievement metrics across individual contributors
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('name')}
              >
                Employee {renderSortIndicator('name')}
              </th>
              <th className="py-3 px-3">Role</th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('leadsAssigned')}
              >
                Leads {renderSortIndicator('leadsAssigned')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('calls')}
              >
                Calls {renderSortIndicator('calls')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('emails')}
              >
                Emails {renderSortIndicator('emails')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('followUps')}
              >
                Follow-ups {renderSortIndicator('followUps')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('meetings')}
              >
                Meetings {renderSortIndicator('meetings')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('qualified')}
              >
                Qualified {renderSortIndicator('qualified')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('proposals')}
              >
                Proposals {renderSortIndicator('proposals')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 font-bold text-slate-900"
                onClick={() => handleSort('won')}
              >
                Won {renderSortIndicator('won')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('targetRevenue')}
              >
                Target {renderSortIndicator('targetRevenue')}
              </th>
              <th
                className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('targetAchievementRate')}
              >
                Achievement {renderSortIndicator('targetAchievementRate')}
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('conversionRate')}
              >
                Conv. % {renderSortIndicator('conversionRate')}
              </th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sorted.length > 0 ? (
              sorted.map((emp) => {
                const achievement = emp.targetAchievementRate;
                const statusColor =
                  achievement >= 90
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : achievement >= 75
                    ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200';

                return (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="hover:bg-purple-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {emp.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 hover:text-[#5B4DB7]">
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {emp.team}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-normal">{emp.role}</td>
                    <td className="py-3 px-3 text-right font-mono">{emp.leadsAssigned}</td>
                    <td className="py-3 px-3 text-right font-mono">{emp.calls}</td>
                    <td className="py-3 px-3 text-right font-mono">{emp.emails}</td>
                    <td className="py-3 px-3 text-right font-mono">{emp.followUps}</td>
                    <td className="py-3 px-3 text-right font-mono">{emp.meetings}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-purple-700">
                      {emp.qualified}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{emp.proposals}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      {emp.won}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatLakhsINR(emp.targetRevenue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-bold font-mono">
                        <span className={statusColor.split(' ')[0]}>{achievement}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                      {emp.conversionRate}%
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectEmployee(emp)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B4DB7] hover:text-[#4E41A2] bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={14} className="py-8 text-center text-slate-400 text-xs">
                  No employee records matched your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
