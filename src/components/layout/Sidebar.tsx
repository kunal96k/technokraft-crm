import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { NAVIGATION_CONFIG, canViewModule } from '../../config/navigation';
import { UserRole } from '../../types/navigation';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRole?: UserRole;
  className?: string;
  theme?: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  currentRole = 'Sales Manager' as UserRole,
  className = '',
  theme,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  // If theme prop is explicitly passed, use it; otherwise synchronize with global theme
  const activeTheme = theme || (resolvedTheme === 'Dark' ? 'dark' : 'light');
  const isDark = activeTheme === 'dark';

  return (
    <aside
      id="crm-desktop-sidebar"
      aria-label="Sidebar Navigation"
      className={`hidden lg:flex flex-col flex-shrink-0 select-none z-30 transition-all duration-200 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[252px]'
      } ${
        isDark
          ? 'bg-[#0B1120] text-slate-200 border-r border-slate-800/80'
          : 'bg-white text-slate-800 border-r border-slate-200/80'
      } ${className}`}
      style={{ height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Top Header inside Sidebar: Logo & Collapse Trigger */}
      <div
        className={`flex items-center h-16 px-3.5 border-b transition-colors ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        } ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        <BrandLogo collapsed={collapsed} theme={activeTheme} />
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When collapsed: a sleek expand trigger below header */}
      {collapsed && (
        <div
          className={`py-2 px-2 flex justify-center border-b ${
            isDark ? 'border-slate-800/40' : 'border-slate-100'
          }`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            title="Expand sidebar"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2.5 space-y-0.5">
        {NAVIGATION_CONFIG.map((section) => {
          // Filter items based on current role permissions
          const visibleItems = section.items.filter((item) =>
            canViewModule(item, currentRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarSection
              key={section.id}
              title={section.sectionTitle}
              collapsed={collapsed}
              theme={activeTheme}
            >
              {visibleItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  collapsed={collapsed}
                  theme={activeTheme}
                />
              ))}
            </SidebarSection>
          );
        })}
      </div>

      {/* Sidebar Footer Indicator */}
      <div
        className={`p-2.5 border-t transition-colors ${
          isDark ? 'border-slate-800/70 bg-slate-900/30' : 'border-slate-150 bg-slate-50/70'
        }`}
      >
        {!collapsed ? (
          <div
            className={`rounded-xl p-2.5 border transition-colors ${
              isDark
                ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                : 'bg-white border-slate-200/80 text-slate-700 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <div className="truncate">
                  <p className="text-xs font-semibold truncate leading-tight">
                    TechnoKraft
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                    {currentRole}
                  </p>
                </div>
              </div>

              {/* Quick theme toggle inside footer */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-slate-800 text-amber-400'
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-amber-400'
                  : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
