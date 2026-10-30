import React, { useState } from 'react';
import { X, AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import { ProjectTaskRecord, TaskStatus } from '../../types/projects';

interface DefectNotesModalProps {
  isOpen: boolean;
  task: ProjectTaskRecord | null;
  targetStatus: TaskStatus;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

export const DefectNotesModal: React.FC<DefectNotesModalProps> = ({
  isOpen,
  task,
  targetStatus,
  onClose,
  onConfirm,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onConfirm(notes.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-amber-200 dark:border-amber-900/60">
        {/* Header */}
        <div className="px-5 py-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-100 dark:border-amber-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Revision / Defect Notes Required
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Moving task back from {task.status.replace('_', ' ')} to {targetStatus.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-amber-600 hover:text-amber-900 dark:text-amber-400 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Task:</span>
              <strong className="text-slate-900 dark:text-white font-mono font-bold">
                {task.taskKey}
              </strong>
            </div>
            <div className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
              {task.title}
            </div>
            {task.assigneeName && (
              <div className="flex justify-between pt-1 text-[11px]">
                <span className="text-slate-500">Assignee:</span>
                <span className="text-[#5B4DB7] dark:text-purple-300 font-semibold">
                  {task.assigneeName}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Defect Description / Revision Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain why the task was rejected (e.g. API returns 400 error when payload missing phone, UI misalignment on mobile screens)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Back with Notes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
