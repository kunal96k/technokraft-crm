import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Phone,
  ExternalLink,
  CalendarPlus,
  FileText,
  Info,
  MoreVertical,
  CheckCircle2,
  Tag,
  UserCheck,
} from 'lucide-react';
import { WhatsAppConversation, WhatsAppMessage } from '../../../types/communication';
import { MessageBubble } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import { WhatsAppTemplateModal } from './WhatsAppTemplateModal';

interface ChatWindowProps {
  conversation: WhatsAppConversation | null;
  onBackMobile?: () => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onSendDocument: (conversationId: string, filename: string) => void;
  onToggleLeadPanel?: () => void;
  isLeadPanelOpen?: boolean;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onBackMobile,
  onSendMessage,
  onSendDocument,
  onToggleLeadPanel,
  isLeadPanelOpen,
  className = '',
}) => {
  const navigate = useNavigate();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  if (!conversation) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-400 ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
          <Phone className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700 mb-1">No Conversation Selected</h4>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          Select a WhatsApp prospect conversation from the left to start chatting or send CRM business updates.
        </p>
      </div>
    );
  }

  const handleSend = (text: string) => {
    onSendMessage(conversation.id, text);
    showToast('Message sent via WhatsApp Gateway');
  };

  const handleAttachMock = () => {
    const filename = `${conversation.companyName.replace(/\s+/g, '_')}_Proposal_Estimate.pdf`;
    onSendDocument(conversation.id, filename);
    showToast(`Attached & sent ${filename}`);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
      {/* Chat Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBackMobile && (
            <button
              type="button"
              onClick={onBackMobile}
              className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
              aria-label="Back to conversations list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {/* Contact avatar */}
          <div className="w-9 h-9 rounded-full bg-[#5B4DB7] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            {conversation.contactName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {conversation.contactName}
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-[#5B4DB7] border border-purple-200">
                {conversation.leadStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
              <span className="truncate">{conversation.companyName}</span>
              <span>•</span>
              <span className="font-mono">{conversation.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick CRM actions */}
          <button
            type="button"
            onClick={() => navigate(`/leads/${conversation.leadId}`)}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="View Lead Record"
          >
            <span>View Lead</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/follow-ups')}
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Schedule Follow-up"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-slate-500" />
            <span>Follow-up</span>
          </button>

          {/* Toggle Lead Info Drawer */}
          {onToggleLeadPanel && (
            <button
              type="button"
              onClick={onToggleLeadPanel}
              className={`p-2 rounded-lg border transition-colors ${
                isLeadPanelOpen
                  ? 'bg-purple-50 text-[#5B4DB7] border-purple-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-300'
              }`}
              title="Toggle Lead Information Panel"
              aria-label="Toggle Lead Details"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-1">
        {/* Date separator */}
        <div className="flex justify-center my-3">
          <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
            Today
          </span>
        </div>

        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Composer */}
      <ChatComposer
        onSendMessage={handleSend}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onAttachFile={handleAttachMock}
      />

      {/* Quick Templates Modal */}
      <WhatsAppTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        conversation={conversation}
        onSelectTemplate={handleSend}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-16 right-4 z-20 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
