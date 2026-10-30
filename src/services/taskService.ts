import {
  ProjectTaskRecord,
  TaskCommentRecord,
  TaskAttachmentRecord,
  MyWorkSummaryRecord,
  TaskStatus,
} from '../types/projects';
import { authFetch } from './apiClient';

const PROJECTS_URL = '/api/projects';
const TASKS_URL = '/api/tasks';

export interface TaskQueryParams {
  status?: string;
  assigneeId?: number;
  taskType?: string;
  priority?: string;
  search?: string;
}

export async function fetchProjectTasks(
  projectId: number | string,
  params: TaskQueryParams = {}
): Promise<ProjectTaskRecord[]> {
  const q = new URLSearchParams();
  if (params.status && params.status !== 'ALL') q.append('status', params.status);
  if (params.assigneeId) q.append('assigneeId', String(params.assigneeId));
  if (params.taskType && params.taskType !== 'ALL') q.append('taskType', params.taskType);
  if (params.priority && params.priority !== 'ALL') q.append('priority', params.priority);
  if (params.search && params.search.trim()) q.append('search', params.search.trim());

  const url = q.toString() ? `${PROJECTS_URL}/${projectId}/tasks?${q.toString()}` : `${PROJECTS_URL}/${projectId}/tasks`;
  const res = await authFetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks for project ${projectId}`);
  }
  return res.json();
}

export async function fetchTaskById(taskId: number | string): Promise<ProjectTaskRecord> {
  const res = await authFetch(`${TASKS_URL}/${taskId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch task ${taskId}`);
  }
  return res.json();
}

export async function createTask(
  projectId: number | string,
  data: Partial<ProjectTaskRecord>
): Promise<ProjectTaskRecord> {
  const res = await authFetch(`${PROJECTS_URL}/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create task: ${err}`);
  }
  return res.json();
}

export async function updateTask(
  taskId: number | string,
  data: Partial<ProjectTaskRecord>
): Promise<ProjectTaskRecord> {
  const res = await authFetch(`${TASKS_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update task ${taskId}`);
  }
  return res.json();
}

export async function updateTaskStatus(
  taskId: number | string,
  status: TaskStatus,
  notes?: string
): Promise<ProjectTaskRecord> {
  const res = await authFetch(`${TASKS_URL}/${taskId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) {
    throw new Error(`Failed to transition task status`);
  }
  return res.json();
}

export async function reassignTask(
  taskId: number | string,
  assigneeId: number | null
): Promise<ProjectTaskRecord> {
  const res = await authFetch(`${TASKS_URL}/${taskId}/assignee`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigneeId }),
  });
  if (!res.ok) {
    throw new Error(`Failed to reassign task`);
  }
  return res.json();
}

export async function deleteTask(taskId: number | string): Promise<void> {
  const res = await authFetch(`${TASKS_URL}/${taskId}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete task ${taskId}`);
  }
}

export async function addTaskComment(
  taskId: number | string,
  commentText: string
): Promise<TaskCommentRecord> {
  const res = await authFetch(`${TASKS_URL}/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentText }),
  });
  if (!res.ok) {
    throw new Error(`Failed to add comment`);
  }
  return res.json();
}

export async function uploadTaskAttachment(
  taskId: number | string,
  file: File
): Promise<TaskAttachmentRecord> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await authFetch(`${TASKS_URL}/${taskId}/attachments`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Failed to upload attachment`);
  }
  return res.json();
}

export async function downloadTaskAttachment(
  attachmentId: number | string,
  fileName?: string
): Promise<void> {
  const res = await authFetch(`${TASKS_URL}/attachments/${attachmentId}/download`);
  if (!res.ok) {
    throw new Error(`Failed to download task attachment (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName || `attachment-${attachmentId}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

export async function fetchMyWorkSummary(employeeId?: number): Promise<MyWorkSummaryRecord> {
  const url = employeeId ? `${TASKS_URL}/my-work?employeeId=${employeeId}` : `${TASKS_URL}/my-work`;
  const res = await authFetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch my work summary`);
  }
  return res.json();
}

export async function fetchMyTasks(
  employeeId?: number,
  status?: string
): Promise<ProjectTaskRecord[]> {
  const q = new URLSearchParams();
  if (employeeId) q.append('employeeId', String(employeeId));
  if (status && status !== 'ALL') q.append('status', status);

  const url = q.toString() ? `${TASKS_URL}/my-tasks?${q.toString()}` : `${TASKS_URL}/my-tasks`;
  const res = await authFetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch my tasks`);
  }
  return res.json();
}
