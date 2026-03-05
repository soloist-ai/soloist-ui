import React, { useMemo } from 'react';
import type { PlayerTask, Stamina } from '../api';
import { PlayerTaskStatus } from '../api';
import TopicIcon from './TopicIcons';
import RarityIndicator from './RarityIndicator';
import Icon from './Icon';
import { useLocalization } from '../hooks/useLocalization';
import { getMonthGenitive } from '../utils';
import { getTaskStaminaCost, SKIP_STAMINA_COST } from '../utils/taskUtils';

type TaskCardProps = {
  playerTask: PlayerTask;
  stamina: Stamina | null;
  onClick: () => void;
  onComplete?: () => void;
  onReplace?: () => void;
  index?: number;
};

const getStatusColorScheme = (status: PlayerTaskStatus) => {
    switch (status) {
      case PlayerTaskStatus.PREPARING:
        return {
          bg: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.12)',
          accentColor: 'rgba(220, 235, 245, 0.3)',
          textColor: '#f4f4f5',
        };
      case PlayerTaskStatus.IN_PROGRESS:
        return {
          bg: 'rgba(255, 255, 255, 0.07)',
          border: 'rgba(255, 255, 255, 0.18)',
          accentColor: 'rgba(180, 220, 240, 0.4)',
          textColor: '#f4f4f5',
        };
      case PlayerTaskStatus.COMPLETED:
        return {
          bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
          border: 'rgba(34, 197, 94, 0.3)',
          accentColor: 'rgba(34, 197, 94, 0.5)',
          textColor: 'rgba(255, 255, 255, 0.65)',
        };
      case PlayerTaskStatus.SKIPPED:
        return {
          bg: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%)',
          border: 'rgba(220, 38, 38, 0.3)',
          accentColor: 'rgba(220, 38, 38, 0.5)',
          textColor: 'rgba(255, 255, 255, 0.65)',
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.12)',
          accentColor: 'rgba(220, 235, 245, 0.3)',
          textColor: '#f4f4f5',
        };
    }
  };

const TaskCard: React.FC<TaskCardProps> = ({ playerTask, stamina, onClick, onComplete, onReplace, index = 0 }) => {
  const { task, status } = playerTask;
  
  // Проверка возможности выполнения задачи
  const canComplete = useMemo(() => {
    if (!stamina || !task?.rarity) return true;
    const cost = getTaskStaminaCost(task.rarity);
    return stamina.current >= cost;
  }, [stamina, task?.rarity]);
  
  // Проверка возможности скипа задачи
  const canSkip = useMemo(() => {
    if (!stamina) return true;
    return stamina.current >= SKIP_STAMINA_COST;
  }, [stamina]);
  
  // Стоимость выполнения задачи
  const completeCost = useMemo(() => {
    if (!task?.rarity) return 0;
    return getTaskStaminaCost(task.rarity);
  }, [task?.rarity]);
  
  const { t, currentLanguage } = useLocalization();
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Форматирование даты завершения задачи
  const formatTaskDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Сегодня
    if (taskDate.getTime() === today.getTime()) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${t('common.today')}, ${hours}:${minutes}`;
    }
    
    // Вчера
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (taskDate.getTime() === yesterday.getTime()) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${t('common.yesterday')}, ${hours}:${minutes}`;
    }
    
    // Форматируем дату
    const day = date.getDate();
    const monthName = getMonthGenitive(date.getMonth(), t, currentLanguage || 'ru');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const year = date.getFullYear();
    const currentYear = now.getFullYear();
    
    if (year === currentYear) {
      return `${day} ${monthName}, ${hours}:${minutes}`;
    }
    
    return `${day} ${monthName} ${year}, ${hours}:${minutes}`;
  };
  
  // Отслеживаем переход из PREPARING в IN_PROGRESS (только при смене статуса, не при первом монтировании)
  const prevStatusRef = React.useRef(status);
  React.useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prevStatus !== PlayerTaskStatus.IN_PROGRESS && status === PlayerTaskStatus.IN_PROGRESS) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 600);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Мемоизируем цветовую схему
  const colorScheme = useMemo(() => getStatusColorScheme(status || PlayerTaskStatus.IN_PROGRESS), [status]);

  // Мемоизируем стили для карточки
  const cardStyle = useMemo(() => ({
    background: colorScheme.bg,
    border: `2px solid ${colorScheme.border}`,
    borderRadius: '24px',
    boxShadow: status === PlayerTaskStatus.COMPLETED
      ? `0 0 12px rgba(34, 197, 94, 0.2)`
      : status === PlayerTaskStatus.SKIPPED
      ? `0 0 12px rgba(220, 38, 38, 0.2)`
      : `0 0 12px rgba(180, 220, 240, 0.15)`,
  }), [colorScheme, status]);
  
  // Мемоизируем стили для текста
  const titleStyle = useMemo(() => ({
    color: colorScheme.textColor,
    textShadow: status === PlayerTaskStatus.COMPLETED
      ? '0 0 4px rgba(34, 197, 94, 0.2)'
      : status === PlayerTaskStatus.SKIPPED
      ? '0 0 4px rgba(220, 38, 38, 0.2)'
      : '0 0 4px rgba(180, 220, 240, 0.2)'
  }), [colorScheme.textColor, status]);

  // Вычисляем ширину индикатора редкости на основе количества звезд
  const getRarityIndicatorWidth = (rarity: string): number => {
    const getStarCount = (rarity: string): number => {
      switch (rarity) {
        case 'COMMON': return 1;
        case 'UNCOMMON': return 2;
        case 'RARE': return 3;
        case 'EPIC': return 4;
        case 'LEGENDARY': return 5;
        default: return 1;
      }
    };
    
    const starCount = getStarCount(rarity);
    const starSize = 20; // размер звезды для 'sm' размера
    const gap = 2; // gap-0.5 в Tailwind = 2px
    const rightPadding = 16; // right-4 = 1rem = 16px
    
    // Ширина = (количество звезд * размер звезды) + (количество промежутков * размер промежутка) + отступ справа
    const width = (starCount * starSize) + ((starCount - 1) * gap) + rightPadding;
    return width;
  };

  const rarityIndicatorWidth = useMemo(() => 
    getRarityIndicatorWidth(task?.rarity || 'COMMON'), 
    [task?.rarity]
  );

  if (status === PlayerTaskStatus.PREPARING) {
    return (
      <div 
        className="group relative overflow-hidden cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.02]"
        onClick={onClick}
        style={{
          background: colorScheme.bg,
          border: `2px solid ${colorScheme.border}`,
          borderRadius: '24px',
          boxShadow: `0 0 12px rgba(180, 220, 240, 0.15)`,
        }}
      >
        {/* Glowing orbs */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-xl opacity-10 animate-float" style={{
          background: 'rgba(180, 216, 232, 0.8)'
        }}></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-lg opacity-10 animate-float-delayed" style={{
          background: 'rgba(200, 230, 245, 0.6)'
        }}></div>
        
        <div className="relative z-10 p-6 h-[280px] flex flex-col justify-center items-center text-center">
          {/* Elegant skeleton with shimmer */}
          <div 
            className="w-4/5 h-7 rounded-xl mb-4 animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          ></div>
          <div 
            className="w-full h-5 rounded-lg mb-3 animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          ></div>
          <div 
            className="w-3/4 h-5 rounded-lg mb-8 animate-pulse"
            style={{
              background: 'rgba(220, 235, 245, 0.1)'
            }}
          ></div>
          
          {/* Modern loading indicator */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div 
                className="w-12 h-12 border-4 rounded-full animate-spin"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  borderTopColor: 'rgba(180, 220, 240, 0.6)'
                }}
              ></div>
              <div 
                className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-spin-reverse"
                style={{
                  borderRightColor: 'rgba(200, 230, 245, 0.4)'
                }}
              ></div>
            </div>
            <span 
              className="font-tech font-medium tracking-wide"
              style={{
                color: 'rgba(220, 235, 245, 0.7)'
              }}
            >
              {t('taskCard.generating')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative overflow-hidden cursor-pointer transition-transform duration-500 ease-out hover:scale-[1.02] h-full flex flex-col ${isTransitioning ? 'task-status-transition' : ''}`}
      onClick={onClick}
      key={`${playerTask.id}-${status}`}
      style={cardStyle}
    >
      {/* Simplified - removed heavy animated effects for performance */}


      {/* Rarity indicator */}
      <div className="absolute top-4 right-4 z-20">
        <RarityIndicator 
          rarity={task?.rarity || 'COMMON'} 
          size="sm"
        />
      </div>

      <div className="relative z-10 p-6 min-h-[280px] h-full flex flex-col">
        {/* Header section with proper spacing */}
        <div className="mb-6 flex-grow">
          {/* Title with smart padding - only first 2 lines have right padding */}
          <div className="mb-3" style={{ position: 'relative' }}>
            {/* Floating element that creates space only for first 2 lines */}
            <div 
              style={{
                float: 'right',
                width: `${rarityIndicatorWidth}px`,
                height: 'calc(1.25rem * 2.5)',
                shapeOutside: 'inset(0)',
              }}
            ></div>
            <h3 
              className="text-xl font-tech font-bold leading-tight tracking-tight" 
              data-text="true"
              style={{
                ...titleStyle,
                wordBreak: 'break-word',
              }}
            >
              {task?.title || ''}
            </h3>
            <div style={{ clear: 'both' }}></div>
          </div>
          <p 
            className="leading-relaxed line-clamp-3 text-sm font-medium" 
            data-text="true"
            style={{
              color: colorScheme.textColor
            }}
          >
            {task?.description || ''}
          </p>
        </div>

        {/* Topics with modern pill design — без backdrop-blur для стабильного отображения при анимации */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(task?.topics || []).slice(0, 2).map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-tech font-semibold tracking-wide border"
              style={{
                background: 'rgba(220, 235, 245, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f4f4f5',
              }}
            >
              <TopicIcon topic={topic} size={16} className="mr-1.5 text-sm" />
              <span data-text="true">{t(`topics.labels.${topic}`)}</span>
            </span>
          ))}
          {(task?.topics || []).length > 2 && (
            <span 
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-tech font-semibold tracking-wide border"
              style={{
                background: 'rgba(220, 235, 245, 0.08)',
                border: '1px solid rgba(220, 235, 245, 0.15)',
                color: 'rgba(220, 235, 245, 0.6)',
              }}
            >
              <span data-text="true">+{(task?.topics || []).length - 2}</span>
            </span>
          )}
        </div>

        {/* Fixed bottom section with status bar and buttons */}
        <div className="mt-auto pt-4">
          {/* Status indicator as full-width light bar */}
          <div 
            className="h-1 w-full rounded-full mb-4"
            style={{
              background: colorScheme.accentColor,
              boxShadow: `0 0 8px ${colorScheme.accentColor}`
            }}
          ></div>

          {/* Completion date for completed/skipped tasks */}
          {(status === PlayerTaskStatus.COMPLETED || status === PlayerTaskStatus.SKIPPED) && playerTask.updatedAt && (
            <div className="mb-3 flex items-center gap-2">
              <div style={{ color: 'rgba(180, 220, 240, 0.6)' }}>
                <Icon type="clock" size={14} />
              </div>
              <div 
                className="text-xs font-tech"
                style={{ color: 'rgba(220, 235, 245, 0.6)' }}
              >
                {formatTaskDate(playerTask.updatedAt)}
              </div>
            </div>
          )}

          {/* Action buttons - fixed at bottom */}
          {status === PlayerTaskStatus.IN_PROGRESS && onComplete && onReplace && (
            <div className="flex items-center justify-end gap-2">
              {/* Complete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canComplete) {
                    onComplete();
                  }
                }}
                disabled={!canComplete}
                className={`group relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  canComplete ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                style={{
                  background: canComplete 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: canComplete 
                    ? '2px solid rgba(160, 210, 235, 0.4)'
                    : '2px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: canComplete 
                    ? '0 0 15px rgba(160, 210, 235, 0.3)'
                    : 'none',
                }}
                title={canComplete 
                  ? t('taskCard.complete')
                  : t('tasks.stamina.insufficientStamina', { 
                      required: completeCost, 
                      current: stamina?.current || 0 
                    })
                }
              >
                {/* Hover glow effect */}
                {canComplete && (
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle, rgba(160, 210, 235, 0.3) 0%, transparent 70%)',
                      filter: 'blur(8px)'
                    }}
                  ></div>
                )}
                <div className="relative z-10" style={{ color: canComplete ? 'rgba(160, 210, 235, 0.9)' : 'rgba(220, 235, 245, 0.4)' }}>
                  <Icon type="check" size={16} />
                </div>
              </button>

              {/* Replace button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canSkip) {
                    onReplace();
                  }
                }}
                disabled={!canSkip}
                className={`group relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  canSkip ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                style={{
                  background: canSkip 
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: canSkip 
                    ? '2px solid rgba(180, 220, 240, 0.4)'
                    : '2px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: canSkip 
                    ? '0 0 15px rgba(180, 220, 240, 0.3)'
                    : 'none',
                }}
                title={canSkip 
                  ? t('taskCard.replace')
                  : t('tasks.stamina.insufficientStamina', { 
                      required: SKIP_STAMINA_COST, 
                      current: stamina?.current || 0 
                    })
                }
              >
                {/* Hover glow effect */}
                {canSkip && (
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle, rgba(180, 220, 240, 0.3) 0%, transparent 70%)',
                      filter: 'blur(8px)'
                    }}
                  ></div>
                )}
                <div className={`relative z-10 transition-transform duration-300 ${canSkip ? 'group-hover:scale-110' : ''}`} style={{ color: canSkip ? 'rgba(180, 220, 240, 0.9)' : 'rgba(220, 235, 245, 0.4)' }}>
                  <Icon type="arrow-left-right" size={16} />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TaskCard, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  // Важно: сравниваем stamina.current, чтобы кнопки обновлялись при изменении стамины
  const staminaEqual = prevProps.stamina?.current === nextProps.stamina?.current &&
                       prevProps.stamina?.max === nextProps.stamina?.max;
  
  return (
    prevProps.playerTask.id === nextProps.playerTask.id &&
    prevProps.playerTask.status === nextProps.playerTask.status &&
    prevProps.index === nextProps.index &&
    staminaEqual
  );
}); 