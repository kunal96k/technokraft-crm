import React from 'react';
import {
  Eye,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  Clock,
  KeyRound,
  Lock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import {
  EmployeeStatusBadge,
  AttendanceStatusBadge,
  WorkStatusBadge,
} from './EmployeeStatusBadge';

interface EmployeeCardProps {
  employee: Employee;
  onView?: (employee: Employee) => void;
  onSelect?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
  onDeactivate?: (employee: Employee) => void;
  onActivate?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onViewPerformance?: (employee: Employee) => void;
  onViewAttendance?: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onView,
  onSelect,
  onEdit,
  onResetPassword,
  onDeactivate,
  onActivate,
  onDelete,
  onViewPerformance,
  onViewAttendance,
}) => {
  const handleSelect = () => {
    (onView || onSelect)?.(employee);
  };
  return (
    <div
      onClick={handleSelect}
      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-purple-300 dark:hover:border-purple-800/60 transition-all cursor-pointer flex flex-col gap-3"
    >
      {/* Header with Avatar, Name, and Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-sm flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
            {employee.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                {employee.name}
              </h4>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {employee.employeeCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {employee.role} • {employee.department}
            </p>
          </div>
        </div>

        <EmployeeStatusBadge status={employee.status} size="sm" />
      </div>

      {/* Live Activity & Attendance Row */}
      <div className="flex flex-wrap items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">Today:</span>
          <AttendanceStatusBadge status={employee.todayAttendanceStatus} size="sm" />
        </div>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <WorkStatusBadge status={employee.workStatus} size="sm" />
          <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
            {employee.currentActivity}
          </span>
        </div>
      </div>

      {/* Contact & Manager info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">{employee.email}</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">{employee.phone}</span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          Username: <span className="font-mono text-slate-600 dark:text-slate-300">{employee.username || employee.email.split('@')[0]}</span>
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {onResetPassword && (
            <button
              type="button"
              onClick={() => onResetPassword(employee)}
              title="Reset Password"
              className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(employee)}
              title="Edit Profile"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(employee);
              }}
              title="Delete Employee"
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onViewPerformance && (
            <button
              type="button"
              onClick={() => onViewPerformance(employee)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Performance</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSelect}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
