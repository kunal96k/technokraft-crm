import React, { useState } from 'react';
import {
  X,
  UserX,
  AlertTriangle,
  Mail,
  Calendar,
  Lock,
  FileText,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import { terminateEmployee } from '../../services/employeeService';

interface TerminateEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const TerminateEmployeeModal: React.FC<TerminateEmployeeModalProps> = ({
  isOpen,
  employee,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [exitNotes, setExitNotes] = useState<string>(
    'Return company laptop, ID access card, and handover pending repository commits to Project Lead.'
  );
  const [revokeAccess, setRevokeAccess] = useState<boolean>(true);
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [confirmUnderstood, setConfirmUnderstood] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Please provide a mandatory termination reason.');
      return;
    }

    if (!confirmUnderstood) {
      setError('Please acknowledge the confirmation checkbox before proceeding.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await terminateEmployee(employee.id, {
        reason: reason.trim(),
        effectiveDate,
        exitNotes: exitNotes.trim() || undefined,
        revokeAccess,
        sendEmail,
      });

      onSuccess?.(res.message || `Employee ${employee.name} has been formally terminated.`);
      onClose();
    } catch (err: any) {
      console.error('[TerminateEmployeeModal] Error:', err);
      setError(err?.message || 'Failed to execute employee termination.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-xl rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header - Fixed Pinned */}
        <div className="px-6 py-4 bg-rose-50/90 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Formal Employee Termination</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/70 text-rose-800 dark:text-rose-200">
                  Critical Disciplinary Action
                </span>
              </h3>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Execute contract termination, deactivate CRM access & dispatch official notice email
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Employee Target Summary */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/60">
                  {employee.avatar || employee.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <span>{employee.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                      {employee.employeeCode || `TK-${employee.id}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {employee.role || 'Member'} • {employee.department || 'General'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{employee.email || employee.personalEmail || 'No email registered'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Type: {employee.employmentType || 'Full-time'}
                </span>
              </div>
            </div>

            {/* Mandatory Reason for Termination */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span>Reason for Termination <span className="text-rose-500">* (Mandatory)</span></span>
                <span className="text-[10px] text-slate-400 font-normal">Included in official letter</span>
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Failure to improve attendance compliance following multiple written warnings. Exceeded monthly late allowance for three consecutive quarters without acceptable justification."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400"
              />
            </div>

            {/* Effective Termination Date */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Effective Termination Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Handover & Exit Checklist Instructions */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Exit & Asset Handover Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={exitNotes}
                onChange={(e) => setExitNotes(e.target.value)}
                placeholder="e.g. Handover all work-in-progress tasks, repository credentials, and company property to the Tech Lead."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Action Toggles */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revokeAccess}
                  onChange={(e) => setRevokeAccess(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Immediately deactivate CRM account & revoke credentials
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Sets status = Inactive, logs out active sessions, and disables portal login.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Dispatch Template 3: Official Notice of Termination Email
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Sends branded termination letter to employee with CC to Super Admin (kunalpatil192001@gmail.com) and HR compliance.
                  </span>
                </div>
              </label>
            </div>

            {/* Mandatory Confirmation Checkbox */}
            <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmUnderstood}
                  onChange={(e) => setConfirmUnderstood(e.target.checked)}
                  className="mt-0.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-rose-900 dark:text-rose-200 leading-relaxed">
                  I confirm that this termination decision is authorized and compliant with organizational policies. This action cannot be automatically undone.
                </span>
              </label>
            </div>
          </div>

          {/* Footer - Fixed Pinned Actions */}
          <div className="flex-shrink-0 px-6 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !confirmUnderstood || !reason.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Processing Termination...' : 'Confirm & Terminate Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
