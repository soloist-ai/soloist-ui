import React from 'react';
import type { PlayerDailyTask } from '../../api';
import Icon from '../common/Icon';
import { useLocalization } from '../../hooks/useLocalization';

type DailyTaskCardProps = {
  task: PlayerDailyTask;
};

// Стилистика как у завершённых задач: один основной цвет (жёлтый)
const YELLOW_BORDER = 'rgba(251, 191, 36, 0.3)';
const YELLOW_BG = 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%)';
const TEXT_COLOR = 'rgba(220, 235, 245, 0.85)';

const DailyTaskCard: React.FC<DailyTaskCardProps> = ({ task }) => {
  const { t } = useLocalization();
  const progressPercent = task.goal > 0 ? Math.min(100, (task.progress / task.goal) * 100) : 0;

  return (
    <div
      className="relative overflow-hidden h-full flex flex-col rounded-2xl"
      style={{
        background: YELLOW_BG,
        border: `2px solid ${YELLOW_BORDER}`,
        boxShadow: '0 0 12px rgba(251, 191, 36, 0.2)',
      }}
      >
      <div className="relative z-10 p-4 min-h-[155px] h-full flex flex-col">
        <div className="mb-3 flex-grow">
          <h3
            className="text-xl font-tech font-bold leading-tight tracking-tight mb-2"
            style={{
              color: TEXT_COLOR,
              textShadow: '0 0 4px rgba(251, 191, 36, 0.15)',
              wordBreak: 'break-word',
            }}
          >
            {task.title}
          </h3>
        </div>

        {/* Progress */}
        <div className="mt-auto pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-sm font-tech">
            <span style={{ color: TEXT_COLOR }}>
              {task.progress} / {task.goal}
            </span>
            {task.isCompleted && (
              <span className="inline-flex items-center gap-1" style={{ color: 'rgba(34, 197, 94, 0.9)' }}>
                <Icon type="check" size={14} />
                <span>{t('common.completed')}</span>
              </span>
            )}
          </div>
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: task.isCompleted
                  ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.7) 100%)'
                  : 'linear-gradient(90deg, rgba(251, 191, 36, 0.7) 0%, rgba(234, 179, 8, 0.6) 100%)',
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.3)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DailyTaskCard);
