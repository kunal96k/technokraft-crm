import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Edit2,
  UserX,
  UserCheck,
  TrendingUp,
  UserPlus,
  CalendarCheck,
  CheckSquare,
  Clock,
  Briefcase,
  Layers,
  Activity,
  Target,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import { EmployeeStatusBadge, WorkStatusBadge } from './EmployeeStatusBadge';
import { EmployeeOverview } from './EmployeeOverview';
import { EmployeeActivity } from './EmployeeActivity';
import { EmployeeTargets } from './EmployeeTargets';
import { EmployeeAttendanceSummary } from './EmployeeAttendanceSummary';

interface EmployeeDetailsProps {
  employee: Employee;
  onClose?: () => void;
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onActivate: (employee: Employee) => void;
  isModalOrDrawer?: boolean;
}

export const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({
  employee,
  onClose,
  onEdit,
  onDeactivate,
  onActivate,
  isModalOrDrawer = true,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'targets' | 'attendance'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'activity', label: 'Activity & Logs', icon: Activity },
    { id: 'targets', label: 'Targets & Quota', icon: Target },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/60 overflow-hidden">
      {/* Top Header Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-base flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
              {employee.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {employee.name}
                </h2>
                <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {employee.employeeCode}
                </span>
                <EmployeeStatusBadge status={employee.status} size="sm" />
                <WorkStatusBadge status={employee.workStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {employee.role} • {employee.department} • Reports to {employee.reportingManager}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onEdit(employee)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/reports/performance/${employee.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>View Performance</span>
            </button>

            {employee.status === 'Active' ? (
              <button
                type="button"
                onClick={() => onDeactivate(employee)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 transition-colors"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Deactivate</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onActivate(employee)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Activate</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Manager Actions Toolbar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Manager Actions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/leads')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-500" />
              <span>Assign Lead</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/follow-ups')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Assign Follow-up</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/follow-ups/tasks')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
              <span>Assign Task</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/follow-ups/meetings')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Schedule Meeting</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/reports/performance/${employee.id}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>View Performance</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 overflow-y-auto">
        {activeTab === 'overview' && <EmployeeOverview employee={employee} />}
        {activeTab === 'activity' && <EmployeeActivity employee={employee} />}
        {activeTab === 'targets' && <EmployeeTargets employee={employee} />}
        {activeTab === 'attendance' && (
          <EmployeeAttendanceSummary employee={employee} />
        )}
      </div>
    </div>
  );
};
