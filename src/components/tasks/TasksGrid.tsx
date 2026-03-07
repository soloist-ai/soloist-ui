import React, { useMemo } from 'react';
import type { PlayerTask, Stamina } from '../../graphql/generated';
import { PlayerTaskStatus } from '../../graphql/generated';
import TaskCard from './TaskCard';
import TaskCardSkeleton from './TaskCardSkeleton';

type TasksGridProps = {
  tasks: PlayerTask[];
  stamina: Stamina | null;
  loading: boolean;
  onTaskClick: (task: PlayerTask) => void;
  onComplete?: (task: PlayerTask) => void;
  onReplace?: (task: PlayerTask) => void;
  /** Сохранять порядок задач как пришло с API (для завершённых из searchTasks) */
  preserveOrder?: boolean;
};

const TasksGrid: React.FC<TasksGridProps> = ({ tasks, stamina, loading, onTaskClick, onComplete, onReplace, preserveOrder = false }) => {
  const visibleTasks = useMemo(() => {
    const filtered = tasks.filter(
      t => t.status === PlayerTaskStatus.PREPARING ||
           t.status === PlayerTaskStatus.IN_PROGRESS ||
         t.status === PlayerTaskStatus.COMPLETED ||
         t.status === PlayerTaskStatus.SKIPPED
    );
    if (preserveOrder) return filtered;
    // Сортируем по order (по возрастанию) для активных задач
    return filtered.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  }, [tasks, preserveOrder]);

  // Мемоизируем обработчики для каждой задачи
  const taskHandlers = useMemo(() => {
    const handlers = new Map();
    visibleTasks.forEach((playerTask) => {
      handlers.set(playerTask.id, {
        onClick: () => onTaskClick(playerTask),
        onComplete: playerTask.status === PlayerTaskStatus.IN_PROGRESS && onComplete 
          ? () => onComplete(playerTask) 
          : undefined,
        onReplace: playerTask.status === PlayerTaskStatus.IN_PROGRESS && onReplace 
          ? () => onReplace(playerTask) 
          : undefined,
      });
    });
    return handlers;
  }, [visibleTasks, onTaskClick, onComplete, onReplace]);

  if (loading && visibleTasks.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
      {visibleTasks.map((playerTask, index) => {
        const handlers = taskHandlers.get(playerTask.id);
        return (
          <TaskCard
            key={playerTask.id}
            playerTask={playerTask}
            stamina={stamina}
            onClick={handlers.onClick}
            onComplete={handlers.onComplete}
            onReplace={handlers.onReplace}
            index={index}
          />
        );
      })}
      
      {loading && (
        <div 
          className="group relative overflow-hidden flex flex-col items-center justify-center animate-fadeIn"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            boxShadow: `
              0 0 20px rgba(180, 220, 240, 0.15),
              inset 0 0 20px rgba(200, 230, 245, 0.03)
            `,
            minHeight: '280px',
          }}
        >
          {/* Glowing orbs */}
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-xl opacity-10 animate-float" style={{
            background: 'rgba(180, 216, 232, 0.8)'
          }}></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-lg opacity-10 animate-float-delayed" style={{
            background: 'rgba(200, 230, 245, 0.6)'
          }}></div>
          
          <div className="relative z-10 text-center p-6">
            {/* Modern loading indicator */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div 
                  className="w-16 h-16 border-4 rounded-full animate-spin"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    borderTopColor: 'rgba(180, 220, 240, 0.6)'
                  }}
                ></div>
                <div 
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin-reverse"
                  style={{
                    borderRightColor: 'rgba(200, 230, 245, 0.4)'
                  }}
                ></div>
              </div>
              
              <div className="space-y-2">
                <div 
                  className="font-tech font-semibold text-lg tracking-wide"
                  style={{
                    color: '#f4f4f5',
                    textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
                  }}
                >
                  Генерируется новая задача
                </div>
                
                {/* Loading dots */}
                <div className="flex justify-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background: 'rgba(180, 220, 240, 0.6)',
                      boxShadow: '0 0 4px rgba(180, 220, 240, 0.4)'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background: 'rgba(180, 220, 240, 0.6)',
                      boxShadow: '0 0 4px rgba(180, 220, 240, 0.4)',
                      animationDelay: '0.2s'
                    }}
                  ></div>
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      background: 'rgba(180, 220, 240, 0.6)',
                      boxShadow: '0 0 4px rgba(180, 220, 240, 0.4)',
                      animationDelay: '0.4s'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TasksGrid); 