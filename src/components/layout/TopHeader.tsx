import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  MessageSquare,
  Grid,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { QuickAddDropdown } from './QuickAddDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { UserDropdown } from './UserDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';
import { UserProfile, UserRole } from '../../types/navigation';
import { BrandLogo } from '../common/BrandLogo';
import { useTheme } from '../../context/ThemeContext';

interface TopHeaderProps {
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isSidebarCollapsed: boolean;
  user: UserProfile;
  onRoleChange?: (newRole: UserRole) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  isSidebarCollapsed,
  user,
  onRoleChange,
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        id="crm-top-header"
        className="sticky top-0 z-20 h-16 w-full bg-white dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-4 lg:px-6 flex items-center justify-between shadow-2xs select-none transition-colors duration-200"
      >
        {/* Left Section: Sidebar Toggle + Brand (Mobile) + Global Search */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl min-w-0">
          {/* Mobile Sidebar Toggle (<1024px) */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
            className="lg:hidden p-1.5 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Toggle (>=1024px) */}
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Brand Logo snippet shown only on small screens */}
          <div className="lg:hidden flex items-center mr-1">
            <BrandLogo collapsed={true} theme={resolvedTheme === 'Dark' ? 'dark' : 'light'} />
          </div>

          {/* Global Search Input (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center flex-1 max-w-md lg:max-w-lg relative">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search CRM records"
              className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-400 dark:text-slate-400 text-left transition-colors group focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 h-9 cursor-pointer"
            >
              <span className="flex items-center gap-2.5 truncate">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 flex-shrink-0" />
                <span className="truncate text-slate-500 dark:text-slate-400">
                  Search leads, companies, contacts, emails...
                </span>
              </span>
              <kbd className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs font-mono ml-2 flex-shrink-0">
                Ctrl + K
              </kbd>
            </button>
          </div>
        </div>

        {/* Right Section: Quick Add + Actions + Notifications + Profile */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Mobile Search Button (triggers search modal) */}
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            aria-label="Open search"
            className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Add Dropdown */}
          <div className="mr-0.5 sm:mr-1">
            <QuickAddDropdown />
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Direct Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'Dark' ? 'Light' : 'Dark')}
            aria-label={resolvedTheme === 'Dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={resolvedTheme === 'Dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {resolvedTheme === 'Dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Communication / Messages Icon (Desktop & Tablet) */}
          <button
            type="button"
            aria-label="Direct Messages"
            title="Team Messages"
            className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Apps Menu Grid Icon (Desktop only) */}
          <button
            type="button"
            aria-label="Workspace Modules & Apps"
            title="TechnoKraft Apps"
            className="hidden md:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Subtle Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* User Profile Dropdown */}
          <UserDropdown user={user} onRoleChange={onRoleChange} />
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};

