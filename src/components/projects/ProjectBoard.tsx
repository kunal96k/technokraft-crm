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
import { ProjectTaskRecord, TaskStatus } from '../../types/projects';
import { ProjectColumn, ProjectColumnDef } from './ProjectColumn';
import { ProjectTaskCard } from './ProjectTaskCard';

interface ProjectBoardProps {
  tasks: ProjectTaskRecord[];
  onMoveStage: (id: number, newStage: TaskStatus, defectNotes?: string) => void;
  onSelectTask: (task: ProjectTaskRecord) => void;
  onDelete: (task: ProjectTaskRecord) => void;
  onQuickAdd: (status: TaskStatus) => void;
}

export const WORKFLOW_COLUMNS_CONFIG: ProjectColumnDef[] = [
  {
    id: 'BACKLOG',
    name: 'Backlog',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    color: '#64748B',
    border: 'border-slate-300 dark:border-slate-700',
  },
  {
    id: 'TODO',
    name: 'To Do',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    color: '#3B82F6',
    border: 'border-blue-200 dark:border-blue-900',
  },
  {
    id: 'IN_PROGRESS',
    name: 'In Development',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-[#5B4DB7] dark:text-purple-300',
    color: '#5B4DB7',
    border: 'border-purple-200 dark:border-purple-900',
  },
  {
    id: 'INTERNAL_REVIEW',
    name: 'Code Review',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    color: '#6366F1',
    border: 'border-indigo-200 dark:border-indigo-900',
  },
  {
    id: 'QA_TESTING',
    name: 'QA & Testing',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    color: '#F59E0B',
    border: 'border-amber-200 dark:border-amber-900',
  },
  {
    id: 'CLIENT_REVIEW',
    name: 'Client Demo',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/60',
    badgeText: 'text-orange-700 dark:text-orange-300',
    color: '#EA580C',
    border: 'border-orange-200 dark:border-orange-900',
  },
  {
    id: 'DEPLOYMENT',
    name: 'CI/CD & Deploy',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    color: '#06B6D4',
    border: 'border-cyan-200 dark:border-cyan-900',
  },
  {
    id: 'COMPLETED',
    name: 'Done / Released',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    color: '#10B981',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
];

export const ProjectBoard: React.FC<ProjectBoardProps> = ({
  tasks,
  onMoveStage,
  onSelectTask,
  onDelete,
  onQuickAdd,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement so clicks on cards/buttons work smoothly
      },
    })
  );

  const activeTask = tasks.find((t) => String(t.id) === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const sourceTask = tasks.find((t) => String(t.id) === String(active.id));
    if (!sourceTask) return;

    let destinationStatus: TaskStatus | null = null;

    if (over.data?.current?.status) {
      destinationStatus = over.data.current.status as TaskStatus;
    } else {
      const targetTask = tasks.find((t) => String(t.id) === String(over.id));
      if (targetTask) {
        destinationStatus = targetTask.status;
      }
    }

    if (destinationStatus && sourceTask.status !== destinationStatus) {
      onMoveStage(sourceTask.id, destinationStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Viewport-locked Kanban container identical to PipelineBoard */}
      <div className="w-full overflow-x-auto pb-4 h-[calc(100vh-275px)] min-h-[580px]">
        <div className="flex gap-4 items-stretch min-w-max h-full">
          {WORKFLOW_COLUMNS_CONFIG.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <ProjectColumn
                key={col.id}
                column={col}
                tasks={colTasks}
                onSelectTask={onSelectTask}
                onMoveStage={onMoveStage}
                onDelete={onDelete}
                onQuickAdd={onQuickAdd}
              />
            );
          })}
        </div>
      </div>

      {/* Dragging Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="w-[280px] shadow-2xl rotate-2 opacity-95 pointer-events-none">
            <ProjectTaskCard
              task={activeTask}
              isDragOverlay={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
