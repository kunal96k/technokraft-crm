import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  User,
  Coffee,
  Hourglass,
  TrendingUp,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import {
  AttendanceStatusBadge,
  WorkStatusBadge,
  EmployeeStatusBadge,
} from '../employees/EmployeeStatusBadge';

interface AttendanceDetailsModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
}

export const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({
  isOpen,
  employee,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!isOpen || !employee) return null;

  const { attendanceSummary } = employee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60">
              {employee.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {employee.name}
                </h3>
                <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {employee.employeeCode}
                </span>
                <EmployeeStatusBadge status={employee.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {employee.role} • {employee.department} • Reports to {employee.reportingManager}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/reports/performance/${employee.id}`);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Performance</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Today's Live Session Tracking */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-blue-200/50 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Today's Session Telemetry (07 Sep 2026)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <AttendanceStatusBadge status={employee.todayAttendanceStatus} size="sm" />
                <WorkStatusBadge status={employee.workStatus} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Login Punch</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {employee.loginTime}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Logout Punch</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {employee.logoutTime || (employee.workStatus === 'Working' ? 'Active' : '—')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Session Working Time</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {employee.todayWorkingTime}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Break Duration</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                  45m
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
              Active CRM Context: <span className="font-medium text-slate-900 dark:text-white">{employee.currentActivity}</span>
            </div>
          </div>

          {/* Month Summary Metrics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Monthly Attendance Metrics (September 2026)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[11px] text-slate-400 block">Total Present</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {attendanceSummary.presentDays}
                </span>
                <span className="text-[10px] text-slate-500">Days on duty</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[11px] text-slate-400 block">Late Logins</span>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {attendanceSummary.lateDays}
                </span>
                <span className="text-[10px] text-slate-500">&gt; 09:30 AM</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[11px] text-slate-400 block">Leaves Taken</span>
                <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5 block">
                  {attendanceSummary.leaveDays}
                </span>
                <span className="text-[10px] text-slate-500">Approved</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[11px] text-slate-400 block">Unreported Absent</span>
                <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
                  {attendanceSummary.absentDays}
                </span>
                <span className="text-[10px] text-slate-500">Days</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-[11px] text-slate-400 block">Working Days</span>
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {attendanceSummary.workingDays}
                </span>
                <span className="text-[10px] text-slate-500">Calendar days</span>
              </div>
            </div>
          </div>

          {/* Working Hours vs Expected */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Working Hours vs Standard Quota
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Expected Daily Hours</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {attendanceSummary.expectedDailyHours}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Average Actual Logged</span>
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
                <span className="text-slate-400 text-[11px] block">Overtime Logged</span>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 text-sm">
                  {attendanceSummary.overtimeHours}
                </span>
              </div>
            </div>
          </div>

          {/* Day by Day Log Calendar View */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Monthly Calendar Grid View (Day 1 - Day 21)
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {attendanceSummary.dailyRecords.map((day) => (
                <div
                  key={day.date}
                  className={`p-2 rounded-lg border text-center text-xs ${
                    day.status === 'Present'
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : day.status === 'Late'
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20'
                      : day.status === 'Leave'
                      ? 'border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20'
                      : day.status === 'Half Day'
                      ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20'
                      : day.status === 'Absent'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {day.dayLabel} {day.dayNumber}
                  </div>
                  <div className="my-1">
                    <AttendanceStatusBadge status={day.status} size="sm" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {day.workingHours}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
