import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocalization } from '../../hooks/useLocalization';
import Icon from './Icon';
import { useFullscreenOverlay } from '../../hooks/useFullscreenOverlay';
import { useScrollLock } from '../../hooks/useScrollLock';

type UpdateOverlayProps = {
  isOpen: boolean;
  reason: 'version_changed' | 'chunk_load_error' | null;
  onRefresh: () => void;
};

const UpdateOverlay: React.FC<UpdateOverlayProps> = ({ isOpen, reason, onRefresh }) => {
  const { t } = useLocalization();
  const [overlayMounted, setOverlayMounted] = useState(false);

  useFullscreenOverlay(isOpen);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setOverlayMounted(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOverlayMounted(true));
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const message = reason === 'chunk_load_error'
    ? t('dialogs.uiUpdate.chunkErrorMessage')
    : t('dialogs.uiUpdate.message');

  const overlayContent = (
    <div
      className="update-overlay fixed left-0 top-0 right-0 bottom-0 z-[10000] flex flex-col items-center justify-center box-border px-6"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgb(28, 28, 32) 0%, rgb(14, 14, 16) 50%, #000000 100%)',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
        paddingTop: 'env(safe-area-inset-top, 0)',
        opacity: overlayMounted ? 1 : 0,
        transition: 'opacity 0.45s cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <div
        className="flex flex-col items-center text-center max-w-sm w-full"
        style={{
          opacity: overlayMounted ? 1 : 0,
          transform: overlayMounted ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1), transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: 'rgba(180, 220, 240, 0.1)',
            border: '2px solid rgba(180, 220, 240, 0.25)',
            boxShadow: '0 0 30px rgba(180, 220, 240, 0.15)',
          }}
        >
          <div style={{
            color: '#e8f4f8',
            filter: 'drop-shadow(0 0 8px rgba(180, 220, 240, 0.6))',
          }}>
            <Icon type="sparkles" size={36} />
          </div>
        </div>

        {/* Message */}
        <p
          className="text-base font-tech leading-relaxed mb-8"
          style={{
            color: 'rgba(220, 235, 245, 0.85)',
            textShadow: '0 0 4px rgba(180, 220, 240, 0.15)',
          }}
        >
          {message}
        </p>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl font-tech font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'rgba(180, 220, 240, 0.15)',
            border: '1px solid rgba(180, 220, 240, 0.3)',
            color: '#e8f4f8',
            boxShadow: '0 0 20px rgba(180, 220, 240, 0.1)',
          }}
        >
          {t('dialogs.uiUpdate.refreshButton')}
        </button>
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default React.memo(UpdateOverlay);
