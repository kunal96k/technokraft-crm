import React from 'react';
import {
  Users,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Trophy,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { EmployeePerformanceRecord } from '../../types/reports';

interface PerformanceKpiCardsProps {
  employees: EmployeePerformanceRecord[];
  selectedEmployeeName: string;
}

export const PerformanceKpiCards: React.FC<PerformanceKpiCardsProps> = ({
  employees,
  selectedEmployeeName,
}) => {
  const filtered =
    selectedEmployeeName === 'All Employees'
      ? employees
      : employees.filter((e) => e.name === selectedEmployeeName);

  const totalAssigned = filtered.reduce((acc, e) => acc + e.leadsAssigned, 0);
  const totalContacted = filtered.reduce((acc, e) => acc + e.leadsContacted, 0);
  const totalFollowUps = filtered.reduce((acc, e) => acc + e.followUps, 0);
  const totalQualified = filtered.reduce((acc, e) => acc + e.qualified, 0);
  const totalProposals = filtered.reduce((acc, e) => acc + e.proposals, 0);
  const totalWon = filtered.reduce((acc, e) => acc + e.won, 0);

  const contactedRate = totalAssigned > 0 ? Math.round((totalContacted / totalAssigned) * 100) : 0;
  const qualifiedRate = totalContacted > 0 ? Math.round((totalQualified / totalContacted) * 100) : 0;
  const proposalRate = totalQualified > 0 ? Math.round((totalProposals / totalQualified) * 100) : 0;
  const winRate = totalAssigned > 0 ? ((totalWon / totalAssigned) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      id: 'kpi-assigned',
      label: 'Leads Assigned',
      value: totalAssigned,
      subtext: `${filtered.length} reps assigned`,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      id: 'kpi-contacted',
      label: 'Leads Contacted',
      value: totalContacted,
      subtext: `${contactedRate}% contact rate`,
      icon: PhoneCall,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      id: 'kpi-followups',
      label: 'Follow-ups Completed',
      value: totalFollowUps,
      subtext: `${totalFollowUps} logged actions`,
      icon: CalendarCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      id: 'kpi-qualified',
      label: 'Qualified Leads',
      value: totalQualified,
      subtext: `${qualifiedRate}% qual. rate`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      id: 'kpi-proposals',
      label: 'Proposals Sent',
      value: totalProposals,
      subtext: `${proposalRate}% quote rate`,
      icon: FileText,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      id: 'kpi-won',
      label: 'Won Deals',
      value: totalWon,
      subtext: `${winRate}% conversion`,
      icon: Trophy,
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center shrink-0`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {card.value.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-1">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
