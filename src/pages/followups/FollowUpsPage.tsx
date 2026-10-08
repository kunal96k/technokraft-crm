import React from 'react';
import {
  Plus,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
  Users,
  AlertTriangle,
  Bell,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { FollowUpSummaryCards } from '../../components/followups/FollowUpSummaryCards';
import {
  FollowUpToolbar,
  FollowUpFilters,
} from '../../components/followups/FollowUpToolbar';
import { FollowUpTable } from '../../components/followups/FollowUpTable';
import { FollowUpCard } from '../../components/followups/FollowUpCard';
import { TodayTimelineView } from '../../components/followups/TodayTimelineView';
import { OverdueListView } from '../../components/followups/OverdueListView';
import { UpcomingGroupedView } from '../../components/followups/UpcomingGroupedView';
import { CalendarView } from '../../components/followups/CalendarView';
import { TeamPerformanceView } from '../../components/followups/TeamPerformanceView';
import { CreateFollowUpModal } from '../../components/followups/CreateFollowUpModal';
import { CompleteFollowUpModal } from '../../components/followups/CompleteFollowUpModal';
import { RescheduleFollowUpModal } from '../../components/followups/RescheduleFollowUpModal';
import { FollowUpDetailModal } from '../../components/followups/FollowUpDetailModal';
import { FollowUpEmptyState } from '../../components/followups/FollowUpEmptyState';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useActiveEmployees } from '../../hooks/useActiveEmployees';
import { useAuth } from '../../context/AuthContext';
import * as followUpService from '../../services/followUpService';
import {
  FollowUpRecord,
  FollowUpTab,
  FollowUpPriority,
  FollowUpOutcome,
  FollowUpType,
  EmployeePerformance,
} from '../../types/followUps';

export const FollowUpsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const currentUserName = authUser?.name || 'Kunal Patil';

  const [followUps, setFollowUps] = React.useState<FollowUpRecord[]>([]);
  const [teamPerformance, setTeamPerformance] = React.useState<EmployeePerformance[]>([]);
  const [activeTab, setActiveTab] = React.useState<FollowUpTab>('all');
  const [preselectedDate, setPreselectedDate] = React.useState<string | undefined>(undefined);
  const [confirmDialog, setConfirmDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'success';
    iconType?: 'trash' | 'cancel-meeting' | 'warning' | 'save' | 'check';
    itemDetails?: { label?: string; value?: string }[];
    onConfirm: () => void;
  } | null>(null);
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar' | 'timeline'>('list');
  const [scope, setScope] = React.useState<'my' | 'team'>('my');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [stats, setStats] = React.useState({
    today: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0,
    highPriority: 0,
  });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [completeTarget, setCompleteTarget] = React.useState<FollowUpRecord | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = React.useState<FollowUpRecord | null>(null);
  const [detailTarget, setDetailTarget] = React.useState<FollowUpRecord | null>(null);

  // Filter state
  const [filters, setFilters] = React.useState<FollowUpFilters>({
    search: '',
    status: '',
    assignedTo: '',
    priority: '',
    type: '',
    service: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const effectiveAssignee =
        scope === 'my'
          ? currentUserName
          : filters.assignedTo || undefined;

      const [followUpsRes, statsRes, teamRes] = await Promise.all([
        followUpService.fetchFollowUps({
          tab: activeTab !== 'all' ? activeTab : undefined,
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          type: filters.type || undefined,
          assignedTo: effectiveAssignee,
          service: filters.service || undefined,
          search: filters.search || undefined,
          size: 200,
        }),
        followUpService.fetchFollowUpStats(),
        followUpService.fetchTeamPerformance(),
      ]);

      const items = followUpsRes.content || [];
      setFollowUps(items);

      // Compute filtered stats if in 'my' scope
      if (scope === 'my') {
        const todayStr = new Date().toISOString().split('T')[0];
        const myToday = items.filter((f) => f.date === todayStr || f.date?.toLowerCase() === 'today').length;
        const myUpcoming = items.filter((f) => f.date && f.date > todayStr && f.status !== 'COMPLETED').length;
        const myOverdue = items.filter((f) => (f.daysOverdue && f.daysOverdue > 0) || f.status === 'OVERDUE').length;
        const myCompleted = items.filter((f) => f.status === 'COMPLETED').length;
        const myHighPri = items.filter((f) => f.priority === 'HIGH' || f.priority === 'URGENT').length;

        setStats({
          today: myToday,
          upcoming: myUpcoming,
          overdue: myOverdue,
          completed: myCompleted,
          highPriority: myHighPri,
        });
      } else {
        setStats({
          today: statsRes.today,
          upcoming: statsRes.upcoming,
          overdue: statsRes.overdue,
          completed: statsRes.completed,
          highPriority: statsRes.highPriority,
        });
      }

      setTeamPerformance(teamRes || []);
    } catch (err) {
      console.error('[FollowUpsPage] Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters, scope, currentUserName]);


  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key: keyof FollowUpFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      assignedTo: '',
      priority: '',
      type: '',
      service: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((val) => val !== '');

  const { employees: activeEmployeesList } = useActiveEmployees();

  // Employees & Types for filter dropdowns
  const uniqueEmployees = Array.from(
    new Set([
      ...activeEmployeesList.map((e) => e.name).filter(Boolean),
      ...followUps.map((f) => f.assignedTo).filter(Boolean),
    ])
  );

  const uniqueTypes = Array.from(
    new Set([
      'Call',
      'Email',
      'Meeting',
      'WhatsApp',
      'Requirement Follow-up',
      'Proposal Follow-up',
      'General Follow-up',
      ...followUps.map((f) => f.type).filter(Boolean),
    ])
  );

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedIds.length === followUps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(followUps.map((f) => f.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Complete Follow-ups',
      message: `Are you sure you want to mark ${selectedIds.length} selected follow-up(s) as Completed?`,
      confirmLabel: `Complete ${selectedIds.length} Items`,
      variant: 'success',
      iconType: 'check',
      onConfirm: async () => {
        const count = await followUpService.bulkCompleteFollowUps(selectedIds);
        showToast(`Marked ${count || selectedIds.length} follow-up(s) as Completed.`);
        setSelectedIds([]);
        setConfirmDialog(null);
        await loadData();
      },
    });
  };

  const handleBulkReschedule = () => {
    if (selectedIds.length === 0) return;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    const dateStr = nextDate.toISOString().split('T')[0];
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Reschedule Follow-ups',
      message: `Are you sure you want to reschedule ${selectedIds.length} selected follow-up(s) to ${dateStr}?`,
      confirmLabel: `Reschedule to ${dateStr}`,
      variant: 'primary',
      iconType: 'save',
      onConfirm: async () => {
        const count = await followUpService.bulkRescheduleFollowUps(selectedIds, dateStr, '11:00');
        showToast(`Rescheduled ${count || selectedIds.length} follow-up(s) to ${dateStr}.`);
        setSelectedIds([]);
        setConfirmDialog(null);
        await loadData();
      },
    });
  };

  const handleBulkAssign = (newAssignee: string) => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Reassign Follow-ups',
      message: `Are you sure you want to reassign ${selectedIds.length} selected follow-up(s) to ${newAssignee}?`,
      confirmLabel: `Assign to ${newAssignee}`,
      variant: 'primary',
      onConfirm: async () => {
        const count = await followUpService.bulkReassignFollowUps(selectedIds, newAssignee);
        showToast(`Reassigned ${count || selectedIds.length} follow-up(s) to ${newAssignee}.`);
        setSelectedIds([]);
        setConfirmDialog(null);
        await loadData();
      },
    });
  };

  const handleBulkPriority = (newPriority: FollowUpPriority) => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Update Priority',
      message: `Are you sure you want to update priority of ${selectedIds.length} follow-up(s) to ${newPriority}?`,
      confirmLabel: `Set to ${newPriority}`,
      variant: 'primary',
      onConfirm: async () => {
        const count = await followUpService.bulkUpdateFollowUpPriority(selectedIds, newPriority);
        showToast(`Updated priority of ${count || selectedIds.length} follow-up(s) to ${newPriority}.`);
        setSelectedIds([]);
        setConfirmDialog(null);
        await loadData();
      },
    });
  };

  // Follow-up actions
  const handleCreateFollowUp = async (
    newFollowUpData: Omit<FollowUpRecord, 'id' | 'createdAt'>
  ) => {
    const created = await followUpService.createFollowUp(newFollowUpData);
    if (created) {
      showToast(`Scheduled follow-up for ${created.companyName}.`);
    } else {
      showToast('Scheduled follow-up successfully.');
    }
    await loadData();
  };

  const handleCompleteFollowUp = async (
    followUpId: string,
    outcome: FollowUpOutcome,
    completionNotes: string,
    nextFollowUpData?: {
      type: FollowUpType;
      purpose: string;
      date: string;
      time: string;
      notes?: string;
    }
  ) => {
    await followUpService.completeFollowUp(followUpId, completionNotes, outcome);

    // If user created a follow-up action chain
    if (nextFollowUpData) {
      const current = followUps.find((f) => f.id === followUpId);
      if (current) {
        await followUpService.createFollowUp({
          leadId: current.leadId,
          leadCode: current.leadCode,
          companyName: current.companyName,
          contactName: current.contactName,
          contactDesignation: current.contactDesignation,
          contactPhone: current.contactPhone,
          contactEmail: current.contactEmail,
          service: current.service,
          leadScore: current.leadScore,
          leadStatus: current.leadStatus,
          type: nextFollowUpData.type,
          purpose: nextFollowUpData.purpose,
          date: nextFollowUpData.date,
          time: nextFollowUpData.time,
          assignedTo: current.assignedTo,
          assignedAvatar: current.assignedAvatar,
          priority: current.priority,
          status: 'PENDING',
          notes: nextFollowUpData.notes,
        });
        showToast(
          `Follow-up marked completed and next follow-up scheduled for ${nextFollowUpData.date}.`
        );
        await loadData();
        return;
      }
    }

    showToast('Follow-up marked completed.');
    await loadData();
  };

  const handleRescheduleFollowUp = async (
    followUpId: string,
    newDate: string,
    newTime: string,
    reason: string
  ) => {
    await followUpService.rescheduleFollowUp(followUpId, newDate, newTime, reason);
    showToast(`Follow-up rescheduled to ${newDate} at ${newTime}.`);
    await loadData();
  };

  const handleCancelFollowUp = (followUpId: string) => {
    const item = followUps.find((f) => f.id === followUpId);
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel / Archive Follow-up?',
      message: `Are you sure you want to cancel and archive the follow-up for "${item?.companyName || 'this customer'}"?`,
      confirmLabel: 'Yes, Cancel Follow-up',
      cancelLabel: 'Keep Follow-up',
      variant: 'warning',
      iconType: 'trash',
      itemDetails: item
        ? [
            { label: 'Client / Company', value: item.companyName },
            { label: 'Follow-up Type', value: item.type },
            { label: 'Scheduled Time', value: `${item.date} at ${item.time}` },
            { label: 'Assignee', value: item.assignedTo },
          ]
        : undefined,
      onConfirm: async () => {
        await followUpService.deleteFollowUp(followUpId);
        showToast('Follow-up has been archived / cancelled.');
        setConfirmDialog(null);
        await loadData();
      },
    });
  };

  return (
    <div id="crm-followups-page" className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in slide-in-from-top-2 duration-200">
          <Bell className="w-4 h-4 text-[#5B4DB7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Follow-ups"
        description="Track every scheduled customer and lead follow-up with real-time status and reminders."
        showDateBadge={true}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Follow-up</span>
            </button>
          </div>
        }
      />

      {/* 5 Summary Cards */}
      <FollowUpSummaryCards
        stats={stats}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'overdue' && viewMode === 'timeline') {
            setViewMode('list');
          }
        }}
        onSelectPriorityFilter={() => {
          setActiveTab('all');
          handleFilterChange('priority', 'HIGH');
        }}
      />

      {/* Toolbar (Tabs, Search, Filter Dropdowns, View Switcher, Scope) */}
      <FollowUpToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stats={stats}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        scope={scope}
        onScopeChange={setScope}
        currentUserName={currentUserName}
        employees={uniqueEmployees}
        types={uniqueTypes}
      />

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mx-auto mb-2" />
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            Loading Live Follow-ups...
          </p>
        </div>
      ) : followUps.length === 0 ? (
        <FollowUpEmptyState
          module="followups"
          tab={activeTab}
          hasFilters={hasActiveFilters}
          onAction={() => setIsCreateModalOpen(true)}
          actionLabel="New Follow-up"
          onResetFilters={handleResetFilters}
          onRefresh={loadData}
        />
      ) : activeTab === 'overdue' ? (
        <OverdueListView
          followUps={followUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
          onCancel={handleCancelFollowUp}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : activeTab === 'upcoming' && viewMode === 'timeline' ? (
        <UpcomingGroupedView
          followUps={followUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : viewMode === 'timeline' ? (
        <TodayTimelineView
          followUps={followUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
          onCancel={handleCancelFollowUp}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : viewMode === 'calendar' ? (
        <CalendarView
          followUps={followUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
          onNewFollowUp={(d) => {
            setPreselectedDate(d);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <FollowUpTable
              followUps={followUps}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleSelectOne={handleToggleSelectOne}
              onOpenDetails={setDetailTarget}
              onOpenComplete={setCompleteTarget}
              onOpenReschedule={setRescheduleTarget}
              onCancel={handleCancelFollowUp}
              onBulkComplete={handleBulkComplete}
              onBulkReschedule={handleBulkReschedule}
              onBulkAssign={handleBulkAssign}
              onBulkPriority={handleBulkPriority}
              onAction={() => setIsCreateModalOpen(true)}
              onResetFilters={handleResetFilters}
              hasFilters={hasActiveFilters}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {followUps.map((item) => (
              <FollowUpCard
                key={item.id}
                followUp={item}
                isSelected={selectedIds.includes(item.id)}
                onToggleSelect={handleToggleSelectOne}
                onOpenDetails={setDetailTarget}
                onOpenComplete={setCompleteTarget}
                onOpenReschedule={setRescheduleTarget}
                onCancel={handleCancelFollowUp}
              />
            ))}
          </div>
        </>
      )}

      {/* Team Workload Section if Overall Team scope is selected */}
      {scope === 'team' && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <TeamPerformanceView
            performanceData={teamPerformance}
            onSelectEmployee={(empName) => handleFilterChange('assignedTo', empName)}
          />
        </div>
      )}


      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          Showing <strong>1 to {followUps.length}</strong> of{' '}
          <strong>{stats.today + stats.upcoming + stats.overdue + stats.completed}</strong> total records
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400 dark:text-slate-500">Live Database Connected</span>
        </div>
      </div>

      {/* Modals */}
      <CreateFollowUpModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPreselectedDate(undefined);
        }}
        onSubmit={handleCreateFollowUp}
        preselectedDate={preselectedDate}
      />

      <CompleteFollowUpModal
        isOpen={Boolean(completeTarget)}
        followUp={completeTarget}
        onClose={() => setCompleteTarget(null)}
        onComplete={handleCompleteFollowUp}
      />

      <RescheduleFollowUpModal
        isOpen={Boolean(rescheduleTarget)}
        followUp={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onReschedule={handleRescheduleFollowUp}
      />

      <FollowUpDetailModal
        isOpen={Boolean(detailTarget)}
        followUp={detailTarget}
        onClose={() => setDetailTarget(null)}
        onOpenComplete={(item) => {
          setDetailTarget(null);
          setCompleteTarget(item);
        }}
        onOpenReschedule={(item) => {
          setDetailTarget(null);
          setRescheduleTarget(item);
        }}
        onCancel={handleCancelFollowUp}
      />

      {/* Confirmation Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <ConfirmationModal
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          iconType={confirmDialog.iconType}
          itemDetails={confirmDialog.itemDetails}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

