import React, { useState, useMemo, useEffect } from 'react';
import type { Stamina } from '../../api';
import Icon from '../common/Icon';
import { useLocalization } from '../../hooks/useLocalization';
import { useTelegram } from '../../hooks/useTelegram';

type StaminaIndicatorProps = {
  stamina: Stamina | null;
  onStaminaUpdate?: (updatedStamina: Stamina) => void;
};

const StaminaIndicator: React.FC<StaminaIndicatorProps> = ({ stamina, onStaminaUpdate }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localStamina, setLocalStamina] = useState<Stamina | null>(stamina);
  const { t } = useLocalization();
  const { webApp } = useTelegram();
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Определяем мобильное устройство через Telegram WebApp platform
  // Fallback на проверку ширины экрана для моковых данных и тестирования
  const isMobile = useMemo(() => {
    if (webApp?.platform) {
      const platform = webApp.platform;
      if (platform === 'ios' || platform === 'android') {
        return true;
      }
      if (platform === 'macos' || platform === 'windows' || platform === 'linux') {
        return false;
      }
    }
    // Fallback: проверяем ширину экрана для моковых данных и тестирования
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, [webApp?.platform]);

  // Обработчик клика вне контейнера для закрытия тултипа на мобильных
  useEffect(() => {
    if (!isMobile || !showTooltip) return;

    const handleClickOutside = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    // Добавляем обработчик с небольшой задержкой, чтобы не сработал сразу после открытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, showTooltip]);

  // Используем локальную стамину для отображения
  const displayStamina = localStamina || stamina;

  // Синхронизируем локальную стамину с пропсом
  useEffect(() => {
    if (stamina) {
      setLocalStamina({ ...stamina });
    }
  }, [stamina]);

  // Обновляем время каждую секунду и проверяем восстановление стамины
  useEffect(() => {
    if (!localStamina) return;
    
    const interval = setInterval(() => {
      setLocalStamina((prevStamina) => {
        if (!prevStamina) return prevStamina;
        
        const now = new Date();
        setCurrentTime(now);
        
        // Локально обновляем стамину если время восстановления подошло
        if (prevStamina.nextRegenAt && prevStamina.current < prevStamina.max) {
          const nextRegen = new Date(prevStamina.nextRegenAt);
          
          if (now >= nextRegen) {
            // Прибавляем стамину локально
            const newCurrent = Math.min(
              prevStamina.current + prevStamina.regenRate,
              prevStamina.max
            );
            
            // Обновляем время следующего восстановления
            let newNextRegenAt: string | undefined;
            let newFullRegenAt: string | undefined;
            
            if (newCurrent < prevStamina.max) {
              newNextRegenAt = new Date(now.getTime() + prevStamina.regenIntervalSeconds * 1000).toISOString();
              const remainingStamina = prevStamina.max - newCurrent;
              newFullRegenAt = new Date(now.getTime() + remainingStamina * prevStamina.regenIntervalSeconds * 1000).toISOString();
            } else {
              // Стамина полностью восстановлена
              newNextRegenAt = undefined;
              newFullRegenAt = undefined;
            }
            
            const updatedStamina = {
              ...prevStamina,
              current: newCurrent,
              nextRegenAt: newNextRegenAt,
              fullRegenAt: newFullRegenAt,
              isRegenerating: newCurrent < prevStamina.max,
            };
            
            // Уведомляем родительский компонент об обновлении стамины
            if (onStaminaUpdate) {
              onStaminaUpdate(updatedStamina);
            }
            
            return updatedStamina;
          }
        }
        
        return prevStamina;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [localStamina, onStaminaUpdate]);

  // Форматирование времени восстановления (хуки должны быть до раннего возврата)
  const formatTimeUntil = useMemo(() => {
    if (!displayStamina?.nextRegenAt) return null;
    
    const nextRegen = new Date(displayStamina.nextRegenAt);
    const diffMs = nextRegen.getTime() - currentTime.getTime();
    
    // Если время уже прошло или равно 0, показываем время до следующего восстановления
    const secondsUntilNext = Math.max(0, Math.ceil(diffMs / 1000));
    
    if (secondsUntilNext === 0) {
      // Если время уже пришло, показываем полный интервал до следующего восстановления
      return `${displayStamina.regenIntervalSeconds} ${t('tasks.stamina.seconds')}`;
    }
    
    const minutes = Math.floor(secondsUntilNext / 60);
    const seconds = secondsUntilNext % 60;
    
    if (minutes > 0) {
      // Если секунды равны 0, показываем только минуты
      if (seconds === 0) {
        return `${minutes} ${t('tasks.stamina.minutes')}`;
      }
      return `${minutes} ${t('tasks.stamina.minutes')} ${seconds} ${t('tasks.stamina.seconds')}`;
    }
    return `${seconds} ${t('tasks.stamina.seconds')}`;
  }, [displayStamina?.nextRegenAt, displayStamina?.regenIntervalSeconds, currentTime, t]);

  const formatFullRegenTime = useMemo(() => {
    if (!displayStamina?.fullRegenAt) return null;
    
    const fullRegen = new Date(displayStamina.fullRegenAt);
    const diffMs = fullRegen.getTime() - currentTime.getTime();
    
    if (diffMs <= 0) return t('tasks.stamina.fullyRestored');
    
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Если есть часы, показываем только часы и минуты (без секунд)
    if (hours > 0) {
      return `${hours} ${t('tasks.stamina.hours')} ${minutes} ${t('tasks.stamina.minutes')}`;
    }
    
    // Если меньше минуты, показываем секунды
    if (totalSeconds < 60) {
      return `${seconds} ${t('tasks.stamina.seconds')}`;
    }
    
    // Если меньше часа, показываем минуты и секунды (если секунды не равны 0)
    if (seconds === 0) {
      return `${minutes} ${t('tasks.stamina.minutes')}`;
    }
    return `${minutes} ${t('tasks.stamina.minutes')} ${seconds} ${t('tasks.stamina.seconds')}`;
  }, [displayStamina?.fullRegenAt, currentTime, t]);

  // Форматирование времени для строки "+1 каждые n секунд"
  const formatRegenInterval = useMemo(() => {
    if (!displayStamina?.regenIntervalSeconds) return '';
    
    const seconds = displayStamina.regenIntervalSeconds;
    
    // Если меньше минуты, показываем секунды
    if (seconds < 60) {
      return `${seconds} ${t('tasks.stamina.seconds')}`;
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    // Если есть часы, показываем только часы и минуты (без секунд)
    if (hours > 0) {
      return `${hours} ${t('tasks.stamina.hours')} ${minutes} ${t('tasks.stamina.minutes')}`;
    }
    
    // Если есть только минуты, показываем минуты (без секунд)
    if (remainingSeconds === 0) {
      return `${minutes} ${t('tasks.stamina.minutes')}`;
    }
    
    // Если есть минуты и секунды, показываем оба
    return `${minutes} ${t('tasks.stamina.minutes')} ${remainingSeconds} ${t('tasks.stamina.seconds')}`;
  }, [displayStamina?.regenIntervalSeconds, t]);
  
  if (!displayStamina) {
    return null;
  }

  const percentage = (displayStamina.current / displayStamina.max) * 100;
  
  // Неоновые голубые-бирюзовые цвета с ярким свечением
  const staminaColors = {
    start: '#00ffff',           // Яркий циан (неоновый)
    middle: '#40e0d0',          // Бирюзовый (turquoise)
    end: '#00ced1',             // Темный бирюзовый (dark turquoise)
    accent: '#00f5ff',          // Яркий акцентный голубой
    glow: 'rgba(0, 255, 255, 0.6)',
    glowStrong: 'rgba(64, 224, 208, 0.8)',
    glowPulse: 'rgba(0, 245, 255, 0.9)',
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // На мобильных устройствах переключаем тултип при клике
    if (isMobile) {
      e.stopPropagation();
      setShowTooltip(prev => !prev);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // На десктопе скрываем при уходе курсора
    // На мобильных не обрабатываем, чтобы избежать конфликта с onClick
    if (!isMobile) {
      setShowTooltip(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl px-4 pt-4 pb-3 backdrop-blur-md group w-full"
      style={{
        background: 'rgba(220, 235, 245, 0.08)',
        border: '1px solid rgba(220, 235, 245, 0.12)',
        cursor: isMobile ? 'pointer' : 'default',
      }}
      onMouseEnter={() => {
        // На десктопе показываем при наведении
        if (!isMobile) {
          setShowTooltip(true);
        }
      }}
      onMouseLeave={handleMouseLeave}
      onClick={handleContainerClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Icon type="zap" size={20} />
          <span
            className="text-sm md:text-base font-tech font-semibold"
            style={{ color: '#e8f4f8' }}
          >
            {t('tasks.stamina.title')}
          </span>
        </div>
        <div className="flex-1"></div>
        <span
          className="text-sm md:text-base font-tech font-bold"
          style={{ color: '#e8f4f8' }}
        >
          {displayStamina.current} / {displayStamina.max}
        </span>
      </div>

      {/* Neon Progress bar with vibrant animations */}
      <div className="relative mb-3">
        <div
          className="w-full h-4 rounded-full overflow-hidden relative"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 255, 255, 0.1)',
          }}
        >
          {/* Animated neon gradient fill */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{
              width: `${percentage}%`,
            }}
          >
            {/* Main neon gradient with flowing animation */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, 
                  ${staminaColors.start} 0%, 
                  ${staminaColors.middle} 20%, 
                  ${staminaColors.accent} 40%, 
                  ${staminaColors.middle} 60%, 
                  ${staminaColors.end} 80%, 
                  ${staminaColors.start} 100%
                )`,
                backgroundSize: '300% 100%',
                animation: 'neon-flow 4s ease-in-out infinite',
                boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.4),
                  0 0 20px ${staminaColors.glow},
                  0 0 40px ${staminaColors.glowStrong},
                  0 0 60px ${staminaColors.glow}
                `,
                filter: 'brightness(1.1)',
              }}
            />
            
            {/* Pulsing glow effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(ellipse at center, ${staminaColors.glowPulse} 0%, transparent 60%)`,
                animation: 'pulse-glow 2.5s ease-in-out infinite',
                opacity: 0.5,
              }}
            />
            
            {/* Enhanced shine effect overlay - более плавный */}
            <div
              className="absolute inset-0 rounded-full opacity-60"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 45%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0.6) 55%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />
            
            {/* Additional shimmer layer for more depth - более мягкий */}
            <div
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background: 'radial-gradient(ellipse 150% 100% at 50% 50%, rgba(0, 255, 255, 0.4) 0%, transparent 60%)',
                animation: 'shimmer-soft 4s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Next regeneration time - always visible if nextRegenAt exists */}
      {displayStamina.nextRegenAt && formatTimeUntil && (
        <div className="flex items-center justify-between text-xs font-tech mb-0">
          <span style={{ color: 'rgba(220, 235, 245, 0.7)' }}>
            {t('tasks.stamina.nextRegen')}:
          </span>
          <span 
            className="font-bold"
            style={{ 
              color: 'rgba(180, 220, 240, 0.9)',
              textShadow: '0 0 6px rgba(180, 220, 240, 0.4)',
            }}
          >
            {formatTimeUntil}
          </span>
        </div>
      )}

      {/* Tooltip with full regeneration info - appears on hover/click */}
      {showTooltip && displayStamina.fullRegenAt && formatFullRegenTime && (
        <div
          className="stamina-tooltip absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3.5 rounded-2xl z-50 pointer-events-none whitespace-nowrap"
          style={{
            background: 'rgb(38, 44, 54)',
            border: '1px solid rgba(220, 235, 245, 0.35)',
            boxShadow: `
              0 16px 48px rgba(0, 0, 0, 0.35),
              0 0 24px rgba(180, 220, 240, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.12)
            `,
            minWidth: '280px',
            animation: 'staminaTooltipIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            transformOrigin: 'bottom center',
          }}
        >
          <div className="space-y-2.5">
            {displayStamina.fullRegenAt && formatFullRegenTime && (
              <div className="flex items-center justify-between gap-6">
                <span className="text-xs font-tech whitespace-nowrap" style={{ color: 'rgba(220, 235, 245, 0.9)' }}>
                  {t('tasks.stamina.fullRegen')}:
                </span>
                <span className="text-sm font-tech font-bold whitespace-nowrap" style={{ color: '#e8f4f8', textShadow: '0 0 12px rgba(180, 220, 240, 0.3)' }}>
                  {formatFullRegenTime}
                </span>
              </div>
            )}
            {displayStamina.isRegenerating && (
              <div className="pt-2.5 border-t" style={{ borderColor: 'rgba(220, 235, 245, 0.2)' }}>
                <div className="text-xs font-tech whitespace-nowrap text-center" style={{ color: 'rgba(180, 220, 240, 0.95)' }}>
                  +{displayStamina.regenRate} {t('tasks.stamina.every')} {formatRegenInterval}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* CSS animations */}
      <style>{`
        @keyframes staminaTooltipIn {
          0% {
            opacity: 0;
            transform: translate(-50%, 8px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -100% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
        
        @keyframes neon-flow {
          0% {
            background-position: 0% 50%;
            filter: brightness(1.1);
          }
          33% {
            background-position: 50% 50%;
            filter: brightness(1.15);
          }
          66% {
            background-position: 100% 50%;
            filter: brightness(1.12);
          }
          100% {
            background-position: 0% 50%;
            filter: brightness(1.1);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1) translateX(0);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.08) translateX(5%);
          }
        }
        
        @keyframes shimmer-soft {
          0%, 100% {
            transform: translateX(-20%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateX(20%) scale(1.1);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default StaminaIndicator;
