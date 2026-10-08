import { EmailRecord, EmailCategoryTab, CommunicationStats, EmailTemplate } from '../types/communication';
import { SendEmailPayload, SendEmailResult } from './leadService';
import { authFetch } from './apiClient';
import { Lead } from '../types/leads';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string)?.replace(/\/leads$/, '') || '';
const EMAILS_API_URL = `${API_BASE_URL}/api/emails`;

export interface FetchEmailsParams {
  tab?: EmailCategoryTab | string;
  status?: string;
  search?: string;
  employee?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface EmailsPageResponse {
  content: EmailRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  isBackendConnected: boolean;
}

export interface EmailStatsResponse extends CommunicationStats {
  drafts: number;
  total: number;
  tabCounts: Record<string, number>;
  isBackendConnected: boolean;
}

/**
 * Fetch paginated and filtered emails from the Spring Boot backend
 */
export async function fetchEmails(params: FetchEmailsParams = {}): Promise<EmailsPageResponse> {
  const query = new URLSearchParams();
  if (params.tab && params.tab !== 'all') query.append('tab', params.tab);
  if (params.status) query.append('status', params.status);
  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.employee?.trim()) query.append('employee', params.employee.trim());
  query.append('page', String(params.page ?? 0));
  query.append('size', String(params.size ?? 50));
  query.append('sortBy', params.sortBy || 'id');
  query.append('sortDirection', params.sortDirection || 'desc');

  try {
    const res = await authFetch(`${EMAILS_API_URL}?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const pageMeta = data.page || data;
    const content: EmailRecord[] = data.content || [];

    return {
      content,
      totalElements: typeof pageMeta.totalElements === 'number' ? pageMeta.totalElements : content.length,
      totalPages: typeof pageMeta.totalPages === 'number' ? pageMeta.totalPages : 1,
      number: typeof pageMeta.number === 'number' ? pageMeta.number : 0,
      size: typeof pageMeta.size === 'number' ? pageMeta.size : (params.size ?? 50),
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('[EmailService] Failed to fetch emails:', error);
    return {
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: params.page ?? 0,
      size: params.size ?? 50,
      isBackendConnected: false,
    };
  }
}

/**
 * Fetch live email communication stats and tab counts from backend
 */
export async function fetchEmailStats(): Promise<EmailStatsResponse> {
  try {
    const res = await authFetch(`${EMAILS_API_URL}/stats`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      sentToday: data.sentToday || 0,
      scheduled: data.scheduled || 0,
      replies: data.replies || 0,
      failed: data.failed || 0,
      drafts: data.drafts || 0,
      total: data.total || 0,
      whatsappSentToday: data.whatsappSentToday || 0,
      whatsappActiveConversations: data.whatsappActiveConversations || 0,
      tabCounts: data.tabCounts || {
        all: data.total || 0,
        sent: data.sentToday || 0,
        scheduled: data.scheduled || 0,
        drafts: data.drafts || 0,
        failed: data.failed || 0,
      },
      isBackendConnected: true,
    };
  } catch (error) {
    console.error('[EmailService] Failed to fetch email stats:', error);
    return {
      sentToday: 0,
      scheduled: 0,
      replies: 0,
      failed: 0,
      drafts: 0,
      total: 0,
      whatsappSentToday: 0,
      whatsappActiveConversations: 0,
      tabCounts: {
        all: 0,
        sent: 0,
        scheduled: 0,
        drafts: 0,
        failed: 0,
      },
      isBackendConnected: false,
    };
  }
}

/**
 * Delete a single email record from backend
 */
export async function deleteEmail(id: string | number): Promise<boolean> {
  try {
    const res = await authFetch(`${EMAILS_API_URL}/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error(`[EmailService] Failed to delete email ${id}:`, error);
    return false;
  }
}

/**
 * Bulk delete email records from backend
 */
export async function bulkDeleteEmails(ids: (string | number)[]): Promise<number> {
  try {
    const numericIds = ids.map((id) => Number(id)).filter((n) => !isNaN(n));
    const res = await authFetch(`${EMAILS_API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numericIds),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return data.deletedCount || 0;
  } catch (error) {
    console.error('[EmailService] Failed to bulk delete emails:', error);
    return 0;
  }
}

/**
 * Resend an email from backend
 */
export async function resendEmail(id: string | number): Promise<SendEmailResult> {
  try {
    const res = await authFetch(`${EMAILS_API_URL}/${id}/resend`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        if (err.message) msg = err.message;
      } catch {}
      return { success: false, message: msg };
    }

    return await res.json();
  } catch (error) {
    console.error(`[EmailService] Failed to resend email ${id}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

const TEMPLATES_API_URL = `${API_BASE_URL}/api/email-templates`;

/**
 * Fetch all email templates from backend database
 */
export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const res = await authFetch(TEMPLATES_API_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data: EmailTemplate[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[EmailService] Failed to fetch templates:', error);
    return [];
  }
}

/**
 * Create custom email template in database
 */
export async function createEmailTemplate(tpl: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
  try {
    const res = await authFetch(TEMPLATES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(tpl),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[EmailService] Failed to create template:', error);
    return null;
  }
}

/**
 * Replaces template variables (e.g. {{contact_name}}) with live database lead values
 */
export function resolveTemplateText(
  text: string,
  lead?: Lead | null,
  employeeName: string = ''
): string {
  if (!text) return '';
  if (!lead) {
    return text
      .replace(/{{employee_name}}/g, employeeName)
      .replace(/{{assigned_employee}}/g, employeeName);
  }

  const senderName = lead.assignedEmployee?.name || employeeName;
  const contactName = lead.contact?.name || '';
  const companyName = lead.company?.name || '';
  const companyWebsite = lead.company?.website || '';
  const designation = lead.contact?.designation || '';
  const service = lead.service || '';
  const leadCode = lead.leadCode || (lead.id ? `LD-${lead.id}` : '');
  const recipientEmail = lead.contact?.email || '';
  const recipientPhone = lead.contact?.phone || '';
  const reqSummary = lead.requirement?.summary || '';
  const budget = lead.requirement?.budgetRange || '';
  const timeline = lead.requirement?.expectedTimeline || '';

  return text
    .replace(/{{contact_name}}/g, contactName)
    .replace(/{{company_name}}/g, companyName)
    .replace(/{{company_website}}/g, companyWebsite)
    .replace(/{{designation}}/g, designation)
    .replace(/{{service}}/g, service)
    .replace(/{{lead_id}}/g, leadCode)
    .replace(/{{recipient_email}}/g, recipientEmail)
    .replace(/{{recipient_phone}}/g, recipientPhone)
    .replace(/{{requirement}}/g, reqSummary)
    .replace(/{{budget}}/g, budget)
    .replace(/{{timeline}}/g, timeline)
    .replace(/{{employee_name}}/g, senderName)
    .replace(/{{assigned_employee}}/g, senderName);
}


