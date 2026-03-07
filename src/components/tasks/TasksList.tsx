import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { gqlSdk } from '../../graphql/client';
import Icon from '../common/Icon';
import type { PlayerTask, PlayerTaskStatus, LocalizedField, Stamina } from '../../graphql/generated';
import { OrderMode } from '../../graphql/generated';
import TasksGrid from './TasksGrid';
import TaskCardSkeleton from './TaskCardSkeleton';
import ScrollNavigationButtons from '../common/ScrollNavigationButtons';

interface TasksListProps {
  statusFilter: PlayerTaskStatus[];
  dateFilters?: { from: string; to: string };
  enumFilters?: {[field: string]: string[]};
  onFiltersUpdate?: (filters: LocalizedField[]) => void;
  onTaskClick?: (task: PlayerTask) => void;
  onComplete?: (task: PlayerTask) => void;
  onReplace?: (task: PlayerTask) => void;
  stamina?: Stamina | null;
  isTransitioning?: boolean;
}

const TasksList: React.FC<TasksListProps> = ({ 
  statusFilter,
  dateFilters: propDateFilters,
  enumFilters: propEnumFilters,
  onFiltersUpdate,
  onTaskClick,
  onComplete,
  onReplace,
  stamina,
  isTransitioning = false
}) => {
  const [tasks, setTasks] = useState<PlayerTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [showContent, setShowContent] = useState(false);
  
  // Используем переданные фильтры или значения по умолчанию
  const dateFilters = useMemo(() => propDateFilters || { from: '', to: '' }, [propDateFilters]);
  const enumFilters = useMemo(() => propEnumFilters || {}, [propEnumFilters]);
  const sorts = useMemo(() => [{ field: 'updatedAt', mode: OrderMode.DESC }], []);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);
  const loadTasksRef = useRef<typeof loadTasks | undefined>(undefined);
  const hasAttemptedLoadRef = useRef(false); // Флаг для отслеживания попытки загрузки
  
  const { t } = useLocalization();

  // Загрузка задач
  const loadTasks = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (isLoadingRef.current) return;
    
    // Дополнительная защита: не загружаем если данных больше нет
    if (!reset && !hasMoreRef.current) return;
    
    isLoadingRef.current = true;
    hasAttemptedLoadRef.current = true; // Отмечаем, что началась попытка загрузки
    
    if (reset) {
      setLoading(true);
      currentPageRef.current = 0;
    } else {
      setLoadingMore(true);
    }
    
    setError(null);

    try {
      // Объединяем фильтры статусов с переданными enum фильтрами
      const allEnumFilters = [];
      
      // Добавляем фильтр по статусам
      if (statusFilter.length > 0) {
        allEnumFilters.push({
          field: 'status',
          values: statusFilter.map(s => s.toString())
        });
      }
      
      // Добавляем переданные enum фильтры
      if (Object.keys(enumFilters).length > 0) {
        Object.entries(enumFilters).forEach(([field, values]) => {
          if (values.length > 0) {
            allEnumFilters.push({
              field,
              values: values
            });
          }
        });
      }
      
      const result = await gqlSdk.GetClosedTasks({
        paging: { page, pageSize: 20 },
        options: {
          filter: {
            dateFilters: dateFilters.from && dateFilters.to ? [{
              field: 'createdAt',
              range: { from: dateFilters.from, to: dateFilters.to },
            }] : undefined,
            enumFilters: allEnumFilters.length > 0 ? allEnumFilters : undefined,
          },
          sorts,
        },
      });

      const { tasks: newTasks, paging } = result.me.player.closedTasks;
      const hasMoreData = paging != null && paging.currentPage < paging.totalPageCount - 1;

      if (paging?.totalRowCount !== undefined) {
        setTotalCount(paging.totalRowCount);
      }
      
      if (reset) {
        setTasks(newTasks as unknown as PlayerTask[]);
        setHasMore(hasMoreData);
        currentPageRef.current = 0;
        hasMoreRef.current = hasMoreData;
        if (newTasks.length > 0) {
          setShowContent(false);
          setTimeout(() => setShowContent(true), 50);
        }
      } else {
        if (newTasks.length > 0) {
          setTasks(prev => [...prev, ...(newTasks as unknown as PlayerTask[])]);
          setHasMore(hasMoreData);
          currentPageRef.current = page;
          hasMoreRef.current = hasMoreData;
        } else {
          // Если новых данных нет, значит больше нет страниц
          setHasMore(false);
          hasMoreRef.current = false;
        }
      }
      
      
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(t('common.error.loadingData'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [statusFilter, dateFilters, enumFilters, sorts, t]);

  // Сохраняем актуальную версию функции в ref
  useEffect(() => {
    loadTasksRef.current = loadTasks;
  }, [loadTasks]);

  // Настройка Intersection Observer для бесконечного скролла
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Не создаем observer если данных больше нет или идет загрузка
    if (!hasMoreRef.current || loadingMore || isLoadingRef.current) {
      return;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMoreRef.current && !loadingMore && !isLoadingRef.current) {
        const nextPage = currentPageRef.current + 1;
        loadTasksRef.current?.(nextPage);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, { 
      threshold: 0,
      rootMargin: '200px' // Увеличиваем rootMargin для более раннего срабатывания
    });

    // Используем setTimeout чтобы убедиться, что элемент уже в DOM
    const timeoutId = setTimeout(() => {
      if (loadMoreRef.current && observerRef.current && hasMoreRef.current) {
        observerRef.current.observe(loadMoreRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, tasks.length]);

  // Загрузка при завершении перехода (когда isTransitioning меняется с true на false)
  useEffect(() => {
    if (!isTransitioning && tasks.length === 0 && !loading && !isLoadingRef.current) {
      // Если переход завершился, но данных еще нет, начинаем загрузку
      hasMoreRef.current = true;
      currentPageRef.current = 0;
      hasAttemptedLoadRef.current = false; // Сбрасываем флаг, чтобы показывать skeleton
      setShowContent(false); // Сбрасываем флаг для fade-in
      // Добавляем задержку, чтобы дать время анимации полностью завершиться
      const timeoutId = setTimeout(() => {
        if (!isTransitioning) { // Дополнительная проверка перед загрузкой
          loadTasks(0, true);
        }
      }, 100); // Задержка для плавности перехода
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransitioning]);

  // Устанавливаем showContent в true, если данные уже загружены и не идет загрузка
  useEffect(() => {
    if (tasks.length > 0 && !loading && !isTransitioning && !showContent) {
      setShowContent(true);
    }
  }, [tasks.length, loading, isTransitioning, showContent]);

  // Загрузка при монтировании и изменении фильтров
  useEffect(() => {
    // Не начинаем загрузку, если идет переход (анимация)
    if (isTransitioning) {
      return;
    }
    
    // Сбрасываем состояние перед загрузкой
    hasMoreRef.current = true;
    currentPageRef.current = 0;
    hasAttemptedLoadRef.current = false; // Сбрасываем флаг, чтобы показывать skeleton при новом поиске
    setShowContent(false); // Сбрасываем флаг для fade-in
    
    // Добавляем задержку, чтобы дать время анимации перехода завершиться
    // и избежать резкого переключения компонентов
    const timeoutId = setTimeout(() => {
      // Дополнительная проверка перед загрузкой
      if (!isTransitioning && !isLoadingRef.current) {
        loadTasks(0, true);
      }
    }, 200); // Увеличиваем задержку для более плавного перехода
    
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter.join(','), dateFilters.from, dateFilters.to, JSON.stringify(enumFilters)]);

  // Показываем skeleton во время первой загрузки или если загрузка еще не началась
  // Но не показываем во время перехода, чтобы избежать резкого наложения компонентов
  if (tasks.length === 0 && !hasAttemptedLoadRef.current && !isTransitioning) {
    // Показываем skeleton, если загрузка еще не началась
    return (
      <>
        {/* Skeleton для total количества */}
        <div className="mb-4">
          <div 
            className="h-5 w-32 rounded animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }
  
  if (loading && tasks.length === 0 && !isTransitioning) {
    // Показываем skeleton во время загрузки
    return (
      <>
        {/* Skeleton для total количества */}
        <div className="mb-4">
          <div 
            className="h-5 w-32 rounded animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }
  
  // Во время перехода показываем пустой контейнер, чтобы не было наложения
  if (isTransitioning && tasks.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6" style={{
        opacity: 0,
        minHeight: '200px'
      }}>
      </div>
    );
  }

  // Показываем ошибку
  if (error && tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div 
          className="text-lg font-tech font-semibold mb-2"
          style={{
            color: '#e8f4f8',
            textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
          }}
        >
          {error}
        </div>
        <button
          onClick={() => loadTasks(0, true)}
          className="px-6 py-3 rounded-xl font-tech font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            border: '2px solid rgba(220, 235, 245, 0.3)',
            color: '#e8f4f8',
            boxShadow: '0 0 15px rgba(180, 220, 240, 0.2)'
          }}
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  // Показываем пустое состояние только если загрузка была завершена и данных нет
  // Не показываем, если загрузка еще не начиналась (hasAttemptedLoadRef.current === false)
  if (tasks.length === 0 && !loading && hasAttemptedLoadRef.current && !error) {
    const hasActiveFilters =
      (dateFilters.from && dateFilters.to) ||
      Object.values(enumFilters).some((arr) => Array.isArray(arr) && arr.length > 0);
    const emptyDescription = hasActiveFilters ? t('tasks.noCompletedTasksByFilterDescription') : t('tasks.noCompletedTasksDescription');

    return (
      <div className="text-center py-12">
        <div 
          className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 mx-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '2px solid rgba(220, 235, 245, 0.2)',
            boxShadow: '0 0 20px rgba(180, 220, 240, 0.15)'
          }}
        >
          <div
            className="profile-icon-wrapper"
            style={{
              color: 'rgba(180, 220, 240, 0.9)',
              filter: 'drop-shadow(0 0 8px rgba(180, 220, 240, 0.6))'
            }}
          >
            <Icon type="check" size={32} />
          </div>
        </div>
        <h3 
          className="text-lg font-tech font-semibold mb-2"
          style={{
            color: '#e8f4f8',
            textShadow: '0 0 8px rgba(180, 220, 240, 0.3)'
          }}
        >
          {t('tasks.noCompletedTasks')}
        </h3>
        <p 
          className="text-sm font-tech"
          style={{
            color: 'rgba(220, 235, 245, 0.7)'
          }}
        >
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Отображение общего количества */}
      {(loading || totalCount === null) && tasks.length === 0 ? (
        <div className="mb-4">
          <div 
            className="h-5 w-32 rounded animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          />
        </div>
      ) : totalCount !== null && tasks.length > 0 ? (
        <div 
          className="mb-4 text-sm font-tech"
          style={{ 
            color: 'rgba(220, 235, 245, 0.7)',
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
          }}
        >
          {t('common.totalItems', { total: totalCount.toString() })}
        </div>
      ) : null}
      
      <div 
        key={`tasks-${tasks.length}-${loading}`}
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          isolation: 'isolate',
        }}
      >
        <TasksGrid
          tasks={tasks}
          stamina={stamina || null}
          loading={false}
          onTaskClick={onTaskClick || (() => {})}
          onComplete={onComplete}
          onReplace={onReplace}
          preserveOrder
        />
      </div>
      
      {/* Индикатор загрузки для дополнительных задач */}
      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      )}
      
      {/* Элемент для отслеживания Intersection Observer */}
      {hasMoreRef.current && !loadingMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="text-xs font-tech" style={{ color: 'rgba(220, 235, 245, 0.5)' }}>
            {t('common.loading')}
          </div>
        </div>
      )}

      {/* Scroll Navigation Buttons */}
      <ScrollNavigationButtons isLoadingMore={loadingMore} />
    </>
  );
};

export default React.memo(TasksList);
