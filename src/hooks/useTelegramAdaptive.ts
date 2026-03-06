import { useEffect } from 'react';
import { useTelegram } from './useTelegram';

/**
 * Централизованный хук для управления адаптивностью Telegram Mini App
 * - Определяет тип устройства (mobile/desktop)
 * - Управляет полноэкранным режимом через web_app_request_fullscreen/web_app_expand
 * - Управляет CSS классами для адаптивных стилей
 */
export function useTelegramAdaptive() {
  const { webApp } = useTelegram();

  useEffect(() => {
    const tg = webApp || (window as any).Telegram?.WebApp;
    
    // Функция для определения desktop по дополнительным признакам
    const detectDesktopByFallback = (): boolean => {
      // Проверяем userAgent для определения desktop
      const userAgent = navigator.userAgent.toLowerCase();
      const isDesktopUA = /macintosh|mac os x|windows|linux/.test(userAgent) && !/mobile|android|iphone|ipad/.test(userAgent);
      
      // Проверяем размер экрана (desktop обычно шире)
      const isWideScreen = window.innerWidth >= 768;
      
      // Проверяем наличие мыши (touch devices обычно не имеют мыши)
      const hasMouse = window.matchMedia('(pointer: fine)').matches;
      
      return isDesktopUA || (isWideScreen && hasMouse);
    };
    
    if (tg) {
      const platform = tg.platform;
      
      // Определяем desktop: явно указанные платформы
      const isDesktopByPlatform = platform === 'macos' || platform === 'windows' || platform === 'linux' || platform === 'web';
      const isMobileByPlatform = platform === 'ios' || platform === 'android';
      
      // Если platform не определен, пустая строка, или не распознан - используем fallback
      const platformIsValid = platform && typeof platform === 'string' && platform.trim() !== '';
      
      let finalIsDesktop: boolean;
      let finalIsMobile: boolean;
      
      if (isDesktopByPlatform) {
        finalIsDesktop = true;
        finalIsMobile = false;
      } else if (isMobileByPlatform) {
        finalIsDesktop = false;
        finalIsMobile = true;
      } else if (!platformIsValid) {
        // Platform не определен или пустой - используем fallback
        const fallbackIsDesktop = detectDesktopByFallback();
        finalIsDesktop = fallbackIsDesktop;
        finalIsMobile = !fallbackIsDesktop;
      } else {
        // Platform определен, но не распознан - используем fallback
        const fallbackIsDesktop = detectDesktopByFallback();
        finalIsDesktop = fallbackIsDesktop;
        finalIsMobile = !fallbackIsDesktop;
      }
      
      if (finalIsDesktop) {
        document.body.classList.add('desktop-version');
        document.body.classList.remove('mobile-version', 'android', 'ios');
        
        if (!tg.isExpanded && tg.expand) {
          setTimeout(() => {
            if (!tg.isExpanded) {
              tg.expand();
            }
          }, 500);
        }
      } else if (finalIsMobile) {
        document.body.classList.add('mobile-version');
        document.body.classList.remove('desktop-version');
        if (platform === 'android') {
          document.body.classList.add('android');
          document.body.classList.remove('ios');
        } else if (platform === 'ios') {
          document.body.classList.add('ios');
          document.body.classList.remove('android');
        } else {
          document.body.classList.remove('android', 'ios');
        }
        
        const postEvent = (eventType: string, eventData?: any) => {
          try {
            if (platform === 'web') {
              const message = JSON.stringify({
                eventType: eventType,
                eventData: eventData || {}
              });
              window.parent.postMessage(message, 'https://web.telegram.org');
            } else if (typeof (window as any).TelegramWebviewProxy?.postEvent === 'function') {
              const data = eventData ? JSON.stringify(eventData) : '';
              (window as any).TelegramWebviewProxy.postEvent(eventType, data);
            } else if (typeof (tg as any).postEvent === 'function') {
              (tg as any).postEvent(eventType, eventData);
            } else if (typeof (window as any).Telegram?.WebApp?.postEvent === 'function') {
              (window as any).Telegram.WebApp.postEvent(eventType, eventData);
            } else if (tg.expand && !tg.isExpanded) {
                tg.expand();
            }
          } catch (error) {
            if (tg.expand && !tg.isExpanded) {
              try {
                tg.expand();
              } catch (expandError) {
                // Silent fail
              }
            }
          }
        };
        
        if (!tg.isExpanded) {
          setTimeout(() => {
            if (!tg.isExpanded) {
              postEvent('web_app_request_fullscreen');
            }
          }, 500);
          
          setTimeout(() => {
            if (!tg.isExpanded) {
              postEvent('web_app_request_fullscreen');
            }
          }, 1000);
        }
      } else {
        // Fallback: если ничего не определилось, считаем desktop по размеру экрана
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          document.body.classList.add('mobile-version');
          document.body.classList.remove('desktop-version');
          document.body.classList.remove('android', 'ios');
        } else {
          document.body.classList.add('desktop-version');
          document.body.classList.remove('mobile-version', 'android', 'ios');
        }
      }
    } else {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        document.body.classList.add('mobile-version');
        document.body.classList.remove('desktop-version');
        document.body.classList.remove('android', 'ios');
      } else {
        document.body.classList.add('desktop-version');
        document.body.classList.remove('mobile-version', 'android', 'ios');
      }
    }
  }, [webApp]);
}
