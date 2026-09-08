import React from 'react';
import { EmployeeCallStats } from '../../../types/calls';
import { MOCK_EMPLOYEE_CALL_STATS } from '../../../data/mockCalls';
import { PhoneCall, CheckCircle2, PhoneMissed, ClockAlert, ArrowRight } from 'lucide-react';

interface CallEmployeePerformanceProps {
  onSelectEmployee: (name: string) => void;
}

export const CallEmployeePerformance: React.FC<CallEmployeePerformanceProps> = ({
  onSelectEmployee,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Employee Call Accountability</h3>
          <p className="text-xs text-slate-500">
            Daily call targets, completed connections, and pending follow-ups per sales representative
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {MOCK_EMPLOYEE_CALL_STATS.map((emp) => {
          const completionRate = Math.round((emp.completed / emp.callsToday) * 100);

          return (
            <div
              key={emp.employeeName}
              className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:border-[#5B4DB7]/40 transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-[#5B4DB7] font-bold text-xs flex items-center justify-center">
                    {emp.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{emp.employeeName}</h4>
                    <p className="text-[11px] text-slate-500">{emp.role}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectEmployee(emp.employeeName)}
                  className="text-xs text-[#5B4DB7] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Stat Badges Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-[11px]">Calls Today</span>
                    <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="text-base font-bold text-slate-900">{emp.callsToday}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100/80">
                  <div className="flex items-center justify-between text-emerald-700 mb-1">
                    <span className="text-[11px] font-medium">Completed</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-base font-bold text-emerald-900">{emp.completed}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100/80">
                  <div className="flex items-center justify-between text-rose-700 mb-1">
                    <span className="text-[11px] font-medium">Missed</span>
                    <PhoneMissed className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="text-base font-bold text-rose-900">{emp.missed}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100/80">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-[11px] font-medium">Follow-up Req.</span>
                    <ClockAlert className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-base font-bold text-amber-900">{emp.followUpRequired}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Connection Success Rate</span>
                  <span className="font-bold text-slate-700">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
