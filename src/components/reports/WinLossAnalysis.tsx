import React from 'react';
import { PieChart, XCircle, CheckCircle, Clock } from 'lucide-react';
import { WinLossStat } from '../../types/reports';

interface WinLossAnalysisProps {
  data: WinLossStat;
}

export const WinLossAnalysis: React.FC<WinLossAnalysisProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Win / Loss Velocity & Root Causes</h3>
            <p className="text-[11px] text-slate-500">Commercial conversion rates and categorized churn reasons</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400">Decision Outcome</span>
      </div>

      {/* High-level Status Split */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
          <div className="text-[10px] font-bold uppercase text-emerald-800">Won Deals</div>
          <div className="text-lg font-bold font-mono text-emerald-700">{data.wonCount}</div>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5">
          <div className="text-[10px] font-bold uppercase text-rose-800">Lost Deals</div>
          <div className="text-lg font-bold font-mono text-rose-700">{data.lostCount}</div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
          <div className="text-[10px] font-bold uppercase text-blue-800">Open Opps</div>
          <div className="text-lg font-bold font-mono text-blue-700">{data.openCount}</div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5">
          <div className="text-[10px] font-bold uppercase text-purple-800">Win Rate</div>
          <div className="text-lg font-bold font-mono text-[#5B4DB7]">{data.winRate}%</div>
        </div>
      </div>

      {/* Loss Reasons Breakdown Table and Visual Bars */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold text-slate-700">Lost Opportunity Root Causes:</div>
        <div className="space-y-2">
          {data.lossReasons.map((lr) => (
            <div key={lr.reason} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">{lr.reason}</span>
                <span className="font-mono font-bold text-slate-900">
                  {lr.count} ({lr.percentage}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${lr.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
