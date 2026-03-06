import React, { useEffect, ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../../contexts/ModalContext';
import { useScrollLock } from '../../hooks/useScrollLock';

export interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: string;
  maxHeight?: string;
  onClickBackdrop?: () => void;
  isTaskDialog?: boolean; // Флаг для TaskDialog и TaskCompletionOverlay
}

/**
 * Базовый компонент для всех диалоговых окон
 * Обеспечивает единообразный backdrop (затемнение без blur) и управление скроллом
 */
const BaseDialog: React.FC<BaseDialogProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  contentClassName = '',
  maxWidth = 'max-w-md',
  maxHeight = 'max-h-[calc(95vh-env(safe-area-inset-top,0px)-5rem)]',
  onClickBackdrop,
  isTaskDialog = false,
}) => {
  const { openDialog, closeDialog, openTaskDialog, closeTaskDialog } = useModal();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Определяем мобильное устройство через Telegram WebApp platform
  useEffect(() => {
    const checkMobile = () => {
      const webApp = (window as any).Telegram?.WebApp;
      if (webApp?.platform) {
        const platform = webApp.platform;
        // Мобильные платформы: ios, android
        setIsMobile(platform === 'ios' || platform === 'android');
      } else {
        // Fallback: если Telegram WebApp недоступен, используем проверку размера экрана
        setIsMobile(window.innerWidth <= 768);
      }
    };
    checkMobile();
    // Слушаем изменения размера только для fallback случая
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Управление модальным контекстом и блокировкой скролла
  useEffect(() => {
    if (isOpen) {
      openDialog();
      if (isTaskDialog) {
        openTaskDialog();
      }
      setIsVisible(false);
      setAnimationComplete(false);
      // Запускаем анимацию после монтирования (двойной RAF для гарантии)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
          // Убираем will-change после завершения анимации для четкого рендеринга
          const animationDuration = isMobile ? 400 : 350;
          setTimeout(() => {
            setAnimationComplete(true);
          }, animationDuration);
        });
      });
      return () => {
        closeDialog();
        if (isTaskDialog) {
          closeTaskDialog();
        }
        setIsVisible(false);
        setAnimationComplete(false);
      };
    } else {
      setIsVisible(false);
      setAnimationComplete(false);
    }
  }, [isOpen, openDialog, closeDialog, openTaskDialog, closeTaskDialog, isTaskDialog, isMobile]);

  // Блокировка скролла при открытом диалоге
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (onClickBackdrop) {
      onClickBackdrop();
    } else {
      onClose();
    }
  };

  const dialogContent = (
    <>
      <style>{`
        .base-dialog-content-animated {
          /* Убираем размытие - четкий рендеринг текста и элементов везде */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          /* Принудительное использование GPU без размытия */
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        /* will-change только во время анимации */
        .base-dialog-content-animated.animating {
          will-change: transform, opacity;
        }
        
        /* После завершения анимации убираем will-change для четкого рендеринга */
        .base-dialog-content-animated.animation-complete {
          will-change: auto;
        }
        
        @media (max-width: 768px) {
          .base-dialog-content-animated {
            transform-origin: center center;
          }
        }
        
        /* Гарантируем, что overflow-y-auto применяется */
        .base-dialog-content-animated .overflow-y-auto {
          overflow-y: auto !important;
          overflow-x: hidden !important;
          }
        
        /* Ограничиваем диалог снизу, чтобы не накладывался на BottomBar */
        .base-dialog-content-animated {
          /* Максимальная высота с учетом BottomBar (80px) + safe area + отступ (6rem для безопасности) */
          max-height: calc(100vh - 80px - env(safe-area-inset-bottom, 0px) - 6rem) !important;
        }
        
        /* На мобильных устройствах увеличиваем размер диалогов */
        @media (max-width: 768px) {
          .base-dialog-content-animated {
            /* Увеличиваем максимальную высоту на мобильных, оставляя минимальный отступ (6rem для безопасности) */
            max-height: calc(100vh - 80px - env(safe-area-inset-bottom, 0px) - 6rem) !important;
          }
        }
        
        /* Четкий рендеринг всех элементов внутри диалога везде */
        .base-dialog-content-animated * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        .base-dialog-content-animated svg,
        .base-dialog-content-animated img,
        .base-dialog-content-animated canvas {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
        
        /* Дополнительные оптимизации для мобильных устройств */
        @media (max-width: 768px) {
          .base-dialog-content-animated {
            /* Принудительный четкий рендеринг на мобильных */
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }
        }
      `}</style>
      {/* Backdrop - единообразное затемнение без blur */}
      <div
        className={`fixed inset-0 z-[9999] ${className}`}
        onClick={(e) => {
          // Закрываем только если клик был именно на backdrop, а не на дочерних элементах
          if (e.target === e.currentTarget) {
            handleBackdropClick();
          }
        }}
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: '5rem', // Отступ для BottomBar
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
      />
      
      {/* Dialog Content */}
      <div
        className={`base-dialog-content-animated fixed left-1/2 top-1/2 z-[10000] w-[calc(100%-2rem)] sm:w-full ${maxWidth} flex flex-col rounded-2xl md:rounded-3xl ${contentClassName} ${isVisible && !animationComplete ? 'animating' : ''} ${animationComplete ? 'animation-complete' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          transform: isVisible 
            ? 'translate3d(-50%, -50%, 0)'
            : (isMobile 
              ? 'translate3d(-50%, -50%, 0)' // На мобильных без scale для четкости
              : 'translate3d(-50%, -50%, 0) scale(0.95)'), // На desktop используем scale
          opacity: isVisible ? 1 : 0,
          transition: isVisible 
            ? `transform ${isMobile ? '0.4s' : '0.35s'} cubic-bezier(0.16, 1, 0.3, 1), opacity ${isMobile ? '0.4s' : '0.35s'} ease-out`
            : 'transform 0.2s ease-in, opacity 0.2s ease-in',
          background: 'rgba(36, 38, 44, 0.98)',
          backdropFilter: 'none',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 4px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          // Дополнительные свойства для четкого рендеринга
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          // Принудительный четкий рендеринг
          WebkitTransform: isVisible 
            ? 'translate3d(-50%, -50%, 0)'
            : (isMobile 
              ? 'translate3d(-50%, -50%, 0)'
              : 'translate3d(-50%, -50%, 0) scale(0.95)'),
        }}
      >
        {/* Children content - с поддержкой скролла */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </>
  );

  // Рендерим через Portal на уровне body
  return createPortal(dialogContent, document.body);
};

export default BaseDialog;

