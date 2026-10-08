import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { TopHeader } from './TopHeader';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';
import { UserRole, UserProfile } from '../../types/navigation';

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sidebarTheme, setSidebarTheme] = useState<'dark' | 'light'>('dark');

  const currentUser: UserProfile = {
    name: user?.name || 'Administrator',
    initials: user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD',
    email: user?.email || 'admin@technokraftservices.com',
    role: (user?.accessRole as UserRole) || 'Sales Manager',
    department: 'Management',
    avatarUrl: user?.avatar,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Mobile Drawer Navigation (<1024px) */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentRole={currentUser.role}
      />

      <div className="flex flex-1 w-full min-h-screen">
        {/* Desktop Sticky Sidebar (>=1024px) */}
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          currentRole={currentUser.role}
        />

        {/* Right Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50 dark:bg-[#0B1120]">
          {/* Top Global Header Bar */}
          <TopHeader
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onToggleDesktopSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            isSidebarCollapsed={isSidebarCollapsed}
            user={currentUser}
          />

          {/* Main Content Area - naturally scrollable on Y-axis without trap */}
          <main className="flex-1 px-3 sm:px-4 md:px-6 py-4 md:py-6">
            <Outlet context={{ currentUser, sidebarTheme, setSidebarTheme }} />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};
