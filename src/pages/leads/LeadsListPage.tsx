import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Search,
  Filter,
  X,
  RotateCcw,
  CheckSquare,
  UserCheck,
  RefreshCw,
  CalendarPlus,
  Mail,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  Building2,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  SlidersHorizontal,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { LeadSummaryCards } from '../../components/leads/LeadSummaryCards';
import { LeadTable } from '../../components/leads/LeadTable';
import { LeadMobileCard } from '../../components/leads/LeadMobileCard';
import { LeadFiltersModal } from '../../components/leads/LeadFiltersModal';
import { ViewLeadModal } from '../../components/leads/ViewLeadModal';
import { useToast } from '../../context/ToastContext';
import { Lead, LeadFilterState, LeadStatus } from '../../types/leads';
import {
  fetchLeads,
  fetchLeadSummary,
  deleteLead,
  updateLeadStatus,
  LeadSummaryData,
} from '../../services/leadService';

export const LeadsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Leads list state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Summary statistics state
  const [summary, setSummary] = useState<LeadSummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);

  // Connectivity status indicator
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Search input state (immediate for smooth typing)
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Debounced search term (throttles backend queries for 10k+ leads dataset)
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Search and filter states
  const [filters, setFilters] = useState<LeadFilterState>({
    search: '',
    status: '',
    source: '',
    service: '',
    assignedTo: '',
    priority: '',
    dateRange: '',
  });

  // Active quick filter from summary cards
  const [activeCardFilter, setActiveCardFilter] = useState<string>('ALL');

  // Mobile filters drawer open state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting state
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Quick Status Change Modal state
  const [statusModalLead, setStatusModalLead] = useState<Lead | null>(null);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus>('NEW');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Quick View Lead Modal state
  const [viewModalLead, setViewModalLead] = useState<Lead | null>(null);

  // AbortController & Request Sequence Counter for race-condition prevention with 10k+ leads
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef<number>(0);

  // Debounce search input (350ms) to throttle database queries on 10k+ dataset
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setIsSearching(false);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setFilters((prev) => ({ ...prev, search: '' }));
    setIsSearching(false);
    setCurrentPage(1);
  };

  // Fetch summary statistics
  const loadSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const res = await fetchLeadSummary();
      setSummary(res.summary);
      setIsBackendConnected(res.isBackendConnected);
    } catch (err) {
      console.error('Failed to load lead summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  // Fetch paginated leads from backend with request cancellation & race condition protection
  const loadLeads = useCallback(
    async (pageIndex: number, showSpinner = true) => {
      // Cancel previous in-flight search request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const requestId = ++latestRequestIdRef.current;
      if (showSpinner) setIsLoading(true);

      // Map frontend sort fields to backend entities
      let sortBy = 'createdAt';
      if (sortField === 'score') sortBy = 'score';
      else if (sortField === 'leadCode') sortBy = 'leadCode';
      else if (sortField === 'company') sortBy = 'company.name';
      else if (sortField === 'status') sortBy = 'status';
      else if (sortField === 'assigned') sortBy = 'assignedEmployeeName';
      else if (sortField === 'createdAt' || sortField === 'createdByName' || sortField === 'date') sortBy = 'createdAt';
      else if (sortField === 'updatedAt' || sortField === 'updatedByName') sortBy = 'updatedAt';

      try {
        const response = await fetchLeads(
          {
            search: debouncedSearch,
            status: filters.status,
            source: filters.source,
            service: filters.service,
            assignedTo: filters.assignedTo,
            priority: filters.priority,
            dateRange: filters.dateRange,
            page: pageIndex,
            size: rowsPerPage,
            sortBy,
            sortDirection: sortOrder,
          },
          controller.signal
        );

        // Ignore stale response if a newer query was issued
        if (requestId !== latestRequestIdRef.current) return;

        setLeads(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(Math.max(1, response.totalPages));
        setIsBackendConnected(response.isBackendConnected);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // Request was aborted by newer search keystroke; do not toast
          return;
        }
        console.error('Error loading leads:', err);
        toast.error('Failed to load leads from backend');
      } finally {
        if (requestId === latestRequestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [
      debouncedSearch,
      filters.status,
      filters.source,
      filters.service,
      filters.assignedTo,
      filters.priority,
      filters.dateRange,
      rowsPerPage,
      sortField,
      sortOrder,
      toast,
    ]
  );

  // Initial load
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Load leads when filters, sorting, or page changes
  useEffect(() => {
    loadLeads(currentPage - 1);
  }, [loadLeads, currentPage]);

  // Cross-module real-time synchronization listener
  useEffect(() => {
    let syncTimeout: any = null;
    const handleSync = () => {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        loadSummary();
        loadLeads(currentPage - 1, false);
      }, 150);
    };

    window.addEventListener('crm-opportunities-updated', handleSync);
    window.addEventListener('crm-proposals-updated', handleSync);
    window.addEventListener('crm-leads-updated', handleSync);
    window.addEventListener('crm-stage-synced', handleSync);

    return () => {
      if (syncTimeout) clearTimeout(syncTimeout);
      window.removeEventListener('crm-opportunities-updated', handleSync);
      window.removeEventListener('crm-proposals-updated', handleSync);
      window.removeEventListener('crm-leads-updated', handleSync);
      window.removeEventListener('crm-stage-synced', handleSync);
    };
  }, [loadSummary, loadLeads, currentPage]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (key: keyof LeadFilterState, value: string) => {
    if (key === 'search') {
      handleSearchChange(value);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setIsSearching(false);
    setFilters({
      search: '',
      status: '',
      source: '',
      service: '',
      assignedTo: '',
      priority: '',
      dateRange: '',
    });
    setActiveCardFilter('ALL');
    setCurrentPage(1);
  };

  const handleSummaryCardSelect = (filterId: string) => {
    setActiveCardFilter(filterId);
    setCurrentPage(1);
    if (filterId === 'ALL') {
      setFilters((prev) => ({ ...prev, status: '', priority: '' }));
    } else if (filterId === 'HOT') {
      setFilters((prev) => ({ ...prev, status: '', priority: 'HIGH' }));
    } else {
      setFilters((prev) => ({ ...prev, status: filterId, priority: '' }));
    }
  };

  // Refresh data explicitly
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadSummary();
    loadLeads(currentPage - 1, false);
    toast.info('Lead list and statistics refreshed', 'Refreshed');
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === leads.length && leads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  // Sorting handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Single Lead Actions
  const handleLeadAction = async (action: string, lead: Lead) => {
    switch (action) {
      case 'view':
        setViewModalLead(lead);
        break;
      case 'edit':
        navigate(`/leads/add?edit=${lead.id}`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to soft-delete lead ${lead.leadCode} (${lead.company.name})?`)) {
          const success = await deleteLead(lead.id);
          if (success) {
            toast.success(`Lead ${lead.leadCode} removed from CRM database.`, 'Lead Deleted');
            loadLeads(currentPage - 1, false);
            loadSummary();
          } else {
            toast.error(`Could not delete lead ${lead.leadCode}.`);
          }
        }
        break;
      case 'status':
        setStatusModalLead(lead);
        setPendingStatus(lead.status);
        break;
      case 'followup':
        navigate(`/leads/${lead.id}?tab=followups`);
        break;
      case 'call':
        toast.info(`Calling ${lead.contact.name} (${lead.contact.phone})...`, 'Initiating Call');
        break;
      case 'email':
        toast.info(`Opening email draft for ${lead.contact.email}...`, 'Email Draft');
        break;
      case 'assign':
        toast.info(`Reassignment workflow opened for ${lead.company.name}.`, 'Reassign Lead');
        break;
      default:
        break;
    }
  };

  // Submit Status Change from quick modal
  const handleConfirmStatusChange = async () => {
    if (!statusModalLead) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateLeadStatus(
        statusModalLead.id,
        pendingStatus,
        `Status changed to ${pendingStatus} via lead table quick action`
      );
      if (updated) {
        toast.stage(pendingStatus, `${statusModalLead.leadCode} (${statusModalLead.company.name})`);
        setStatusModalLead(null);
        loadLeads(currentPage - 1, false);
        loadSummary();
        window.dispatchEvent(new Event('crm-leads-updated'));
        window.dispatchEvent(new Event('crm-opportunities-updated'));
        window.dispatchEvent(new Event('crm-proposals-updated'));
        window.dispatchEvent(new Event('crm-stage-synced'));
      } else {
        toast.error(`Failed to update status for ${statusModalLead.leadCode}`);
      }
    } catch {
      toast.error(`Error communicating with backend`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Bulk Archive / Soft-delete
  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to soft-delete ${selectedIds.length} selected lead(s)?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      const ok = await deleteLead(id);
      if (ok) successCount++;
    }

    toast.success(`${successCount} of ${selectedIds.length} lead(s) moved to trash.`, 'Bulk Archive');
    setSelectedIds([]);
    loadLeads(0);
    loadSummary();
  };

  // Export CSV
  const handleExportLeads = () => {
    if (leads.length === 0) {
      toast.warning('No leads available to export.', 'Export');
      return;
    }

    const headers = ['Lead ID', 'Company', 'Contact Person', 'Email', 'Phone', 'Service', 'Source', 'Status', 'Priority', 'Score', 'Assigned To'];
    const rows = leads.map((l) => [
      l.leadCode,
      `"${l.company.name.replace(/"/g, '""')}"`,
      `"${l.contact.name.replace(/"/g, '""')}"`,
      l.contact.email,
      l.contact.phone,
      `"${l.service}"`,
      l.source,
      l.status,
      l.priority,
      l.score,
      `"${l.assignedEmployee.name}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `technokraft_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${leads.length} leads to CSV`, 'Export Completed');
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(debouncedSearch) ||
    Boolean(filters.status) ||
    Boolean(filters.source) ||
    Boolean(filters.service) ||
    Boolean(filters.assignedTo) ||
    Boolean(filters.priority) ||
    Boolean(filters.dateRange);

  // Pagination bounds display
  const startRow = totalElements === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalElements);

  // Helper for pagination numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-5">
      {/* Page Header with Primary Actions & Live Connectivity Badge */}
      <PageHeader
        title={totalElements > 0 ? `Leads (${totalElements.toLocaleString()})` : 'Leads'}
        description="Manage, track and qualify your B2B sales leads from TechnoKraft CRM backend."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Backend Connectivity Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-2xs ${
                isBackendConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
              title={
                isBackendConnected
                  ? 'Connected to Spring Boot REST API (http://localhost:8080/api/leads)'
                  : 'Backend API offline - serving local CRM data'
              }
            >
              {isBackendConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>API Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span>Offline Mode</span>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              title="Refresh leads and summary"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isRefreshing ? 'animate-spin text-[#5B4DB7]' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/leads/import"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Import Leads</span>
            </Link>

            <Link
              to="/leads/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Lead</span>
            </Link>
          </div>
        }
      />

      {/* 1. Summary Cards (Live Counts from /api/leads/summary) */}
      <LeadSummaryCards
        summary={summary}
        isLoading={isSummaryLoading}
        activeFilter={activeCardFilter}
        onSelectFilter={handleSummaryCardSelect}
      />

      {/* 2. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            {isSearching || (isLoading && Boolean(debouncedSearch)) ? (
              <Loader2 className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by company, contact, email, phone, lead code..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100/60 dark:hover:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                title="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Desktop Filters Row */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value="">Status: All</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CALLBACK">Callback</option>
              <option value="INTERESTED">Interested</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="REQUIREMENT_PENDING">Requirement Pending</option>
              <option value="REQUIREMENT_RECEIVED">Requirement Received</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Source */}
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value="">Source: All</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Cold Calling">Cold Calling</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="IndiaMART">IndiaMART</option>
              <option value="Google Search">Google Search</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Existing Customer">Existing Customer</option>
              <option value="Event">Event</option>
            </select>

            {/* Service */}
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer max-w-[160px] truncate"
            >
              <option value="">Service: All</option>
              <option value="Custom Software Development">Custom Software</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App Development">Mobile App</option>
              <option value="Cloud / DevOps">Cloud / DevOps</option>
              <option value="AI / ML Solutions">AI / ML</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Enterprise ERP / CRM">Enterprise ERP</option>
            </select>

            {/* Priority */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value="">Priority: All</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                title="Clear all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Mobile & Tablet Filter Drawer Trigger */}
          <div className="flex lg:hidden items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#5B4DB7]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Search & Filter Indicator */}
        {debouncedSearch && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 text-[#5B4DB7] dark:text-purple-300 font-medium">
                <Search className="w-3 h-3" />
                <span>Searching: &ldquo;{debouncedSearch}&rdquo;</span>
              </span>
              <span className="text-[11px] text-slate-400">
                ({totalElements.toLocaleString()} {totalElements === 1 ? 'lead' : 'leads'} found)
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs text-[#5B4DB7] dark:text-purple-400 font-semibold hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* 3. Bulk Actions Toolbar (Visible when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-purple-900 text-white p-3 sm:px-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckSquare className="w-4 h-4 text-purple-300" />
            <span>
              <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'lead' : 'leads'} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleExportLeads}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleBulkArchive}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-medium transition-colors ml-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Archive (Soft Delete)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Leads Content Area: Loading / Empty / Data Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-12 text-center shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Loading leads from database...
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Fetching records from {isBackendConnected ? 'Spring Boot REST API' : 'local dataset'}
            </p>
          </div>
        </div>
      ) : leads.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-12 text-center shadow-2xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-400 flex items-center justify-center shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {hasActiveFilters ? 'No Matching Leads Found' : 'No Leads in Database'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {hasActiveFilters
                  ? 'Try adjusting your search criteria or resetting filters to view all leads.'
                  : 'Get started by creating your first sales lead or importing contacts via CSV/Excel.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#5B4DB7] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              ) : (
                <>
                  <Link
                    to="/leads/add"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add First Lead</span>
                  </Link>
                  <Link
                    to="/leads/import"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Import Leads</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Leads Table */}
          <div className="hidden md:block">
            <LeadTable
              leads={leads}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onAction={handleLeadAction}
            />
          </div>

          {/* Mobile Leads Cards List */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <LeadMobileCard
                key={lead.id}
                lead={lead}
                isSelected={selectedIds.includes(lead.id)}
                onToggleSelect={handleToggleSelect}
                onAction={handleLeadAction}
              />
            ))}
          </div>
        </>
      )}

      {/* 5. Pagination Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong>{startRow}–{endRow}</strong> of <strong>{totalElements.toLocaleString()}</strong> leads
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Page numbers */}
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-slate-400 dark:text-slate-600 select-none">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => setCurrentPage(Number(p))}
                className={`min-w-[30px] h-[30px] rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  isCurrent
                    ? 'border-[#5B4DB7] bg-[#5B4DB7] text-white font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Change Status Modal */}
      {statusModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Lead Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {statusModalLead.leadCode} • {statusModalLead.company.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select New Status</label>
              <select
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="CALLBACK">CALLBACK</option>
                <option value="INTERESTED">INTERESTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="REQUIREMENT_PENDING">REQUIREMENT_PENDING</option>
                <option value="REQUIREMENT_RECEIVED">REQUIREMENT_RECEIVED</option>
                <option value="PROPOSAL">PROPOSAL</option>
                <option value="NEGOTIATION">NEGOTIATION</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
                <option value="NOT_INTERESTED">NOT_INTERESTED</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStatusModalLead(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmStatusChange}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B4DB7] hover:bg-[#4E41A2] text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filters Modal */}
      <LeadFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleResetFilters}
        onApply={() => setIsFilterModalOpen(false)}
      />

      {/* Quick View Lead Modal */}
      <ViewLeadModal
        lead={viewModalLead}
        isOpen={!!viewModalLead}
        onClose={() => setViewModalLead(null)}
        onOpenFullLead={(leadId) => navigate(`/leads/${leadId}`)}
      />
    </div>
  );
};
