import React, { useState } from 'react';
import { Search, X, MessageSquare, Filter } from 'lucide-react';
import { WhatsAppConversation } from '../../../types/communication';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: WhatsAppConversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: WhatsAppConversation) => void;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const filtered = conversations.filter((c) => {
    const matchesFilter = filterType === 'all' || c.unreadCount > 0;
    const q = query.toLowerCase();
    const matchesSearch =
      q === '' ||
      c.contactName.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.contactPhone.toLowerCase().includes(q) ||
      c.leadCode.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs ${className}`}>
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations, phone, lead..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter chips (All / Unread) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-[#5B4DB7] text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('unread')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              filterType === 'unread'
                ? 'bg-[#5B4DB7] text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Unread ({conversations.filter((c) => c.unreadCount > 0).length})
          </button>
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p>No conversations found</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeConversationId === conv.id}
              onClick={() => onSelectConversation(conv)}
            />
          ))
        )}
      </div>
    </div>
  );
};
