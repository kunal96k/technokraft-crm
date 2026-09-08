import React from 'react';
import { Clock, AlertCircle, CheckCircle2, UserCheck, ChevronRight } from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';

interface ActivityStatusProps {
  employees: EmployeePerformanceRecord[];
  onSelectEmployee?: (emp: EmployeePerformanceRecord) => void;
}

export const ActivityStatus: React.FC<ActivityStatusProps> = ({
  employees,
  onSelectEmployee,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employee Activity Status</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Live operational cadence and next scheduled actions</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Manager Monitoring</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-2.5 px-3">Employee</th>
              <th className="py-2.5 px-3">Last Activity</th>
              <th className="py-2.5 px-3">Next Follow-up</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{emp.role}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  {emp.lastActivityTime}
                </td>
                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {emp.nextFollowUpTime}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {emp.status === 'Active' ? (
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    ) : (
                      <AlertCircle className="w-2.5 h-2.5" />
                    )}
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
