import {
  OpportunityRecord,
  OpportunityStage,
  OpportunityPriority,
  OpportunityService as OppServiceType,
  OpportunityFollowUp,
  OpportunityActivity,
  LossReason,
} from '../types/opportunities';
import { authFetch } from './apiClient';

const API_BASE_URL = '/api/opportunities';

export interface OpportunityStats {
  totalCount: number;
  qualifiedCount: number;
  requirementCount: number;
  proposalCount: number;
  negotiationCount: number;
  wonCount: number;
  lostCount: number;
  pipelineValue: number;
  weightedPipelineValue: number;
  winRate: number;
}

export interface OpportunityQueryParams {
  search?: string;
  stage?: string;
  service?: string;
  priority?: string;
  industry?: string;
  assignedTo?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Fetch all opportunities from backend with filtering and pagination
 */
export async function fetchOpportunities(
  params: OpportunityQueryParams = {}
): Promise<PageResponse<OpportunityRecord>> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.stage && params.stage !== 'all') query.append('stage', params.stage);
  if (params.service && params.service !== 'all') query.append('service', params.service);
  if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
  if (params.industry && params.industry !== 'all') query.append('industry', params.industry);
  if (params.assignedTo && params.assignedTo !== 'all') query.append('assignedTo', params.assignedTo);
  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 50));
  query.append('sortBy', params.sortBy || 'id');
  query.append('sortDirection', params.sortDirection || 'desc');

  const res = await authFetch(`${API_BASE_URL}?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch opportunities: HTTP ${res.status}`);
  }

  const data = await res.json();
  const pageMeta = data.page || {};
  return {
    content: (data.content || []).map(normalizeOpportunity),
    totalElements: data.totalElements ?? pageMeta.totalElements ?? (data.content?.length || 0),
    totalPages: data.totalPages ?? pageMeta.totalPages ?? 1,
    number: data.number ?? pageMeta.number ?? 0,
    size: data.size ?? pageMeta.size ?? 50,
  };
}

/**
 * Fetch pipeline summary metrics
 */
export async function fetchOpportunityStats(): Promise<OpportunityStats> {
  const res = await authFetch(`${API_BASE_URL}/stats`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch opportunity stats: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch a single opportunity by ID or code
 */
export async function fetchOpportunityById(idOrCode: string): Promise<OpportunityRecord> {
  const res = await authFetch(`${API_BASE_URL}/${encodeURIComponent(idOrCode)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch opportunity ${idOrCode}: HTTP ${res.status}`);
  }
  const data = await res.json();
  return normalizeOpportunity(data);
}

/**
 * Create a new opportunity in the database
 */
export async function createOpportunity(
  opportunity: Partial<OpportunityRecord>
): Promise<OpportunityRecord> {
  const res = await authFetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(opportunity),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create opportunity: ${errorText || res.statusText}`);
  }

  const created = await res.json();
  return normalizeOpportunity(created);
}

/**
 * Update an existing opportunity
 */
export async function updateOpportunity(
  id: string | number,
  opportunity: Partial<OpportunityRecord>
): Promise<OpportunityRecord> {
  const res = await authFetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(opportunity),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update opportunity: ${errorText || res.statusText}`);
  }

  const updated = await res.json();
  return normalizeOpportunity(updated);
}

/**
 * Update stage (with probability recalculation, won/loss notes)
 */
export async function updateOpportunityStage(
  id: string | number,
  payload: {
    stage: OpportunityStage;
    finalValue?: number;
    lossReason?: LossReason;
    notes?: string;
  }
): Promise<OpportunityRecord> {
  const res = await authFetch(`${API_BASE_URL}/${id}/stage`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update stage: ${errorText || res.statusText}`);
  }

  const updated = await res.json();
  return normalizeOpportunity(updated);
}

/**
 * Add an activity to an opportunity
 */
export async function addOpportunityActivity(
  id: string | number,
  activity: Partial<OpportunityActivity>
): Promise<OpportunityRecord> {
  const res = await authFetch(`${API_BASE_URL}/${id}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(activity),
  });

  if (!res.ok) {
    throw new Error(`Failed to add activity: HTTP ${res.status}`);
  }

  const updated = await res.json();
  return normalizeOpportunity(updated);
}

/**
 * Add a follow-up to an opportunity
 */
export async function addOpportunityFollowUp(
  id: string | number,
  followUp: Partial<OpportunityFollowUp>
): Promise<OpportunityRecord> {
  const res = await authFetch(`${API_BASE_URL}/${id}/follow-ups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(followUp),
  });

  if (!res.ok) {
    throw new Error(`Failed to add follow-up: HTTP ${res.status}`);
  }

  const updated = await res.json();
  return normalizeOpportunity(updated);
}

/**
 * Soft delete an opportunity
 */
export async function deleteOpportunity(id: string | number): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete opportunity: HTTP ${res.status}`);
  }
}

/**
 * Helper to ensure consistent structure for frontend components
 */
function normalizeOpportunity(raw: any): OpportunityRecord {
  return {
    id: String(raw.id),
    opportunityCode: raw.opportunityCode || `OPP-${raw.id}`,
    name: raw.name || '',
    companyName: raw.companyName || '',
    leadId: raw.leadId || undefined,
    leadCode: raw.leadCode || undefined,
    contactName: raw.contactName || '',
    contactDesignation: raw.contactDesignation || '',
    contactEmail: raw.contactEmail || '',
    contactPhone: raw.contactPhone || '',
    service: (raw.service as OppServiceType) || 'Custom Software Development',
    stage: (raw.stage as OpportunityStage) || 'Qualified',
    estimatedValue: Number(raw.estimatedValue) || 0,
    finalValue: raw.finalValue !== null && raw.finalValue !== undefined ? Number(raw.finalValue) : undefined,
    probability: Number(raw.probability) || 50,
    expectedCloseDate: raw.expectedCloseDate || '',
    priority: (raw.priority as OpportunityPriority) || 'Medium',
    industry: raw.industry || 'IT & Software',
    requirement: {
      summary: raw.requirement?.summary || '',
      problemStatement: raw.requirement?.problemStatement || '',
      expectedUsers: raw.requirement?.expectedUsers || '',
      timeline: raw.requirement?.timeline || '',
      budget: raw.requirement?.budget || '',
      technicalRequirements: raw.requirement?.technicalRequirements || '',
      notes: raw.requirement?.notes || '',
    },
    owner: {
      name: raw.owner?.name || 'Unassigned',
      avatar: raw.owner?.avatar || 'UN',
      role: raw.owner?.role || 'Sales Manager',
      email: raw.owner?.email || '',
    },
    businessAnalyst: raw.businessAnalyst?.name
      ? {
          name: raw.businessAnalyst.name,
          role: raw.businessAnalyst.role || 'Senior Business Analyst',
        }
      : undefined,
    technicalReviewer: raw.technicalReviewer?.name
      ? {
          name: raw.technicalReviewer.name,
          role: raw.technicalReviewer.role || 'Solutions Architect',
        }
      : undefined,
    createdBy: {
      name: raw.createdBy?.name || 'CRM System',
      date: raw.createdBy?.date || 'Today',
    },
    wonDate: raw.wonDate || undefined,
    wonNotes: raw.wonNotes || undefined,
    lossReason: raw.lossReason as LossReason,
    lossNotes: raw.lossNotes || undefined,
    proposalsCount: raw.proposalsCount ?? 0,
    activities: Array.isArray(raw.activities) ? raw.activities : [],
    followUps: Array.isArray(raw.followUps) ? raw.followUps : [],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}
