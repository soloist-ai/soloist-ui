import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { gqlSdk } from '../graphql/client';
import type { PlayerTask, Stamina } from '../graphql/generated';
import { NotificationSource } from '../api';

interface UseTasksRefreshProps {
  isAuthenticated: boolean;
  onTasksUpdate: (tasks: PlayerTask[], stamina?: Stamina, isFirstTime?: boolean) => void;
}

export const useTasksRefresh = ({ isAuthenticated, onTasksUpdate }: UseTasksRefreshProps) => {
  const location = useLocation();
  const isTasksTabActive = location.pathname === '/tasks';

  const refreshTasks = useCallback(async () => {
    if (!isAuthenticated || !isTasksTabActive) return;
    try {
      const { me } = await gqlSdk.RefreshActiveTasks();
      const { activeTasks, stamina } = me.player;
      onTasksUpdate(activeTasks.tasks, stamina, activeTasks.isFirstTime);

      // Race condition guard: WS notification may arrive before tasks are
      // persisted. If server still says isFirstTime=true, retry once after delay.
      if (activeTasks.isFirstTime) {
        setTimeout(async () => {
          try {
            const { me: me2 } = await gqlSdk.RefreshActiveTasks();
            const { activeTasks: at2, stamina: s2 } = me2.player;
            onTasksUpdate(at2.tasks, s2, at2.isFirstTime);
          } catch { /* silent */ }
        }, 3000);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
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
