import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  moduleKey?: string;
  requireSuperAdmin?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  moduleKey,
  requireSuperAdmin = false,
  children,
}) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">TechnoKraft CRM Security</h3>
            <p className="text-xs text-slate-400 mt-1">Verifying authenticated session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to /login and preserve intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check authorization
  const roleStr = (user.accessRole || user.role || '').toLowerCase();
  const isSuperAdminOrSystemAdmin =
    roleStr === 'super admin' ||
    roleStr === 'superadmin' ||
    roleStr === 'system administrator' ||
    roleStr === 'system admin' ||
    Boolean(user.isSuperAdmin);

  let isAuthorized = true;
  if (requireSuperAdmin) {
    isAuthorized = isSuperAdminOrSystemAdmin;
  } else if (!isSuperAdminOrSystemAdmin) {
    if (moduleKey && user.allowedModules !== undefined && user.allowedModules !== null && Array.isArray(user.allowedModules)) {
      isAuthorized = user.allowedModules.includes(moduleKey);
    } else if (allowedRoles && allowedRoles.length > 0) {
      isAuthorized = hasRole(allowedRoles);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {requireSuperAdmin
              ? 'This module contains sensitive system audit logs and is strictly restricted to Super Admin and System Administrator roles only.'
              : `Your role (${user.accessRole || user.role}) does not have authorization permissions to access this CRM module.`}
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
