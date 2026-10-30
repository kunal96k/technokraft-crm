import React from 'react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { ProjectTaskRecord } from '../../types/projects';

interface DeleteTaskModalProps {
  isOpen: boolean;
  task: ProjectTaskRecord | null;
  onClose: () => void;
  onConfirm: (taskId: number) => void;
}

export const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-rose-200 dark:border-rose-900/60">
        <div className="p-5 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/50">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Delete Work Item?
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{task.taskKey}</span>: "{task.title}"? This action cannot be undone.
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(task.id);
                onClose();
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
