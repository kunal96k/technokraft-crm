export type EmailStatus =
  | 'draft'
  | 'queued'
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'reply_received';

export type EmailCategoryTab = 'all' | 'sent' | 'scheduled' | 'drafts' | 'failed';

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface EmailTracking {
  sent: boolean;
  delivered: boolean;
  opened: boolean;
  replied: boolean;
  openedAt?: string;
  repliedAt?: string;
}

export interface EmailRecord {
  id: string;
  leadId: string;
  leadCode: string;
  companyName: string;
  recipientName: string;
  recipientEmail: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  status: EmailStatus;
  senderName: string;
  senderEmail: string;
  date: string;
  time: string;
  timestamp: string;
  scheduledFor?: string;
  attachments?: EmailAttachment[];
  tracking: EmailTracking;
  errorMessage?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
}

export type WhatsAppStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type WhatsAppMessageType = 'text' | 'document' | 'image' | 'template' | 'link';

export interface WhatsAppMessage {
  id: string;
  sender: 'contact' | 'employee';
  senderName: string;
  text: string;
  timestamp: string;
  time: string;
  status: WhatsAppStatus;
  type: WhatsAppMessageType;
  file?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface WhatsAppConversation {
  id: string;
  leadId: string;
  leadCode: string;
  contactName: string;
  contactPhone: string;
  contactDesignation: string;
  companyName: string;
  companyWebsite?: string;
  service: string;
  leadStatus: string;
  leadScore: number;
  assignedEmployee: string;
  nextFollowUp: string;
  unreadCount: number;
  lastMessage: string;
  lastActivityTime: string;
  messages: WhatsAppMessage[];
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  text: string;
  variables: string[];
}

export interface CommunicationStats {
  sentToday: number;
  scheduled: number;
  replies: number;
  failed: number;
  whatsappSentToday: number;
  whatsappActiveConversations: number;
}
