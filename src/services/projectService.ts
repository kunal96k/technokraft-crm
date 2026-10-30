import {
  DeliveryProjectRecord,
  ProjectMemberRecord,
  ProjectQueryParams,
  ProjectsPageResponse,
  ProjectSummaryRecord,
} from '../types/projects';
import { authFetch } from './apiClient';

const BASE_URL = '/api/projects';

export async function fetchProjects(search?: string, status?: string): Promise<DeliveryProjectRecord[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) params.append('search', search.trim());
  if (status && status !== 'ALL') params.append('status', status.trim());

  const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
  const res = await authFetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch projects (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.content)) {
    return data.content;
  }
  return [];
}

export async function fetchProjectsPaginated(params: ProjectQueryParams = {}): Promise<ProjectsPageResponse> {
  const query = new URLSearchParams();
  if (params.search && params.search.trim()) query.append('search', params.search.trim());
  if (params.status && params.status !== 'ALL') query.append('status', params.status.trim());
  if (params.page !== undefined) query.append('page', String(params.page));
  if (params.size !== undefined) query.append('size', String(params.size));
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortDirection) query.append('sortDirection', params.sortDirection);

  const url = query.toString() ? `${BASE_URL}?${query.toString()}` : BASE_URL;
  const res = await authFetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch paginated projects (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length,
      first: true,
      last: true,
      empty: data.length === 0,
    };
  }
  return data;
}

export async function fetchProjectSummary(): Promise<ProjectSummaryRecord> {
  const res = await authFetch(`${BASE_URL}/summary`);
  if (!res.ok) {
    throw new Error(`Failed to fetch project summary (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchProjectById(id: number | string): Promise<DeliveryProjectRecord> {
  const res = await authFetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch project ${id} (HTTP ${res.status})`);
  }
  return res.json();
}

export async function createProject(data: Partial<DeliveryProjectRecord>): Promise<DeliveryProjectRecord> {
  const res = await authFetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create project: ${err}`);
  }
  return res.json();
}

export async function createProjectFromOpportunity(
  opportunityId: number | string,
  projectManagerId?: number,
  targetDate?: string
): Promise<DeliveryProjectRecord> {
  const res = await authFetch(`${BASE_URL}/from-opportunity/${opportunityId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectManagerId, targetDate }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to initiate delivery project from opportunity: ${err}`);
  }
  return res.json();
}

export async function updateProject(
  id: number | string,
  data: Partial<DeliveryProjectRecord>
): Promise<DeliveryProjectRecord> {
  const res = await authFetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update project (HTTP ${res.status})`);
  }
  return res.json();
}

export async function deleteProject(id: number | string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete project (HTTP ${res.status})`);
  }
}

export async function fetchProjectMembers(projectId: number | string): Promise<ProjectMemberRecord[]> {
  const res = await authFetch(`${BASE_URL}/${projectId}/members`);
  if (!res.ok) {
    throw new Error(`Failed to fetch project members (HTTP ${res.status})`);
  }
  return res.json();
}

export async function addProjectMember(
  projectId: number | string,
  employeeId: number,
  projectRole: string
): Promise<ProjectMemberRecord> {
  const res = await authFetch(`${BASE_URL}/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, projectRole }),
  });
  if (!res.ok) {
    throw new Error(`Failed to add project member (HTTP ${res.status})`);
  }
  return res.json();
}

export async function removeProjectMember(
  projectId: number | string,
  memberId: number | string
): Promise<void> {
  const res = await authFetch(`${BASE_URL}/${projectId}/members/${memberId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to remove project member (HTTP ${res.status})`);
  }
}
