import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { CommunicationSummaryCards } from '../../components/communication/CommunicationSummaryCards';
import { EmailToolbar } from '../../components/communication/EmailToolbar';
import { EmailList } from '../../components/communication/EmailList';
import { EmailPreview } from '../../components/communication/EmailPreview';
import { EmailComposerModal } from '../../components/communication/EmailComposerModal';
import { EmailTemplatesModal } from '../../components/communication/EmailTemplatesModal';
import {
  EmailRecord,
  EmailCategoryTab,
  CommunicationStats,
} from '../../types/communication';
import {
  fetchEmails,
  fetchEmailStats,
  bulkDeleteEmails,
  resendEmail,
} from '../../services/emailService';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const EmailsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Emails dataset state from backend
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [stats, setStats] = useState<CommunicationStats>({
    sentToday: 0,
    scheduled: 0,
    replies: 0,
    failed: 0,
    whatsappSentToday: 0,
    whatsappActiveConversations: 0,
  });
  const [tabCounts, setTabCounts] = useState<Record<EmailCategoryTab, number>>({
    all: 0,
    sent: 0,
    scheduled: 0,
    drafts: 0,
    failed: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Active category tab: 'all' | 'sent' | 'scheduled' | 'drafts' | 'failed'
  const [activeTab, setActiveTab] = useState<EmailCategoryTab>('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Server-side pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Email for preview
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Load emails & stats from backend
  const loadEmailData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [emailsRes, statsRes] = await Promise.all([
        fetchEmails({
          tab: activeTab,
          status: statusFilter,
          employee: employeeFilter,
          search: searchQuery,
          page,
          size: pageSize,
        }),
        fetchEmailStats(),
      ]);

      setEmails(emailsRes.content);
      setTotalElements(emailsRes.totalElements);
      setTotalPages(emailsRes.totalPages);
      setIsBackendConnected(emailsRes.isBackendConnected);

      if (statsRes.isBackendConnected) {
        setStats({
          sentToday: statsRes.sentToday,
          scheduled: statsRes.scheduled,
          replies: statsRes.replies,
          failed: statsRes.failed,
          whatsappSentToday: statsRes.whatsappSentToday,
          whatsappActiveConversations: statsRes.whatsappActiveConversations,
        });

        setTabCounts({
          all: statsRes.tabCounts?.all ?? statsRes.total,
          sent: statsRes.tabCounts?.sent ?? statsRes.sentToday,
          scheduled: statsRes.tabCounts?.scheduled ?? statsRes.scheduled,
          drafts: statsRes.tabCounts?.drafts ?? statsRes.drafts,
          failed: statsRes.tabCounts?.failed ?? statsRes.failed,
        });
      }

      // Auto-select first email if none selected or if active is no longer in list
      if (emailsRes.content.length > 0) {
        setSelectedEmailId((prev) => {
          if (prev && emailsRes.content.some((e) => e.id === prev)) {
            return prev;
          }
          return emailsRes.content[0].id;
        });
      } else {
        setSelectedEmailId(null);
      }
    } catch (err) {
      console.error('Failed to load email data:', err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, statusFilter, employeeFilter, searchQuery, page, pageSize]);

  useEffect(() => {
    loadEmailData();
  }, [loadEmailData]);

  // Listen to cross-component updates
  useEffect(() => {
    const handleUpdate = () => {
      loadEmailData();
    };
    window.addEventListener('crm-leads-updated', handleUpdate);
    window.addEventListener('crm-emails-updated', handleUpdate);
    return () => {
      window.removeEventListener('crm-leads-updated', handleUpdate);
      window.removeEventListener('crm-emails-updated', handleUpdate);
    };
  }, [loadEmailData]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setEmployeeFilter('');
  };

  // Compute category counts for tab headers
  const allEmailsCount = useMemo(() => {
    return tabCounts;
  }, [tabCounts]);

  // Selected email object
  const activeEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || emails[0] || null;
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
    if (selectedIds.length === emails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(emails.map((e) => e.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (window.confirm(`Delete ${selectedIds.length} selected emails permanently from database?`)) {
      try {
        const count = await bulkDeleteEmails(selectedIds);
        showToast(`Deleted ${count} email(s) successfully.`);
        setSelectedIds([]);
        loadEmailData();
      } catch (err) {
        showToast('Failed to delete emails', 'error');
      }
    }
  };

  // Compose handler
  const handleOpenCompose = () => {
    setComposeDefaults({});
    setIsComposerOpen(true);
  };

  const handleReply = (original: EmailRecord) => {
    let cleanSub = original.subject.replace(/--+/g, ' - ').trim();
    if (!cleanSub.toLowerCase().startsWith('re:')) {
      cleanSub = `Re: ${cleanSub}`;
    }
    setComposeDefaults({
      leadId: original.leadId,
      recipientEmail: original.recipientEmail,
      subject: cleanSub,
      body: `\n\n________________________________________\nFrom: ${original.senderName} (${original.date})\n${original.body}`,
    });
    setIsComposerOpen(true);
  };

  const handleResend = async (original: EmailRecord) => {
    try {
      showToast(`Resending email to ${original.recipientEmail}...`);
      const res = await resendEmail(original.id);
      if (res.success) {
        showToast(`✓ Email resent successfully to ${original.recipientEmail}`);
        loadEmailData();
      } else {
        showToast(`Resend failed: ${res.message || 'Error'}`, 'error');
      }
    } catch (err) {
      showToast('Failed to resend email', 'error');
    }
  };

  const handleSendEmailSuccess = () => {
    loadEmailData();
    window.dispatchEvent(new Event('crm-emails-updated'));
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Emails"
          description="Manage customer communication and send personalized business emails via Gmail SMTP."
          showDateBadge={true}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadEmailData()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
            title="Refresh email inbox from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#5B4DB7]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Compact Summary KPI Cards */}
      <CommunicationSummaryCards
        stats={stats}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setPage(0);
          setSelectedIds([]);
        }}
      />

      {/* Toolbar: Search, Filters, Compose button, Templates button */}
      <EmailToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(0);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setPage(0);
        }}
        employeeFilter={employeeFilter}
        onEmployeeFilterChange={(e) => {
          setEmployeeFilter(e);
          setPage(0);
        }}
        onResetFilters={() => {
          handleResetFilters();
          setPage(0);
        }}
        onOpenCompose={handleOpenCompose}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        totalCount={totalElements || emails.length}
      />

      {/* Email Workspace Container */}
      <div className="h-[650px] xl:h-[calc(100vh-270px)] min-h-[560px] pb-1">
        {/* Desktop / Tablet: 2-column layout (Left: List, Right: Preview) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 h-full min-h-0">
          {/* Left: Email categories + List (5 cols) */}
          <div className="col-span-5 h-full min-h-0">
            <EmailList
              emails={emails}
              allEmailsCount={allEmailsCount}
              activeTab={activeTab}
              onSelectTab={(t) => {
                setActiveTab(t);
                setPage(0);
                setSelectedIds([]);
              }}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectOne={handleToggleSelectOne}
              onBulkDelete={handleBulkDelete}
              onOpenBulkCompose={handleOpenCompose}
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(0);
              }}
            />
          </div>

          {/* Right: Email Preview (7 cols) */}
          <div className="col-span-7 h-full min-h-0">
            <EmailPreview
              email={activeEmail}
              onReply={handleReply}
              onResend={handleResend}
            />
          </div>
        </div>

        {/* Mobile: View switching between List and Preview */}
        <div className="lg:hidden h-full min-h-0">
          {mobileView === 'list' ? (
            <EmailList
              emails={emails}
              allEmailsCount={allEmailsCount}
              activeTab={activeTab}
              onSelectTab={(t) => {
                setActiveTab(t);
                setPage(0);
                setSelectedIds([]);
              }}
              selectedEmailId={selectedEmailId}
              onSelectEmail={handleSelectEmail}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectOne={handleToggleSelectOne}
              onBulkDelete={handleBulkDelete}
              onOpenBulkCompose={handleOpenCompose}
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(0);
              }}
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
        onSendEmail={handleSendEmailSuccess}
        onSaveDraft={handleSendEmailSuccess}
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

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-60 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            toastType === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-200 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
