import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Sliders,
  Building,
  Target,
  Filter,
  Kanban,
  MessageSquare,
  CalendarClock,
  Bell,
  Mail,
  Palette,
  ChevronRight,
  Shield,
  Menu,
} from 'lucide-react';

export type GeneralSettingsSection =
  | 'company'
  | 'crm'
  | 'leads'
  | 'pipeline'
  | 'communication'
  | 'followups'
  | 'notifications'
  | 'email'
  | 'appearance';

export type SettingsSectionTab = GeneralSettingsSection;

export const GENERAL_SECTIONS: {
  id: GeneralSettingsSection;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { id: 'company', label: 'Company', description: 'Organization profile & locale', icon: Building },
  { id: 'crm', label: 'CRM Preferences', description: 'Defaults for leads & deals', icon: Sliders },
  { id: 'leads', label: 'Lead Settings', description: 'Lead statuses & sources', icon: Filter },
  { id: 'pipeline', label: 'Pipeline Stages', description: 'Stages & win probabilities', icon: Kanban },
  { id: 'communication', label: 'Communication', description: 'Channels, senders & logs', icon: MessageSquare },
  { id: 'followups', label: 'Follow-ups', description: 'Reminders & auto-scheduling', icon: CalendarClock },
  { id: 'notifications', label: 'Notifications', description: 'In-app & email preferences', icon: Bell },
  { id: 'email', label: 'Email Configuration', description: 'SMTP server & signatures', icon: Mail },
  { id: 'appearance', label: 'Appearance', description: 'Theme & interface density', icon: Palette },
];

export interface SettingsLayoutProps {
  activeModule?: 'users-roles' | 'general';
  activeGeneralSection?: GeneralSettingsSection;
  activeTab?: SettingsSectionTab;
  onSelectGeneralSection?: (section: GeneralSettingsSection) => void;
  onTabChange?: (tab: SettingsSectionTab) => void;
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  activeModule = 'general',
  activeGeneralSection,
  activeTab,
  onSelectGeneralSection,
  onTabChange,
  children,
}) => {
  const currentSection = activeTab || activeGeneralSection || 'company';
  const handleSectionChange = onTabChange || onSelectGeneralSection;
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isGeneral = activeModule === 'general';

  return (
    <div className="space-y-4 pb-12">
      {/* Mobile Settings Selector (< 1024px) */}
      <div className="lg:hidden space-y-3">
        {/* Module Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate('/settings/users-roles')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeModule === 'users-roles'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Users & Roles
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings/general')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeModule === 'general'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            General Settings
          </button>
        </div>

        {/* Section Dropdown for General Settings on Mobile */}
        {isGeneral && handleSectionChange && (
          <div className="relative">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              Settings Section
            </label>
            <div className="relative">
              <select
                value={currentSection}
                onChange={(e) => handleSectionChange(e.target.value as GeneralSettingsSection)}
                className="w-full appearance-none px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-xs pr-9"
              >
                {GENERAL_SECTIONS.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.label} — {sec.description}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Container: Desktop Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Panel (Desktop >= 1024px) */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Settings
                </h2>
                <p className="text-[11px] text-slate-400">Enterprise Administration</p>
              </div>
            </div>
          </div>

          {/* Primary Modules Nav */}
          <div className="p-2 space-y-1">
            <NavLink
              to="/settings/users-roles"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeModule === 'users-roles'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Users & Roles</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </NavLink>

            <NavLink
              to="/settings/general"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeModule === 'general'
                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>General Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </NavLink>
          </div>

          {/* Secondary Subsections Navigation (if in General Settings) */}
          {isGeneral && handleSectionChange && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 pb-3">
              <span className="block px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Configuration Sections
              </span>
              <div className="space-y-0.5 mt-1">
                {GENERAL_SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isSelected = currentSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleSectionChange(sec.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                        isSelected
                          ? 'bg-purple-600 text-white font-medium shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Notice Footer */}
          <div className="p-3 m-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Shield className="w-3 h-3 text-emerald-600" />
              Role-Based Security
            </div>
            <p className="text-[10px] leading-relaxed text-slate-400">
              Changes require Admin privileges and are recorded in the audit trail.
            </p>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 xl:col-span-9 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-6 lg:p-7 min-h-[600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
