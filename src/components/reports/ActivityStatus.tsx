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
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Employee Activity Status</h3>
            <p className="text-[11px] text-slate-500">Live operational cadence and next scheduled actions</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Manager Monitoring</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-2.5 px-3">Employee</th>
              <th className="py-2.5 px-3">Last Activity</th>
              <th className="py-2.5 px-3">Next Follow-up</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                className="hover:bg-slate-50/70 cursor-pointer transition-colors"
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.role}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                  {emp.lastActivityTime}
                </td>
                <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                  {emp.nextFollowUpTime}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
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
