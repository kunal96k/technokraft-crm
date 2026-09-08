import React from 'react';
import { FileText, Download } from 'lucide-react';
import { WhatsAppMessage } from '../../../types/communication';
import { CommunicationStatusBadge } from '../CommunicationStatusBadge';

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isEmployee = message.sender === 'employee';

  return (
    <div
      className={`flex flex-col mb-3 ${
        isEmployee ? 'items-end' : 'items-start'
      }`}
    >
      {/* Sender label */}
      <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
        {message.senderName}
      </span>

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-xs leading-relaxed space-y-1.5 ${
          isEmployee
            ? 'bg-[#5B4DB7] text-white rounded-tr-xs'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
        }`}
      >
        {/* Document attachment if present */}
        {message.type === 'document' && message.file && (
          <div
            className={`flex items-center gap-2 p-2 rounded-lg mb-1.5 ${
              isEmployee
                ? 'bg-white/15 text-white'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate text-[11px]">{message.file.name}</div>
              <div className="text-[9px] opacity-80">{message.file.size}</div>
            </div>
            <button
              type="button"
              onClick={() => alert(`Downloading ${message.file?.name}`)}
              className="p-1 rounded hover:bg-black/10"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Message text with line break preservation */}
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Footer info: time and delivery status */}
        <div
          className={`flex items-center justify-end gap-1.5 text-[10px] pt-0.5 ${
            isEmployee ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'
          }`}
        >
          <span>{message.time}</span>
          {isEmployee && (
            <CommunicationStatusBadge status={message.status} type="whatsapp" />
          )}
        </div>
      </div>
    </div>
  );
};
