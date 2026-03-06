import { useEffect, useRef, useCallback, useState } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { useDayStreakOverlay } from '../../contexts/DayStreakOverlayContext';

const PENDING_OVERLAY_REGISTRATION_MS = 250;

/**
 * Слушает day-streak-notification и открывает DayStreakOverlay поверх текущего таба.
 * Ждёт закрытия полноэкранных оверлеев (TaskCompletionOverlay и др.) перед показом.
 * Закрытие оверлея — без навигации, таб не перезагружается.
 */
export function DayStreakNavigator() {
  const { open } = useDayStreakOverlay();
  const { isDialogOpen, isOverlayOpen } = useModal();
  const [pending, setPending] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const prevOverlayOpenRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string | null }>;
      setNotificationMessage(customEvent.detail?.message ?? null);
      setPending(true);
    };
    window.addEventListener('day-streak-notification', handler);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('day-streak-notification', handler);
    };
  }, []);

  const showDayStreakOverlay = useCallback(() => {
    setPending(false);
    open(notificationMessage);
  }, [open, notificationMessage]);

  // Показ только после закрытия другого полноэкранного оверлея
  useEffect(() => {
    const wasOverlayOpen = prevOverlayOpenRef.current;
    prevOverlayOpenRef.current = isOverlayOpen;

    if (wasOverlayOpen && !isOverlayOpen && pending && !isDialogOpen) {
      showDayStreakOverlay();
    }
  }, [pending, isDialogOpen, isOverlayOpen, showDayStreakOverlay]);

  // Показ, когда pending и нет открытого оверлея
  useEffect(() => {
    if (!pending || isDialogOpen || isOverlayOpen) return;
    const t = setTimeout(() => {
      if (!mountedRef.current) return;
      setPending((p) => {
        if (!p) return p;
        showDayStreakOverlay();
        return false;
      });
    }, PENDING_OVERLAY_REGISTRATION_MS);
    return () => clearTimeout(t);
  }, [pending, isDialogOpen, isOverlayOpen, showDayStreakOverlay]);

  return null;
}
