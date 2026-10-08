import {
  Lead,
  LeadStatus,
  LeadPriority,
  LeadSource,
  TechnoKraftService,
  LeadActivity,
  FollowUpSchedule,
  LeadSummaryData,
} from '../types/leads';
import { authFetch } from './apiClient';

export type { LeadSummaryData };

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string)?.replace(/\/leads$/, '') || '';
const LEADS_API_URL = `${API_BASE_URL}/api/leads`;
const ATTACHMENTS_API_URL = `${API_BASE_URL}/api/attachments`;
const EMAILS_API_URL = `${API_BASE_URL}/api/emails`;

export interface LeadSummaryResponse extends LeadSummaryData {
  summary: LeadSummaryData;
  isBackendConnected: boolean;
}

export interface FetchLeadsParams {
  search?: string;
  status?: string;
  source?: string;
  service?: string;
  assignedTo?: string;
  priority?: string;
  dateRange?: string;
  minScore?: number;
  maxScore?: number;
  industry?: string;
  city?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface LeadsPageResponse {
  content: Lead[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  isBackendConnected: boolean;
}

export interface CreateLeadPayload {
  company: {
    name: string;
    website?: string;
    industry: string;
    companySize: string;
    country: string;
    state: string;
    city: string;
    linkedIn?: string;
    description?: string;
  };
  contact: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    linkedIn?: string;
  };
  service: TechnoKraftService | string;
  source: LeadSource | string;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  assignedEmployee?: {
    name: string;
    avatar?: string;
    role?: string;
    email?: string;
  };
  assignedBA?: {
    name: string;
    role?: string;
  };
  assignedEmployeeName?: string;
  assignedBAName?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdByRole?: string;
  updatedByName?: string;
  updatedByEmail?: string;
  updatedByRole?: string;
  requirement?: {
    summary: string;
    problemStatement?: string;
    expectedTimeline: string;
    budgetRange: string;
    currentTech?: string;
    numberOfUsers?: string;
    additionalNotes?: string;
  };
  followUps?: Array<{
    date: string;
    time: string;
    type: string;
    assignedTo: string;
    notes?: string;
  }>;
  [key: string]: any;
}

export interface BulkImportResponse {
  totalSubmitted: number;
  successCount: number;
  duplicateCount: number;
  failedCount: number;
  importedLeads: Lead[];
  errors: Array<{
    row: number;
    companyName?: string;
    email?: string;
    reason: string;
  }>;
}

export interface SendEmailPayload {
  leadId?: string | number;
  leadCode?: string;
  recipientEmail: string;
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string[];
  bcc?: string[];
  status?: string;
  scheduledFor?: string;
  attachments?: Array<{
    id?: string;
    name?: string;
    fileName?: string;
    filePath?: string;
    fileSize?: string;
    fileType?: string;
    base64Content?: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  message: string;
  error?: string;
  emailId?: string;
  status?: string;
  recipientEmail?: string;
  timestamp?: string;
}

export type LeadMutationResult = Lead & {
  success: boolean;
  lead: Lead;
  error?: string;
};

/**
 * Fetch paginated leads from Spring Boot backend
 */
export async function fetchLeads(
  params: FetchLeadsParams = {},
  signal?: AbortSignal
): Promise<LeadsPageResponse> {
  const query = new URLSearchParams();
  if (params.search && params.search.trim()) query.append('search', params.search.trim());
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.source && params.source !== 'all') query.append('source', params.source);
  if (params.service && params.service !== 'all') query.append('service', params.service);
  if (params.assignedTo && params.assignedTo !== 'all') query.append('assignedTo', params.assignedTo);
  if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
  if (params.dateRange && params.dateRange !== 'all') query.append('dateRange', params.dateRange);
  if (params.industry && params.industry !== 'all') query.append('industry', params.industry);
  if (params.city && params.city !== 'all') query.append('city', params.city);
  if (params.minScore !== undefined) query.append('minScore', String(params.minScore));
  if (params.maxScore !== undefined) query.append('maxScore', String(params.maxScore));

  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 25));
  query.append('sortBy', params.sortBy || 'createdAt');
  query.append('sortDirection', params.sortDirection || 'desc');

  try {
    const res = await authFetch(`${LEADS_API_URL}?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const pageMeta = data.page || data;
    const content: Lead[] = data.content || [];

    return {
      content,
      totalElements: typeof pageMeta.totalElements === 'number' ? pageMeta.totalElements : (data.totalElements ?? content.length),
      totalPages: typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : (data.totalPages ?? 1),
      number: typeof pageMeta.number === 'number' ? pageMeta.number : (data.number ?? 0),
      size: typeof pageMeta.size === 'number' ? pageMeta.size : (data.size ?? (params.size ?? 25)),
      isBackendConnected: true,
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw error;
    }
    console.error('[LeadService] Failed to fetch leads:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: params.page ?? 0,
      size: params.size ?? 25,
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch aggregate lead summary KPI metrics
 */
export async function fetchLeadSummary(): Promise<LeadSummaryResponse> {
  try {
    const res = await authFetch(`${LEADS_API_URL}/summary`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const wonCount = data.wonCount ?? data.wonLeads ?? 0;
    const totalCount = data.totalLeads ?? data.totalCount ?? 0;
    const baseSummary: LeadSummaryData = {
      totalLeads: totalCount,
      newLeads: data.newLeads ?? data.newCount ?? 0,
      contactedLeads: data.contactedLeads ?? data.contactedCount ?? 0,
      interestedLeads: data.interestedLeads ?? data.interestedCount ?? 0,
      qualifiedLeads: data.qualifiedLeads ?? data.qualifiedCount ?? 0,
      hotLeads: data.hotLeads ?? data.hotCount ?? 0,
      proposalCount: data.proposalCount ?? data.proposalLeads ?? 0,
      proposalLeads: data.proposalLeads ?? data.proposalCount ?? 0,
      negotiationCount: data.negotiationCount ?? data.negotiationLeads ?? 0,
      negotiationLeads: data.negotiationLeads ?? data.negotiationCount ?? 0,
      wonCount: wonCount,
      wonLeads: data.wonLeads ?? data.wonCount ?? 0,
      lostCount: data.lostCount ?? data.lostLeads ?? 0,
      lostLeads: data.lostLeads ?? data.lostCount ?? 0,
      conversionRate: data.conversionRate ?? (totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0),
      pipelineValue: data.pipelineValue ?? 0,
      activeFollowUps: data.activeFollowUps ?? 0,
    };

    return {
      ...baseSummary,
      summary: baseSummary,
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('[LeadService] Backend summary unreachable:', error);
    const zeroSummary: LeadSummaryData = {
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      interestedLeads: 0,
      qualifiedLeads: 0,
      hotLeads: 0,
      proposalCount: 0,
      proposalLeads: 0,
      negotiationCount: 0,
      negotiationLeads: 0,
      wonCount: 0,
      wonLeads: 0,
      lostCount: 0,
      lostLeads: 0,
      conversionRate: 0,
      pipelineValue: 0,
      activeFollowUps: 0,
    };
    return {
      ...zeroSummary,
      summary: zeroSummary,
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch a single lead by database ID or leadCode
 */
export async function fetchLeadById(idOrCode: string | number): Promise<Lead | null> {
  try {
    const res = await authFetch(`${LEADS_API_URL}/${idOrCode}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`[LeadService] Failed to fetch lead ${idOrCode}:`, error);
    return null;
  }
}

/**
 * Create a new lead in CRM
 */
export async function createLead(payload: CreateLeadPayload | Partial<Lead>): Promise<LeadMutationResult> {
  try {
    const res = await authFetch(LEADS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.message || `HTTP ${res.status}: Failed to create lead`;
      return {
        success: false,
        error: msg,
        lead: null as any,
      } as any;
    }

    const created = await res.json();
    return {
      ...created,
      success: true,
      lead: created,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error',
      lead: null as any,
    } as any;
  }
}

/**
 * Update existing lead
 */
export async function updateLead(idOrCode: string | number, payload: Partial<Lead> | any): Promise<LeadMutationResult> {
  try {
    const res = await authFetch(`${LEADS_API_URL}/${idOrCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.message || `HTTP ${res.status}: Failed to update lead`;
      return {
        success: false,
        error: msg,
        lead: null as any,
      } as any;
    }

    const updated = await res.json();
    return {
      ...updated,
      success: true,
      lead: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error',
      lead: null as any,
    } as any;
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(idOrCode: string | number): Promise<boolean> {
  try {
    const res = await authFetch(`${LEADS_API_URL}/${idOrCode}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error(`[LeadService] Failed to delete lead ${idOrCode}:`, error);
    return false;
  }
}

/**
 * Update lead status with flexible arguments
 */
export async function updateLeadStatus(
  idOrCode: string | number,
  statusOrPayload: LeadStatus | string | {
    status: LeadStatus | string;
    reason?: string;
    note?: string;
    followUpDate?: string;
    followUpTime?: string;
    finalValue?: number;
  },
  noteOrReason?: string,
  finalValue?: number
): Promise<Lead> {
  let body: any;
  if (typeof statusOrPayload === 'string') {
    body = {
      status: statusOrPayload,
      note: noteOrReason,
      reason: noteOrReason,
      finalValue,
    };
  } else {
    body = statusOrPayload;
  }

  const res = await authFetch(`${LEADS_API_URL}/${idOrCode}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${res.status}: Failed to update status`);
  }

  return await res.json();
}

/**
 * Add an activity note or call to a lead
 */
export async function addLeadActivity(idOrCode: string | number, activity: Partial<LeadActivity>): Promise<Lead> {
  const res = await authFetch(`${LEADS_API_URL}/${idOrCode}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(activity),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to add activity');
  }

  return await res.json();
}

/**
 * Fetch paginated activities for a lead (flexible parameter format)
 */
export async function fetchLeadActivities(
  idOrCode: string | number,
  paramsOrType?: string | { page?: number; size?: number; type?: string },
  pageArg: number = 0,
  sizeArg: number = 25
): Promise<{ content: LeadActivity[]; totalElements: number; totalPages: number; number: number; size: number }> {
  let page = pageArg;
  let size = sizeArg;
  let type: string | undefined;

  if (typeof paramsOrType === 'object' && paramsOrType !== null) {
    page = paramsOrType.page ?? 0;
    size = paramsOrType.size ?? 25;
    type = paramsOrType.type;
  } else if (typeof paramsOrType === 'string') {
    type = paramsOrType;
  }

  const query = new URLSearchParams();
  if (type) query.append('type', type);
  query.append('page', String(page));
  query.append('size', String(size));

  const res = await authFetch(`${LEADS_API_URL}/${idOrCode}/activities?${query.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  const pageMeta = data.page || data;
  return {
    content: data.content || [],
    totalElements: typeof pageMeta.totalElements === 'number' ? pageMeta.totalElements : (data.content?.length || 0),
    totalPages: typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : 1,
    number: typeof pageMeta.number === 'number' ? pageMeta.number : page,
    size: typeof pageMeta.size === 'number' ? pageMeta.size : size,
  };
}

/**
 * Schedule a new follow up
 */
export async function scheduleLeadFollowUp(
  idOrCode: string | number,
  followUp: Omit<Partial<FollowUpSchedule>, 'type'> & { type?: any }
): Promise<Lead> {
  const res = await authFetch(`${LEADS_API_URL}/${idOrCode}/followups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(followUp),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to schedule follow up');
  }

  return await res.json();
}

/**
 * Mark a follow up as completed
 */
export async function completeLeadFollowUp(idOrCode: string | number, followUpId: string | number, notes?: string): Promise<Lead> {
  const res = await authFetch(`${LEADS_API_URL}/${idOrCode}/followups/${followUpId}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to complete follow up');
  }

  return await res.json();
}

/**
 * Delete a follow up
 */
export async function deleteLeadFollowUp(idOrCode: string | number, followUpId: string | number): Promise<Lead> {
  const res = await authFetch(`${LEADS_API_URL}/${idOrCode}/followups/${followUpId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete follow up');
  }

  return await res.json();
}

/**
 * Upload lead attachment file
 */
export async function uploadAttachment(file: File, leadId?: string, leadCode?: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  if (leadId) formData.append('leadId', leadId);
  if (leadCode) formData.append('leadCode', leadCode);

  const res = await authFetch(`${ATTACHMENTS_API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to upload attachment');
  }

  return await res.json();
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(id: string | number): Promise<boolean> {
  try {
    const numId = String(id).replace(/^att-/, '');
    const res = await authFetch(`${ATTACHMENTS_API_URL}/${numId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error(`[LeadService] Failed to delete attachment ${id}:`, error);
    return false;
  }
}

/**
 * Check for duplicate leads
 */
export async function checkDuplicateLead(
  email?: string,
  companyName?: string
): Promise<{ isDuplicate: boolean; duplicateField?: string; existingLead?: any; matchedLeads: any[] }> {
  const query = new URLSearchParams();
  if (email?.trim()) query.append('email', email.trim());
  if (companyName?.trim()) query.append('companyName', companyName.trim());

  try {
    const res = await authFetch(`${LEADS_API_URL}/check-duplicate?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return { isDuplicate: false, matchedLeads: [] };
    const data = await res.json();
    return {
      isDuplicate: data.isDuplicate || false,
      duplicateField: data.duplicateField,
      existingLead: data.existingLead,
      matchedLeads: data.matchedLeads || (data.existingLead ? [data.existingLead] : []),
    };
  } catch {
    return { isDuplicate: false, matchedLeads: [] };
  }
}

/**
 * Bulk import leads
 */
export async function bulkImportLeads(requests: any[]): Promise<BulkImportResponse> {
  const res = await authFetch(`${LEADS_API_URL}/bulk-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requests),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Bulk import failed');
  }

  return await res.json();
}

/**
 * Dispatch B2B email
 */
export async function sendB2BEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const url = payload.leadId
    ? `${LEADS_API_URL}/${payload.leadId}/send-email`
    : `${EMAILS_API_URL}/send`;

  const res = await authFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err.message) msg = err.message;
    } catch {}
    return { success: false, message: msg, error: msg };
  }

  const data = await res.json();
  return {
    ...data,
    error: data.message && !data.success ? data.message : undefined,
  };
}
