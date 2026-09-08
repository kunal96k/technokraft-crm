import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ConversationList } from '../../components/communication/whatsapp/ConversationList';
import { ChatWindow } from '../../components/communication/whatsapp/ChatWindow';
import { LeadInfoPanel } from '../../components/communication/whatsapp/LeadInfoPanel';
import { MOCK_WHATSAPP_CONVERSATIONS } from '../../data/mockCommunication';
import { WhatsAppConversation, WhatsAppMessage } from '../../types/communication';

export const WhatsAppPage: React.FC = () => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(
    MOCK_WHATSAPP_CONVERSATIONS
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    MOCK_WHATSAPP_CONVERSATIONS[0]?.id || null
  );

  // Mobile navigation view: 'list' | 'chat' | 'lead'
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'lead'>('list');

  // Tablet/Desktop toggle for lead panel
  const [isLeadPanelOpen, setIsLeadPanelOpen] = useState(true);

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

  const handleSendMessage = (conversationId: string, text: string) => {
    const newMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: 'employee',
      senderName: 'Rahul Patil',
      text,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      type: 'text',
    };

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
      senderName: 'Rahul Patil',
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
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="WhatsApp"
        description="Manage WhatsApp conversations with leads and customers."
        showDateBadge={true}
      />

      {/* Main Workspace Layout Container */}
      <div className="h-[calc(100vh-210px)] min-h-[580px] max-h-[820px]">
        {/* Desktop (3 columns) & Tablet (2 columns + collapsible details) */}
        <div className="hidden lg:grid grid-cols-12 gap-3.5 h-full">
          {/* Left Column: Conversations List (3.5 cols on full desktop, 4 on standard) */}
          <div className="col-span-4 xl:col-span-3 h-full">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>

          {/* Center Column: Active Chat Window */}
          <div
            className={`h-full transition-all ${
              isLeadPanelOpen
                ? 'col-span-8 xl:col-span-6'
                : 'col-span-8 xl:col-span-9'
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

          {/* Right Column: Lead CRM Details Panel (3 cols on xl) */}
          {isLeadPanelOpen && (
            <div className="hidden xl:block xl:col-span-3 h-full animate-in fade-in slide-in-from-right-3 duration-200">
              <LeadInfoPanel conversation={activeConversation} />
            </div>
          )}
        </div>

        {/* Medium/Tablet View (md to lg): 2 columns with lead drawer */}
        <div className="hidden md:grid lg:hidden grid-cols-12 gap-3 h-full">
          <div className="col-span-5 h-full">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          <div className="col-span-7 h-full relative">
            <ChatWindow
              conversation={activeConversation}
              onSendMessage={handleSendMessage}
              onSendDocument={handleSendDocument}
              onToggleLeadPanel={() => setIsLeadPanelOpen(!isLeadPanelOpen)}
              isLeadPanelOpen={isLeadPanelOpen}
            />

            {/* Slide-over lead drawer on tablet when opened */}
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

        {/* Mobile View (< md): single column with back navigation */}
        <div className="md:hidden h-full">
          {mobileView === 'list' && (
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />
          )}

          {mobileView === 'chat' && (
            <div className="h-full relative">
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
      </div>
    </div>
  );
};
