import React from 'react';
import { Paperclip, Building, User, ArrowRight } from 'lucide-react';
import { EmailRecord } from '../../types/communication';
import { CommunicationStatusBadge } from './CommunicationStatusBadge';

interface EmailListItemProps {
  email: EmailRecord;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onClick: (email: EmailRecord) => void;
}

export const EmailListItem: React.FC<EmailListItemProps> = ({
  email,
  isSelected,
  isActive,
  onSelect,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(email)}
      className={`group relative flex items-start sm:items-center justify-between p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer transition-all ${
        isActive
          ? 'bg-purple-50/70 dark:bg-purple-950/30 border-l-4 border-l-[#5B4DB7]'
          : 'bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1 pr-3">
        {/* Selection Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(email.id, e);
          }}
          className="pt-0.5 sm:pt-0 flex-shrink-0"
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 text-[#5B4DB7] rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-[#5B4DB7]/40 cursor-pointer"
            aria-label={`Select email to ${email.recipientName}`}
          />
        </div>

        {/* Core Email Metadata */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Top row: Recipient & Company + Lead Code */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {email.recipientName}
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span className="truncate max-w-[160px] sm:max-w-[200px]">{email.companyName}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {email.leadCode}
            </span>
          </div>

          {/* Subject & snippet */}
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">
              {email.subject}
            </p>
            {email.attachments && email.attachments.length > 0 && (
              <span
                className="inline-flex items-center text-slate-400 dark:text-slate-500 flex-shrink-0"
                title={`${email.attachments.length} attachment(s)`}
              >
                <Paperclip className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Bottom row on mobile: Sender & Time */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 sm:hidden pt-0.5">
            <span>By: {email.senderName}</span>
            <span>•</span>
            <span>{email.date}, {email.time}</span>
          </div>
        </div>
      </div>

      {/* Right side: Status, Sender & Time on desktop */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 flex-shrink-0">
        <CommunicationStatusBadge status={email.status} type="email" />

        <div className="hidden sm:block text-right">
          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            {email.date}, {email.time}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
            By {email.senderName}
          </div>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#5B4DB7] dark:group-hover:text-purple-400 hidden sm:block transition-colors" />
      </div>
    </div>
  );
};
