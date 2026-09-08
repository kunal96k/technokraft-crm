import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { LeadSummaryCards } from '../../components/leads/LeadSummaryCards';
import { LeadTable } from '../../components/leads/LeadTable';
import { LeadMobileCard } from '../../components/leads/LeadMobileCard';
import { LeadFiltersModal } from '../../components/leads/LeadFiltersModal';
import { MOCK_LEADS } from '../../data/mockLeads';
import { Lead, LeadFilterState } from '../../types/leads';

export const LeadsListPage: React.FC = () => {
  const navigate = useNavigate();

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
  const [sortField, setSortField] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Notification feedback for actions
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Rows per page
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filter handlers
  const handleFilterChange = (key: keyof LeadFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
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
  };

  const handleSummaryCardSelect = (filterId: string) => {
    setActiveCardFilter(filterId);
    if (filterId === 'ALL') {
      setFilters((prev) => ({ ...prev, status: '' }));
    } else if (filterId === 'HOT') {
      setFilters((prev) => ({ ...prev, status: '', priority: 'HIGH' }));
    } else {
      setFilters((prev) => ({ ...prev, status: filterId, priority: '' }));
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
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
  };

  // Row action handler
  const handleLeadAction = (action: string, lead: Lead) => {
    switch (action) {
      case 'edit':
        navigate(`/leads/add?edit=${lead.id}`);
        break;
      case 'followup':
        showNotice(`Follow-up schedule opened for ${lead.company.name}`);
        break;
      case 'call':
        showNotice(`Initiating call to ${lead.contact.name} (${lead.contact.phone})`);
        break;
      case 'email':
        showNotice(`Opening email composer for ${lead.contact.email}`);
        break;
      case 'status':
        showNotice(`Status change requested for ${lead.leadCode}`);
        break;
      case 'assign':
        showNotice(`Reassigning employee for ${lead.company.name}`);
        break;
      default:
        break;
    }
  };

  // Filter & Sort Pipeline
  const filteredLeads = useMemo(() => {
    return MOCK_LEADS.filter((lead) => {
      // Text search
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesQuery =
          lead.company.name.toLowerCase().includes(query) ||
          (lead.company.website && lead.company.website.toLowerCase().includes(query)) ||
          lead.contact.name.toLowerCase().includes(query) ||
          lead.contact.email.toLowerCase().includes(query) ||
          lead.contact.phone.includes(query) ||
          lead.leadCode.toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // Status
      if (filters.status && lead.status !== filters.status) {
        return false;
      }

      // Source
      if (filters.source && lead.source !== filters.source) {
        return false;
      }

      // Service
      if (filters.service && lead.service !== filters.service) {
        return false;
      }

      // Assigned To
      if (filters.assignedTo && lead.assignedEmployee.name !== filters.assignedTo) {
        return false;
      }

      // Priority
      if (filters.priority && lead.priority !== filters.priority) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = a.score - b.score;
      } else if (sortField === 'leadCode') {
        comparison = a.leadCode.localeCompare(b.leadCode);
      } else if (sortField === 'company') {
        comparison = a.company.name.localeCompare(b.company.name);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'assigned') {
        comparison = a.assignedEmployee.name.localeCompare(b.assignedEmployee.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filters, sortField, sortOrder]);

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.source) ||
    Boolean(filters.service) ||
    Boolean(filters.assignedTo) ||
    Boolean(filters.priority) ||
    Boolean(filters.dateRange);

  return (
    <div className="space-y-5">
      {/* Page Header with Primary Actions */}
      <PageHeader
        title="Leads"
        description="Manage, track and qualify your B2B sales leads."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/leads/import"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import Leads</span>
            </Link>

            <Link
              to="/leads/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Lead</span>
            </Link>
          </div>
        }
      />

      {/* Simulated CRM Action Notice Banner */}
      {actionNotice && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-[#5B4DB7] rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="p-1 text-purple-400 hover:text-purple-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Summary Cards (5 responsive cards) */}
      <LeadSummaryCards
        activeFilter={activeCardFilter}
        onSelectFilter={handleSummaryCardSelect}
      />

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by company, contact, email, phone, lead ID..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/40 focus:border-[#5B4DB7]"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
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
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value="">Status: All</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Source */}
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
            >
              <option value="">Source: All</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Cold Calling">Cold Calling</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="IndiaMART">IndiaMART</option>
              <option value="Event">Event</option>
            </select>

            {/* Service */}
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer max-w-[160px] truncate"
            >
              <option value="">Service: All</option>
              <option value="Custom Software Development">Custom Software</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App Development">Mobile App</option>
              <option value="Cloud / DevOps">Cloud / DevOps</option>
              <option value="AI / ML Solutions">AI / ML</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>

            {/* Priority */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
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
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
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
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#5B4DB7]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 text-rose-600 bg-rose-50 rounded-lg border border-rose-200"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
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
              onClick={() => showNotice(`Assigning ${selectedIds.length} leads to employee`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign</span>
            </button>

            <button
              type="button"
              onClick={() => showNotice(`Changing status for ${selectedIds.length} leads`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Status</span>
            </button>

            <button
              type="button"
              onClick={() => showNotice(`Creating follow-ups for ${selectedIds.length} leads`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Follow-up</span>
            </button>

            <button
              type="button"
              onClick={() => showNotice(`Batch email composer for ${selectedIds.length} leads`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={() => showNotice(`Exporting ${selectedIds.length} leads to CSV`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => {
                showNotice(`${selectedIds.length} leads moved to archive (Soft Delete)`);
                setSelectedIds([]);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-xs font-medium transition-colors ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Desktop Leads Table (Hidden on small mobile) */}
      <div className="hidden md:block">
        <LeadTable
          leads={filteredLeads}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onAction={handleLeadAction}
        />
      </div>

      {/* 5. Mobile Leads Cards List (Visible on <768px viewports) */}
      <div className="md:hidden space-y-3">
        {filteredLeads.map((lead) => (
          <LeadMobileCard
            key={lead.id}
            lead={lead}
            isSelected={selectedIds.includes(lead.id)}
            onToggleSelect={handleToggleSelect}
            onAction={handleLeadAction}
          />
        ))}

        {filteredLeads.length === 0 && (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            No leads found matching current filters.
          </div>
        )}
      </div>

      {/* 6. Pagination Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong>1–{filteredLeads.length}</strong> of <strong>1,284</strong> leads
          </span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed text-xs font-medium"
          >
            Previous
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-[#5B4DB7] bg-[#5B4DB7] text-white text-xs font-bold"
          >
            1
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            2
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            52
          </button>
          <button
            type="button"
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            Next
          </button>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <LeadFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleResetFilters}
        onApply={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
};
