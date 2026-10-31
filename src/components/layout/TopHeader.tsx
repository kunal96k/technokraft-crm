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
  Download,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Zap,
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

          {/* TechnoKraft CRM Mobile App Download Button */}
          <button
            type="button"
            onClick={handleOpenTechnoKraftApps}
            aria-label="Download TechnoKraftservices CRM App"
            title="Download TechnoKraftservices CRM Mobile App (APK)"
            className="flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
          >
            <Smartphone className="w-5 h-5 text-[#5B4DB7] dark:text-purple-400" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          {/* Subtle Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* User Profile Dropdown */}
          <UserDropdown user={user} onRoleChange={onRoleChange} />
        </div>
      </header>

      {/* Interactive Modal: Apps / Mobile APK or Team Messages */}
      {comingSoonModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setComingSoonModal(null)}
        >
          {comingSoonModal === 'apps' ? (
            /* TechnoKraftservices CRM Mobile App Download Modal */
            <div
              className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with App Logo + Title + Badges + Close */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border border-purple-200 dark:border-purple-800 shadow-md flex items-center justify-center shrink-0">
                    <img
                      src="/app_logo/image.png"
                      alt="TechnoKraftservices CRM Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Official Android APK
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300">
                        v1.0.0
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mt-1">
                      TechnoKraftservices CRM
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      com.technokraftservices.crm
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setComingSoonModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* App Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Take your CRM everywhere. Seamlessly manage client relationships, sales leads, pipeline deals, project tasks, and communications on the go with real-time cloud synchronization.
              </p>

              {/* Compatibility & Specs Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Compatibility
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Android 7.0 - 16+
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    APK Size
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    ~5.1 MB
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-2.5 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Server Sync
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    Live Cloud CRM
                  </span>
                </div>
              </div>

              {/* Integrated CRM Modules & Features */}
              <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3 space-y-2 text-xs">
                <span className="font-bold text-[#5B4DB7] dark:text-purple-300 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Included CRM Modules &amp; Capabilities:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Leads Management &amp; Bulk Import</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Opportunities &amp; Kanban Pipeline</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>WhatsApp, Calls &amp; Email Hub</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Follow-ups, Tasks &amp; Meetings</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Proposals &amp; PDF Export</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Attendance &amp; Employee Directory</span>
                  </li>
                </ul>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <a
                  href="/TechnoKraftservices-CRM.apk"
                  download="TechnoKraftservices-CRM.apk"
                  onClick={() => {
                    try {
                      toast.success('TechnoKraftservices CRM APK download started! Check your downloads.', 'Download Started');
                    } catch { }
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#5B4DB7] to-[#7C3AED] hover:from-[#4E41A2] hover:to-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer text-center no-underline"
                >
                  <Download className="w-4 h-4 animate-bounce" />
                  <span>Download APK (5.1 MB)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setComingSoonModal(null)}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Team Messages Coming Soon Modal */
            <div
              className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Icon + Close */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-6 h-6 stroke-[2]" />
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
                  Team Messages
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We are building real-time team messaging to let you chat 1-on-1, create project discussion channels, mention colleagues on tasks, and share files seamlessly.
                </p>
              </div>

              {/* Feature Highlights Preview */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                  What to expect:
                </span>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                    <span>Direct 1-on-1 chats &amp; team channels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                    <span>Real-time notifications &amp; typing indicators</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B4DB7]" />
                    <span>Direct integration with CRM leads &amp; project tasks</span>
                  </li>
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
          )}
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

