import React from 'react';
import {
  Users,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Trophy,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { TeamPerformanceSummary } from '../../types/reports';
import { formatLakhsINR } from '../../data/mockReports';

interface TeamPerformanceProps {
  summary: TeamPerformanceSummary;
  selectedTeam?: string;
}

export const TeamPerformance: React.FC<TeamPerformanceProps> = ({
  summary,
  selectedTeam = 'All Teams',
}) => {
  const metrics = [
    { label: 'Team Members', value: summary.totalTeamMembers, icon: Users, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Leads Assigned', value: summary.leadsAssigned, icon: Layers, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Outbound Calls', value: summary.calls, icon: PhoneCall, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Follow-ups', value: summary.followUps, icon: CalendarCheck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Qualified', value: summary.qualified, icon: CheckCircle2, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Proposals Sent', value: summary.proposals, icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Won Deals', value: summary.won, icon: Trophy, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/40' },
    { label: 'Pipeline Value', value: formatLakhsINR(summary.pipelineValue), icon: TrendingUp, color: 'text-[#5B4DB7] dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/40', isString: true },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Department & Team Performance Summary
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated operational velocity for {selectedTeam === 'All Teams' ? 'all sales & presales units' : selectedTeam}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Avg Achievement:</span>
          <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{summary.avgAchievementRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 truncate">
                  {m.label}
                </span>
                <div className={`w-5 h-5 rounded-md ${m.bg} ${m.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                {m.isString ? m.value : (m.value as number).toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
