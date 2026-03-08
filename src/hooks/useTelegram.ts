import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { useMocks } from '../config/environment';

// Получаем WebApp объект (реальный или моковый)
const getWebApp = () => {
  if (useMocks) {
    // В мок режиме используем мок из window
    return (window as any).Telegram?.WebApp || WebApp;
  }
  return WebApp;
};

export function useTelegram() {
  // Получаем webApp динамически, чтобы учесть моки
  const [webApp, setWebApp] = useState(() => getWebApp());
  const [user, setUser] = useState(() => webApp.initDataUnsafe?.user);
  const [initData, setInitData] = useState(() => webApp.initData || '');
  const [tgWebAppData, setTgWebAppData] = useState(() => webApp.initDataUnsafe);

  useEffect(() => {
    // Обновляем webApp, если моки были инициализированы позже
    const currentWebApp = getWebApp();
    setWebApp(currentWebApp);
    
    // Уведомляем Telegram, что приложение готово
    if (currentWebApp.ready) {
      currentWebApp.ready();
      
      const platform = currentWebApp.platform;
      const isDesktop = platform === 'macos' || platform === 'windows' || platform === 'linux' || platform === 'web';
      const isMobile = platform === 'ios' || platform === 'android';
      
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
          } else if (typeof (currentWebApp as any).postEvent === 'function') {
            (currentWebApp as any).postEvent(eventType, eventData);
          } else if (typeof (window as any).Telegram?.WebApp?.postEvent === 'function') {
            (window as any).Telegram.WebApp.postEvent(eventType, eventData);
          } else if (isMobile && currentWebApp.expand && !currentWebApp.isExpanded) {
              currentWebApp.expand();
          }
        } catch (error) {
          if (isMobile && currentWebApp.expand && !currentWebApp.isExpanded) {
            try {
              currentWebApp.expand();
            } catch (expandError) {
              // Silent fail
            }
          }
        }
      };
      
      if (isMobile) {
        setTimeout(() => postEvent('web_app_request_fullscreen'), 100);
      } else if (isDesktop) {
        setTimeout(() => {
          if (currentWebApp.expand && !currentWebApp.isExpanded) {
            currentWebApp.expand();
          } else {
            postEvent('web_app_expand');
          }
        }, 100);
      }
      }
    
    // Отключаем возможность закрытия свайпом
    if (currentWebApp.disableVerticalSwipes) {
      currentWebApp.disableVerticalSwipes();
    }
    
    
    // Устанавливаем начальные данные
    const newUser = currentWebApp.initDataUnsafe?.user;
    const newInitData = currentWebApp.initData || '';
    const newTgWebAppData = currentWebApp.initDataUnsafe;
    
    setUser(newUser);
    setInitData(newInitData);
    setTgWebAppData(newTgWebAppData);
    
    // Если данные все еще пустые и используем моки, ждем немного и проверяем снова
    if (useMocks && (!newInitData || !newTgWebAppData)) {
      const timeoutId = setTimeout(() => {
        const updatedWebApp = getWebApp();
        if (updatedWebApp.initData || updatedWebApp.initDataUnsafe) {
          setInitData(updatedWebApp.initData || '');
          setTgWebAppData(updatedWebApp.initDataUnsafe);
          setUser(updatedWebApp.initDataUnsafe?.user);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { 
    user, 
    initData, 
    tgWebAppData, 
    webApp,
    isAvailable: true // WebApp всегда доступен при использовании SDK или моков
  };
}

// Хук для работы с Telegram WebApp функциями
export function useTelegramWebApp() {
  const { webApp } = useTelegram();

  const showAlert = (message: string, callback?: () => void) => {
    try {
      if (webApp.showAlert) {
        webApp.showAlert(message, callback);
      } else {
        // Fallback для обычного браузера или моков
        window.alert(message);
        if (callback) callback();
      }
    } catch (error) {
      console.error('Error showing alert:', error);
      // Fallback для обычного браузера
      window.alert(message);
      if (callback) callback();
    }
  };

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    try {
      if (webApp.showConfirm) {
        webApp.showConfirm(message, callback);
      } else {
        // Fallback для обычного браузера или моков
        const confirmed = window.confirm(message);
        callback(confirmed);
      }
    } catch (error) {
      console.error('Error showing confirm:', error);
      // Fallback для обычного браузера
      const confirmed = window.confirm(message);
      callback(confirmed);
    }
  };

  const showPopup = (params: {
    title: string;
    message: string;
    buttons: Array<{
      id?: string;
      type: 'default' | 'destructive';
      text: string;
    }>;
  }, callback: (buttonId: string | undefined) => void) => {
    try {
      if (webApp.showPopup) {
        webApp.showPopup(params, callback);
      } else {
        // Fallback для обычного браузера или моков
        const buttonTexts = params.buttons.map(btn => btn.text).join(' | ');
        const result = window.prompt(`${params.title}\n\n${params.message}\n\nДоступные кнопки: ${buttonTexts}\nВведите ID кнопки:`);
        if (result) {
          callback(result);
        }
      }
    } catch (error) {
      console.error('Error showing popup:', error);
      // Fallback для обычного браузера
      const buttonTexts = params.buttons.map(btn => btn.text).join(' | ');
      const result = window.prompt(`${params.title}\n\n${params.message}\n\nДоступные кнопки: ${buttonTexts}\nВведите ID кнопки:`);
      if (result) {
        callback(result);
      }
    }
  };



  const hapticFeedback = {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      try {
        if (webApp.HapticFeedback?.impactOccurred) {
          webApp.HapticFeedback.impactOccurred(style);
        }
      } catch (error) {
        console.error('Error with haptic feedback:', error);
      }
    },
    notificationOccurred: (type: 'error' | 'success' | 'warning') => {
      try {
        if (webApp.HapticFeedback?.notificationOccurred) {
          webApp.HapticFeedback.notificationOccurred(type);
        }
      } catch (error) {
        console.error('Error with haptic feedback:', error);
      }
    },
    selectionChanged: () => {
      try {
        if (webApp.HapticFeedback?.selectionChanged) {
          webApp.HapticFeedback.selectionChanged();
        }
      } catch (error) {
        console.error('Error with haptic feedback:', error);
      }
    }
  };

  const mainButton = {
    show: () => {
      try {
        if (webApp.MainButton?.show) {
          webApp.MainButton.show();
        }
      } catch (error) {
        console.error('Error showing main button:', error);
      }
    },
    hide: () => {
      try {
        if (webApp.MainButton?.hide) {
          webApp.MainButton.hide();
        }
      } catch (error) {
        console.error('Error hiding main button:', error);
      }
    },
    setText: (text: string) => {
      try {
        if (webApp.MainButton?.setText) {
          webApp.MainButton.setText(text);
        }
      } catch (error) {
        console.error('Error setting main button text:', error);
      }
    },
    onClick: (callback: () => void) => {
      try {
        if (webApp.MainButton?.onClick) {
          webApp.MainButton.onClick(callback);
        }
      } catch (error) {
        console.error('Error setting main button click:', error);
      }
    },
    showProgress: (leaveActive?: boolean) => {
      try {
        if (webApp.MainButton?.showProgress) {
          webApp.MainButton.showProgress(leaveActive);
        }
      } catch (error) {
        console.error('Error showing main button progress:', error);
      }
    },
    hideProgress: () => {
      try {
        if (webApp.MainButton?.hideProgress) {
          webApp.MainButton.hideProgress();
        }
      } catch (error) {
        console.error('Error hiding main button progress:', error);
      }
    }
  };

  const backButton = {
    show: () => {
      try {
        if (webApp.BackButton?.show) {
          webApp.BackButton.show();
        }
      } catch (error) {
        console.error('Error showing back button:', error);
      }
    },
    hide: () => {
      try {
        if (webApp.BackButton?.hide) {
          webApp.BackButton.hide();
        }
      } catch (error) {
        console.error('Error hiding back button:', error);
      }
    },
    onClick: (callback: () => void) => {
      try {
        if (webApp.BackButton?.onClick) {
          webApp.BackButton.onClick(callback);
        }
      } catch (error) {
        console.error('Error setting back button click:', error);
      }
    },
    offClick: (callback: () => void) => {
      try {
        if (webApp.BackButton?.offClick) {
          webApp.BackButton.offClick(callback);
        }
      } catch (error) {
        console.error('Error removing back button click:', error);
      }
    }
  };

  const cloudStorage = {
    getItem: async (key: string): Promise<string | null> => {
      try {
        if (webApp.CloudStorage?.getItem) {
          return new Promise((resolve) => {
            webApp.CloudStorage.getItem(key, (error: Error | null, value: string | null) => {
              if (error) {
                console.error('Error getting cloud storage item:', error);
                // Fallback на localStorage
                if (typeof window !== 'undefined' && window.localStorage) {
                  resolve(window.localStorage.getItem(key));
                } else {
                  resolve(null);
                }
              } else {
                resolve(value);
              }
            });
          });
        }
        // Fallback на localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      } catch (error) {
        console.error('Error getting cloud storage item:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        if (webApp.CloudStorage?.setItem) {
          return new Promise((resolve, reject) => {
            webApp.CloudStorage.setItem(key, value, (error: Error | null) => {
              if (error) {
                console.error('Error setting cloud storage item:', error);
                // Fallback на localStorage
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem(key, value);
                }
                reject(error);
              } else {
                resolve();
              }
            });
          });
        }
        // Fallback на localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (error) {
        console.error('Error setting cloud storage item:', error);
        // Fallback на localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        if (webApp.CloudStorage?.removeItem) {
          return new Promise((resolve, reject) => {
            webApp.CloudStorage.removeItem(key, (error: Error | null) => {
              if (error) {
                console.error('Error removing cloud storage item:', error);
                // Fallback на localStorage
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.removeItem(key);
                }
                reject(error);
              } else {
                resolve();
              }
            });
          });
        }
        // Fallback на localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Error removing cloud storage item:', error);
        // Fallback на localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      }
    },
    getKeys: async (): Promise<string[]> => {
      try {
        if (webApp.CloudStorage?.getKeys) {
          return new Promise((resolve) => {
            webApp.CloudStorage.getKeys((error: Error | null, keys: string[]) => {
              if (error) {
                console.error('Error getting cloud storage keys:', error);
                // Fallback на localStorage
                if (typeof window !== 'undefined' && window.localStorage) {
                  resolve(Object.keys(window.localStorage));
                } else {
                  resolve([]);
                }
              } else {
                resolve(keys);
              }
            });
          });
        }
        // Fallback на localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          return Object.keys(window.localStorage);
        }
        return [];
      } catch (error) {
        console.error('Error getting cloud storage keys:', error);
        return [];
      }
    }
  };

  // Функции для управления свайпами
  const swipeControl = {
    disableVerticalSwipes: () => {
      try {
        if (webApp.disableVerticalSwipes) {
          webApp.disableVerticalSwipes();
        }
      } catch (error) {
        console.error('Error disabling vertical swipes:', error);
      }
    },
    enableVerticalSwipes: () => {
      try {
        if (webApp.enableVerticalSwipes) {
          webApp.enableVerticalSwipes();
        }
      } catch (error) {
        console.error('Error enabling vertical swipes:', error);
      }
    },
    enableClosingConfirmation: () => {
      try {
        if (webApp.enableClosingConfirmation) {
          webApp.enableClosingConfirmation();
        }
      } catch (error) {
        console.error('Error enabling closing confirmation:', error);
      }
    },
    disableClosingConfirmation: () => {
      try {
        if (webApp.disableClosingConfirmation) {
          webApp.disableClosingConfirmation();
        }
      } catch (error) {
        console.error('Error disabling closing confirmation:', error);
      }
    }
  };

  return {
    webApp,
    isAvailable: true,
    showAlert,
    showConfirm,
    showPopup,
    hapticFeedback,
    mainButton,
    backButton,
    cloudStorage,
    swipeControl
  };
} 