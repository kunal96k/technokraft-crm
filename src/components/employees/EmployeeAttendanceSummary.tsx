import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ArrowUpRight,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import { AttendanceStatusBadge } from './EmployeeStatusBadge';

interface EmployeeAttendanceSummaryProps {
  employee: Employee;
}

export const EmployeeAttendanceSummary: React.FC<EmployeeAttendanceSummaryProps> = ({
  employee,
}) => {
  const navigate = useNavigate();
  const { attendanceSummary } = employee;

  return (
    <div className="space-y-5">
      {/* Top Banner with Direct Link */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                September 2026 Attendance Summary
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                {attendanceSummary.presentDays} / {attendanceSummary.workingDays} Days Present
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Average session duration {attendanceSummary.averageWorkingHours} • Overtime logged: {attendanceSummary.overtimeHours}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/employees/attendance?employeeId=${employee.id}`)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all shrink-0"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>View Full Attendance Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Present Days
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {attendanceSummary.presentDays}
          </div>
          <span className="text-[11px] text-slate-400">On-time attendances</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Late Logins
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {attendanceSummary.lateDays}
          </div>
          <span className="text-[11px] text-slate-400">Past 09:30 AM</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Approved Leaves
          </span>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
            {attendanceSummary.leaveDays}
          </div>
          <span className="text-[11px] text-slate-400">Sick / Casual</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Absent Days
          </span>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {attendanceSummary.absentDays}
          </div>
          <span className="text-[11px] text-slate-400">Unexcused</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
            Working Days
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {attendanceSummary.workingDays}
          </div>
          <span className="text-[11px] text-slate-400">Total in cycle</span>
        </div>
      </div>

      {/* Working Hours Metrics */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Working Hours Analytics
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Standard shift: 09:00 AM – 06:00 PM (8 hrs/day)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Expected Daily Hours</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white text-sm">
              {attendanceSummary.expectedDailyHours}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Average Working Hours</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
              {attendanceSummary.averageWorkingHours}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Total Monthly Hours</span>
            <span className="font-mono font-semibold text-purple-600 dark:text-purple-400 text-sm">
              {attendanceSummary.totalWorkingHours}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Overtime Recorded</span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 text-sm">
              {attendanceSummary.overtimeHours}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Mini Month View */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          Daily Log Calendar (First 21 Days of Month)
        </h4>

        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {attendanceSummary.dailyRecords.map((rec) => (
            <div
              key={rec.date}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                rec.status === 'Present'
                  ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : rec.status === 'Late'
                  ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-950/20'
                  : rec.status === 'Leave'
                  ? 'border-purple-200 dark:border-purple-800/50 bg-purple-50/40 dark:bg-purple-950/20'
                  : rec.status === 'Half Day'
                  ? 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : rec.status === 'Absent'
                  ? 'border-rose-200 dark:border-rose-800/50 bg-rose-50/40 dark:bg-rose-950/20'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {rec.dayLabel} {rec.dayNumber}
              </div>
              <div className="my-1">
                <AttendanceStatusBadge status={rec.status} size="sm" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {rec.workingHours}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
