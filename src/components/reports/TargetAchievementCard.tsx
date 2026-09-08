import React, { useState } from 'react';
import { Target, CheckCircle, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { EmployeePerformanceRecord, TargetStatus } from '../../types/reports';
import { formatCurrencyINR } from '../../data/mockReports';

interface TargetAchievementCardProps {
  employees: EmployeePerformanceRecord[];
  selectedEmployeeName?: string;
}

export const TargetAchievementCard: React.FC<TargetAchievementCardProps> = ({
  employees,
  selectedEmployeeName = 'All Employees',
}) => {
  const activeEmployee =
    selectedEmployeeName !== 'All Employees'
      ? employees.find((e) => e.name === selectedEmployeeName) || employees[0]
      : employees[0]; // defaults to top rep when All is selected

  const [currentEmpId, setCurrentEmpId] = useState(activeEmployee.id);

  const displayEmployee =
    employees.find((e) => e.id === currentEmpId) || activeEmployee;

  const getStatusBadge = (status: TargetStatus) => {
    switch (status) {
      case 'Achieved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-2.5 h-2.5" />
            Achieved
          </span>
        );
      case 'On Track':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            <Sparkles className="w-2.5 h-2.5" />
            On Track
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-2.5 h-2.5" />
            At Risk
          </span>
        );
      case 'Below Target':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-2.5 h-2.5" />
            Below Target
          </span>
        );
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-600';
    if (rate >= 75) return 'bg-indigo-600';
    if (rate >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Target Achievement Monitor
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual goal attainment breakdown across sales, pipeline, and activity metrics
          </p>
        </div>

        {/* Employee Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Rep:</label>
          <select
            value={displayEmployee.id}
            onChange={(e) => setCurrentEmpId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.targetAchievementRate}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenue Target Primary Focus Card */}
      <div className="bg-gradient-to-r from-purple-50/60 to-indigo-50/40 rounded-xl p-4 border border-purple-100/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <div className="text-[11px] font-bold uppercase text-[#5B4DB7] tracking-wide">
              {displayEmployee.name} • Monthly Commercial Revenue Target
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">
              Target: {formatCurrencyINR(displayEmployee.targetRevenue)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">Achieved</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-700">
                {formatCurrencyINR(displayEmployee.achievedRevenue)}
              </div>
            </div>
            {getStatusBadge(
              displayEmployee.targetAchievementRate >= 90
                ? 'Achieved'
                : displayEmployee.targetAchievementRate >= 75
                ? 'On Track'
                : 'Below Target'
            )}
          </div>
        </div>

        {/* Revenue Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Pacing Progress</span>
            <span className="text-[#5B4DB7] font-mono font-bold">
              {displayEmployee.targetAchievementRate}%
            </span>
          </div>
          <div className="w-full h-3 bg-white/80 border border-purple-200/60 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                displayEmployee.targetAchievementRate
              )}`}
              style={{ width: `${Math.min(displayEmployee.targetAchievementRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Target Table by Metric */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-2.5 px-3">Metric</th>
              <th className="py-2.5 px-3 text-right">Target</th>
              <th className="py-2.5 px-3 text-right">Achieved</th>
              <th className="py-2.5 px-3 text-center">Achievement %</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {displayEmployee.targetMetrics.map((row) => (
              <tr key={row.metric} className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  {row.metric}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                  {row.isCurrency ? formatCurrencyINR(row.target) : row.target}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {row.isCurrency ? formatCurrencyINR(row.achieved) : row.achieved}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${getProgressColor(row.achievementRate)}`}
                        style={{ width: `${Math.min(row.achievementRate, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {row.achievementRate}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right">
                  {getStatusBadge(row.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
