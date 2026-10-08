import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  ShieldCheck,
  Target,
  Upload,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  Employee,
  DepartmentType,
  EmployeeRole,
  EmploymentType,
  EmployeeStatus,
  CrmAccessRole,
  DEPARTMENTS,
  EMPLOYEE_ROLES,
} from '../../types/employees';
import { EmployeeSelect } from '../common/EmployeeSelect';

export const SIDEBAR_MODULE_OPTIONS = [
  { id: 'dashboard', label: 'CRM Dashboard', desc: 'KPI metrics, live team workload & conversion charts', defaultFor: ['Admin', 'Manager', 'Sales Executive', 'Business Analyst', 'Employee'] },
  { id: 'leads', label: 'Leads Management', desc: 'Full leads directory, lead qualification, manual lead & bulk CSV import', defaultFor: ['Admin', 'Manager', 'Sales Executive', 'Business Analyst'] },
  { id: 'communication', label: 'Communication Hub', desc: 'Corporate email dispatch, WhatsApp messaging & call logging', defaultFor: ['Admin', 'Manager', 'Sales Executive'] },
  { id: 'follow-ups', label: 'Activity & Follow-ups', desc: 'Outbound follow-up schedule, task tracker & client meetings', defaultFor: ['Admin', 'Manager', 'Sales Executive', 'Business Analyst', 'Employee'] },
  { id: 'opportunities', label: 'Sales Opportunities', desc: 'Deal pipeline stages, revenue forecasting & commercial proposal quotes', defaultFor: ['Admin', 'Manager', 'Sales Executive', 'Business Analyst'] },
  { id: 'reports', label: 'Performance & Reports', desc: 'Executive KPI reporting & conversion funnel analytics', defaultFor: ['Admin', 'Manager'] },
  { id: 'employees', label: 'Employee Administration', desc: 'Team member directory, attendance records & audits', defaultFor: ['Admin', 'Manager'] },
  { id: 'settings', label: 'System Settings', desc: 'System configuration, pipeline stages & master parameters', defaultFor: ['Admin'] },
];

export const getDefaultModulesForRole = (role: CrmAccessRole): string[] => {
  return SIDEBAR_MODULE_OPTIONS.filter((m) => m.defaultFor.includes(role)).map((m) => m.id);
};

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => void;
  initialEmployee?: Employee | null;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEmployee,
}) => {
  const isEditing = !!initialEmployee;

  // Form State
  const [firstName, setFirstName] = useState(initialEmployee?.firstName || '');
  const [lastName, setLastName] = useState(initialEmployee?.lastName || '');
  const [phone, setPhone] = useState(initialEmployee?.phone || '+91 ');
  const [personalEmail, setPersonalEmail] = useState(initialEmployee?.personalEmail || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    initialEmployee?.gender || 'Male'
  );
  const [dob, setDob] = useState(initialEmployee?.dateOfBirth || '');

  // Company Info
  const [employeeCode, setEmployeeCode] = useState(
    initialEmployee?.employeeCode || `EMP-00${Math.floor(Math.random() * 80 + 30)}`
  );
  const [companyEmail, setCompanyEmail] = useState(initialEmployee?.email || '');
  const [department, setDepartment] = useState<DepartmentType | string>(
    initialEmployee?.department || 'Sales'
  );
  const [role, setRole] = useState<EmployeeRole | string>(
    initialEmployee?.role || 'Sales Executive'
  );
  const [reportingManager, setReportingManager] = useState(
    initialEmployee?.reportingManager || ''
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initialEmployee?.employmentType || 'Full Time'
  );
  const [joiningDate, setJoiningDate] = useState(
    initialEmployee?.joiningDate || new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<EmployeeStatus>(
    initialEmployee?.status || 'Active'
  );

  // CRM Access & Credentials
  const [crmAccess, setCrmAccess] = useState(initialEmployee?.crmAccess ?? true);
  const [accessRole, setAccessRole] = useState<CrmAccessRole>(
    initialEmployee?.accessRole || 'Sales Executive'
  );
  const [allowedModules, setAllowedModules] = useState<string[]>(
    initialEmployee?.allowedModules || getDefaultModulesForRole(initialEmployee?.accessRole || 'Sales Executive')
  );
  const [username, setUsername] = useState(initialEmployee?.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(
    initialEmployee?.forcePasswordReset ?? true
  );
  const [isAccountLocked, setIsAccountLocked] = useState(
    initialEmployee?.isAccountLocked ?? false
  );

  // Target Settings
  const [monthlyRevenue, setMonthlyRevenue] = useState(
    initialEmployee?.targets?.monthlyRevenueTarget || 800000
  );
  const [monthlyLeads, setMonthlyLeads] = useState(
    initialEmployee?.targets?.monthlyLeadTarget || 40
  );
  const [monthlyCalls, setMonthlyCalls] = useState(
    initialEmployee?.targets?.monthlyCallTarget || 80
  );
  const [monthlyFollowUps, setMonthlyFollowUps] = useState(
    initialEmployee?.targets?.monthlyFollowUpTarget || 35
  );
  const [monthlyProposals, setMonthlyProposals] = useState(
    initialEmployee?.targets?.monthlyProposalTarget || 6
  );
  const [monthlyWonDeals, setMonthlyWonDeals] = useState(
    initialEmployee?.targets?.monthlyWonDealTarget || 3
  );

  // Auto-generate company email & username if first & last name typed
  const handleNameBlur = () => {
    const cleanFirst = firstName.trim().toLowerCase();
    const cleanLast = lastName.trim().toLowerCase();
    if (cleanFirst && cleanLast) {
      if (!companyEmail) {
        setCompanyEmail(`${cleanFirst}.${cleanLast}@technokraftservices.com`);
      }
      if (!username) {
        setUsername(`${cleanFirst}.${cleanLast}`);
      }
    }
  };

  const generateRandomPassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '@#$%&*!';
    const all = uppercase + lowercase + numbers + special;

    let pwd = '';
    pwd += uppercase[Math.floor(Math.random() * uppercase.length)];
    pwd += lowercase[Math.floor(Math.random() * lowercase.length)];
    pwd += numbers[Math.floor(Math.random() * numbers.length)];
    pwd += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < 10; i++) {
      pwd += all[Math.floor(Math.random() * all.length)];
    }
    const shuffled = pwd.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    setShowPassword(true);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

    const employeeData: Partial<Employee> = {
      firstName,
      lastName,
      name: fullName,
      avatar: initials,
      email: companyEmail,
      personalEmail,
      phone,
      gender,
      dateOfBirth: dob,
      employeeCode,
      department,
      role,
      reportingManager: typeof reportingManager === 'string' ? reportingManager : (reportingManager as any)?.target?.value || '',
      employmentType,
      joiningDate,
      status,
      crmAccess,
      accessRole,
      allowedModules,
      username: username.trim() || undefined,
      password: password.trim() || undefined,
      forcePasswordReset,
      isAccountLocked,
      targets: {
        period: 'Monthly',
        monthlyRevenueTarget: Number(monthlyRevenue),
        monthlyLeadTarget: Number(monthlyLeads),
        monthlyCallTarget: Number(monthlyCalls),
        monthlyFollowUpTarget: Number(monthlyFollowUps),
        monthlyProposalTarget: Number(monthlyProposals),
        monthlyWonDealTarget: Number(monthlyWonDeals),
        achievedRevenue: initialEmployee?.targets?.achievedRevenue || 0,
        achievedLeads: initialEmployee?.targets?.achievedLeads || 0,
        achievedCalls: initialEmployee?.targets?.achievedCalls || 0,
        achievedFollowUps: initialEmployee?.targets?.achievedFollowUps || 0,
        achievedProposals: initialEmployee?.targets?.achievedProposals || 0,
        achievedWonDeals: initialEmployee?.targets?.achievedWonDeals || 0,
        revenueAchievementRate: initialEmployee?.targets?.revenueAchievementRate || 0,
        overallStatus: initialEmployee?.targets?.overallStatus || 'On Track',
      },
    };

    onSave(employeeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Employee Profile' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? `Update company information, CRM permissions and monthly targets for ${initialEmployee?.name}`
                : 'Onboard a new employee to TechnoKraft CRM system and configure initial quotas'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form id="add-employee-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Section 1: Personal Information */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>1. Personal Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder="Enter employee first name"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder="Enter employee last name (e.g. Patil)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number (e.g. +91 98230 45612)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Personal Email (Optional)
                </label>
                <input
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  placeholder="Enter personal email"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Company Information */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>2. Company & Organizational Data</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employee ID Code *
                </label>
                <input
                  type="text"
                  required
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="Enter employee code (e.g. EMP-0012)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="Enter company email"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  {EMPLOYEE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reporting Manager
                </label>
                <EmployeeSelect
                  value={reportingManager}
                  onChange={(e: any) => setReportingManager(typeof e === 'string' ? e : e?.target?.value || '')}
                  valueField="name"
                  placeholder="Select Reporting Manager"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: CRM Access & Login Credentials */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>3. CRM Access & Login Credentials</span>
            </div>

            {/* CRM Access Toggle & Role */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Enable TechnoKraft CRM System Access
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Allow employee to log in, handle leads, execute follow-ups and register calls.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crmAccess}
                    onChange={(e) => setCrmAccess(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {crmAccess ? 'Access Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {crmAccess && (
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned CRM Access Role *
                  </label>
                  <select
                    value={accessRole}
                    onChange={(e) => {
                      const newRole = e.target.value as CrmAccessRole;
                      setAccessRole(newRole);
                      setAllowedModules(getDefaultModulesForRole(newRole));
                    }}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee (Read Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Login Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter login username"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Auto-generated from name if left empty
                  </span>
                </div>

                {/* Password field */}
                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {isEditing ? 'Change Login Password (Optional)' : 'Initial Password (Optional)'}
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate Random
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isEditing ? 'Leave blank to retain existing password, or enter new password' : 'Enter initial password or click Generate Random...'}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-10 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Sidebar Navigation Link Access Configuration */}
                <div className="sm:col-span-2 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-900 dark:text-white">
                          Sidebar Navigation Link Access
                        </label>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {allowedModules.length} of {SIDEBAR_MODULE_OPTIONS.length} Enabled
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Choose exactly which sidebar navigation links and modules this employee has access to
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setAllowedModules(SIDEBAR_MODULE_OPTIONS.map((m) => m.id))}
                        className="px-2 py-1 text-[10.5px] font-medium rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        All Links
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllowedModules(getDefaultModulesForRole(accessRole))}
                        className="px-2 py-1 text-[10.5px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Role Default
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllowedModules([])}
                        className="px-2 py-1 text-[10.5px] font-medium rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Revoke All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {SIDEBAR_MODULE_OPTIONS.map((mod) => {
                      const isChecked = allowedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => {
                            setAllowedModules((prev) =>
                              prev.includes(mod.id) ? prev.filter((id) => id !== mod.id) : [...prev, mod.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                            isChecked
                              ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 cursor-pointer pointer-events-none"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {mod.label}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  isChecked
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {isChecked ? 'Has Access' : 'No Access'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {mod.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Access Flags */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forcePasswordReset}
                      onChange={(e) => setForcePasswordReset(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                        Require password reset on next login
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Employee will set their permanent password on first sign in
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAccountLocked}
                      onChange={(e) => setIsAccountLocked(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                        Lock user account
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Temporarily prevents login without deleting the profile
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Configurable Monthly Targets */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>4. Monthly Target Benchmarks</span>
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400">
                Period: Monthly Quotas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Revenue Quota (₹)
                </label>
                <input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  placeholder="Enter revenue target (e.g. 800000)"
                  step="50000"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leads Target (Count)
                </label>
                <input
                  type="number"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  placeholder="Enter lead target count (e.g. 40)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Outbound Calls Target
                </label>
                <input
                  type="number"
                  value={monthlyCalls}
                  onChange={(e) => setMonthlyCalls(Number(e.target.value))}
                  placeholder="Enter call target count (e.g. 80)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Follow-ups Target
                </label>
                <input
                  type="number"
                  value={monthlyFollowUps}
                  onChange={(e) => setMonthlyFollowUps(Number(e.target.value))}
                  placeholder="Enter follow-up target count (e.g. 35)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Proposals Target
                </label>
                <input
                  type="number"
                  value={monthlyProposals}
                  onChange={(e) => setMonthlyProposals(Number(e.target.value))}
                  placeholder="Enter proposal target count (e.g. 6)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Won Deals Target
                </label>
                <input
                  type="number"
                  value={monthlyWonDeals}
                  onChange={(e) => setMonthlyWonDeals(Number(e.target.value))}
                  placeholder="Enter won deals target count (e.g. 3)"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Pinned Bottom Actions */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[42px] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="add-employee-form"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all min-h-[42px] flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEditing ? 'Save Employee Changes' : 'Create Employee Profile'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
