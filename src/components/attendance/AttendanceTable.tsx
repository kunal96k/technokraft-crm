import React from 'react';
import { Eye, Clock, Calendar, ArrowRight } from 'lucide-react';
import { DailyAttendanceRecord } from '../../types/employees';
import { AttendanceStatusBadge, WorkStatusBadge } from '../employees/EmployeeStatusBadge';

interface AttendanceTableProps {
  records: DailyAttendanceRecord[];
  onViewDetails: (record: DailyAttendanceRecord) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onViewDetails,
}) => {
  if (records.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          No attendance records found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          No records match the current filters or date range.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 select-none">
          <tr>
            <th scope="col" className="py-3 px-4">
              Employee
            </th>
            <th scope="col" className="py-3 px-3">
              Department
            </th>
            <th scope="col" className="py-3 px-3">
              Date
            </th>
            <th scope="col" className="py-3 px-3">
              Login Time
            </th>
            <th scope="col" className="py-3 px-3">
              Logout Time
            </th>
            <th scope="col" className="py-3 px-3">
              Working Hours
            </th>
            <th scope="col" className="py-3 px-3">
              Break Time
            </th>
            <th scope="col" className="py-3 px-3">
              Status
            </th>
            <th scope="col" className="py-3 px-3">
              Current Activity
            </th>
            <th scope="col" className="py-3 px-3 text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {records.map((rec) => (
            <tr
              key={rec.id}
              onClick={() => onViewDetails(rec)}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              {/* Employee */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
                    {rec.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {rec.employeeName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {rec.employeeCode} • {rec.employeeRole}
                    </div>
                  </div>
                </div>
              </td>

              {/* Department */}
              <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                {rec.department}
              </td>

              {/* Date */}
              <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                {rec.date}
              </td>

              {/* Login Time */}
              <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                {rec.loginTime === '—' ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {rec.loginTime}
                  </span>
                )}
              </td>

              {/* Logout Time */}
              <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                {rec.logoutTime.includes('Active') ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400">{rec.logoutTime}</span>
                )}
              </td>

              {/* Working Hours */}
              <td className="py-3.5 px-3 whitespace-nowrap font-mono font-medium text-slate-800 dark:text-slate-200">
                {rec.workingHours}
              </td>

              {/* Break Time */}
              <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                {rec.breakTime}
              </td>

              {/* Status */}
              <td className="py-3.5 px-3 whitespace-nowrap">
                <AttendanceStatusBadge status={rec.status} size="sm" />
              </td>

              {/* Current Activity */}
              <td className="py-3.5 px-3 max-w-[200px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                    title={rec.currentActivity}
                  >
                    {rec.currentActivity}
                  </span>
                </div>
              </td>

              {/* Action Button */}
              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(rec);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
