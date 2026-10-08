import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  Eye,
  Edit2,
  TrendingUp,
  Calendar,
  UserX,
  UserCheck,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import {
  EmployeeStatusBadge,
  AttendanceStatusBadge,
  WorkStatusBadge,
} from './EmployeeStatusBadge';

export type SortField = 'name' | 'employeeCode' | 'department' | 'role' | 'joiningDate' | 'status';
export type SortOrder = 'asc' | 'desc';

interface EmployeeTableProps {
  employees: Employee[];
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onViewPerformance?: (employee: Employee) => void;
  onViewAttendance?: (employee: Employee) => void;
  onDeactivate?: (employee: Employee) => void;
  onActivate?: (employee: Employee) => void;
  onResetPassword?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onSelectEmployee?: (employee: Employee) => void;
  onEditEmployee?: (employee: Employee) => void;
  onDeactivateEmployee?: (employee: Employee) => void;
  onActivateEmployee?: (employee: Employee) => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onView,
  onEdit,
  onViewPerformance,
  onViewAttendance,
  onDeactivate,
  onActivate,
  onResetPassword,
  onDelete,
  onSelectEmployee,
  onEditEmployee,
  onDeactivateEmployee,
  onActivateEmployee,
  sortField = 'name',
  sortOrder = 'asc',
  onSort,
}) => {
  const [openActionEmployee, setOpenActionEmployee] = useState<Employee | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  const handleSort = (field: SortField) => {
    if (typeof onSort === 'function') {
      onSort(field);
    }
  };

  const handleView = (emp: Employee) => {
    (onView || onSelectEmployee)?.(emp);
  };

  const handleEdit = (emp: Employee) => {
    (onEdit || onEditEmployee)?.(emp);
  };

  const handleDeactivate = (emp: Employee) => {
    (onDeactivate || onDeactivateEmployee)?.(emp);
  };

  const handleActivate = (emp: Employee) => {
    (onActivate || onActivateEmployee)?.(emp);
  };

  const toggleActionMenu = (emp: Employee, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openActionEmployee?.id === emp.id) {
      setOpenActionEmployee(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeight = 250;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top: number;
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        // Open upwards if not enough room below
        top = rect.top - menuHeight - 4;
      } else {
        // Open downwards
        top = rect.bottom + 4;
      }

      const right = Math.max(16, window.innerWidth - rect.right);
      setOpenActionEmployee(emp);
      setMenuPosition({ top, right });
    }
  };

  // Close popup when clicking elsewhere, scrolling or resizing
  useEffect(() => {
    if (!openActionEmployee) return;

    const handleClose = () => {
      setOpenActionEmployee(null);
      setMenuPosition(null);
    };

    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);

    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [openActionEmployee]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
    );
  };

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <UserX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          No employees found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No employee records match the selected search query or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 select-none">
          <tr>
            <th
              scope="col"
              className="py-3 px-4 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1.5">
                <span>Employee</span>
                {renderSortIndicator('name')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => handleSort('employeeCode')}
            >
              <div className="flex items-center gap-1.5">
                <span>Employee ID</span>
                {renderSortIndicator('employeeCode')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => handleSort('department')}
            >
              <div className="flex items-center gap-1.5">
                <span>Department</span>
                {renderSortIndicator('department')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => handleSort('role')}
            >
              <div className="flex items-center gap-1.5">
                <span>Role</span>
                {renderSortIndicator('role')}
              </div>
            </th>
            <th scope="col" className="py-3 px-3">
              Reporting Manager
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1.5">
                <span>Status</span>
                {renderSortIndicator('status')}
              </div>
            </th>
            <th scope="col" className="py-3 px-3">
              Today's Attendance
            </th>
            <th scope="col" className="py-3 px-3">
              Current Activity
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => handleSort('joiningDate')}
            >
              <div className="flex items-center gap-1.5">
                <span>Joined Date</span>
                {renderSortIndicator('joiningDate')}
              </div>
            </th>
            <th scope="col" className="py-3 px-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {employees.map((emp) => {
            const isMenuOpen = openActionEmployee?.id === emp.id;

            return (
              <tr
                key={emp.id}
                onClick={() => handleView(emp)}
                className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group ${
                  isMenuOpen ? 'bg-purple-50/30 dark:bg-purple-950/20' : ''
                }`}
              >
                {/* Employee Name & Contact */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
                      {emp.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {emp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {emp.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Employee ID */}
                <td className="py-3.5 px-3 whitespace-nowrap font-mono font-medium text-slate-700 dark:text-slate-300 text-xs">
                  {emp.employeeCode}
                </td>

                {/* Department */}
                <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                  {emp.department}
                </td>

                {/* Role */}
                <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {emp.role}
                </td>

                {/* Reporting Manager */}
                <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {emp.reportingManager || '—'}
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <EmployeeStatusBadge status={emp.status} />
                </td>

                {/* Today's Attendance */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <AttendanceStatusBadge status={emp.todayAttendanceStatus} />
                </td>

                {/* Current Activity */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <WorkStatusBadge status={emp.workStatus} />
                </td>

                {/* Joined Date */}
                <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                  {emp.joiningDate}
                </td>

                {/* Actions */}
                <td
                  className="py-3.5 px-3 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleActionMenu(emp, e)}
                    aria-label={`Actions for ${emp.name}`}
                    className={`p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer ${
                      isMenuOpen
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Floating Portal Action Menu (Never stretches or expands table container height) */}
      {openActionEmployee && menuPosition && createPortal(
        <div
          style={{
            position: 'fixed',
            top: menuPosition.top,
            right: menuPosition.right,
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-48 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 text-left animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={() => {
              const emp = openActionEmployee;
              setOpenActionEmployee(null);
              setMenuPosition(null);
              handleView(emp);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const emp = openActionEmployee;
              setOpenActionEmployee(null);
              setMenuPosition(null);
              handleEdit(emp);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Employee</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const emp = openActionEmployee;
              setOpenActionEmployee(null);
              setMenuPosition(null);
              onResetPassword?.(emp);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reset Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const emp = openActionEmployee;
              setOpenActionEmployee(null);
              setMenuPosition(null);
              (onViewPerformance || handleView)(emp);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            <span>View Performance</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const emp = openActionEmployee;
              setOpenActionEmployee(null);
              setMenuPosition(null);
              (onViewAttendance || handleView)(emp);
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>View Attendance</span>
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />

          {openActionEmployee.status === 'Active' ? (
            <button
              type="button"
              onClick={() => {
                const emp = openActionEmployee;
                setOpenActionEmployee(null);
                setMenuPosition(null);
                handleDeactivate(emp);
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Deactivate</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const emp = openActionEmployee;
                setOpenActionEmployee(null);
                setMenuPosition(null);
                handleActivate(emp);
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Activate</span>
            </button>
          )}

          {onDelete && (
            <>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />
              <button
                type="button"
                onClick={() => {
                  const emp = openActionEmployee;
                  setOpenActionEmployee(null);
                  setMenuPosition(null);
                  onDelete(emp);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Employee</span>
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
