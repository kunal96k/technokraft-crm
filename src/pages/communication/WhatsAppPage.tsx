import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ConversationList } from '../../components/communication/whatsapp/ConversationList';
import { ChatWindow } from '../../components/communication/whatsapp/ChatWindow';
import { LeadInfoPanel } from '../../components/communication/whatsapp/LeadInfoPanel';
import { WhatsAppConversation, WhatsAppMessage } from '../../types/communication';
import { fetchLeads } from '../../services/leadService';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const STORAGE_KEY = 'technokraft_whatsapp_chats_v1';

export const WhatsAppPage: React.FC = () => {
  const { user } = useAuth();

  // Conversations state & active thread
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Server-side Pagination & Filtering State (Scales to 10k+ clients seamlessly)
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Mobile navigation view: 'list' | 'chat' | 'lead'
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'lead'>('list');

  // Tablet/Desktop toggle for lead panel
  const [isLeadPanelOpen, setIsLeadPanelOpen] = useState(true);

  // Debounce search query to avoid spamming backend API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load paginated leads from database and hydrate conversation threads
  const loadConversations = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }

      try {
        const res = await fetchLeads({
          page,
          size: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sortBy: 'id',
          sortDirection: 'desc',
        });

        let savedMap: Record<string, WhatsAppMessage[]> = {};
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) savedMap = JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored WhatsApp messages', e);
        }

        if (res.content && res.content.length > 0) {
          const convs: WhatsAppConversation[] = res.content.map((lead) => {
            const convId = `conv-lead-${lead.id}`;
            const leadCode = lead.leadCode || `LD-${String(lead.id).padStart(4, '0')}`;
            const history = savedMap[convId] || [];
            const lastMsg =
              history.length > 0
                ? history[history.length - 1].text
                : lead.requirement?.summary
                ? `Requirement: ${lead.requirement.summary}`
                : `Domain: ${lead.service || 'Technology Consulting'}`;

            return {
              id: convId,
              leadId: String(lead.id),
              leadCode,
              contactName: lead.contact?.name || 'Client Lead',
              contactPhone: lead.contact?.phone || '+91 93701 74424',
              contactDesignation: lead.contact?.designation || 'Stakeholder',
              companyName: lead.company?.name || 'Company',
              companyWebsite: lead.company?.website || '',
              service: lead.service || 'Technology Consulting',
              leadStatus: lead.status || 'New',
              leadScore: lead.score || 50,
              assignedEmployee: lead.assignedEmployee?.name || user?.name || 'Sales Team',
              nextFollowUp: lead.nextFollowUp?.date
                ? `${lead.nextFollowUp.date} ${lead.nextFollowUp.time || ''}`.trim()
                : 'Pending',
              unreadCount: 0,
              lastMessage: lastMsg,
              lastActivityTime: history.length > 0 ? history[history.length - 1].time : 'Today',
              messages: history,
            };
          });

          setConversations(convs);
          setTotalElements(res.totalElements || convs.length);
          setTotalPages(Math.max(1, res.totalPages || Math.ceil((res.totalElements || convs.length) / pageSize)));

          // Automatically select first active conversation if current is not in view
          setActiveConversationId((prevActive) => {
            if (prevActive && convs.some((c) => c.id === prevActive)) {
              return prevActive;
            }
            return convs[0]?.id || null;
          });
        } else {
          setConversations([]);
          setTotalElements(res.totalElements || 0);
          setTotalPages(Math.max(1, res.totalPages || 1));
          setActiveConversationId(null);
        }
      } catch (err) {
        console.error('Failed to load paginated leads for WhatsApp:', err);
        setConversations([]);
        setTotalElements(0);
        setTotalPages(1);
        setActiveConversationId(null);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [page, pageSize, debouncedSearch, statusFilter, user]
  );

  // Initial load & when pagination/filter parameters change
  useEffect(() => {
    loadConversations(conversations.length === 0 && isLoading);
  }, [loadConversations]);

  // Reset to page 0 when search query or status filter changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const handleSelectConversation = (conv: WhatsAppConversation) => {
    setActiveConversationId(conv.id);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
    setMobileView('chat');
  };

  const persistMessage = (convId: string, msg: WhatsAppMessage) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const savedMap: Record<string, WhatsAppMessage[]> = stored ? JSON.parse(stored) : {};
      const existing = savedMap[convId] || [];
      savedMap[convId] = [...existing, msg];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMap));
    } catch (e) {
      console.error('Failed to persist WhatsApp message', e);
    }
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const newMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: 'employee',
      senderName: user?.name || 'Sales Representative',
      text,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      type: 'text',
    };

    persistMessage(conversationId, newMessage);

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastActivityTime: 'Just now',
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );
  };

  const handleSendDocument = (conversationId: string, filename: string) => {
    const newDocMessage: WhatsAppMessage = {
      id: `msg-doc-${Date.now()}`,
      sender: 'employee',
      senderName: user?.name || 'Sales Representative',
      text: `Attached file: ${filename}`,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      type: 'document',
      file: {
        name: filename,
        size: '1.4 MB',
        type: 'application/pdf',
      },
    };

    persistMessage(conversationId, newDocMessage);

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: `📄 ${filename}`,
            lastActivityTime: 'Just now',
            messages: [...c.messages, newDocMessage],
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-190px)] min-h-[540px] max-h-[calc(100vh-190px)] space-y-3 min-w-0 min-h-0">
      {/* Page Header (Fixed Top) */}
      <div className="flex-shrink-0">
        <PageHeader
          title="WhatsApp Communication"
          description="Manage live WhatsApp conversations and outreach with real CRM leads."
          showDateBadge={true}
        />
      </div>

      {/* Main Workspace Layout Container (Strictly Bound Height to Prevent Overflow) */}
      <div className="flex-1 min-h-0 h-full overflow-hidden">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Connecting to database & loading client conversations...
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Optimized server-side streaming for 10,000+ client records
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View (3 columns with grid containment) */}
            <div className="hidden lg:grid grid-cols-12 gap-3.5 h-full min-h-0 overflow-hidden">
              {/* Left Column: Paginated Conversations List */}
              <div className="col-span-4 xl:col-span-3 h-full min-h-0 flex flex-col overflow-hidden">
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusFilterChange}
                  filterType={filterType}
                  onFilterTypeChange={setFilterType}
                  page={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onRefresh={() => loadConversations(false)}
                />
              </div>

              {/* Center Column: Active Chat Window */}
              <div
                className={`h-full min-h-0 flex flex-col overflow-hidden transition-all ${
                  isLeadPanelOpen ? 'col-span-8 xl:col-span-6' : 'col-span-8 xl:col-span-9'
                }`}
              >
                <ChatWindow
                  conversation={activeConversation}
                  onSendMessage={handleSendMessage}
                  onSendDocument={handleSendDocument}
                  onToggleLeadPanel={() => setIsLeadPanelOpen(!isLeadPanelOpen)}
                  isLeadPanelOpen={isLeadPanelOpen}
                />
              </div>

              {/* Right Column: Lead CRM Details Panel */}
              {isLeadPanelOpen && (
                <div className="hidden xl:flex xl:col-span-3 h-full min-h-0 flex-col overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200">
                  <LeadInfoPanel conversation={activeConversation} />
                </div>
              )}
            </div>

            {/* Medium/Tablet View (md to lg) */}
            <div className="hidden md:grid lg:hidden grid-cols-12 gap-3 h-full min-h-0 overflow-hidden">
              <div className="col-span-5 h-full min-h-0 flex flex-col overflow-hidden">
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusFilterChange}
                  filterType={filterType}
                  onFilterTypeChange={setFilterType}
                  page={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onRefresh={() => loadConversations(false)}
                />
              </div>
              <div className="col-span-7 h-full min-h-0 flex flex-col overflow-hidden relative">
                <ChatWindow
                  conversation={activeConversation}
                  onSendMessage={handleSendMessage}
                  onSendDocument={handleSendDocument}
                  onToggleLeadPanel={() => setIsLeadPanelOpen(!isLeadPanelOpen)}
                  isLeadPanelOpen={isLeadPanelOpen}
                />

                {isLeadPanelOpen && (
                  <div className="absolute inset-y-0 right-0 w-80 z-20 shadow-2xl animate-in slide-in-from-right-4 duration-150">
                    <LeadInfoPanel
                      conversation={activeConversation}
                      onCloseMobile={() => setIsLeadPanelOpen(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile View (< md) */}
            <div className="md:hidden h-full min-h-0 flex flex-col overflow-hidden">
              {mobileView === 'list' && (
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  isLoading={isLoading}
                  isFetching={isFetching}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusFilterChange}
                  filterType={filterType}
                  onFilterTypeChange={setFilterType}
                  page={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onRefresh={() => loadConversations(false)}
                />
              )}

              {mobileView === 'chat' && (
                <div className="h-full min-h-0 flex flex-col overflow-hidden relative">
                  <ChatWindow
                    conversation={activeConversation}
                    onBackMobile={() => setMobileView('list')}
                    onSendMessage={handleSendMessage}
                    onSendDocument={handleSendDocument}
                    onToggleLeadPanel={() => setMobileView('lead')}
                    isLeadPanelOpen={false}
                  />
                </div>
              )}

              {mobileView === 'lead' && (
                <LeadInfoPanel
                  conversation={activeConversation}
                  onCloseMobile={() => setMobileView('chat')}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
