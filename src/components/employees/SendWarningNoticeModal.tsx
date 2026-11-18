import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Mail,
  Send,
  User,
  ShieldAlert,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Employee } from '../../types/employees';
import { sendDisciplinaryWarning } from '../../services/employeeService';

interface SendWarningNoticeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const SendWarningNoticeModal: React.FC<SendWarningNoticeModalProps> = ({
  isOpen,
  employee,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await sendDisciplinaryWarning(employee.id, {
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onSuccess?.(res.message || `Disciplinary warning notice dispatched to ${employee.name}`);
      onClose();
    } catch (err: any) {
      console.error('[SendWarningNoticeModal] Failed:', err);
      setError(err?.message || 'Failed to dispatch warning email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="px-6 py-4 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Issue Notice of Warning of Termination
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Disciplinary intimation for excessive late attendance or policy non-compliance
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

            {/* Target Employee Info Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60">
                  {employee.avatar || employee.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <span>{employee.name}</span>
                    <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.2 rounded font-semibold">
                      {employee.employeeCode || `TK-${employee.id}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {employee.role || 'Member'} • {employee.department || 'General'} ({employee.employmentType || 'Full-time'})
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{employee.email || employee.personalEmail || 'No email registered'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded-full">
                  Status: {employee.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Email Disciplinary Explanation */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1.5 text-[11px] text-amber-800 dark:text-amber-300">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Notice of Warning of Termination (Template 2)</span>
              </div>
              <p className="leading-relaxed text-amber-700 dark:text-amber-400">
                This will formally deliver the <strong>Warning of Termination</strong> email to <strong>{employee.name}</strong>, with copies to <strong>Super Admin (kunalpatil192001@gmail.com)</strong> and configured CC leadership. The notice informs them that further infractions will result in immediate termination and requires a written response within 24 hours.
              </p>
            </div>

            {/* Reason for Warning */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Specific Disciplinary Reason / Attendance Violation Note (Optional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Repeated late punches on sprint delivery days exceeding monthly allowance. Continued non-compliance despite verbal warnings."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                If provided, this note will be embedded in the official warning email sent to the employee and Super Admin.
              </p>
            </div>

            {/* Internal HR Notes */}
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Internal HR / Management Reference Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Reviewed with Tech Lead; meeting scheduled for tomorrow."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Dispatching Warning...' : 'Dispatch Warning Email'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
