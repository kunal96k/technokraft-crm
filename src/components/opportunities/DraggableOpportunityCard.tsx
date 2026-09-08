import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { OpportunityRecord, OpportunityStage } from '../../types/opportunities';
import { OpportunityCard } from './OpportunityCard';

interface DraggableOpportunityCardProps {
  opportunity: OpportunityRecord;
  onMoveStage?: (id: string, newStage: OpportunityStage) => void;
  onEdit?: (opp: OpportunityRecord) => void;
  onAddFollowUp?: (opp: OpportunityRecord) => void;
  onCreateProposal?: (opp: OpportunityRecord) => void;
  onMarkWon?: (opp: OpportunityRecord) => void;
  onMarkLost?: (opp: OpportunityRecord) => void;
}

export const DraggableOpportunityCard: React.FC<DraggableOpportunityCardProps> = ({
  opportunity,
  onMoveStage,
  onEdit,
  onAddFollowUp,
  onCreateProposal,
  onMarkWon,
  onMarkLost,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: opportunity.id,
    data: {
      opportunity,
      stage: opportunity.stage,
    },
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.35 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-opacity duration-150 ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <OpportunityCard
        opportunity={opportunity}
        onMoveStage={onMoveStage}
        onEdit={onEdit}
        onAddFollowUp={onAddFollowUp}
        onCreateProposal={onCreateProposal}
        onMarkWon={onMarkWon}
        onMarkLost={onMarkLost}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};
