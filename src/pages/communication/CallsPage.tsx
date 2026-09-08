import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CallRecord,
  CallFilterTab,
  CallFiltersState,
  CallSummaryStats,
} from '../../types/calls';
import {
  INITIAL_CALL_STATS,
  getStoredCalls,
  saveStoredCalls,
} from '../../data/mockCalls';
import { MOCK_LEADS } from '../../data/mockLeads';
import { Lead } from '../../types/leads';
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
} from 'lucide-react';

export const CallsPage: React.FC = () => {
  const navigate = useNavigate();

  // Primary data state
  const [calls, setCalls] = useState<CallRecord[]>(() => getStoredCalls());
  const [isLoading, setIsLoading] = useState(false);
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

  // Active filter count (excluding default values and search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    if (filters.employee !== 'all') count++;
    if (filters.callType !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.result !== 'all') count++;
    if (filters.leadStatus !== 'all') count++;
    if (filters.service !== 'all') count++;
    return count;
  }, [filters]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: calls.length,
      today: calls.filter((c) => c.date.includes('07 Sep') || c.date.toLowerCase().includes('today')).length,
      scheduled: calls.filter((c) => c.status === 'scheduled').length,
      completed: calls.filter((c) => c.status === 'completed').length,
      missed: calls.filter((c) => c.status === 'missed').length,
    };
  }, [calls]);

  // Filtered Calls list
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      // Tab filter
      if (filters.tab === 'today') {
        if (!call.date.includes('07 Sep') && !call.date.toLowerCase().includes('today')) return false;
      } else if (filters.tab === 'scheduled') {
        if (call.status !== 'scheduled') return false;
      } else if (filters.tab === 'completed') {
        if (call.status !== 'completed') return false;
      } else if (filters.tab === 'missed') {
        if (call.status !== 'missed') return false;
      }

      // Search query
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchCompany = call.companyName.toLowerCase().includes(query);
        const matchContact = call.contactName.toLowerCase().includes(query);
        const matchPhone = call.contactPhone.toLowerCase().includes(query);
        const matchLead = call.leadCode.toLowerCase().includes(query);
        const matchNotes = call.notes?.toLowerCase().includes(query);
        if (!matchCompany && !matchContact && !matchPhone && !matchLead && !matchNotes) {
          return false;
        }
      }

      // Date Range filter
      if (filters.dateRange === 'today') {
        if (!call.date.includes('07 Sep')) return false;
      } else if (filters.dateRange === 'yesterday') {
        if (!call.date.includes('06 Sep')) return false;
      }

      // Employee
      if (filters.employee !== 'all' && call.employeeName !== filters.employee) {
        return false;
      }

      // Call Type
      if (filters.callType !== 'all' && call.type !== filters.callType) {
        return false;
      }

      // Status
      if (filters.status !== 'all' && call.status !== filters.status) {
        return false;
      }

      // Result
      if (filters.result !== 'all' && call.result !== filters.result) {
        return false;
      }

      // Lead Status
      if (filters.leadStatus !== 'all' && call.leadStatus !== filters.leadStatus) {
        return false;
      }

      // Service
      if (filters.service !== 'all' && call.service !== filters.service) {
        return false;
      }

      return true;
    });
  }, [calls, filters]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCalls.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCalls.map((c) => c.id));
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

  // Add new call record to state
  const handleSaveLogCall = (newCall: CallRecord) => {
    const updated = [newCall, ...calls];
    setCalls(updated);
    saveStoredCalls(updated);
    showToast(`Call record for ${newCall.companyName} logged successfully!`);
  };

  // Add scheduled call
  const handleSaveScheduledCall = (newCall: CallRecord) => {
    const updated = [newCall, ...calls];
    setCalls(updated);
    saveStoredCalls(updated);
    showToast(`Call with ${newCall.companyName} scheduled for ${newCall.date}!`);
  };

  // Update call with new follow-up
  const handleUpdateFollowUpSuccess = (updatedCall: CallRecord) => {
    const updated = calls.map((c) => (c.id === updatedCall.id ? updatedCall : c));
    setCalls(updated);
    saveStoredCalls(updated);
    showToast(`Follow-up linked for ${updatedCall.companyName}!`);
  };

  // Bulk Actions
  const handleBulkAssign = () => {
    showToast(`Assigned ${selectedIds.length} call records to sales team.`);
    setSelectedIds([]);
  };

  const handleBulkAddFollowUp = () => {
    showToast(`Created bulk follow-up schedule for ${selectedIds.length} calls.`);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    // Generate simple CSV
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
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Calls</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track customer and lead calls and their outcomes.
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors min-h-[44px] cursor-pointer"
          >
            <CalendarClock className="w-4 h-4 text-slate-500" />
            <span>Schedule Call</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#5B4DB7] hover:bg-[#4E41A2] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Call</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <CallSummaryCards
        stats={INITIAL_CALL_STATS}
        activeTab={filters.tab}
        onSelectTab={(tab) => handleFilterChange('tab', tab)}
      />

      {/* Filter Tabs & View Switcher */}
      <CallTabs
        activeTab={filters.tab}
        onTabChange={(tab) => handleFilterChange('tab', tab)}
        counts={counts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Toolbar (Search, Filter dropdowns, Bulk actions) */}
      <CallToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        activeFilterCount={activeFilterCount}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        selectedCount={selectedIds.length}
        totalCount={filteredCalls.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        isAllSelected={
          filteredCalls.length > 0 && selectedIds.length === filteredCalls.length
        }
        onBulkAssign={handleBulkAssign}
        onBulkAddFollowUp={handleBulkAddFollowUp}
        onBulkExport={handleBulkExport}
      />

      {/* Error state fallback */}
      {isError && (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-xl space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900">Unable to load calls.</h3>
          <p className="text-xs text-rose-600">Please check your connection and retry.</p>
          <button
            type="button"
            onClick={() => {
              setIsError(false);
              setCalls(getStoredCalls());
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* VIEW MODES */}
      {!isError && (
        <>
          {/* 1. LIST VIEW (Table on Desktop, Cards on Mobile) */}
          {viewMode === 'list' && (
            <>
              {filteredCalls.length > 0 ? (
                <>
                  {/* Desktop / Tablet Table View (hidden on small mobile) */}
                  <div className="hidden md:block">
                    <CallTable
                      calls={filteredCalls}
                      selectedIds={selectedIds}
                      onToggleSelect={handleToggleSelect}
                      onSelectAll={handleSelectAll}
                      isAllSelected={
                        filteredCalls.length > 0 && selectedIds.length === filteredCalls.length
                      }
                      onView={handleViewCall}
                      onEdit={handleEditCall}
                      onAddFollowUp={handleAddFollowUp}
                      onScheduleMeeting={handleScheduleMeeting}
                      onOpenLead={handleOpenLead}
                      onCreateOpportunity={handleTriggerOpportunity}
                    />
                  </div>

                  {/* Mobile Call Cards View (visible on small mobile screens) */}
                  <div className="md:hidden space-y-3">
                    {filteredCalls.map((call) => (
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
                <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-[#5B4DB7] flex items-center justify-center mx-auto">
                    <Phone className="w-6 h-6" />
                  </div>
                  {filters.tab === 'scheduled' ? (
                    <>
                      <h3 className="text-sm font-bold text-slate-900">No calls scheduled.</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                      <h3 className="text-sm font-bold text-slate-900">No calls recorded yet.</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer min-h-[44px]"
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
              calls={filteredCalls}
              onView={handleViewCall}
              onAddFollowUp={handleAddFollowUp}
              onOpenLead={handleOpenLead}
            />
          )}

          {/* 3. EMPLOYEE PERFORMANCE VIEW */}
          {viewMode === 'team' && (
            <CallEmployeePerformance
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
        activeFilterCount={activeFilterCount}
      />

      {/* Log Call Modal */}
      <LogCallModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSaveCall={handleSaveLogCall}
        onTriggerOpportunityModal={(lead, partialCall) => {
          setSelectedCallForModal({
            id: `call-temp-${Date.now()}`,
            callCode: 'CALL-NEW',
            leadId: lead.id,
            leadCode: lead.leadCode,
            companyName: lead.company.name,
            contactId: 'ct-temp',
            contactName: partialCall.contactName || lead.contact.name,
            contactDesignation: lead.contact.designation,
            contactPhone: lead.contact.phone,
            employeeId: 'emp-1',
            employeeName: 'Rahul Patil',
            employeeRole: 'Sales Manager',
            employeeAvatar: 'RP',
            type: 'outbound',
            status: 'completed',
            date: '07 Sep 2026',
            time: '11:30 AM',
            duration: '12m 34s',
            durationSeconds: 754,
            result: partialCall.result,
            notes: partialCall.notes || '',
            service: lead.service,
            leadStatus: lead.status,
            leadScore: lead.score,
            createdAt: new Date().toISOString(),
          });
          setIsOpportunityModalOpen(true);
        }}
      />

      {/* Schedule Call Modal */}
      <ScheduleCallModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleCall={handleSaveScheduledCall}
      />

      {/* Add Follow-up Modal */}
      {selectedCallForModal && (
        <AddFollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          call={selectedCallForModal}
          onSuccess={handleUpdateFollowUpSuccess}
        />
      )}

      {/* Create Opportunity Modal */}
      {selectedCallForModal && (
        <CreateOpportunityModal
          isOpen={isOpportunityModalOpen}
          onClose={() => setIsOpportunityModalOpen(false)}
          call={selectedCallForModal}
          onSuccess={(name) => {
            showToast(`Opportunity "${name}" successfully created from call requirement!`);
          }}
        />
      )}
    </div>
  );
};
