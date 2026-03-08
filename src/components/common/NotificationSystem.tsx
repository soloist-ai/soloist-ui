import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../contexts/ModalContext';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Компонент отдельного уведомления
const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = React.memo(({ notification, onRemove }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { isTaskDialogOpen, isOverlayOpen } = useModal();
  const shouldPauseTimer = isTaskDialogOpen || isOverlayOpen;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Время для анимации исчезновения
  }, [notification.id, onRemove]);

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notification.duration || notification.duration <= 0) return;

    // Если открыт Dialog или Overlay — останавливаем таймер и сохраняем прошедшее время
    if (shouldPauseTimer) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        elapsedTimeRef.current += Date.now() - startTimeRef.current;
      }
      startTimeRef.current = Date.now();
      return;
    }

    // Если dialog закрыт, запускаем/возобновляем таймер
    const remainingTime = notification.duration - elapsedTimeRef.current;
    if (remainingTime > 0) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleRemove();
      }, remainingTime);
    } else {
      // Если время уже истекло, удаляем сразу
      handleRemove();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [notification.duration, handleRemove, shouldPauseTimer]);

  // Мемоизируем стили для предотвращения пересчета при каждом рендере
  const notificationStyles = useMemo(() => {
    const baseStyles = "relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg backdrop-blur-md border transition-all duration-300 ease-out transform";
    return baseStyles;
  }, []);

  const backgroundStyle = useMemo(() => {
    switch (notification.type) {
      case 'success':
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '2px solid rgba(34, 197, 94, 0.4)',
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1), inset 0 0 20px rgba(34, 197, 94, 0.05)',
        };
      case 'info':
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '2px solid rgba(180, 220, 240, 0.4)',
          boxShadow: '0 0 20px rgba(180, 220, 240, 0.3), 0 0 40px rgba(180, 220, 240, 0.1), inset 0 0 20px rgba(180, 220, 240, 0.05)',
        };
      case 'warning':
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '2px solid rgba(251, 191, 36, 0.4)',
          boxShadow: '0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.1), inset 0 0 20px rgba(251, 191, 36, 0.05)',
        };
      case 'error':
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '2px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1), inset 0 0 20px rgba(239, 68, 68, 0.05)',
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          border: '2px solid rgba(180, 220, 240, 0.4)',
          boxShadow: '0 0 20px rgba(180, 220, 240, 0.3), 0 0 40px rgba(180, 220, 240, 0.1), inset 0 0 20px rgba(180, 220, 240, 0.05)',
        };
    }
  }, [notification.type]);

  // Мемоизируем иконку и её стили
  const iconElement = useMemo(() => {
    const getIconStyle = () => {
      switch (notification.type) {
        case 'success':
          return {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.2) 100%)',
            border: '2px solid rgba(34, 197, 94, 0.6)',
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.4), inset 0 0 10px rgba(34, 197, 94, 0.1)',
            color: '#22c55e',
          };
        case 'info':
          return {
            background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.3) 0%, rgba(160, 210, 235, 0.2) 100%)',
            border: '2px solid rgba(180, 220, 240, 0.6)',
            boxShadow: '0 0 15px rgba(180, 220, 240, 0.4), inset 0 0 10px rgba(180, 220, 240, 0.1)',
            color: '#b4dcf0',
          };
        case 'warning':
          return {
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)',
            border: '2px solid rgba(251, 191, 36, 0.6)',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.4), inset 0 0 10px rgba(251, 191, 36, 0.1)',
            color: '#fbbf24',
          };
        case 'error':
          return {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.6)',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
          };
        default:
          return {
            background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.3) 0%, rgba(160, 210, 235, 0.2) 100%)',
            border: '2px solid rgba(180, 220, 240, 0.6)',
            boxShadow: '0 0 15px rgba(180, 220, 240, 0.4), inset 0 0 10px rgba(180, 220, 240, 0.1)',
            color: '#b4dcf0',
          };
      }
    };

    const iconStyle = getIconStyle();

    switch (notification.type) {
      case 'success':
        return (
          <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={iconStyle}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: iconStyle.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={iconStyle}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: iconStyle.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={iconStyle}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: iconStyle.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={iconStyle}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: iconStyle.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center" style={iconStyle}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: iconStyle.color }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  }, [notification.type]);

  return (
    <div
      className={`
        ${notificationStyles}
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isRemoving ? 'translate-x-full opacity-0 scale-95' : ''}
        w-full sm:max-w-sm
      `}
      style={{
        ...backgroundStyle,
        transform: isVisible && !isRemoving ? 'translateX(0)' : 'translateX(100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Glowing orbs */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none" style={{
        background: notification.type === 'info' 
          ? 'rgba(180, 220, 240, 0.8)'
          : notification.type === 'success'
          ? 'rgba(34, 197, 94, 0.8)'
          : notification.type === 'warning'
          ? 'rgba(251, 191, 36, 0.8)'
          : 'rgba(239, 68, 68, 0.8)'
      }}></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full blur-xl opacity-10 pointer-events-none" style={{
        background: notification.type === 'info' 
          ? 'rgba(200, 230, 245, 0.6)'
          : notification.type === 'success'
          ? 'rgba(16, 185, 129, 0.6)'
          : notification.type === 'warning'
          ? 'rgba(245, 158, 11, 0.6)'
          : 'rgba(220, 38, 38, 0.6)'
      }}></div>

      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {iconElement}
          </div>
          
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm font-tech font-medium leading-relaxed"
              style={{
                color: '#e8f4f8',
                textShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
              }}
            >
              {notification.message}
            </p>
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-1 rounded-full transition-all duration-200 group"
            style={{
              color: 'rgba(220, 235, 245, 0.6)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e8f4f8';
              e.currentTarget.style.background = 'rgba(220, 235, 245, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(220, 235, 245, 0.6)';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label={t('common.closeNotification')}
          >
            <svg className="w-4 h-4 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  return (
    prevProps.notification.id === nextProps.notification.id &&
    prevProps.notification.message === nextProps.notification.message &&
    prevProps.notification.type === nextProps.notification.type &&
    prevProps.notification.duration === nextProps.notification.duration &&
    prevProps.onRemove === nextProps.onRemove
  );
});

// Контейнер для уведомлений
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const { isOverlayOpen } = useModal();

  return (
    <div
      className="fixed top-[4rem] right-4 left-4 sm:left-auto sm:right-4 z-50 space-y-3 pointer-events-none notification-container"
      style={{ zIndex: isOverlayOpen ? 0 : undefined }}
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto w-full sm:w-auto">
          <NotificationItem
            notification={notification}
            onRemove={removeNotification}
          />
        </div>
      ))}
    </div>
  );
};

// Провайдер контекста
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 2500, // По умолчанию 2.5 секунды
    };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Хук для показа уведомлений
export const useNotification = () => {
  const { addNotification } = useNotifications();
  
  return {
    show: addNotification,
    success: (message: string, duration?: number) => 
      addNotification({ message, type: 'success', duration }),
    info: (message: string, duration?: number) => 
      addNotification({ message, type: 'info', duration }),
    warning: (message: string, duration?: number) => 
      addNotification({ message, type: 'warning', duration }),
    error: (message: string, duration?: number) => 
      addNotification({ message, type: 'error', duration }),
  };
};
