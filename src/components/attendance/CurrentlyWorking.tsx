import React from 'react';
import { Clock, Radio, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { Employee } from '../../types/employees';
import { WorkStatusBadge } from '../employees/EmployeeStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { shouldMaskForSecurity } from '../../utils/securityUtils';

interface CurrentlyWorkingProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

export const CurrentlyWorking: React.FC<CurrentlyWorkingProps> = ({
  employees,
  onSelectEmployee,
}) => {
  const { user } = useAuth();
  const workingEmployees = employees.filter((e) => e.workStatus === 'Working');

  if (workingEmployees.length === 0) return null;

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            Currently Working Reps ({workingEmployees.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Live real-time telemetry from CRM active sessions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {workingEmployees.map((emp) => {
          const isMasked = shouldMaskForSecurity(emp, user);

          return (
            <button
              key={emp.id}
              type="button"
              onClick={() => onSelectEmployee(emp)}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-purple-200 dark:hover:border-purple-800/50 text-left transition-all group flex flex-col justify-between gap-2.5 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
                    {isMasked ? <ShieldCheck className="w-4 h-4 text-[#5B4DB7] dark:text-purple-300" /> : emp.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 font-semibold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {isMasked ? (
                        <>
                          <span className="blur-[3px] select-none">{emp.name}</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                            Protected
                          </span>
                        </>
                      ) : (
                        emp.name
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {emp.role} • {emp.department}
                    </div>
                  </div>
                </div>

                <WorkStatusBadge status={emp.workStatus} size="sm" />
              </div>

              <div className="w-full pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>
                    Logged in:{' '}
                    <strong className="font-mono text-slate-700 dark:text-slate-200">
                      {isMasked ? <span className="blur-[3px] select-none text-slate-400">09:00 AM</span> : emp.loginTime}
                    </strong>
                  </span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {isMasked ? <span className="blur-[3px] select-none text-slate-400">08h 00m</span> : emp.todayWorkingTime}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 truncate" title={emp.currentActivity}>
                  Task:{' '}
                  <span className="font-medium text-slate-900 dark:text-white">
                    {isMasked ? <span className="italic text-slate-400">Protected Task</span> : emp.currentActivity}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
