import { NotificationItem } from '../types/navigation';
import { authFetch } from './apiClient';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string)?.replace(/\/leads$/, '') || '';
const NOTIFICATIONS_API_URL = `${API_BASE_URL}/api/notifications`;

export interface FetchNotificationsResponse {
  content: NotificationItem[];
  unreadCount: number;
  totalElements: number;
}

/**
 * Custom event to notify all components (bell dropdown, notification center)
 * to re-synchronize immediately when notification states change.
 */
export const NOTIFICATIONS_UPDATED_EVENT = 'crm-notifications-updated';

export function notifyNotificationStateChanged(): void {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

/**
 * Fetch notifications from the backend API.
 */
export async function fetchNotifications(params?: {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}): Promise<FetchNotificationsResponse> {
  const query = new URLSearchParams();
  if (params?.unreadOnly) query.set('unreadOnly', 'true');
  if (params?.page !== undefined) query.set('page', String(params.page));
  if (params?.size !== undefined) query.set('size', String(params.size));

  const url = `${NOTIFICATIONS_API_URL}${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await authFetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: (data.content || []).map((item: any) => ({
      id: String(item.id),
      title: item.title || 'Notification',
      description: item.description || '',
      time: item.time || 'Just now',
      unread: Boolean(item.unread),
      type: (item.type || 'system') as NotificationItem['type'],
      linkUrl: item.linkUrl,
      leadId: item.leadId,
      leadCode: item.leadCode,
      priority: item.priority,
      createdAt: item.createdAt,
    })),
    unreadCount: Number(data.unreadCount || 0),
    totalElements: Number(data.totalElements || 0),
  };
}

/**
 * Get real-time unread notifications count.
 */
export async function fetchUnreadCount(): Promise<number> {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/unread-count`, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Failed to fetch unread notification count: ${response.statusText}`);
  }
  const data = await response.json();
  return Number(data.unreadCount || 0);
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(id: string | number): Promise<NotificationItem> {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/${id}/read?read=true`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error(`Failed to mark notification #${id} as read: ${response.statusText}`);
  }
  const item = await response.json();
  notifyNotificationStateChanged();
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    time: item.time,
    unread: Boolean(item.unread),
    type: item.type as NotificationItem['type'],
    linkUrl: item.linkUrl,
    leadId: item.leadId,
    leadCode: item.leadCode,
    priority: item.priority,
    createdAt: item.createdAt,
  };
}

/**
 * Toggle read/unread state of a single notification.
 */
export async function toggleNotificationRead(id: string | number): Promise<NotificationItem> {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/${id}/toggle-read`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error(`Failed to toggle notification #${id}: ${response.statusText}`);
  }
  const item = await response.json();
  notifyNotificationStateChanged();
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    time: item.time,
    unread: Boolean(item.unread),
    type: item.type as NotificationItem['type'],
    linkUrl: item.linkUrl,
    leadId: item.leadId,
    leadCode: item.leadCode,
    priority: item.priority,
    createdAt: item.createdAt,
  };
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(): Promise<void> {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/read-all`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
  }
  notifyNotificationStateChanged();
}

/**
 * Delete a single notification.
 */
export async function deleteNotification(id: string | number): Promise<void> {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete notification #${id}: ${response.statusText}`);
  }
  notifyNotificationStateChanged();
}

/**
 * Clear all notifications.
 */
export async function clearAllNotifications(): Promise<void> {
  const response = await authFetch(`${NOTIFICATIONS_API_URL}/clear`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to clear all notifications: ${response.statusText}`);
  }
  notifyNotificationStateChanged();
}

/**
 * Create a new notification.
 */
export async function createNotification(payload: {
  title: string;
  description: string;
  type?: string;
  linkUrl?: string;
  leadId?: number;
  leadCode?: string;
  priority?: string;
}): Promise<NotificationItem> {
  const response = await authFetch(NOTIFICATIONS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to create notification: ${response.statusText}`);
  }
  const item = await response.json();
  notifyNotificationStateChanged();
  return {
    id: String(item.id),
    title: item.title,
    description: item.description,
    time: item.time,
    unread: Boolean(item.unread),
    type: item.type as NotificationItem['type'],
    linkUrl: item.linkUrl,
    leadId: item.leadId,
    leadCode: item.leadCode,
    priority: item.priority,
    createdAt: item.createdAt,
  };
}
