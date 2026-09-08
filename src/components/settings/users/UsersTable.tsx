import React, { useState } from 'react';
import {
  MoreVertical,
  Eye,
  Edit2,
  Shield,
  KeyRound,
  UserX,
  UserCheck,
  Mail,
  Building,
} from 'lucide-react';
import { CrmUser } from '../../../types/settings';

interface UsersTableProps {
  users: CrmUser[];
  onViewUser: (user: CrmUser) => void;
  onEditUser: (user: CrmUser) => void;
  onChangeRole: (user: CrmUser) => void;
  onResetAccess: (user: CrmUser) => void;
  onToggleStatus: (user: CrmUser) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onViewUser,
  onEditUser,
  onChangeRole,
  onResetAccess,
  onToggleStatus,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getStatusBadge = (status: CrmUser['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Active
          </span>
        );
      case 'Pending Invitation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Pending
          </span>
        );
      case 'Locked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            Locked
          </span>
        );
      case 'Inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            Inactive
          </span>
        );
    }
  };

  if (users.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
        <p className="text-xs text-slate-500 dark:text-slate-400">No users match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">User</th>
            <th className="py-3 px-3">Employee ID</th>
            <th className="py-3 px-3">Role</th>
            <th className="py-3 px-3">Department</th>
            <th className="py-3 px-3">Status</th>
            <th className="py-3 px-3">Last Login</th>
            <th className="py-3 px-3">Created Date</th>
            <th className="py-3 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {users.map((user) => {
            const isMenuOpen = activeMenuId === user.id;

            return (
              <tr
                key={user.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* User Info */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/60">
                      {user.avatar}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onViewUser(user)}
                        className="font-medium text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 text-left transition-colors"
                      >
                        {user.name}
                      </button>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Employee ID */}
                <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {user.employeeId}
                </td>

                {/* Role */}
                <td className="py-3 px-3">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {user.role}
                  </span>
                </td>

                {/* Department */}
                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                  {user.department}
                </td>

                {/* Status */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>

                {/* Last Login */}
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                  {user.lastLogin}
                </td>

                {/* Created Date */}
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                  {user.createdDate}
                </td>

                {/* Actions Dropdown */}
                <td className="py-3 px-3 text-right relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenuId(isMenuOpen ? null : user.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="User actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-3 top-10 z-30 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 text-left text-xs animate-in fade-in zoom-in-95 duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onViewUser(user);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onEditUser(user);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          Edit Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
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
                            setActiveMenuId(null);
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
                            setActiveMenuId(null);
                            onToggleStatus(user);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors ${
                            user.status === 'Active'
                              ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
