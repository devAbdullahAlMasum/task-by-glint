'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/project';
import { useAuthStore } from '@/store/auth';
import { Task, KanbanColumn } from '@/types';
import { Plus, MoreHorizontal, Filter } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface KanbanBoardProps {
  projectId: string;
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  const { tasks, fetchTasks, moveTask, currentProject } = useProjectStore();
  const { user } = useAuthStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  useEffect(() => {
    if (currentProject?.settings?.columns) {
      const kanbanColumns: KanbanColumn[] = currentProject.settings.columns.map(col => ({
        id: col.id,
        title: col.title,
        color: col.color,
        wipLimit: col.wipLimit,
        tasks: tasks.filter(task => task.status === col.id),
      }));
      setColumns(kanbanColumns);
    }
  }, [tasks, currentProject]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = tasks.some(task => task.id === activeId);
    const isOverTask = tasks.some(task => task.id === overId);
    const isOverColumn = columns.some(col => col.id === overId);

    if (!isActiveTask) return;

    // Dropping task over another task
    if (isActiveTask && isOverTask) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overTask = tasks.find(t => t.id === overId);
      
      if (activeTask && overTask && activeTask.status !== overTask.status) {
        // Move to different column
        const newPosition = overTask.position + 1;
        moveTask(activeTask.id, overTask.status, newPosition);
      }
    }

    // Dropping task over column
    if (isActiveTask && isOverColumn) {
      const activeTask = tasks.find(t => t.id === activeId);
      const overColumnId = overId as string;
      
      if (activeTask && activeTask.status !== overColumnId) {
        const tasksInColumn = tasks.filter(t => t.status === overColumnId);
        const newPosition = tasksInColumn.length > 0 
          ? Math.max(...tasksInColumn.map(t => t.position)) + 1
          : 0;
        moveTask(activeTask.id, overColumnId, newPosition);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'epic': return '🎯';
      case 'story': return '📖';
      default: return '📝';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentProject?.name} Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks with drag-and-drop
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-6 pb-6" style={{ minWidth: 'max-content' }}>
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.title}
                      </h3>
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {column.tasks.length}
                      </span>
                    </div>
                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>

                  {/* WIP Limit Warning */}
                  {column.wipLimit && column.tasks.length > column.wipLimit && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                      WIP limit exceeded ({column.tasks.length}/{column.wipLimit})
                    </div>
                  )}

                  {/* Tasks */}
                  <SortableContext
                    items={column.tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div 
                      className="space-y-3 min-h-[200px]"
                      data-column-id={column.id}
                    >
                      {column.tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleTaskClick(task)}
                          getPriorityColor={getPriorityColor}
                          getTypeIcon={getTypeIcon}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {/* Add Task Button */}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Plus className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onClick={() => {}}
                getPriorityColor={getPriorityColor}
                getTypeIcon={getTypeIcon}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateTaskModal
          projectId={projectId}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

// Temporary placeholder components until we create the actual files
function TaskCard({ 
  task, 
  onClick, 
  getPriorityColor, 
  getTypeIcon, 
  isDragging = false 
}: { 
  task: Task; 
  onClick: () => void; 
  getPriorityColor: (priority: string) => string;
  getTypeIcon: (type: string) => string;
  isDragging?: boolean;
}) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border dark:border-gray-600 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-75 transform rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getTypeIcon(task.type)}</span>
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">#{task.id.slice(-6)}</span>
      </div>
      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        {task.assigneeId && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-semibold">
            A
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTaskModal({ 
  projectId, 
  isOpen, 
  onClose 
}: { 
  projectId: string; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create Task</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Task creation modal - coming soon!</p>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose 
}: { 
  task: Task; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{task.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}