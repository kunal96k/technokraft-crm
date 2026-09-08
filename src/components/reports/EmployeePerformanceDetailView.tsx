import React from 'react';
import {
  X,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Users,
  Target,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmployeePerformanceRecord } from '../../types/reports';
import { formatLakhsINR, formatCurrencyINR } from '../../data/mockReports';
import { EmployeeActivityChart } from './EmployeeActivityChart';
import { ConversionFunnel } from './ConversionFunnel';

interface EmployeePerformanceDetailViewProps {
  employee: EmployeePerformanceRecord;
  onClose?: () => void;
  isModal?: boolean;
}

export const EmployeePerformanceDetailView: React.FC<EmployeePerformanceDetailViewProps> = ({
  employee,
  onClose,
  isModal = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/reports/performance');
    }
  };

  const kpis = [
    { label: 'Leads Assigned', value: employee.leadsAssigned, color: 'text-slate-700 dark:text-slate-300' },
    { label: 'Leads Contacted', value: employee.leadsContacted, color: 'text-slate-700 dark:text-slate-300' },
    { label: 'Calls Completed', value: employee.calls, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Emails Sent', value: employee.emails, color: 'text-sky-600 dark:text-sky-400' },
    { label: 'WhatsApp Msgs', value: employee.whatsapp, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Follow-ups', value: employee.followUps, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Meetings Done', value: employee.meetings, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Qualified Leads', value: employee.qualified, color: 'text-[#5B4DB7] dark:text-purple-300 font-bold' },
    { label: 'Proposals Sent', value: employee.proposals, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Won Deals', value: employee.won, color: 'text-emerald-700 dark:text-emerald-400 font-bold' },
    { label: 'Pipeline Value', value: formatLakhsINR(employee.pipelineValue), color: 'text-slate-900 dark:text-white font-bold', isStr: true },
    { label: 'Won Value', value: formatLakhsINR(employee.wonValue), color: 'text-emerald-700 dark:text-emerald-400 font-bold', isStr: true },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar / Navigation Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Performance Report"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-11 h-11 rounded-full bg-[#5B4DB7] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {employee.avatar}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {employee.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300">
                  {employee.role}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    employee.status === 'Active'
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {employee.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                <span>{employee.team}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {employee.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {employee.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="text-right pr-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Reporting Window</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">September 2026 (This Month)</div>
            </div>
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 12-Grid Employee KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-2xs flex flex-col justify-between"
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 truncate mb-1">
              {kpi.label}
            </div>
            <div className={`text-lg sm:text-xl font-mono ${kpi.color}`}>
              {kpi.isStr ? kpi.value : (kpi.value as number).toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Target Achievement Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#5B4DB7] dark:text-purple-300" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Quota & Metric Targets (September 2026)
            </h2>
          </div>
          <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Overall Pacing: {employee.targetAchievementRate}%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3 text-right">Target</th>
                <th className="py-2.5 px-3 text-right">Achieved</th>
                <th className="py-2.5 px-3 text-center">Achievement %</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {employee.targetMetrics.map((row) => (
                <tr key={row.metric} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{row.metric}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    {row.isCurrency ? formatCurrencyINR(row.target) : row.target}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {row.isCurrency ? formatCurrencyINR(row.achieved) : row.achieved}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {row.achievementRate}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Achieved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                          : row.status === 'On Track'
                          ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300'
                          : row.status === 'At Risk'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Section: Daily Activity Trend & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeActivityChart
          trendData={employee.dailyActivityTrend}
          employeeName={employee.name}
        />
        <ConversionFunnel
          funnel={employee.funnel}
          title={`${employee.name}'s Conversion Funnel`}
          subtitle="Stage-by-stage pipeline throughput and conversion efficiency"
        />
      </div>
    </div>
  );
};
