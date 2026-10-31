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
  ShieldCheck,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import {
  EmployeeStatusBadge,
  AttendanceStatusBadge,
  WorkStatusBadge,
} from './EmployeeStatusBadge';
import { buildSafeApiUrl } from '../../utils/urlUtils';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdminRecord, shouldMaskForSecurity } from '../../utils/securityUtils';

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
  const { user } = useAuth();
  const isSuperAdmin = isSuperAdminRecord(employee);
  const isOwnProfile = !!user && (String(user.id) === String(employee.id) || (!!user.employeeCode && user.employeeCode === employee.employeeCode));
  const canModify = !isSuperAdmin || isOwnProfile;
  const isMasked = shouldMaskForSecurity(employee, user);

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
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-sm flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60 overflow-hidden">
            {isMasked ? (
              <ShieldCheck className="w-5 h-5 text-[#5B4DB7] dark:text-purple-300" />
            ) : employee.profilePhoto ? (
              <img
                src={buildSafeApiUrl(employee.profilePhoto)}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            ) : (
              employee.avatar
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                {isMasked ? (
                  <>
                    <span className="blur-[3px] select-none">{employee.name}</span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                      Protected
                    </span>
                  </>
                ) : (
                  employee.name
                )}
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
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">Today:</span>
          <AttendanceStatusBadge status={employee.todayAttendanceStatus} size="sm" />
          <WorkStatusBadge status={employee.workStatus} size="sm" />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300 font-medium">
          <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          <span>{employee.shiftStartTime || '10:00 AM'} - {employee.shiftEndTime || '04:00 PM'}</span>
        </div>
      </div>

      {/* Contact & Manager info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">
            {isMasked ? <span className="blur-[3px] select-none">{employee.email}</span> : employee.email}
          </span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-[11px]">
            {isMasked ? '••••••••••' : employee.phone}
          </span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          Username:{' '}
          <span className="font-mono text-slate-600 dark:text-slate-300">
            {isMasked ? '••••••••' : (employee.username || employee.email.split('@')[0])}
          </span>
        </span>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isMasked ? (
            <button
              type="button"
              onClick={handleSelect}
              title="View Protected Details"
              className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
          ) : (
            <>
              {onResetPassword && canModify && (
                <button
                  type="button"
                  onClick={() => onResetPassword(employee)}
                  title="Reset Password"
                  className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
              )}
              {onEdit && canModify && (
                <button
                  type="button"
                  onClick={() => onEdit(employee)}
                  title="Edit Profile"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Primary Super Admin can NEVER be deleted */}
              {onDelete && !isSuperAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(employee);
                  }}
                  title="Delete Employee"
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onViewPerformance && (
                <button
                  type="button"
                  onClick={() => onViewPerformance(employee)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-100 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Performance</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSelect}
                title="View Details"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
