import React, { useState, useEffect, useCallback, useRef } from 'react';
import { gqlSdk } from '../../graphql/client';
import type { TaskFieldsFragment } from './TaskCard';
import { useLocalization } from '../../hooks/useLocalization';

const PAGE_SIZE = 20;

const TASK_ICONS: Record<string, string> = {
  STEPS: '🚶',
  PUSH_UPS: '💪',
  SQUATS: '🦵',
  CUSTOM: '🎯',
};

const TaskHistoryList: React.FC = () => {
  const { t } = useLocalization();

  const [tasks, setTasks] = useState<TaskFieldsFragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const hasLoadedRef = useRef(false);

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    try {
      const { me } = await gqlSdk.GetTaskHistory({
        paging: { page, pageSize: PAGE_SIZE },
      });
      const result = me.player.taskHistory;
      setTasks((prev) => append ? [...prev, ...result.tasks as TaskFieldsFragment[]] : result.tasks as TaskFieldsFragment[]);
      setTotalPageCount(result.paging.totalPageCount);
      setCurrentPage(page);
    } catch {
      // Silent — parent handles auth errors
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    fetchPage(0, false).finally(() => setLoading(false));
  }, [fetchPage]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || currentPage + 1 >= totalPageCount) return;
    setLoadingMore(true);
    await fetchPage(currentPage + 1, true);
    setLoadingMore(false);
  }, [loadingMore, currentPage, totalPageCount, fetchPage]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl animate-pulse"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p className="font-tech text-sm" style={{ color: 'rgba(220,235,245,0.45)' }}>
          {t('tasks.noHistory')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const taskName = task.name ?? t(`tasks.taskType.${task.type}`);
        const icon = TASK_ICONS[task.type] ?? '🎯';

        return (
          <div
            key={task.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
              style={{
                background: 'rgba(80,200,100,0.1)',
                border: '1px solid rgba(80,200,100,0.2)',
              }}
              aria-hidden="true"
            >
              {icon}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-tech font-medium text-sm truncate"
                style={{ color: 'rgba(220,235,245,0.85)' }}
              >
                {taskName}
              </p>
              <p
                className="font-tech text-xs"
                style={{ color: 'rgba(220,235,245,0.4)' }}
              >
                {formatDate(task.day)}
              </p>
            </div>

            <span
              className="font-tech font-semibold text-sm flex-shrink-0"
              style={{ color: 'rgba(180,220,240,0.8)' }}
            >
              {t('tasks.gemReward', { amount: task.gemReward })}
            </span>
          </div>
        );
      })}

      {/* Load more */}
      {currentPage + 1 < totalPageCount && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full py-3 rounded-xl font-tech font-medium text-sm transition-all duration-150 flex items-center justify-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(220,235,245,0.6)',
          }}
        >
          {loadingMore && (
            <span
              className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
              aria-hidden="true"
            />
          )}
          {loadingMore ? t('common.loading') : t('common.next')}
        </button>
      )}
    </div>
  );
};

export default TaskHistoryList;
