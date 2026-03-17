import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { openProofSubmission } from '../../services/taskService';

export interface TaskFieldsFragment {
  id: string;
  type: string;
  name: string | null;
  goal: number;
  progress: number;
  gemReward: number;
  isCompleted: boolean;
  proofType: string;
  day: string;
  createdAt: string;
}

export interface TaskCardProps {
  task: TaskFieldsFragment;
  onTaskUpdated?: (updatedTask: TaskFieldsFragment) => void;
}

const TASK_ICONS: Record<string, string> = {
  STEPS: '🚶',
  PUSH_UPS: '💪',
  SQUATS: '🦵',
  CUSTOM: '🎯',
};

const TASK_COLOR: Record<string, string> = {
  STEPS: 'rgba(100, 200, 255, 0.15)',
  PUSH_UPS: 'rgba(255, 100, 130, 0.15)',
  SQUATS: 'rgba(130, 255, 130, 0.15)',
  CUSTOM: 'rgba(160, 120, 255, 0.12)',
};

const TASK_BORDER: Record<string, string> = {
  STEPS: 'rgba(100, 200, 255, 0.25)',
  PUSH_UPS: 'rgba(255, 100, 130, 0.25)',
  SQUATS: 'rgba(130, 255, 130, 0.25)',
  CUSTOM: 'rgba(160, 120, 255, 0.25)',
};

const PROOF_TYPE_ICONS: Record<string, string> = {
  TEXT: '📝',
  PHOTO: '📷',
  VIDEO: '🎥',
};

const TaskCard: React.FC<TaskCardProps> = React.memo(({ task }) => {
  const { t } = useLocalization();
  const isCustom = task.type === 'CUSTOM';

  const handleSubmitProof = () => {
    openProofSubmission(task.id, task.proofType);
  };

  const taskTitle = isCustom
    ? task.name ?? ''
    : t(`tasks.taskType.${task.type}`);

  const borderColor = TASK_BORDER[task.type] ?? TASK_BORDER.CUSTOM;
  const bgColor = TASK_COLOR[task.type] ?? TASK_COLOR.CUSTOM;

  return (
    <div
      className="relative rounded-2xl p-4 transition-all duration-200"
      style={{
        background: task.isCompleted
          ? 'rgba(255, 255, 255, 0.03)'
          : `linear-gradient(135deg, ${bgColor} 0%, rgba(255,255,255,0.04) 100%)`,
        border: `1px solid ${task.isCompleted ? 'rgba(255,255,255,0.08)' : borderColor}`,
        backdropFilter: 'blur(20px)',
        opacity: task.isCompleted ? 0.7 : 1,
      }}
    >
      {/* Completed checkmark overlay */}
      {task.isCompleted && (
        <div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(80, 200, 100, 0.2)',
            border: '1px solid rgba(80, 200, 100, 0.4)',
          }}
          aria-label={t('tasks.completed')}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2 6L5 9L10 3"
              stroke="rgba(80, 200, 100, 0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${borderColor}`,
          }}
          aria-hidden="true"
        >
          {TASK_ICONS[task.type] ?? '🎯'}
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <h3
            className="font-tech font-semibold text-sm leading-tight mb-0.5"
            style={{ color: task.isCompleted ? 'rgba(220,235,245,0.5)' : '#e8f4f8' }}
          >
            {taskTitle}
          </h3>
          <p
            className="text-xs font-tech"
            style={{ color: 'rgba(220,235,245,0.55)' }}
          >
            {isCustom
              ? `${PROOF_TYPE_ICONS[task.proofType] ?? ''} ${t(`tasks.proofType.${task.proofType}`)}`
              : t('tasks.submitProof')
            }
          </p>
        </div>
      </div>

      {/* Goal + Progress + Reward row */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span
            className="font-tech font-bold text-lg leading-none"
            style={{ color: task.isCompleted ? 'rgba(220,235,245,0.4)' : '#e8f4f8' }}
          >
            {task.progress}/{task.goal}
          </span>
          {!isCustom && (
            <span className="text-xs font-tech" style={{ color: 'rgba(220,235,245,0.5)' }}>
              {t(`tasks.taskType.${task.type}`).toLowerCase()}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-1"
          style={{ color: task.isCompleted ? 'rgba(180,220,240,0.4)' : 'rgba(180,220,240,0.9)' }}
        >
          <span className="font-tech font-bold text-sm">
            {t('tasks.gemReward', { amount: task.gemReward })}
          </span>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmitProof}
        disabled={task.isCompleted}
        className="w-full py-2 rounded-xl font-tech font-semibold text-xs transition-all duration-150 active:scale-95"
        style={
          task.isCompleted
            ? {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(220,235,245,0.3)',
                cursor: 'not-allowed',
              }
            : {
                background: `linear-gradient(135deg, ${borderColor.replace('0.25', '0.2')} 0%, rgba(255,255,255,0.04) 100%)`,
                border: `1px solid ${borderColor.replace('0.25', '0.3')}`,
                color: '#e8f4f8',
                boxShadow: `0 0 12px ${borderColor.replace('0.25', '0.15')}`,
              }
        }
      >
        {task.isCompleted ? t('tasks.completed') : t('tasks.submitProof')}
      </button>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
