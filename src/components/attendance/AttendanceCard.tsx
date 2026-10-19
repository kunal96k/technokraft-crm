import React from 'react';
import { Eye, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { DailyAttendanceRecord } from '../../types/employees';
import { AttendanceStatusBadge, WorkStatusBadge } from '../employees/EmployeeStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { shouldMaskForSecurity } from '../../utils/securityUtils';

interface AttendanceCardProps {
  record: DailyAttendanceRecord;
  onViewDetails: (record: DailyAttendanceRecord) => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  record,
  onViewDetails,
}) => {
  const { user } = useAuth();
  const isMasked = shouldMaskForSecurity(record, user);

  return (
    <div
      onClick={() => onViewDetails(record)}
      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-purple-300 dark:hover:border-purple-800/60 transition-all cursor-pointer flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
            {isMasked ? <ShieldCheck className="w-4 h-4 text-[#5B4DB7] dark:text-purple-300" /> : record.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 dark:text-white">
              {isMasked ? (
                <>
                  <span className="blur-[3px] select-none">{record.employeeName}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                    Protected
                  </span>
                </>
              ) : (
                record.employeeName
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {record.department} • {record.employeeRole}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <AttendanceStatusBadge status={record.status} size="sm" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {record.shiftStartTime || '10:00 AM'} - {record.shiftEndTime || '04:00 PM'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <div>
          <span className="text-[10px] text-slate-400 block">Login / Logout</span>
          <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-medium">
            {isMasked ? (
              <span className="blur-[3px] select-none text-slate-400">09:00 AM – Active</span>
            ) : (
              `${record.loginTime} – ${record.logoutTime}`
            )}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Working Hours</span>
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {isMasked ? (
              <span className="blur-[3px] select-none text-slate-400">08h 00m</span>
            ) : (
              `${record.workingHours} (Break: ${record.breakTime})`
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
        <span className="truncate max-w-[190px]">
          {isMasked ? (
            <span className="italic text-slate-400">Confidential Session</span>
          ) : (
            record.currentActivity
          )}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(record);
          }}
          className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium hover:underline cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};
