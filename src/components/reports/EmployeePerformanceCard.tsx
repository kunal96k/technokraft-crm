import React from 'react';
import { ChevronRight, Phone, Mail, Award, TrendingUp } from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';
import { formatLakhsINR } from '../../data/mockReports';

interface EmployeePerformanceCardProps {
  employee: EmployeePerformanceRecord;
  onSelect: (emp: EmployeePerformanceRecord) => void;
}

export const EmployeePerformanceCard: React.FC<EmployeePerformanceCardProps> = ({
  employee,
  onSelect,
}) => {
  const achievement = employee.targetAchievementRate;
  const statusColor =
    achievement >= 90
      ? 'bg-emerald-600'
      : achievement >= 75
      ? 'bg-indigo-600'
      : 'bg-amber-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {employee.avatar}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {employee.name}
            </h3>
            <p className="text-[11px] text-slate-500">
              {employee.role} • <span className="text-slate-400">{employee.team}</span>
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            employee.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {employee.status}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-5 gap-1 py-2 border-y border-slate-100 text-center">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-medium">Leads</div>
          <div className="text-sm font-bold font-mono text-slate-800">{employee.leadsAssigned}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-medium">Calls</div>
          <div className="text-sm font-bold font-mono text-slate-800">{employee.calls}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-medium">F-ups</div>
          <div className="text-sm font-bold font-mono text-slate-800">{employee.followUps}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-medium text-purple-600">Qual.</div>
          <div className="text-sm font-bold font-mono text-[#5B4DB7]">{employee.qualified}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-medium text-emerald-600">Won</div>
          <div className="text-sm font-bold font-mono text-emerald-700">{employee.won}</div>
        </div>
      </div>

      {/* Target Achievement Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500 font-medium">Target Achievement</span>
          <span className="font-bold font-mono text-slate-900">
            {achievement}% ({formatLakhsINR(employee.achievedRevenue)} / {formatLakhsINR(employee.targetRevenue)})
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${statusColor}`}
            style={{ width: `${Math.min(achievement, 100)}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(employee)}
        className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-[#5B4DB7] font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <span>View Full Employee Profile & Metrics</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
