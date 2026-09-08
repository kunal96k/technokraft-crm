import React from 'react';
import { Eye, Clock, Calendar } from 'lucide-react';
import { DailyAttendanceRecord } from '../../types/employees';
import { AttendanceStatusBadge, WorkStatusBadge } from '../employees/EmployeeStatusBadge';

interface AttendanceCardProps {
  record: DailyAttendanceRecord;
  onViewDetails: (record: DailyAttendanceRecord) => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  record,
  onViewDetails,
}) => {
  return (
    <div
      onClick={() => onViewDetails(record)}
      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-purple-300 dark:hover:border-purple-800/60 transition-all cursor-pointer flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
            {record.avatar}
          </div>
          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
              {record.employeeName}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {record.department} • {record.employeeRole}
            </p>
          </div>
        </div>

        <AttendanceStatusBadge status={record.status} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <div>
          <span className="text-[10px] text-slate-400 block">Login / Logout</span>
          <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 font-medium">
            {record.loginTime} – {record.logoutTime}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Working Hours</span>
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {record.workingHours} (Break: {record.breakTime})
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
        <span className="truncate max-w-[190px]">{record.currentActivity}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(record);
          }}
          className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium hover:underline"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};
