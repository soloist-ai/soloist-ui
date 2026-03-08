import React, { useEffect, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import BaseDialog from './BaseDialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText
}) => {
  const { t } = useLocalization();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Убираем фокус с кнопок при открытии диалога
  useEffect(() => {
    if (isOpen) {
      // Небольшая задержка для гарантии, что диалог полностью отрендерился
      const timer = setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.blur();
        }
        if (confirmButtonRef.current) {
          confirmButtonRef.current.blur();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  // Отдельная функция для onClose (без параметров)
  const handleClose = () => {
    onCancel();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-md"
    >

          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.28) 0%, rgba(160, 210, 235, 0.22) 100%)',
                  border: '2px solid rgba(220, 235, 245, 0.4)',
                  boxShadow: '0 0 24px rgba(180, 220, 240, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                  color: '#f0f8ff',
                  filter: 'drop-shadow(0 0 6px rgba(180, 220, 240, 0.6))'
                }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <p 
                className="text-lg leading-relaxed font-tech"
                style={{
                  color: '#f0f8ff',
                  textShadow: '0 0 6px rgba(180, 220, 240, 0.3)'
                }}
              >
                {message}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-3">
              {/* Cancel button - красный приглушенный голографический (как скипнутые задачи) */}
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={handleCancel}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex-1 px-6 py-3 font-tech text-sm tracking-[0.15em] uppercase rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.1), linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)',
                  backdropFilter: 'none',
                  borderColor: 'rgba(220, 38, 38, 0.3)',
                  boxShadow: '0 0 20px rgba(220, 38, 38, 0.2), inset 0 0 20px rgba(220, 38, 38, 0.05)',
                  color: 'rgba(235, 245, 255, 0.9)',
                  outline: 'none'
                }}
                tabIndex={0}
              >
                {/* Holographic shimmer effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.15) 25%, rgba(220, 38, 38, 0.1) 50%, rgba(185, 28, 28, 0.15) 75%, rgba(220, 38, 38, 0.1) 100%)',
                    backgroundSize: '300% 100%',
                    animation: 'holographic-shimmer 4s ease-in-out infinite',
                  }}
                />
                <span className="relative z-10 transition-colors duration-300 hover:text-white">
                  {cancelText || t('common.cancel')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </button>
              
              {/* Confirm button - зеленый (как завершенные задачи) */}
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex-1 px-6 py-3 font-tech text-sm tracking-[0.15em] uppercase rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.1), linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
                  backdropFilter: 'none',
                  borderColor: 'rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.2), inset 0 0 20px rgba(34, 197, 94, 0.05)',
                  color: 'rgba(235, 245, 255, 0.9)',
                  outline: 'none'
                }}
                tabIndex={0}
              >
                {/* Holographic shimmer effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.15) 25%, rgba(34, 197, 94, 0.1) 50%, rgba(22, 163, 74, 0.15) 75%, rgba(34, 197, 94, 0.1) 100%)',
                    backgroundSize: '300% 100%',
                    animation: 'holographic-shimmer 4s ease-in-out infinite',
                  }}
                />
                <span className="relative z-10 transition-colors duration-300 hover:text-white">
                  {confirmText || t('common.confirm')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </button>
            </div>
          </div>
    </BaseDialog>
  );
};

export default ConfirmDialog;
