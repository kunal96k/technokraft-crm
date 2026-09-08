import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ customItems, className = '' }) => {
  const location = useLocation();

  // If custom items are provided, use them; otherwise auto-generate from path
  const items: BreadcrumbItem[] = customItems || (() => {
    const pathSnippets = location.pathname.split('/').filter(Boolean);
    if (pathSnippets.length === 0 || (pathSnippets.length === 1 && pathSnippets[0] === 'dashboard')) {
      return [{ label: 'Dashboard', path: '/dashboard' }];
    }

    const breadcrumbs: BreadcrumbItem[] = [{ label: 'CRM', path: '/dashboard' }];
    let accumulatedPath = '';

    pathSnippets.forEach((snippet) => {
      accumulatedPath += `/${snippet}`;
      const formattedLabel = snippet
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      breadcrumbs.push({ label: formattedLabel, path: accumulatedPath });
    });

    return breadcrumbs;
  })();

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1 ${className}`}
    >
      <ol className="flex items-center space-x-1.5">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center text-slate-400 hover:text-[#5B4DB7] transition-colors"
            title="Dashboard"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.path || item.label}-${index}`} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              {isLast || !item.path ? (
                <span className="font-semibold text-slate-800 select-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-[#5B4DB7] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
