import React, { useState } from 'react';
import { MoreVertical, Mail, Eye, Edit2, Shield, KeyRound, UserX, UserCheck } from 'lucide-react';
import { CrmUser } from '../../../types/settings';

interface UserCardProps {
  user: CrmUser;
  onView: (user: CrmUser) => void;
  onEdit: (user: CrmUser) => void;
  onChangeRole: (user: CrmUser) => void;
  onResetAccess: (user: CrmUser) => void;
  onToggleStatus: (user: CrmUser) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onView,
  onEdit,
  onChangeRole,
  onResetAccess,
  onToggleStatus,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusBadge = (status: CrmUser['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Pending Invitation':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Invitation
          </span>
        );
      case 'Locked':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Locked
          </span>
        );
      case 'Inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 relative">
      {/* Top row: Name, employee code and menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/60">
            {user.avatar}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              {user.name}
            </h4>
            <span className="font-mono text-[11px] text-slate-500">
              {user.employeeId}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(user);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onChangeRole(user);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Change Role
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onResetAccess(user);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Reset Access
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleStatus(user);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
                    user.status === 'Active'
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50'
                      : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50'
                  }`}
                >
                  {user.status === 'Active' ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Reactivate User
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role & Department */}
      <div className="text-xs space-y-0.5">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          {user.role}
        </p>
        <p className="text-slate-500">{user.department}</p>
      </div>

      {/* Status & Login */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div>{getStatusBadge(user.status)}</div>
        <span className="text-[11px] text-slate-400">
          Last login: {user.lastLogin}
        </span>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onView(user)}
        className="w-full py-2 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
      >
        <Eye className="w-3.5 h-3.5 text-slate-400" />
        View User
      </button>
    </div>
  );
};
