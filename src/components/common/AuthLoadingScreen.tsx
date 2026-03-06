import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils';
import LogoIcon from '../../assets/icons/logo.svg?react';

interface AuthLoadingScreenProps {
  isLoading: boolean;
  onTransitionEnd?: () => void;
}

const MIN_DISPLAY_TIME = 2000; // Минимум 2 секунды показа

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  isLoading, 
  onTransitionEnd 
}) => {
  const [isVisible, setIsVisible] = useState(isLoading);
  const [shouldRender, setShouldRender] = useState(isLoading);
  const startTimeRef = useRef<number | null>(null);
  const hasEverShownRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      hasEverShownRef.current = true;
      // Запоминаем время начала загрузки
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      setIsVisible(true);
      setShouldRender(true);
    } else if (!hasEverShownRef.current) {
      // Экран загрузки не показывался (isLoading сразу false) — сразу уведомляем
      onTransitionEnd?.();
    } else {
      // Проверяем, прошло ли минимум 2 секунды
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);

      const timer = setTimeout(() => {
        // Плавное исчезновение
        setIsVisible(false);
        // Удаляем из DOM после завершения анимации
        const fadeOutTimer = setTimeout(() => {
          setShouldRender(false);
          startTimeRef.current = null; // Сбрасываем время начала
          // Задержка перед onTransitionEnd, чтобы экран полностью исчез и браузер отрисовал кадр
          setTimeout(() => onTransitionEnd?.(), 50);
        }, 500); // Длительность анимации fade out
        return () => clearTimeout(fadeOutTimer);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, onTransitionEnd]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgb(28, 28, 32) 0%, rgb(14, 14, 16) 50%, #000000 100%)',
      }}
    >
      {/* Aura effect emanating from center */}
      <div 
        className="absolute top-1/2 left-1/2 rounded-full blur-3xl pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(200, 230, 245, 0.05) 30%, transparent 70%)',
          animation: 'auraBreathing 2s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 rounded-full blur-3xl pointer-events-none"
        style={{
          width: '800px',
          height: '800px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, rgba(180, 216, 232, 0.03) 40%, transparent 80%)',
          animation: 'auraBreathing 2.5s ease-in-out infinite',
          animationDelay: '0.3s'
        }}
      ></div>

      {/* Static logo */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative" style={{ width: '300px', height: '300px' }}>
          {/* White glow effect behind logo */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
              transform: 'scale(1.8)',
              animation: 'logoGlow 1.8s ease-in-out infinite'
            }}
          ></div>
          
          {/* Logo with rainbow plasma effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoIcon
              className="logo-loading"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes auraBreathing {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        @keyframes logoGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1.6);
          }
          50% {
            opacity: 0.7;
            transform: scale(2);
          }
        }
        
        .logo-loading {
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.25));
        }
        
        .logo-loading path {
          fill: #e8e8e8;
          animation: rainbowPlasma 3s ease-in-out infinite;
        }
        
        @keyframes rainbowPlasma {
          0% {
            fill: #e8e8e8;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 15px rgba(255, 180, 255, 0.3)) drop-shadow(0 0 25px rgba(255, 200, 255, 0.2));
          }
          16.66% {
            fill: #e8e3e8;
            filter: drop-shadow(0 0 8px rgba(255, 200, 255, 0.6)) drop-shadow(0 0 15px rgba(200, 180, 255, 0.3)) drop-shadow(0 0 25px rgba(200, 200, 255, 0.2));
          }
          33.33% {
            fill: #e3e3e8;
            filter: drop-shadow(0 0 8px rgba(200, 200, 255, 0.6)) drop-shadow(0 0 15px rgba(180, 220, 255, 0.3)) drop-shadow(0 0 25px rgba(200, 255, 255, 0.2));
          }
          50% {
            fill: #e3e8e8;
            filter: drop-shadow(0 0 8px rgba(200, 255, 255, 0.6)) drop-shadow(0 0 15px rgba(180, 255, 220, 0.3)) drop-shadow(0 0 25px rgba(200, 255, 200, 0.2));
          }
          66.66% {
            fill: #e8e8e3;
            filter: drop-shadow(0 0 8px rgba(255, 255, 200, 0.6)) drop-shadow(0 0 15px rgba(255, 220, 180, 0.3)) drop-shadow(0 0 25px rgba(255, 200, 200, 0.2));
          }
          83.33% {
            fill: #e8e3e3;
            filter: drop-shadow(0 0 8px rgba(255, 200, 200, 0.6)) drop-shadow(0 0 15px rgba(255, 180, 220, 0.3)) drop-shadow(0 0 25px rgba(255, 200, 255, 0.2));
          }
          100% {
            fill: #e8e8e8;
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 15px rgba(255, 180, 255, 0.3)) drop-shadow(0 0 25px rgba(255, 200, 255, 0.2));
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLoadingScreen;

