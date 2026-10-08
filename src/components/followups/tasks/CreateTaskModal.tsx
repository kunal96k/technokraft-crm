import React from 'react';
import { X, CheckSquare, AlertCircle, Building2 } from 'lucide-react';
import { TaskRecord, TaskPriority, TaskStatus } from '../../../types/followUps';
import { Lead } from '../../../types/leads';
import { EmployeeSelect } from '../../common/EmployeeSelect';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { LeadSearchSelect } from '../../common/LeadSearchSelect';
import { getTodayIST_YYYYMMDD } from '../../../utils/dateUtils';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<TaskRecord, 'id' | 'createdAt'>) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [taskName, setTaskName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [leadId, setLeadId] = React.useState('');
  const [assignedTo, setAssignedTo] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = React.useState(() => getTodayIST_YYYYMMDD());
  const [dueTime, setDueTime] = React.useState('05:00 PM');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError('Please enter task name.');
      return;
    }
    if (!dueDate) {
      setError('Please select due date.');
      return;
    }

    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    onSubmit({
      taskName,
      description,
      leadId: selectedLead?.id,
      leadCode: selectedLead?.leadCode,
      companyName: selectedLead?.company.name,
      assignedTo,
      assignedAvatar: assignedTo ? assignedTo.split(' ').map((n) => n[0]).join('').toUpperCase() : 'TK',
      priority,
      dueDate,
      dueTime,
      status: 'TODO',
      notes,
    });

    setShowConfirmModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 py-6 sm:py-8 animate-in fade-in duration-150">
      <div
        id="create-task-modal"
        className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg flex flex-col max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Team Task
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Internal action item, document preparation or client deliverable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Task Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Verify multi-tenant billing API specs"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Scope of work or checklist items..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              />
            </div>

            {/* Related Lead Selection */}
            <div>
              <LeadSearchSelect
                label="Related Lead / Account (Optional)"
                value={leadId}
                onChange={(newId, leadObj) => {
                  setLeadId(newId);
                  setSelectedLead(leadObj);
                }}
                placeholder="Search & link lead (Optional, 10K+ leads supported)..."
                allowClear={true}
                showMetaPreview={false}
              />
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Time
                </label>
                <input
                  type="text"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  placeholder="e.g. 05:00 PM"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                />
              </div>
            </div>

            {/* Assignee & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Employee *
                </label>
                <EmployeeSelect
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Select Employee / Unassigned"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 cursor-pointer"
                >
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="flex-shrink-0 px-6 py-3.5 bg-slate-50/90 dark:bg-slate-950/60 backdrop-blur-xs border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal Before Saving Task */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Task Creation"
        message={`Are you sure you want to create the task "${taskName}"?`}
        confirmLabel="Confirm & Create"
        cancelLabel="Review Details"
        variant="primary"
        iconType="save"
        itemDetails={[
          { label: 'Task Name', value: taskName },
          { label: 'Related Lead', value: selectedLead?.company.name || 'Internal Team' },
          { label: 'Assigned To', value: assignedTo || 'Unassigned' },
          { label: 'Priority', value: priority },
          { label: 'Due Date', value: `${dueDate} (${dueTime})` },
        ]}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
