import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { gqlSdk } from '../graphql/client';
import type { PlayerTask, Stamina } from '../graphql/generated';

interface UseTasksRefreshProps {
  isAuthenticated: boolean;
  onTasksUpdate: (tasks: PlayerTask[], stamina?: Stamina) => void;
}

export const useTasksRefresh = ({ isAuthenticated, onTasksUpdate }: UseTasksRefreshProps) => {
  const location = useLocation();
  const isTasksTabActive = location.pathname === '/tasks';

  const refreshTasks = useCallback(async () => {
    if (!isAuthenticated || !isTasksTabActive) return;
    try {
      const { me } = await gqlSdk.RefreshActiveTasks();
      const { activeTasks, stamina } = me.player;
      onTasksUpdate(activeTasks.tasks, stamina);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  }, [isAuthenticated, isTasksTabActive, onTasksUpdate]);

  useEffect(() => {
    if (!isAuthenticated || !isTasksTabActive) return;

    const handleTasksNotification = (event: CustomEvent) => {
      if (event.detail?.source === 'tasks') refreshTasks();
    };

    window.addEventListener('tasks-notification', handleTasksNotification as EventListener);
    return () => window.removeEventListener('tasks-notification', handleTasksNotification as EventListener);
  }, [isAuthenticated, isTasksTabActive, refreshTasks]);

  return { refreshTasks };
};
