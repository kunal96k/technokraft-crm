import React, { useState } from 'react';
import {
  X,
  User,
  Building,
  ShieldCheck,
  Target,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import {
  Employee,
  DepartmentType,
  EmployeeRole,
  EmploymentType,
  EmployeeStatus,
  CrmAccessRole,
} from '../../types/employees';
import { DEPARTMENTS, EMPLOYEE_ROLES, MANAGERS } from '../../data/mockEmployees';

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
    initialEmployee?.reportingManager || MANAGERS[0]
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

  // CRM Access
  const [crmAccess, setCrmAccess] = useState(initialEmployee?.crmAccess ?? true);
  const [accessRole, setAccessRole] = useState<CrmAccessRole>(
    initialEmployee?.accessRole || 'Sales Executive'
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

  // Auto-generate company email if first & last name typed
  const handleNameBlur = () => {
    if (!companyEmail && firstName && lastName) {
      setCompanyEmail(
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@technokraftservices.com`
      );
    }
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
      reportingManager,
      employmentType,
      joiningDate,
      status,
      crmAccess,
      accessRole,
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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
                  placeholder="e.g. Rahul"
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
                  placeholder="e.g. Patil"
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
                  placeholder="+91 98230 45612"
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
                  placeholder="rahul.personal@gmail.com"
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
                  placeholder="first.last@technokraftservices.com"
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
                  Reporting Manager *
                </label>
                <select
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  {MANAGERS.map((mgr) => (
                    <option key={mgr} value={mgr}>
                      {mgr}
                    </option>
                  ))}
                </select>
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

          {/* Section 3: CRM Access */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>3. CRM Permissions & Role</span>
            </div>

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
              <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-800 max-w-xs">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned CRM Access Role
                </label>
                <select
                  value={accessRole}
                  onChange={(e) => setAccessRole(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                >
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee (Read Only)</option>
                </select>
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
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions (min 44px touch target on mobile) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all min-h-[44px] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Save Employee Changes' : 'Create Employee Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
