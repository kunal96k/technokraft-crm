import React from 'react';
import { XCircle, CheckCircle, Clock } from 'lucide-react';
import { WinLossStat } from '../../types/reports';

interface WinLossAnalysisProps {
  data: WinLossStat;
}

export const WinLossAnalysis: React.FC<WinLossAnalysisProps> = ({ data }) => {
  const totalDecisions = (data?.wonCount || 0) + (data?.lostCount || 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Win / Loss Velocity & Root Causes
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Commercial conversion rates and categorized churn reasons
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-mono self-start sm:self-auto">
            {totalDecisions} Closed Outcomes
          </span>
        </div>

        {/* High-level Status Split */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              Won Deals
            </div>
            <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {data.wonCount}
            </div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300">
              Lost Deals
            </div>
            <div className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
              {data.lostCount}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300">
              Open Opps
            </div>
            <div className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400">
              {data.openCount}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 rounded-lg p-2.5">
            <div className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300">
              Win Rate
            </div>
            <div className="text-lg font-bold font-mono text-[#5B4DB7] dark:text-purple-300">
              {data.winRate}%
            </div>
          </div>
        </div>

        {/* Loss Reasons Breakdown Table and Visual Bars */}
        <div className="space-y-2 pt-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Lost Opportunity Root Causes:
          </div>
          {!data.lossReasons || data.lossReasons.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              No lost deal root causes recorded for this period.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.lossReasons.map((lr) => (
                <div key={lr.reason} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {lr.reason}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {lr.count} ({lr.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(lr.percentage, 4))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Conversion efficiency: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{data.winRate}% win rate</strong></span>
        <span>Open opportunities: <strong className="font-mono text-blue-600 dark:text-blue-400">{data.openCount}</strong></span>
      </div>
    </div>
  );
};
