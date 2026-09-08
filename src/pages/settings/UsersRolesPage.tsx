import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Download,
  Users as UsersIcon,
  Shield,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { SettingsHeader } from '../../components/settings/SettingsHeader';
import { UserSummaryCards } from '../../components/settings/users/UserSummaryCards';
import { UsersTable } from '../../components/settings/users/UsersTable';
import { UserCard } from '../../components/settings/users/UserCard';
import { UserFormModal } from '../../components/settings/users/UserFormModal';
import { UserDetailsDrawer } from '../../components/settings/users/UserDetailsDrawer';
import { RolesTable } from '../../components/settings/roles/RolesTable';
import { PermissionMatrix } from '../../components/settings/roles/PermissionMatrix';
import { RoleFormModal } from '../../components/settings/roles/RoleFormModal';
import { ConfirmationDialog } from '../../components/settings/ConfirmationDialog';
import { AuditLogPreview } from '../../components/settings/AuditLogPreview';

import {
  CrmUser,
  RoleDefinition,
  CrmModule,
  ModulePermission,
  UserRoleType,
  DepartmentType,
  UserStatus,
} from '../../types/settings';
import {
  loadUsers,
  saveUsers,
  loadRoles,
  saveRoles,
} from '../../data/mockSettings';

export const UsersRolesPage: React.FC = () => {
  // Tabs: 'users' or 'roles'
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Users state
  const [users, setUsers] = useState<CrmUser[]>([]);
  // Roles state
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'lastLogin' | 'dateAdded'>('name-asc');

  // Modals & Drawers state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CrmUser | null>(null);
  const [viewingUser, setViewingUser] = useState<CrmUser | null>(null);

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    variant?: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  // Load data on mount
  useEffect(() => {
    const loadedUsers = loadUsers();
    const loadedRoles = loadRoles();
    setUsers(loadedUsers);
    setRoles(loadedRoles);
    if (loadedRoles.length > 0) {
      setSelectedRole(loadedRoles[0]);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        // Search
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          !query ||
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.employeeId.toLowerCase().includes(query);

        // Role
        const matchesRole =
          selectedRoleFilter === 'All' || user.role === selectedRoleFilter;

        // Department
        const matchesDept =
          selectedDeptFilter === 'All' || user.department === selectedDeptFilter;

        // Status
        const matchesStatus =
          selectedStatusFilter === 'All' || user.status === selectedStatusFilter;

        return matchesSearch && matchesRole && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'dateAdded')
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        return a.lastLogin.localeCompare(b.lastLogin);
      });
  }, [users, searchTerm, selectedRoleFilter, selectedDeptFilter, selectedStatusFilter, sortBy]);

  // User Actions
  const handleSaveUser = (userData: Partial<CrmUser>, sendInvitation?: boolean) => {
    let updatedUsers: CrmUser[];

    if (editingUser) {
      updatedUsers = users.map((u) =>
        u.id === editingUser.id ? ({ ...u, ...userData } as CrmUser) : u
      );
      showToast(`User profile for "${userData.name}" updated successfully.`);
    } else {
      const newUser: CrmUser = {
        id: `usr-${Date.now()}`,
        employeeId: userData.employeeId || 'EMP-0025',
        name: userData.name || 'New Staff',
        email: userData.email || '',
        avatar: userData.avatar || 'TK',
        role: userData.role || 'Sales Executive',
        department: userData.department || 'Sales',
        reportingManager: userData.reportingManager || 'Rajesh Mehta',
        crmAccess: userData.crmAccess !== undefined ? userData.crmAccess : true,
        status: sendInvitation ? 'Pending Invitation' : 'Active',
        lastLogin: 'Never',
        lastActivity: 'Never',
        createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        dateAdded: new Date().toISOString().split('T')[0],
      };
      updatedUsers = [newUser, ...users];
      showToast(
        sendInvitation
          ? `User "${newUser.name}" added and invitation dispatched to ${newUser.email}.`
          : `User "${newUser.name}" added successfully.`
      );
    }

    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setEditingUser(null);
  };

  const handleToggleUserStatus = (user: CrmUser) => {
    const isDeactivating = user.status === 'Active';

    setConfirmDialog({
      isOpen: true,
      title: isDeactivating ? `Deactivate ${user.name}?` : `Reactivate ${user.name}?`,
      message: isDeactivating
        ? `Deactivating this user will revoke CRM access immediately. Historical activity records, proposals, and call logs assigned to ${user.name} will be preserved for auditing.`
        : `Reactivating will restore CRM access and permit new lead assignments for ${user.name}.`,
      variant: isDeactivating ? 'danger' : 'primary',
      action: () => {
        const updatedUsers = users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                status: (isDeactivating ? 'Inactive' : 'Active') as UserStatus,
                crmAccess: !isDeactivating,
              }
            : u
        );
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        if (viewingUser?.id === user.id) {
          setViewingUser({
            ...viewingUser,
            status: isDeactivating ? 'Inactive' : 'Active',
            crmAccess: !isDeactivating,
          });
        }
        showToast(
          `User ${user.name} ${isDeactivating ? 'deactivated' : 'reactivated'}.`
        );
      },
    });
  };

  const handleResetAccess = (user: CrmUser) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reset Access Credentials for ${user.name}?`,
      message: `An authenticated password reset link and 2FA re-verification token will be dispatched to ${user.email}. Current active sessions will be terminated.`,
      variant: 'warning',
      action: () => {
        showToast(`Password reset link dispatched to ${user.email}.`);
      },
    });
  };

  const handleExportUsers = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Employee ID,Name,Email,Role,Department,CRM Access,Status,Last Login']
        .concat(
          users.map(
            (u) =>
              `"${u.employeeId}","${u.name}","${u.email}","${u.role}","${u.department}","${
                u.crmAccess ? 'Yes' : 'No'
              }","${u.status}","${u.lastLogin}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `technokraft_crm_users_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported users directory to CSV.');
  };

  // Roles Actions
  const handleUpdateRolePermissions = (
    roleId: string,
    permissions: Record<CrmModule, ModulePermission>
  ) => {
    const updatedRoles = roles.map((r) =>
      r.id === roleId ? { ...r, permissions } : r
    );
    setRoles(updatedRoles);
    saveRoles(updatedRoles);
    if (selectedRole?.id === roleId) {
      setSelectedRole({ ...selectedRole, permissions });
    }
    showToast('Role permissions updated successfully.');
  };

  const handleDuplicateRole = (sourceRole: RoleDefinition) => {
    const newRole: RoleDefinition = {
      ...sourceRole,
      id: `role-${Date.now()}`,
      name: `${sourceRole.name} (Copy)`,
      description: `Duplicated from ${sourceRole.name}`,
      isSystem: false,
      userCount: 0,
      status: 'Active',
    };
    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    saveRoles(updatedRoles);
    setSelectedRole(newRole);
    showToast(`Role "${newRole.name}" created.`);
  };

  const handleToggleRoleStatus = (role: RoleDefinition) => {
    if (role.isSystem) return;
    if (role.userCount > 0 && role.status === 'Active') {
      showToast(`Cannot deactivate "${role.name}" because it is currently assigned to ${role.userCount} active users.`);
      return;
    }

    const nextStatus = role.status === 'Active' ? 'Inactive' : 'Active';
    const updatedRoles = roles.map((r) =>
      r.id === role.id ? { ...r, status: nextStatus as 'Active' | 'Inactive' } : r
    );
    setRoles(updatedRoles);
    saveRoles(updatedRoles);
    if (selectedRole?.id === role.id) {
      setSelectedRole({ ...selectedRole, status: nextStatus as 'Active' | 'Inactive' });
    }
    showToast(`Role "${role.name}" marked as ${nextStatus}.`);
  };

  const handleSaveRole = (roleData: Partial<RoleDefinition>) => {
    if (editingRole) {
      const updatedRoles = roles.map((r) =>
        r.id === editingRole.id ? ({ ...r, ...roleData } as RoleDefinition) : r
      );
      setRoles(updatedRoles);
      saveRoles(updatedRoles);
      if (selectedRole?.id === editingRole.id) {
        setSelectedRole({ ...selectedRole, ...roleData });
      }
      showToast(`Role "${roleData.name}" updated.`);
    } else {
      const newRole: RoleDefinition = {
        id: `role-${Date.now()}`,
        name: roleData.name || 'Custom Role',
        description: roleData.description || 'Custom role profile',
        isSystem: false,
        userCount: 0,
        status: roleData.status || 'Active',
        permissions: selectedRole?.permissions || ({} as any),
      };
      const updatedRoles = [...roles, newRole];
      setRoles(updatedRoles);
      saveRoles(updatedRoles);
      setSelectedRole(newRole);
      showToast(`Role "${newRole.name}" created.`);
    }
    setEditingRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl text-xs font-medium animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <SettingsHeader
        breadcrumbs={[
          { label: 'Settings', href: '/settings/general' },
          { label: 'Users & Roles' },
        ]}
        title="Users & Roles"
        subtitle="Manage CRM users, system access, roles and permissions."
        actions={
          activeTab === 'users' ? (
            <>
              <button
                type="button"
                onClick={handleExportUsers}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export Users
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setIsAddUserModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingRole(null);
                setIsAddRoleModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          )
        }
      />

      {/* User Summary Cards (Active in users tab) */}
      {activeTab === 'users' && <UserSummaryCards users={users} />}

      {/* Secondary Tab Switcher [ Users ] [ Roles ] */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UsersIcon className="w-3.5 h-3.5" />
          Users Directory ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'roles'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Roles & Permissions ({roles.length})
        </button>
      </div>

      {/* USERS TAB CONTENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by user name, email, or employee code..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Role filter */}
              <div className="w-full md:w-44">
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              {/* Department filter */}
              <div className="w-full md:w-44">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="All">All Departments</option>
                  <option value="Sales">Sales</option>
                  <option value="Business Analysis">Business Analysis</option>
                  <option value="Development">Development</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="w-full md:w-36">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending Invitation">Pending</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Locked">Locked</option>
                </select>
              </div>

              {/* Sort by */}
              <div className="w-full md:w-36">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="lastLogin">Last Login</option>
                  <option value="dateAdded">Date Added</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Users Table (hidden on mobile) */}
          <div className="hidden md:block">
            <UsersTable
              users={filteredUsers}
              onView={(user) => setViewingUser(user)}
              onEdit={(user) => {
                setEditingUser(user);
                setIsAddUserModalOpen(true);
              }}
              onChangeRole={(user) => {
                setEditingUser(user);
                setIsAddUserModalOpen(true);
              }}
              onResetAccess={handleResetAccess}
              onToggleStatus={handleToggleUserStatus}
            />
          </div>

          {/* Mobile Users Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                No users matched your query.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onView={(u) => setViewingUser(u)}
                  onEdit={(u) => {
                    setEditingUser(u);
                    setIsAddUserModalOpen(true);
                  }}
                  onChangeRole={(u) => {
                    setEditingUser(u);
                    setIsAddUserModalOpen(true);
                  }}
                  onResetAccess={handleResetAccess}
                  onToggleStatus={handleToggleUserStatus}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ROLES TAB CONTENT */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <RolesTable
            roles={roles}
            selectedRole={selectedRole || roles[0]}
            onSelectRole={(role) => setSelectedRole(role)}
            onEditPermissions={(role) => setSelectedRole(role)}
            onDuplicateRole={handleDuplicateRole}
            onToggleRoleStatus={handleToggleRoleStatus}
          />

          {selectedRole && (
            <PermissionMatrix
              role={selectedRole}
              onUpdateRolePermissions={handleUpdateRolePermissions}
            />
          )}
        </div>
      )}

      {/* Audit Log Preview (Bottom) */}
      <AuditLogPreview />

      {/* Add / Edit User Modal */}
      <UserFormModal
        isOpen={isAddUserModalOpen}
        initialUser={editingUser}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />

      {/* User Details Drawer */}
      <UserDetailsDrawer
        user={viewingUser}
        onClose={() => setViewingUser(null)}
        onEdit={(u) => {
          setViewingUser(null);
          setEditingUser(u);
          setIsAddUserModalOpen(true);
        }}
        onResetAccess={handleResetAccess}
        onToggleStatus={handleToggleUserStatus}
      />

      {/* Add / Edit Role Modal */}
      <RoleFormModal
        isOpen={isAddRoleModalOpen}
        initialRole={editingRole}
        onClose={() => {
          setIsAddRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSaveRole}
      />

      {/* Generic Confirmation Modal */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="Confirm"
        onConfirm={() => {
          confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};
