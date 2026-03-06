import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface TelegramWidgetProps {
  /** 1) auth-error — ошибка авторизации: по кнопке обновляем страницу. 2) no-telegram — открыли по ссылке в браузере: по кнопке — ссылка на приложение в Telegram */
  type: 'no-telegram' | 'auth-error';
  errorMessage?: string;
}

export const TelegramWidget: React.FC<TelegramWidgetProps> = ({ type, errorMessage }) => {
  const { t } = useLocalization();
  const isAuthError = type === 'auth-error';
  

  const title = isAuthError ? t('errors.authError') : t('errors.telegramRequired');
  
  const description = isAuthError 
    ? errorMessage || t('errors.authError')
    : "Это приложение работает только в Telegram Mini App. Нажмите кнопку ниже, чтобы открыть приложение в Telegram.";

  const buttonText = isAuthError ? "Попробовать снова" : "Открыть Soloist AI";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: '#000000',
        boxSizing: 'border-box'
      }}
    >
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{
        background: isAuthError ? 'rgba(220, 38, 38, 0.8)' : 'rgba(180, 216, 232, 0.8)'
      }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-10" style={{
        background: isAuthError ? 'rgba(185, 28, 28, 0.6)' : 'rgba(200, 230, 245, 0.6)'
      }}></div>

      <div 
        className="relative max-w-md mx-4 p-8 rounded-2xl md:rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: isAuthError 
            ? '2px solid rgba(220, 38, 38, 0.4)' 
            : '2px solid rgba(180, 220, 240, 0.4)',
          boxShadow: isAuthError
            ? `0 0 30px rgba(220, 38, 38, 0.3),
               0 0 20px rgba(180, 220, 240, 0.15),
               inset 0 0 20px rgba(200, 230, 245, 0.03)`
            : `0 0 30px rgba(180, 220, 240, 0.3),
               0 0 20px rgba(180, 220, 240, 0.15),
               inset 0 0 20px rgba(200, 230, 245, 0.03)`
        }}
      >
        {/* Glowing orbs inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10" style={{
          background: isAuthError ? 'rgba(220, 38, 38, 0.8)' : 'rgba(180, 216, 232, 0.8)'
        }}></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-xl opacity-10" style={{
          background: isAuthError ? 'rgba(185, 28, 28, 0.6)' : 'rgba(200, 230, 245, 0.6)'
        }}></div>
        
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              background: isAuthError
                ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(180, 220, 240, 0.2) 0%, rgba(160, 210, 235, 0.1) 100%)',
              border: isAuthError
                ? '2px solid rgba(220, 38, 38, 0.4)'
                : '2px solid rgba(180, 220, 240, 0.4)',
              boxShadow: isAuthError
                ? '0 0 20px rgba(220, 38, 38, 0.3)'
                : '0 0 20px rgba(180, 220, 240, 0.3)'
            }}
          >
            {isAuthError ? (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(220, 38, 38, 0.9)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(180, 220, 240, 0.9)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            )}
          </div>

          <h2 
            className="text-2xl font-tech font-bold mb-3"
            style={{
              color: '#e8f4f8',
              textShadow: isAuthError
                ? '0 0 8px rgba(220, 38, 38, 0.3)'
                : '0 0 8px rgba(180, 220, 240, 0.3)'
            }}
          >
            {title}
          </h2>
          
          <p 
            className="mb-8 leading-relaxed"
            style={{
              color: 'rgba(220, 235, 245, 0.7)',
              textShadow: '0 0 2px rgba(180, 220, 240, 0.1)'
            }}
          >
            {description}
          </p>

          {/* CTA: (1) auth-error — обновление страницы; (2) no-telegram — ссылка на приложение в Telegram */}
          {isAuthError ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-8 py-4 font-tech font-semibold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.08) 100%)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                color: '#e8f4f8',
                boxShadow: '0 0 15px rgba(220, 38, 38, 0.3)',
                textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
              }}
            >
              <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {buttonText}
            </button>
          ) : (
            <a
              href="https://t.me/solo_level_bot/app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 font-tech font-semibold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
              style={{
                background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.15) 0%, rgba(160, 210, 235, 0.08) 100%)',
                border: '1px solid rgba(180, 220, 240, 0.4)',
                color: '#e8f4f8',
                boxShadow: '0 0 15px rgba(180, 220, 240, 0.3)',
                textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
              }}
            >
              <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              {buttonText}
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          <div 
            className="mt-6 text-xs font-tech"
            style={{
              color: 'rgba(220, 235, 245, 0.5)'
            }}
          >
            @solo_level_bot
          </div>
        </div>
      </div>
    </div>
  );
};

export const TelegramIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);