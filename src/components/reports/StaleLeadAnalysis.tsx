import React from 'react';
import { Clock, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaleLeadStat } from '../../types/reports';

interface StaleLeadAnalysisProps {
  stats: StaleLeadStat[];
}

export const StaleLeadAnalysis: React.FC<StaleLeadAnalysisProps> = ({ stats }) => {
  const totalStale = stats.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stale Leads & Inactivity Risk</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Uncontacted accounts requiring immediate supervisor intervention</p>
          </div>
        </div>

        <Link
          to="/leads"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#5B4DB7] dark:text-purple-300 hover:text-[#4E41A2] bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
        >
          <span>View Leads</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((item) => {
          const badgeColor =
            item.duration === '14+ Days'
              ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
              : item.duration === '7+ Days'
              ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
              : 'border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300';

          const countColor =
            item.duration === '14+ Days'
              ? 'text-rose-700 dark:text-rose-400'
              : item.duration === '7+ Days'
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-blue-700 dark:text-blue-400';

          return (
            <div
              key={item.duration}
              className={`border rounded-xl p-3.5 flex flex-col justify-between ${badgeColor}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{item.duration} Inactive</span>
                  <AlertTriangle className="w-3.5 h-3.5 opacity-75" />
                </div>
                <div className={`text-2xl font-bold font-mono my-2 ${countColor}`}>
                  {item.count} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">leads</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {item.description}
                </p>
              </div>

              {/* Sample leads list */}
              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                {item.leadsSample.slice(0, 2).map((lead) => (
                  <div key={lead.leadCode} className="text-[10px] flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-semibold truncate max-w-[140px]">{lead.companyName}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{lead.daysInactive}d ago</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
