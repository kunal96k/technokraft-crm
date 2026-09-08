import React from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  Building,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Edit2,
  UserX,
  UserCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { CrmUser } from '../../../types/settings';

interface UserDetailsDrawerProps {
  user: CrmUser | null;
  onClose: () => void;
  onEdit: (user: CrmUser) => void;
  onResetAccess: (user: CrmUser) => void;
  onToggleStatus: (user: CrmUser) => void;
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  user,
  onClose,
  onEdit,
  onResetAccess,
  onToggleStatus,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              User Access Profile
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Identity Card */}
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
              {user.avatar}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {user.name}
              </h2>
              <p className="font-mono text-xs text-purple-700 dark:text-purple-300">
                {user.employeeId}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Access & Status Telemetry Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Assigned Role</span>
              <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {user.role}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Department</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {user.department}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">CRM Access</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  user.crmAccess
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {user.crmAccess ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Account Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  user.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : user.status === 'Pending Invitation'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {user.status}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Last Login</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {user.lastLogin}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Last Activity</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {user.lastActivity}
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Reporting Manager</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {user.reportingManager || 'Rajesh Mehta'}
              </span>
            </div>
          </div>

          {/* Quick Security Actions */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Access Management
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => onResetAccess(user)}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Reset Access
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleStatus(user)}
              className={`w-full p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                user.status === 'Active'
                  ? 'border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              {user.status === 'Active' ? (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  Suspend / Deactivate User
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  Reactivate CRM Access
                </>
              )}
            </button>
          </div>

          {/* Audit Note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
              Preserved Audit History
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Deactivating this user prevents future logins and assignment without removing existing lead histories, call logs, proposals, or closed opportunities.
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
