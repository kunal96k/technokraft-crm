import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserCheck,
  Building2,
  Briefcase,
  FileText,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Lead } from '../../types/leads';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { EmployeeAvatar } from '../common/EmployeeAvatar';
import { assignLead } from '../../services/leadService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { findCachedEmployee } from '../../services/employeeService';

interface AssignLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: Lead) => void;
}

export const AssignLeadModal: React.FC<AssignLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const [salesExecName, setSalesExecName] = useState<string>('');
  const [baName, setBaName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setSalesExecName(lead.assignedEmployee?.name || '');
      setBaName(lead.assignedBA?.name || '');
      setNote('');
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesExecName.trim()) {
      toast.warning('Please select an active Sales Executive to assign the lead.', 'Validation');
      return;
    }

    setIsSubmitting(true);
    try {
      const salesEmp = findCachedEmployee(salesExecName);
      const baEmp = baName ? findCachedEmployee(baName) : undefined;

      const payload = {
        employeeName: salesExecName.trim(),
        employeeEmail: salesEmp?.email,
        employeeRole: salesEmp?.role || salesEmp?.accessRole || 'Sales Executive',
        employeeAvatar: salesEmp?.avatar,
        assignedBAName: baName.trim() || undefined,
        assignedBARole: baEmp?.role || baEmp?.accessRole || 'Business Analyst',
        note: note.trim() || undefined,
        updatedByName: authUser?.name || 'Administrator',
        updatedByEmail: authUser?.email,
        updatedByRole: authUser?.role,
      };

      const updated = await assignLead(lead.id, payload);
      if (updated) {
        toast.success(
          `Lead ${lead.leadCode} (${lead.company.name}) successfully assigned to ${salesExecName}.`,
          'Lead Assigned'
        );
        window.dispatchEvent(new Event('crm-leads-updated'));
        window.dispatchEvent(new Event('crm-opportunities-updated'));
        if (onSuccess) {
          onSuccess(updated);
        }
        onClose();
      } else {
        toast.error('Failed to assign lead');
      }
    } catch (err: any) {
      console.error('Error assigning lead:', err);
      toast.error(err.message || 'Error communicating with backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800/60 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Assign Lead Ownership
                </h3>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                  {lead.leadCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lead.company?.name} • Service: {lead.service}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Allocation Pill */}
        <div className="px-5 py-3 bg-purple-50/40 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">Current Owner:</span>
            <div className="flex items-center gap-1.5 truncate">
              <EmployeeAvatar
                name={lead.assignedEmployee?.name || 'Unassigned'}
                avatar={lead.assignedEmployee?.avatar}
                profilePhoto={lead.assignedEmployee?.profilePhoto}
                email={lead.assignedEmployee?.email}
                size="xs"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {lead.assignedEmployee?.name || 'Unassigned'}
              </span>
            </div>
          </div>

          {lead.assignedBA && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">Current BA:</span>
              <div className="flex items-center gap-1.5 truncate">
                <EmployeeAvatar
                  name={lead.assignedBA.name}
                  avatar={lead.assignedBA.avatar}
                  profilePhoto={lead.assignedBA.profilePhoto}
                  size="xs"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {lead.assignedBA.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Primary Sales Executive Typeahead */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Sales Executive <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1.5">
              Type ahead to search active employees by name, ID, or role.
            </p>
            <EmployeeSelect
              value={salesExecName}
              onChange={(e) => {
                const val = typeof e === 'string' ? e : e.target.value;
                setSalesExecName(val);
              }}
              placeholder="Search active sales executives..."
              allowEmpty={false}
              className="w-full"
            />
          </div>

          {/* Assigned Business Analyst (BA) Typeahead */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Business Analyst (Optional)
            </label>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1.5">
              Allocate a technical consultant or BA to support client scoping.
            </p>
            <EmployeeSelect
              value={baName}
              onChange={(e) => {
                const val = typeof e === 'string' ? e : e.target.value;
                setBaName(val);
              }}
              placeholder="Search active Business Analysts / Consultants..."
              allowEmpty={true}
              showAllOption="None (No BA assigned)"
              className="w-full"
            />
          </div>

          {/* Reassignment Notes / Handoff instructions */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Handover Note / Context (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide briefing notes, client context, or handover priority for the new assignee..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !salesExecName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#5B4DB7] hover:bg-[#4d40a0] text-white shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Confirm Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
