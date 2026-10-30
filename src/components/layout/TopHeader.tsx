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
  Sparkles,
  X,
} from 'lucide-react';
import { QuickAddDropdown } from './QuickAddDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { UserDropdown } from './UserDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';
import { UserProfile, UserRole } from '../../types/navigation';
import { BrandLogo } from '../common/BrandLogo';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

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
  const [comingSoonModal, setComingSoonModal] = useState<'messages' | 'apps' | null>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleOpenTeamMessages = () => {
    setComingSoonModal('messages');
    try {
      toast.info('Team Messages is coming soon! Real-time internal collaboration is under development.', 'Coming Soon...');
    } catch { }
  };

  const handleOpenTechnoKraftApps = () => {
    setComingSoonModal('apps');
    try {
      toast.info('TechnoKraft Apps launcher is coming soon! Ecosystem suite is under development.', 'Coming Soon...');
    } catch { }
  };

  // Close coming soon modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && comingSoonModal) {
        setComingSoonModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [comingSoonModal]);

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
            onClick={handleOpenTeamMessages}
            aria-label="Direct Messages"
            title="Team Messages (Coming Soon...)"
            className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Apps Menu Grid Icon (Desktop & Tablet) */}
          <button
            type="button"
            onClick={handleOpenTechnoKraftApps}
            aria-label="Workspace Modules & Apps"
            title="TechnoKraft Apps (Coming Soon...)"
            className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Subtle Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* User Profile Dropdown */}
          <UserDropdown user={user} onRoleChange={onRoleChange} />
        </div>
      </header>

      {/* Coming Soon Interactive Preview Modal */}
      {comingSoonModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setComingSoonModal(null)}
        >
          <div
            className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Icon + Close */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shadow-xs">
                {comingSoonModal === 'messages' ? (
                  <MessageSquare className="w-6 h-6 stroke-[2]" />
                ) : (
                  <Grid className="w-6 h-6 stroke-[2]" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setComingSoonModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300">
                  <Sparkles className="w-3 h-3" />
                  Coming Soon...
                </span>
                <span className="text-[11px] text-slate-400">• In Active Development</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {comingSoonModal === 'messages' ? 'Team Messages' : 'TechnoKraft Apps & Modules'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {comingSoonModal === 'messages'
                  ? 'We are building real-time team messaging to let you chat 1-on-1, create project discussion channels, mention colleagues on tasks, and share files seamlessly.'
                  : 'We are creating a unified application launcher so you can seamlessly access TechnoKraft HRMS, Accounts & Billing, Developer Git Hub, and Client Portals directly from your CRM.'}
              </p>
            </div>

            {/* Feature Highlights Preview */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                What to expect:
              </span>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                {comingSoonModal === 'messages' ? (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                      <span>Direct 1-on-1 chats & team channels</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                      <span>Real-time notifications & typing indicators</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                      <span>Direct integration with CRM leads & project tasks</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                      <span>HRMS & Biometric Attendance Tracker</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                      <span>Accounts, Invoicing & GST Billing Suite</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                      <span>Developer Git Hub & Deployment Monitor</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setComingSoonModal(null)}
                className="w-full sm:w-auto px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};

