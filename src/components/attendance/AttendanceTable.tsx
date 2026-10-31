import React, { useState, useEffect } from 'react';
import { Eye, Clock, Calendar, ArrowRight, ArrowUpDown, ArrowUp, ArrowDown, ShieldCheck, Coffee } from 'lucide-react';
import { DailyAttendanceRecord } from '../../types/employees';
import { AttendanceStatusBadge, WorkStatusBadge } from '../employees/EmployeeStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { shouldMaskForSecurity } from '../../utils/securityUtils';
import { calculateWorkingDuration } from '../../utils/workingHoursUtils';
import { buildSafeApiUrl } from '../../utils/urlUtils';

interface AttendanceTableProps {
  records: DailyAttendanceRecord[];
  onViewDetails: (record: DailyAttendanceRecord) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onViewDetails,
  sortBy,
  sortDirection,
  onSort,
}) => {
  const { user } = useAuth();
  const [, setTick] = useState(0);

  // Periodic re-render every 30 seconds to tick active working timers
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);
  const renderSortIcon = (field: string) => {
    if (!onSort) return null;
    if (sortBy === field) {
      return sortDirection === 'asc' ? (
        <ArrowUp className="w-3 h-3 text-purple-600 dark:text-purple-400 inline ml-1" />
      ) : (
        <ArrowDown className="w-3 h-3 text-purple-600 dark:text-purple-400 inline ml-1" />
      );
    }
    return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity inline ml-1" />;
  };

  const handleHeaderClick = (field: string) => {
    if (onSort) onSort(field);
  };

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
            <th
              scope="col"
              className="py-3 px-4 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 group"
              onClick={() => handleHeaderClick('employeeName')}
            >
              <span>Employee</span>
              {renderSortIcon('employeeName')}
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 group"
              onClick={() => handleHeaderClick('department')}
            >
              <span>Department</span>
              {renderSortIcon('department')}
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 group"
              onClick={() => handleHeaderClick('date')}
            >
              <span>Date</span>
              {renderSortIcon('date')}
            </th>
            <th scope="col" className="py-3 px-3">
              Login Time
            </th>
            <th scope="col" className="py-3 px-3">
              Logout Time
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 group"
              onClick={() => handleHeaderClick('workingHours')}
            >
              <span>Working Hours</span>
              {renderSortIcon('workingHours')}
            </th>
            <th scope="col" className="py-3 px-3">
              Break Time
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 group"
              onClick={() => handleHeaderClick('status')}
            >
              <span>Status</span>
              {renderSortIcon('status')}
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
          {records.map((rec) => {
            const isMasked = shouldMaskForSecurity(rec, user);
            const photoUrl = rec.profilePhoto
              ? buildSafeApiUrl(rec.profilePhoto)
              : rec.avatar && (rec.avatar.startsWith('http') || rec.avatar.startsWith('/api') || rec.avatar.startsWith('data:'))
              ? buildSafeApiUrl(rec.avatar)
              : null;
            const initials = rec.employeeName && rec.employeeName.trim()
              ? (() => {
                  const parts = rec.employeeName.trim().split(/\s+/);
                  return parts.length > 1
                    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                    : rec.employeeName.trim().slice(0, 2).toUpperCase();
                })()
              : (rec.avatar || 'TK');

            return (
              <tr
                key={rec.id}
                onClick={() => onViewDetails(rec)}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                {/* Employee */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60 overflow-hidden">
                      {isMasked ? (
                        <ShieldCheck className="w-4 h-4 text-[#5B4DB7] dark:text-purple-300" />
                      ) : photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={rec.employeeName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {isMasked ? (
                          <>
                            <span className="blur-[3px] select-none">{rec.employeeName}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                              Protected
                            </span>
                          </>
                        ) : (
                          rec.employeeName
                        )}
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

                {(() => {
                  const hasNotLoggedIn = !rec.loginTime || rec.loginTime === '—' || rec.loginTime === '---' || rec.loginTime.trim() === '';
                  const displayStatus = hasNotLoggedIn ? (rec.status === 'Leave' ? 'Leave' : 'Absent') : rec.status;
                  const displayActivity = hasNotLoggedIn ? 'Offline' : (rec.currentActivity || 'Offline');

                  return (
                    <>
                      {/* Login Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {isMasked ? (
                          <span className="blur-[3px] select-none text-slate-400">09:00 AM</span>
                        ) : hasNotLoggedIn ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {rec.loginTime}
                          </span>
                        )}
                      </td>

                      {/* Logout Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                        {isMasked ? (
                          <span className="blur-[3px] select-none text-slate-400">Active</span>
                        ) : hasNotLoggedIn ? (
                          <span className="text-slate-400">—</span>
                        ) : (rec.logoutTime ?? '').includes('Active') || rec.workStatus === 'Working' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400">{rec.logoutTime || '—'}</span>
                        )}
                      </td>

                      {/* Working Hours */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono font-medium text-slate-800 dark:text-slate-200">
                        {isMasked ? (
                          <span className="blur-[3px] select-none text-slate-400">08h 00m</span>
                        ) : hasNotLoggedIn ? (
                          <span className="text-slate-400 font-mono">0h 00m</span>
                        ) : (() => {
                          const isWorking = (rec.logoutTime ?? '').includes('Active') || rec.workStatus === 'Working';
                          if (isWorking && rec.loginTime && rec.loginTime !== '—' && rec.loginTime !== '---') {
                            const live = calculateWorkingDuration(rec.loginTime, null, true, rec.workingHours);
                            if (live.formatted !== '0h 00m' && (rec.workingHours === '0h 00m' || rec.workingHours === '00:00')) {
                              return live.formatted;
                            }
                          }
                          return rec.workingHours || '0h 00m';
                        })()}
                      </td>

                      {/* Break Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {isMasked ? (
                          <span className="blur-[3px] select-none text-slate-400">0m</span>
                        ) : !hasNotLoggedIn && rec.breakTime && rec.breakTime !== '0m' && rec.breakTime !== '---' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 w-fit max-w-fit shrink-0">
                            <Coffee className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{rec.breakTime}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">0m</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-0.5 w-fit">
                          <AttendanceStatusBadge status={displayStatus} size="sm" />
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {rec.shiftStartTime || '10:00 AM'} - {rec.shiftEndTime || '04:00 PM'}
                          </span>
                        </div>
                      </td>

                      {/* Current Activity */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="flex items-center gap-1.5 truncate">
                          {isMasked ? (
                            <span className="text-[11px] text-slate-400 italic">
                              Confidential Session
                            </span>
                          ) : (
                            <span
                              className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                              title={displayActivity}
                            >
                              {displayActivity}
                            </span>
                          )}
                        </div>
                      </td>
                    </>
                  );
                })()}

                {/* Action Button */}
                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(rec);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
