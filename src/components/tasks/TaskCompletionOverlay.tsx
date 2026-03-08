import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Task, TaskTopic } from '../../graphql/generated';
import type { CompleteTaskResult } from '../../services/taskActions';
import { useLocalization } from '../../hooks/useLocalization';
import Icon from '../common/Icon';
import TopicIcon from './TopicIcons';
import { ExperienceProgressBar } from '../ui/experience-progress-bar';
import { useFullscreenOverlay } from '../../hooks/useFullscreenOverlay';
import { useScrollLock } from '../../hooks/useScrollLock';

type TaskCompletionOverlayProps = {
  response: CompleteTaskResult;
  completedTask?: Task;
  onClose: () => void;
  isOpen: boolean;
};

const TaskCompletionOverlay: React.FC<TaskCompletionOverlayProps> = ({ response, completedTask, onClose, isOpen }) => {
  const { playerBefore, playerAfter } = response;
  const { t } = useLocalization();
  const [overlayMounted, setOverlayMounted] = useState(false);

  useFullscreenOverlay(isOpen);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setOverlayMounted(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOverlayMounted(true));
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!playerBefore || !playerAfter) return null;

  const expChange = completedTask?.experience || 0;
  const strengthChange = (playerAfter.strength || 0) - (playerBefore.strength || 0);
  const agilityChange = (playerAfter.agility || 0) - (playerBefore.agility || 0);
  const intelligenceChange = (playerAfter.intelligence || 0) - (playerBefore.intelligence || 0);
  const balanceChange = completedTask?.currencyReward || 0;

  const topicProgress = playerAfter.taskTopics || [];
  const topicsInTask = new Set(completedTask?.topics || []);
  const filteredTopicProgress = topicProgress.filter(tp => tp.taskTopic && topicsInTask.has(tp.taskTopic));

  const beforeTopicLevelMap = new Map(
    (playerBefore.taskTopics || [])
      .filter(tp => tp.taskTopic)
      .map(tp => [tp.taskTopic!, tp.level])
  );

  const topicExpGainMap = new Map<TaskTopic, number>();
  for (const tp of filteredTopicProgress) {
    if (!tp.taskTopic) continue;
    const beforeTotal = beforeTopicLevelMap.get(tp.taskTopic)?.totalExperience ?? 0;
    const afterTotal = tp.level?.totalExperience ?? 0;
    const gain = afterTotal - beforeTotal;
    topicExpGainMap.set(tp.taskTopic, gain);
  }

  const handleClose = () => {
    setOverlayMounted(false);
    setTimeout(onClose, 200);
  };

  const renderTopicRow = (
    topic: TaskTopic | undefined,
    level: { level?: number; currentExperience?: number; experienceToNextLevel?: number } | undefined,
    rowHidden: boolean,
    currentExp: number,
    maxExp: number,
    expGain: number
  ) => {
    const topicLevelGain = topic && level ? (level?.level || 0) - (beforeTopicLevelMap.get(topic)?.level || 0) : 0;
    return (
      <>
        {/* Фиксированная мин. высота заголовка — полоски опыта в двух колонках на одной линии */}
        <div className="flex items-start justify-between gap-1.5 mb-0.5 min-h-[2.25rem]">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0 mr-1.5">
              {topic ? <TopicIcon topic={topic} size={14} /> : <div style={{ width: 14, height: 14 }} />}
            </div>
            <span className="text-[11px] font-tech font-medium break-words min-w-0 leading-tight" style={{ color: 'rgba(220, 235, 245, 0.9)' }}>
              {topic ? t(`topics.labels.${topic}`) : '—'}
            </span>
          </div>
          <div className="relative flex items-center flex-shrink-0">
            <span
              className="text-[10px] font-tech font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(220, 235, 245, 0.3)',
                color: '#e8f4f8',
              }}
            >
              {level?.level ?? 1}
            </span>
            {topicLevelGain > 0 && (
              <div className="absolute top-0 right-0 z-10 translate-x-1/2 -translate-y-1/2">
                <span
                  className="text-[9px] font-tech font-bold px-1 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(10, 14, 39, 1)',
                    border: '1px solid rgba(34, 197, 94, 0.8)',
                    color: 'rgba(34, 197, 94, 0.9)',
                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.5), inset 0 0 8px rgba(34, 197, 94, 0.2)',
                    textShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                  }}
                >
                  +{topicLevelGain}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-0.5">
        <div className="flex justify-between text-[9px] font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
          <span>{t('taskCompletion.experience')}</span>
          <span className="flex items-center">
            {currentExp}/{maxExp}
            {expGain > 0 && !rowHidden && (
              <span
                className="ml-1 font-bold"
                style={{
                  color: 'rgba(34, 197, 94, 0.9)',
                  textShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                }}
              >
                +{expGain}
              </span>
            )}
          </span>
        </div>
        <ExperienceProgressBar
          currentExp={currentExp}
          maxExp={maxExp}
          accentColor="rgba(180, 220, 240, 0.8)"
          height="h-1"
          showPulseGlow={false}
        />
      </div>
    </>
    );
  };

  const overlayContent = (
    <div
      className="task-completion-overlay fixed left-0 top-0 right-0 bottom-0 z-[10000] flex flex-col box-border"
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
        .profile-icon-wrapper svg {
          color: inherit;
          fill: none;
          stroke: currentColor;
        }
        .task-completion-overlay-content {
          background: transparent !important;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .task-completion-block-in {
          animation: taskCompletionBlockIn 0.5s cubic-bezier(0.33, 1, 0.68, 1) forwards;
          opacity: 0;
        }
        @keyframes taskCompletionBlockIn {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Область контента: на мобильных — сверху, на десктопе — по центру вертикали */}
      <div className="task-completion-overlay flex-1 flex flex-col min-h-0 overflow-hidden px-4 justify-start md:justify-center">
        <div
          className="task-completion-overlay-content relative z-10 flex flex-col max-w-md w-full mx-auto min-h-0 md:max-h-[72vh]"
          style={{
            opacity: overlayMounted ? 1 : 0,
            transform: overlayMounted ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1), transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        >
          {/* Заголовок: мягкий отступ сверху, чтобы не резало глаз */}
          <div
            className={`task-completion-title relative z-10 flex-shrink-0 text-center pt-6 md:pt-8 pb-2 ${overlayMounted ? 'task-completion-block-in' : ''}`}
            style={overlayMounted ? { animationDelay: '0s' } : undefined}
          >
            <h2
              className="text-2xl sm:text-3xl font-tech font-bold"
              style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
            >
              {t('taskCompletion.title')}
            </h2>
          </div>

          {/* Content — без скролла; блок баланса не сжимается, чтобы был виден на десктопе; overflow-visible чтобы стикер +N уровня не обрезался */}
          <div className="relative z-10 px-2 sm:px-6 pb-2 overflow-visible flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-visible flex flex-col">
            {/* Level Progress — стикер +N позиционируется поверх (translate), родители с overflow-visible не обрезают */}
            <div
              className={`relative overflow-visible rounded-2xl p-2.5 mb-2 ${overlayMounted ? 'task-completion-block-in' : ''}`}
              style={overlayMounted ? { animationDelay: '0.08s' } : undefined}
            >
              <div className="relative z-10 flex items-center justify-between mb-2">
                <h3
                  className="text-sm font-tech font-bold flex items-center"
                  style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
                >
                  <div className="mr-2" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                    <Icon type="star" size={18} />
                  </div>
                  {t('taskCompletion.level')}
                </h3>
                <div className="relative flex items-center overflow-visible">
                  <div
                    className="text-lg font-tech font-bold rounded-full pl-4 pr-4 py-1.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(220, 235, 245, 0.4)',
                      color: '#e8f4f8',
                      boxShadow: '0 0 15px rgba(180, 220, 240, 0.3)',
                      textShadow: '0 0 8px rgba(180, 220, 240, 0.4)',
                    }}
                  >
                    {playerAfter.level?.level || 1}
                  </div>
                  {(playerAfter.level?.level || 1) > (playerBefore.level?.level || 1) && (
                    <div className="absolute top-0 right-0 z-10 translate-x-1/2 -translate-y-1/2">
                      <span
                        className="text-[10px] font-tech font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(10, 14, 39, 1)',
                          border: '1px solid rgba(34, 197, 94, 0.8)',
                          color: 'rgba(34, 197, 94, 0.9)',
                          boxShadow: '0 0 8px rgba(34, 197, 94, 0.5), inset 0 0 8px rgba(34, 197, 94, 0.2)',
                          textShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                        }}
                      >
                        +{(playerAfter.level?.level || 1) - (playerBefore.level?.level || 1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl p-2.5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-tech font-medium" style={{ color: 'rgba(220, 235, 245, 0.8)' }}>
                    {t('taskCompletion.experience')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-tech font-bold"
                      style={{ color: '#e8f4f8', textShadow: '0 0 4px rgba(180, 220, 240, 0.2)' }}
                    >
                      {playerAfter.level?.currentExperience || 0} / {playerAfter.level?.experienceToNextLevel || 100}
                    </span>
                    {expChange > 0 && (
                      <span
                        className="text-[11px] font-tech font-bold"
                        style={{
                          color: 'rgba(34, 197, 94, 0.95)',
                          textShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                        }}
                      >
                        +{expChange}
                      </span>
                    )}
                  </div>
                </div>
                <ExperienceProgressBar
                  currentExp={playerAfter.level?.currentExperience || 0}
                  maxExp={playerAfter.level?.experienceToNextLevel || 100}
                  accentColor="rgba(180, 220, 240, 0.8)"
                  height="h-1.5"
                  showPulseGlow={true}
                  className="shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                />
              </div>

              {/* Topics Progress: одна строка; 1 топик — на всю ширину, 2 — в ряд по половине; название мельче, чтобы вмещалось */}
              <div
                className="mt-2 pt-2"
                style={{
                  borderTop: '1px solid rgba(220, 235, 245, 0.1)',
                  minHeight: '72px',
                }}
              >
                <h4
                  className="text-xs font-tech font-semibold mb-1.5 flex items-center"
                  style={{ color: '#e8f4f8', textShadow: '0 0 4px rgba(180, 220, 240, 0.2)' }}
                >
                  <div className="mr-2" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                    <Icon type="target" size={16} />
                  </div>
                  {t('taskCompletion.topicsProgress')}
                </h4>
                <div className={filteredTopicProgress.length === 2 ? 'grid grid-cols-2 gap-2' : ''}>
                  {filteredTopicProgress.length === 2
                    ? [0, 1].map((i) => {
                        const topicData = filteredTopicProgress[i];
                        const topic = topicData?.taskTopic;
                        const level = topicData?.level;
                        const rowHidden = !topic || !level;
                        const currentExp = level?.currentExperience || 0;
                        const maxExp = level?.experienceToNextLevel || 100;
                        const expGain = topic ? (topicExpGainMap.get(topic) ?? 0) : 0;
                        return (
                          <div
                            key={topic ?? `empty-topic-${i}`}
                            className="rounded-lg p-1.5 min-w-0"
                            style={rowHidden ? { opacity: 0, pointerEvents: 'none' } : undefined}
                            aria-hidden={rowHidden}
                          >
                            {renderTopicRow(topic, level, rowHidden, currentExp, maxExp, expGain)}
                          </div>
                        );
                      })
                    : filteredTopicProgress.slice(0, 1).map((topicData) => {
                        const topic = topicData?.taskTopic;
                        const level = topicData?.level;
                        if (!topic || !level) return null;
                        const currentExp = level?.currentExperience || 0;
                        const maxExp = level?.experienceToNextLevel || 100;
                        const expGain = topicExpGainMap.get(topic) ?? 0;
                        return (
                          <div key={topic} className="rounded-lg p-1.5 w-full">
                            {renderTopicRow(topic, level, false, currentExp, maxExp, expGain)}
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>

            {/* Stats Changes */}
            <div
              className={`relative overflow-hidden rounded-2xl p-2.5 mb-2 ${overlayMounted ? 'task-completion-block-in' : ''}`}
              style={overlayMounted ? { animationDelay: '0.16s' } : undefined}
            >
              <h3
                className="relative z-10 text-sm font-tech font-semibold mb-1.5 flex items-center"
                style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(180, 220, 240, 0.3)' }}
              >
                <div className="mr-2" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                  <Icon type="trending-up" size={16} />
                </div>
                {t('taskCompletion.stats')}
              </h3>
              <div className="relative z-10 grid grid-cols-3 gap-1.5 items-stretch">
                {/* Strength */}
                <div
                  className="relative rounded-xl p-2.5 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    boxShadow: '0 0 15px rgba(220, 38, 38, 0.1)',
                  }}
                >
                  {strengthChange !== 0 && (
                    <div className="absolute -top-2 -right-1 z-10">
                      <span
                        className="text-[10px] font-tech font-bold px-1.5 py-0.5 rounded-full"
                        style={
                          strengthChange > 0
                            ? {
                                background: 'rgba(10, 14, 39, 1)',
                                border: '1px solid rgba(34, 197, 94, 0.8)',
                                color: 'rgba(34, 197, 94, 0.9)',
                                boxShadow: '0 0 8px rgba(34, 197, 94, 0.5), inset 0 0 8px rgba(34, 197, 94, 0.2)',
                                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                              }
                            : {
                                background: 'rgba(10, 14, 39, 1)',
                                border: '1px solid rgba(220, 38, 38, 0.8)',
                                color: 'rgba(220, 38, 38, 0.9)',
                                boxShadow: '0 0 8px rgba(220, 38, 38, 0.5), inset 0 0 8px rgba(220, 38, 38, 0.2)',
                                textShadow: '0 0 6px rgba(220, 38, 38, 0.6)',
                              }
                        }
                      >
                        {strengthChange > 0 ? '+' : ''}{strengthChange}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-center items-center mb-1.5">
                    <div className="profile-icon-wrapper" style={{ color: '#e8f4f8', filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.6))' }}>
                      <Icon type="dumbbell" size={22} />
                    </div>
                  </div>
                  <div className="text-base font-tech font-bold mb-0.5" style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(220, 38, 38, 0.4)' }}>
                    {playerAfter.strength || 0}
                  </div>
                  <div className="text-[10px] font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.strength')}
                  </div>
                </div>

                {/* Agility */}
                <div
                  className="relative rounded-xl p-2.5 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.1)',
                  }}
                >
                  {agilityChange !== 0 && (
                    <div className="absolute -top-2 -right-1 z-10">
                      <span
                        className="text-[10px] font-tech font-bold px-1.5 py-0.5 rounded-full"
                        style={
                          agilityChange > 0
                            ? {
                                background: 'rgba(10, 14, 39, 1)',
                                border: '1px solid rgba(34, 197, 94, 0.8)',
                                color: 'rgba(34, 197, 94, 0.9)',
                                boxShadow: '0 0 8px rgba(34, 197, 94, 0.5), inset 0 0 8px rgba(34, 197, 94, 0.2)',
                                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                              }
                            : {
                                background: 'rgba(10, 14, 39, 1)',
                                border: '1px solid rgba(220, 38, 38, 0.8)',
                                color: 'rgba(220, 38, 38, 0.9)',
                                boxShadow: '0 0 8px rgba(220, 38, 38, 0.5), inset 0 0 8px rgba(220, 38, 38, 0.2)',
                                textShadow: '0 0 6px rgba(220, 38, 38, 0.6)',
                              }
                        }
                      >
                        {agilityChange > 0 ? '+' : ''}{agilityChange}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-center items-center mb-1.5">
                    <div className="profile-icon-wrapper" style={{ color: '#e8f4f8', filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' }}>
                      <Icon type="zap" size={22} />
                    </div>
                  </div>
                  <div className="text-base font-tech font-bold mb-0.5" style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(34, 197, 94, 0.4)' }}>
                    {playerAfter.agility || 0}
                  </div>
                  <div className="text-[10px] font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.agility')}
                  </div>
                </div>

                {/* Intelligence */}
                <div
                  className="relative rounded-xl p-2.5 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
                  }}
                >
                  {intelligenceChange !== 0 && (
                    <div className="absolute -top-2 -right-1 z-10">
                      <span
                        className="text-[10px] font-tech font-bold px-1.5 py-0.5 rounded-full"
                        style={
                          intelligenceChange > 0
                            ? {
                                background: 'rgba(10, 14, 39, 1)',
                                border: '1px solid rgba(34, 197, 94, 0.8)',
                                color: 'rgba(34, 197, 94, 0.9)',
                                boxShadow: '0 0 8px rgba(34, 197, 94, 0.5), inset 0 0 8px rgba(34, 197, 94, 0.2)',
                                textShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                              }
                            : {
                                background: 'rgba(10, 14, 39, 1)',
                                border: '1px solid rgba(220, 38, 38, 0.8)',
                                color: 'rgba(220, 38, 38, 0.9)',
                                boxShadow: '0 0 8px rgba(220, 38, 38, 0.5), inset 0 0 8px rgba(220, 38, 38, 0.2)',
                                textShadow: '0 0 6px rgba(220, 38, 38, 0.6)',
                              }
                        }
                      >
                        {intelligenceChange > 0 ? '+' : ''}{intelligenceChange}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-center items-center mb-1.5">
                    <div className="profile-icon-wrapper" style={{ color: '#e8f4f8', filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }}>
                      <Icon type="brain" size={22} />
                    </div>
                  </div>
                  <div className="text-base font-tech font-bold mb-0.5" style={{ color: '#e8f4f8', textShadow: '0 0 8px rgba(168, 85, 247, 0.4)' }}>
                    {playerAfter.intelligence || 0}
                  </div>
                  <div className="text-[10px] font-tech text-center" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
                    {t('profile.stats.intelligence')}
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Balance Change — flex-shrink-0 чтобы всегда был виден на десктопе */}
            <div
              className={`relative overflow-hidden rounded-2xl p-2.5 mb-2 flex-shrink-0 ${overlayMounted ? 'task-completion-block-in' : ''}`}
              style={overlayMounted ? { animationDelay: '0.24s' } : undefined}
            >
              <div className="relative z-10 text-center">
                <div className="flex justify-center items-center mb-2">
                  <div className="mr-2" style={{ color: 'rgba(180, 220, 240, 0.8)' }}>
                    <Icon type="coins" size={18} />
                  </div>
                  <span className="text-xs font-tech font-medium" style={{ color: 'rgba(220, 235, 245, 0.7)', textShadow: '0 0 2px rgba(180, 220, 240, 0.2)' }}>
                    {t('balance.totalBalance')}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="text-xl font-tech font-bold mb-0.5" style={{ color: '#e8f4f8', textShadow: '0 0 12px rgba(180, 220, 240, 0.4)' }}>
                    {playerAfter.balance?.amount.amount || 0}
                  </div>
                  <div className="text-[11px] font-tech font-semibold" style={{ color: 'rgba(180, 220, 240, 0.8)', textShadow: '0 0 6px rgba(180, 220, 240, 0.3)' }}>
                    {playerAfter.balance?.amount.currencyCode || 'SLCN'}
                  </div>
                </div>
                <div
                  className="rounded-xl py-0.5 px-2.5 font-tech font-semibold text-xs"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#e8f4f8',
                    boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)',
                    textShadow: '0 0 4px rgba(34, 197, 94, 0.3)',
                  }}
                >
                  +{balanceChange} {t('taskCompletion.balanceGained')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка «Продолжить» внизу; отступ сверху = отступ заголовка на десктопе (task-completion-footer-spacer) */}
      <div
        className="task-completion-footer-spacer flex-shrink-0 flex justify-center items-center w-full px-4 pt-3 pb-4"
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
            {t('common.continue')}
        </button>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default React.memo(TaskCompletionOverlay);
