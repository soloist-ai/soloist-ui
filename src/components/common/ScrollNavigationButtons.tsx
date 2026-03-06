import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

interface ScrollNavigationButtonsProps {
  /** Контейнер для скролла (если не указан, используется window) */
  scrollContainer?: HTMLElement | null;
  /** Флаг загрузки новой страницы - используется для сохранения позиции */
  isLoadingMore?: boolean;
  /** Класс для дополнительной стилизации */
  className?: string;
}

const ScrollNavigationButtons: React.FC<ScrollNavigationButtonsProps> = ({
  scrollContainer,
  isLoadingMore = false,
  className = ''
}) => {
  const [showTopButton, setShowTopButton] = useState(false);
  const [showBottomButton, setShowBottomButton] = useState(false);
  const lastScrollPositionRef = useRef<number>(0);
  const previousLoadingRef = useRef<boolean>(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const scrollThreshold = 400; // Показывать кнопку "вверх" после скролла на 200px

  // Находим скроллируемый контейнер (кэшируем результат)
  const getScrollContainer = useCallback(() => {
    // Если уже нашли контейнер, возвращаем его
    if (scrollContainerRef.current) {
      return scrollContainerRef.current;
    }
    
    if (scrollContainer) {
      scrollContainerRef.current = scrollContainer;
      return scrollContainer;
    }
    
    // Сначала ищем контейнеры с fixed и overflow-y-auto (например, в BalanceTab)
    const fixedContainer = document.querySelector('.fixed.inset-0.overflow-y-auto') as HTMLElement;
    if (fixedContainer) {
      scrollContainerRef.current = fixedContainer;
      return fixedContainer;
    }
    
    // Затем проверяем main.tab-content
    const mainElement = document.querySelector('main.tab-content') as HTMLElement;
    if (mainElement) {
      scrollContainerRef.current = mainElement;
      return mainElement;
    }
    
    // Если не нашли, используем null (будет window)
    scrollContainerRef.current = null;
    return null;
  }, [scrollContainer]);

  // Сохраняем позицию скролла перед началом загрузки новой страницы
  useEffect(() => {
    // Если началась загрузка (было false, стало true), сохраняем позицию
    if (!previousLoadingRef.current && isLoadingMore) {
      const elementToUse = getScrollContainer();
      
      const scrollTop = elementToUse instanceof HTMLElement
        ? elementToUse.scrollTop
        : window.scrollY || document.documentElement.scrollTop;
      
      lastScrollPositionRef.current = scrollTop;
    }
    previousLoadingRef.current = isLoadingMore;
  }, [isLoadingMore, getScrollContainer]);

  // Отслеживаем скролл для показа/скрытия кнопок
  useEffect(() => {
    const handleScroll = () => {
      const elementToUse = getScrollContainer();
      
      let scrollTop: number;
      let scrollHeight: number;
      let clientHeight: number;
      
      if (elementToUse instanceof HTMLElement) {
        scrollTop = elementToUse.scrollTop;
        scrollHeight = elementToUse.scrollHeight;
        clientHeight = elementToUse.clientHeight;
      } else {
        // Используем window
        scrollTop = window.scrollY || document.documentElement.scrollTop;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      }

      // Показываем кнопку "вверх" если проскроллили больше threshold
      setShowTopButton(scrollTop > scrollThreshold);
      
      // Показываем кнопку "вниз" если есть сохраненная позиция и мы выше этой позиции
      const hasMoreContent = scrollTop + clientHeight < scrollHeight - 50;
      const isAboveLastPosition = lastScrollPositionRef.current > 0 && scrollTop < lastScrollPositionRef.current - 30;
      const shouldShowBottom = isAboveLastPosition && hasMoreContent && lastScrollPositionRef.current > 0;
      setShowBottomButton(shouldShowBottom);
    };

    const elementToUse = getScrollContainer();
    
    // Всегда слушаем скролл на window
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Также слушаем на элементе, если он есть
    if (elementToUse instanceof HTMLElement) {
      elementToUse.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Проверяем начальное состояние
    handleScroll();
    
    // Убираем setInterval - он вызывает лишние вычисления и может блокировать скролл
    // События scroll достаточно для отслеживания
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (elementToUse instanceof HTMLElement) {
        elementToUse.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollContainer, getScrollContainer]);

  const scrollToTop = useCallback(() => {
    const elementToUse = getScrollContainer();
    
    if (elementToUse instanceof HTMLElement) {
      elementToUse.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [getScrollContainer]);

  const scrollToLastPosition = useCallback(() => {
    const targetPosition = lastScrollPositionRef.current;
    const elementToUse = getScrollContainer();
    
    if (targetPosition > 0) {
      if (elementToUse instanceof HTMLElement) {
        elementToUse.scrollTo({ top: targetPosition, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }
  }, [getScrollContainer]);

  const buttonsContent = (
    <div className={`fixed bottom-24 right-4 z-[60] flex flex-col gap-3 ${className}`} style={{ pointerEvents: 'auto' }}>
      <button
        onClick={scrollToTop}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 relative"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgb(18, 18, 22) 0%, rgb(10, 10, 14) 70%, rgb(5, 5, 8) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          boxShadow: '0 0 24px rgba(180, 220, 240, 0.12), 0 4px 16px rgba(0,0,0,0.4)',
          color: '#e8f4f8',
          outline: 'none',
          opacity: showTopButton ? 1 : 0,
          pointerEvents: showTopButton ? 'auto' : 'none',
          transform: showTopButton ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
        aria-label="Scroll to top"
      >
        <Icon type="arrow-up" size={20} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none"></div>
      </button>
      
      <button
        onClick={scrollToLastPosition}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 relative"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgb(18, 18, 22) 0%, rgb(10, 10, 14) 70%, rgb(5, 5, 8) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          boxShadow: '0 0 24px rgba(180, 220, 240, 0.12), 0 4px 16px rgba(0,0,0,0.4)',
          color: '#e8f4f8',
          outline: 'none',
          opacity: showBottomButton ? 1 : 0,
          pointerEvents: showBottomButton ? 'auto' : 'none',
          transform: showBottomButton ? 'scale(1)' : 'scale(0.8)',
          transition: 'opacity 0.3s ease, transform 0.3s ease'
        }}
        aria-label="Scroll to last position"
      >
        <Icon type="arrow-down" size={20} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none"></div>
      </button>
    </div>
  );

  // Рендерим через Portal на уровне body, чтобы fixed позиционирование работало правильно
  if (typeof window !== 'undefined' && document.body) {
    return createPortal(buttonsContent, document.body);
  }

  return buttonsContent;
};

export default ScrollNavigationButtons;
