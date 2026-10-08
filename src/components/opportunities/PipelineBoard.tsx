import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { OpportunityRecord, OpportunityStage } from '../../types/opportunities';
import { PipelineColumn } from './PipelineColumn';
import { OpportunityCard } from './OpportunityCard';

interface PipelineBoardProps {
  opportunities: OpportunityRecord[];
  onMoveStage: (id: string, newStage: OpportunityStage) => void;
  onEdit: (opp: OpportunityRecord) => void;
  onAddFollowUp: (opp: OpportunityRecord) => void;
  onCreateProposal: (opp: OpportunityRecord) => void;
  onMarkWon: (opp: OpportunityRecord) => void;
  onMarkLost: (opp: OpportunityRecord) => void;
  onDelete: (opp: OpportunityRecord) => void;
  onQuickAdd: (stage: OpportunityStage) => void;
}

interface StageColumnConfig {
  id: OpportunityStage;
  name: string;
  badgeBg: string;
  badgeText: string;
  color: string;
  border: string;
}

const STAGES_CONFIG: StageColumnConfig[] = [
  {
    id: 'Qualified',
    name: 'Qualified Leads',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    color: '#3B82F6',
    border: 'border-blue-200 dark:border-blue-900',
  },
  {
    id: 'Requirement Received',
    name: 'Requirement Received',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    color: '#F59E0B',
    border: 'border-amber-200 dark:border-amber-900',
  },
  {
    id: 'Proposal',
    name: 'Proposal Submitted',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-[#5B4DB7] dark:text-purple-300',
    color: '#5B4DB7',
    border: 'border-purple-200 dark:border-purple-900',
  },
  {
    id: 'Negotiation',
    name: 'Negotiation / Review',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    color: '#6366F1',
    border: 'border-indigo-200 dark:border-indigo-900',
  },
  {
    id: 'Won',
    name: 'Closed Won',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    color: '#10B981',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  {
    id: 'Lost',
    name: 'Closed Lost',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    color: '#EF4444',
    border: 'border-rose-200 dark:border-rose-900',
  },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  opportunities,
  onMoveStage,
  onEdit,
  onAddFollowUp,
  onCreateProposal,
  onMarkWon,
  onMarkLost,
  onDelete,
  onQuickAdd,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement to start drag so clicks still work smoothly
      },
    })
  );

  const activeOpportunity = opportunities.find((o) => o.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const sourceOpp = opportunities.find((o) => o.id === String(active.id));
    if (!sourceOpp) return;

    // Over target can be a column (stage) or another card in a column
    let destinationStage: OpportunityStage | null = null;

    if (over.data?.current?.stage) {
      destinationStage = over.data.current.stage as OpportunityStage;
    } else {
      // Find stage if over another opportunity card
      const targetOpp = opportunities.find((o) => o.id === String(over.id));
      if (targetOpp) {
        destinationStage = targetOpp.stage;
      }
    }

    if (destinationStage && sourceOpp.stage !== destinationStage) {
      onMoveStage(sourceOpp.id, destinationStage);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Horizontal scrolling Kanban columns with natural vertical expansion */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="flex gap-4 items-start min-w-max">
          {STAGES_CONFIG.map((col) => {
            const colOpportunities = opportunities.filter((o) => o.stage === col.id);
            return (
              <PipelineColumn
                key={col.id}
                stage={col.id}
                stageName={col.name}
                stageColor={col.color}
                stageBorder={col.border}
                stageBadgeBg={col.badgeBg}
                stageBadgeText={col.badgeText}
                opportunities={colOpportunities}
                onMoveStage={onMoveStage}
                onEdit={onEdit}
                onAddFollowUp={onAddFollowUp}
                onCreateProposal={onCreateProposal}
                onMarkWon={onMarkWon}
                onMarkLost={onMarkLost}
                onDelete={onDelete}
                onQuickAdd={onQuickAdd}
              />
            );
          })}
        </div>
      </div>

      {/* Dragging Overlay */}
      <DragOverlay>
        {activeOpportunity ? (
          <div className="w-[280px] shadow-2xl rotate-2 opacity-95 pointer-events-none">
            <OpportunityCard
              opportunity={activeOpportunity}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
