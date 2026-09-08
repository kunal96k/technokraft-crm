import React from 'react';
import {
  Plus,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
  Users,
  AlertTriangle,
  Bell,
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
import {
  MOCK_FOLLOW_UPS,
  MOCK_FOLLOW_UP_STATS,
  MOCK_EMPLOYEE_PERFORMANCE,
} from '../../data/mockFollowUps';
import {
  FollowUpRecord,
  FollowUpTab,
  FollowUpPriority,
  FollowUpOutcome,
  FollowUpType,
} from '../../types/followUps';

export const FollowUpsPage: React.FC = () => {
  const [followUps, setFollowUps] = React.useState<FollowUpRecord[]>(MOCK_FOLLOW_UPS);
  const [activeTab, setActiveTab] = React.useState<FollowUpTab>('all');
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar' | 'timeline'>('list');
  const [isTeamView, setIsTeamView] = React.useState<boolean>(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

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

  // Employees & Types for filter dropdowns
  const uniqueEmployees = Array.from(
    new Set(followUps.map((f) => f.assignedTo))
  );
  const uniqueTypes = Array.from(new Set(followUps.map((f) => f.type)));

  // Dynamic statistics calculation
  const stats = React.useMemo(() => {
    const todayStr = '2026-09-07';
    const todayCount = followUps.filter(
      (f) => f.date === todayStr && f.status !== 'COMPLETED' && f.status !== 'CANCELLED'
    ).length;
    const upcomingCount = followUps.filter(
      (f) => f.date > todayStr && f.status !== 'COMPLETED' && f.status !== 'CANCELLED'
    ).length;
    const overdueCount = followUps.filter(
      (f) => f.status === 'OVERDUE' || (f.daysOverdue && f.daysOverdue > 0 && f.status !== 'COMPLETED')
    ).length;
    const completedCount = followUps.filter((f) => f.status === 'COMPLETED').length;
    const highPriorityCount = followUps.filter(
      (f) => (f.priority === 'HIGH' || f.priority === 'URGENT') && f.status !== 'COMPLETED'
    ).length;

    return {
      today: todayCount,
      upcoming: upcomingCount,
      overdue: overdueCount,
      completed: completedCount,
      highPriority: highPriorityCount,
    };
  }, [followUps]);

  // Tab and search filtering logic
  const filteredFollowUps = React.useMemo(() => {
    return followUps.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'today') {
        if (item.date !== '2026-09-07') return false;
      } else if (activeTab === 'upcoming') {
        if (item.date <= '2026-09-07' || item.status === 'COMPLETED') return false;
      } else if (activeTab === 'overdue') {
        if (item.status !== 'OVERDUE' && (!item.daysOverdue || item.daysOverdue <= 0)) return false;
        if (item.status === 'COMPLETED') return false;
      } else if (activeTab === 'completed') {
        if (item.status !== 'COMPLETED') return false;
      }

      // 2. Personal vs Team view filter
      if (!isTeamView && item.assignedTo !== 'Kunal Patil') {
        // In personal view, default logged in user is Kunal Patil (Sales Manager)
        // User can still toggle Team View to see everything
      }

      // 3. Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesLead = item.leadCode.toLowerCase().includes(query);
        const matchesCompany = item.companyName.toLowerCase().includes(query);
        const matchesContact = item.contactName.toLowerCase().includes(query);
        const matchesPurpose = item.purpose.toLowerCase().includes(query);
        if (!matchesLead && !matchesCompany && !matchesContact && !matchesPurpose) {
          return false;
        }
      }

      // 4. Dropdown filters
      if (filters.status && item.status !== filters.status) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.assignedTo && item.assignedTo !== filters.assignedTo) return false;

      return true;
    });
  }, [followUps, activeTab, isTeamView, filters]);

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredFollowUps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFollowUps.map((f) => f.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = () => {
    setFollowUps((prev) =>
      prev.map((f) =>
        selectedIds.includes(f.id)
          ? {
              ...f,
              status: 'COMPLETED',
              outcome: 'Interested',
              completedAt: new Date().toISOString(),
            }
          : f
      )
    );
    showToast(`Marked ${selectedIds.length} follow-up(s) as Completed.`);
    setSelectedIds([]);
  };

  const handleBulkReschedule = () => {
    setFollowUps((prev) =>
      prev.map((f) =>
        selectedIds.includes(f.id)
          ? {
              ...f,
              date: '2026-09-09',
              time: '02:00 PM',
              status: 'PENDING',
              daysOverdue: 0,
            }
          : f
      )
    );
    showToast(`Rescheduled ${selectedIds.length} follow-up(s) to 09 Sep 2026.`);
    setSelectedIds([]);
  };

  const handleBulkAssign = (newAssignee: string) => {
    setFollowUps((prev) =>
      prev.map((f) =>
        selectedIds.includes(f.id)
          ? {
              ...f,
              assignedTo: newAssignee,
              assignedAvatar: newAssignee.split(' ').map((n) => n[0]).join('').toUpperCase(),
            }
          : f
      )
    );
    showToast(`Reassigned ${selectedIds.length} follow-up(s) to ${newAssignee}.`);
    setSelectedIds([]);
  };

  const handleBulkPriority = (newPriority: FollowUpPriority) => {
    setFollowUps((prev) =>
      prev.map((f) =>
        selectedIds.includes(f.id)
          ? {
              ...f,
              priority: newPriority,
            }
          : f
      )
    );
    showToast(`Updated priority of ${selectedIds.length} follow-up(s) to ${newPriority}.`);
    setSelectedIds([]);
  };

  // Follow-up actions
  const handleCreateFollowUp = (
    newFollowUpData: Omit<FollowUpRecord, 'id' | 'createdAt'>
  ) => {
    const newRecord: FollowUpRecord = {
      ...newFollowUpData,
      id: `fup-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFollowUps((prev) => [newRecord, ...prev]);
    showToast(`Scheduled follow-up for ${newRecord.companyName}.`);
  };

  const handleCompleteFollowUp = (
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
    setFollowUps((prev) =>
      prev.map((f) => {
        if (f.id === followUpId) {
          return {
            ...f,
            status: 'COMPLETED',
            outcome,
            completionNotes,
            completedAt: new Date().toISOString(),
          };
        }
        return f;
      })
    );

    // If user created a follow-up action chain
    if (nextFollowUpData) {
      const current = followUps.find((f) => f.id === followUpId);
      if (current) {
        const nextRecord: FollowUpRecord = {
          id: `fup-${Date.now()}`,
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
          createdAt: new Date().toISOString(),
        };
        setFollowUps((prev) => [nextRecord, ...prev]);
        showToast(
          `Follow-up marked completed and next follow-up scheduled for ${nextFollowUpData.date}.`
        );
        return;
      }
    }

    showToast('Follow-up marked completed.');
  };

  const handleRescheduleFollowUp = (
    followUpId: string,
    newDate: string,
    newTime: string,
    reason: string
  ) => {
    setFollowUps((prev) =>
      prev.map((f) => {
        if (f.id === followUpId) {
          return {
            ...f,
            date: newDate,
            time: newTime,
            status: 'RESCHEDULED',
            rescheduleReason: reason,
            daysOverdue: 0,
          };
        }
        return f;
      })
    );
    showToast(`Follow-up rescheduled to ${newDate} at ${newTime}.`);
  };

  const handleCancelFollowUp = (followUpId: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === followUpId ? { ...f, status: 'CANCELLED' } : f))
    );
    showToast('Follow-up has been archived / cancelled.');
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
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4d3fa5] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
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
          // If overdue tab clicked, switch to list view automatically
          if (tab === 'overdue' && viewMode === 'timeline') {
            setViewMode('list');
          }
        }}
        onSelectPriorityFilter={() => {
          setActiveTab('all');
          handleFilterChange('priority', 'HIGH');
        }}
      />

      {/* Toolbar (Tabs, Search, Filter Dropdowns, View Switcher) */}
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
        isTeamView={isTeamView}
        onToggleTeamView={() => setIsTeamView(!isTeamView)}
        employees={uniqueEmployees}
        types={uniqueTypes}
      />

      {/* Overdue View banner if on Overdue tab */}
      {activeTab === 'overdue' ? (
        <OverdueListView
          followUps={filteredFollowUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
          onCancel={handleCancelFollowUp}
        />
      ) : activeTab === 'upcoming' && viewMode === 'timeline' ? (
        <UpcomingGroupedView
          followUps={filteredFollowUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
        />
      ) : viewMode === 'timeline' ? (
        <TodayTimelineView
          followUps={filteredFollowUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
          onCancel={handleCancelFollowUp}
        />
      ) : viewMode === 'calendar' ? (
        <CalendarView
          followUps={followUps}
          onOpenDetails={setDetailTarget}
          onOpenComplete={setCompleteTarget}
          onOpenReschedule={setRescheduleTarget}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            {filteredFollowUps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
                <CalendarClock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-sm">
                  No Follow-ups Found
                </p>
                <p className="mt-1">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <FollowUpTable
                followUps={filteredFollowUps}
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
              />
            )}
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredFollowUps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-800">No Follow-ups Found</p>
                <p className="mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              filteredFollowUps.map((item) => (
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
              ))
            )}
          </div>
        </>
      )}

      {/* Optional Team Workload Section if Team View is toggled */}
      {isTeamView && (
        <div className="pt-4 border-t border-slate-200">
          <TeamPerformanceView
            performanceData={MOCK_EMPLOYEE_PERFORMANCE}
            onSelectEmployee={(empName) => handleFilterChange('assignedTo', empName)}
          />
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div>
          Showing <strong>1 to {filteredFollowUps.length}</strong> of{' '}
          <strong>{followUps.length}</strong> total records
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Rows per page: 25</span>
        </div>
      </div>

      {/* Modals */}
      <CreateFollowUpModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFollowUp}
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
    </div>
  );
};
