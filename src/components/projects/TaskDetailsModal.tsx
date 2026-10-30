import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Bug,
  Sparkles,
  FileText,
  Clock,
  Calendar,
  Tag,
  User,
  Send,
  Paperclip,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  FileCode2,
  Trash2,
  MessageSquare,
  History,
  Download,
  Briefcase,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { ProjectTaskRecord, TaskStatus, TaskCommentRecord } from '../../types/projects';
import { EmployeeAvatar } from '../common/EmployeeAvatar';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { updateTaskStatus, reassignTask, addTaskComment, uploadTaskAttachment, downloadTaskAttachment, fetchTaskById } from '../../services/taskService';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: ProjectTaskRecord | null;
  taskId?: number | null;
  onTaskUpdated?: (updatedTask: ProjectTaskRecord) => void;
  onTaskDeleted?: (taskId: number) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task: initialTask,
  taskId,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [task, setTask] = React.useState<ProjectTaskRecord | null>(initialTask || null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'files'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  React.useEffect(() => {
    if (initialTask) {
      setTask(initialTask);
    } else if (taskId && isOpen) {
      setIsLoading(true);
      fetchTaskById(taskId)
        .then((data) => setTask(data))
        .catch((err) => console.error('Failed to fetch task details:', err))
        .finally(() => setIsLoading(false));
    } else if (!isOpen) {
      setTask(null);
    }
  }, [initialTask, taskId, isOpen]);

  const handleStatusChange = async (newStatus: TaskStatus, notes?: string) => {
    if (!task) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await updateTaskStatus(task.id, newStatus, notes);
      setTask(updated);
      onTaskUpdated?.(updated);
      setShowRevisionInput(false);
      setRevisionNotes('');
    } catch (e: any) {
      alert(e?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [isReassigning, setIsReassigning] = useState(false);

  const handleDownloadAttachment = async (att: any) => {
    try {
      setDownloadingId(att.id);
      await downloadTaskAttachment(att.id, att.fileName);
    } catch (err: any) {
      alert(err?.message || 'Failed to download attachment');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReassign = async (emp: any) => {
    if (!task || isReassigning) return;
    try {
      let newId: number | null = null;
      if (emp && typeof emp === 'object') {
        if ('id' in emp && emp.id != null) {
          newId = Number(emp.id);
        } else if (emp.target?.value) {
          const v = emp.target.value;
          newId = v && v !== 'ALL' ? Number(v) : null;
        }
      } else if (typeof emp === 'number') {
        newId = emp;
      } else if (typeof emp === 'string' && emp.trim() && emp !== 'ALL') {
        newId = Number(emp);
      }
      if (newId !== null && Number.isNaN(newId)) newId = null;

      // Skip if assignee is identical to current
      if ((newId === null && !task.assigneeId) || (newId !== null && task.assigneeId === newId)) {
        return;
      }

      setIsReassigning(true);
      const updated = await reassignTask(task.id, newId);
      setTask(updated);
      onTaskUpdated?.(updated);
    } catch (e: any) {
      alert(e?.message || 'Failed to reassign task');
    } finally {
      setIsReassigning(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentText.trim()) return;

    try {
      setIsPostingComment(true);
      const newComment = await addTaskComment(task.id, commentText.trim());
      const updatedComments = [newComment, ...(task.comments || [])];
      const updated = { ...task, comments: updatedComments };
      setTask(updated);
      onTaskUpdated?.(updated);
      setCommentText('');
    } catch (e: any) {
      alert(e?.message || 'Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!task || !file) return;

    try {
      setIsUploadingFile(true);
      const newAtt = await uploadTaskAttachment(task.id, file);
      const updatedAtts = [newAtt, ...(task.attachments || [])];
      const updated = { ...task, attachments: updatedAtts };
      setTask(updated);
      onTaskUpdated?.(updated);
    } catch (e: any) {
      alert(e?.message || 'Failed to upload attachment');
    } finally {
      setIsUploadingFile(false);
    }
  };

  if (!isOpen) return null;

  if (!task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 flex flex-col items-center gap-3 shadow-xl">
          <div className="w-8 h-8 border-2 border-[#5B4DB7] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading task details...</p>
        </div>
      </div>
    );
  }

  // Render Status Badge
  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case 'BACKLOG':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Backlog</span>;
      case 'TODO':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">To Do</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">In Progress</span>;
      case 'INTERNAL_REVIEW':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">Internal Review</span>;
      case 'QA_TESTING':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">QA Testing</span>;
      case 'CLIENT_REVIEW':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900">Client Review</span>;
      case 'REVISION_REQUIRED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">Revision Required</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900">Approved</span>;
      case 'DEPLOYMENT':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-900">Deployment</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">Completed</span>;
      default:
        return <span>{s}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-[#5B4DB7] dark:text-purple-300 font-mono font-bold text-xs">
              {task.taskKey}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-sm">
              {task.projectName || 'Delivery Project'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(task.status)}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow Transition Action Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transition Workflow:</span>

          <div className="flex items-center gap-2 flex-wrap">
            {task.status === 'BACKLOG' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('TODO')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Move to To Do →
              </button>
            )}

            {task.status === 'TODO' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="px-3 py-1.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Start Progress (Coding) →
              </button>
            )}

            {task.status === 'IN_PROGRESS' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('INTERNAL_REVIEW')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Submit for Code Review →
              </button>
            )}

            {task.status === 'INTERNAL_REVIEW' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('QA_TESTING')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Send to QA Testing →
              </button>
            )}

            {(task.status === 'QA_TESTING' || task.status === 'INTERNAL_REVIEW') && (
              <>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => setShowRevisionInput(!showRevisionInput)}
                  className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 rounded-lg text-xs font-bold transition-all border border-rose-300 dark:border-rose-900"
                >
                  Request Revision (Defect) ↩
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange('CLIENT_REVIEW')}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  Pass QA → Client Demo
                </button>
              </>
            )}

            {task.status === 'REVISION_REQUIRED' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="px-3 py-1.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Resume Fixing (In Progress) →
              </button>
            )}

            {task.status === 'CLIENT_REVIEW' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('DEPLOYMENT')}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Client Approved → Ready for Deploy
              </button>
            )}

            {task.status === 'DEPLOYMENT' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange('COMPLETED')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
              >
                Mark Released & Completed ✓
              </button>
            )}
          </div>
        </div>

        {/* Revision Input Box (When bouncing backward) */}
        {showRevisionInput && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 space-y-2 flex-shrink-0 animate-in fade-in duration-150">
            <label className="block text-xs font-bold text-rose-900 dark:text-rose-200">
              Defect Details & Revision Instructions for Intern/Developer:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Explain what failed in QA testing or what the client requested..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                disabled={isUpdatingStatus || !revisionNotes.trim()}
                onClick={() => handleStatusChange('REVISION_REQUIRED', revisionNotes.trim())}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                Send Revision
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area (Two Columns) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) - Title, Description, Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {task.title}
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Description & Acceptance Criteria:</span>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </div>
            </div>

            {/* Defect Notes if present */}
            {task.defectNotes && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Defect / QA Revision Notes:</span>
                </div>
                <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed whitespace-pre-wrap">
                  {task.defectNotes}
                </p>
              </div>
            )}

            {/* Tabs for Comments, History, Attachments */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center gap-1.5 text-xs font-bold pb-1 cursor-pointer transition-colors ${
                    activeTab === 'comments'
                      ? 'text-[#5B4DB7] border-b-2 border-[#5B4DB7]'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({task.comments?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-1.5 text-xs font-bold pb-1 cursor-pointer transition-colors ${
                    activeTab === 'history'
                      ? 'text-[#5B4DB7] border-b-2 border-[#5B4DB7]'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Activity History ({task.activityHistory?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('files')}
                  className={`flex items-center gap-1.5 text-xs font-bold pb-1 cursor-pointer transition-colors ${
                    activeTab === 'files'
                      ? 'text-[#5B4DB7] border-b-2 border-[#5B4DB7]'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attachments ({task.attachments?.length || 0})</span>
                </button>
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an internal note or update for this task..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                    />
                    <button
                      type="submit"
                      disabled={isPostingComment || !commentText.trim()}
                      className="px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>

                  <div className="space-y-3">
                    {task.comments && task.comments.length > 0 ? (
                      task.comments.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {c.employeeName} {c.employeeRole ? `(${c.employeeRole})` : ''}
                            </span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.commentText}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No comments yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-2.5">
                  {task.activityHistory && task.activityHistory.length > 0 ? (
                    task.activityHistory.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-start gap-3 p-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs"
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <History className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-bold text-slate-900 dark:text-white">{h.employeeName}</span>
                            <span>{new Date(h.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                            {h.notes || `${h.activityType}: ${h.fromValue || ''} → ${h.toValue || ''}`}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                  )}
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Upload deliverables, designs, or APKs:</span>
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{isUploadingFile ? 'Uploading...' : 'Attach File'}</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploadingFile} />
                    </label>
                  </div>

                  <div className="space-y-2">
                    {task.attachments && task.attachments.length > 0 ? (
                      task.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="font-medium text-slate-900 dark:text-white truncate">{att.fileName}</span>
                            {att.fileSize && <span className="text-[11px] text-slate-400">({att.fileSize})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadAttachment(att)}
                            disabled={downloadingId === att.id}
                            className="p-1 text-slate-500 hover:text-[#5B4DB7] transition-colors cursor-pointer disabled:opacity-50"
                            title="Download file"
                          >
                            {downloadingId === att.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#5B4DB7]" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No attachments uploaded.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 Col) - Metadata & Assignee */}
          <div className="space-y-5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            {/* Assignee Card */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Assignee:</span>
                {isReassigning && (
                  <span className="text-[10px] text-[#5B4DB7] flex items-center gap-1 font-medium animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>
              <EmployeeSelect
                value={task.assigneeId ? String(task.assigneeId) : ''}
                valueField="id"
                placeholder="Assign to intern/developer..."
                allowEmpty={true}
                disabled={isReassigning}
                onSelectEmployee={handleReassign}
                onChange={() => {}}
              />
            </div>

            {/* Project Link */}
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#5B4DB7]" />
                Project:
              </span>
              <p className="font-semibold text-slate-900 dark:text-white">
                {task.projectName || `Project #${task.projectId}`}
                {task.projectCode && (
                  <span className="ml-1.5 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                    {task.projectCode}
                  </span>
                )}
              </p>
            </div>

            {/* Linked Lead / Deal */}
            {task.leadName && (
              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Linked CRM Lead:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {task.leadName}
                  {task.leadCode && (
                    <span className="ml-1.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                      {task.leadCode}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Reporter Card */}
            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Reporter:</span>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>{task.reporterName || 'System'}</span>
              </div>
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 text-[11px]">Type:</span>
                <p className="font-bold text-slate-900 dark:text-white">{task.taskType}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Priority:</span>
                <p className="font-bold text-slate-900 dark:text-white">{task.priority}</p>
              </div>
            </div>

            {/* Hours & Due Date */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 text-[11px]">Estimate:</span>
                <p className="font-bold text-slate-900 dark:text-white">{task.estimatedHours || 0} hrs</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Due Date:</span>
                <p className={`font-bold ${task.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {task.dueDate || 'No deadline'}
                </p>
              </div>
            </div>

            {/* Labels */}
            {task.labels && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 text-[11px]">Labels:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.labels.split(',').map((lbl, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-semibold"
                    >
                      {lbl.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
