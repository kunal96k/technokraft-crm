import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavigationItem } from '../../types/navigation';

interface SidebarItemProps {
  item: NavigationItem;
  collapsed?: boolean;
  onNavigate?: () => void;
  theme?: 'dark' | 'light';
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  collapsed = false,
  onNavigate,
  theme = 'dark',
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasChildren = item.children && item.children.length > 0;

  // Check if current route matches item path or any child path
  const isDirectActive = item.path ? location.pathname === item.path : false;
  const isChildActive = hasChildren
    ? item.children!.some((child) => location.pathname === child.path)
    : false;
  const isActive = isDirectActive || isChildActive;

  // Auto-expand section if a child is active initially
  useEffect(() => {
    if (isChildActive && !collapsed) {
      setIsOpen(true);
    }
  }, [isChildActive, collapsed]);

  const toggleOpen = () => {
    if (!collapsed) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleMouseEnter = () => {
    if (collapsed) {
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 100);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(false);
  };

  const isDark = theme === 'dark';
  const IconComponent = item.icon;

  // Render badge with theme-adaptive styling
  const renderBadge = (active: boolean) => {
    if (!item.badge) return null;

    if (active) {
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white tracking-tight">
          {item.badge}
        </span>
      );
    }

    if (item.badgeColor === 'amber') {
      return (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isDark
              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
          }`}
        >
          {item.badge}
        </span>
      );
    }

    if (item.badgeColor === 'blue') {
      return (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isDark
              ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
              : 'bg-blue-50 text-blue-700 border border-blue-200/80'
          }`}
        >
          {item.badge}
        </span>
      );
    }

    return (
      <span
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
          isDark
            ? 'bg-slate-800/90 text-slate-300 border border-slate-700/60'
            : 'bg-slate-100 text-slate-600 border border-slate-200/80'
        }`}
      >
        {item.badge}
      </span>
    );
  };

  // 1. If item has no children, render direct link
  if (!hasChildren && item.path) {
    return (
      <div
        className="relative my-0.5"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <NavLink
          to={item.path}
          onClick={onNavigate}
          aria-label={item.title}
          className={({ isActive: linkActive }) =>
            `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 min-h-[40px] select-none ${
              collapsed ? 'justify-center px-2' : ''
            } ${
              linkActive
                ? 'bg-[#5B4DB7] text-white font-semibold shadow-xs shadow-[#5B4DB7]/20'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`
          }
        >
          <IconComponent
            className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
              isDirectActive
                ? 'text-white'
                : isDark
                ? 'text-slate-400 group-hover:text-slate-200'
                : 'text-slate-500 group-hover:text-slate-800'
            }`}
          />
          {!collapsed && (
            <span className="truncate flex-1 tracking-tight">{item.title}</span>
          )}
          {!collapsed && renderBadge(isDirectActive)}
        </NavLink>

        {/* Floating Tooltip when Collapsed */}
        {collapsed && showTooltip && (
          <div
            role="tooltip"
            className={`absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3 py-1.5 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-2 ${
              isDark
                ? 'bg-slate-800 text-white border border-slate-700/80'
                : 'bg-slate-900 text-white border border-slate-800'
            }`}
          >
            <span>{item.title}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 bg-[#5B4DB7] rounded text-[10px] text-white font-medium">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. Parent item with expandable sub-items
  return (
    <div
      className="relative my-0.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label={item.title}
        className={`w-full group flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 min-h-[40px] select-none ${
          collapsed ? 'justify-center px-2' : ''
        } ${
          isChildActive && !isOpen
            ? isDark
              ? 'bg-slate-800/80 text-white font-semibold'
              : 'bg-slate-100 text-slate-900 font-semibold'
            : isDark
            ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        <IconComponent
          className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
            isChildActive
              ? isDark
                ? 'text-purple-400'
                : 'text-[#5B4DB7]'
              : isDark
              ? 'text-slate-400 group-hover:text-slate-200'
              : 'text-slate-500 group-hover:text-slate-800'
          }`}
        />
        {!collapsed && (
          <>
            <span className="truncate flex-1 text-left tracking-tight">
              {item.title}
            </span>
            {renderBadge(isChildActive && !isOpen)}
            {isOpen ? (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
            ) : (
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
            )}
          </>
        )}
      </button>

      {/* Expanded Sub-items Tree */}
      {!collapsed && isOpen && hasChildren && (
        <div
          className={`mt-1 ml-4 pl-3.5 space-y-0.5 py-1 border-l ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          {item.children!.map((child) => {
            const isSubActive = location.pathname === child.path;
            return (
              <NavLink
                key={child.id}
                to={child.path}
                onClick={onNavigate}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-150 min-h-[34px] select-none ${
                  isSubActive
                    ? isDark
                      ? 'bg-[#5B4DB7]/20 text-purple-300 font-semibold'
                      : 'bg-[#5B4DB7]/10 text-[#5B4DB7] font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
                      isSubActive
                        ? isDark
                          ? 'bg-purple-400 ring-2 ring-purple-400/30'
                          : 'bg-[#5B4DB7] ring-2 ring-[#5B4DB7]/20'
                        : isDark
                        ? 'bg-slate-600 group-hover:bg-slate-400'
                        : 'bg-slate-300 group-hover:bg-slate-500'
                    }`}
                  />
                  <span className="truncate">{child.title}</span>
                </span>
                {child.badge && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                      isDark
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {child.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Floating Popover Menu when Collapsed */}
      {collapsed && showTooltip && (
        <div
          role="menu"
          className={`absolute left-full top-0 ml-3 z-50 w-52 py-1 rounded-xl shadow-2xl overflow-hidden transition-all duration-150 ${
            isDark
              ? 'bg-[#0F172A] text-slate-100 border border-slate-700/80 shadow-slate-950/60'
              : 'bg-white text-slate-800 border border-slate-200 shadow-xl'
          }`}
        >
          <div
            className={`px-3.5 py-2 flex items-center justify-between border-b ${
              isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/80'
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {item.title}
            </span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#5B4DB7] text-white rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </div>
          <div className="p-1.5 space-y-0.5">
            {item.children!.map((child) => {
              const isSubActive = location.pathname === child.path;
              return (
                <NavLink
                  key={child.id}
                  to={child.path}
                  onClick={() => {
                    setShowTooltip(false);
                    if (onNavigate) onNavigate();
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSubActive
                      ? 'bg-[#5B4DB7] text-white font-semibold'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{child.title}</span>
                  {child.badge && (
                    <span
                      className={`text-[10px] ${
                        isSubActive ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {child.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
