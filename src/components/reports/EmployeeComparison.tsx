import React, { useState } from 'react';
import { GitCompare, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';
import { formatLakhsINR } from '../../utils/currencyFormatters';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

interface EmployeeComparisonProps {
  employees: EmployeePerformanceRecord[];
}

export const EmployeeComparison: React.FC<EmployeeComparisonProps> = ({ employees }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    employees && employees.length > 0 ? employees.slice(0, 2).map((e) => e.id) : []
  );

  if (!employees || employees.length === 0) {
    return null;
  }

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
      {/* Header & Rep Selection Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Direct Head-to-Head Comparison
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Benchmark up to 4 sales representatives side-by-side
            </p>
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

      {/* Mobile View: Responsive Card Layout (block sm:hidden) */}
      <div className="block sm:hidden space-y-3">
        {comparedList.map((emp) => (
          <div
            key={emp.id}
            className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <EmployeeAvatar
                  name={emp.name}
                  avatar={emp.avatar}
                  profilePhoto={emp.profilePhoto}
                  size="sm"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{emp.name}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{emp.role}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                {emp.targetAchievementRate}% Quota
              </span>
            </div>

            {/* 3x2 Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Leads</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {emp.leadsAssigned}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Calls</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {emp.calls}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Follow-ups</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {emp.followUps}
                </span>
              </div>
              <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] text-[#5B4DB7] dark:text-purple-300 block font-semibold">
                  Qualified
                </span>
                <span className="font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                  {emp.qualified}
                </span>
              </div>
              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-semibold">
                  Proposals
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {emp.proposals}
                </span>
              </div>
              <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">
                  Won Deals
                </span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {emp.won}
                </span>
              </div>
            </div>

            {/* Pipeline & Revenue Footer */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                Pipeline: <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatLakhsINR(emp.pipelineValue)}</span>
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Won: <span className="font-mono font-bold">{formatLakhsINR(emp.wonValue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Comparative Matrix Table (hidden sm:block) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2.5 px-3">Metric</th>
              {comparedList.map((emp) => (
                <th key={emp.id} className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200">
                  <div className="flex items-center justify-end gap-1.5">
                    <EmployeeAvatar name={emp.name} avatar={emp.avatar} profilePhoto={emp.profilePhoto} size="xs" />
                    <span>{emp.name}</span>
                  </div>
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
