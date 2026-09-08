import React from 'react';
import { CalendarCheck, UserX, CalendarOff, ClockAlert, Clock } from 'lucide-react';
import { Employee } from '../../types/employees';

interface AttendanceSummaryCardsProps {
  employees: Employee[];
  selectedFilter?: string;
  onSelectFilter?: (status: string) => void;
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  employees,
  selectedFilter,
  onSelectFilter,
}) => {
  const presentToday = employees.filter(
    (e) => e.todayAttendanceStatus === 'Present' || e.todayAttendanceStatus === 'Late'
  ).length;
  const absent = employees.filter((e) => e.todayAttendanceStatus === 'Absent').length;
  const onLeave = employees.filter((e) => e.todayAttendanceStatus === 'Leave').length;
  const late = employees.filter((e) => e.todayAttendanceStatus === 'Late').length;
  const currentlyWorking = employees.filter((e) => e.workStatus === 'Working').length;

  const cards = [
    {
      id: 'present',
      title: 'Present Today',
      value: presentToday,
      subtitle: 'Logged in team members',
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      filterKey: 'Present',
    },
    {
      id: 'absent',
      title: 'Absent',
      value: absent,
      subtitle: 'Unreported / missing',
      icon: UserX,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      filterKey: 'Absent',
    },
    {
      id: 'leave',
      title: 'On Leave',
      value: onLeave,
      subtitle: 'Approved time off',
      icon: CalendarOff,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      filterKey: 'Leave',
    },
    {
      id: 'late',
      title: 'Late Logins',
      value: late,
      subtitle: 'Arrived after 09:30 AM',
      icon: ClockAlert,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      filterKey: 'Late',
    },
    {
      id: 'working',
      title: 'Currently Working',
      value: currentlyWorking,
      subtitle: 'Live online sessions',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      filterKey: 'Working',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.filterKey;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter && onSelectFilter(card.filterKey)}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 group ${
              isSelected
                ? 'ring-2 ring-purple-500/50 border-purple-400 dark:border-purple-600 bg-purple-50/20 dark:bg-purple-950/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.bgColor} ${card.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-auto">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
                {card.value}
              </span>
            </div>

            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {card.subtitle}
            </div>
          </button>
        );
      })}
    </div>
  );
};
