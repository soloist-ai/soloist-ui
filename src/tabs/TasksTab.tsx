import React, { useState, useEffect, useCallback, useRef, startTransition } from 'react';
import type { PlayerTask, Stamina } from '../graphql/generated';
import { gqlSdk } from '../graphql/client';
import { useLocalization } from '../hooks/useLocalization';
import { useTasksRefresh } from '../hooks/useTasksRefresh';
import TasksSection from '../components/tasks/TasksSection';
import TopicsSection from '../components/tasks/TopicsSection';
import TaskCardSkeleton from '../components/tasks/TaskCardSkeleton';
import Icon from '../components/common/Icon';
import StaminaIndicator from '../components/tasks/StaminaIndicator';
import StaminaIndicatorSkeleton from '../components/tasks/StaminaIndicatorSkeleton';

type TasksTabProps = {
  isAuthenticated: boolean;
};

type TabViewMode = 'tasks' | 'topics';
type TaskViewMode = 'active' | 'completed' | 'daily';

const TasksTab: React.FC<TasksTabProps> = ({ isAuthenticated }) => {
  const [tasks, setTasks] = useState<PlayerTask[]>([]);
  const [stamina, setStamina] = useState<Stamina | null>(null);
  const [firstTime, setFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabMode, setTabMode] = useState<TabViewMode>('tasks');
  const [displayTabMode, setDisplayTabMode] = useState<TabViewMode>('tasks');
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState<TaskViewMode>('active');
  const [displayTaskViewMode, setDisplayTaskViewMode] = useState<TaskViewMode>('active');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [activeViewLoading, setActiveViewLoading] = useState(false);
  const hasLoadedRef = useRef(false);
  const scrollPositionRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const contentHeightRef = useRef<number>(0);
  const contentContainerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLocalization();

  // Fetch tasks + stamina, update local state
  const fetchAndUpdateTasks = useCallback(async () => {
    const { me: res } = await gqlSdk.RefreshActiveTasks();
    const { activeTasks, stamina: s } = res.player;
    setTasks(activeTasks.tasks);
    setStamina(s);
    setFirstTime(activeTasks.isFirstTime);
    setLoading(false);
    return { tasks: activeTasks.tasks, stamina: s, isFirstTime: activeTasks.isFirstTime };
  }, []);

  // Функция для обновления списка задач и стамины
  const handleTasksUpdate = useCallback((newTasks: PlayerTask[], newStamina?: Stamina, newFirstTime?: boolean) => {
    setTasks(newTasks);
    if (newStamina) {
      setStamina(newStamina);
    }
    if (newFirstTime !== undefined) {
      setFirstTime(newFirstTime);
    }
    // Если задачи появились, значит firstTime стал false
    if (newTasks.length > 0) {
      setFirstTime(false);
    }
    setLoading(false);
  }, []);

  // Используем хук для автоматического обновления задач при уведомлениях
  useTasksRefresh({
    isAuthenticated,
    onTasksUpdate: handleTasksUpdate,
  });

  // Initial load — fetch tasks on tab mount
  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchAndUpdateTasks()
        .then(({ isFirstTime }) => {
          if (isFirstTime) {
            setTabMode('topics');
            setDisplayTabMode('topics');
          }
          setTimeout(() => setContentLoaded(true), 50);
        })
        .catch((err) => {
          console.error('[TasksTab] initial load failed:', err);
          setLoading(false);
          setTimeout(() => setContentLoaded(true), 50);
        });
    } else if (!isAuthenticated) {
      setLoading(false);
      setContentLoaded(true);
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated, fetchAndUpdateTasks]);

  // Синхронизация стамины с бэкендом каждую минуту, пока открыт таб (без перезагрузки списка задач)
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncStamina = () => {
      gqlSdk.RefreshActiveTasks()
        .then(({ me: res }) => {
          if (res.player.stamina) setStamina(res.player.stamina);
        })
        .catch(() => { /* тихо игнорируем ошибки синка */ });
    };

    const intervalId = setInterval(syncStamina, 60_000);
    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  // Обработчик переключения на топики
  const handleGoToTopics = useCallback(() => {
    if (tabMode !== 'topics') {
      setIsTabTransitioning(true);
      setTimeout(() => {
        startTransition(() => {
          setTabMode('topics');
          setDisplayTabMode('topics');
        });
        setTimeout(() => setIsTabTransitioning(false), 50);
      }, 180);
    }
  }, [tabMode]);

  // Обработчик возврата к задачам
  const handleBackToTasks = useCallback(() => {
    if (tabMode !== 'tasks') {
      setIsTabTransitioning(true);
      setTimeout(() => {
        startTransition(() => {
          setTabMode('tasks');
          setDisplayTabMode('tasks');
        });
        setTimeout(() => setIsTabTransitioning(false), 50);
      }, 180);
    }
  }, [tabMode]);

  // Обработчик сохранения топиков (переключаемся обратно на активные задачи)
  const handleTopicsSave = useCallback(() => {
    setIsTabTransitioning(true);
    setTimeout(() => {
      setTabMode('tasks');
      setTaskViewMode('active');
      setDisplayTaskViewMode('active');
      // Reload tasks after topics save
      if (isAuthenticated) {
        fetchAndUpdateTasks()
          .catch((error) => {
            console.error('Error refreshing tasks after topics save:', error);
          })
          .finally(() => {
            setDisplayTabMode('tasks');
            setTimeout(() => setIsTabTransitioning(false), 50);
          });
      } else {
        setDisplayTabMode('tasks');
        setTimeout(() => setIsTabTransitioning(false), 50);
      }
    }, 220);
  }, [isAuthenticated, fetchAndUpdateTasks]);

  // Полностраничный skeleton только при первом открытии таба (loading = true только в начальном useEffect)
  if (loading && tabMode === 'tasks') {
    return (
      <div 
        className="tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden"
        style={{ 
          boxSizing: 'border-box'
        }}
      >
        <div className="tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 pb-24">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="h-8 md:h-10 rounded-lg w-48 sm:w-64 mx-auto mb-3 animate-pulse" style={{
                  background: 'rgba(220, 235, 245, 0.1)'
                }}></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 rounded-lg w-full max-w-2xl mx-auto animate-pulse" style={{
                    background: 'rgba(220, 235, 245, 0.1)'
                  }}></div>
                  <div className="h-4 rounded-lg w-3/4 max-w-xl mx-auto animate-pulse" style={{
                    background: 'rgba(220, 235, 245, 0.1)'
                  }}></div>
                </div>
                <div className="w-24 sm:w-32 md:w-40 h-1 rounded-full mx-auto animate-pulse" style={{
                  background: 'rgba(180, 220, 240, 0.6)',
                  boxShadow: '0 0 8px rgba(180, 220, 240, 0.4)'
                }}></div>
              </div>

              {/* Main Navigation skeleton */}
              <div className="flex justify-center mb-6">
                <div 
                  className="inline-flex rounded-full p-1"
                  style={{
                    background: 'rgba(220, 235, 245, 0.08)',
                    border: '1px solid rgba(220, 235, 245, 0.12)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="inline-flex gap-2">
                    <div className="px-5 md:px-7 py-2 rounded-full animate-pulse" style={{
                      background: 'rgba(220, 235, 245, 0.15)',
                      width: '120px'
                    }}></div>
                    <div className="px-5 md:px-7 py-2 rounded-full animate-pulse" style={{
                      background: 'rgba(220, 235, 245, 0.1)',
                      width: '120px'
                    }}></div>
                  </div>
                </div>
              </div>

              {/* Task View Mode Toggle skeleton */}
              <div className="flex justify-center mb-6">
                <div
                  className="inline-flex rounded-full p-1"
                  style={{
                    background: 'rgba(220, 235, 245, 0.08)',
                    border: '1px solid rgba(220, 235, 245, 0.12)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="inline-flex gap-2">
                    <div className="px-6 md:px-8 py-2.5 md:py-3 rounded-full animate-pulse" style={{
                      background: 'rgba(220, 235, 245, 0.15)',
                      width: '100px'
                    }}></div>
                    <div className="px-6 md:px-8 py-2.5 md:py-3 rounded-full animate-pulse" style={{
                      background: 'rgba(220, 235, 245, 0.1)',
                      width: '120px'
                    }}></div>
                  </div>
                </div>
              </div>

              {/* Stamina Indicator skeleton */}
              <div className="flex justify-center mb-6 px-4">
                <div className="w-full max-w-md">
                  <StaminaIndicatorSkeleton />
                </div>
              </div>
            </div>

            {/* Tasks grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden ${contentLoaded ? 'tab-content-enter-active' : ''}`}
      style={{ 
        boxSizing: 'border-box',
        opacity: contentLoaded ? 1 : 0,
        transform: contentLoaded ? 'translateY(0)' : 'translateY(10px)',
        transition: contentLoaded ? 'opacity 0.4s ease-out, transform 0.4s ease-out' : 'none',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className={`tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 ${displayTabMode === 'topics' ? '' : 'pb-24'}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-tech font-bold mb-3 tracking-tight"
                style={{
                  color: '#e8f4f8',
                  textShadow: '0 0 8px rgba(180, 220, 240, 0.3)'
                }}
              >
                {t('tasks.title')}
              </h1>

              <p 
                className="mb-6 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto px-4"
                style={{
                  color: 'rgba(220, 235, 245, 0.7)'
                }}
              >
                {t('tasks.subtitle')}
              </p>

              {/* Divider */}
              <div
                className="w-24 sm:w-32 md:w-40 h-1 rounded-full mx-auto mb-6"
                style={{
                  background: 'rgba(180, 220, 240, 0.6)',
                  boxShadow: '0 0 8px rgba(180, 220, 240, 0.4)'
                }}
              ></div>
            </div>

            {/* Main Navigation - Minimal iOS Segmented Control Style */}
            <div className={`flex justify-center ${firstTime ? 'mb-4' : 'mb-6'}`}>
              <div 
                className="inline-flex rounded-full p-1"
                style={{
                  background: 'rgba(220, 235, 245, 0.08)',
                  border: '1px solid rgba(220, 235, 245, 0.12)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <button
                  onClick={handleBackToTasks}
                  className={`relative px-5 md:px-7 py-2 rounded-full font-tech font-medium text-sm md:text-base transition-all duration-200 flex items-center gap-2 ${
                    tabMode === 'tasks' ? '' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={tabMode === 'tasks' ? {
                    background: 'rgba(220, 235, 245, 0.15)',
                    color: '#e8f4f8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  } : {
                    background: 'transparent',
                    color: 'rgba(220, 235, 245, 0.7)'
                  }}
                >
                  <Icon 
                    type="clipboard" 
                    size={16}
                  />
                  <span>{t('navigation.tasks')}</span>
                </button>
                <button
                  onClick={handleGoToTopics}
                  className={`relative px-5 md:px-7 py-2 rounded-full font-tech font-medium text-sm md:text-base transition-all duration-200 flex items-center gap-2 ${
                    tabMode === 'topics' ? '' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={tabMode === 'topics' ? {
                    background: 'rgba(220, 235, 245, 0.15)',
                    color: '#e8f4f8',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  } : {
                    background: 'transparent',
                    color: 'rgba(220, 235, 245, 0.7)'
                  }}
                >
                  <Icon 
                    type="target" 
                    size={16}
                  />
                  <span>{t('navigation.topics')}</span>
                </button>
              </div>
            </div>

            {/* Task View Mode Toggle — только когда уже на задачах; не показывать при переходе topics->tasks, чтобы не сдвигать топики вниз */}
            {displayTabMode === 'tasks' && !firstTime && (
              <div
                className="flex justify-center mb-6 overflow-x-auto px-4 md:px-8"
                style={{
                  opacity: isTabTransitioning ? 0 : 1,
                  transform: isTabTransitioning ? 'translateY(12px)' : 'translateY(0)',
                  transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div
                  className="inline-flex rounded-full p-1 flex-nowrap gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4"
                  style={{
                    background: 'rgba(220, 235, 245, 0.08)',
                    border: '1px solid rgba(220, 235, 245, 0.12)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                    {/* 1 - Ежедневные; уходим с активных — не храним их в состоянии */}
                    <button
                      onClick={() => {
                        if (taskViewMode !== 'daily') {
                          if (taskViewMode === 'active') {
                            setTasks([]);
                          }
                          const scrollContainer = document.querySelector('.fixed.inset-0.overflow-y-auto') as HTMLElement;
                          scrollContainerRef.current = scrollContainer;
                          if (scrollContainer) {
                            scrollPositionRef.current = scrollContainer.scrollTop;
                          } else {
                            scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                          }
                          if (contentContainerRef.current) {
                            contentHeightRef.current = contentContainerRef.current.scrollHeight;
                          }
                          setIsTransitioning(true);
                          requestAnimationFrame(() => {
                            setTimeout(() => {
                              setTaskViewMode('daily');
                              setTimeout(() => {
                                setDisplayTaskViewMode('daily');
                                setTimeout(() => {
                                  setIsTransitioning(false);
                                  requestAnimationFrame(() => { contentHeightRef.current = 0; });
                                  requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                      setTimeout(() => {
                                        if (scrollContainerRef.current) {
                                          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
                                        } else {
                                          window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' });
                                        }
                                      }, 100);
                                    });
                                  });
                                }, 50);
                              }, 150);
                            }, 50);
                          });
                        }
                      }}
                      className={`flex-shrink-0 px-3 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-full font-tech font-semibold text-xs md:text-base transition-all duration-150 ease-in-out ${
                        taskViewMode === 'daily' ? '' : 'opacity-50 hover:opacity-70'
                      }`}
                      style={taskViewMode === 'daily' ? {
                        background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.25) 0%, rgba(160, 210, 235, 0.15) 100%)',
                        border: '2px solid rgba(180, 220, 240, 0.4)',
                        color: '#e8f4f8',
                        boxShadow: '0 0 20px rgba(180, 220, 240, 0.3), inset 0 0 20px rgba(200, 230, 245, 0.05)',
                        textShadow: '0 0 4px rgba(180, 220, 240, 0.3)',
                        backdropFilter: 'blur(20px)'
                      } : {
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '2px solid rgba(220, 235, 245, 0.2)',
                        color: 'rgba(220, 235, 245, 0.6)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {t('tasks.viewMode.daily')}
                    </button>
                    {/* 2 - Активные: переключение как у завершённых, скелетон + запрос в фоне, плавное появление */}
                    <button
                      onClick={() => {
                        if (taskViewMode !== 'active') {
                          const scrollContainer = document.querySelector('.fixed.inset-0.overflow-y-auto') as HTMLElement;
                          scrollContainerRef.current = scrollContainer;
                          if (scrollContainer) {
                            scrollPositionRef.current = scrollContainer.scrollTop;
                          } else {
                            scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                          }
                          if (contentContainerRef.current) {
                            contentHeightRef.current = contentContainerRef.current.scrollHeight;
                          }
                          setIsTransitioning(true);
                          setActiveViewLoading(true);
                          fetchAndUpdateTasks()
                            .catch((err) => {
                              console.error('Error fetching active tasks:', err);
                              setTasks([]);
                            })
                            .finally(() => {
                              setActiveViewLoading(false);
                            });
                          requestAnimationFrame(() => {
                            setTimeout(() => {
                              setTaskViewMode('active');
                              setTimeout(() => {
                                setDisplayTaskViewMode('active');
                                setTimeout(() => {
                                  setIsTransitioning(false);
                                  requestAnimationFrame(() => { contentHeightRef.current = 0; });
                                  requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                      setTimeout(() => {
                                        if (scrollContainerRef.current) {
                                          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
                                        } else {
                                          window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' });
                                        }
                                      }, 100);
                                    });
                                  });
                                }, 50);
                              }, 150);
                            }, 50);
                          });
                        }
                      }}
                      className={`flex-shrink-0 px-3 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-full font-tech font-semibold text-xs md:text-base transition-all duration-150 ease-in-out ${
                        taskViewMode === 'active' ? '' : 'opacity-50 hover:opacity-70'
                      }`}
                      style={taskViewMode === 'active' ? {
                        background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.25) 0%, rgba(160, 210, 235, 0.15) 100%)',
                        border: '2px solid rgba(180, 220, 240, 0.4)',
                        color: '#e8f4f8',
                        boxShadow: '0 0 20px rgba(180, 220, 240, 0.3), inset 0 0 20px rgba(200, 230, 245, 0.05)',
                        textShadow: '0 0 4px rgba(180, 220, 240, 0.3)',
                        backdropFilter: 'blur(20px)'
                      } : {
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '2px solid rgba(220, 235, 245, 0.2)',
                        color: 'rgba(220, 235, 245, 0.6)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {t('tasks.viewMode.active')}
                    </button>
                    {/* 3 - Завершенные; уходим с активных — не храним их в состоянии */}
                    <button
                      onClick={() => {
                        if (taskViewMode !== 'completed') {
                          if (taskViewMode === 'active') {
                            setTasks([]);
                          }
                          const scrollContainer = document.querySelector('.fixed.inset-0.overflow-y-auto') as HTMLElement;
                          scrollContainerRef.current = scrollContainer;
                          if (scrollContainer) {
                            scrollPositionRef.current = scrollContainer.scrollTop;
                          } else {
                            scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                          }
                          if (contentContainerRef.current) {
                            contentHeightRef.current = contentContainerRef.current.scrollHeight;
                          }
                          setIsTransitioning(true);
                          requestAnimationFrame(() => {
                            setTimeout(() => {
                              setTaskViewMode('completed');
                              setTimeout(() => {
                                setDisplayTaskViewMode('completed');
                                setTimeout(() => {
                                  setIsTransitioning(false);
                                  requestAnimationFrame(() => { contentHeightRef.current = 0; });
                                  requestAnimationFrame(() => {
                                    requestAnimationFrame(() => {
                                      setTimeout(() => {
                                        if (scrollContainerRef.current) {
                                          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
                                        } else {
                                          window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' });
                                        }
                                      }, 100);
                                    });
                                  });
                                }, 50);
                              }, 150);
                            }, 50);
                          });
                        }
                      }}
                      className={`flex-shrink-0 px-3 sm:px-5 md:px-8 py-2.5 md:py-3 rounded-full font-tech font-semibold text-xs md:text-base transition-all duration-150 ease-in-out ${
                        taskViewMode === 'completed' ? '' : 'opacity-50 hover:opacity-70'
                      }`}
                      style={taskViewMode === 'completed' ? {
                        background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.25) 0%, rgba(160, 210, 235, 0.15) 100%)',
                        border: '2px solid rgba(180, 220, 240, 0.4)',
                        color: '#e8f4f8',
                        boxShadow: '0 0 20px rgba(180, 220, 240, 0.3), inset 0 0 20px rgba(200, 230, 245, 0.05)',
                        textShadow: '0 0 4px rgba(180, 220, 240, 0.3)',
                        backdropFilter: 'blur(20px)'
                      } : {
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '2px solid rgba(220, 235, 245, 0.2)',
                        color: 'rgba(220, 235, 245, 0.6)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {t('tasks.viewMode.completed')}
                    </button>
                </div>
              </div>
            )}

            {/* Stamina Indicator - только когда уже на задачах; не показывать при переходе topics->tasks, чтобы не сдвигать топики вниз */}
            {displayTabMode === 'tasks' && !firstTime && displayTaskViewMode === 'active' && (
              <div
                style={{
                  opacity: (isTransitioning || isTabTransitioning) ? 0 : 1,
                  transform: (isTransitioning || isTabTransitioning) ? 'translateY(12px)' : 'translateY(0)',
                  transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {(loading || activeViewLoading) ? (
                  <div className="mb-6 md:flex md:justify-center">
                    <div className="w-full max-w-md mx-auto md:mx-0">
                      <StaminaIndicatorSkeleton />
                    </div>
                  </div>
                ) : stamina ? (
                  <div className="mb-6 md:flex md:justify-center">
                    <div className="w-full max-w-md mx-auto md:mx-0">
                      <StaminaIndicator 
                        stamina={stamina} 
                        onStaminaUpdate={(updatedStamina) => {
                          setStamina(updatedStamina);
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Content based on view mode */}
          <div
            style={{
              opacity: isTabTransitioning ? 0 : 1,
              transform: isTabTransitioning ? 'translateY(12px)' : 'translateY(0)',
              transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {displayTabMode === 'topics' ? (
              <TopicsSection
                isAuthenticated={isAuthenticated}
                onSave={handleTopicsSave}
              />
            ) : (
              <div
                ref={contentContainerRef}
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
                  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                  willChange: isTransitioning ? 'opacity, transform' : 'auto',
                  isolation: 'isolate',
                  minHeight: isTransitioning && contentHeightRef.current > 0 
                    ? `${contentHeightRef.current}px` 
                    : 'auto'
                }}
              >
                <TasksSection
                  tasks={tasks}
                  stamina={stamina}
                  loading={loading}
                  activeViewLoading={activeViewLoading}
                  firstTime={firstTime}
                  onTasksUpdate={handleTasksUpdate}
                  onGoToTopics={handleGoToTopics}
                  initialViewMode={displayTaskViewMode}
                  isTransitioning={isTransitioning}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksTab; 