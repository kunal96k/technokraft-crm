import React from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  Send,
  AlertCircle,
  Mail,
  FileEdit,
  CornerDownLeft,
} from 'lucide-react';
import { EmailStatus, WhatsAppStatus } from '../../types/communication';

interface CommunicationStatusBadgeProps {
  status: EmailStatus | WhatsAppStatus | string;
  type?: 'email' | 'whatsapp';
  className?: string;
}

export const CommunicationStatusBadge: React.FC<CommunicationStatusBadgeProps> = ({
  status,
  type = 'email',
  className = '',
}) => {
  const norm = status.toLowerCase();

  // Email badge variants
  if (type === 'email') {
    switch (norm) {
      case 'sent':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
          >
            <Send className="w-3 h-3 text-emerald-600" />
            <span>Sent</span>
          </span>
        );
      case 'delivered':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 ${className}`}
          >
            <CheckCheck className="w-3 h-3 text-teal-600" />
            <span>Delivered</span>
          </span>
        );
      case 'scheduled':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
          >
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Scheduled</span>
          </span>
        );
      case 'reply_received':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-[#5B4DB7] border border-purple-200 ${className}`}
          >
            <CornerDownLeft className="w-3 h-3 text-[#5B4DB7]" />
            <span>Reply Received</span>
          </span>
        );
      case 'draft':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
          >
            <FileEdit className="w-3 h-3 text-slate-500" />
            <span>Draft</span>
          </span>
        );
      case 'queued':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
          >
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Queued</span>
          </span>
        );
      case 'failed':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
          >
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
          >
            <span>{status}</span>
          </span>
        );
    }
  }

  // WhatsApp status variant
  switch (norm) {
    case 'read':
      return (
        <span className="inline-flex items-center text-sky-600" title="Read">
          <CheckCheck className="w-3.5 h-3.5" />
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center text-slate-400" title="Delivered">
          <CheckCheck className="w-3.5 h-3.5" />
        </span>
      );
    case 'sent':
      return (
        <span className="inline-flex items-center text-slate-400" title="Sent">
          <Check className="w-3.5 h-3.5" />
        </span>
      );
    case 'sending':
      return (
        <span className="inline-flex items-center text-slate-300" title="Sending">
          <Clock className="w-3 h-3 animate-spin" />
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center text-rose-500" title="Failed to deliver">
          <AlertCircle className="w-3.5 h-3.5" />
        </span>
      );
    default:
      return null;
  }
};
