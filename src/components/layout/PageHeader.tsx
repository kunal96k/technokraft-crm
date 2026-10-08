import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { useLiveISTClock } from '../../utils/dateUtils';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  showDateBadge?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  showDateBadge = false,
  className = '',
}) => {
  const { fullDateString, timeString } = useLiveISTClock();

  return (
    <div
      id="crm-page-header"
      className={`mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <Breadcrumb customItems={breadcrumbs} className="mb-1" />
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-center">
        {showDateBadge && (
          <div className="hidden md:flex flex-col text-right pr-2 select-none">
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
              <span>{fullDateString}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live IST" />
              <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-100 tracking-tight">
                {timeString}
              </span>
              <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1 py-0.2 rounded border border-purple-200/60 dark:border-purple-800/60">
                IST
              </span>
            </div>
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

