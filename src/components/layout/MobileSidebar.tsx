import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { SidebarSection } from './SidebarSection';
import { SidebarItem } from './SidebarItem';
import { NAVIGATION_CONFIG, canViewModule } from '../../config/navigation';
import { UserRole } from '../../types/navigation';
import { useTheme } from '../../context/ThemeContext';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: UserRole;
  theme?: 'dark' | 'light';
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  currentRole = 'Sales Manager' as UserRole,
  theme,
}) => {
  const { resolvedTheme } = useTheme();
  const activeTheme = theme || (resolvedTheme === 'Dark' ? 'dark' : 'light');
  const isDark = activeTheme === 'dark';

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="crm-mobile-drawer-root"
      className="fixed inset-0 z-50 lg:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Semi-transparent Backdrop with subtle blur */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className={`relative flex flex-col w-[280px] max-w-[85vw] h-full shadow-2xl z-10 transform transition-transform duration-200 ease-out ${
          isDark
            ? 'bg-[#0B1120] text-slate-100 border-r border-slate-800'
            : 'bg-white text-slate-900 border-r border-slate-200'
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`flex items-center justify-between h-16 px-4 border-b ${
            isDark ? 'border-slate-800/80' : 'border-slate-150'
          }`}
        >
          <BrandLogo collapsed={false} theme={activeTheme} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAVIGATION_CONFIG.map((section) => {
            const visibleItems = section.items.filter((item) =>
              canViewModule(item, currentRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <SidebarSection
                key={section.id}
                title={section.sectionTitle}
                collapsed={false}
                theme={activeTheme}
              >
                {visibleItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    collapsed={false}
                    onNavigate={onClose}
                    theme={activeTheme}
                  />
                ))}
              </SidebarSection>
            );
          })}
        </div>

        {/* Mobile Drawer Footer with Role Badge */}
        <div
          className={`p-3.5 border-t text-xs ${
            isDark
              ? 'border-slate-800/80 bg-slate-900/40 text-slate-400'
              : 'border-slate-150 bg-slate-50/80 text-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                TechnoKraft Services
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Role: {currentRole}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                isDark
                  ? 'bg-purple-900/40 text-purple-300 border border-purple-800/40'
                  : 'bg-purple-50 text-[#5B4DB7] border border-purple-200'
              }`}
            >
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
