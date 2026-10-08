import React from 'react';
import {
  Search,
  X,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  RefreshCw,
} from 'lucide-react';
import { WhatsAppConversation } from '../../../types/communication';
import { ConversationItem } from './ConversationItem';

export interface ConversationListProps {
  conversations?: WhatsAppConversation[];
  activeConversationId?: string | null;
  onSelectConversation?: (conversation: WhatsAppConversation) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  filterType?: 'all' | 'unread';
  onFilterTypeChange?: (filterType: 'all' | 'unread') => void;
  page?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  onRefresh?: () => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'NEW', label: 'New Lead' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL', label: 'Proposal Sent' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won Deal' },
  { value: 'LOST', label: 'Lost Lead' },
];

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations = [],
  activeConversationId = null,
  onSelectConversation = (_c: WhatsAppConversation) => {},
  isLoading = false,
  isFetching = false,
  searchQuery = '',
  onSearchChange = (_q: string) => {},
  statusFilter = 'all',
  onStatusFilterChange = (_s: string) => {},
  filterType = 'all',
  onFilterTypeChange = (_f: 'all' | 'unread') => {},
  page = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 15,
  onPageChange = (_p: number) => {},
  onPageSizeChange = (_sz: number) => {},
  onRefresh,
  className = '',
}) => {
  // Safe numeric fallbacks
  const safeTotal = typeof totalElements === 'number' && !isNaN(totalElements) ? totalElements : (conversations?.length || 0);
  const safePage = typeof page === 'number' && !isNaN(page) ? page : 0;
  const safePageSize = typeof pageSize === 'number' && !isNaN(pageSize) && pageSize > 0 ? pageSize : 15;
  const safeTotalPages = typeof totalPages === 'number' && !isNaN(totalPages) && totalPages > 0 ? totalPages : 1;

  // Unread count from the loaded conversations
  const unreadCount = (conversations || []).filter((c) => (c?.unreadCount || 0) > 0).length;

  // Filter conversations locally by 'unread' if unread tab is active
  const displayedConversations = filterType === 'unread'
    ? (conversations || []).filter((c) => (c?.unreadCount || 0) > 0)
    : (conversations || []);

  // Calculate range for pagination text
  const startItem = safeTotal === 0 ? 0 : safePage * safePageSize + 1;
  const endItem = Math.min((safePage + 1) * safePageSize, safeTotal);

  return (
    <div
      className={`flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs ${className}`}
    >
      {/* Top Header & Search Bar */}
      <div className="flex-shrink-0 p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5">
        {/* Module Title & Global Counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Client Conversations
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {safeTotal.toLocaleString()} Total
            </span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading || isFetching}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh leads list"
                aria-label="Refresh leads list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#5B4DB7]' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Live Search Input (Server Debounced) */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 10k+ clients (name, company, phone)..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Row: All/Unread Tabs & Status Dropdown */}
        <div className="flex items-center justify-between gap-2">
          {/* Quick Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onFilterTypeChange('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-[#5B4DB7] text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All ({safeTotal.toLocaleString()})
            </button>
            <button
              type="button"
              onClick={() => onFilterTypeChange('unread')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterType === 'unread'
                  ? 'bg-[#5B4DB7] text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Lead Status Select */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md py-1 pl-2 pr-6 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fetching Progress Indicator */}
      {isFetching && (
        <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
          <div className="h-full bg-[#5B4DB7] animate-pulse w-full" />
        </div>
      )}

      {/* Conversation Items List (Strictly Scrollable Within Container) */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center h-full">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-medium text-slate-600 dark:text-slate-400">No conversations found</p>
            {(searchQuery || statusFilter !== 'all' || filterType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onStatusFilterChange('all');
                  onFilterTypeChange('all');
                }}
                className="mt-3 text-[11px] font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          displayedConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeConversationId === conv.id}
              onClick={() => onSelectConversation(conv)}
            />
          ))
        )}
      </div>

      {/* Server-Side Pagination Bar (Fixed Bottom of Sidebar Card) */}
      <div className="flex-shrink-0 p-2.5 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {/* Row 1: Item Range and Page Size Selector */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {safeTotal > 0 ? (
              <>
                <strong className="text-slate-700 dark:text-slate-200">{startItem}–{endItem}</strong> of{' '}
                <strong className="text-slate-700 dark:text-slate-200">{safeTotal.toLocaleString()}</strong>
              </>
            ) : (
              '0 clients'
            )}
          </span>

          {/* Page Size Select */}
          <div className="flex items-center gap-1">
            <span>Rows:</span>
            <select
              value={safePageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-[11px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Row 2: Navigation Buttons */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(0)}
              disabled={safePage === 0 || isLoading || isFetching}
              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
              title="First Page"
              aria-label="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(safePage - 1)}
              disabled={safePage === 0 || isLoading || isFetching}
              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Page {safePage + 1} / {Math.max(1, safeTotalPages)}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(safePage + 1)}
              disabled={safePage >= safeTotalPages - 1 || isLoading || isFetching}
              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(safeTotalPages - 1)}
              disabled={safePage >= safeTotalPages - 1 || isLoading || isFetching}
              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors"
              title="Last Page"
              aria-label="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
