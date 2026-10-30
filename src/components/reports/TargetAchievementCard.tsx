import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { EmployeePerformanceRecord, TargetStatus } from '../../types/reports';
import { formatCurrencyINR } from '../../utils/currencyFormatters';
import { EmployeeAvatar } from '../common/EmployeeAvatar';
import { EmployeeSelect } from '../common/EmployeeSelect';

interface TargetAchievementCardProps {
  employees: EmployeePerformanceRecord[];
  selectedEmployeeName?: string;
  onSelectEmployeeName?: (name: string) => void;
}

export const TargetAchievementCard: React.FC<TargetAchievementCardProps> = ({
  employees,
  selectedEmployeeName = 'All Employees',
  onSelectEmployeeName,
}) => {
  const activeEmployee =
    employees && employees.length > 0
      ? (selectedEmployeeName && selectedEmployeeName !== 'All Employees'
          ? employees.find(
              (e) =>
                e.name.toLowerCase() === selectedEmployeeName.toLowerCase() ||
                String(e.id) === selectedEmployeeName
            ) || employees[0]
          : employees[0])
      : undefined;

  const [currentEmpName, setCurrentEmpName] = useState<string>(activeEmployee?.name || '');

  // Synchronize when parent changes selected employee
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    if (selectedEmployeeName && selectedEmployeeName !== 'All Employees') {
      const match = employees.find(
        (e) =>
          e.name.toLowerCase() === selectedEmployeeName.toLowerCase() ||
          String(e.id) === selectedEmployeeName
      );
      if (match) {
        setCurrentEmpName(match.name);
      }
    } else if (employees.length > 0 && !currentEmpName) {
      setCurrentEmpName(employees[0].name);
    }
  }, [selectedEmployeeName, employees, currentEmpName]);

  if (!employees || employees.length === 0) {
    return null;
  }

  const displayEmployee =
    employees.find(
      (e) =>
        e.name.toLowerCase() === currentEmpName.toLowerCase() ||
        String(e.id) === currentEmpName
    ) ||
    activeEmployee ||
    employees[0];

  if (!displayEmployee) {
    return null;
  }

  const getStatusBadge = (status: TargetStatus, hasTarget: boolean = true) => {
    if (!hasTarget) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Not Configured
        </span>
      );
    }
    switch (status) {
      case 'Achieved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-2.5 h-2.5" />
            Achieved
          </span>
        );
      case 'On Track':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300">
            <Sparkles className="w-2.5 h-2.5" />
            On Track
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-2.5 h-2.5" />
            At Risk
          </span>
        );
      case 'Not Set':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Not Set
          </span>
        );
      case 'Below Target':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300">
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Target Achievement Monitor
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
            Individual goal attainment breakdown across sales, pipeline, and activity metrics
          </p>
        </div>

        {/* Employee Switcher with Typeahead Debounced Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:max-w-[280px] shrink-0 min-w-0">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">Report:</label>
          <div className="flex-1 min-w-0">
            <EmployeeSelect
              value={displayEmployee.name}
              valueField="name"
              allowEmpty={false}
              showRoleInLabel={false}
              align="right"
              onChange={(e) => {
                const val = typeof e === 'string' ? e : e?.target?.value;
                if (!val) return;
                setCurrentEmpName(val);
                if (onSelectEmployeeName) {
                  onSelectEmployeeName(val);
                }
              }}
              placeholder="Search active rep..."
              className="h-8 w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs shadow-2xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Revenue Target Primary Focus Card */}
      <div className="bg-gradient-to-r from-purple-50/60 to-indigo-50/40 dark:from-purple-950/30 dark:to-indigo-950/20 rounded-xl p-3.5 sm:p-4 border border-purple-100/80 dark:border-purple-900/50 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <EmployeeAvatar
              name={displayEmployee.name}
              avatar={displayEmployee.avatar}
              profilePhoto={displayEmployee.profilePhoto}
              size="md"
              showRing={true}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase text-[#5B4DB7] dark:text-purple-300 tracking-wide truncate">
                {displayEmployee.name} • Monthly Commercial Revenue Target
              </div>
              <div className="text-base sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 truncate">
                Target: {displayEmployee.targetRevenue > 0 ? formatCurrencyINR(displayEmployee.targetRevenue) : 'Not Configured (₹0)'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">Achieved</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {formatCurrencyINR(displayEmployee.achievedRevenue)}
              </div>
            </div>
            {getStatusBadge(
              displayEmployee.targetAchievementRate >= 90
                ? 'Achieved'
                : displayEmployee.targetAchievementRate >= 75
                ? 'On Track'
                : 'Below Target',
              displayEmployee.targetRevenue > 0
            )}
          </div>
        </div>

        {/* Revenue Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600 dark:text-slate-400">Pacing Progress</span>
            <span className="text-[#5B4DB7] dark:text-purple-300 font-mono font-bold">
              {displayEmployee.targetRevenue > 0 ? `${displayEmployee.targetAchievementRate}%` : (displayEmployee.achievedRevenue > 0 ? '100%' : 'No Target')}
            </span>
          </div>
          <div className="w-full h-3 bg-white/80 dark:bg-slate-800 border border-purple-200/60 dark:border-purple-900/50 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                displayEmployee.targetAchievementRate
              )}`}
              style={{ width: `${displayEmployee.targetRevenue > 0 ? Math.min(displayEmployee.targetAchievementRate, 100) : (displayEmployee.achievedRevenue > 0 ? 100 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Card Layout for Target Metrics */}
      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {(displayEmployee.targetMetrics || []).map((row) => (
          <div key={row.metric} className="py-2.5 px-0.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">{row.metric}</span>
              {getStatusBadge(row.status, row.target > 0)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Target: <strong className="font-mono text-slate-700 dark:text-slate-300">{row.target > 0 ? (row.isCurrency ? formatCurrencyINR(row.target) : row.target) : 'Not Configured'}</strong>
              </span>
              <span>
                Achieved: <strong className="font-mono text-slate-900 dark:text-white">{row.isCurrency ? formatCurrencyINR(row.achieved) : row.achieved}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getProgressColor(row.achievementRate)}`}
                  style={{ width: `${row.target > 0 ? Math.min(row.achievementRate, 100) : (row.achieved > 0 ? 100 : 0)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                {row.target > 0 ? `${row.achievementRate}%` : (row.achieved > 0 ? '100%' : '—')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Target Table by Metric */}
      <div className="hidden sm:block overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-xs text-left min-w-[500px]">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2.5 px-3">Metric</th>
              <th className="py-2.5 px-3 text-right">Target</th>
              <th className="py-2.5 px-3 text-right">Achieved</th>
              <th className="py-2.5 px-3 text-center">Achievement %</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {(displayEmployee.targetMetrics || []).map((row) => (
              <tr key={row.metric} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                  {row.metric}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                  {row.target > 0 ? (row.isCurrency ? formatCurrencyINR(row.target) : row.target) : 'Not Configured'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                  {row.isCurrency ? formatCurrencyINR(row.achieved) : row.achieved}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${getProgressColor(row.achievementRate)}`}
                        style={{ width: `${row.target > 0 ? Math.min(row.achievementRate, 100) : (row.achieved > 0 ? 100 : 0)}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {row.target > 0 ? `${row.achievementRate}%` : (row.achieved > 0 ? '100%' : '—')}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right">
                  {getStatusBadge(row.status, row.target > 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
