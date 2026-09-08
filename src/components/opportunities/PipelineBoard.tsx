import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { OpportunityRecord, OpportunityStage } from '../../types/opportunities';
import { PipelineColumn } from './PipelineColumn';
import { OpportunityCard } from './OpportunityCard';
import { formatLakhsINR } from '../../data/mockOpportunities';
import { Plus } from 'lucide-react';

interface PipelineBoardProps {
  opportunities: OpportunityRecord[];
  onMoveStage?: (id: string, newStage: OpportunityStage) => void;
  onEdit?: (opp: OpportunityRecord) => void;
  onAddFollowUp?: (opp: OpportunityRecord) => void;
  onCreateProposal?: (opp: OpportunityRecord) => void;
  onMarkWon?: (opp: OpportunityRecord) => void;
  onMarkLost?: (opp: OpportunityRecord) => void;
  onQuickAdd?: (stage: OpportunityStage) => void;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  opportunities,
  onMoveStage,
  onEdit,
  onAddFollowUp,
  onCreateProposal,
  onMarkWon,
  onMarkLost,
  onQuickAdd,
}) => {
  const stages: OpportunityStage[] = [
    'Qualified',
    'Requirement Received',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost',
  ];

  // Drag-and-drop state
  const [activeOpportunity, setActiveOpportunity] = useState<OpportunityRecord | null>(null);

  // For mobile view
  const [selectedMobileStage, setSelectedMobileStage] = useState<OpportunityStage>('Qualified');

  // DnD Sensors configuration (with distance constraint to distinguish click vs drag)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group opportunities by stage
  const stageGroups = stages.reduce((acc, stage) => {
    acc[stage] = opportunities.filter((o) => o.stage === stage);
    return acc;
  }, {} as Record<OpportunityStage, OpportunityRecord[]>);

  const mobileStageOpportunities = stageGroups[selectedMobileStage] || [];
  const mobileStageTotal = mobileStageOpportunities.reduce((sum, o) => sum + o.estimatedValue, 0);

  const handleDragStart = (event: DragStartEvent) => {
    const opp = event.active.data.current?.opportunity as OpportunityRecord | undefined;
    if (opp) {
      setActiveOpportunity(opp);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOpportunity(null);

    if (!over) return;

    const draggedOpp = active.data.current?.opportunity as OpportunityRecord | undefined;
    if (!draggedOpp) return;

    // Determine target stage from dropped target
    let targetStage: OpportunityStage | undefined = undefined;

    // Direct column drop
    if (stages.includes(over.id as OpportunityStage)) {
      targetStage = over.id as OpportunityStage;
    } else if (over.data.current?.stage) {
      targetStage = over.data.current.stage as OpportunityStage;
    } else {
      // Check if dropped over another opportunity card
      const targetOpp = opportunities.find((o) => o.id === over.id);
      if (targetOpp) {
        targetStage = targetOpp.stage;
      }
    }

    if (!targetStage || targetStage === draggedOpp.stage) {
      return;
    }

    // Handle special stage transition confirmation modals
    if (targetStage === 'Won') {
      onMarkWon?.(draggedOpp);
    } else if (targetStage === 'Lost') {
      onMarkLost?.(draggedOpp);
    } else {
      onMoveStage?.(draggedOpp.id, targetStage);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">
        {/* MOBILE PIPELINE VIEW (< md) - Stage Selector + Card Stack (Zero horizontal page overflow) */}
        <div className="block md:hidden space-y-4">
          {/* Mobile Stage Selector Switcher */}
          <div className="bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5 transition-colors">
            <div className="flex items-center justify-between">
              <label htmlFor="mobile-stage-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Pipeline Stage:
              </label>
              <button
                type="button"
                onClick={() => onQuickAdd?.(selectedMobileStage)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add in {selectedMobileStage}</span>
              </button>
            </div>

            <div className="relative">
              <select
                id="mobile-stage-select"
                value={selectedMobileStage}
                onChange={(e) => setSelectedMobileStage(e.target.value as OpportunityStage)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] dark:focus:ring-purple-400 focus:border-transparent cursor-pointer"
              >
                {stages.map((stage) => {
                  const count = stageGroups[stage]?.length || 0;
                  const value = stageGroups[stage]?.reduce((s, o) => s + o.estimatedValue, 0) || 0;
                  return (
                    <option key={stage} value={stage}>
                      {stage} ({count}) — {formatLakhsINR(value)}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* Quick Stage Pills for fast one-tap navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {stages.map((stg) => {
                const count = stageGroups[stg]?.length || 0;
                const isActive = selectedMobileStage === stg;
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setSelectedMobileStage(stg)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#5B4DB7] dark:bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{stg}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Stage Summary Banner */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <span>
                Showing <strong>{mobileStageOpportunities.length}</strong> opportunities
              </span>
              <span>
                Total: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatLakhsINR(mobileStageTotal)}</strong>
              </span>
            </div>
          </div>

          {/* Mobile Opportunity Cards Stack */}
          <div className="space-y-3">
            {mobileStageOpportunities.length > 0 ? (
              mobileStageOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onMoveStage={onMoveStage}
                  onEdit={onEdit}
                  onAddFollowUp={onAddFollowUp}
                  onCreateProposal={onCreateProposal}
                  onMarkWon={onMarkWon}
                  onMarkLost={onMarkLost}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs space-y-2">
                <p>No opportunities in {selectedMobileStage} stage.</p>
                <button
                  type="button"
                  onClick={() => onQuickAdd?.(selectedMobileStage)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5B4DB7] dark:bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#4E41A2] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Opportunity in {selectedMobileStage}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP & TABLET PIPELINE VIEW (md+) - Horizontal Scrollable Stage Columns */}
        <div className="hidden md:block w-full overflow-x-auto pb-4 pt-1">
          <div className="flex gap-4 min-w-[1850px] items-stretch">
            {stages.map((stage) => (
              <PipelineColumn
                key={stage}
                stage={stage}
                opportunities={stageGroups[stage] || []}
                onMoveStage={onMoveStage}
                onEdit={onEdit}
                onAddFollowUp={onAddFollowUp}
                onCreateProposal={onCreateProposal}
                onMarkWon={onMarkWon}
                onMarkLost={onMarkLost}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        </div>

        {/* Drag Overlay for smooth visual feedback during dragging */}
        <DragOverlay dropAnimation={null}>
          {activeOpportunity ? (
            <div className="w-[280px]">
              <OpportunityCard
                opportunity={activeOpportunity}
                isDragOverlay={true}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
