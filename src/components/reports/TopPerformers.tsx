import React from 'react';
import { Trophy } from 'lucide-react';
import { TopPerformer, EmployeePerformanceRecord } from '../../types/reports';
import { formatLakhsINR } from '../../utils/currencyFormatters';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

interface TopPerformersProps {
  performers?: TopPerformer[];
  employees?: EmployeePerformanceRecord[];
  onSelectEmployeeName?: (name: string) => void;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({
  performers,
  employees,
  onSelectEmployeeName,
}) => {
  // If performers not passed directly, derive from employees
  const displayList: TopPerformer[] = React.useMemo(() => {
    if (performers && performers.length > 0) return performers;
    if (employees && employees.length > 0) {
      return [...employees]
        .sort((a, b) => (b.wonValue || 0) - (a.wonValue || 0))
        .slice(0, 5)
        .map((emp, idx) => ({
          id: emp.id,
          name: emp.name,
          avatar: emp.avatar,
          profilePhoto: emp.profilePhoto,
          role: emp.role,
          team: emp.team,
          wonRevenue: emp.wonValue,
          dealsWon: emp.won,
          conversionRate: emp.conversionRate,
          targetAchievementRate: emp.targetAchievementRate,
          rank: idx + 1,
          badge: idx === 0 ? 'Top Closer' : idx === 1 ? 'Velocity Leader' : 'High Volume',
        }));
    }
    return [];
  }, [performers, employees]);

  if (displayList.length === 0) {
    return null;
  }

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
        {displayList.map((rep) => {
          const medalBg =
            rep.rank === 1
              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              : rep.rank === 2
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-400 border-amber-200 dark:border-amber-800';

          return (
            <div
              key={rep.name || rep.id}
              onClick={() => onSelectEmployeeName && onSelectEmployeeName(rep.name)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold font-mono shrink-0 ${medalBg}`}
                >
                  {rep.rank}
                </div>
                <EmployeeAvatar
                  name={rep.name}
                  avatar={rep.avatar}
                  profilePhoto={rep.profilePhoto}
                  size="sm"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#5B4DB7] dark:hover:text-purple-300">
                    {rep.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {rep.role} • {rep.dealsWon} deals ({formatLakhsINR(rep.wonRevenue)})
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {rep.targetAchievementRate}% Target
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">{rep.badge || 'On Track'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

