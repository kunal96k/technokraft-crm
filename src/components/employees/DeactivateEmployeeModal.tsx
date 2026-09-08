import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Employee } from '../../types/employees';

interface DeactivateEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: (employee: Employee) => void;
}

export const DeactivateEmployeeModal: React.FC<DeactivateEmployeeModalProps> = ({
  isOpen,
  employee,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900/40">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Deactivate Employee?
            </h3>
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
              {employee.name} ({employee.employeeCode})
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Existing CRM history, past call logs, and customer interactions will be preserved.
            The employee will no longer be available for new lead assignments or CRM logins.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(employee);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
          >
            Deactivate Employee
          </button>
        </div>
      </div>
    </div>
  );
};
