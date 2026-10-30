import React from 'react';
import { CalendarX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OverdueFollowUpStat } from '../../types/reports';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

interface OverdueFollowupAnalysisProps {
  stats: OverdueFollowUpStat[];
}

export const OverdueFollowupAnalysis: React.FC<OverdueFollowupAnalysisProps> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 font-medium h-full flex items-center justify-center">
        No overdue follow-up bottlenecks detected. All tasks on schedule.
      </div>
    );
  }

  const totalOverdue = stats.reduce((acc, s) => acc + s.overdueCount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <CalendarX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Overdue Follow-up Bottlenecks
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Missed tasks and scheduled callbacks per representative
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
              {totalOverdue} Overdue
            </span>
            <Link
              to="/follow-ups"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#5B4DB7] dark:text-purple-300 hover:text-[#4E41A2] bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
            >
              <span>View Follow-ups</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-3">
          {stats.map((item, idx) => (
            <div
              key={`${item.employeeName}-${idx}`}
              className={`border rounded-xl p-3 flex flex-col justify-between ${
                item.overdueCount > 0
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                  : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <EmployeeAvatar
                    name={item.employeeName}
                    avatar={item.employeeAvatar}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.employeeName}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {item.employeeRole}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {item.overdueCount}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      overdue
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    of {item.pendingTotal} pending tasks
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                Earliest: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{item.earliestDueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Remediation priority: <strong>High</strong></span>
        <span>Callback bottleneck: <strong className="font-mono text-rose-600 dark:text-rose-400">{totalOverdue} overdue actions</strong></span>
      </div>
    </div>
  );
};
