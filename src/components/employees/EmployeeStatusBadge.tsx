import React from 'react';
import {
  EmployeeStatus,
  AttendanceStatus,
  WorkStatus,
  TargetMetricStatus,
} from '../../types/employees';

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus | string;
  size?: 'sm' | 'md';
}

export const EmployeeStatusBadge: React.FC<EmployeeStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let colorClasses =
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case 'Active':
      colorClasses =
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
      dotColor = 'bg-emerald-500';
      break;
    case 'Inactive':
      colorClasses =
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700';
      dotColor = 'bg-slate-400';
      break;
    case 'On Leave':
      colorClasses =
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
      dotColor = 'bg-amber-500';
      break;
    case 'Suspended':
      colorClasses =
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
      dotColor = 'bg-rose-500';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${colorClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
};

export const AttendanceStatusBadge: React.FC<{
  status: AttendanceStatus | string;
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  let colorClasses =
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  switch (status) {
    case 'Present':
      colorClasses =
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
      break;
    case 'Late':
      colorClasses =
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
      break;
    case 'Half Day':
      colorClasses =
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60';
      break;
    case 'Leave':
      colorClasses =
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60';
      break;
    case 'Absent':
      colorClasses =
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60';
      break;
    case 'Holiday':
      colorClasses =
        'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      break;
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${colorClasses} whitespace-nowrap`}
    >
      {status}
    </span>
  );
};

export const WorkStatusBadge: React.FC<{
  status: WorkStatus | string;
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  let colorClasses =
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let pulse = false;

  switch (status) {
    case 'Working':
      colorClasses =
        'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40';
      pulse = true;
      break;
    case 'Break':
      colorClasses =
        'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40';
      break;
    case 'Logged Out':
      colorClasses =
        'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
      break;
    case 'Offline':
      colorClasses =
        'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
      break;
    case 'On Leave':
      colorClasses =
        'bg-purple-500/10 text-purple-700 border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/40';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${colorClasses} whitespace-nowrap`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === 'Working'
              ? 'bg-emerald-500'
              : status === 'Break'
              ? 'bg-amber-500'
              : status === 'On Leave'
              ? 'bg-purple-500'
              : 'bg-slate-400'
          }`}
        />
      </span>
      {status}
    </span>
  );
};

export const TargetStatusBadge: React.FC<{
  status: TargetMetricStatus;
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  let colorClasses =
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  switch (status) {
    case 'Achieved':
      colorClasses =
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
      break;
    case 'On Track':
      colorClasses =
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60';
      break;
    case 'At Risk':
      colorClasses =
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
      break;
    case 'Below Target':
      colorClasses =
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
      break;
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${colorClasses} whitespace-nowrap`}
    >
      {status}
    </span>
  );
};
