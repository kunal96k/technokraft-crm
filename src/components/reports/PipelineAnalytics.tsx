import React from 'react';
import { TrendingUp } from 'lucide-react';
import { PipelineStageStat } from '../../types/reports';
import { formatLakhsINR } from '../../utils/currencyFormatters';

interface PipelineAnalyticsProps {
  stages: PipelineStageStat[];
}

export const PipelineAnalytics: React.FC<PipelineAnalyticsProps> = ({ stages }) => {
  const totalPipeline = (stages || []).reduce((acc, s) => acc + s.value, 0);
  const totalWeighted = (stages || []).reduce((acc, s) => acc + s.weightedValue, 0);
  const totalDeals = (stages || []).reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pipeline Stages & Probability Weighting
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gross pipeline value vs probability-adjusted forecast
              </p>
            </div>
          </div>

          {/* Summary Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
              Total: <span className="font-bold font-mono text-slate-900 dark:text-white">{formatLakhsINR(totalPipeline)}</span>
            </div>
            <div className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 rounded-lg text-[#5B4DB7] dark:text-purple-300 font-semibold border border-purple-100 dark:border-purple-800">
              Weighted: <span className="font-bold font-mono">{formatLakhsINR(totalWeighted)}</span>
            </div>
          </div>
        </div>

        {/* Mobile View: Responsive Card Layout (block md:hidden) */}
        <div className="block md:hidden space-y-2.5 pt-3">
          {(stages || []).map((stg) => (
            <div
              key={stg.stage}
              className="bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: stg.color }}
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {stg.stage}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {stg.probability}% win prob.
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {stg.count} deals
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-slate-600 dark:text-slate-400">
                  Gross: <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatLakhsINR(stg.value)}</span>
                </div>
                <div className="text-[#5B4DB7] dark:text-purple-300 font-semibold">
                  Weighted: <span className="font-mono font-bold">{formatLakhsINR(stg.weightedValue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Sortable/Structured Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto pt-2">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Opportunity Stage</th>
                <th className="py-2.5 px-3 text-right">Deals</th>
                <th className="py-2.5 px-3 text-right">Stage Value</th>
                <th className="py-2.5 px-3 text-center">Win Probability</th>
                <th className="py-2.5 px-3 text-right font-bold text-[#5B4DB7] dark:text-purple-300">
                  Weighted Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {(stages || []).map((stg) => (
                <tr
                  key={stg.stage}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stg.color }}
                      />
                      <span>{stg.stage}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {stg.count}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white">
                    {formatLakhsINR(stg.value)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      {stg.probability}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#5B4DB7] dark:text-purple-300">
                    {formatLakhsINR(stg.weightedValue)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 dark:bg-slate-950/60 font-bold border-t border-slate-200 dark:border-slate-800">
              <tr>
                <td className="py-2.5 px-3 text-slate-900 dark:text-white">Total Active Pipeline</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                  {totalDeals}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white">
                  {formatLakhsINR(totalPipeline)}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-500 dark:text-slate-400">
                  {((totalWeighted / Math.max(totalPipeline, 1)) * 100).toFixed(0)}% avg
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-[#5B4DB7] dark:text-purple-300">
                  {formatLakhsINR(totalWeighted)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Active deals: <strong className="font-mono text-slate-700 dark:text-slate-300">{totalDeals}</strong></span>
        <span>Forecast realization: <strong className="font-mono text-[#5B4DB7] dark:text-purple-300">{formatLakhsINR(totalWeighted)}</strong></span>
      </div>
    </div>
  );
};
