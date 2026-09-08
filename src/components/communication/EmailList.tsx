import React from 'react';
import {
  Inbox,
  Send,
  Clock,
  FileEdit,
  AlertCircle,
  CheckSquare,
  Square,
  Trash2,
  Mail,
} from 'lucide-react';
import { EmailRecord, EmailCategoryTab } from '../../types/communication';
import { EmailListItem } from './EmailListItem';
import { CommunicationEmptyState } from './CommunicationEmptyState';

interface EmailListProps {
  emails: EmailRecord[];
  allEmailsCount: Record<EmailCategoryTab, number>;
  activeTab: EmailCategoryTab;
  onSelectTab: (tab: EmailCategoryTab) => void;
  selectedEmailId: string | null;
  onSelectEmail: (email: EmailRecord) => void;
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string, e: React.MouseEvent) => void;
  onBulkDelete: () => void;
  onOpenBulkCompose: () => void;
  isLoading?: boolean;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  allEmailsCount,
  activeTab,
  onSelectTab,
  selectedEmailId,
  onSelectEmail,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onBulkDelete,
  onOpenBulkCompose,
  isLoading = false,
}) => {
  const tabs: { id: EmailCategoryTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All', icon: Inbox },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'scheduled', label: 'Scheduled', icon: Clock },
    { id: 'drafts', label: 'Drafts', icon: FileEdit },
    { id: 'failed', label: 'Failed', icon: AlertCircle },
  ];

  const allSelected = emails.length > 0 && selectedIds.length === emails.length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Category Navigation Tabs (Inside the email workspace) */}
      <div className="flex items-center px-2 pt-2 border-b border-slate-200 bg-slate-50/70 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = allEmailsCount[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#5B4DB7] text-[#5B4DB7] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-t-lg'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-purple-100 text-[#5B4DB7]'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk Operations Toolbar Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/40 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium"
            title="Select all currently visible emails"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-[#5B4DB7]" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-[11px]">Select All</span>
          </button>
          {selectedIds.length > 0 && (
            <span className="text-[11px] font-semibold text-[#5B4DB7] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenBulkCompose}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-md transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Bulk Email ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={onBulkDelete}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
              title="Delete selected emails"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Email List Content Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="animate-pulse flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <CommunicationEmptyState
            icon={Mail}
            title={`No ${activeTab} emails found`}
            description="There are no email communications matching your current category filter or search criteria."
          />
        ) : (
          emails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={selectedIds.includes(email.id)}
              isActive={selectedEmailId === email.id}
              onSelect={onToggleSelectOne}
              onClick={onSelectEmail}
            />
          ))
        )}
      </div>
    </div>
  );
};
