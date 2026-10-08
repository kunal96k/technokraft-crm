import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  Calendar,
  User,
  Briefcase,
  ShieldCheck,
  Building,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  KeyRound,
  Lock,
  Unlock,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import {
  EmployeeStatusBadge,
  WorkStatusBadge,
  AttendanceStatusBadge,
} from './EmployeeStatusBadge';
import {
  SIDEBAR_MODULE_OPTIONS,
  getDefaultModulesForRole,
} from './AddEmployeeModal';

interface EmployeeOverviewProps {
  employee: Employee;
  onResetPassword?: (employee: Employee) => void;
}

export const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({
  employee,
  onResetPassword,
}) => {
  const navigate = useNavigate();
  const [copiedUsername, setCopiedUsername] = useState(false);

  const username = employee.username || employee.email?.split('@')[0] || employee.employeeCode.toLowerCase();
  const effectiveAllowedModules =
    employee.allowedModules && employee.allowedModules.length > 0
      ? employee.allowedModules
      : getDefaultModulesForRole(employee.accessRole || 'Sales Executive');

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(username);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    } catch {
      setCopiedUsername(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Live Working Status Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Live Status:
              </span>
              <WorkStatusBadge status={employee.workStatus} size="sm" />
              <AttendanceStatusBadge status={employee.todayAttendanceStatus} size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current Task: <span className="text-slate-700 dark:text-slate-200 font-medium">{employee.currentActivity}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block">Login Time</span>
            <span className="font-mono font-medium">{employee.loginTime}</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="text-[11px] text-slate-400 block">Today's Duration</span>
            <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {employee.todayWorkingTime}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="text-[11px] text-slate-400 block">Last Active</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">{employee.lastActivityTime}</span>
          </div>
        </div>
      </div>

      {/* Connected CRM Workload Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active CRM Workload
          </h4>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            Live pipeline assignments
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {/* Assigned Leads */}
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group"
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Assigned Leads
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {employee.workload.assignedLeads}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Open Follow-ups */}
          <button
            type="button"
            onClick={() => navigate('/follow-ups')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group"
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Open Follow-ups
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {employee.workload.openFollowUps}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Overdue Follow-ups */}
          <button
            type="button"
            onClick={() => navigate('/follow-ups')}
            className={`p-3 rounded-xl border text-left transition-all group ${
              employee.workload.overdueFollowUps > 0
                ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Overdue
              </span>
              {employee.workload.overdueFollowUps > 0 && (
                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
              )}
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span
                className={`text-xl font-bold font-mono ${
                  employee.workload.overdueFollowUps > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {employee.workload.overdueFollowUps}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Open Tasks */}
          <button
            type="button"
            onClick={() => navigate('/follow-ups/tasks')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group"
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Open Tasks
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {employee.workload.openTasks}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Upcoming Meetings */}
          <button
            type="button"
            onClick={() => navigate('/follow-ups/meetings')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group"
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Meetings
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {employee.workload.upcomingMeetings}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Opportunities */}
          <button
            type="button"
            onClick={() => navigate('/opportunities/pipeline')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group"
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Deals Pipeline
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {employee.workload.openOpportunities}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Proposals */}
          <button
            type="button"
            onClick={() => navigate('/opportunities/proposals')}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group"
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Proposals
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {employee.workload.pendingProposals}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Login Credentials & Security Access Card */}
      <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-100/80 dark:border-indigo-900/40">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Login Credentials & Security Access
            </h4>
          </div>

          {onResetPassword && (
            <button
              type="button"
              onClick={() => onResetPassword(employee)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-600/20 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Reset Password</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* Username */}
          <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 text-[11px] block">Login Username</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {username}
              </span>
              <button
                type="button"
                onClick={handleCopyUsername}
                title="Copy Username"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {copiedUsername ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Password Status */}
          <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 text-[11px] block">Password Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                employee.isPasswordSet
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}>
                <Lock className="w-3 h-3" />
                {employee.isPasswordSet ? 'Active / Configured' : 'Not Set Yet'}
              </span>
            </div>
          </div>

          {/* First Login Policy */}
          <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 text-[11px] block">Reset on Next Sign-in</span>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                employee.forcePasswordReset
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}>
                {employee.forcePasswordReset ? 'Required on Login' : 'Standard Access'}
              </span>
            </div>
          </div>

          {/* Account Lock Status */}
          <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 text-[11px] block">Account Access Lock</span>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                employee.isAccountLocked
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              }`}>
                {employee.isAccountLocked ? (
                  <>
                    <ShieldAlert className="w-3 h-3" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    Unlocked
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation Link Access Overview */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sidebar Navigation & Module Access Rights
            </h4>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            {effectiveAllowedModules.length} of {SIDEBAR_MODULE_OPTIONS.length} Modules Granted
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SIDEBAR_MODULE_OPTIONS.map((mod) => {
            const hasAccess = effectiveAllowedModules.includes(mod.id);
            return (
              <div
                key={mod.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  hasAccess
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                }`}
              >
                <div className="min-w-0 pr-1.5">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {mod.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {hasAccess ? 'Full feature access' : 'Access restricted'}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    hasAccess
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {hasAccess ? '✓ Allowed' : '🔒 Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Company Information & Personal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Company & Employment Details */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Employment & Organization
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Employee ID</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {employee.employeeCode}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Department</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {employee.department}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Designation / Role</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {employee.role}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Reporting Manager</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {employee.reportingManager}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Employment Type</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {employee.employmentType}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Joining Date</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {employee.joiningDate}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">CRM System Access</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {employee.crmAccess ? 'Enabled' : 'Disabled'} ({employee.accessRole})
                </span>
              </div>
              <EmployeeStatusBadge status={employee.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Contact & Personal Information */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Personal & Contact Details
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <span className="text-slate-400 text-[11px] block">Work Email</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
            </div>

            {employee.personalEmail && (
              <div className="col-span-2">
                <span className="text-slate-400 text-[11px] block">Personal Email</span>
                <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {employee.personalEmail}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-400 text-[11px] block">Contact Phone</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {employee.phone}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Gender</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                {employee.gender || 'Not specified'}
              </span>
            </div>

            {employee.dateOfBirth && (
              <div>
                <span className="text-slate-400 text-[11px] block">Date of Birth</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {employee.dateOfBirth}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-400 text-[11px] block">System Created</span>
              <span className="text-slate-500 dark:text-slate-400 mt-0.5 block font-mono text-[11px]">
                {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-GB') : '12 Jan 2025'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
