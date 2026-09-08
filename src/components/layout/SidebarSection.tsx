import React from 'react';

interface SidebarSectionProps {
  title?: string;
  collapsed?: boolean;
  theme?: 'dark' | 'light';
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  collapsed = false,
  theme = 'dark',
  children,
}) => {
  return (
    <div className="pt-3 pb-1 first:pt-1">
      {title && !collapsed && (
        <div className="px-3 mb-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 select-none">
            {title}
          </span>
        </div>
      )}
      {title && collapsed && (
        <div className="w-full flex justify-center my-2">
          <div className="w-5 h-[1px] bg-slate-200 dark:bg-slate-800/80" />
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};
