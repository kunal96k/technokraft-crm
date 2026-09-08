import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { MOCK_TOP_PERFORMERS, formatLakhsINR } from '../../data/mockReports';

interface TopPerformersProps {
  onSelectEmployeeName?: (name: string) => void;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({ onSelectEmployeeName }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Performers</h3>
            <p className="text-[11px] text-slate-500">Highest quota pacing for current period</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400">Pacing Leaderboard</span>
      </div>

      <div className="space-y-2.5">
        {MOCK_TOP_PERFORMERS.map((rep) => {
          const medalBg =
            rep.rank === 1
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : rep.rank === 2
              ? 'bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-amber-50 text-amber-900 border-amber-200';

          return (
            <div
              key={rep.name}
              onClick={() => onSelectEmployeeName && onSelectEmployeeName(rep.name)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0 ${medalBg}`}
                >
                  {rep.rank}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 hover:text-[#5B4DB7]">
                    {rep.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {rep.role} • {rep.wonDeals} deals ({formatLakhsINR(rep.revenue)})
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-emerald-700">
                  {rep.achievementRate}% Target
                </div>
                <div className="text-[10px] text-slate-400">On Track</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
