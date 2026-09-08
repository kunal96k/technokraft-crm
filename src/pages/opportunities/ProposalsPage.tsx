import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Building2,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ProposalRecord, ProposalStatus, OpportunityService } from '../../types/opportunities';
import { ProposalStatusBadge } from '../../components/opportunities/ProposalStatusBadge';
import { ProposalDetailsModal } from '../../components/opportunities/ProposalDetailsModal';
import { CreateProposalModal } from '../../components/opportunities/CreateProposalModal';
import {
  getStoredProposals,
  saveStoredProposals,
  getStoredOpportunities,
  formatCurrencyINR,
  formatLakhsINR,
} from '../../data/mockOpportunities';

export const ProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');

  // Modals
  const [selectedProposal, setSelectedProposal] = useState<ProposalRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const loaded = getStoredProposals();
    setProposals(loaded);
  }, []);

  const handleUpdateProposals = (updated: ProposalRecord[]) => {
    setProposals(updated);
    saveStoredProposals(updated);
  };

  const handleStatusChange = (id: string, newStatus: ProposalStatus) => {
    const updated = proposals.map((p) => {
      if (p.id === id) {
        const newAct = {
          date: '07 Sep 2026',
          time: '05:10 PM',
          description: `Status changed to ${newStatus}`,
          user: p.ownerName,
        };
        return {
          ...p,
          status: newStatus,
          activityHistory: p.activityHistory ? [newAct, ...p.activityHistory] : [newAct],
        };
      }
      return p;
    });

    handleUpdateProposals(updated);
    if (selectedProposal && selectedProposal.id === id) {
      setSelectedProposal(updated.find((p) => p.id === id) || null);
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      const matches =
        p.proposalCode.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.opportunityName.toLowerCase().includes(q) ||
        p.contactName.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (statusFilter && p.status !== statusFilter) return false;
    if (serviceFilter && p.service !== serviceFilter) return false;
    if (ownerFilter && p.ownerName !== ownerFilter) return false;
    return true;
  });

  // Calculate KPIs
  const totalCount = proposals.length;
  const sentCount = proposals.filter((p) =>
    ['Sent', 'Viewed', 'Under Review', 'Negotiation'].includes(p.status)
  ).length;
  const acceptedCount = proposals.filter((p) => p.status === 'Accepted').length;
  const pendingValue = proposals
    .filter((p) => ['Sent', 'Viewed', 'Under Review', 'Negotiation'].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const acceptedValue = proposals
    .filter((p) => p.status === 'Accepted')
    .reduce((sum, p) => sum + p.amount, 0);

  const uniqueOwners = Array.from(new Set(proposals.map((p) => p.ownerName)));
  const allOpportunities = getStoredOpportunities();
  const firstActiveOpportunity = allOpportunities[0] || null;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Proposals Management"
        description="Formal commercial quotations, technical scopes, milestone payment terms, and client approvals"
        actions={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Proposal</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Proposals
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Generated commercial bids</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
            Active Review
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1 font-mono">
            {sentCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Under customer review</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Accepted
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
            {acceptedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Approved & contracted</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Pending Value
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 font-mono">
            {formatLakhsINR(pendingValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">In client consideration</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Accepted Value
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
            {formatLakhsINR(acceptedValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total closed revenue</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, company, opportunity or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#5B4DB7]"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Prepared">Prepared</option>
              <option value="Sent">Sent</option>
              <option value="Viewed">Viewed</option>
              <option value="Under Review">Under Review</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Service */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#5B4DB7]"
            >
              <option value="">All Services</option>
              <option value="Custom Software Development">Custom Software Development</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="Cloud / DevOps">Cloud / DevOps</option>
              <option value="AI / ML">AI / ML</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="UI/UX">UI/UX</option>
            </select>
          </div>

          {/* Owner */}
          <div>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#5B4DB7]"
            >
              <option value="">All Owners</option>
              {uniqueOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Proposals Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Desktop Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Proposal ID</th>
                <th className="py-3.5 px-3 font-semibold">Company & Contact</th>
                <th className="py-3.5 px-3 font-semibold">Opportunity</th>
                <th className="py-3.5 px-3 font-semibold">Service</th>
                <th className="py-3.5 px-3 font-semibold">Amount (₹)</th>
                <th className="py-3.5 px-3 font-semibold">Sent Date</th>
                <th className="py-3.5 px-3 font-semibold">Valid Until</th>
                <th className="py-3.5 px-3 font-semibold">Status</th>
                <th className="py-3.5 px-3 font-semibold">Owner</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal) => (
                  <tr
                    key={proposal.id}
                    onClick={() => setSelectedProposal(proposal)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Proposal Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#5B4DB7] group-hover:underline">
                      {proposal.proposalCode}
                    </td>

                    {/* Company & Contact */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 leading-tight">
                        {proposal.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {proposal.contactName}
                      </div>
                    </td>

                    {/* Opportunity */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-800 line-clamp-1 max-w-[170px]" title={proposal.opportunityName}>
                        {proposal.opportunityName}
                      </span>
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      <span className="truncate max-w-[130px] block">{proposal.service}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {formatCurrencyINR(proposal.amount)}
                    </td>

                    {/* Sent Date */}
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {proposal.sentDate}
                    </td>

                    {/* Valid Until */}
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {proposal.validUntil}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <ProposalStatusBadge status={proposal.status} size="sm" />
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {proposal.ownerName}
                    </td>

                    {/* Action buttons */}
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedProposal(proposal)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            showToast(`Downloading proposal ${proposal.proposalCode}.pdf...`)
                          }
                          title="Download PDF"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            showToast(
                              `Proposal ${proposal.proposalCode} sent to ${
                                proposal.contactEmail || proposal.contactName
                              }`
                            )
                          }
                          title="Send / Resend"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                    No proposals match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => setSelectedProposal(proposal)}
                className="p-4 space-y-2.5 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#5B4DB7]">
                      {proposal.proposalCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {proposal.companyName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{proposal.opportunityName}</p>
                  </div>
                  <ProposalStatusBadge status={proposal.status} size="xs" />
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Amount
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrencyINR(proposal.amount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Valid Until
                    </span>
                    <span className="font-semibold text-slate-800">{proposal.validUntil}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Contact: {proposal.contactName}</span>
                  <span>Owner: {proposal.ownerName}</span>
                </div>

                <div
                  className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProposal(proposal)}
                    className="px-2.5 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showToast(`Downloading proposal ${proposal.proposalCode}.pdf...`)
                    }
                    className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">No proposals found.</div>
          )}
        </div>
      </div>

      {/* Proposal Details Modal */}
      <ProposalDetailsModal
        isOpen={!!selectedProposal}
        onClose={() => setSelectedProposal(null)}
        proposal={selectedProposal}
        onStatusChange={handleStatusChange}
        onNotice={(msg) => showToast(msg)}
      />

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        opportunity={firstActiveOpportunity}
        onSaveProposal={(newProp) => {
          handleUpdateProposals([newProp, ...proposals]);
          showToast(`Proposal ${newProp.proposalCode} generated successfully!`);
        }}
      />
    </div>
  );
};
