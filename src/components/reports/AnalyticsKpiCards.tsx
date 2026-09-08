import React from 'react';
import {
  Users,
  Target,
  CheckCircle2,
  Briefcase,
  FileText,
  Trophy,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { formatLakhsINR } from '../../data/mockReports';

interface AnalyticsKpiCardsProps {
  totalLeads?: number;
  interested?: number;
  qualified?: number;
  opportunities?: number;
  proposals?: number;
  won?: number;
  pipelineValue?: number;
  winRate?: number;
}

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({
  totalLeads = 1284,
  interested = 320,
  qualified = 145,
  opportunities = 72,
  proposals = 42,
  won = 18,
  pipelineValue = 4250000,
  winRate = 36.0,
}) => {
  const cards = [
    { label: 'Total Leads', value: totalLeads.toLocaleString('en-IN'), icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', subtext: 'Inbound & Outbound' },
    { label: 'Interested', value: interested.toLocaleString('en-IN'), icon: Target, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', subtext: 'Discovery qualified' },
    { label: 'Qualified Leads', value: qualified.toLocaleString('en-IN'), icon: CheckCircle2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', subtext: 'Budget & Tech fit' },
    { label: 'Opportunities', value: opportunities.toLocaleString('en-IN'), icon: Briefcase, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', subtext: 'Active pipeline' },
    { label: 'Proposals Sent', value: proposals.toLocaleString('en-IN'), icon: FileText, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40', subtext: 'Commercial quotes' },
    { label: 'Won Deals', value: won.toLocaleString('en-IN'), icon: Trophy, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40', subtext: 'Closed contracts' },
    { label: 'Pipeline Value', value: formatLakhsINR(pipelineValue), icon: TrendingUp, color: 'text-[#5B4DB7] dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/40', subtext: 'Active deal volume' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Percent, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', subtext: 'Won / (Won + Lost)' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {c.label}
              </span>
              <div
                className={`w-6 h-6 rounded-md ${c.bg} ${c.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {c.value}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {c.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
