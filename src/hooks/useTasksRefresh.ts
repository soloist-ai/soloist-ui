import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { gqlSdk } from '../graphql/client';
import type { TaskFieldsFragment } from '../components/tasks/TaskCard';
import { NotificationSource } from '../api';

interface UseTasksRefreshProps {
  isAuthenticated: boolean;
  onTasksUpdate: (tasks: TaskFieldsFragment[]) => void;
}

export const useTasksRefresh = ({ isAuthenticated, onTasksUpdate }: UseTasksRefreshProps) => {
  const location = useLocation();
  const isTasksTabActive = location.pathname === '/tasks';

  const refreshTasks = useCallback(async () => {
    if (!isAuthenticated || !isTasksTabActive) return;
    try {
      const { me } = await gqlSdk.GetTasks();
      onTasksUpdate(me.player.tasks.tasks as TaskFieldsFragment[]);
    } catch (error) {
      console.error('[useTasksRefresh] refresh failed:', error);
    }
  }, [isAuthenticated, isTasksTabActive, onTasksUpdate]);

  useEffect(() => {
    if (!isAuthenticated || !isTasksTabActive) return;

    const handleTasksNotification = (event: CustomEvent) => {
      if (event.detail?.source === NotificationSource.TASKS) refreshTasks();
    };

    window.addEventListener('tasks-notification', handleTasksNotification as EventListener);
    return () => window.removeEventListener('tasks-notification', handleTasksNotification as EventListener);
  }, [isAuthenticated, isTasksTabActive, refreshTasks]);

  return { refreshTasks };
};
