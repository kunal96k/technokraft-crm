import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Coffee,
  Hourglass,
  TrendingUp,
  LogIn,
  LogOut,
  Activity,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { shouldMaskForSecurity } from '../../utils/securityUtils';
import { Employee, DailyAttendanceRecord } from '../../types/employees';
import {
  AttendanceStatusBadge,
  WorkStatusBadge,
  EmployeeStatusBadge,
} from '../employees/EmployeeStatusBadge';
import { fetchAttendanceRecords } from '../../services/attendanceService';
import { buildSafeApiUrl } from '../../utils/urlUtils';
import { getLateCutoffDisplay } from '../../utils/shiftUtils';

interface AttendanceDetailsModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({
  isOpen,
  employee,
  onClose,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liveRecords, setLiveRecords] = useState<DailyAttendanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Body scroll lock when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Fetch real attendance records for this employee when modal opens
  useEffect(() => {
    if (!isOpen || !employee?.id) {
      setLiveRecords([]);
      return;
    }

    let isMounted = true;
    const loadRecords = async () => {
      setIsLoadingRecords(true);
      try {
        const res = await fetchAttendanceRecords({
          employeeId: String(employee.id),
          datePreset: 'This Month',
          size: 100,
          sortBy: 'date',
          sortDirection: 'asc',
        });
        if (isMounted) {
          setLiveRecords(res.content || []);
        }
      } catch (err) {
        console.warn('[AttendanceDetailsModal] Could not fetch records:', err);
      } finally {
        if (isMounted) setIsLoadingRecords(false);
      }
    };

    loadRecords();
    return () => { isMounted = false; };
  }, [isOpen, employee?.id]);

  // Compute metrics from live records if available, otherwise fallback to employee.attendanceSummary
  // Hook MUST be executed unconditionally on every render to satisfy Rules of Hooks (React Error #310 fix)
  const summaryMetrics = useMemo(() => {
    if (!isOpen || !employee) return null;

    if (liveRecords.length > 0) {
      const presentCount = liveRecords.filter(r => r.status === 'Present').length;
      const lateCount = liveRecords.filter(r => r.status === 'Late').length;
      const leaveCount = liveRecords.filter(r => r.status === 'Leave' || r.status === 'Half Day').length;
      const absentCount = liveRecords.filter(r => r.status === 'Absent').length;

      // Calculate total working minutes
      const totalMinutes = liveRecords.reduce((acc, r) => {
        if (!r.workingHours) return acc;
        const hMatch = r.workingHours.match(/(\d+)h/);
        const mMatch = r.workingHours.match(/(\d+)m/);
        const h = hMatch ? parseInt(hMatch[1], 10) : 0;
        const m = mMatch ? parseInt(mMatch[1], 10) : 0;
        return acc + (h * 60 + m);
      }, 0);

      const totalH = Math.floor(totalMinutes / 60);
      const totalM = totalMinutes % 60;
      const totalHoursStr = `${totalH}h ${String(totalM).padStart(2, '0')}m`;

      const daysLogged = presentCount + lateCount;
      const avgMinutes = daysLogged > 0 ? Math.floor(totalMinutes / daysLogged) : 0;
      const avgHoursStr = `${Math.floor(avgMinutes / 60)}h ${String(avgMinutes % 60).padStart(2, '0')}m`;

      return {
        presentDays: presentCount,
        lateDays: lateCount,
        leaveDays: leaveCount,
        absentDays: absentCount,
        workingDays: 22,
        totalWorkingHours: totalHoursStr,
        averageWorkingHours: avgHoursStr,
        expectedDailyHours: '8h 00m',
        overtimeHours: '0h 00m',
        dailyRecords: liveRecords.map(r => {
          const recDate = new Date(r.date);
          return {
            date: r.date,
            dayLabel: isNaN(recDate.getTime()) ? 'Day' : recDate.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: isNaN(recDate.getTime()) ? '' : recDate.getDate(),
            status: r.status,
            workingHours: r.workingHours,
          };
        }),
      };
    }

    if (employee?.attendanceSummary) {
      return employee.attendanceSummary;
    }

    return null;
  }, [isOpen, employee, liveRecords]);

  if (!isOpen || !employee) return null;

  // Security check: Mask Super Admin / System Administrator data if viewer is not Super Admin
  if (shouldMaskForSecurity(employee, user)) {
    const maskedModal = (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto p-6 sm:p-8 text-center animate-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 mb-2 border border-purple-200 dark:border-purple-800/60">
            Protected Role • Confidential
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            System Administrator Telemetry
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Attendance records, session logs, and working hour telemetry for the System Administrator and Super Admin are confidential and restricted for security reasons.
          </p>
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
    return createPortal(maskedModal, document.body);
  }

  const now = new Date();
  const todayLabel = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentMonthYear = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const isOnLeave =
    employee.status === 'On Leave' || employee.workStatus === 'On Leave';

  const effectiveAttendanceStatus = isOnLeave
    ? 'Leave'
    : (employee.todayAttendanceStatus || (employee.workStatus === 'Working' ? 'Present' : 'Absent'));

  const displayDuration = isOnLeave ? '00:00' : (employee.todayWorkingTime || '00:00');

  // Resolve profile image URL
  const photoUrl = employee.profilePhoto
    ? buildSafeApiUrl(employee.profilePhoto)
    : employee.avatar && (employee.avatar.startsWith('http') || employee.avatar.startsWith('/api'))
    ? buildSafeApiUrl(employee.avatar)
    : null;

  const initials =
    employee.name
      ? employee.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : employee.avatar || 'TK';

  const showImage = photoUrl && !imgError;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">

        {/* ── Header ── */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            {/* Avatar / Profile Photo */}
            <div className="w-11 h-11 rounded-xl ring-2 ring-purple-200 dark:ring-purple-800/50 shadow overflow-hidden bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 font-bold text-sm flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
              {showImage ? (
                <img
                  src={photoUrl!}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {employee.name}
                </h3>
                <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {employee.employeeCode}
                </span>
                <EmployeeStatusBadge status={employee.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {employee.role} • {employee.department}
                {employee.reportingManager ? ` • Reports to ${employee.reportingManager}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => { onClose(); navigate(`/reports/performance/${employee.id}`); }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-950/70 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Performance</span>
            </button>

            {/* Close Button with Visible Outline & Consistent Border */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close attendance details"
              title="Close modal"
              className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Today's Live Session */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-blue-200/50 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Today's Session — {todayLabel}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  {employee.shiftStartTime || '10:00 AM'} – {employee.shiftEndTime || '04:00 PM'}
                </span>
                <AttendanceStatusBadge status={effectiveAttendanceStatus} size="sm" />
                <WorkStatusBadge status={employee.workStatus || 'Offline'} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                  <LogIn className="w-3 h-3 text-blue-500" />
                  <span>Login Punch</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {employee.loginTime || '—'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                  <LogOut className="w-3 h-3 text-amber-500" />
                  <span>Logout Punch</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {employee.workStatus === 'Working'
                    ? <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Active</span>
                    : (employee.logoutTime || '—')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                  <Hourglass className="w-3 h-3 text-emerald-500" />
                  <span>Session Working Time</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {displayDuration}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-1">
                  <Coffee className="w-3 h-3 text-amber-500" />
                  <span>Break Duration</span>
                </div>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                  {employee.todayBreakTime || employee.attendanceSummary?.todayBreakTime || '0m'}
                </span>
              </div>
            </div>

            {employee.currentActivity && (
              <div className="mt-3 pt-2.5 text-xs text-slate-600 dark:text-slate-300 border-t border-blue-200/40 dark:border-blue-900/30">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span>Active CRM Context:&nbsp;<span className="font-medium text-slate-900 dark:text-white">{employee.currentActivity}</span></span>
                </span>
              </div>
            )}
          </div>

          {/* Loading Indicator for live records */}
          {isLoadingRecords && (
            <div className="py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#5B4DB7]" />
              <span>Fetching live attendance telemetry from database...</span>
            </div>
          )}

          {/* Monthly Attendance Metrics */}
          {summaryMetrics && (
            <>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Monthly Attendance Metrics — {currentMonthYear}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  {[
                    { label: 'Total Present', value: summaryMetrics.presentDays, color: 'text-emerald-600 dark:text-emerald-400', sub: 'Days on duty' },
                    { label: 'Late Logins', value: summaryMetrics.lateDays, color: 'text-amber-600 dark:text-amber-400', sub: `> ${getLateCutoffDisplay(employee?.shiftStartTime)}` },
                    { label: 'Leaves Taken', value: summaryMetrics.leaveDays, color: 'text-purple-600 dark:text-purple-400', sub: 'Approved' },
                    { label: 'Unreported Absent', value: summaryMetrics.absentDays, color: 'text-rose-600 dark:text-rose-400', sub: 'Days' },
                    { label: 'Working Days', value: summaryMetrics.workingDays, color: 'text-slate-900 dark:text-white', sub: 'Calendar days' },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 shadow-2xs">
                      <span className="text-[11px] text-slate-400 block">{m.label}</span>
                      <span className={`text-xl font-bold font-mono mt-0.5 block ${m.color}`}>{m.value ?? '—'}</span>
                      <span className="text-[10px] text-slate-500">{m.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours vs Expected */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                  Working Hours vs Standard Quota
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  {[
                    { label: 'Expected Daily Hours', value: summaryMetrics.expectedDailyHours, color: 'text-slate-800 dark:text-slate-200' },
                    { label: 'Average Actual Logged', value: summaryMetrics.averageWorkingHours, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Total Monthly Hours', value: summaryMetrics.totalWorkingHours, color: 'text-[#5B4DB7] dark:text-purple-400' },
                    { label: 'Overtime Logged', value: summaryMetrics.overtimeHours, color: 'text-blue-600 dark:text-blue-400' },
                  ].map((m) => (
                    <div key={m.label}>
                      <span className="text-slate-400 text-[11px] block">{m.label}</span>
                      <span className={`font-mono font-bold text-sm ${m.color}`}>{m.value ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-by-Day Calendar Grid */}
              {summaryMetrics.dailyRecords && summaryMetrics.dailyRecords.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Monthly Calendar Grid — {currentMonthYear}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {summaryMetrics.dailyRecords.map((day: any, idx: number) => (
                      <div
                        key={day.date || idx}
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
                        <div className="my-1 flex justify-center">
                          <AttendanceStatusBadge status={day.status} size="sm" />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {day.workingHours || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* No summary fallback */}
          {!summaryMetrics && !isLoadingRecords && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 dark:text-slate-600">
              <CalendarDays className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No monthly summary available</p>
              <p className="text-xs mt-1">Monthly attendance data will appear once records are available.</p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Last refreshed: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
