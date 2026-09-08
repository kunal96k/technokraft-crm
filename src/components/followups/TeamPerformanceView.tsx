import React from 'react';
import { Users, CheckCircle2, Clock, AlertTriangle, Calendar, Award } from 'lucide-react';
import { EmployeePerformance } from '../../types/followUps';

interface TeamPerformanceViewProps {
  performanceData: EmployeePerformance[];
  onSelectEmployee?: (employeeName: string) => void;
}

export const TeamPerformanceView: React.FC<TeamPerformanceViewProps> = ({
  performanceData,
  onSelectEmployee,
}) => {
  return (
    <div id="team-performance-container" className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#5B4DB7] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Team Follow-up Workload & Completion Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Real-time pipeline accountability across sales reps and business analysts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Team Average Completion: <strong>80.3%</strong></span>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 min-w-[180px]">Team Member</th>
              <th className="py-3 px-3 text-center min-w-[90px]">Total Assigned</th>
              <th className="py-3 px-3 text-center min-w-[80px]">Today</th>
              <th className="py-3 px-3 text-center min-w-[90px]">Upcoming</th>
              <th className="py-3 px-3 text-center min-w-[80px]">Overdue</th>
              <th className="py-3 px-3 text-center min-w-[90px]">Completed</th>
              <th className="py-3 px-4 min-w-[170px]">Completion Rate</th>
              <th className="py-3 px-3 text-right min-w-[90px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {performanceData.map((emp) => (
              <tr key={emp.name} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-[#5B4DB7] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400">{emp.role}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3 text-center font-bold text-slate-800">
                  {emp.assigned}
                </td>

                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 text-[11px]">
                    {emp.today}
                  </span>
                </td>

                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 text-[11px]">
                    {emp.upcoming}
                  </span>
                </td>

                <td className="py-3 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      emp.overdue > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {emp.overdue}
                  </span>
                </td>

                <td className="py-3 px-3 text-center font-medium text-emerald-700">
                  {emp.completed}
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          emp.completionRate >= 80
                            ? 'bg-emerald-500'
                            : emp.completionRate >= 60
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${emp.completionRate}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-800 text-[11px] w-12 text-right">
                      {emp.completionRate.toFixed(1)}%
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3 text-right">
                  {onSelectEmployee && (
                    <button
                      type="button"
                      onClick={() => onSelectEmployee(emp.name)}
                      className="text-xs font-semibold text-[#5B4DB7] hover:underline"
                    >
                      Filter List
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
