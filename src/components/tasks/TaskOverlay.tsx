import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Task, PlayerTaskStatus } from '../../graphql/generated';
import { PlayerTaskStatus as TaskStatus } from '../../graphql/generated';
import TopicIcon from './TopicIcons';
import Icon from '../common/Icon';
import RarityIndicator from './RarityIndicator';
import { useLocalization } from '../../hooks/useLocalization';
import { useFullscreenOverlay } from '../../hooks/useFullscreenOverlay';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useModal } from '../../contexts/ModalContext';
import { getMonthGenitive } from '../../utils';

type TaskOverlayProps = {
  task: Task;
  status?: PlayerTaskStatus;
  createdAt?: string;
  updatedAt?: string;
  onClose: () => void;
  isOpen: boolean;
};

const TaskOverlay: React.FC<TaskOverlayProps> = ({
  task,
  status,
  createdAt,
  updatedAt,
  onClose,
  isOpen,
}) => {
  const { t, currentLanguage } = useLocalization();
  const { openTaskDialog, closeTaskDialog } = useModal();
  const [overlayMounted, setOverlayMounted] = useState(false);

  useFullscreenOverlay(isOpen);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      openTaskDialog();
      setOverlayMounted(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOverlayMounted(true));
      });
    }
    return () => closeTaskDialog();
  }, [isOpen, openTaskDialog, closeTaskDialog]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (taskDate.getTime() === today.getTime()) return t('common.today');
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (taskDate.getTime() === yesterday.getTime()) return t('common.yesterday');
    const day = date.getDate();
    const monthName = getMonthGenitive(date.getMonth(), t, currentLanguage || 'ru');
    const year = date.getFullYear();
    return year === now.getFullYear() ? `${day} ${monthName}` : `${day} ${monthName} ${year}`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const rarityText = useMemo(() => t(`rarity.${task.rarity || 'COMMON'}`), [t, task.rarity]);

  const handleClose = () => {
    setOverlayMounted(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  const overlayContent = (
    <div
      className="task-overlay fixed left-0 top-0 right-0 bottom-0 z-[10000] flex flex-col box-border"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgb(28, 28, 32) 0%, rgb(14, 14, 16) 50%, #000000 100%)',
        backdropFilter: 'none',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
        paddingTop: 'env(safe-area-inset-top, 0)',
        opacity: overlayMounted ? 1 : 0,
        transition: 'opacity 0.45s cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <style>{`
        .task-overlay .profile-icon-wrapper svg {
          color: inherit;
          fill: none;
          stroke: currentColor;
        }
        .task-overlay-block-in {
          animation: taskOverlayBlockIn 0.5s cubic-bezier(0.33, 1, 0.68, 1) forwards;
          opacity: 0;
        }
        @keyframes taskOverlayBlockIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Контент: на мобильных — сверху, на десктопе — по центру вертикали */}
      <div className="task-overlay flex-1 flex flex-col min-h-0 overflow-hidden px-4 justify-start md:justify-center">
        <div
          className="relative z-10 flex flex-col max-w-md w-full mx-auto min-h-0 flex-1 md:flex-initial md:max-h-[72vh]"
          style={{
            opacity: overlayMounted ? 1 : 0,
            transform: overlayMounted ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1), transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        >
          {/* Заголовок: мягкий отступ сверху, чтобы не резало глаз */}
          <div
            className={`flex-shrink-0 text-center pt-6 md:pt-8 pb-3 ${overlayMounted ? 'task-overlay-block-in' : ''}`}
            style={overlayMounted ? { animationDelay: '0s' } : undefined}
          >
            <h2
              className="text-xl sm:text-2xl font-tech font-bold leading-tight mb-2 px-2"
              style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
            >
              {task.title}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <RarityIndicator rarity={task.rarity || 'COMMON'} size="sm" showLabel={false} />
              <span
                className="text-xs font-tech font-semibold px-2 py-1 rounded-full border"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(220, 235, 245, 0.2)',
                  color: '#e8f4f8',
                }}
              >
                {rarityText}
              </span>
            </div>
          </div>

          {/* Скроллируемый контент в блоках как в TaskCompletionOverlay */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 sm:px-4 pb-2 -webkit-overflow-scrolling-touch">
            {/* Описание */}
            <div
              className={`relative overflow-hidden rounded-2xl p-2.5 mb-2 ${overlayMounted ? 'task-overlay-block-in' : ''}`}
              style={overlayMounted ? { animationDelay: '0.08s' } : undefined}
            >
              <h3
                className="text-sm font-tech font-bold flex items-center mb-2"
                style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
              >
                <div className="mr-2" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                  <Icon type="clipboard" size={18} />
                </div>
                {t('dialogs.task.descriptionTitle', { defaultValue: 'Описание' })}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(220, 235, 245, 0.9)' }}
              >
                {task.description}
              </p>
            </div>

            {/* Награды */}
            <div
              className={`relative overflow-hidden rounded-2xl p-2.5 mb-2 ${overlayMounted ? 'task-overlay-block-in' : ''}`}
              style={overlayMounted ? { animationDelay: '0.12s' } : undefined}
            >
              <h3
                className="text-sm font-tech font-bold flex items-center mb-3"
                style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
              >
                <div className="mr-2" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                  <Icon type="sparkles" size={18} />
                </div>
                {t('dialogs.task.rewardsTitle')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3 border text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(220, 235, 245, 0.2)',
                  }}
                >
                  <div className="flex justify-center mb-1.5" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                    <Icon type="star" size={22} />
                  </div>
                  <div className="text-lg font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {task.experience || 0}
                  </div>
                  <div className="text-xs font-tech font-medium" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('dialogs.task.experience')}
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 border text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(220, 235, 245, 0.2)',
                  }}
                >
                  <div className="flex justify-center mb-1.5" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                    <Icon type="coins" size={22} />
                  </div>
                  <div className="text-lg font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {task.currencyReward || 0}
                  </div>
                  <div className="text-xs font-tech font-medium" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('dialogs.task.coins')}
                  </div>
                </div>
              </div>
            </div>

            {/* Характеристики */}
            <div
              className={`relative overflow-hidden rounded-2xl p-2.5 mb-2 ${overlayMounted ? 'task-overlay-block-in' : ''}`}
              style={overlayMounted ? { animationDelay: '0.16s' } : undefined}
            >
              <h3
                className="text-sm font-tech font-bold flex items-center mb-3"
                style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
              >
                <div className="mr-2" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                  <Icon type="clock" size={18} />
                </div>
                {t('dialogs.task.statsTitle')}
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div
                  className="rounded-xl p-3 text-center border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                  }}
                >
                  <div className="profile-icon-wrapper flex justify-center mb-1.5" style={{ color: '#e8f4f8' }}>
                    <Icon type="dumbbell" size={24} />
                  </div>
                  <div className="text-lg font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {task.strength || 0}
                  </div>
                  <div className="text-[10px] font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.strength')}
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 text-center border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <div className="profile-icon-wrapper flex justify-center mb-1.5" style={{ color: '#e8f4f8' }}>
                    <Icon type="zap" size={24} />
                  </div>
                  <div className="text-lg font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {task.agility || 0}
                  </div>
                  <div className="text-[10px] font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.agility')}
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 text-center border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                  }}
                >
                  <div className="profile-icon-wrapper flex justify-center mb-1.5" style={{ color: '#e8f4f8' }}>
                    <Icon type="brain" size={24} />
                  </div>
                  <div className="text-lg font-tech font-bold" style={{ color: '#e8f4f8' }}>
                    {task.intelligence || 0}
                  </div>
                  <div className="text-[10px] font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.intelligence')}
                  </div>
                </div>
              </div>
            </div>

            {/* Темы */}
            {task.topics && task.topics.length > 0 && (
              <div
                className={`relative overflow-hidden rounded-2xl p-2.5 mb-2 ${overlayMounted ? 'task-overlay-block-in' : ''}`}
                style={overlayMounted ? { animationDelay: '0.2s' } : undefined}
              >
                <h3
                  className="text-sm font-tech font-bold flex items-center mb-2"
                  style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {t('dialogs.task.categoriesTitle')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.topics.map((topic) => (
                    <div
                      key={topic}
                      className="inline-flex items-center px-3 py-2 rounded-full text-xs font-tech font-medium border"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        borderColor: 'rgba(220, 235, 245, 0.2)',
                        color: '#e8f4f8',
                      }}
                    >
                      <TopicIcon topic={topic} size={14} className="mr-1.5" />
                      {t(`topics.labels.${topic}`)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Даты */}
            {createdAt && (
              <div
                className={`relative overflow-hidden rounded-2xl p-2.5 mb-2 ${overlayMounted ? 'task-overlay-block-in' : ''}`}
                style={overlayMounted ? { animationDelay: '0.24s' } : undefined}
              >
                <div className="flex items-start gap-2">
                  <div style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                    <Icon type="clock" size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-tech font-medium mb-1" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                      {t('dialogs.task.createdAt')}
                    </div>
                    <div className="text-sm font-tech font-semibold" style={{ color: 'rgba(220, 235, 245, 0.9)' }}>
                      {formatDate(createdAt)} {formatTime(createdAt)}
                    </div>
                    {updatedAt && (status === TaskStatus.COMPLETED || status === TaskStatus.SKIPPED) && (
                      <>
                        <div className="text-xs font-tech font-medium mt-2 mb-1" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                          {status === TaskStatus.COMPLETED ? t('dialogs.task.completedAt') : t('dialogs.task.skippedAt')}
                        </div>
                        <div className="text-sm font-tech font-semibold" style={{ color: 'rgba(220, 235, 245, 0.9)' }}>
                          {formatDate(updatedAt)} {formatTime(updatedAt)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Кнопка «Закрыть» внизу */}
      <div
        className="flex-shrink-0 flex justify-center items-center w-full px-4 pt-3 pb-4"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'env(safe-area-inset-left, 0)',
          paddingRight: 'env(safe-area-inset-right, 0)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
          opacity: overlayMounted ? 1 : 0,
          transform: overlayMounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0.08s, transform 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0.08s',
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl font-tech font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'rgba(180, 220, 240, 0.15)',
            border: '1px solid rgba(180, 220, 240, 0.3)',
            color: '#e8f4f8',
            boxShadow: '0 0 20px rgba(180, 220, 240, 0.1)',
          }}
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default React.memo(TaskOverlay);
