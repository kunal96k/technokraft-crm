import React from 'react';
import { Shield, Users, Edit3, Copy, Ban, CheckCircle2, Lock } from 'lucide-react';
import { RoleDefinition } from '../../../types/settings';

interface RolesTableProps {
  roles: RoleDefinition[];
  selectedRole: RoleDefinition;
  onSelectRole: (role: RoleDefinition) => void;
  onEditPermissions: (role: RoleDefinition) => void;
  onDuplicateRole: (role: RoleDefinition) => void;
  onToggleRoleStatus: (role: RoleDefinition) => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  selectedRole,
  onSelectRole,
  onEditPermissions,
  onDuplicateRole,
  onToggleRoleStatus,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Configured System & Custom Roles
          </h3>
          <p className="text-xs text-slate-500">
            Select a role to inspect or modify its functional permission matrix.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-3">Assigned Users</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {roles.map((role) => {
              const isSelected = selectedRole.id === role.id;

              return (
                <tr
                  key={role.id}
                  onClick={() => onSelectRole(role)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-50/70 dark:bg-purple-950/40'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Role Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {role.name}
                          </span>
                          {role.isSystem && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              System
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Users */}
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <Users className="w-3 h-3 text-slate-400" />
                      {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">
                    {role.description}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        role.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          role.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {role.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditPermissions(role)}
                        title="Edit Permissions"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateRole(role)}
                        title="Duplicate Role"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={() => onToggleRoleStatus(role)}
                          title={role.status === 'Active' ? 'Deactivate Role' : 'Activate Role'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            role.status === 'Active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
