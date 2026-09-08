import React from 'react';
import { Building, Phone } from 'lucide-react';
import { WhatsAppConversation } from '../../../types/communication';

interface ConversationItemProps {
  conversation: WhatsAppConversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('interest')) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (s.includes('qualif')) return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (s.includes('propos')) return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (s.includes('negot')) return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer transition-all flex items-start gap-3 select-none ${
        isActive
          ? 'bg-purple-50/70 dark:bg-purple-950/30 border-l-4 border-l-[#5B4DB7]'
          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
      }`}
    >
      {/* Avatar with Initials */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B4DB7] to-indigo-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
        {getInitials(conversation.contactName)}
      </div>

      {/* Conversation Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {conversation.contactName}
          </h4>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex-shrink-0">
            {conversation.lastActivityTime}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate mb-1">
          <Building className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="truncate">{conversation.companyName}</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
          {conversation.lastMessage}
        </p>

        {/* Status chip & unread badge */}
        <div className="flex items-center justify-between mt-2 pt-0.5">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getStatusColor(
              conversation.leadStatus
            )}`}
          >
            {conversation.leadStatus}
          </span>

          {conversation.unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#5B4DB7] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
