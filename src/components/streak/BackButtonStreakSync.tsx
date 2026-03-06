import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTelegramWebApp } from '../../hooks/useTelegram';
import { useStreakOverlay } from '../../contexts/StreakOverlayContext';
import { useDayStreakOverlay } from '../../contexts/DayStreakOverlayContext';
import { globalBackButtonHandlerRef } from '../../App';

/**
 * Синхронизация кнопки "Назад" в Telegram с оверлеями стрика.
 * При открытом DayStreakOverlay или StreakOverlay показывает Back и закрывает по нажатию.
 * При закрытом оверлее на табах кроме menu/leaderboard скрывает Back.
 */
export function BackButtonStreakSync() {
  const location = useLocation();
  const { backButton } = useTelegramWebApp();
  const { isOpen: isStreakOverlayOpen, close: closeStreakOverlay } = useStreakOverlay();
  const { isOpen: isDayStreakOverlayOpen, close: closeDayStreakOverlay } = useDayStreakOverlay();
  const isOnMenuTab = location.pathname === '/menu' || location.pathname === '/leaderboard';

  // Закрываем StreakOverlay при смене маршрута (таб/профиль), чтобы не было кадра со старым табом
  useEffect(() => {
    closeStreakOverlay();
  }, [location.pathname, closeStreakOverlay]);

  useEffect(() => {
    if (isStreakOverlayOpen) {
      backButton.show();
      const handleBack = () => {
        closeStreakOverlay();
        if (globalBackButtonHandlerRef.current) {
          backButton.offClick(globalBackButtonHandlerRef.current);
          globalBackButtonHandlerRef.current = null;
        }
      };
      globalBackButtonHandlerRef.current = handleBack;
      backButton.onClick(handleBack);
      return () => {
        if (globalBackButtonHandlerRef.current === handleBack) {
          backButton.offClick(handleBack);
          globalBackButtonHandlerRef.current = null;
        }
      };
    }

    if (isDayStreakOverlayOpen) {
      backButton.show();
      const handleBack = () => {
        closeDayStreakOverlay();
        if (globalBackButtonHandlerRef.current) {
          backButton.offClick(globalBackButtonHandlerRef.current);
          globalBackButtonHandlerRef.current = null;
        }
      };
      globalBackButtonHandlerRef.current = handleBack;
      backButton.onClick(handleBack);
      return () => {
        if (globalBackButtonHandlerRef.current === handleBack) {
          backButton.offClick(handleBack);
          globalBackButtonHandlerRef.current = null;
        }
      };
    }

    if (!isOnMenuTab) {
      if (globalBackButtonHandlerRef.current) {
        backButton.offClick(globalBackButtonHandlerRef.current);
        globalBackButtonHandlerRef.current = null;
      }
      backButton.hide();
    }
  }, [location.pathname, backButton, isStreakOverlayOpen, closeStreakOverlay, isDayStreakOverlayOpen, closeDayStreakOverlay, isOnMenuTab]);

  return null;
}
