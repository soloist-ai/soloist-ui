import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { TaskTopic, Assessment } from '../../graphql/generated';
import type { PlayerTaskTopic } from '../../graphql/generated';
import { gqlSdk } from '../../graphql/client';
import TopicIcon from './TopicIcons';
import { useLocalization } from '../../hooks/useLocalization';
import { ExperienceProgressBar } from '../ui/experience-progress-bar';
import { getOptimizedBlur } from '../../utils/performance';

// Константа вне компонента — не пересоздаётся при каждом рендере
const TOPIC_COLOR_SCHEMES: Record<string, {
  accentColor: string; borderColor: string;
  bgGradient: string; selectedBgGradient: string; glow: string;
}> = {
  PHYSICAL_ACTIVITY: { accentColor: 'rgba(220, 38, 38, 0.6)', borderColor: 'rgba(220, 38, 38, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)', selectedBgGradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(185, 28, 28, 0.15) 100%)', glow: '0 0 20px rgba(220, 38, 38, 0.3)' },
  CREATIVITY:        { accentColor: 'rgba(236, 72, 153, 0.6)', borderColor: 'rgba(236, 72, 153, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.08) 100%)', selectedBgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.15) 100%)', glow: '0 0 20px rgba(236, 72, 153, 0.3)' },
  SOCIAL_SKILLS:     { accentColor: 'rgba(234, 179, 8, 0.6)',  borderColor: 'rgba(234, 179, 8, 0.3)',  bgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(202, 138, 4, 0.15) 100%)',  glow: '0 0 20px rgba(234, 179, 8, 0.3)' },
  NUTRITION:         { accentColor: 'rgba(34, 197, 94, 0.6)',  borderColor: 'rgba(34, 197, 94, 0.3)',  bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.15) 100%)',  glow: '0 0 20px rgba(34, 197, 94, 0.3)' },
  PRODUCTIVITY:      { accentColor: 'rgba(249, 115, 22, 0.6)', borderColor: 'rgba(249, 115, 22, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.15) 100%)',  glow: '0 0 20px rgba(249, 115, 22, 0.3)' },
  ADVENTURE:         { accentColor: 'rgba(245, 158, 11, 0.6)', borderColor: 'rgba(245, 158, 11, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)',  glow: '0 0 20px rgba(245, 158, 11, 0.3)' },
  MUSIC:             { accentColor: 'rgba(139, 92, 246, 0.6)', borderColor: 'rgba(139, 92, 246, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.15) 100%)',  glow: '0 0 20px rgba(139, 92, 246, 0.3)' },
  BRAIN:             { accentColor: 'rgba(168, 85, 247, 0.6)', borderColor: 'rgba(168, 85, 247, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%)',  glow: '0 0 20px rgba(168, 85, 247, 0.3)' },
  CYBERSPORT:        { accentColor: 'rgba(34, 197, 94, 0.6)',  borderColor: 'rgba(34, 197, 94, 0.3)',  bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.15) 100%)',  glow: '0 0 20px rgba(34, 197, 94, 0.3)' },
  DEVELOPMENT:       { accentColor: 'rgba(59, 130, 246, 0.6)', borderColor: 'rgba(59, 130, 246, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)',  glow: '0 0 20px rgba(59, 130, 246, 0.3)' },
  READING:           { accentColor: 'rgba(99, 102, 241, 0.6)', borderColor: 'rgba(99, 102, 241, 0.3)', bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.15) 100%)',  glow: '0 0 20px rgba(99, 102, 241, 0.3)' },
  LANGUAGE_LEARNING: { accentColor: 'rgba(6, 182, 212, 0.6)',  borderColor: 'rgba(6, 182, 212, 0.3)',  bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.08) 100%)',  selectedBgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(8, 145, 178, 0.15) 100%)',  glow: '0 0 20px rgba(6, 182, 212, 0.3)' },
};

const DISABLED_TOPICS = new Set([
  TaskTopic.CYBERSPORT, TaskTopic.DEVELOPMENT,
  TaskTopic.READING, TaskTopic.LANGUAGE_LEARNING,
]);

const ALL_TOPICS = Object.values(TaskTopic);

type TopicsSectionProps = {
  isAuthenticated: boolean;
  isFirstTime?: boolean;
  onSave?: () => void;
};

type TopicCardProps = {
  topic: TaskTopic;
  isSelected: boolean;
  isDisabled: boolean;
  playerTopic: PlayerTaskTopic | undefined;
  onToggle: (topic: TaskTopic) => void;
};

const TopicCard = memo(({ topic, isSelected, isDisabled, playerTopic, onToggle }: TopicCardProps) => {
  const { t } = useLocalization();
  const colorScheme = TOPIC_COLOR_SCHEMES[topic] ?? TOPIC_COLOR_SCHEMES.DEVELOPMENT;

  return (
    <button
      type="button"
      onClick={() => onToggle(topic)}
      disabled={isDisabled}
      className={`group relative p-4 sm:p-6 rounded-2xl md:rounded-3xl transition-all duration-300 ${
        isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 active:scale-95'
      }`}
      style={{
        background: isSelected && !isDisabled ? colorScheme.selectedBgGradient : 'rgba(255, 255, 255, 0.06)',
        border: isSelected && !isDisabled ? `2px solid ${colorScheme.borderColor}` : '2px solid rgba(220, 235, 245, 0.2)',
        boxShadow: isSelected && !isDisabled
          ? `${colorScheme.glow}, inset 0 0 20px rgba(200, 230, 245, 0.03)`
          : '0 0 15px rgba(180, 220, 240, 0.1), inset 0 0 20px rgba(200, 230, 245, 0.02)',
        ...(isDisabled && { filter: 'grayscale(0.5)', pointerEvents: 'none' }),
      }}
    >
      {/* Lock indicator */}
      {isDisabled && (
        <div className="absolute top-2 right-2 z-20 flex items-center justify-center rounded-full"
          style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.6) 0%, rgba(100, 116, 139, 0.4) 100%)', border: '2px solid rgba(148, 163, 184, 0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}

      {/* Checkmark indicator */}
      {isSelected && !isDisabled && (
        <div className="absolute top-2 right-2 z-20 flex items-center justify-center rounded-full"
          style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${colorScheme.accentColor} 0%, ${colorScheme.accentColor.replace('0.6', '0.4')} 100%)`, border: `2px solid ${colorScheme.borderColor}`, boxShadow: `0 0 12px ${colorScheme.accentColor}` }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="mb-3 sm:mb-4 flex justify-center items-center"
          style={{
            transform: isSelected && !isDisabled ? 'scale(1.1)' : 'scale(1)',
            filter: isSelected && !isDisabled ? `drop-shadow(0 0 8px ${colorScheme.accentColor})` : 'none',
            color: isDisabled ? 'rgba(148, 163, 184, 0.5)' : (isSelected ? colorScheme.accentColor : 'rgba(220, 235, 245, 0.8)'),
            transition: 'transform 0.2s, filter 0.2s',
          }}
        >
          <TopicIcon topic={topic} size={48} className="text-3xl sm:text-4xl" />
        </div>

        <div className="text-xs sm:text-sm font-tech font-semibold leading-tight mb-2"
          style={{
            color: isDisabled ? 'rgba(148, 163, 184, 0.6)' : (isSelected ? '#e8f4f8' : 'rgba(220, 235, 245, 0.8)'),
            textShadow: isSelected && !isDisabled ? `0 0 4px ${colorScheme.accentColor}` : '0 0 2px rgba(180, 220, 240, 0.2)',
          }}
        >
          {t(`topics.labels.${topic}`)}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center px-2 py-1 rounded-full border text-xs font-tech font-bold"
            style={{ background: 'rgba(220, 235, 245, 0.1)', borderColor: 'rgba(220, 235, 245, 0.2)', color: '#e8f4f8' }}
          >
            {t('profile.tabs.level')} {playerTopic?.level?.level || 1}
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-tech" style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
              {playerTopic?.level?.currentExperience || 0} / {playerTopic?.level?.experienceToNextLevel || 100}
            </div>
            <ExperienceProgressBar
              currentExp={playerTopic?.level?.currentExperience || 0}
              maxExp={playerTopic?.level?.experienceToNextLevel || 100}
              accentColor={colorScheme.accentColor}
              height="h-1.5"
            />
          </div>
        </div>
      </div>
    </button>
  );
});

const TopicsSection: React.FC<TopicsSectionProps> = ({ isAuthenticated, isFirstTime: isFirstTimeProp, onSave }) => {
  const fetchInitiatedRef = useRef(false);
  const [playerTopics, setPlayerTopics] = useState<PlayerTaskTopic[]>([]);
  const [originalTopics, setOriginalTopics] = useState<PlayerTaskTopic[]>([]);
  const [firstTime, setFirstTime] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { t } = useLocalization();

  // Map для O(1) поиска вместо find() на каждый рендер
  const playerTopicsMap = useMemo(() =>
    new Map(playerTopics.map(pt => [pt.taskTopic, pt])),
    [playerTopics]
  );

  const getIsDisabled = (topic: TaskTopic): boolean => DISABLED_TOPICS.has(topic);

  const applyTopics = useCallback((rawTopics: PlayerTaskTopic[]) => {
    const topicsWithDisabled = rawTopics.map(pt => ({
      ...pt,
      isDisabled: pt.isDisabled ?? getIsDisabled(pt.taskTopic),
    }));
    setPlayerTopics(topicsWithDisabled);
    setOriginalTopics(topicsWithDisabled);
    setFirstTime(topicsWithDisabled.filter(pt => pt.isActive).length === 0);
    setLoading(false);
    setTimeout(() => setContentLoaded(true), 50);
  }, []);

  // Fetch topics on mount — fetchInitiatedRef prevents double-fetch from React.StrictMode
  useEffect(() => {
    if (!isAuthenticated) {
      fetchInitiatedRef.current = false;
      setLoading(false);
      return;
    }
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;

    gqlSdk.GetPlayerTopics()
      .then(({ me }) => applyTopics(me.player.taskTopics.topics as unknown as PlayerTaskTopic[]))
      .catch((err) => {
        console.error('[TopicsSection] failed to load topics:', err);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Мемоизируем проверку изменений
  const hasChanges = useMemo(() => {
    const currentActiveTopics = playerTopics.filter(pt => pt.isActive);
    const originalActiveTopics = originalTopics.filter(pt => pt.isActive);
    if (currentActiveTopics.length !== originalActiveTopics.length) return true;
    return !currentActiveTopics.every((pt) =>
      originalActiveTopics.some(opt => opt.taskTopic === pt.taskTopic)
    );
  }, [playerTopics, originalTopics]);

  const canSave = useMemo(() => 
    playerTopics.some(pt => pt.isActive) && (firstTime || hasChanges),
    [playerTopics, firstTime, hasChanges]
  );

  const getTopicDisabled = useCallback((topic: TaskTopic): boolean => {
    const playerTopic = playerTopicsMap.get(topic);
    return playerTopic?.isDisabled ?? getIsDisabled(topic);
  }, [playerTopicsMap]);

  const handleToggle = useCallback((topic: TaskTopic) => {
    // Не позволяем переключать заблокированные топики
    if (getTopicDisabled(topic)) {
      return;
    }
    setPlayerTopics((prev) => {
      const existingTopic = prev.find(pt => pt.taskTopic === topic);
      if (existingTopic) {
        // Если топик уже есть, переключаем его активность
        return prev.map(pt =>
          pt.taskTopic === topic
            ? { ...pt, isActive: !pt.isActive }
            : pt
        );
      } else {
        // Если топика нет, добавляем его как активный с базовым уровнем
        // Устанавливаем isDisabled для определенных топиков
        const isDisabled = getIsDisabled(topic);
        return [...prev, {
          id: `temp-${topic}-${Date.now()}`,
          version: 1,
          taskTopic: topic,
          isActive: true,
          isDisabled: isDisabled,
          level: {
            id: `temp-level-${topic}-${Date.now()}`,
            version: 1,
            level: 1,
            totalExperience: 0,
            currentExperience: 0,
            experienceToNextLevel: 100,
            assessment: Assessment.E
          }
        }];
      }
    });
  }, [getTopicDisabled]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    // isFirstTimeProp (from activeTasks endpoint) is the authoritative source;
    // fall back to local firstTime (derived from topics) if prop not provided.
    const shouldGenerateTasks = isFirstTimeProp ?? firstTime;

    try {
      const changedTopics = playerTopics
        .filter(pt => {
          const originalTopic = originalTopics.find(opt => opt.taskTopic === pt.taskTopic);
          if (!originalTopic) return pt.isActive;
          return originalTopic.isActive !== pt.isActive;
        })
        .map(pt => ({
          ...pt,
          isDisabled: pt.isDisabled ?? getIsDisabled(pt.taskTopic),
        }));

      const topicsInput = changedTopics.map(pt => ({
        id: pt.id,
        isActive: pt.isActive,
        taskTopic: pt.taskTopic as any,
        version: pt.version,
      }));

      if (shouldGenerateTasks) {
        // Single request: save topics + generate tasks (server executes in order)
        if (topicsInput.length > 0) {
          await gqlSdk.SavePlayerTopicsAndGenerate({ topics: topicsInput });
        } else {
          await gqlSdk.GenerateTasks();
        }
      } else if (topicsInput.length > 0) {
        await gqlSdk.SavePlayerTopics({ topics: topicsInput });
      }

      if (shouldGenerateTasks) {
        onSave?.();
      }

      // Refresh topics local state after save
      const { me } = await gqlSdk.GetPlayerTopics();
      applyTopics(me.player.taskTopics.topics as unknown as PlayerTaskTopic[]);
    } catch (err) {
      console.error('[TopicsSection] Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [firstTime, isFirstTimeProp, onSave, playerTopics, originalTopics, applyTopics]);


  if (loading) {
    return <TopicsSectionSkeleton />;
  }

  return (
    <div
      style={{
        opacity: contentLoaded ? 1 : 0,
        transform: contentLoaded ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      }}
    >
      {/* Topics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {ALL_TOPICS.map((topic) => (
          <TopicCard
            key={topic}
            topic={topic}
            isSelected={playerTopicsMap.get(topic)?.isActive ?? false}
            isDisabled={getTopicDisabled(topic)}
            playerTopic={playerTopicsMap.get(topic)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Info section */}
      <div className={`flex justify-center ${(hasChanges || firstTime) && canSave ? 'mb-4 md:mb-6' : 'mb-8 md:mb-10'} mt-20 md:mt-24 ${(hasChanges || firstTime) && canSave ? '' : 'pb-24 md:pb-28'}`}>
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 max-w-2xl w-full"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(220, 235, 245, 0.2)',
            boxShadow: `
              0 0 20px rgba(180, 220, 240, 0.15),
              inset 0 0 20px rgba(200, 230, 245, 0.03)
            `
          }}
        >
          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10"
            style={{
              background: 'rgba(180, 216, 232, 0.8)'
            }}></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full blur-xl opacity-10"
            style={{
              background: 'rgba(200, 230, 245, 0.6)'
            }}></div>

          <div className="relative z-10">
            <div className="flex items-start">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.2) 0%, rgba(160, 210, 235, 0.1) 100%)',
                  border: '1px solid rgba(180, 220, 240, 0.3)',
                  boxShadow: '0 0 10px rgba(180, 220, 240, 0.2)'
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#e8f4f8' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-tech font-bold mb-2 text-lg"
                  style={{
                    color: '#e8f4f8',
                    textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
                  }}
                >
                  {firstTime ? t('topics.info.welcome.title') : t('topics.info.preferences.title')}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: 'rgba(220, 235, 245, 0.7)',
                    textShadow: '0 0 2px rgba(180, 220, 240, 0.1)'
                  }}
                >
                  {firstTime
                    ? t('topics.info.welcome.description')
                    : t('topics.info.preferences.description')
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Button */}
      {(hasChanges || firstTime) && canSave && (
        <div
          className="sticky bottom-0 left-0 right-0 z-50 px-4 md:px-6 pointer-events-none"
          style={{
            paddingTop: '0.5rem',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px) + 1rem)',
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
            marginTop: '-0.5rem'
          }}
        >
          <div className="flex justify-end">
            <div className="pointer-events-auto">
              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-tech font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(180, 220, 240, 1) 0%, rgba(160, 210, 235, 0.95) 100%)',
                  border: '2px solid rgba(180, 220, 240, 1)',
                  color: '#000000',
                  boxShadow: '0 0 35px rgba(180, 220, 240, 0.7), 0 0 70px rgba(180, 220, 240, 0.4), inset 0 0 25px rgba(180, 220, 240, 0.15)',
                  textShadow: '0 0 12px rgba(180, 220, 240, 0.6)',
                  minWidth: '160px',
                  width: 'auto'
                }}
              >
                {saving ? (
                  <>
                    <div
                      className="animate-spin w-3.5 h-3.5 md:w-4 md:h-4 border-2 rounded-full mr-2 flex-shrink-0"
                      style={{
                        borderColor: 'rgba(220, 235, 245, 0.2)',
                        borderTopColor: 'rgba(180, 220, 240, 0.6)'
                      }}
                    ></div>
                    <span className="whitespace-nowrap text-xs md:text-sm truncate">{t('topics.saving')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span className="whitespace-nowrap text-xs md:text-sm">{t('topics.save')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Skeleton component for TopicsSection
const TopicsSectionSkeleton: React.FC = () => {
  const allTopics = Object.values(TaskTopic);
  const backdropBlur = getOptimizedBlur('20px', '4px');

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {allTopics.map((topic) => (
          <div
            key={topic}
            className="relative p-4 sm:p-6 rounded-2xl md:rounded-3xl animate-pulse"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: `blur(${backdropBlur})`,
              border: '2px solid rgba(220, 235, 245, 0.2)',
              boxShadow: '0 0 15px rgba(180, 220, 240, 0.1), inset 0 0 20px rgba(200, 230, 245, 0.02)',
            }}
          >
            <div className="relative z-10 text-center">
              <div className="mb-3 sm:mb-4 flex justify-center items-center">
                <div
                  className="w-12 h-12 rounded-lg"
                  style={{
                    background: 'rgba(220, 235, 245, 0.1)'
                  }}
                ></div>
              </div>
              <div
                className="h-4 w-20 mx-auto mb-2 rounded"
                style={{
                  background: 'rgba(220, 235, 245, 0.1)'
                }}
              ></div>
              <div className="space-y-2">
                <div
                  className="inline-flex items-center px-2 py-1 rounded-full h-6 w-16 mx-auto"
                  style={{
                    background: 'rgba(220, 235, 245, 0.1)',
                    border: '1px solid rgba(220, 235, 245, 0.2)'
                  }}
                ></div>
                <div className="space-y-1">
                  <div
                    className="h-3 w-20 mx-auto rounded"
                    style={{
                      background: 'rgba(220, 235, 245, 0.1)'
                    }}
                  ></div>
                  <div
                    className="relative w-full rounded-full h-1.5 overflow-hidden"
                    style={{
                      background: 'rgba(220, 235, 245, 0.1)',
                      border: '1px solid rgba(220, 235, 245, 0.2)'
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full rounded-full w-1/2"
                      style={{
                        background: 'rgba(220, 235, 245, 0.1)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton нижней плашки (Preference Settings) — те же отступы что в обычной версии без кнопки Save */}
      <div className="flex justify-center mb-8 md:mb-10 mt-20 md:mt-24 pb-24 md:pb-28">
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 max-w-2xl w-full animate-pulse"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: `blur(${backdropBlur})`,
            border: '2px solid rgba(220, 235, 245, 0.2)',
            boxShadow: '0 0 20px rgba(180, 220, 240, 0.15), inset 0 0 20px rgba(200, 230, 245, 0.03)'
          }}
        >
          <div className="flex items-start">
            <div
              className="w-10 h-10 rounded-2xl flex-shrink-0 mr-4"
              style={{ background: 'rgba(220, 235, 245, 0.1)' }}
            />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 w-48 rounded" style={{ background: 'rgba(220, 235, 245, 0.1)' }} />
              <div className="h-4 w-full max-w-md rounded" style={{ background: 'rgba(220, 235, 245, 0.1)' }} />
              <div className="h-4 w-3/4 max-w-sm rounded" style={{ background: 'rgba(220, 235, 245, 0.1)' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Мемоизируем компонент для предотвращения лишних ре-рендеров
export default React.memo(TopicsSection);
