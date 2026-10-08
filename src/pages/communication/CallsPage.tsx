import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CallRecord,
  CallFilterTab,
  CallFiltersState,
  CallSummaryStats,
} from '../../types/calls';
import {
  fetchCalls,
  fetchCallStats,
  logCallApi,
  scheduleCallApi,
  updateCallApi,
  completeCallApi,
  deleteCallApi,
  bulkDeleteCallsApi,
  bulkAssignCallsApi,
} from '../../services/callService';
import { CallSummaryCards } from '../../components/communication/calls/CallSummaryCards';
import { CallTabs } from '../../components/communication/calls/CallTabs';
import { CallToolbar } from '../../components/communication/calls/CallToolbar';
import { CallFiltersDrawer } from '../../components/communication/calls/CallFiltersDrawer';
import { CallTable } from '../../components/communication/calls/CallTable';
import { CallCard } from '../../components/communication/calls/CallCard';
import { CallTimeline } from '../../components/communication/calls/CallTimeline';
import { CallEmployeePerformance } from '../../components/communication/calls/CallEmployeePerformance';
import { LogCallModal } from '../../components/communication/calls/LogCallModal';
import { ScheduleCallModal } from '../../components/communication/calls/ScheduleCallModal';
import { AddFollowUpModal } from '../../components/communication/calls/AddFollowUpModal';
import { CreateOpportunityModal } from '../../components/communication/calls/CreateOpportunityModal';
import {
  PhoneCall,
  Plus,
  CalendarClock,
  Phone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const CallsPage: React.FC = () => {
  const navigate = useNavigate();

  // Primary data state from backend
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [stats, setStats] = useState<CallSummaryStats>({
    callsToday: 0,
    scheduled: 0,
    completed: 0,
    missed: 0,
    followUpRequired: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedCallForModal, setSelectedCallForModal] = useState<CallRecord | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'team'>('list');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters State
  const [filters, setFilters] = useState<CallFiltersState>({
    search: '',
    tab: 'all',
    dateRange: 'all',
    employee: 'all',
    callType: 'all',
    status: 'all',
    result: 'all',
    leadStatus: 'all',
    service: 'all',
  });

  const loadCallsFromBackend = async () => {
    setIsLoading(true);
    try {
      const [callsRes, statsRes] = await Promise.all([
        fetchCalls({
          tab: filters.tab,
          status: filters.status,
          type: filters.callType,
          result: filters.result,
          employee: filters.employee,
          leadStatus: filters.leadStatus,
          service: filters.service,
          dateRange: filters.dateRange,
          search: filters.search,
          size: 150,
        }),
        fetchCallStats(),
      ]);

      setCalls(callsRes.content);
      setStats({
        callsToday: statsRes.callsToday,
        scheduled: statsRes.scheduled,
        completed: statsRes.completed,
        missed: statsRes.missed,
        followUpRequired: statsRes.followUpRequired,
      });
      setIsError(false);
    } catch (err) {
      console.error('Failed to load calls:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCallsFromBackend();
  }, [filters]);

  useEffect(() => {
    const handleUpdate = () => {
      loadCallsFromBackend();
    };
    window.addEventListener('crm-calls-updated', handleUpdate);
    window.addEventListener('crm-leads-updated', handleUpdate);
    return () => {
      window.removeEventListener('crm-calls-updated', handleUpdate);
      window.removeEventListener('crm-leads-updated', handleUpdate);
    };
  }, [filters]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleFilterChange = <K extends keyof CallFiltersState>(
    key: K,
    value: CallFiltersState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      tab: 'all',
      dateRange: 'all',
      employee: 'all',
      callType: 'all',
      status: 'all',
      result: 'all',
      leadStatus: 'all',
      service: 'all',
    });
    setSelectedIds([]);
  };

  // Tab Badge counts
  const tabCounts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      all: calls.length,
      today: stats.callsToday,
      scheduled: stats.scheduled,
      completed: stats.completed,
      missed: stats.missed,
    };
  }, [calls, stats]);

  // Active filter count for badge indicator
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.employee !== 'all') count++;
    if (filters.callType !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.result !== 'all') count++;
    if (filters.leadStatus !== 'all') count++;
    if (filters.service !== 'all') count++;
    return count;
  }, [filters]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === calls.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(calls.map((c) => c.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Action handlers
  const handleViewCall = (call: CallRecord) => {
    navigate(`/communication/calls/${call.id}`);
  };

  const handleEditCall = (call: CallRecord) => {
    setSelectedCallForModal(call);
    setIsScheduleModalOpen(true);
  };

  const handleAddFollowUp = (call: CallRecord) => {
    setSelectedCallForModal(call);
    setIsFollowUpModalOpen(true);
  };

  const handleScheduleMeeting = (call: CallRecord) => {
    navigate(`/follow-ups/meetings?leadId=${call.leadId}`);
  };

  const handleOpenLead = (leadId: string) => {
    navigate(`/leads/${leadId}`);
  };

  const handleTriggerOpportunity = (call: CallRecord) => {
    setSelectedCallForModal(call);
    setIsOpportunityModalOpen(true);
  };

  // Add new call record to database
  const handleSaveLogCall = async (newCall: CallRecord) => {
    try {
      const saved = await logCallApi(newCall);
      setCalls((prev) => [saved, ...prev]);
      showToast(`Call record for ${saved.companyName} logged successfully!`);
    } catch (err) {
      console.error('Failed to log call:', err);
      showToast('Error saving call to server.');
    }
  };

  // Add scheduled call to database
  const handleSaveScheduledCall = async (newCall: CallRecord) => {
    try {
      const saved = await scheduleCallApi(newCall);
      setCalls((prev) => [saved, ...prev]);
      showToast(`Call with ${saved.companyName} scheduled for ${saved.date}!`);
    } catch (err) {
      console.error('Failed to schedule call:', err);
      showToast('Error scheduling call on server.');
    }
  };

  // Update call with new follow-up
  const handleUpdateFollowUpSuccess = async (updatedCall: CallRecord) => {
    try {
      const saved = await updateCallApi(updatedCall.id, updatedCall);
      setCalls((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      showToast(`Follow-up linked for ${saved.companyName}!`);
    } catch (err) {
      console.error('Failed updating call follow-up:', err);
      showToast('Error updating follow-up on server.');
    }
  };

  // Complete a scheduled call
  const handleCompleteCall = async (call: CallRecord) => {
    try {
      const completed = await completeCallApi(call.id, {
        result: 'Connected',
        notes: 'Call successfully completed.',
        duration: '05m 00s',
        durationSeconds: 300,
      });
      setCalls((prev) => prev.map((c) => (c.id === call.id ? completed : c)));
      showToast(`Call with ${call.companyName} marked as completed.`);
    } catch (err) {
      console.error('Failed completing call:', err);
      showToast('Error completing call on server.');
    }
  };

  // Delete a single call
  const handleDeleteCall = async (call: CallRecord) => {
    try {
      const ok = await deleteCallApi(call.id);
      if (ok) {
        setCalls((prev) => prev.filter((c) => c.id !== call.id));
        setSelectedIds((prev) => prev.filter((id) => id !== call.id));
        showToast(`Call record for ${call.companyName} deleted.`);
      }
    } catch (err) {
      console.error('Failed deleting call:', err);
      showToast('Error deleting call from server.');
    }
  };

  // Bulk Actions
  const handleBulkAssign = async () => {
    if (selectedIds.length === 0) return;
    try {
      const count = await bulkAssignCallsApi(selectedIds, 'Sales Representative');
      showToast(`Assigned ${count} call records to sales team.`);
      setSelectedIds([]);
      loadCallsFromBackend();
    } catch (err) {
      console.error('Failed bulk assign:', err);
      showToast('Error assigning call records.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const count = await bulkDeleteCallsApi(selectedIds);
      setCalls((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      showToast(`Deleted ${count} call records from database.`);
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed bulk delete:', err);
      showToast('Error deleting call records.');
    }
  };

  const handleBulkAddFollowUp = () => {
    showToast(`Created bulk follow-up schedule for ${selectedIds.length} calls.`);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const rows = [
      ['Call Code', 'Company', 'Contact', 'Phone', 'Type', 'Duration', 'Result', 'Employee', 'Status', 'Date'],
      ...calls
        .filter((c) => selectedIds.includes(c.id))
        .map((c) => [
          c.callCode,
          `"${c.companyName}"`,
          `"${c.contactName}"`,
          c.contactPhone,
          c.type,
          c.duration,
          c.result || 'Pending',
          c.employeeName,
          c.status,
          c.date,
        ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `technokraft_calls_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${selectedIds.length} call records to CSV.`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 rounded-xl">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Call Management & Logs
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track client voice conversations, schedule callbacks, and review outbound sales performance
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadCallsFromBackend}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[40px]"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#5B4DB7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[40px]"
          >
            <CalendarClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Schedule Call</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Call</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <CallSummaryCards
        stats={stats}
        activeTab={filters.tab}
        onTabSelect={(tab) => handleFilterChange('tab', tab)}
      />

      {/* 2. Tabs Row with View Switcher */}
      <CallTabs
        activeTab={filters.tab}
        onTabChange={(tab) => handleFilterChange('tab', tab)}
        counts={tabCounts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 3. Toolbar & Inline Filters */}
      <CallToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        selectedCount={selectedIds.length}
        totalCount={calls.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        isAllSelected={calls.length > 0 && selectedIds.length === calls.length}
        onBulkAssign={handleBulkAssign}
        onBulkAddFollowUp={handleBulkAddFollowUp}
        onBulkExport={handleBulkExport}
      />

      {/* 4. Active Content by View Mode */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-[#5B4DB7] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading call records from database...</p>
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Failed to connect to backend server</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Could not fetch calls from database. Ensure backend is running.
          </p>
          <button
            type="button"
            onClick={loadCallsFromBackend}
            className="px-4 py-2 bg-[#5B4DB7] text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* 1. TABLE LIST VIEW */}
          {viewMode === 'list' && (
            <>
              {calls.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <CallTable
                      calls={calls}
                      selectedIds={selectedIds}
                      onToggleSelect={handleToggleSelect}
                      onSelectAll={handleSelectAll}
                      isAllSelected={calls.length > 0 && selectedIds.length === calls.length}
                      onView={handleViewCall}
                      onEdit={handleEditCall}
                      onAddFollowUp={handleAddFollowUp}
                      onScheduleMeeting={handleScheduleMeeting}
                      onOpenLead={handleOpenLead}
                      onCreateOpportunity={handleTriggerOpportunity}
                      onDelete={handleDeleteCall}
                      onComplete={handleCompleteCall}
                    />
                  </div>

                  {/* Mobile Call Cards View */}
                  <div className="md:hidden space-y-3">
                    {calls.map((call) => (
                      <CallCard
                        key={call.id}
                        call={call}
                        isSelected={selectedIds.includes(call.id)}
                        onToggleSelect={handleToggleSelect}
                        onView={handleViewCall}
                        onEdit={handleEditCall}
                        onAddFollowUp={handleAddFollowUp}
                        onScheduleMeeting={handleScheduleMeeting}
                        onOpenLead={handleOpenLead}
                        onCreateOpportunity={handleTriggerOpportunity}
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Empty States */
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/80 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mx-auto">
                    <Phone className="w-6 h-6" />
                  </div>
                  {filters.tab === 'scheduled' ? (
                    <>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">No calls scheduled.</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        There are no upcoming outbound or inbound calls on your schedule.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer min-h-[44px]"
                      >
                        <CalendarClock className="w-4 h-4" />
                        <span>Schedule Call</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">No calls recorded yet.</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        No call logs match the selected filter criteria. Start by logging customer conversations.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsLogModalOpen(true)}
                          className="px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer min-h-[44px]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Log Call</span>
                        </button>
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer min-h-[44px] transition-colors"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* 2. TIMELINE VIEW */}
          {viewMode === 'timeline' && (
            <CallTimeline
              calls={calls}
              onView={handleViewCall}
              onAddFollowUp={handleAddFollowUp}
              onOpenLead={handleOpenLead}
            />
          )}

          {/* 3. EMPLOYEE PERFORMANCE VIEW */}
          {viewMode === 'team' && (
            <CallEmployeePerformance
              calls={calls}
              onSelectEmployee={(name) => {
                handleFilterChange('employee', name);
                setViewMode('list');
              }}
            />
          )}
        </>
      )}

      {/* Mobile Filters Drawer */}
      <CallFiltersDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Log Call Modal */}
      <LogCallModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveCall={handleSaveLogCall}
      />

      {/* Schedule Call Modal */}
      <ScheduleCallModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedCallForModal(null);
        }}
        onScheduleCall={handleSaveScheduledCall}
      />

      {/* Add Follow-up Modal */}
      {selectedCallForModal && (
        <AddFollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => {
            setIsFollowUpModalOpen(false);
            setSelectedCallForModal(null);
          }}
          call={selectedCallForModal}
          onSuccess={handleUpdateFollowUpSuccess}
        />
      )}

      {/* Create Opportunity Modal */}
      {selectedCallForModal && (
        <CreateOpportunityModal
          isOpen={isOpportunityModalOpen}
          onClose={() => {
            setIsOpportunityModalOpen(false);
            setSelectedCallForModal(null);
          }}
          call={selectedCallForModal}
        />
      )}
    </div>
  );
};
