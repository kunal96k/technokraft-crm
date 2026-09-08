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
    if (s.includes('interest')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s.includes('qualif')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s.includes('propos')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s.includes('negot')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 border-b border-slate-100 cursor-pointer transition-all flex items-start gap-3 select-none ${
        isActive
          ? 'bg-purple-50/70 border-l-4 border-l-[#5B4DB7]'
          : 'bg-white hover:bg-slate-50'
      }`}
    >
      {/* Avatar with Initials */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B4DB7] to-indigo-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
        {getInitials(conversation.contactName)}
      </div>

      {/* Conversation Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4 className="text-xs font-bold text-slate-900 truncate">
            {conversation.contactName}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
            {conversation.lastActivityTime}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mb-1">
          <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="truncate">{conversation.companyName}</span>
        </div>

        <p className="text-xs text-slate-600 truncate">
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
