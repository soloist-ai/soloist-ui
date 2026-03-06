import React, { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useLocalization } from '../../hooks/useLocalization';
import { TelegramIcon } from '../common/TelegramWidget';
import Icon from '../common/Icon';
import { cn } from '../../utils';
import BaseDialog from './BaseDialog';

type SettingsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { settings, setLanguage, setIsManual } = useSettings();
  const { t } = useLocalization();

  // Убираем фокус с кнопки закрытия
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const closeButton = document.querySelector('.settings-dialog-close-button') as HTMLElement;
        if (closeButton) {
          closeButton.blur();
          closeButton.setAttribute('tabIndex', '-1');
        }
      }, 0);
    }
  }, [isOpen]);

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      maxHeight="max-h-[70vh]"
      contentClassName="settings-dialog"
    >
      <style>{`
        /* Скрываем декоративные элементы BaseDialog для SettingsDialog */
        .settings-dialog > div[class*="overflow-hidden"][class*="opacity-5"] {
          display: none !important;
        }
        
        .settings-dialog-close-button {
          color: #e8f4f8 !important;
          opacity: 0.7 !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 8px !important;
          background: rgba(220, 235, 245, 0.05) !important;
          border: 1px solid rgba(220, 235, 245, 0.2) !important;
          z-index: 100 !important;
          pointer-events: auto !important;
          outline: none !important;
          box-shadow: none !important;
          transform: none !important;
          transition: none !important;
        }
        
        .settings-dialog-close-button:focus {
          outline: none !important;
          box-shadow: none !important;
          ring: none !important;
        }
        
        .settings-dialog-close-button:hover {
          opacity: 1 !important;
          color: #ffffff !important;
          transform: scale(1.1) !important;
          filter: drop-shadow(0 0 8px rgba(180, 220, 240, 0.6)) !important;
          background: rgba(220, 235, 245, 0.1) !important;
          border-color: rgba(220, 235, 245, 0.4) !important;
          transition: opacity 0.2s ease, color 0.2s ease, transform 0.2s ease, filter 0.2s ease, background 0.2s ease, border-color 0.2s ease !important;
        }
        
        .settings-dialog-close-button svg {
          width: 18px !important;
          height: 18px !important;
        }
      `}</style>

        <div className="relative z-10">
          {/* Header */}
        <div className="p-6 pb-4 border-b relative" style={{
            borderColor: 'rgba(220, 235, 245, 0.1)',
            zIndex: 10
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="profile-icon-wrapper"
                  style={{
                    color: '#e8f4f8',
                    filter: 'drop-shadow(0 0 8px rgba(180, 220, 240, 0.4))'
                  }}
                >
                  <Icon type="settings" size={28} />
                </div>
              <h2 
                  className="font-tech text-xl font-bold m-0"
                  style={{
                    color: '#e8f4f8',
                    textShadow: '0 0 8px rgba(180, 220, 240, 0.3)'
                  }}
                >
                  {t('profile.settings.title')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="settings-dialog-close-button absolute right-4 top-4"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

          {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ 
          maxHeight: 'calc(70vh - 100px)'
        }}>
            {/* Language Source Setting */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="profile-icon-wrapper"
                  style={{
                    color: 'rgba(220, 235, 245, 0.7)',
                    filter: 'drop-shadow(0 0 4px rgba(200, 230, 245, 0.3))'
                  }}
                >
                  <Icon type="globe" size={24} />
                </div>
                <div>
                  <p 
                    className="font-tech font-bold text-sm m-0"
                    style={{ color: '#e8f4f8' }}
                  >
                    {t('profile.settings.language.sourceTitle')}
                  </p>
                  <p 
                    className="text-xs mt-1 m-0"
                    style={{ color: 'rgba(220, 235, 245, 0.6)' }}
                  >
                    {t('profile.settings.language.sourceDescription')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Telegram source */}
                <div
                  onClick={() => setIsManual(false)}
                  className={cn(
                    "relative p-4 cursor-pointer transition-all duration-200 border-0 shadow-none bg-transparent",
                    !settings.isManual && "scale-105"
                  )}
                  style={{
                    background: !settings.isManual
                      ? 'linear-gradient(135deg, rgba(180, 220, 240, 0.15) 0%, rgba(160, 210, 235, 0.08) 100%)'
                      : 'rgba(220, 235, 245, 0.05)',
                    border: !settings.isManual
                      ? '1px solid rgba(220, 235, 245, 0.4)'
                      : '1px solid rgba(220, 235, 245, 0.15)',
                    boxShadow: !settings.isManual
                      ? '0 0 15px rgba(180, 220, 240, 0.2)'
                      : 'none'
                  }}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div
                        style={{
                          color: !settings.isManual ? '#e8f4f8' : 'rgba(220, 235, 245, 0.6)',
                          filter: !settings.isManual ? 'drop-shadow(0 0 6px rgba(180, 220, 240, 0.5))' : 'none'
                        }}
                      >
                        <TelegramIcon className="w-6 h-6" />
                      </div>
                    </div>
                    <div 
                      className="font-tech text-xs font-semibold"
                      style={{
                        color: !settings.isManual ? '#e8f4f8' : 'rgba(220, 235, 245, 0.6)'
                      }}
                    >
                      {t('profile.settings.language.useTelegram')}
                    </div>
                  </div>
                  {!settings.isManual && (
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{
                        background: '#e8f4f8',
                        boxShadow: '0 0 8px rgba(180, 220, 240, 0.8)'
                      }}
                    ></div>
                  )}
                </div>

                {/* Manual source */}
                <div
                  onClick={() => setIsManual(true)}
                  className={cn(
                    "relative p-4 cursor-pointer transition-all duration-200 border-0 shadow-none bg-transparent",
                    settings.isManual && "scale-105"
                  )}
                  style={{
                    background: settings.isManual
                      ? 'linear-gradient(135deg, rgba(180, 220, 240, 0.15) 0%, rgba(160, 210, 235, 0.08) 100%)'
                      : 'rgba(220, 235, 245, 0.05)',
                    border: settings.isManual
                      ? '1px solid rgba(220, 235, 245, 0.4)'
                      : '1px solid rgba(220, 235, 245, 0.15)',
                    boxShadow: settings.isManual
                      ? '0 0 15px rgba(180, 220, 240, 0.2)'
                      : 'none'
                  }}
                >
                  <div className="text-center">
                    <div className="flex justify-center items-center mb-2">
                      <div
                        className="profile-icon-wrapper"
                        style={{
                          color: settings.isManual ? '#e8f4f8' : 'rgba(220, 235, 245, 0.6)',
                          filter: settings.isManual ? 'drop-shadow(0 0 6px rgba(180, 220, 240, 0.5))' : 'none'
                        }}
                      >
                        <Icon type="wrench" size={24} />
                      </div>
                    </div>
                    <div 
                      className="font-tech text-xs font-semibold"
                      style={{
                        color: settings.isManual ? '#e8f4f8' : 'rgba(220, 235, 245, 0.6)'
                      }}
                    >
                      {t('profile.settings.language.chooseManually')}
                    </div>
                  </div>
                  {settings.isManual && (
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{
                        background: '#e8f4f8',
                        boxShadow: '0 0 8px rgba(180, 220, 240, 0.8)'
                      }}
                    ></div>
                  )}
                </div>
              </div>

              {/* Manual language selection */}
              <div 
                className={cn(
                  "grid grid-cols-2 gap-3 transition-opacity duration-300",
                  !settings.isManual && "opacity-40 pointer-events-none"
                )}
              >
                {/* Russian */}
                <div
                  onClick={() => setLanguage('ru')}
                  className={cn(
                    "relative p-4 cursor-pointer transition-all duration-200 border-0 shadow-none bg-transparent",
                    settings.language === 'ru' && "scale-105"
                  )}
                  style={{
                    background: settings.language === 'ru'
                      ? 'linear-gradient(135deg, rgba(180, 220, 240, 0.15) 0%, rgba(160, 210, 235, 0.08) 100%)'
                      : 'rgba(220, 235, 245, 0.05)',
                    border: settings.language === 'ru'
                      ? '1px solid rgba(220, 235, 245, 0.4)'
                      : '1px solid rgba(220, 235, 245, 0.15)',
                    boxShadow: settings.language === 'ru'
                      ? '0 0 15px rgba(180, 220, 240, 0.2)'
                      : 'none'
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🇷🇺</div>
                    <div 
                      className="font-tech text-xs font-semibold"
                      style={{
                        color: settings.language === 'ru' ? '#e8f4f8' : 'rgba(220, 235, 245, 0.6)'
                      }}
                    >
                      {t('profile.settings.language.russian')}
                    </div>
                  </div>
                  {settings.language === 'ru' && (
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{
                        background: '#e8f4f8',
                        boxShadow: '0 0 8px rgba(180, 220, 240, 0.8)'
                      }}
                    ></div>
                  )}
                </div>

                {/* English */}
                <div
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "relative p-4 cursor-pointer transition-all duration-200 border-0 shadow-none bg-transparent",
                    settings.language === 'en' && "scale-105"
                  )}
                  style={{
                    background: settings.language === 'en'
                      ? 'linear-gradient(135deg, rgba(180, 220, 240, 0.15) 0%, rgba(160, 210, 235, 0.08) 100%)'
                      : 'rgba(220, 235, 245, 0.05)',
                    border: settings.language === 'en'
                      ? '1px solid rgba(220, 235, 245, 0.4)'
                      : '1px solid rgba(220, 235, 245, 0.15)',
                    boxShadow: settings.language === 'en'
                      ? '0 0 15px rgba(180, 220, 240, 0.2)'
                      : 'none'
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🇺🇸</div>
                    <div 
                      className="font-tech text-xs font-semibold"
                      style={{
                        color: settings.language === 'en' ? '#e8f4f8' : 'rgba(220, 235, 245, 0.6)'
                      }}
                    >
                      {t('profile.settings.language.english')}
                    </div>
                  </div>
                  {settings.language === 'en' && (
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{
                        background: '#e8f4f8',
                        boxShadow: '0 0 8px rgba(180, 220, 240, 0.8)'
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </BaseDialog>
  );
};

export default SettingsDialog;
