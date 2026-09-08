import React from 'react';
import { Filter, ArrowDown, ChevronRight, TrendingDown } from 'lucide-react';
import { EmployeeFunnel } from '../../types/reports';

interface ConversionFunnelProps {
  funnel: EmployeeFunnel;
  title?: string;
  subtitle?: string;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  funnel,
  title = 'Conversion Funnel Velocity',
  subtitle = 'Stage-by-stage pipeline conversion and drop-off analysis',
}) => {
  const stages = [
    { label: 'Assigned Leads', count: funnel.leads, color: 'bg-slate-700', text: 'text-slate-700' },
    { label: 'Contacted', count: funnel.contacted, color: 'bg-indigo-600', text: 'text-indigo-600' },
    { label: 'Interested', count: funnel.interested, color: 'bg-blue-600', text: 'text-blue-600' },
    { label: 'Qualified', count: funnel.qualified, color: 'bg-purple-600', text: 'text-purple-600' },
    { label: 'Proposal Sent', count: funnel.proposal, color: 'bg-amber-600', text: 'text-amber-600' },
    { label: 'Won Deals', count: funnel.won, color: 'bg-emerald-600', text: 'text-emerald-600' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 text-[#5B4DB7] flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400">
          Overall: {((funnel.won / Math.max(funnel.leads, 1)) * 100).toFixed(1)}% Conversion
        </span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const prevCount = idx > 0 ? stages[idx - 1].count : stage.count;
          const stageConversion = idx > 0 ? ((stage.count / Math.max(prevCount, 1)) * 100).toFixed(1) : '100.0';
          const dropOff = idx > 0 ? (100 - Number(stageConversion)).toFixed(1) : '0.0';
          const widthPercent = Math.max((stage.count / Math.max(stages[0].count, 1)) * 100, 8);

          return (
            <div key={stage.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{stage.label}</span>
                  {idx > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-[#5B4DB7] font-bold">
                      {stageConversion}% conv.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {idx > 0 && Number(dropOff) > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      -{dropOff}% drop
                    </span>
                  )}
                  <span className="font-bold font-mono text-slate-900 text-sm">
                    {stage.count.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Bar Funnel Tier */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${stage.color}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
