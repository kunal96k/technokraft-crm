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
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 ${className}`}
          >
            <Send className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Sent</span>
          </span>
        );
      case 'delivered':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 ${className}`}
          >
            <CheckCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>Delivered</span>
          </span>
        );
      case 'scheduled':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 ${className}`}
          >
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Scheduled</span>
          </span>
        );
      case 'reply_received':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 ${className}`}
          >
            <CornerDownLeft className="w-3 h-3 text-[#5B4DB7] dark:text-purple-300" />
            <span>Reply Received</span>
          </span>
        );
      case 'draft':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
          >
            <FileEdit className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>Draft</span>
          </span>
        );
      case 'queued':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 ${className}`}
          >
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Queued</span>
          </span>
        );
      case 'failed':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 ${className}`}
          >
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
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
        <span className="inline-flex items-center text-sky-600 dark:text-sky-400" title="Read">
          <CheckCheck className="w-3.5 h-3.5" />
        </span>
      );
    case 'delivered':
      return (
        <span className="inline-flex items-center text-slate-400 dark:text-slate-500" title="Delivered">
          <CheckCheck className="w-3.5 h-3.5" />
        </span>
      );
    case 'sent':
      return (
        <span className="inline-flex items-center text-slate-400 dark:text-slate-500" title="Sent">
          <Check className="w-3.5 h-3.5" />
        </span>
      );
    case 'sending':
      return (
        <span className="inline-flex items-center text-slate-400 dark:text-slate-500" title="Sending">
          <Clock className="w-3 h-3 animate-spin" />
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center text-rose-500 dark:text-rose-400" title="Failed to deliver">
          <AlertCircle className="w-3.5 h-3.5" />
        </span>
      );
    default:
      return null;
  }
};
