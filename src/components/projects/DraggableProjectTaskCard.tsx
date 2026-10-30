import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ProjectTaskRecord, TaskStatus } from '../../types/projects';
import { ProjectTaskCard } from './ProjectTaskCard';

interface DraggableProjectTaskCardProps {
  task: ProjectTaskRecord;
  onSelectTask?: (task: ProjectTaskRecord) => void;
  onMoveStage?: (id: number, newStage: TaskStatus, defectNotes?: string) => void;
  onDelete?: (task: ProjectTaskRecord) => void;
}

export const DraggableProjectTaskCard: React.FC<DraggableProjectTaskCardProps> = ({
  task,
  onSelectTask,
  onMoveStage,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(task.id),
    data: {
      task,
      status: task.status,
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
      className={`transition-opacity duration-150 ${isDragging ? 'cursor-grabbing z-50' : ''}`}
    >
      <ProjectTaskCard
        task={task}
        onSelectTask={onSelectTask}
        onMoveStage={onMoveStage}
        onDelete={onDelete}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};
