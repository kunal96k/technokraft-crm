import React, { useState } from 'react';
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
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onViewPerformance: (employee: Employee) => void;
  onViewAttendance: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
  onActivate: (employee: Employee) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onView,
  onEdit,
  onViewPerformance,
  onViewAttendance,
  onDeactivate,
  onActivate,
  sortField,
  sortOrder,
  onSort,
}) => {
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenActionId(openActionId === id ? null : id);
  };

  // Close popup when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-1.5">
                <span>Employee</span>
                {renderSortIndicator('name')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => onSort('employeeCode')}
            >
              <div className="flex items-center gap-1.5">
                <span>Employee ID</span>
                {renderSortIndicator('employeeCode')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => onSort('department')}
            >
              <div className="flex items-center gap-1.5">
                <span>Department</span>
                {renderSortIndicator('department')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3 px-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
              onClick={() => onSort('role')}
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
              onClick={() => onSort('status')}
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
              onClick={() => onSort('joiningDate')}
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
            const isMenuOpen = openActionId === emp.id;

            return (
              <tr
                key={emp.id}
                onClick={() => onView(emp)}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
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
                <td className="py-3.5 px-3">
                  <span className="font-mono text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    {emp.employeeCode}
                  </span>
                </td>

                {/* Department */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {emp.department}
                  </span>
                </td>

                {/* Role */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="text-slate-600 dark:text-slate-300">{emp.role}</span>
                </td>

                {/* Manager */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {emp.reportingManager}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <EmployeeStatusBadge status={emp.status} size="sm" />
                </td>

                {/* Today Attendance */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <AttendanceStatusBadge status={emp.todayAttendanceStatus} size="sm" />
                    {emp.loginTime !== '—' && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        ({emp.loginTime})
                      </span>
                    )}
                  </div>
                </td>

                {/* Current Activity */}
                <td className="py-3.5 px-3 max-w-[220px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <WorkStatusBadge status={emp.workStatus} size="sm" />
                    <span
                      className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                      title={emp.currentActivity}
                    >
                      {emp.currentActivity}
                    </span>
                  </div>
                </td>

                {/* Joined Date */}
                <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                  {emp.joiningDate}
                </td>

                {/* Actions */}
                <td
                  className="py-3.5 px-3 text-right whitespace-nowrap relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleActionMenu(emp.id, e)}
                    aria-label={`Actions for ${emp.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-3 top-10 w-48 rounded-xl shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenActionId(null);
                          onView(emp);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenActionId(null);
                          onEdit(emp);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit Employee</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenActionId(null);
                          onViewPerformance(emp);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                        <span>View Performance</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenActionId(null);
                          onViewAttendance(emp);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>View Attendance</span>
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />

                      {emp.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenActionId(null);
                            onDeactivate(emp);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Deactivate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenActionId(null);
                            onActivate(emp);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
