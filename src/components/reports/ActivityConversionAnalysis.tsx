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
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Activity → Conversion Yield Correlation</h3>
            <p className="text-[11px] text-slate-500">
              Evaluating if top outreach volume directly translates into qualified opportunities and closed wins
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400">Yield Index</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-2.5 px-3">Salesperson</th>
              <th className="py-2.5 px-3 text-right">Calls</th>
              <th className="py-2.5 px-3 text-right">Emails</th>
              <th className="py-2.5 px-3 text-right">Follow-ups</th>
              <th className="py-2.5 px-3 text-right text-purple-700 font-bold">Qualified</th>
              <th className="py-2.5 px-3 text-right text-emerald-700 font-bold">Won Deals</th>
              <th className="py-2.5 px-3 text-right">Effort/Deal Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {employees.map((emp) => {
              const totalOutreach = emp.calls + emp.emails + emp.followUps;
              const effortRatio = (totalOutreach / Math.max(emp.won, 1)).toFixed(0);

              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-[10px] font-bold">
                        {emp.avatar}
                      </div>
                      <span>{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{emp.calls}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{emp.emails}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{emp.followUps}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#5B4DB7]">
                    {emp.qualified}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {emp.won}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
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
