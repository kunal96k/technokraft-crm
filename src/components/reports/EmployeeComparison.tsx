import React, { useState } from 'react';
import { GitCompare, Check } from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';
import { formatLakhsINR } from '../../data/mockReports';

interface EmployeeComparisonProps {
  employees: EmployeePerformanceRecord[];
}

export const EmployeeComparison: React.FC<EmployeeComparisonProps> = ({ employees }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([employees[0].id, employees[1].id]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const comparedList = employees.filter((e) => selectedIds.includes(e.id));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
            <GitCompare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Head-to-Head Comparison</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Benchmark up to 4 sales representatives side-by-side</p>
          </div>
        </div>

        {/* Rep Selection Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {employees.map((emp) => {
            const isSelected = selectedIds.includes(emp.id);
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => toggleSelect(emp.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#5B4DB7] text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {emp.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2.5 px-3">Metric</th>
              {comparedList.map((emp) => (
                <th key={emp.id} className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200">
                  {emp.name}
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 font-normal lowercase">{emp.role}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Leads Assigned</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                  {emp.leadsAssigned}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Outbound Calls</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                  {emp.calls}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Follow-ups Completed</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                  {emp.followUps}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Qualified Leads</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                  {emp.qualified}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Proposals Sent</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-amber-700 dark:text-amber-400 font-semibold">
                  {emp.proposals}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-bold">Won Deals</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {emp.won}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">Pipeline Value</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white">
                  {formatLakhsINR(emp.pipelineValue)}
                </td>
              ))}
            </tr>
            <tr className="bg-purple-50/30 dark:bg-purple-950/20 font-bold">
              <td className="py-2.5 px-3 text-[#5B4DB7] dark:text-purple-300">Quota Achievement</td>
              {comparedList.map((emp) => (
                <td key={emp.id} className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                  {emp.targetAchievementRate}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
