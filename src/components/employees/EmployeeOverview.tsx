import React from 'react';
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
} from 'lucide-react';
import { Employee } from '../../types/employees';
import {
  EmployeeStatusBadge,
  WorkStatusBadge,
  AttendanceStatusBadge,
} from './EmployeeStatusBadge';

interface EmployeeOverviewProps {
  employee: Employee;
}

export const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({ employee }) => {
  const navigate = useNavigate();

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
