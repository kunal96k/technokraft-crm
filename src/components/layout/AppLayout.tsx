import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { TopHeader } from './TopHeader';
import { Footer } from './Footer';
import { INITIAL_USER_PROFILE } from '../../config/navigation';
import { UserProfile, UserRole } from '../../types/navigation';
import { useTheme } from '../../context/ThemeContext';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { resolvedTheme, setTheme } = useTheme();

  // Sidebar states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('tk_crm_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // User and RBAC state
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILE);

  // Derive sidebar theme from resolvedTheme (can be 'dark' or 'light')
  const sidebarTheme = resolvedTheme === 'Dark' ? 'dark' : 'light';

  const setSidebarTheme = (
    update: 'dark' | 'light' | ((prev: 'dark' | 'light') => 'dark' | 'light')
  ) => {
    const nextTheme = typeof update === 'function' ? update(sidebarTheme) : update;
    setTheme(nextTheme === 'dark' ? 'Dark' : 'Light');
  };

  useEffect(() => {
    localStorage.setItem('tk_crm_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleToggleDesktopSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#5B4DB7]/20 selection:text-[#5B4DB7] transition-colors duration-200">
      {/* 1. Desktop Persistent Sidebar */}
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleDesktopSidebar}
        currentRole={currentUser.role}
        theme={sidebarTheme}
      />

      {/* 2. Mobile Off-Canvas Drawer */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentRole={currentUser.role}
        theme={sidebarTheme}
      />

      {/* 3. Main Workspace Area (Header + Scrollable Main + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-200">
        {/* Sticky Top Navigation Header */}
        <TopHeader
          onToggleMobileSidebar={handleToggleMobileSidebar}
          onToggleDesktopSidebar={handleToggleDesktopSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
          user={currentUser}
          onRoleChange={handleRoleChange}
        />

        {/* Reusable Main Content Container */}
        <main
          id="crm-main-content-container"
          className="flex-1 w-full max-w-full min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7 overflow-x-hidden bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100"
        >
          {/* Outlet for React Router nested routes or direct children */}
          {children || (
            <Outlet context={{ currentUser, sidebarTheme, setSidebarTheme }} />
          )}
        </main>

        {/* Standard Application Footer */}
        <Footer />
      </div>
    </div>
  );
};

