import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { MOCK_TOP_PERFORMERS, formatLakhsINR } from '../../data/mockReports';

interface TopPerformersProps {
  onSelectEmployeeName?: (name: string) => void;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({ onSelectEmployeeName }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Performers</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Highest quota pacing for current period</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Pacing Leaderboard</span>
      </div>

      <div className="space-y-2.5">
        {MOCK_TOP_PERFORMERS.map((rep) => {
          const medalBg =
            rep.rank === 1
              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : rep.rank === 2
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-400 border-amber-200 dark:border-amber-800';

          return (
            <div
              key={rep.name}
              onClick={() => onSelectEmployeeName && onSelectEmployeeName(rep.name)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0 ${medalBg}`}
                >
                  {rep.rank}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-300">
                    {rep.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {rep.role} • {rep.wonDeals} deals ({formatLakhsINR(rep.revenue)})
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {rep.achievementRate}% Target
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">On Track</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
