import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAppData } from '../contexts/AppDataContext';
import { useDayStreakOverlay } from '../contexts/DayStreakOverlayContext';
import { gqlSdk } from '../graphql/client';
import { useLocalization } from '../hooks/useLocalization';
import { useFullscreenOverlay } from '../hooks/useFullscreenOverlay';
import { useScrollLock } from '../hooks/useScrollLock';

const STREAK_NUMBER_DURATION_MS = 1000;

/**
 * Оверлей «Стрик продлён» — показывается по day-streak-notification поверх текущего таба.
 * Закрытие без навигации — просто скрывает оверлей, таб остаётся без перезагрузки.
 */
export function DayStreakOverlay() {
  const { isOpen, message: notificationMessage, close } = useDayStreakOverlay();
  const { me, refreshDayStreak } = useAppData();
  const contextStreak = me?.player?.dayStreak ?? null;
  const { t } = useLocalization();
  const [mounted, setMounted] = useState(false);
  const [streakBefore, setStreakBefore] = useState<number>(0);
  const [streakAfter, setStreakAfter] = useState<number>(0);
  const [phase, setPhase] = useState<'before' | 'after'>('before');
  const initRef = useRef(false);
  const fireLottieSrc = `${process.env.PUBLIC_URL || ''}/lottie/Fire.lottie`;
  const streakCurrent = contextStreak?.current ?? 0;

  useFullscreenOverlay(isOpen);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    initRef.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || initRef.current) return;
    initRef.current = true;
    setStreakBefore(streakCurrent);
    setStreakAfter(streakCurrent + 1);
    setPhase('before');
    setMounted(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
  }, [isOpen, streakCurrent]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const { me: res } = await gqlSdk.RefreshDayStreak();
        if (cancelled) return;
        const newCurrent = res.player.dayStreak?.current ?? streakBefore + 1;
        setStreakAfter(newCurrent);
        refreshDayStreak();
      } catch {
        // Оставляем streakAfter без изменений
      }
    })();
    const t1 = setTimeout(() => !cancelled && setPhase('after'), STREAK_NUMBER_DURATION_MS);
    return () => {
      cancelled = true;
      clearTimeout(t1);
    };
  }, [isOpen, refreshDayStreak, streakBefore]);

  const handleContinue = () => {
    setMounted(false);
    setTimeout(() => close(), 280);
  };

  if (!isOpen) return null;

  const overlayContent = (
    <div
      className="day-streak-overlay fixed inset-0 flex flex-col overflow-hidden"
      style={{
        boxSizing: 'border-box',
        zIndex: 10000,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgb(28, 28, 32) 0%, rgb(14, 14, 16) 50%, #000000 100%)',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
        paddingTop: 'env(safe-area-inset-top, 0)',
      }}
    >
      <div
        className="flex-1 flex flex-col items-center justify-center min-h-0 px-6"
        style={{
          paddingLeft: 'env(safe-area-inset-left, 1.5rem)',
          paddingRight: 'env(safe-area-inset-right, 1.5rem)',
          paddingTop: 'env(safe-area-inset-top, 0)',
        }}
      >
        <div
          className="relative flex flex-col items-center gap-6"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.55s cubic-bezier(0.33, 1, 0.68, 1), transform 0.55s cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        >
          <div className="w-40 h-40 flex-shrink-0 opacity-95">
            <DotLottieReact
              src={fireLottieSrc}
              autoplay
              loop
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <p
            className="text-xl font-tech text-center tracking-wide"
            style={{
              color: 'rgba(232, 244, 248, 0.95)',
              textShadow: '0 0 20px rgba(180, 220, 240, 0.15)',
              letterSpacing: '0.02em',
            }}
          >
            {notificationMessage && notificationMessage.trim() !== ''
              ? notificationMessage
              : t('dayStreak.extended')}
          </p>

          <div className="flex items-baseline justify-center gap-2 mt-2 min-h-[4.5rem]">
            {phase === 'before' && (
              <span
                className="day-streak-number inline-block text-6xl font-bold tabular-nums leading-none"
                style={{
                  color: '#fb923c',
                  textShadow: '0 0 12px rgba(251, 146, 60, 0.4)',
                }}
              >
                {streakBefore}
              </span>
            )}
            {phase === 'after' && (
              <span
                className="day-streak-result inline-block text-6xl font-bold tabular-nums leading-none"
                style={{
                  color: '#fb923c',
                  textShadow: '0 0 12px rgba(251, 146, 60, 0.4)',
                }}
              >
                {streakAfter}
              </span>
            )}
            <span
              className="text-2xl font-tech ml-1 leading-none"
              style={{ color: 'rgba(220, 235, 245, 0.8)' }}
            >
              {t('dayStreak.days', { count: phase === 'after' ? streakAfter : streakBefore })}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex-shrink-0 flex justify-center items-center w-full px-4 pt-3 pb-4"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'env(safe-area-inset-left, 1rem)',
          paddingRight: 'env(safe-area-inset-right, 1rem)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0.08s, transform 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0.08s',
        }}
      >
        <button
          type="button"
          onClick={handleContinue}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl font-tech font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'rgba(180, 220, 240, 0.15)',
            border: '1px solid rgba(180, 220, 240, 0.3)',
            color: 'rgba(232, 244, 248, 0.95)',
            boxShadow: '0 0 20px rgba(180, 220, 240, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(180, 220, 240, 0.18)';
            e.currentTarget.style.borderColor = 'rgba(180, 220, 240, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(180, 220, 240, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(180, 220, 240, 0.3)';
          }}
        >
          {t('common.continue')}
        </button>
      </div>

      <style>{`
        .day-streak-number,
        .day-streak-result {
          animation: dayStreakFadeIn 0.6s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }
        @keyframes dayStreakFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.97) translateY(6px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(overlayContent, document.body);
}
