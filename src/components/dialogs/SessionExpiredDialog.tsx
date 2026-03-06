import React, { useEffect, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import BaseDialog from './BaseDialog';

interface SessionExpiredDialogProps {
  isOpen: boolean;
  onRefresh: () => void;
}

const SessionExpiredDialog: React.FC<SessionExpiredDialogProps> = ({
  isOpen,
  onRefresh,
}) => {
  const { t } = useLocalization();
  const refreshButtonRef = useRef<HTMLButtonElement>(null);

  // Убираем фокус с кнопки при открытии диалога
  useEffect(() => {
    if (isOpen) {
      // Небольшая задержка для гарантии, что диалог полностью отрендерился
      const timer = setTimeout(() => {
        if (refreshButtonRef.current) {
          refreshButtonRef.current.blur();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onRefresh();
  };

  // Отдельная функция для onClose (без параметров)
  const handleClose = () => {
    // Не позволяем закрыть диалог, только через кнопку обновления
    // Можно оставить пустым или не использовать
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-md"
      onClickBackdrop={undefined} // Не позволяем закрыть по клику на backdrop
    >
      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.2) 0%, rgba(160, 210, 235, 0.15) 100%)',
              border: '2px solid rgba(220, 235, 245, 0.3)',
              boxShadow: '0 0 20px rgba(180, 220, 240, 0.3)'
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
              color: '#e8f4f8',
              filter: 'drop-shadow(0 0 4px rgba(180, 220, 240, 0.5))'
            }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <p 
            className="text-lg leading-relaxed font-tech"
            style={{
              color: '#e8f4f8',
              textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
            }}
          >
            {t('dialogs.sessionExpired.message')}
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button
            ref={refreshButtonRef}
            type="button"
            onClick={handleRefresh}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-8 py-3 font-tech text-sm tracking-[0.15em] uppercase rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'none',
              borderColor: 'rgba(180, 220, 240, 0.4)',
              boxShadow: '0 0 20px rgba(180, 220, 240, 0.25)',
              color: '#e8f4f8',
              outline: 'none'
            }}
            tabIndex={0}
          >
            <span className="relative z-10 transition-colors duration-300 hover:text-white">
              {t('dialogs.sessionExpired.refreshButton')}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default SessionExpiredDialog;
