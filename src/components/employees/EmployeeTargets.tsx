import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, ArrowUpRight, Award, CheckCircle2 } from 'lucide-react';
import { Employee } from '../../types/employees';
import { TargetStatusBadge } from './EmployeeStatusBadge';
import { formatCurrencyINR } from '../../data/mockReports';

interface EmployeeTargetsProps {
  employee: Employee;
}

export const EmployeeTargets: React.FC<EmployeeTargetsProps> = ({ employee }) => {
  const navigate = useNavigate();
  const { targets } = employee;

  const targetList = [
    {
      label: 'Monthly Closed Revenue',
      target: targets.monthlyRevenueTarget,
      achieved: targets.achievedRevenue,
      rate: Math.round(
        (targets.achievedRevenue / (targets.monthlyRevenueTarget || 1)) * 100
      ),
      isCurrency: true,
      unit: '',
    },
    {
      label: 'Leads Handled & Qualified',
      target: targets.monthlyLeadTarget,
      achieved: targets.achievedLeads,
      rate: Math.round((targets.achievedLeads / (targets.monthlyLeadTarget || 1)) * 100),
      isCurrency: false,
      unit: 'leads',
    },
    {
      label: 'Outbound Client Calls',
      target: targets.monthlyCallTarget,
      achieved: targets.achievedCalls,
      rate: Math.round((targets.achievedCalls / (targets.monthlyCallTarget || 1)) * 100),
      isCurrency: false,
      unit: 'calls',
    },
    {
      label: 'Follow-ups Completed',
      target: targets.monthlyFollowUpTarget,
      achieved: targets.achievedFollowUps,
      rate: Math.round(
        (targets.achievedFollowUps / (targets.monthlyFollowUpTarget || 1)) * 100
      ),
      isCurrency: false,
      unit: 'follow-ups',
    },
    {
      label: 'Commercial Proposals Sent',
      target: targets.monthlyProposalTarget,
      achieved: targets.achievedProposals,
      rate: Math.round(
        (targets.achievedProposals / (targets.monthlyProposalTarget || 1)) * 100
      ),
      isCurrency: false,
      unit: 'proposals',
    },
    {
      label: 'Won Customer Deals',
      target: targets.monthlyWonDealTarget,
      achieved: targets.achievedWonDeals,
      rate: Math.round(
        (targets.achievedWonDeals / (targets.monthlyWonDealTarget || 1)) * 100
      ),
      isCurrency: false,
      unit: 'deals',
    },
  ];

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-emerald-500';
    if (rate >= 75) return 'bg-blue-500';
    if (rate >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Overall Target Status & Direct Link */}
      <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Monthly Target Pace:
              </span>
              <TargetStatusBadge status={targets.overallStatus} size="sm" />
              <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                {targets.revenueAchievementRate}% Quota Met
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target Period: September 2026 • Performance benchmarked against sales quota
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/reports/performance/${employee.id}`)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>View Full Performance Report</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Target Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {targetList.map((item) => (
          <div
            key={item.label}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                  {item.label}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    {item.isCurrency ? formatCurrencyINR(item.achieved) : item.achieved}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {item.isCurrency ? formatCurrencyINR(item.target) : `${item.target} ${item.unit}`}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                  item.rate >= 90
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : item.rate >= 75
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                {item.rate}%
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                    item.rate
                  )}`}
                  style={{ width: `${Math.min(item.rate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
