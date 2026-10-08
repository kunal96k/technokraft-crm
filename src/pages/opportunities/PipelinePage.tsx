import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  Plus,
  CheckCircle2,
  Loader2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { OpportunitySummaryCards } from '../../components/opportunities/OpportunitySummaryCards';
import { PipelineFilters } from '../../components/opportunities/PipelineFilters';
import { PipelineBoard } from '../../components/opportunities/PipelineBoard';
import { OpportunityList } from '../../components/opportunities/OpportunityList';
import { OpportunityForm } from '../../components/opportunities/OpportunityForm';
import { MarkWonModal } from '../../components/opportunities/MarkWonModal';
import { MarkLostModal } from '../../components/opportunities/MarkLostModal';
import { AddFollowUpModal } from '../../components/opportunities/AddFollowUpModal';
import { CreateProposalModal } from '../../components/opportunities/CreateProposalModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import {
  OpportunityRecord,
  OpportunityStage,
  PipelineFilterState,
  ProposalRecord,
  OpportunityFollowUp,
  LossReason,
} from '../../types/opportunities';
import {
  fetchOpportunities,
  fetchOpportunityStats,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStage,
  addOpportunityFollowUp,
  deleteOpportunity as deleteOpportunityApi,
} from '../../services/opportunityService';
import { createProposal } from '../../services/proposalService';
import { formatCurrencyINR } from '../../utils/currencyFormatters';

export const PipelinePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Filters State
  const [filters, setFilters] = useState<PipelineFilterState>({
    search: '',
    stage: '',
    assignedTo: '',
    service: '',
    probability: '',
    opportunityValue: '',
    industry: '',
    expectedClose: '',
  });

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<OpportunityRecord | null>(null);
  const [formDefaultStage, setFormDefaultStage] = useState<OpportunityStage>('Qualified');

  const [wonTarget, setWonTarget] = useState<OpportunityRecord | null>(null);
  const [lostTarget, setLostTarget] = useState<OpportunityRecord | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<OpportunityRecord | null>(null);
  const [proposalTarget, setProposalTarget] = useState<OpportunityRecord | null>(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<OpportunityRecord | null>(null);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchOpportunities({
        size: 100,
      });
      setOpportunities(res.content);
    } catch (err) {
      console.error('Failed to load opportunities from backend', err);
      showToast('Could not connect to backend server. Retrying...');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // If query params specify action
    if (searchParams.get('action') === 'new') {
      setIsFormOpen(true);
    }

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
  }, [loadData, searchParams]);

  // Move stage
  const handleMoveStage = async (id: string, newStage: OpportunityStage) => {
    // Optimistic UI update
    const previous = [...opportunities];
    const prob =
      newStage === 'Won'
        ? 100
        : newStage === 'Lost'
        ? 0
        : newStage === 'Negotiation'
        ? 85
        : newStage === 'Proposal'
        ? 60
        : newStage === 'Requirement Received'
        ? 40
        : 25;

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === id
          ? {
              ...opp,
              stage: newStage,
              probability: prob,
              updatedAt: new Date().toISOString(),
            }
          : opp
      )
    );

    try {
      const updated = await updateOpportunityStage(id, { stage: newStage });
      setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));

      // When moving to Proposal stage, auto-create initial formal proposal in DB if none exists
      const targetOpp = opportunities.find((o) => o.id === id) || updated;
      if (newStage === 'Proposal' && (targetOpp.proposalsCount || 0) === 0) {
        const nowIso = new Date().toISOString().slice(0, 10);
        const numAmount = targetOpp.estimatedValue || 0;
        try {
          const createdProp = await createProposal({
            opportunityId: targetOpp.id,
            opportunityName: targetOpp.name,
            leadCode: targetOpp.leadCode,
            companyName: targetOpp.companyName,
            contactName: targetOpp.contactName,
            contactEmail: targetOpp.contactEmail,
            service: targetOpp.service,
            amount: numAmount,
            createdDate: nowIso,
            sentDate: nowIso,
            validUntil:
              targetOpp.expectedCloseDate ||
              new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            status: 'Sent',
            ownerName: targetOpp.owner?.name || 'Sales Team',
            summary:
              targetOpp.requirement?.summary ||
              `Commercial quotation and technical scope package for ${targetOpp.name} (${targetOpp.companyName}).`,
            timelineDescription:
              targetOpp.requirement?.timeline || '12 Weeks delivery schedule.',
            commercialDetails: {
              milestones: [
                {
                  title: 'Project Kickoff & Architecture Sign-off',
                  percentage: 30,
                  amount: Math.round(numAmount * 0.3),
                },
                {
                  title: 'Alpha Milestone & Core Modules Build',
                  percentage: 40,
                  amount: Math.round(numAmount * 0.4),
                },
                {
                  title: 'Production UAT, Cutover & Handover',
                  percentage: 30,
                  amount: Math.round(numAmount * 0.3),
                },
              ],
              paymentTerms: 'Milestone sign-off & acceptance.',
              taxes: 'Fixed Scope Commercial Basis',
            },
            activityHistory: [
              {
                date: nowIso,
                time: new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                description: `Commercial Proposal generated for ${targetOpp.name} at ₹${numAmount.toLocaleString('en-IN')}.`,
                user: targetOpp.owner?.name || 'Sales Team',
              },
            ],
          });

          setOpportunities((prev) =>
            prev.map((o) =>
              o.id === id
                ? { ...o, proposalsCount: (o.proposalsCount || 0) + 1 }
                : o
            )
          );
          showToast(
            `Opportunity moved to Proposal stage & Proposal ${createdProp.proposalCode} generated!`
          );
          return;
        } catch (propErr) {
          console.error('Failed to auto-generate proposal for opportunity', propErr);
        }
      }

      showToast(`Opportunity stage updated to "${newStage}"`);
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err) {
      console.error('Failed to update stage on backend', err);
      setOpportunities(previous);
      showToast('Failed to update stage. Reverting changes.');
    }
  };

  // Confirm Won
  const handleConfirmWon = async (
    id: string,
    finalValue: number,
    closingDate: string,
    notes: string
  ) => {
    try {
      const updated = await updateOpportunityStage(id, {
        stage: 'Won',
        finalValue,
        notes,
      });
      setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(`Congratulations! Deal marked as WON.`);
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err) {
      console.error('Failed to mark deal as won', err);
      showToast('Failed to mark deal as won on server.');
    }
  };

  // Confirm Lost
  const handleConfirmLost = async (id: string, reason: LossReason, notes: string) => {
    try {
      const updated = await updateOpportunityStage(id, {
        stage: 'Lost',
        lossReason: reason,
        notes,
      });
      setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(`Opportunity archived as Lost (${reason})`);
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err) {
      console.error('Failed to mark deal as lost', err);
      showToast('Failed to mark deal as lost on server.');
    }
  };

  // Add Follow Up
  const handleAddFollowUp = async (id: string, followUp: OpportunityFollowUp) => {
    try {
      const updated = await addOpportunityFollowUp(id, followUp);
      setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(`Follow-up scheduled for ${followUp.date}`);
      window.dispatchEvent(new Event('crm-opportunities-updated'));
    } catch (err) {
      console.error('Failed to schedule follow up', err);
      showToast('Failed to save follow-up to database.');
    }
  };

  // Save new / edited Opportunity
  const handleSaveOpportunity = async (opp: OpportunityRecord) => {
    const isEdit = opportunities.some((o) => o.id === opp.id);
    try {
      if (isEdit) {
        const saved = await updateOpportunity(opp.id, opp);
        setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? saved : o)));
        showToast(`Opportunity "${opp.name}" updated successfully.`);
      } else {
        const created = await createOpportunity(opp);
        setOpportunities((prev) => [created, ...prev]);
        showToast(`Opportunity "${opp.name}" created.`);
      }
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
      window.dispatchEvent(new Event('crm-proposals-updated'));
      window.dispatchEvent(new Event('crm-stage-synced'));
    } catch (err: any) {
      console.error('Failed to save opportunity', err);
      showToast(`Error saving opportunity: ${err.message || 'Server error'}`);
    }
  };

  // Delete Opportunity
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOpportunityApi(deleteTarget.id);
      setOpportunities((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      showToast(`Opportunity "${deleteTarget.name}" deleted.`);
      window.dispatchEvent(new Event('crm-opportunities-updated'));
      window.dispatchEvent(new Event('crm-leads-updated'));
    } catch (err) {
      console.error('Failed to delete opportunity', err);
      showToast('Failed to delete opportunity from server.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Save generated proposal
  const handleSaveProposal = async (proposal: ProposalRecord) => {
    try {
      await createProposal(proposal);
    } catch (err) {
      console.error('Failed to create proposal on backend', err);
    }

    // If opportunity stage is qualified/requirement received, advance to Proposal
    const targetOpp = opportunities.find((o) => o.id === proposal.opportunityId);
    if (targetOpp) {
      const shouldAdvance =
        targetOpp.stage === 'Qualified' || targetOpp.stage === 'Requirement Received';
      if (shouldAdvance) {
        try {
          const updated = await updateOpportunityStage(targetOpp.id, { stage: 'Proposal' });
          setOpportunities((prev) => prev.map((o) => (o.id === targetOpp.id ? updated : o)));
        } catch (e) {
          console.error(e);
        }
      }
    }

    showToast(`Proposal ${proposal.proposalCode} generated & saved!`);
    window.dispatchEvent(new Event('crm-proposals-updated'));
    window.dispatchEvent(new Event('crm-opportunities-updated'));
    window.dispatchEvent(new Event('crm-leads-updated'));
    window.dispatchEvent(new Event('crm-stage-synced'));
  };

  // Filter application
  const filteredOpportunities = opportunities.filter((opp) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchSearch =
        opp.name.toLowerCase().includes(q) ||
        opp.companyName.toLowerCase().includes(q) ||
        opp.contactName.toLowerCase().includes(q) ||
        (opp.leadCode && opp.leadCode.toLowerCase().includes(q)) ||
        (opp.opportunityCode && opp.opportunityCode.toLowerCase().includes(q)) ||
        opp.service.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Stage
    if (filters.stage && opp.stage !== filters.stage) {
      return false;
    }

    // Owner
    if (filters.assignedTo && opp.owner?.name !== filters.assignedTo) {
      return false;
    }

    // Service
    if (filters.service && opp.service !== filters.service) {
      return false;
    }

    // Probability
    if (filters.probability === 'high' && opp.probability < 70) return false;
    if (filters.probability === 'medium' && (opp.probability < 40 || opp.probability >= 70))
      return false;
    if (filters.probability === 'low' && opp.probability >= 40) return false;

    // Value Range
    if (filters.opportunityValue === 'under5L' && opp.estimatedValue >= 500000) return false;
    if (
      filters.opportunityValue === '5Lto15L' &&
      (opp.estimatedValue < 500000 || opp.estimatedValue > 1500000)
    )
      return false;
    if (filters.opportunityValue === 'above15L' && opp.estimatedValue <= 1500000) return false;

    // Industry
    if (filters.industry && opp.industry !== filters.industry) {
      return false;
    }

    return true;
  });

  // Calculate metrics
  const totalCount = opportunities.length;
  const qualifiedCount = opportunities.filter((o) => o.stage === 'Qualified').length;
  const proposalCount = opportunities.filter((o) => o.stage === 'Proposal').length;
  const negotiationCount = opportunities.filter((o) => o.stage === 'Negotiation').length;
  const pipelineValue = opportunities
    .filter((o) => o.stage !== 'Lost')
    .reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  const uniqueOwners = Array.from(
    new Set(opportunities.map((o) => o.owner?.name).filter(Boolean) as string[])
  );
  const uniqueIndustries = Array.from(
    new Set(opportunities.map((o) => o.industry).filter(Boolean) as string[])
  );

  return (
    <div className="space-y-5">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200 border border-transparent dark:border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Opportunities Pipeline"
        description="Track active qualified leads, technical requirements, proposals, and deal progressions"
        actions={
          <div className="flex items-center gap-2">
            {/* Refresh Data */}
            <button
              type="button"
              onClick={loadData}
              title="Refresh Pipeline"
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5B4DB7]' : ''}`} />
            </button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            {/* Direct Proposals Management Link */}
            <Link
              to="/opportunities/proposals"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-[#5B4DB7] dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Proposals ({opportunities.reduce((sum, o) => sum + (o.proposalsCount || 0), 0)})</span>
            </Link>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => {
                setEditingOpportunity(null);
                setFormDefaultStage('Qualified');
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#5B4DB7] hover:bg-[#4E41A2] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Opportunity</span>
            </button>
          </div>
        }
      />

      {/* 5 Summary Cards */}
      <OpportunitySummaryCards
        totalCount={totalCount}
        qualifiedCount={qualifiedCount}
        proposalCount={proposalCount}
        negotiationCount={negotiationCount}
        pipelineValue={pipelineValue}
        activeFilterStage={filters.stage}
        onSelectStage={(stg) => setFilters((prev) => ({ ...prev, stage: stg }))}
      />

      {/* Search & Filters */}
      <PipelineFilters
        filters={filters}
        onChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onReset={() =>
          setFilters({
            search: '',
            stage: '',
            assignedTo: '',
            service: '',
            probability: '',
            opportunityValue: '',
            industry: '',
            expectedClose: '',
          })
        }
        uniqueOwners={uniqueOwners}
        uniqueIndustries={uniqueIndustries}
      />

      {/* Main Pipeline Board or List View */}
      {isLoading && opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Loading opportunities from database...
          </p>
        </div>
      ) : viewMode === 'board' ? (
        <PipelineBoard
          opportunities={filteredOpportunities}
          onMoveStage={handleMoveStage}
          onEdit={(opp) => {
            setEditingOpportunity(opp);
            setIsFormOpen(true);
          }}
          onAddFollowUp={(opp) => setFollowUpTarget(opp)}
          onCreateProposal={(opp) => setProposalTarget(opp)}
          onMarkWon={(opp) => setWonTarget(opp)}
          onMarkLost={(opp) => setLostTarget(opp)}
          onDelete={(opp) => setDeleteTarget(opp)}
          onQuickAdd={(stg) => {
            setEditingOpportunity(null);
            setFormDefaultStage(stg);
            setIsFormOpen(true);
          }}
        />
      ) : (
        <OpportunityList
          opportunities={filteredOpportunities}
          onMoveStage={handleMoveStage}
          onEdit={(opp) => {
            setEditingOpportunity(opp);
            setIsFormOpen(true);
          }}
          onAddFollowUp={(opp) => setFollowUpTarget(opp)}
          onCreateProposal={(opp) => setProposalTarget(opp)}
          onMarkWon={(opp) => setWonTarget(opp)}
          onMarkLost={(opp) => setLostTarget(opp)}
          onDelete={(opp) => setDeleteTarget(opp)}
        />
      )}

      {/* CREATE / EDIT OPPORTUNITY MODAL (With 5-tab switch layout) */}
      <OpportunityForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOpportunity(null);
        }}
        onSave={handleSaveOpportunity}
        initialOpportunity={editingOpportunity}
        defaultStage={formDefaultStage}
      />

      {/* MARK WON MODAL */}
      <MarkWonModal
        isOpen={!!wonTarget}
        opportunity={wonTarget}
        onClose={() => setWonTarget(null)}
        onConfirm={handleConfirmWon}
      />

      {/* MARK LOST MODAL */}
      <MarkLostModal
        isOpen={!!lostTarget}
        opportunity={lostTarget}
        onClose={() => setLostTarget(null)}
        onConfirm={handleConfirmLost}
      />

      {/* ADD FOLLOW UP MODAL */}
      <AddFollowUpModal
        isOpen={!!followUpTarget}
        opportunity={followUpTarget}
        onClose={() => setFollowUpTarget(null)}
        onAddFollowUp={handleAddFollowUp}
      />

      {/* CREATE PROPOSAL MODAL */}
      <CreateProposalModal
        isOpen={!!proposalTarget}
        opportunity={proposalTarget}
        onClose={() => setProposalTarget(null)}
        onSaveProposal={async (newProp) => {
          try {
            const created = await createProposal(newProp);
            if (proposalTarget) {
              const shouldAdvance =
                proposalTarget.stage === 'Qualified' ||
                proposalTarget.stage === 'Requirement Received';
              const updatedStage = shouldAdvance ? 'Proposal' : proposalTarget.stage;
              const updatedProb = shouldAdvance ? 60 : proposalTarget.probability;
              await updateOpportunityStage(proposalTarget.id, {
                stage: updatedStage,
              });
              setOpportunities((prev) =>
                prev.map((o) =>
                  o.id === proposalTarget.id
                    ? {
                        ...o,
                        stage: updatedStage,
                        probability: updatedProb,
                        proposalsCount: (o.proposalsCount || 0) + 1,
                      }
                    : o
                )
              );
            }
            showToast(`Proposal ${created.proposalCode} generated & linked successfully!`);
          } catch (e) {
            console.error(e);
            showToast('Failed to create proposal on server');
          }
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Opportunity"
        message={`Are you sure you want to delete opportunity "${deleteTarget?.name}"? This will remove all associated pipeline metrics and records.`}
        confirmLabel="Delete Opportunity"
        cancelLabel="Keep Opportunity"
        variant="danger"
        iconType="trash"
        itemDetails={
          deleteTarget
            ? [
                { label: 'Deal Name', value: deleteTarget.name },
                { label: 'Company', value: deleteTarget.companyName },
                { label: 'Value', value: formatCurrencyINR(deleteTarget.estimatedValue) },
                { label: 'Stage', value: deleteTarget.stage },
                { label: 'Owner', value: deleteTarget.owner?.name || 'N/A' },
              ]
            : []
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
