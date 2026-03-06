import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useTelegramWebApp } from '../hooks/useTelegram';
import { LeaderboardType } from '../api';
import Icon, { IconType } from '../components/common/Icon';
import LeaderboardView from '../components/leaderboard/LeaderboardView';
import UserProfileView from '../components/profile/UserProfileView';
import { cn, getOptimizedBlur } from '../utils';
import { globalBackButtonHandlerRef } from '../App';
import { useStreakOverlay } from '../contexts/StreakOverlayContext';

type MenuTabProps = {
  isAuthenticated: boolean;
};

type TabMode = 'main' | 'leaderboard' | 'lootboxes' | 'inventory' | 'guilds' | 'dungeons' | 'userProfile';

const MenuTab: React.FC<MenuTabProps> = ({ isAuthenticated }) => {
  const [tabMode, setTabMode] = useState<TabMode>('main');
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(LeaderboardType.LEVEL);
  const [contentLoaded, setContentLoaded] = useState(true);
  const [viewedUserId, setViewedUserId] = useState<number | null>(null);
  const { t } = useLocalization();
  const location = useLocation();
  const { backButton } = useTelegramWebApp();
  const { isOpen: isStreakOverlayOpen } = useStreakOverlay();
  const isBackButtonInitializedRef = useRef(false);
  const currentTabModeRef = useRef<TabMode>('main');

  // Проверяем, находимся ли мы на табе меню
  const isOnMenuTab = location.pathname === '/menu' || location.pathname === '/leaderboard';

  // Управление кнопкой "Назад" в Telegram - не перехватываем, когда открыт оверлей стрика
  useEffect(() => {
    if (isStreakOverlayOpen) {
      isBackButtonInitializedRef.current = false;
      return;
    }
    if (!isOnMenuTab) return;

    currentTabModeRef.current = tabMode;
    
    if (tabMode === 'leaderboard' && !isBackButtonInitializedRef.current) {
      // Показываем кнопку и устанавливаем обработчик только один раз при первом открытии лидерборда
      backButton.show();
      
      const handleBack = () => {
        const currentMode = currentTabModeRef.current;
        if (currentMode === 'userProfile') {
          // Возвращаемся в лидерборд
          setTabMode('leaderboard');
          setViewedUserId(null);
        } else {
          // Возвращаемся на главную
          setTabMode('main');
        }
      };
      
      globalBackButtonHandlerRef.current = handleBack;
      backButton.onClick(handleBack);
      isBackButtonInitializedRef.current = true;
    } else if (tabMode === 'userProfile') {
      // При открытии профиля пользователя показываем кнопку, но не меняем обработчик
      backButton.show();
    } else if (tabMode === 'main') {
      // Скрываем кнопку только при возврате на главную
      if (globalBackButtonHandlerRef.current) {
        backButton.offClick(globalBackButtonHandlerRef.current);
        globalBackButtonHandlerRef.current = null;
      }
      backButton.hide();
      isBackButtonInitializedRef.current = false;
    }
  }, [backButton, tabMode, isOnMenuTab, isStreakOverlayOpen]);

  useEffect(() => {
    if (tabMode === 'main' || tabMode === 'leaderboard') setContentLoaded(true);
  }, [tabMode]);

  const handleTabChange = (mode: TabMode) => {
    if (mode === 'lootboxes' || mode === 'inventory' || mode === 'guilds' || mode === 'dungeons') {
      return;
    }
    setTabMode(mode);
    setContentLoaded(false);
  };

  // Задержки для последовательного появления карточек (CSS animation-delay, без задержки до старта)
  const CARD_STAGGER_DELAYS = [0, 0.14, 0.28, 0.42, 0.56];

  // Главная страница меню — плашки с CSS-анимацией появления (старт в момент отрисовки)
  if (tabMode === 'main') {
    return (
      <div
        className={cn(
          "tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden",
          contentLoaded ? 'tab-content-enter-active' : ''
        )}
        style={{
          boxSizing: 'border-box',
          opacity: contentLoaded ? 1 : 0,
          transform: contentLoaded ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        }}
      >
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{
          background: 'rgba(255,255,255,0.06)'
        }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-10" style={{
          background: 'rgba(255,255,255,0.04)'
        }}></div>

        <div className="tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Карточка Таблица лидеров */}
            <button
              onClick={() => handleTabChange('leaderboard')}
              className="menu-card-enter w-full relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group h-32 flex items-center"
              style={{
                animationDelay: `${CARD_STAGGER_DELAYS[0]}s`,
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                WebkitBackdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)'
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.04) 100%)',
                backgroundSize: '200% 200%',
                animation: 'holographic-shimmer 4s ease-in-out infinite'
              }}></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-tech font-bold" style={{ color: '#f4f4f5', textShadow: '0 0 12px rgba(255,255,255,0.15)' }}>
                    {t('menu.tabs.leaderboard')}
                  </h2>
                </div>
                <div className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.9)', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}>
                  <Icon type="trophy" size={48} />
                </div>
              </div>
            </button>

            {/* Карточка Лут боксы */}
            <button
              onClick={() => handleTabChange('lootboxes')}
              disabled
              className="menu-card-enter-disabled w-full relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-not-allowed group h-32 flex items-center"
              style={{
                animationDelay: `${CARD_STAGGER_DELAYS[1]}s`,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                WebkitBackdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)'
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(255, 165, 0, 0.1) 25%, rgba(234, 88, 12, 0.08) 50%, rgba(255, 165, 0, 0.1) 75%, rgba(251, 146, 60, 0.08) 100%)',
                backgroundSize: '200% 200%',
                animation: 'holographic-shimmer 4s ease-in-out infinite'
              }}></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-tech font-bold" style={{ color: '#f4f4f5' }}>
                    {t('menu.tabs.lootboxes')}
                  </h2>
                  <p className="text-sm md:text-base font-tech mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {t('menu.lootboxes.comingSoon')}
                  </p>
                </div>
                <div className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <Icon type="gift" size={48} />
                </div>
              </div>
            </button>

            {/* Карточка Инвентарь */}
            <button
              onClick={() => handleTabChange('inventory')}
              disabled
              className="menu-card-enter-disabled w-full relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-not-allowed group h-32 flex items-center"
              style={{
                animationDelay: `${CARD_STAGGER_DELAYS[2]}s`,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                WebkitBackdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)'
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(219, 39, 119, 0.1) 25%, rgba(168, 85, 247, 0.06) 50%, rgba(219, 39, 119, 0.1) 75%, rgba(236, 72, 153, 0.08) 100%)',
                backgroundSize: '200% 200%',
                animation: 'holographic-shimmer 4s ease-in-out infinite'
              }}></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-tech font-bold" style={{ color: '#f4f4f5' }}>
                    {t('menu.tabs.inventory')}
                  </h2>
                  <p className="text-sm md:text-base font-tech mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {t('menu.inventory.comingSoon')}
                  </p>
                </div>
                <div className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <Icon type="bag" size={48} />
                </div>
              </div>
            </button>

            {/* Карточка Гильдии */}
            <button
              onClick={() => handleTabChange('guilds')}
              disabled
              className="menu-card-enter-disabled w-full relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-not-allowed group h-32 flex items-center"
              style={{
                animationDelay: `${CARD_STAGGER_DELAYS[3]}s`,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                WebkitBackdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)'
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.1) 25%, rgba(16, 185, 129, 0.08) 50%, rgba(22, 163, 74, 0.1) 75%, rgba(34, 197, 94, 0.08) 100%)',
                backgroundSize: '200% 200%',
                animation: 'holographic-shimmer 4s ease-in-out infinite'
              }}></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-tech font-bold" style={{ color: '#f4f4f5' }}>
                    {t('menu.tabs.guilds')}
                  </h2>
                  <p className="text-sm md:text-base font-tech mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {t('menu.guilds.comingSoon')}
                  </p>
                </div>
                <div className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <Icon type="users-group" size={48} />
                </div>
              </div>
            </button>

            {/* Карточка Данжи */}
            <button
              onClick={() => handleTabChange('dungeons')}
              disabled
              className="menu-card-enter-disabled w-full relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-not-allowed group h-32 flex items-center"
              style={{
                animationDelay: `${CARD_STAGGER_DELAYS[4]}s`,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                WebkitBackdropFilter: `blur(${getOptimizedBlur('20px', '8px')})`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)'
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.1) 25%, rgba(248, 113, 113, 0.06) 50%, rgba(220, 38, 38, 0.1) 75%, rgba(239, 68, 68, 0.08) 100%)',
                backgroundSize: '200% 200%',
                animation: 'holographic-shimmer 4s ease-in-out infinite'
              }}></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-tech font-bold" style={{ color: '#f4f4f5' }}>
                    {t('menu.tabs.dungeons')}
                  </h2>
                  <p className="text-sm md:text-base font-tech mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {t('menu.dungeons.comingSoon')}
                  </p>
                </div>
                <div className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <Icon type="dungeon" size={48} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Страница лидерборда
  if (tabMode === 'leaderboard') {
    return (
      <div
        className={cn(
          "tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden",
          contentLoaded ? 'tab-content-enter-active' : ''
        )}
        style={{
          boxSizing: 'border-box',
          opacity: contentLoaded ? 1 : 0,
          transform: contentLoaded ? 'translateY(0)' : 'translateY(10px)',
          transition: contentLoaded ? 'opacity 0.3s ease-out, transform 0.3s ease-out' : 'none',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{
          background: 'rgba(255,255,255,0.06)'
        }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-10" style={{
          background: 'rgba(255,255,255,0.04)'
        }}></div>

        <div className="tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 pb-24">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl font-tech font-bold mb-3 tracking-tight"
                  style={{
                    color: '#f4f4f5',
                    textShadow: '0 0 12px rgba(255,255,255,0.12)'
                  }}
                >
                  {t('menu.leaderboard.title')}
                </h1>

                <p
                  className="mb-6 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto px-4"
                  style={{
                    color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  {t('menu.leaderboard.subtitle')}
                </p>

                {/* Divider */}
                <div
                  className="w-24 sm:w-32 md:w-40 h-1 rounded-full mx-auto mb-6"
                  style={{
                    background: 'rgba(180, 220, 240, 0.6)',
                    boxShadow: '0 0 8px rgba(180, 220, 240, 0.4)'
                  }}
                ></div>
              </div>
            </div>

            <LeaderboardView
              isAuthenticated={isAuthenticated}
              leaderboardType={leaderboardType}
              onTypeChange={setLeaderboardType}
              onUserClick={(userId) => {
                setViewedUserId(userId);
                setTabMode('userProfile');
                setContentLoaded(false);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Профиль пользователя
  if (tabMode === 'userProfile' && viewedUserId) {
    return (
      <UserProfileView
        userId={viewedUserId}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  // Заглушки для других функционалов
  const getIconForTab = (mode: TabMode): IconType => {
    switch (mode) {
      case 'lootboxes':
        return 'gift';
      case 'inventory':
        return 'bag';
      case 'guilds':
        return 'users-group';
      case 'dungeons':
        return 'dungeon';
      default:
        return 'bag';
    }
  };

  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
        <Icon type={getIconForTab(tabMode)} size={64} />
      </div>
      <h3
        className="text-xl font-tech font-semibold mb-2"
        style={{
          color: '#e8f4f8',
          textShadow: '0 0 8px rgba(180, 220, 240, 0.3)'
        }}
      >
        {t(`menu.${tabMode}.comingSoon`)}
      </h3>
      <p
        className="text-sm"
        style={{
          color: 'rgba(255,255,255,0.7)'
        }}
      >
        {t(`menu.${tabMode}.description`)}
      </p>
    </div>
  );
};

export default MenuTab;
