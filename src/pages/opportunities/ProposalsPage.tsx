import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Download,
  Printer,
  Mail,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  Loader2,
  AlertCircle,
  Clock,
  Pencil,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ProposalStatusBadge } from '../../components/opportunities/ProposalStatusBadge';
import { ProposalDetailsModal } from '../../components/opportunities/ProposalDetailsModal';
import { SendProposalEmailModal } from '../../components/opportunities/SendProposalEmailModal';
import { CreateProposalModal } from '../../components/opportunities/CreateProposalModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { ProposalRecord, ProposalStatus, OpportunityRecord } from '../../types/opportunities';
import {
  fetchProposals,
  updateProposalStatus,
  deleteProposal as deleteProposalApi,
  createProposal,
  updateProposal,
} from '../../services/proposalService';
import { fetchOpportunities } from '../../services/opportunityService';
import { generateProposalPDF, printProposalDocument } from '../../utils/proposalPdfGenerator';
import { formatCurrencyINR } from '../../utils/currencyFormatters';

export const ProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Modals
  const [selectedProposal, setSelectedProposal] = useState<ProposalRecord | null>(null);
  const [emailProposal, setEmailProposal] = useState<ProposalRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<ProposalRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProposalRecord | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propRes, oppRes] = await Promise.all([
        fetchProposals({ size: 100 }),
        fetchOpportunities({ size: 100 }),
      ]);
      setProposals(propRes.content);
      setOpportunities(oppRes.content);
    } catch (err) {
      console.error('Failed to load proposals', err);
      showToast('Error loading proposals from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('crm-proposals-updated', handleSync);
    window.addEventListener('crm-opportunities-updated', handleSync);
    window.addEventListener('crm-leads-updated', handleSync);
    window.addEventListener('crm-stage-synced', handleSync);

    return () => {
      window.removeEventListener('crm-proposals-updated', handleSync);
      window.removeEventListener('crm-opportunities-updated', handleSync);
      window.removeEventListener('crm-leads-updated', handleSync);
      window.removeEventListener('crm-stage-synced', handleSync);
    };
  }, [loadData]);

  // Handle status update
  const handleStatusChange = async (proposalId: string, newStatus: ProposalStatus) => {
    try {
      const updated = await updateProposalStatus(proposalId, newStatus);
      setProposals((prev) => prev.map((p) => (p.id === proposalId ? updated : p)));
      showToast(`Proposal status updated to ${newStatus}`);
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err) {
      console.error('Failed to update status', err);
      showToast('Failed to update status on server');
    }
  };

  // Handle delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProposalApi(deleteTarget.id);
      setProposals((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(`Proposal ${deleteTarget.proposalCode} deleted.`);
    } catch (err) {
      console.error('Failed to delete proposal', err);
      showToast('Failed to delete proposal from server.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.proposalCode.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.opportunityName.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false;
    }
    if (serviceFilter !== 'all' && p.service !== serviceFilter) {
      return false;
    }
    return true;
  });

  // Calculate KPIs
  const totalProposals = proposals.length;
  const totalValue = proposals.reduce((sum, p) => sum + (p.amount || 0), 0);
  const acceptedProposals = proposals.filter((p) => p.status === 'Accepted');
  const acceptedValue = acceptedProposals.reduce((sum, p) => sum + (p.amount || 0), 0);
  const sentProposals = proposals.filter((p) => p.status === 'Sent' || p.status === 'Draft');

  const uniqueServices = Array.from(new Set(proposals.map((p) => p.service).filter(Boolean)));

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Commercial Proposals & Quotations"
        description="Generate, track, email, and download formatted PDF quotation documents for active client deals"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              title="Refresh proposals list"
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5B4DB7]' : ''}`} />
            </button>

            <Link
              to="/opportunities/pipeline"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Pipeline Board</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Proposal</span>
            </button>
          </div>
        }
      />

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Proposals
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalProposals}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Commercial packages generated</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Quoted Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrencyINR(totalValue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all generated proposals</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Accepted Deals
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {acceptedProposals.length} ({formatCurrencyINR(acceptedValue)})
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Signed & confirmed contracts</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Client Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {sentProposals.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting signature / feedback</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, company, contact, service..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>

          {/* Service filter */}
          {uniqueServices.length > 0 && (
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
            >
              <option value="all">All Services</option>
              {uniqueServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {(search || statusFilter !== 'all' || serviceFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setServiceFilter('all');
              }}
              className="text-xs text-[#5B4DB7] dark:text-purple-400 hover:underline px-2 cursor-pointer font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Loading proposals from database...
            </p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No commercial proposals found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Proposals are automatically created when dragging opportunities to "Proposal" stage in
              the Pipeline board, or you can create one directly.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Proposal</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3.5 pl-5">Proposal Code</th>
                  <th className="p-3.5">Company & Deal</th>
                  <th className="p-3.5">Commercial Value</th>
                  <th className="p-3.5">Dates</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredProposals.map((prop) => (
                  <tr
                    key={prop.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Proposal Code */}
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                          PDF
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedProposal(prop)}
                            className="font-mono font-bold text-[#5B4DB7] dark:text-purple-300 hover:underline cursor-pointer block text-left"
                          >
                            {prop.proposalCode}
                          </button>
                          <span className="text-[10px] text-slate-400">{prop.service}</span>
                        </div>
                      </div>
                    </td>

                    {/* Company & Opportunity & Contact */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{prop.companyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {prop.opportunityName}
                      </div>
                      {prop.contactEmail && (
                        <div className="text-[10px] text-[#5B4DB7] dark:text-purple-300 font-mono mt-0.5 flex items-center gap-1 truncate max-w-[200px]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{prop.contactEmail}</span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5">
                      <div className="font-black text-slate-900 dark:text-white font-mono text-sm">
                        {formatCurrencyINR(prop.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {prop.commercialDetails?.milestones?.length
                          ? `${prop.commercialDetails.milestones.length} Milestones`
                          : 'Fixed Scope'}
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="p-3.5">
                      <div className="text-[11px] text-slate-800 dark:text-slate-200">
                        Date: <strong>{prop.sentDate || prop.createdDate || 'Today'}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Ref: {prop.proposalCode}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {prop.ownerName?.charAt(0) || 'S'}
                        </div>
                        <span>{prop.ownerName || 'Sales Team'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <ProposalStatusBadge status={prop.status} />
                        <select
                          value={prop.status}
                          onChange={(e) =>
                            handleStatusChange(prop.id, e.target.value as ProposalStatus)
                          }
                          className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-slate-600 dark:text-slate-300 cursor-pointer focus:outline-none"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download PDF button */}
                        <button
                          type="button"
                          onClick={() => {
                            generateProposalPDF(prop);
                            showToast(`Quotation ${prop.proposalCode}.pdf downloaded successfully!`);
                          }}
                          title="Download Formatted PDF Document"
                          className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Print / Preview button */}
                        <button
                          type="button"
                          onClick={() => printProposalDocument(prop)}
                          title="Print / Browser Preview"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Send Email button */}
                        <button
                          type="button"
                          onClick={() => setEmailProposal(prop)}
                          title="Email Proposal to Client"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => setEditingProposal(prop)}
                          title="Edit Proposal"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* View Details modal button */}
                        <button
                          type="button"
                          onClick={() => setSelectedProposal(prop)}
                          title="View Full Quotation & Milestones"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(prop)}
                          title="Delete Proposal"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROPOSAL DETAILS MODAL */}
      <ProposalDetailsModal
        isOpen={!!selectedProposal}
        proposal={selectedProposal}
        onClose={() => setSelectedProposal(null)}
        onStatusChange={(status) => {
          if (selectedProposal) {
            handleStatusChange(selectedProposal.id, status);
          }
        }}
        onEdit={(prop) => {
          setSelectedProposal(null);
          setEditingProposal(prop);
        }}
        onDelete={(id) => {
          const target = proposals.find((p) => p.id === id);
          if (target) setDeleteTarget(target);
        }}
        onNotice={showToast}
      />

      {/* SEND PROPOSAL EMAIL MODAL */}
      <SendProposalEmailModal
        isOpen={!!emailProposal}
        proposal={emailProposal}
        onClose={() => setEmailProposal(null)}
        onSentSuccess={(id, recipient) => {
          showToast(`Proposal email successfully sent to ${recipient}!`);
          setProposals((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: 'Sent' } : p))
          );
          window.dispatchEvent(new Event('crm-proposals-updated'));
          window.dispatchEvent(new Event('crm-opportunities-updated'));
          window.dispatchEvent(new Event('crm-leads-updated'));
          window.dispatchEvent(new Event('crm-stage-synced'));
        }}
      />

      {/* CREATE / EDIT PROPOSAL MODAL */}
      <CreateProposalModal
        isOpen={Boolean(isCreateOpen || editingProposal)}
        opportunity={null}
        initialProposal={editingProposal}
        availableOpportunities={opportunities}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProposal(null);
        }}
        onSaveProposal={async (savedProp) => {
          if (editingProposal) {
            const updated = await updateProposal(savedProp.id, savedProp);
            setProposals((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            showToast(`Proposal ${updated.proposalCode} updated successfully!`);
          } else {
            const created = await createProposal(savedProp);
            setProposals((prev) => [created, ...prev]);
            showToast(`Proposal ${created.proposalCode} generated successfully!`);
          }
          setIsCreateOpen(false);
          setEditingProposal(null);
          window.dispatchEvent(new Event('crm-proposals-updated'));
          window.dispatchEvent(new Event('crm-opportunities-updated'));
          window.dispatchEvent(new Event('crm-leads-updated'));
          window.dispatchEvent(new Event('crm-stage-synced'));
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Proposal"
        message={`Are you sure you want to delete proposal ${deleteTarget?.proposalCode} for "${deleteTarget?.companyName}"?`}
        confirmLabel="Delete Proposal"
        cancelLabel="Keep Proposal"
        variant="danger"
        iconType="trash"
        itemDetails={
          deleteTarget
            ? [
                { label: 'Proposal Code', value: deleteTarget.proposalCode },
                { label: 'Company', value: deleteTarget.companyName },
                { label: 'Value', value: formatCurrencyINR(deleteTarget.amount) },
                { label: 'Status', value: deleteTarget.status },
              ]
            : []
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
