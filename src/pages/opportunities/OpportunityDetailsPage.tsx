import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  Send,
  Eye,
  Loader2,
  Edit,
  Trash2,
  AlertCircle,
  Briefcase,
  Share2,
  Pencil,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { OpportunityStageBadge } from '../../components/opportunities/OpportunityStageBadge';
import { ProposalStatusBadge } from '../../components/opportunities/ProposalStatusBadge';
import { ProposalDetailsModal } from '../../components/opportunities/ProposalDetailsModal';
import { SendProposalEmailModal } from '../../components/opportunities/SendProposalEmailModal';
import { CreateProposalModal } from '../../components/opportunities/CreateProposalModal';
import { MarkWonModal } from '../../components/opportunities/MarkWonModal';
import { MarkLostModal } from '../../components/opportunities/MarkLostModal';
import { AddFollowUpModal } from '../../components/opportunities/AddFollowUpModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import {
  OpportunityRecord,
  OpportunityStage,
  ProposalRecord,
  OpportunityFollowUp,
  LossReason,
} from '../../types/opportunities';
import {
  fetchOpportunityById,
  updateOpportunityStage,
  addOpportunityFollowUp,
  deleteOpportunity as deleteOpportunityApi,
} from '../../services/opportunityService';
import {
  fetchProposalsByOpportunity,
  createProposal,
  updateProposal,
  deleteProposal as deleteProposalApi,
} from '../../services/proposalService';
import { generateProposalPDF, printProposalDocument } from '../../utils/proposalPdfGenerator';
import { formatCurrencyINR } from '../../utils/currencyFormatters';

export const OpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<OpportunityRecord | null>(null);
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'activities' | 'followups'>('overview');

  // Modals
  const [isWonOpen, setIsWonOpen] = useState(false);
  const [isLostOpen, setIsLostOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isCreatePropOpen, setIsCreatePropOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalRecord | null>(null);
  const [editingProposal, setEditingProposal] = useState<ProposalRecord | null>(null);
  const [emailProposal, setEmailProposal] = useState<ProposalRecord | null>(null);
  const [deleteProposalTarget, setDeleteProposalTarget] = useState<ProposalRecord | null>(null);
  const [isDeleteOppOpen, setIsDeleteOppOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const opp = await fetchOpportunityById(id);
      setOpportunity(opp);
      const propList = await fetchProposalsByOpportunity(opp.id);
      setProposals(propList);
    } catch (err) {
      console.error('Failed to load opportunity details', err);
      showToast('Could not load opportunity details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('crm-opportunities-updated', handleSync);
    window.addEventListener('crm-leads-updated', handleSync);
    window.addEventListener('crm-proposals-updated', handleSync);
    window.addEventListener('crm-stage-synced', handleSync);

    return () => {
      window.removeEventListener('crm-opportunities-updated', handleSync);
      window.removeEventListener('crm-leads-updated', handleSync);
      window.removeEventListener('crm-proposals-updated', handleSync);
      window.removeEventListener('crm-stage-synced', handleSync);
    };
  }, [loadData]);

  // Stage change
  const handleStageChange = async (newStage: OpportunityStage) => {
    if (!opportunity) return;
    try {
      const updated = await updateOpportunityStage(opportunity.id, { stage: newStage });
      setOpportunity(updated);
      showToast(`Deal moved to stage "${newStage}"`);
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err) {
      console.error('Failed to update stage', err);
      showToast('Failed to update stage on server.');
    }
  };

  // Confirm Won
  const handleConfirmWon = async (
    oppId: string,
    finalValue: number,
    closingDate: string,
    notes: string
  ) => {
    try {
      const updated = await updateOpportunityStage(oppId, {
        stage: 'Won',
        finalValue,
        notes,
      });
      setOpportunity(updated);
      showToast('Deal successfully marked as WON!');
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err) {
      console.error(err);
      showToast('Failed to mark deal as won.');
    }
  };

  // Confirm Lost
  const handleConfirmLost = async (oppId: string, reason: LossReason, notes: string) => {
    try {
      const updated = await updateOpportunityStage(oppId, {
        stage: 'Lost',
        lossReason: reason,
        notes,
      });
      setOpportunity(updated);
      showToast(`Deal marked as Lost (${reason})`);
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err) {
      console.error(err);
      showToast('Failed to mark deal as lost.');
    }
  };

  // Add Follow Up
  const handleAddFollowUp = async (oppId: string, followUp: OpportunityFollowUp) => {
    try {
      const updated = await addOpportunityFollowUp(oppId, followUp);
      setOpportunity(updated);
      showToast(`Follow-up scheduled for ${followUp.date}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to save follow-up.');
    }
  };

  // Delete Opportunity
  const handleDeleteOpportunity = async () => {
    if (!opportunity) return;
    try {
      await deleteOpportunityApi(opportunity.id);
      navigate('/opportunities/pipeline');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete deal.');
    }
  };

  // Delete Proposal
  const handleDeleteProposal = async () => {
    if (!deleteProposalTarget) return;
    try {
      await deleteProposalApi(deleteProposalTarget.id);
      setProposals((prev) => prev.filter((p) => p.id !== deleteProposalTarget.id));
      showToast(`Proposal ${deleteProposalTarget.proposalCode} deleted.`);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete proposal.');
    } finally {
      setDeleteProposalTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-9 h-9 text-[#5B4DB7] animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Loading opportunity details...
        </p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Opportunity Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          The requested deal record does not exist or has been deleted.
        </p>
        <Link
          to="/opportunities/pipeline"
          className="mt-4 px-4 py-2 bg-[#5B4DB7] text-white text-xs font-bold rounded-xl"
        >
          Return to Pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/opportunities/pipeline"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#5B4DB7] dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities Pipeline</span>
        </Link>

        <div className="flex items-center gap-2">
          {opportunity.stage !== 'Won' && opportunity.stage !== 'Lost' && (
            <>
              <button
                type="button"
                onClick={() => setIsWonOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Won</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLostOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark Lost</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsDeleteOppOpen(true)}
            title="Delete Deal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Opportunity Banner Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {opportunity.opportunityCode}
              </span>
              <OpportunityStageBadge stage={opportunity.stage} />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
              {opportunity.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-slate-400" />
                {opportunity.companyName}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                {opportunity.contactName} ({opportunity.contactDesignation || 'Lead Contact'})
              </span>
              {opportunity.contactEmail && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {opportunity.contactEmail}
                </span>
              )}
            </div>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Deal Estimated Value
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrencyINR(opportunity.estimatedValue)}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              {opportunity.probability}% Win Probability
            </span>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Domain Service
          </span>
          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white truncate">
            {opportunity.service}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Industry: {opportunity.industry}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Commercial Owner
          </span>
          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {opportunity.owner.name.charAt(0)}
            </div>
            <span>{opportunity.owner.name}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{opportunity.owner.role}</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Expected Close Date
          </span>
          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white font-mono">
            {opportunity.expectedCloseDate || 'Not specified'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Target deal closure</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Commercial Proposals
          </span>
          <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white font-mono">
            {proposals.length} Quoted
          </div>
          <button
            type="button"
            onClick={() => setIsCreatePropOpen(true)}
            className="text-[10px] text-[#5B4DB7] dark:text-purple-400 hover:underline mt-1 block font-bold cursor-pointer"
          >
            + Generate Proposal
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#5B4DB7] text-[#5B4DB7] dark:text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Scope & Requirements
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('proposals')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'proposals'
              ? 'border-[#5B4DB7] text-[#5B4DB7] dark:text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Commercial Proposals ({proposals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('followups')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'followups'
              ? 'border-[#5B4DB7] text-[#5B4DB7] dark:text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Follow-ups ({opportunity.followUps?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('activities')}
          className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'activities'
              ? 'border-[#5B4DB7] text-[#5B4DB7] dark:text-purple-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Activity Timeline ({opportunity.activities?.length || 0})
        </button>
      </div>

      {/* Tab 1: Overview & Scope */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-[#5B4DB7] dark:text-purple-300 uppercase tracking-wider">
                Technical Requirement Summary
              </h3>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {opportunity.requirement?.summary ||
                  'No formal technical requirement scope documented yet.'}
              </p>

              {opportunity.requirement?.problemStatement && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    Problem Statement
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {opportunity.requirement.problemStatement}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Delivery Timeline
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {opportunity.requirement?.timeline || '12 Weeks schedule'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Budget Expectation
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {opportunity.requirement?.budget || formatCurrencyINR(opportunity.estimatedValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Right sidebar: Contacts & Lead Link */}
          <div className="space-y-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Client Contact Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Primary Contact</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {opportunity.contactName}
                  </div>
                  <div className="text-slate-500 text-[11px]">{opportunity.contactDesignation}</div>
                </div>
                {opportunity.contactEmail && (
                  <div>
                    <span className="text-slate-400 text-[11px]">Email Address</span>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {opportunity.contactEmail}
                    </div>
                  </div>
                )}
                {opportunity.contactPhone && (
                  <div>
                    <span className="text-slate-400 text-[11px]">Phone Number</span>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {opportunity.contactPhone}
                    </div>
                  </div>
                )}
              </div>

              {opportunity.leadId && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/leads/${opportunity.leadId}`}
                    className="text-xs font-bold text-[#5B4DB7] dark:text-purple-400 hover:underline"
                  >
                    View Original Lead ({opportunity.leadCode || 'CRM'}) →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Proposals List */}
      {activeTab === 'proposals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Generated Quotations & Commercial Proposals
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatePropOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Proposal</span>
            </button>
          </div>

          {proposals.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <FileText className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No formal proposals generated yet
              </p>
              <button
                type="button"
                onClick={() => setIsCreatePropOpen(true)}
                className="mt-3 text-xs text-[#5B4DB7] dark:text-purple-400 hover:underline font-bold cursor-pointer"
              >
                + Generate First Proposal
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 flex items-center justify-center shrink-0 font-mono font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {prop.proposalCode}
                        </span>
                        <ProposalStatusBadge status={prop.status} />
                      </div>
                      <div className="text-xs font-black text-[#5B4DB7] dark:text-purple-300 font-mono mt-0.5">
                        {formatCurrencyINR(prop.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Date: {prop.sentDate || prop.createdDate || 'Today'} • Lead: {prop.ownerName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        generateProposalPDF(prop);
                        showToast(`Quotation ${prop.proposalCode}.pdf downloaded successfully!`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-xs font-semibold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => printProposalDocument(prop)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Print Preview"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailProposal(prop)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProposal(prop)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer transition-colors"
                      title="Edit Proposal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProposal(prop)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteProposalTarget(prop)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Follow-ups */}
      {activeTab === 'followups' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Scheduled Follow-ups</h3>
            <button
              type="button"
              onClick={() => setIsFollowUpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4DB7] text-white rounded-lg text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Follow-up</span>
            </button>
          </div>

          {(opportunity.followUps?.length || 0) === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No scheduled follow-ups.</p>
          ) : (
            <div className="space-y-2.5">
              {opportunity.followUps?.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#5B4DB7]" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {f.type} on {f.date} {f.time ? `at ${f.time}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Assigned to: {f.assignedTo} {f.notes ? `• ${f.notes}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300 font-bold">
                    {f.status || 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Activities */}
      {activeTab === 'activities' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4">
            Deal History & Timeline
          </h3>
          {(opportunity.activities?.length || 0) === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No activities recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {opportunity.activities?.map((act, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#5B4DB7] mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{act.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {act.date} {act.time} • By {act.user}
                    </div>
                    {act.description && (
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{act.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MARK WON MODAL */}
      <MarkWonModal
        isOpen={isWonOpen}
        opportunity={opportunity}
        onClose={() => setIsWonOpen(false)}
        onConfirm={handleConfirmWon}
      />

      {/* MARK LOST MODAL */}
      <MarkLostModal
        isOpen={isLostOpen}
        opportunity={opportunity}
        onClose={() => setIsLostOpen(false)}
        onConfirm={handleConfirmLost}
      />

      {/* ADD FOLLOW UP MODAL */}
      <AddFollowUpModal
        isOpen={isFollowUpOpen}
        opportunity={opportunity}
        onClose={() => setIsFollowUpOpen(false)}
        onAddFollowUp={handleAddFollowUp}
      />

      {/* CREATE / EDIT PROPOSAL MODAL */}
      <CreateProposalModal
        isOpen={Boolean(isCreatePropOpen || editingProposal)}
        opportunity={opportunity}
        initialProposal={editingProposal}
        onClose={() => {
          setIsCreatePropOpen(false);
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
          setIsCreatePropOpen(false);
          setEditingProposal(null);
          window.dispatchEvent(new Event('crm-proposals-updated'));
          window.dispatchEvent(new Event('crm-opportunities-updated'));
          window.dispatchEvent(new Event('crm-leads-updated'));
          window.dispatchEvent(new Event('crm-stage-synced'));
        }}
      />

      {/* PROPOSAL DETAILS MODAL */}
      <ProposalDetailsModal
        isOpen={!!selectedProposal}
        proposal={selectedProposal}
        onClose={() => setSelectedProposal(null)}
        onEdit={(prop) => {
          setSelectedProposal(null);
          setEditingProposal(prop);
        }}
        onNotice={showToast}
      />

      {/* SEND PROPOSAL EMAIL MODAL */}
      <SendProposalEmailModal
        isOpen={!!emailProposal}
        proposal={emailProposal}
        onClose={() => setEmailProposal(null)}
        onSentSuccess={(pid, rec) => {
          showToast(`Proposal email successfully sent to ${rec}!`);
          setProposals((prev) =>
            prev.map((p) => (p.id === pid ? { ...p, status: 'Sent' } : p))
          );
        }}
      />

      {/* DELETE PROPOSAL CONFIRMATION */}
      <ConfirmationModal
        isOpen={!!deleteProposalTarget}
        title="Delete Proposal"
        message={`Are you sure you want to delete proposal ${deleteProposalTarget?.proposalCode}?`}
        confirmLabel="Delete Proposal"
        cancelLabel="Keep Proposal"
        variant="danger"
        iconType="trash"
        onConfirm={handleDeleteProposal}
        onCancel={() => setDeleteProposalTarget(null)}
      />

      {/* DELETE OPPORTUNITY CONFIRMATION */}
      <ConfirmationModal
        isOpen={isDeleteOppOpen}
        title="Delete Opportunity"
        message={`Are you sure you want to delete opportunity "${opportunity.name}"?`}
        confirmLabel="Delete Opportunity"
        cancelLabel="Keep Opportunity"
        variant="danger"
        iconType="trash"
        onConfirm={handleDeleteOpportunity}
        onCancel={() => setIsDeleteOppOpen(false)}
      />
    </div>
  );
};
