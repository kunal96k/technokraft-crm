import React from 'react';
import { Users, UserCheck, Clock, ShieldCheck } from 'lucide-react';
import { CrmUser } from '../../../types/settings';

interface UserSummaryCardsProps {
  users: CrmUser[];
  selectedStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
}

export const UserSummaryCards: React.FC<UserSummaryCardsProps> = ({
  users,
  selectedStatusFilter,
  onSelectStatusFilter,
}) => {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const pendingUsers = users.filter((u) => u.status === 'Pending Invitation').length;
  const adminUsers = users.filter((u) => u.role === 'Admin' || u.role === 'Super Admin').length;

  const cards = [
    {
      id: 'all',
      title: 'Total CRM Users',
      count: totalUsers,
      subtext: 'Configured accounts',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200/60 dark:border-purple-800/40',
    },
    {
      id: 'Active',
      title: 'Active Users',
      count: activeUsers,
      subtext: 'Can access CRM',
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200/60 dark:border-emerald-800/40',
    },
    {
      id: 'Pending Invitation',
      title: 'Pending Invitations',
      count: pendingUsers,
      subtext: 'Awaiting onboarding',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200/60 dark:border-amber-800/40',
    },
    {
      id: 'Admin',
      title: 'Admin Users',
      count: adminUsers,
      subtext: 'Full administrative rights',
      icon: ShieldCheck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200/60 dark:border-blue-800/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedStatusFilter === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectStatusFilter?.(isSelected ? '' : c.id)}
            className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all ${
              isSelected
                ? 'ring-2 ring-purple-600 shadow-sm bg-white dark:bg-slate-900 border-purple-500'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
            } ${onSelectStatusFilter ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {c.title}
              </span>
              <div className={`w-7 h-7 rounded-lg ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {c.count}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {c.subtext}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
