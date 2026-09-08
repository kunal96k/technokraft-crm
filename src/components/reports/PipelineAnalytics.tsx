import React from 'react';
import { GitCommit, TrendingUp, DollarSign } from 'lucide-react';
import { PipelineStageStat } from '../../types/reports';
import { formatLakhsINR } from '../../data/mockReports';

interface PipelineAnalyticsProps {
  stages: PipelineStageStat[];
}

export const PipelineAnalytics: React.FC<PipelineAnalyticsProps> = ({ stages }) => {
  const totalPipeline = stages.reduce((acc, s) => acc + s.value, 0);
  const totalWeighted = stages.reduce((acc, s) => acc + s.weightedValue, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pipeline Stages & Probability Weighting</h3>
            <p className="text-[11px] text-slate-500">Gross pipeline value vs probability-adjusted forecast</p>
          </div>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            Total: <span className="font-bold font-mono text-slate-900">{formatLakhsINR(totalPipeline)}</span>
          </div>
          <div className="px-2.5 py-1 bg-purple-50 rounded-lg text-[#5B4DB7] font-semibold border border-purple-100">
            Weighted: <span className="font-bold font-mono">{formatLakhsINR(totalWeighted)}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="py-2.5 px-3">Opportunity Stage</th>
              <th className="py-2.5 px-3 text-right">Deals</th>
              <th className="py-2.5 px-3 text-right">Stage Value</th>
              <th className="py-2.5 px-3 text-center">Win Probability</th>
              <th className="py-2.5 px-3 text-right font-bold text-[#5B4DB7]">Weighted Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {stages.map((stg) => (
              <tr key={stg.stage} className="hover:bg-slate-50/70">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stg.color }}
                    />
                    <span>{stg.stage}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700">{stg.count}</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                  {formatLakhsINR(stg.value)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700 font-semibold text-[11px]">
                    {stg.probability}%
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#5B4DB7]">
                  {formatLakhsINR(stg.weightedValue)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200">
            <tr>
              <td className="py-2.5 px-3 text-slate-900">Total Active Pipeline</td>
              <td className="py-2.5 px-3 text-right font-mono">
                {stages.reduce((acc, s) => acc + s.count, 0)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                {formatLakhsINR(totalPipeline)}
              </td>
              <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                {(
                  (totalWeighted / Math.max(totalPipeline, 1)) *
                  100
                ).toFixed(0)}
                % avg
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-[#5B4DB7]">
                {formatLakhsINR(totalWeighted)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
