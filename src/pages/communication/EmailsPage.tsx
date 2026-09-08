import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { CommunicationSummaryCards } from '../../components/communication/CommunicationSummaryCards';
import { EmailToolbar } from '../../components/communication/EmailToolbar';
import { EmailList } from '../../components/communication/EmailList';
import { EmailPreview } from '../../components/communication/EmailPreview';
import { EmailComposerModal } from '../../components/communication/EmailComposerModal';
import { EmailTemplatesModal } from '../../components/communication/EmailTemplatesModal';
import {
  MOCK_EMAILS,
  MOCK_COMMUNICATION_STATS,
} from '../../data/mockCommunication';
import {
  EmailRecord,
  EmailCategoryTab,
  CommunicationStats,
} from '../../types/communication';

export const EmailsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Emails dataset state
  const [emails, setEmails] = useState<EmailRecord[]>(MOCK_EMAILS);
  const [stats, setStats] = useState<CommunicationStats>(MOCK_COMMUNICATION_STATS);

  // Active category tab: 'all' | 'sent' | 'scheduled' | 'drafts' | 'failed'
  const [activeTab, setActiveTab] = useState<EmailCategoryTab>('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Selected Email for preview
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(MOCK_EMAILS[0]?.id || null);

  // Mobile navigation state: 'list' or 'preview'
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isComposerOpen, setIsComposerOpen] = useState(searchParams.get('compose') === 'true');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState<{
    leadId?: string;
    recipientEmail?: string;
    subject?: string;
    body?: string;
  }>({});

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setEmployeeFilter('');
  };

  // Tab counts
  const allEmailsCount = useMemo(() => {
    return {
      all: emails.length,
      sent: emails.filter((e) => e.status === 'sent' || e.status === 'delivered').length,
      scheduled: emails.filter((e) => e.status === 'scheduled').length,
      drafts: emails.filter((e) => e.status === 'draft').length,
      failed: emails.filter((e) => e.status === 'failed').length,
    };
  }, [emails]);

  // Filtered emails based on tab, search, and status
  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      // Category tab filtering
      if (activeTab === 'sent' && email.status !== 'sent' && email.status !== 'delivered') {
        return false;
      }
      if (activeTab === 'scheduled' && email.status !== 'scheduled') {
        return false;
      }
      if (activeTab === 'drafts' && email.status !== 'draft') {
        return false;
      }
      if (activeTab === 'failed' && email.status !== 'failed') {
        return false;
      }

      // Dropdown status filter
      if (statusFilter && email.status !== statusFilter) {
        return false;
      }

      // Sender employee filter
      if (employeeFilter && email.senderName !== employeeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          email.recipientName.toLowerCase().includes(q) ||
          email.recipientEmail.toLowerCase().includes(q) ||
          email.companyName.toLowerCase().includes(q) ||
          email.subject.toLowerCase().includes(q) ||
          email.leadCode.toLowerCase().includes(q) ||
          email.senderName.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [emails, activeTab, statusFilter, employeeFilter, searchQuery]);

  // Selected email object
  const activeEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  // Handle email row click
  const handleSelectEmail = (email: EmailRecord) => {
    setSelectedEmailId(email.id);
    setMobileView('preview');
  };

  // Toggle selection
  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredEmails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmails.map((e) => e.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} selected emails?`)) {
      setEmails((prev) => prev.filter((e) => !selectedIds.includes(e.id)));
      setSelectedIds([]);
    }
  };

  // Compose handler
  const handleOpenCompose = () => {
    setComposeDefaults({});
    setIsComposerOpen(true);
  };

  const handleReply = (original: EmailRecord) => {
    setComposeDefaults({
      leadId: original.leadId,
      recipientEmail: original.recipientEmail,
      subject: original.subject.startsWith('Re:') ? original.subject : `Re: ${original.subject}`,
      body: `\n\n--- Original Message from ${original.senderName} (${original.date}) ---\n${original.body}`,
    });
    setIsComposerOpen(true);
  };

  const handleResend = (original: EmailRecord) => {
    setComposeDefaults({
      leadId: original.leadId,
      recipientEmail: original.recipientEmail,
      subject: `[Resent] ${original.subject}`,
      body: original.body,
    });
    setIsComposerOpen(true);
  };

  const handleSendEmail = (newEmail: EmailRecord) => {
    setEmails((prev) => [newEmail, ...prev]);
    setSelectedEmailId(newEmail.id);
    setStats((prev) => ({
      ...prev,
      sentToday: newEmail.status === 'sent' ? prev.sentToday + 1 : prev.sentToday,
      scheduled: newEmail.status === 'scheduled' ? prev.scheduled + 1 : prev.scheduled,
    }));
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Emails"
        description="Manage customer communication and send personalized business emails."
        showDateBadge={true}
      />

      {/* 4 Compact Summary KPI Cards */}
      <CommunicationSummaryCards
        stats={stats}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedIds([]);
        }}
      />

      {/* Toolbar: Search, Filters, Compose button, Templates button */}
      <EmailToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        employeeFilter={employeeFilter}
        onEmployeeFilterChange={setEmployeeFilter}
        onResetFilters={handleResetFilters}
        onOpenCompose={handleOpenCompose}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        totalCount={filteredEmails.length}
      />

      {/* Email Workspace Container */}
      <div className="min-h-[580px] lg:h-[620px]">
        {/* Desktop / Tablet: 2-column layout (Left: List, Right: Preview) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 h-full">
          {/* Left: Email categories + List (5 cols) */}
          <div className="col-span-5 h-full">
            <EmailList
              emails={filteredEmails}
              allEmailsCount={allEmailsCount}
              activeTab={activeTab}
              onSelectTab={(t) => {
                setActiveTab(t);
                setSelectedIds([]);
              }}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectOne={handleToggleSelectOne}
              onBulkDelete={handleBulkDelete}
              onOpenBulkCompose={handleOpenCompose}
            />
          </div>

          {/* Right: Email Preview (7 cols) */}
          <div className="col-span-7 h-full">
            <EmailPreview
              email={activeEmail}
              onReply={handleReply}
              onResend={handleResend}
            />
          </div>
        </div>

        {/* Mobile: View switching between List and Preview */}
        <div className="lg:hidden h-full">
          {mobileView === 'list' ? (
            <EmailList
              emails={filteredEmails}
              allEmailsCount={allEmailsCount}
              activeTab={activeTab}
              onSelectTab={(t) => {
                setActiveTab(t);
                setSelectedIds([]);
              }}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectOne={handleToggleSelectOne}
              onBulkDelete={handleBulkDelete}
              onOpenBulkCompose={handleOpenCompose}
            />
          ) : (
            <EmailPreview
              email={activeEmail}
              onBackMobile={() => setMobileView('list')}
              onReply={handleReply}
              onResend={handleResend}
            />
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSendEmail={handleSendEmail}
        defaultLeadId={composeDefaults.leadId}
        defaultRecipientEmail={composeDefaults.recipientEmail}
        defaultSubject={composeDefaults.subject}
        defaultBody={composeDefaults.body}
      />

      {/* Templates Modal */}
      <EmailTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplateForCompose={(tpl) => {
          setComposeDefaults({
            subject: tpl.subject,
            body: tpl.body,
          });
          setIsComposerOpen(true);
        }}
      />
    </div>
  );
};
