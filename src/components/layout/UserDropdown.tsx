import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Settings,
  Activity,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Check,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types/navigation';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface UserDropdownProps {
  user: UserProfile;
  onRoleChange?: (newRole: UserRole) => void;
}

const AVAILABLE_ROLES: UserRole[] = [
  'Super Admin',
  'Admin',
  'Sales Manager',
  'Sales Executive',
  'Business Analyst',
  'Technical Team',
  'Project Manager',
  'Employee',
];

export const UserDropdown: React.FC<UserDropdownProps> = ({ user, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRoleSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'Light', label: 'Light', icon: Sun },
    { mode: 'Dark', label: 'Dark', icon: Moon },
    { mode: 'System', label: 'System', icon: Laptop },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/40 select-none cursor-pointer"
      >
        {/* Avatar Circle with Initials 'MP' matching screenshot */}
        <div className="w-9 h-9 rounded-full bg-[#5B4DB7] text-white font-semibold text-[13px] flex items-center justify-center flex-shrink-0 shadow-xs ring-2 ring-purple-100 dark:ring-purple-900/50">
          {user.initials}
        </div>

        {/* User Info (Hidden on very small mobile) */}
        <div className="hidden md:flex flex-col text-left">
          <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
            {user.name}
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
            {user.role}
          </span>
        </div>

        <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-68 bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
        >
          {/* User Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-900/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                <ShieldCheck className="w-3 h-3" />
                {user.role}
              </span>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user.department}
              </span>
            </div>
          </div>

          {/* Theme Selector (Light / Dark / System) */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400 px-1 mb-1.5">
              Appearance
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
              {themeOptions.map(({ mode, label, icon: Icon }) => {
                const isActive = theme === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-[#5B4DB7] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#5B4DB7] dark:hover:text-purple-300 transition-colors text-left cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              My Profile
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#5B4DB7] dark:hover:text-purple-300 transition-colors text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Account Settings
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#5B4DB7] dark:hover:text-purple-300 transition-colors text-left cursor-pointer"
            >
              <Activity className="w-4 h-4 text-slate-400" />
              Activity Log
            </button>

            {/* Role Switcher for previewing RBAC */}
            {onRoleChange && (
              <div className="border-t border-slate-100 dark:border-slate-700/60 my-1 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
                    Switch Role (RBAC Demo)
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </button>

                {showRoleSelector && (
                  <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800/90 mx-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-0.5">
                    {AVAILABLE_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          onRoleChange(role);
                          setShowRoleSelector(false);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          user.role === role
                            ? 'bg-[#5B4DB7] text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                        }`}
                      >
                        <span>{role}</span>
                        {user.role === role && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-100 dark:border-slate-700/60 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

