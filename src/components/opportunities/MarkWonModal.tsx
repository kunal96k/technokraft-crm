import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Trophy, IndianRupee, FolderKanban, Users, Calendar } from 'lucide-react';
import { OpportunityRecord } from '../../types/opportunities';
import { formatCurrencyINR } from '../../utils/currencyFormatters';
import { createProjectFromOpportunity } from '../../services/projectService';
import { fetchEmployees } from '../../services/employeeService';
import { Employee } from '../../types/employees';

interface MarkWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: OpportunityRecord | null;
  onConfirmWon?: (id: string, finalValue: number, closingDate: string, notes: string) => void;
  onConfirm?: (id: string, finalValue: number, closingDate: string, notes: string) => void;
}

export const MarkWonModal: React.FC<MarkWonModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onConfirmWon,
  onConfirm,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTargetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [finalValue, setFinalValue] = useState<string>(String(opportunity?.estimatedValue || ''));
  const [closingDate, setClosingDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<string>(
    'Client accepted commercial terms. Contract signed and advance invoice initiated.'
  );

  // Delivery project initiation options
  const [autoCreateProject, setAutoCreateProject] = useState(true);
  const [projectManagerId, setProjectManagerId] = useState<string>('');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState<string>(defaultTargetDate);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees({ size: 100 })
      .then((res) => setEmployees(res.content || []))
      .catch((err) => console.warn('Failed to load employee list for PM assignment:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    setIsSubmitting(true);
    const numVal = parseInt(finalValue.replace(/[^0-9]/g, ''), 10) || opportunity.estimatedValue;

    try {
      // 1. Mark deal won in Opportunities
      const confirmFn = onConfirm || onConfirmWon;
      if (confirmFn) {
        confirmFn(opportunity.id, numVal, closingDate, notes);
      }

      // 2. If checked, initialize Delivery Project in Jira-style hub
      if (autoCreateProject) {
        try {
          await createProjectFromOpportunity(
            opportunity.id,
            projectManagerId ? Number(projectManagerId) : undefined,
            targetDeliveryDate
          );
          window.dispatchEvent(new Event('crm-projects-updated'));
        } catch (projErr) {
          console.error('Failed to auto-create delivery project:', projErr);
        }
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Mark Opportunity as Won
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Celebrate closure & transition to Jira-style service delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Company:</span>
              <strong className="text-slate-900 dark:text-white">{opportunity.companyName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Opportunity:</span>
              <strong className="text-slate-900 dark:text-white text-right">{opportunity.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Service:</span>
              <span className="text-slate-700 dark:text-slate-300">{opportunity.service}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Final Closed Value (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="number"
                  required
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Estimated: {formatCurrencyINR(opportunity.estimatedValue)}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Closing Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Closure Notes / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Enter closure notes, agreed payment milestones, and contract details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Delivery Project Automatic Initiation Section */}
          <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 rounded-xl space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoCreateProject}
                onChange={(e) => setAutoCreateProject(e.target.checked)}
                className="w-4 h-4 rounded text-[#5B4DB7] focus:ring-[#5B4DB7] accent-[#5B4DB7]"
              />
              <span className="font-bold text-slate-900 dark:text-purple-200 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Initialize Delivery Project automatically</span>
              </span>
            </label>

            {autoCreateProject && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-purple-200/60 dark:border-purple-900/40">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Manager
                  </label>
                  <select
                    value={projectManagerId}
                    onChange={(e) => setProjectManagerId(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="">-- Assign Later --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={targetDeliveryDate}
                    onChange={(e) => setTargetDeliveryDate(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Finalizing Deal...' : 'Confirm Mark Won'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
