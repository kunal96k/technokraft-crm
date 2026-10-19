import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  toInputTime,
  toDisplayTime,
  DEFAULT_SHIFT_START_INPUT,
  DEFAULT_SHIFT_END_INPUT,
  DEFAULT_SHIFT_START,
  DEFAULT_SHIFT_END,
} from '../../utils/shiftUtils';
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
import { isSuperAdminRecord } from '../../utils/securityUtils';

export const SIDEBAR_MODULE_OPTIONS = [
  { id: 'dashboard', label: 'CRM Dashboard', desc: 'KPI metrics, live team workload & conversion charts', defaultFor: ['Admin', 'Manager', 'Sales Manager', 'Sales Executive', 'Business Analyst', 'Employee'] },
  { id: 'leads', label: 'Leads Management', desc: 'Full leads directory, lead qualification, manual lead & bulk CSV import', defaultFor: ['Admin', 'Manager', 'Sales Manager', 'Sales Executive', 'Business Analyst'] },
  { id: 'communication', label: 'Communication Hub', desc: 'Corporate email dispatch, WhatsApp messaging & call logging', defaultFor: ['Admin', 'Manager', 'Sales Manager', 'Sales Executive'] },
  { id: 'follow-ups', label: 'Activity & Follow-ups', desc: 'Outbound follow-up schedule, task tracker & client meetings', defaultFor: ['Admin', 'Manager', 'Sales Manager', 'Sales Executive', 'Business Analyst', 'Employee'] },
  { id: 'opportunities', label: 'Sales Opportunities', desc: 'Deal pipeline stages, revenue forecasting & commercial proposal quotes', defaultFor: ['Admin', 'Manager', 'Sales Manager', 'Sales Executive', 'Business Analyst'] },
  { id: 'reports', label: 'Performance & Reports', desc: 'Executive KPI reporting & conversion funnel analytics', defaultFor: ['Admin', 'Manager', 'Sales Manager'] },
  { id: 'employees', label: 'Employee Administration', desc: 'Team member directory, attendance records & audits', defaultFor: ['Admin', 'Manager', 'Sales Manager'] },
  { id: 'settings', label: 'System Settings', desc: 'System configuration, pipeline stages & master parameters', defaultFor: ['Admin'] },
];

export const getDefaultModulesForRole = (role: string): string[] => {
  const normRole = (role || '').trim().toLowerCase();
  return SIDEBAR_MODULE_OPTIONS.filter((m) =>
    m.defaultFor.some((df) => {
      const ndf = df.toLowerCase();
      if (ndf === normRole) return true;
      if ((ndf === 'manager' || ndf === 'sales manager') && (normRole === 'manager' || normRole === 'sales manager')) return true;
      if (normRole.includes('admin') && ndf.includes('admin')) return true;
      return false;
    })
  ).map((m) => m.id);
};

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => void | Promise<void>;
  initialEmployee?: Employee | null;
}

const cleanDateForInput = (d?: string | null): string => {
  if (!d) return '';
  const match = String(d).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
};

const getInitialFormValues = (emp?: Employee | null) => {
  if (!emp) {
    return {
      firstName: '',
      lastName: '',
      phone: '+91 ',
      personalEmail: '',
      gender: 'Male' as const,
      dob: '',
      employeeCode: `EMP-00${Math.floor(Math.random() * 80 + 30)}`,
      companyEmail: '',
      department: 'Sales',
      role: 'Sales Executive',
      reportingManager: '',
      employmentType: 'Full Time' as EmploymentType,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active' as EmployeeStatus,
      crmAccess: true,
      accessRole: 'Sales Executive' as CrmAccessRole,
      allowedModules: getDefaultModulesForRole('Sales Executive'),
      username: '',
      forcePasswordReset: true,
      isAccountLocked: false,
      monthlyRevenue: 800000,
      monthlyLeads: 40,
      monthlyCalls: 80,
      monthlyFollowUps: 35,
      monthlyProposals: 6,
      monthlyWonDeals: 3,
      shiftStartTime: DEFAULT_SHIFT_START_INPUT,
      shiftEndTime: DEFAULT_SHIFT_END_INPUT,
    };
  }

  // Name splitting fallback if firstName/lastName were not stored individually
  let fName = emp.firstName || '';
  let lName = emp.lastName || '';
  if (!fName && !lName && emp.name) {
    const parts = emp.name.trim().split(/\s+/);
    fName = parts[0] || '';
    lName = parts.slice(1).join(' ') || '';
  }

  const cleanDob = cleanDateForInput(emp.dateOfBirth);
  const cleanJoinDate = cleanDateForInput(emp.joiningDate) || new Date().toISOString().split('T')[0];
  const empAccessRole = (emp.accessRole || (emp.role as any) || 'Employee') as CrmAccessRole;

  return {
    firstName: fName,
    lastName: lName,
    phone: emp.phone || '+91 ',
    personalEmail: emp.personalEmail || '',
    gender: (emp.gender || 'Male') as 'Male' | 'Female' | 'Other',
    dob: cleanDob,
    employeeCode: emp.employeeCode || '',
    companyEmail: emp.email || '',
    department: emp.department || 'Sales',
    role: emp.role || 'Sales Executive',
    reportingManager: emp.reportingManager || '',
    employmentType: (emp.employmentType || 'Full Time') as EmploymentType,
    joiningDate: cleanJoinDate,
    status: (emp.status || 'Active') as EmployeeStatus,
    crmAccess: emp.crmAccess ?? true,
    accessRole: empAccessRole,
    allowedModules:
      emp.allowedModules !== undefined && emp.allowedModules !== null && Array.isArray(emp.allowedModules)
        ? emp.allowedModules
        : getDefaultModulesForRole(empAccessRole),
    username: emp.username || (emp.email ? emp.email.split('@')[0] : ''),
    forcePasswordReset: emp.forcePasswordReset ?? false,
    isAccountLocked: emp.isAccountLocked ?? false,
    monthlyRevenue: emp.targets?.monthlyRevenueTarget ?? 800000,
    monthlyLeads: emp.targets?.monthlyLeadTarget ?? 40,
    monthlyCalls: emp.targets?.monthlyCallTarget ?? 80,
    monthlyFollowUps: emp.targets?.monthlyFollowUpTarget ?? 35,
    monthlyProposals: emp.targets?.monthlyProposalTarget ?? 6,
    monthlyWonDeals: emp.targets?.monthlyWonDealTarget ?? 3,
    shiftStartTime: toInputTime(emp.shiftStartTime, DEFAULT_SHIFT_START_INPUT),
    shiftEndTime: toInputTime(emp.shiftEndTime, DEFAULT_SHIFT_END_INPUT),
  };
};

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEmployee,
}) => {
  const isEditing = !!initialEmployee;
  const initialValues = useMemo(() => getInitialFormValues(initialEmployee), [initialEmployee]);

  // Form State
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [phone, setPhone] = useState(initialValues.phone);
  const [personalEmail, setPersonalEmail] = useState(initialValues.personalEmail);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(initialValues.gender);
  const [dob, setDob] = useState(initialValues.dob);

  // Company Info
  const [employeeCode, setEmployeeCode] = useState(initialValues.employeeCode);
  const [companyEmail, setCompanyEmail] = useState(initialValues.companyEmail);
  const [department, setDepartment] = useState<DepartmentType | string>(initialValues.department);
  const [role, setRole] = useState<EmployeeRole | string>(initialValues.role);
  const [reportingManager, setReportingManager] = useState(initialValues.reportingManager);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initialValues.employmentType);
  const [joiningDate, setJoiningDate] = useState(initialValues.joiningDate);
  const [status, setStatus] = useState<EmployeeStatus>(initialValues.status);
  const [shiftStartTime, setShiftStartTime] = useState(initialValues.shiftStartTime);
  const [shiftEndTime, setShiftEndTime] = useState(initialValues.shiftEndTime);

  // CRM Access & Credentials
  const [crmAccess, setCrmAccess] = useState(initialValues.crmAccess);
  const [accessRole, setAccessRole] = useState<CrmAccessRole>(initialValues.accessRole);
  const [allowedModules, setAllowedModules] = useState<string[]>(initialValues.allowedModules);
  const [username, setUsername] = useState(initialValues.username);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forcePasswordReset, setForcePasswordReset] = useState(initialValues.forcePasswordReset);
  const [isAccountLocked, setIsAccountLocked] = useState(initialValues.isAccountLocked);

  // Target Settings
  const [monthlyRevenue, setMonthlyRevenue] = useState(initialValues.monthlyRevenue);
  const [monthlyLeads, setMonthlyLeads] = useState(initialValues.monthlyLeads);
  const [monthlyCalls, setMonthlyCalls] = useState(initialValues.monthlyCalls);
  const [monthlyFollowUps, setMonthlyFollowUps] = useState(initialValues.monthlyFollowUps);
  const [monthlyProposals, setMonthlyProposals] = useState(initialValues.monthlyProposals);
  const [monthlyWonDeals, setMonthlyWonDeals] = useState(initialValues.monthlyWonDeals);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Synchronize state every time initialEmployee changes or modal is opened
  useEffect(() => {
    if (!isOpen) return;
    const values = getInitialFormValues(initialEmployee);
    setFirstName(values.firstName);
    setLastName(values.lastName);
    setPhone(values.phone);
    setPersonalEmail(values.personalEmail);
    setGender(values.gender);
    setDob(values.dob);
    setEmployeeCode(values.employeeCode);
    setCompanyEmail(values.companyEmail);
    setDepartment(values.department);
    setRole(values.role);
    setReportingManager(values.reportingManager);
    setEmploymentType(values.employmentType);
    setJoiningDate(values.joiningDate);
    setStatus(values.status);
    setShiftStartTime(values.shiftStartTime);
    setShiftEndTime(values.shiftEndTime);
    setCrmAccess(values.crmAccess);
    setAccessRole(values.accessRole);
    setAllowedModules(values.allowedModules);
    setUsername(values.username);
    setPassword('');
    setShowPassword(false);
    setForcePasswordReset(values.forcePasswordReset);
    setIsAccountLocked(values.isAccountLocked);
    setMonthlyRevenue(values.monthlyRevenue);
    setMonthlyLeads(values.monthlyLeads);
    setMonthlyCalls(values.monthlyCalls);
    setMonthlyFollowUps(values.monthlyFollowUps);
    setMonthlyProposals(values.monthlyProposals);
    setMonthlyWonDeals(values.monthlyWonDeals);
    setIsSubmitting(false);
    setServerError('');
  }, [initialEmployee, isOpen]);

  // Dynamic dropdown options so current custom values are never lost
  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set([
        ...DEPARTMENTS,
        ...(department ? [department] : []),
        ...(initialEmployee?.department ? [initialEmployee.department] : []),
      ])
    );
  }, [department, initialEmployee?.department]);

  const roleOptions = useMemo(() => {
    return Array.from(
      new Set([
        ...EMPLOYEE_ROLES,
        ...(role ? [role] : []),
        ...(initialEmployee?.role ? [initialEmployee.role] : []),
      ])
    );
  }, [role, initialEmployee?.role]);

  // Auto-generate company email & username if first & last name typed
  const handleNameBlur = () => {
    if (isEditing) return; // Do not overwrite existing employee credentials on blur
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

    const employeeData: Partial<Employee> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName || initialEmployee?.name || 'Employee',
      avatar: initials || initialEmployee?.avatar || 'EM',
      email: companyEmail.trim().toLowerCase(),
      personalEmail: personalEmail.trim(),
      phone: phone.trim(),
      gender,
      dateOfBirth: dob || undefined,
      employeeCode: employeeCode.trim(),
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
      shiftStartTime: toDisplayTime(shiftStartTime, DEFAULT_SHIFT_START),
      shiftEndTime: toDisplayTime(shiftEndTime, DEFAULT_SHIFT_END),
      targets: {
        period: 'Monthly',
        monthlyRevenueTarget: Number(monthlyRevenue) || 0,
        monthlyLeadTarget: Number(monthlyLeads) || 0,
        monthlyCallTarget: Number(monthlyCalls) || 0,
        monthlyFollowUpTarget: Number(monthlyFollowUps) || 0,
        monthlyProposalTarget: Number(monthlyProposals) || 0,
        monthlyWonDealTarget: Number(monthlyWonDeals) || 0,
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

    try {
      setIsSubmitting(true);
      setServerError('');
      await onSave(employeeData);
    } catch (err: any) {
      console.error('[AddEmployeeModal] Submit error:', err);
      setServerError(err?.message || 'Failed to save employee profile. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Employee Profile' : 'Add New Employee'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? `Update company information, CRM permissions and monthly targets for ${initialEmployee?.name || (firstName ? `${firstName} ${lastName}`.trim() : 'employee')}`
                : 'Onboard a new employee to TechnoKraft CRM system and configure initial quotas'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form id="add-employee-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {serverError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{isEditing ? 'Profile Update Notice' : 'Registration Notice'}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-rose-600 dark:text-rose-400">{serverError}</p>
              </div>
              <button
                type="button"
                onClick={() => setServerError('')}
                className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                  {departmentOptions.map((dept) => (
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
                  {roleOptions.map((r) => (
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

              {/* Work Shift Schedule (Default: 10:00 AM – 04:00 PM) */}
              <div className="col-span-full pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Work Shift Schedule & Attendance Rules</span>
                  </div>
                  <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/60">
                    Default: 10:00 AM – 04:00 PM (15m Grace)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Shift Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={shiftStartTime}
                      onChange={(e) => setShiftStartTime(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Punch-in after +15 min grace period will be marked <strong className="text-amber-600 dark:text-amber-400">Late</strong>. Before shift is marked <strong className="text-teal-600 dark:text-teal-400">Early</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Shift End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={shiftEndTime}
                      onChange={(e) => setShiftEndTime(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Working less than full shift duration will be calculated as <strong className="text-indigo-600 dark:text-indigo-400">Half Day</strong> or <strong className="text-rose-600 dark:text-rose-400">Absent</strong>.
                    </p>
                  </div>
                </div>
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
                    disabled={isSuperAdminRecord(initialEmployee)}
                    onChange={(e) => {
                      const newRole = e.target.value as CrmAccessRole;
                      setAccessRole(newRole);
                      // Only auto-apply default modules for new employees.
                      // When editing, keep existing custom selections — user can
                      // click "Role Default" to reset to the new role's defaults.
                      if (!isEditing) {
                        setAllowedModules(getDefaultModulesForRole(newRole));
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSuperAdminRecord(initialEmployee) ? (
                      <option value="Super Admin">Super Admin (Primary System Role)</option>
                    ) : (
                      <>
                        <option value="Employee">Employee (Standard Access)</option>
                        <option value="Sales Executive">Sales Executive</option>
                        <option value="Business Analyst">Business Analyst</option>
                        <option value="Manager">Manager</option>
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Admin">Admin (Full System Access)</option>
                        {!['Super Admin', 'Employee', 'Sales Executive', 'Business Analyst', 'Manager', 'Sales Manager', 'Admin'].includes(accessRole) && (
                          <option value={accessRole}>{accessRole}</option>
                        )}
                      </>
                    )}
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
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all min-h-[42px] flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Save Employee Changes' : 'Create Employee Profile'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
