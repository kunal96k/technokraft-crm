import { ProposalRecord, ProposalStatus } from '../types/opportunities';
import { authFetch } from './apiClient';

const API_BASE_URL = '/api/proposals';

export interface ProposalQueryParams {
  search?: string;
  status?: string;
  service?: string;
  owner?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function fetchProposals(params: ProposalQueryParams = {}): Promise<PageResponse<ProposalRecord>> {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.service && params.service !== 'all') query.append('service', params.service);
  if (params.owner && params.owner !== 'all') query.append('owner', params.owner);
  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 50));

  const res = await authFetch(`${API_BASE_URL}?${query.toString()}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch proposals: HTTP ${res.status}`);
  }

  const data = await res.json();
  const pageMeta = data.page || {};
  return {
    content: (data.content || []).map(normalizeProposal),
    totalElements: data.totalElements ?? pageMeta.totalElements ?? (data.content?.length || 0),
    totalPages: data.totalPages ?? pageMeta.totalPages ?? 1,
    number: data.number ?? pageMeta.number ?? 0,
    size: data.size ?? pageMeta.size ?? 50,
  };
}

export async function fetchProposalsByOpportunity(opportunityId: string): Promise<ProposalRecord[]> {
  const res = await authFetch(`${API_BASE_URL}/by-opportunity/${encodeURIComponent(opportunityId)}`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    return [];
  }

  const list = await res.json();
  return (list || []).map(normalizeProposal);
}

export async function createProposal(proposal: Partial<ProposalRecord>): Promise<ProposalRecord> {
  const res = await authFetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(proposal),
  });

  if (!res.ok) {
    throw new Error(`Failed to create proposal: HTTP ${res.status}`);
  }

  const data = await res.json();
  return normalizeProposal(data);
}

export async function updateProposal(id: string | number, proposal: Partial<ProposalRecord>): Promise<ProposalRecord> {
  const res = await authFetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(proposal),
  });

  if (!res.ok) {
    throw new Error(`Failed to update proposal: HTTP ${res.status}`);
  }

  const data = await res.json();
  return normalizeProposal(data);
}

export async function updateProposalStatus(id: string | number, status: ProposalStatus): Promise<ProposalRecord> {
  const res = await authFetch(`${API_BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`Failed to update proposal status: HTTP ${res.status}`);
  }

  const data = await res.json();
  return normalizeProposal(data);
}

export async function deleteProposal(id: string | number): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete proposal: HTTP ${res.status}`);
  }
}

function normalizeProposal(raw: any): ProposalRecord {
  let comm = raw.commercialDetails;
  if (typeof comm === 'string') {
    try {
      comm = JSON.parse(comm);
    } catch {
      comm = null;
    }
  }

  const hostingSection = raw.hostingSection || comm?.hostingSection || undefined;
  const servicesSection = raw.servicesSection || comm?.servicesSection || undefined;

  return {
    id: String(raw.id),
    proposalCode: raw.proposalCode || `PR-${raw.id}`,
    opportunityId: String(raw.opportunityId || ''),
    opportunityName: raw.opportunityName || '',
    leadCode: raw.leadCode || undefined,
    companyName: raw.companyName || '',
    contactName: raw.contactName || '',
    contactEmail: raw.contactEmail || undefined,
    contactPhone: raw.contactPhone || undefined,
    service: raw.service || 'Custom Software Development',
    amount: Number(raw.amount) || 0,
    createdDate: raw.createdDate || '',
    sentDate: raw.sentDate || undefined,
    validUntil: raw.validUntil || '',
    status: (raw.status as ProposalStatus) || 'Draft',
    ownerName: raw.ownerName || 'Sales Team',
    summary: raw.summary || '',
    timelineDescription: raw.timelineDescription || '',
    commercialDetails: comm || raw.commercialDetails || undefined,
    hostingSection,
    servicesSection,
    activityHistory: Array.isArray(raw.activityHistory) ? raw.activityHistory : [],
  };
}
