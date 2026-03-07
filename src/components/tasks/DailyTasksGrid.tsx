import React from 'react';
import type { PlayerDailyTask } from '../../graphql/generated';
import DailyTaskCard from './DailyTaskCard';
import DailyTaskCardSkeleton from './DailyTaskCardSkeleton';
import { useLocalization } from '../../hooks/useLocalization';

type DailyTasksGridProps = {
  tasks: PlayerDailyTask[];
  loading: boolean;
};

const DailyTasksGrid: React.FC<DailyTasksGridProps> = ({ tasks, loading }) => {
  const { t } = useLocalization();
  if (loading && tasks.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <DailyTaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(251, 191, 36, 0.2)',
        }}
      >
        <p className="font-tech text-lg" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
          {t('tasks.daily.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
      {tasks.map((task) => (
        <DailyTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default React.memo(DailyTasksGrid);
