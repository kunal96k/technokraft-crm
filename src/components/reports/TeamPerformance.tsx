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
    { label: 'Team Members', value: summary.totalTeamMembers, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'Leads Assigned', value: summary.leadsAssigned, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Outbound Calls', value: summary.calls, icon: PhoneCall, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Follow-ups', value: summary.followUps, icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Qualified', value: summary.qualified, icon: CheckCircle2, color: 'text-purple-700', bg: 'bg-purple-50' },
    { label: 'Proposals Sent', value: summary.proposals, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Won Deals', value: summary.won, icon: Trophy, color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { label: 'Pipeline Value', value: formatLakhsINR(summary.pipelineValue), icon: TrendingUp, color: 'text-[#5B4DB7]', bg: 'bg-purple-50', isString: true },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Department & Team Performance Summary
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated operational velocity for {selectedTeam === 'All Teams' ? 'all sales & presales units' : selectedTeam}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Avg Achievement:</span>
          <span className="font-bold font-mono text-emerald-700">{summary.avgAchievementRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 truncate">
                  {m.label}
                </span>
                <div className={`w-5 h-5 rounded-md ${m.bg} ${m.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-900">
                {m.isString ? m.value : (m.value as number).toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
