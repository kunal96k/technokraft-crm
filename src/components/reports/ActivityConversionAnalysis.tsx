import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';

interface ActivityConversionAnalysisProps {
  employees: EmployeePerformanceRecord[];
  onSelectEmployee?: (emp: EmployeePerformanceRecord) => void;
}

export const ActivityConversionAnalysis: React.FC<ActivityConversionAnalysisProps> = ({
  employees,
  onSelectEmployee,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity → Conversion Yield Correlation</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluating if top outreach volume directly translates into qualified opportunities and closed wins
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Yield Index</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2.5 px-3">Salesperson</th>
              <th className="py-2.5 px-3 text-right">Calls</th>
              <th className="py-2.5 px-3 text-right">Emails</th>
              <th className="py-2.5 px-3 text-right">Follow-ups</th>
              <th className="py-2.5 px-3 text-right text-[#5B4DB7] dark:text-purple-300 font-bold">Qualified</th>
              <th className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-bold">Won Deals</th>
              <th className="py-2.5 px-3 text-right">Effort/Deal Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {employees.map((emp) => {
              const totalOutreach = emp.calls + emp.emails + emp.followUps;
              const effortRatio = (totalOutreach / Math.max(emp.won, 1)).toFixed(0);

              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-[10px] font-bold">
                        {emp.avatar}
                      </div>
                      <span>{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">{emp.calls}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">{emp.emails}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">{emp.followUps}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                    {emp.qualified}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {emp.won}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    {effortRatio} touchpoints / win
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
