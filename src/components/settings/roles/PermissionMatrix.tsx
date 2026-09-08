import React, { useState } from 'react';
import {
  Shield,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Lock,
} from 'lucide-react';
import { RoleDefinition, CrmModule, ModulePermission } from '../../../types/settings';

interface PermissionMatrixProps {
  role: RoleDefinition;
  onUpdateRolePermissions: (roleId: string, permissions: Record<CrmModule, ModulePermission>) => void;
  isReadOnly?: boolean;
}

const MODULES: { id: CrmModule; label: string; description: string }[] = [
  { id: 'Dashboard', label: 'Dashboard', description: 'Access KPI metrics and sales overviews' },
  { id: 'Leads', label: 'Leads', description: 'Lead directory, scoring, and source attribution' },
  { id: 'Calls', label: 'Calls', description: 'Outbound telecalling and call logs' },
  { id: 'Emails', label: 'Emails', description: 'Company email messaging and inbox' },
  { id: 'WhatsApp', label: 'WhatsApp', description: 'Direct messaging and template outreach' },
  { id: 'Follow-ups', label: 'Follow-ups', description: 'Scheduled follow-up interactions' },
  { id: 'Tasks', label: 'Tasks', description: 'Internal CRM workflows and task deadlines' },
  { id: 'Meetings', label: 'Meetings', description: 'Client demos, meetings and video calls' },
  { id: 'Opportunities', label: 'Opportunities', description: 'Deal pipeline, values and negotiation' },
  { id: 'Proposals', label: 'Proposals', description: 'Scope documents and price quotations' },
  { id: 'Reports', label: 'Reports', description: 'Performance reports and business analytics' },
  { id: 'Employees', label: 'Employees', description: 'Employee directory and attendance tracking' },
  { id: 'Settings', label: 'Settings', description: 'Administrative preferences and system config' },
];

const COLUMNS: { key: keyof ModulePermission; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'export', label: 'Export' },
];

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  role,
  onUpdateRolePermissions,
  isReadOnly = false,
}) => {
  const [permissions, setPermissions] = useState<Record<CrmModule, ModulePermission>>({
    ...role.permissions,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [mobileExpandedModule, setMobileExpandedModule] = useState<CrmModule | null>('Leads');

  // Sync if role changes
  React.useEffect(() => {
    setPermissions({ ...role.permissions });
    setHasChanges(false);
  }, [role]);

  const handleToggle = (module: CrmModule, col: keyof ModulePermission) => {
    if (isReadOnly || role.name === 'Admin') return; // Admin has locked full permissions

    const updated = {
      ...permissions,
      [module]: {
        ...permissions[module],
        [col]: !permissions[module]?.[col],
      },
    };
    setPermissions(updated);
    setHasChanges(true);
  };

  const handleToggleAllRow = (module: CrmModule, targetState: boolean) => {
    if (isReadOnly || role.name === 'Admin') return;

    const updated = {
      ...permissions,
      [module]: {
        view: targetState,
        create: targetState,
        edit: targetState,
        delete: targetState,
        export: targetState,
      },
    };
    setPermissions(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateRolePermissions(role.id, permissions);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPermissions({ ...role.permissions });
    setHasChanges(false);
  };

  return (
    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Permission Matrix: {role.name}
            </h4>
            {role.name === 'Admin' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Full Access Enforced
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure granular functional privileges across CRM modules for this role profile.
          </p>
        </div>

        {/* Save / Reset controls if changes exist */}
        {hasChanges && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              Save Permissions
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table Matrix (hidden on mobile < 768px) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-1/3">CRM Module</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="py-3 px-3 text-center">
                  {col.label}
                </th>
              ))}
              <th className="py-3 px-3 text-right">Quick Set</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {MODULES.map((mod) => {
              const perm = permissions[mod.id] || {
                view: false,
                create: false,
                edit: false,
                delete: false,
                export: false,
              };
              const isAllEnabled =
                perm.view && perm.create && perm.edit && perm.delete && perm.export;

              return (
                <tr
                  key={mod.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Module Name & Info */}
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {mod.label}
                      </span>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {mod.description}
                      </p>
                    </div>
                  </td>

                  {/* Columns */}
                  {COLUMNS.map((col) => {
                    const isGranted = perm[col.key];
                    const isDisabled = role.name === 'Admin';

                    return (
                      <td key={col.key} className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleToggle(mod.id, col.key)}
                          className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                            isGranted
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-transparent hover:border-slate-300'
                          } ${isDisabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-105'}`}
                          title={`${mod.label} ${col.label}: ${isGranted ? 'Granted' : 'Revoked'}`}
                        >
                          {isGranted ? (
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <X className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </button>
                      </td>
                    );
                  })}

                  {/* Row quick toggles */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {role.name !== 'Admin' && (
                      <button
                        type="button"
                        onClick={() => handleToggleAllRow(mod.id, !isAllEnabled)}
                        className="text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {isAllEnabled ? 'Revoke All' : 'Grant All'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Expandable Cards (< 768px) */}
      <div className="md:hidden space-y-2.5">
        {MODULES.map((mod) => {
          const perm = permissions[mod.id] || {
            view: false,
            create: false,
            edit: false,
            delete: false,
            export: false,
          };
          const isExpanded = mobileExpandedModule === mod.id;

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setMobileExpandedModule(isExpanded ? null : mod.id)
                }
                className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50/50 dark:bg-slate-800/30"
              >
                <div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white">
                    {mod.label}
                  </h5>
                  <p className="text-[11px] text-slate-500">{mod.description}</p>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {COLUMNS.map((col) => {
                    const isGranted = perm[col.key];
                    return (
                      <div
                        key={col.key}
                        className="flex items-center justify-between py-1.5 text-xs"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {col.label}
                        </span>
                        <button
                          type="button"
                          disabled={role.name === 'Admin'}
                          onClick={() => handleToggle(mod.id, col.key)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                            isGranted
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          }`}
                        >
                          {isGranted ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Granted
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" /> Revoked
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
