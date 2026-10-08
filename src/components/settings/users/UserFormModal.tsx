import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Building, UserCheck, Send } from 'lucide-react';
import { CrmUser, UserRoleType, DepartmentType, UserStatus } from '../../../types/settings';
import { Employee } from '../../../types/employees';
import * as employeeService from '../../../services/employeeService';
import { EmployeeSelect } from '../../common/EmployeeSelect';

interface UserFormModalProps {
  isOpen: boolean;
  initialUser?: CrmUser | null;
  onClose: () => void;
  onSave: (userData: Partial<CrmUser>, sendInvitation?: boolean) => void;
}

const ROLES: UserRoleType[] = [
  'Admin',
  'Sales Manager',
  'Sales Executive',
  'Business Analyst',
  'Manager',
  'Employee',
];

const DEPARTMENTS: DepartmentType[] = [
  'Sales',
  'Business Analysis',
  'Development',
  'QA / Testing',
  'DevOps',
  'UI/UX',
  'HR',
  'Finance',
  'Administration',
  'Management',
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  initialUser,
  onClose,
  onSave,
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRoleType>('Sales Executive');
  const [department, setDepartment] = useState<DepartmentType>('Sales');
  const [reportingManager, setReportingManager] = useState('');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [crmAccess, setCrmAccess] = useState(true);
  const [sendInvitation, setSendInvitation] = useState(true);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      employeeService.fetchEmployees({ size: 100 }).then((res) => {
        setAvailableEmployees(res.content || []);
      }).catch((err) => {
        console.error('[UserFormModal] Failed to fetch employees:', err);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialUser) {
      setEmployeeId(initialUser.employeeId);
      setName(initialUser.name);
      setEmail(initialUser.email);
      setRole(initialUser.role);
      setDepartment(initialUser.department);
      setReportingManager(initialUser.reportingManager || '');
      setStatus(initialUser.status);
      setCrmAccess(initialUser.crmAccess);
      setSendInvitation(false);
    } else {
      setEmployeeId('EMP-0025');
      setName('');
      setEmail('');
      setRole('Sales Executive');
      setDepartment('Sales');
      setReportingManager('');
      setStatus('Active');
      setCrmAccess(true);
      setSendInvitation(true);
    }
    setErrors({});
  }, [initialUser, isOpen]);

  // Handle employee dropdown select
  const handleSelectEmployee = (empCode: string) => {
    setEmployeeId(empCode);
    const emp = availableEmployees.find((e) => e.employeeCode === empCode);
    if (emp) {
      setName(emp.name);
      setEmail(emp.email);
      setDepartment(emp.department as DepartmentType);
      setRole(emp.role as UserRoleType);
      setReportingManager(emp.reportingManager || '');
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Employee name is required.';
    if (!email.trim()) {
      errs.email = 'Company email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email address format.';
    }
    if (!role) errs.role = 'Role selection is required.';
    if (!department) errs.department = 'Department is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        employeeId,
        name: name.trim(),
        email: email.trim(),
        avatar: name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'TK',
        role,
        department,
        reportingManager,
        status,
        crmAccess,
      },
      sendInvitation
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialUser ? 'Edit CRM User' : 'Add New CRM User'}
            </h3>
            <p className="text-xs text-slate-500">
              Configure system access credentials and organizational role.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="crm-user-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick Select from Employee Directory */}
          {!initialUser && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Existing Staff Profile (Optional)
              </label>
              <select
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">— Or enter custom employee details below —</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.employeeCode}>
                    {emp.name} ({emp.employeeCode}) — {emp.role}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name & Employee ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="Enter full name (e.g. Kunal Patil)"
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border ${
                    errors.name
                      ? 'border-rose-400 dark:border-rose-500'
                      : 'border-slate-200 dark:border-slate-700'
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee Code / ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee code (e.g. EMP-0025)"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="Enter company email (e.g. kunal.p@technokraft.in)"
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border ${
                  errors.email
                    ? 'border-rose-400 dark:border-rose-500'
                    : 'border-slate-200 dark:border-slate-700'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CRM Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRoleType)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentType)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Reporting Manager & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reporting Manager
              </label>
              <EmployeeSelect
                value={reportingManager}
                onChange={(e: any) => setReportingManager(typeof e === 'string' ? e : e?.target?.value || '')}
                valueField="name"
                placeholder="Select Reporting Manager"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="Active">Active</option>
                <option value="Pending Invitation">Pending Invitation</option>
                <option value="Inactive">Inactive</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>

          {/* CRM Access Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                CRM Access Permission
              </span>
              <span className="text-[11px] text-slate-500">
                Allows logging in and accessing lead generation pipelines
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={crmAccess}
                onChange={(e) => setCrmAccess(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Send Invitation Checkbox */}
          {!initialUser && (
            <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendInvitation}
                onChange={(e) => setSendInvitation(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 mt-0.5"
              />
              <span>
                Send invitation link and initial password setup email to{' '}
                <strong className="text-slate-800 dark:text-slate-200">{email || 'company email'}</strong>.
              </span>
            </label>
          )}
        </form>

        {/* Fixed Pinned Bottom Action Buttons */}
        <div className="shrink-0 p-4 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="crm-user-form"
            className="px-4 py-2 text-xs font-medium rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {sendInvitation && !initialUser ? (
              <>
                <Send className="w-3.5 h-3.5" />
                Create & Send Invitation
              </>
            ) : (
              'Save User'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
