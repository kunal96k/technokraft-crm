import React from 'react';
import { X, CheckSquare, AlertCircle, Building2 } from 'lucide-react';
import { TaskRecord, TaskPriority, TaskStatus } from '../../../types/followUps';
import { MOCK_LEADS } from '../../../data/mockLeads';

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
  const [leadId, setLeadId] = React.useState(MOCK_LEADS[0]?.id || '');
  const [assignedTo, setAssignedTo] = React.useState('Kunal Patil');
  const [priority, setPriority] = React.useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = React.useState('2026-09-08');
  const [dueTime, setDueTime] = React.useState('05:00 PM');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const selectedLead = MOCK_LEADS.find((l) => l.id === leadId);

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

    onSubmit({
      taskName,
      description,
      leadId: selectedLead?.id,
      leadCode: selectedLead?.leadCode,
      companyName: selectedLead?.company.name,
      assignedTo,
      assignedAvatar: assignedTo.split(' ').map((n) => n[0]).join('').toUpperCase(),
      priority,
      dueDate,
      dueTime,
      status: 'TODO',
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        id="create-task-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#5B4DB7] flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Create Team Task
              </h3>
              <p className="text-xs text-slate-500">
                Internal action item, document preparation or client deliverable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Verify multi-tenant billing API specs"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Task Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of work or checklist items..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            />
          </div>

          {/* Related Lead Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Related Lead / Account (Optional)
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
            >
              <option value="">None (General Internal Task)</option>
              {MOCK_LEADS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company.name} ({l.leadCode})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Due Time
              </label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="e.g. 05:00 PM"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              />
            </div>
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Employee *
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="Kunal Patil">Kunal Patil (Sales Manager)</option>
                <option value="Shruti Raundal">Shruti Raundal (Sales Executive)</option>
                <option value="Pranav Jejurkar">Pranav Jejurkar (Business Analyst)</option>
                <option value="Ankush Pandit">Ankush Pandit (Tech Lead)</option>
                <option value="Rohan Patil">Rohan Patil (Sales Executive)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40"
              >
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4d3fa5] rounded-lg shadow-xs"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
