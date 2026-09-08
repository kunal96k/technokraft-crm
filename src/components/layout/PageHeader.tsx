import React from 'react';
import { Calendar } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

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
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Thursday, 4 September 2026</span>
            </div>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              12:15 PM
            </span>
          </div>
        )}

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
