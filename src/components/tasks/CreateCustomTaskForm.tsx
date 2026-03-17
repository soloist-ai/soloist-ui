import React, { useState, useCallback } from 'react';
import { gqlSdk } from '../../graphql/client';
import type { TaskFieldsFragment } from './TaskCard';
import { useLocalization } from '../../hooks/useLocalization';
import { useNotification } from '../common/NotificationSystem';
import TaskCard from './TaskCard';

export interface CreateCustomTaskFormProps {
  onCreated: (task: TaskFieldsFragment) => void;
  onClose: () => void;
}

type FormState = 'idle' | 'validating' | 'rejected' | 'created';

const MAX_NAME_LENGTH = 200;

const CreateCustomTaskForm: React.FC<CreateCustomTaskFormProps> = ({ onCreated, onClose }) => {
  const { t } = useLocalization();
  const notification = useNotification();

  const [name, setName] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [createdTask, setCreatedTask] = useState<TaskFieldsFragment | null>(null);

  const canSubmit = name.trim().length >= 3 && formState === 'idle';

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setFormState('validating');
    setRejectionReason(null);

    try {
      const { createCustomTask } = await gqlSdk.CreateCustomTask({
        name: name.trim(),
      });

      if (createCustomTask.isValid && createCustomTask.task) {
        const task = createCustomTask.task as TaskFieldsFragment;
        setCreatedTask(task);
        setFormState('created');
        notification.success(t('common.success'));
        setTimeout(() => onCreated(task), 1500);
      } else {
        setRejectionReason(createCustomTask.rejectionReason ?? null);
        setFormState('rejected');
      }
    } catch {
      notification.error(t('errors.saveError'));
      setFormState('idle');
    }
  }, [canSubmit, name, t, notification, onCreated]);

  const handleRetry = () => {
    setFormState('idle');
    setRejectionReason(null);
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-tech font-bold text-base"
          style={{ color: '#e8f4f8' }}
        >
          {t('tasks.createForm.title')}
        </h2>
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(220,235,245,0.6)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Created state — show the new task card */}
      {formState === 'created' && createdTask && (
        <div>
          <p
            className="text-xs font-tech mb-3 text-center"
            style={{ color: 'rgba(80,200,100,0.9)' }}
          >
            {t('common.success')}
          </p>
          <TaskCard task={createdTask} />
        </div>
      )}

      {/* Form (idle or rejected) */}
      {formState !== 'created' && (
        <form onSubmit={handleSubmit} noValidate>
          {/* Rejection message */}
          {formState === 'rejected' && rejectionReason && (
            <div
              className="mb-4 p-3 rounded-xl text-xs font-tech leading-relaxed"
              style={{
                background: 'rgba(255,80,80,0.1)',
                border: '1px solid rgba(255,80,80,0.25)',
                color: 'rgba(255,140,140,0.9)',
              }}
              role="alert"
            >
              {t('tasks.createForm.rejected', { reason: rejectionReason })}
            </div>
          )}

          {/* Name field */}
          <div className="mb-5">
            <label
              htmlFor="custom-task-name"
              className="block text-xs font-tech font-medium mb-1.5"
              style={{ color: 'rgba(220,235,245,0.7)' }}
            >
              {t('tasks.createForm.titleLabel')}
            </label>
            <input
              id="custom-task-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
              placeholder={t('tasks.createForm.titlePlaceholder')}
              maxLength={MAX_NAME_LENGTH}
              disabled={formState === 'validating'}
              autoComplete="off"
              className="w-full px-3 py-2.5 rounded-xl font-tech text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e8f4f8',
                caretColor: 'rgba(180,220,240,0.9)',
              }}
            />
            <div
              className="text-right text-xs mt-1 font-tech"
              style={{ color: 'rgba(220,235,245,0.35)' }}
            >
              {name.length}/{MAX_NAME_LENGTH}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {formState === 'rejected' && (
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 py-2.5 rounded-xl font-tech font-semibold text-sm transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(220,235,245,0.7)',
                }}
              >
                {t('common.retry')}
              </button>
            )}

            <button
              type="submit"
              disabled={!canSubmit || formState === 'validating'}
              className="flex-1 py-2.5 rounded-xl font-tech font-semibold text-sm transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
              style={
                !canSubmit || formState === 'validating'
                  ? {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(220,235,245,0.3)',
                      cursor: 'not-allowed',
                    }
                  : {
                      background: 'linear-gradient(135deg, rgba(180,220,240,0.2) 0%, rgba(160,210,235,0.12) 100%)',
                      border: '1px solid rgba(180,220,240,0.3)',
                      color: '#e8f4f8',
                      boxShadow: '0 0 12px rgba(180,220,240,0.15)',
                    }
              }
            >
              {formState === 'validating' && (
                <span
                  className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                  aria-hidden="true"
                />
              )}
              {formState === 'validating'
                ? t('tasks.createForm.validating')
                : t('tasks.createForm.submit')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateCustomTaskForm;
