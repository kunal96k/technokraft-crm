import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Bug,
  Sparkles,
  FileText,
  Check,
  Clock,
  Calendar,
  Tag,
  Briefcase,
  Link2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { ProjectTaskRecord, TaskPriority, TaskType, TaskStatus, DeliveryProjectRecord } from '../../types/projects';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { LeadSearchSelect } from '../common/LeadSearchSelect';
import { createTask } from '../../services/taskService';
import { fetchProjects } from '../../services/projectService';
import { Lead } from '../../types/leads';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: number;
  defaultProjectId?: number;
  projectCode?: string;
  defaultStatus?: TaskStatus;
  onSubmit?: (taskData: Partial<ProjectTaskRecord>) => Promise<void>;
  onTaskCreated?: (created: ProjectTaskRecord) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projectId: propProjectId,
  defaultProjectId,
  projectCode: propProjectCode,
  defaultStatus = 'TODO',
  onSubmit,
  onTaskCreated,
}) => {
  const initialProjectId = propProjectId || defaultProjectId;

  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(initialProjectId);
  const [projects, setProjects] = useState<DeliveryProjectRecord[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('TASK');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);

  // Assignee
  const [assigneeId, setAssigneeId] = useState<number | undefined>();
  const [assigneeName, setAssigneeName] = useState<string>('');
  const [assigneeRole, setAssigneeRole] = useState<string>('');
  const [assigneeAvatar, setAssigneeAvatar] = useState<string>('');

  // Timeline & Estimation
  const [estimatedHours, setEstimatedHours] = useState<string>('4');
  const [dueDate, setDueDate] = useState<string>('');
  const [labels, setLabels] = useState<string>('');

  // Optional Linked Lead
  const [linkedLeadId, setLinkedLeadId] = useState<number | undefined>();
  const [linkedLeadCode, setLinkedLeadCode] = useState<string>('');
  const [linkedLeadName, setLinkedLeadName] = useState<string>('');
  const [selectedLeadObj, setSelectedLeadObj] = useState<Lead | null>(null);

  // Defect / QA Notes
  const [defectNotes, setDefectNotes] = useState<string>('');
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize status
  useEffect(() => {
    if (defaultStatus) {
      setStatus(defaultStatus);
    }
  }, [defaultStatus]);

  // Load active projects for linking
  useEffect(() => {
    setIsLoadingProjects(true);
    fetchProjects()
      .then((data) => {
        setProjects(data);
        if (!selectedProjectId && data.length > 0) {
          setSelectedProjectId(initialProjectId || data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
      })
      .finally(() => {
        setIsLoadingProjects(false);
      });
  }, []);

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  const handleLeadChange = (leadIdStr: string, lead: Lead | null) => {
    if (lead) {
      setSelectedLeadObj(lead);
      const idNum = Number(lead.id);
      setLinkedLeadId(isNaN(idNum) ? undefined : idNum);
      setLinkedLeadCode(lead.leadCode || `LEAD-${lead.id}`);
      setLinkedLeadName(lead.contact?.name || lead.company?.name || `Lead #${lead.id}`);
    } else {
      setSelectedLeadObj(null);
      setLinkedLeadId(undefined);
      setLinkedLeadCode('');
      setLinkedLeadName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const targetProjId = selectedProjectId || propProjectId || defaultProjectId;
    if (!targetProjId) {
      setError('Please select a project to link this task to');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: Partial<ProjectTaskRecord> = {
        projectId: targetProjId,
        title: title.trim(),
        description: description.trim() || undefined,
        taskType,
        priority,
        status,
        assigneeId,
        assigneeName: assigneeName || undefined,
        assigneeRole: assigneeRole || undefined,
        assigneeAvatar: assigneeAvatar || undefined,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : 0,
        dueDate: dueDate || undefined,
        labels: labels.trim() || undefined,
        leadId: linkedLeadId,
        leadCode: linkedLeadCode || undefined,
        leadName: linkedLeadName || undefined,
        defectNotes: defectNotes.trim() || undefined,
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        const created = await createTask(targetProjId, payload);
        if (onTaskCreated) {
          onTaskCreated(created);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBugOrRevision = taskType === 'BUG' || status === 'REVISION_REQUIRED';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Work Item / Task</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Plan sprints, assign work to developers & interns, or log QA defects
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

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Target Project (Always visible & selectable) */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#5B4DB7]" />
                Target Project <span className="text-rose-500">*</span>
              </span>
              {propProjectCode && (
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                  Default: {propProjectCode}
                </span>
              )}
            </label>
            <select
              required
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              disabled={isLoadingProjects}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value="">Loading projects...</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.projectCode}] {p.name} {p.companyName ? `• ${p.companyName}` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 2. Task Title */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement WhatsApp webhook authentication and message delivery"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>

          {/* 3. Issue Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Issue Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
              >
                <option value="TASK">Task (Standard Work)</option>
                <option value="BUG">Bug / Defect</option>
                <option value="FEATURE">New Feature</option>
                <option value="REQUIREMENT">System Requirement</option>
                <option value="IMPROVEMENT">Improvement / Refactor</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Blocker)</option>
              </select>
            </div>
          </div>

          {/* 4. Stage & Estimated Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Workflow Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="INTERNAL_REVIEW">Internal Review</option>
                <option value="QA_TESTING">QA Testing</option>
                <option value="CLIENT_REVIEW">Client Review</option>
                <option value="DEPLOYMENT">Deployment</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Estimated Hours</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 4"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* 5. Assignee (Employee Typeahead Search with Avatars) */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Assignee (Intern / Developer / QA)
            </label>
            <EmployeeSelect
              value={assigneeId ? String(assigneeId) : ''}
              valueField="id"
              placeholder="Search active intern or developer..."
              allowEmpty={true}
              onSelectEmployee={(emp) => {
                if (emp) {
                  setAssigneeId(emp.id);
                  setAssigneeName(emp.name);
                  setAssigneeRole(emp.role);
                  setAssigneeAvatar(emp.avatar || '');
                } else {
                  setAssigneeId(undefined);
                  setAssigneeName('');
                  setAssigneeRole('');
                  setAssigneeAvatar('');
                }
              }}
              onChange={(e: any) => {
                const val = typeof e === 'string' ? e : e?.target?.value;
                if (!val) {
                  setAssigneeId(undefined);
                  setAssigneeName('');
                  setAssigneeRole('');
                  setAssigneeAvatar('');
                }
              }}
              className="w-full"
            />
          </div>

          {/* 6. Due Date & Labels */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Labels / Tags</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. backend, auth, critical"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* 7. Description & Acceptance Criteria */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Description & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              placeholder="Provide implementation specifications, expected behavior, endpoints, or testing instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>

          {/* 8. Defect Notes (Highlighted if Bug or Revision) */}
          {(isBugOrRevision || defectNotes.length > 0) && (
            <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1.5 animate-in fade-in duration-150">
              <label className="block font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Defect / QA Revision Notes
              </label>
              <textarea
                rows={2}
                placeholder="Describe bug steps to reproduce, actual vs expected result, browser/device environment..."
                value={defectNotes}
                onChange={(e) => setDefectNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* 9. Optional Fields Toggle (Link Lead, Extra Defect Notes if not already shown) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B4DB7] dark:text-purple-300 hover:underline cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>
                {showOptionalFields
                  ? 'Hide Optional Fields (Link Lead / Defect Details)'
                  : '+ Optional Fields: Link Lead or Deal / Notes'}
              </span>
              {showOptionalFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showOptionalFields && (
              <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-150">
                {/* Link Lead */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#5B4DB7]" />
                      Link CRM Lead / Client Deal
                    </span>
                    {linkedLeadCode && (
                      <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 px-1.5 py-0.5 rounded">
                        {linkedLeadCode}
                      </span>
                    )}
                  </label>
                  <LeadSearchSelect
                    value={linkedLeadId}
                    initialLeadName={linkedLeadName}
                    placeholder="Search client lead by name, phone, email, or company..."
                    allowClear={true}
                    onChange={handleLeadChange}
                  />
                  {linkedLeadName && (
                    <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-white">Selected:</span>
                      <span>{linkedLeadName}</span>
                      {selectedLeadObj?.company?.name && (
                        <span className="text-slate-400">({selectedLeadObj.company.name})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Defect Notes if not already shown in main form */}
                {!isBugOrRevision && (
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                      QA / Defect Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add any specific defect or test case references..."
                      value={defectNotes}
                      onChange={(e) => setDefectNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Work Item...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
