import React from 'react';
import { Users, UserCheck, CalendarCheck, Clock, UserX } from 'lucide-react';
import { Employee } from '../../types/employees';

interface EmployeeSummaryCardsProps {
  employees: Employee[];
  activeFilter?: string;
  onFilterSelect?: (filter: string) => void;
}

export const EmployeeSummaryCards: React.FC<EmployeeSummaryCardsProps> = ({
  employees,
  activeFilter,
  onFilterSelect,
}) => {
  const total = employees.length;
  const active = employees.filter((e) => e.status === 'Active').length;
  const presentToday = employees.filter(
    (e) => e.todayAttendanceStatus === 'Present' || e.todayAttendanceStatus === 'Late'
  ).length;
  const currentlyWorking = employees.filter((e) => e.workStatus === 'Working').length;
  const inactive = employees.filter((e) => e.status === 'Inactive').length;

  const cards = [
    {
      id: 'all',
      title: 'Total Employees',
      value: total,
      subtitle: 'TechnoKraft roster',
      icon: Users,
      color: 'text-slate-700 dark:text-slate-200',
      bgColor: 'bg-slate-100 dark:bg-slate-800/80',
      badgeColor: 'text-slate-600 dark:text-slate-400',
      filterKey: 'all',
    },
    {
      id: 'active',
      title: 'Active Employees',
      value: active,
      subtitle: `${Math.round((active / (total || 1)) * 100)}% active force`,
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeColor: 'text-emerald-700 dark:text-emerald-400',
      filterKey: 'Active',
    },
    {
      id: 'present',
      title: 'Present Today',
      value: presentToday,
      subtitle: 'Logged in today',
      icon: CalendarCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      badgeColor: 'text-blue-700 dark:text-blue-400',
      filterKey: 'Present',
    },
    {
      id: 'working',
      title: 'Currently Working',
      value: currentlyWorking,
      subtitle: 'Active real-time sessions',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      badgeColor: 'text-indigo-700 dark:text-indigo-400',
      filterKey: 'Working',
    },
    {
      id: 'inactive',
      title: 'Inactive',
      value: inactive,
      subtitle: 'Preserved CRM records',
      icon: UserX,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      badgeColor: 'text-rose-700 dark:text-rose-400',
      filterKey: 'Inactive',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.filterKey;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterSelect && onFilterSelect(card.filterKey)}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden group ${
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

            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="truncate">{card.subtitle}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
