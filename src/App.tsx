import {useEffect, useState, lazy, Suspense} from 'react';
import { createPortal } from 'react-dom';
import './App.css';
import { config } from './config/environment';
import MaintenanceScreen from './components/common/MaintenanceScreen';

const TasksTab = lazy(() => import('./tabs/TasksTab'));
const ProfileTab = lazy(() => import('./tabs/ProfileTab'));
const BalanceTab = lazy(() => import('./tabs/BalanceTab'));
const MenuTab = lazy(() => import('./tabs/MenuTab'));
import BottomBar from './components/layout/BottomBar';
import {TelegramWidget} from './components/common/TelegramWidget';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
const WelcomeTab = lazy(() => import('./tabs/WelcomeTab'));
import {useAuth} from './hooks/useAuth';
import {useLocaleSync} from './hooks/useLocaleSync';
import {useWebSocketNotifications} from './hooks/useWebSocketNotifications';
import {NotificationProvider} from './components/common/NotificationSystem';
import {useTelegram, useTelegramWebApp} from './hooks/useTelegram';
import {ModalProvider, useModal} from './contexts/ModalContext';
import {useTelegramAdaptive} from './hooks/useTelegramAdaptive';
import AuthLoadingScreen from './components/common/AuthLoadingScreen';
import SessionExpiredDialog from './components/dialogs/SessionExpiredDialog';
import {auth} from './auth';
import ConfirmDialog from './components/dialogs/ConfirmDialog';
import {useUiUpdate} from './hooks/useUiUpdate';
import {useLocalization} from './hooks/useLocalization';
import {AppDataProvider} from './contexts/AppDataContext';
import {StreakOverlayProvider} from './contexts/StreakOverlayContext';
import TopBar from './components/layout/TopBar';
import { DayStreakNavigator } from './components/streak/DayStreakNavigator';
import { DayStreakOverlay } from './components/streak/DayStreakOverlay';
import { DayStreakOverlayProvider, useDayStreakOverlay } from './contexts/DayStreakOverlayContext';
const StreakCalendarTab = lazy(() => import('./tabs/StreakCalendarTab'));
import {BackButtonStreakSync} from './components/streak/BackButtonStreakSync';

// Глобальный ref для хранения обработчика кнопки "Назад" (экспортируем для использования в MenuTab)
export const globalBackButtonHandlerRef = { current: null as (() => void) | null };

function AuthenticatedLayout({
  isAuthenticated,
  isBottomBarVisible,
  isLoadingScreenClosed,
}: {
  isAuthenticated: boolean;
  isBottomBarVisible: boolean;
  isLoadingScreenClosed: boolean;
}) {
  const { isOpen: isDayStreakOverlayOpen } = useDayStreakOverlay();

  return (
    <>
      {isAuthenticated && (
        <>
          <BackButtonStreakSync />
          {!isDayStreakOverlayOpen && (
            <div className="topbar-wrapper relative z-50 shrink-0">
              <TopBar />
            </div>
          )}
        </>
      )}
      <main className={`tab-content custom-scrollbar flex flex-col relative z-0 ${isAuthenticated ? 'tab-content-with-top-bar' : ''} ${isBottomBarVisible && !isDayStreakOverlayOpen ? 'tab-content-with-bottom-bar' : 'tab-content-without-bottom-bar'}`}>
        <div className="relative flex-1 min-h-0 flex flex-col">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<WelcomeTab canStartAnimation={isLoadingScreenClosed} />}/>
              <Route path="/welcome" element={<WelcomeTab canStartAnimation={isLoadingScreenClosed} />}/>
              <Route path="/tasks" element={<TasksTab isAuthenticated={isAuthenticated}/>}/>
              <Route path="/profile" element={<ProfileTab isAuthenticated={isAuthenticated}/>}/>
              <Route path="/menu" element={<MenuTab isAuthenticated={isAuthenticated}/>}/>
              <Route path="/leaderboard" element={<MenuTab isAuthenticated={isAuthenticated}/>}/>
              <Route path="/balance" element={<BalanceTab isAuthenticated={isAuthenticated}/>}/>
              <Route path="/streak" element={<StreakCalendarTab />}/>
              <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
          </Suspense>
        </div>
      </main>
      {isAuthenticated && (
        <BottomBar
          isAuthenticated={isAuthenticated}
          isVisible={isBottomBarVisible && !isDayStreakOverlayOpen}
        />
      )}
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { isBottomBarVisible } = useModal();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { backButton } = useTelegramWebApp();
  const { t } = useLocalization();
  const { isUpdateAvailable, reason: updateReason, refreshNow } = useUiUpdate();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  // Инициализируем Telegram WebApp
  useTelegram();
  
  // Централизованное управление адаптивностью (определение устройства, полноэкранный режим, CSS классы)
  useTelegramAdaptive();

  // Используем новые хуки для разделения логики
  const {
    isAuthenticated,
    showNoTelegramError,
    isTelegramChecked,
    authError,
    isAuthLoading,
    authPromise
  } = useAuth();
  // Single GetAppData bootstrap after auth: locale + all initial data for AppDataProvider
  const { isLocaleLoading, localeLoaded, appData } = useLocaleSync(isAuthenticated);

  // Подключение к WebSocket после успешной авторизации
  useWebSocketNotifications({enabled: isAuthenticated, authPromise});

  // Скрываем кнопку "Назад" когда пользователь не авторизован (логика для авторизованных — в BackButtonStreakSync)
  useEffect(() => {
    if (!isAuthenticated) {
      if (globalBackButtonHandlerRef.current) {
        backButton.offClick(globalBackButtonHandlerRef.current);
        globalBackButtonHandlerRef.current = null;
      }
      backButton.hide();
    }
  }, [isAuthenticated, backButton]);

  // Регистрируем callback для обработки истечения сессии
  useEffect(() => {
    auth.onSessionExpired(() => {
      setIsSessionExpired(true);
    });
  }, []);

  useEffect(() => {
    if (isUpdateAvailable) setIsUpdateDialogOpen(true);
  }, [isUpdateAvailable]);

  // Автоматический скролл наверх при смене маршрута
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({top: 0, left: 0, behavior: 'auto'});
    }
  }, [location.pathname]);

  // Обработчик обновления страницы при истечении сессии
  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleUpdateConfirm = () => {
    refreshNow();
  };

  const handleUpdateCancel = () => {
    // Мягкий режим: не форсим reload, просто закрываем.
    // Если пользователю реально прилетит chunk 404 — сработает ChunkLoadError и мы снова предложим обновиться.
    setIsUpdateDialogOpen(false);
  };


  // Показываем экран загрузки пока идет авторизация ИЛИ (после авторизации) загрузка локализации
  // Локализация загружается только после успешной авторизации
  // Если пользователь авторизован, показываем загрузку пока локализация не загружена
  const shouldShowLoading = isAuthLoading || (isAuthenticated && (isLocaleLoading || !localeLoaded));
  const [isLoadingScreenClosed, setIsLoadingScreenClosed] = useState(false);

  return (
      <div className="App">
        {/* Экран загрузки авторизации и локализации */}
        <AuthLoadingScreen
          isLoading={shouldShowLoading}
          onTransitionEnd={() => setIsLoadingScreenClosed(true)}
        />
        
        {/* Диалог истечения сессии */}
        <SessionExpiredDialog 
          isOpen={isSessionExpired} 
          onRefresh={handleRefreshPage}
        />

        <ConfirmDialog
          isOpen={isUpdateDialogOpen}
          message={
            updateReason === 'chunk_load_error'
              ? t('dialogs.uiUpdate.chunkErrorMessage')
              : t('dialogs.uiUpdate.message')
          }
          onConfirm={handleUpdateConfirm}
          onCancel={handleUpdateCancel}
          confirmText={t('dialogs.uiUpdate.refreshButton')}
          cancelText={t('dialogs.uiUpdate.laterButton')}
        />
        
        {!isTelegramChecked ? null : (
            <>
              {showNoTelegramError && (
                  <TelegramWidget type="no-telegram"/>
              )}
              {authError && !showNoTelegramError && (
                  <TelegramWidget type="auth-error" errorMessage={authError}/>
              )}
              {!showNoTelegramError && !authError && (isAuthenticated ? appData != null : true) && (
                  <AppDataProvider
                    isAuthenticated={isAuthenticated}
                    initialData={appData}
                  >
                    <DayStreakOverlayProvider>
                      <StreakOverlayProvider>
                        <AuthenticatedLayout
                          isAuthenticated={isAuthenticated}
                          isBottomBarVisible={isBottomBarVisible}
                          isLoadingScreenClosed={isLoadingScreenClosed}
                        />
                        <DayStreakOverlay />
                        <DayStreakNavigator />
                      </StreakOverlayProvider>
                    </DayStreakOverlayProvider>
                  </AppDataProvider>
              )}
            </>
        )}
      </div>
  );
}

const appBackground = (
  <div className="app-background-layer" aria-hidden>
    <div className="app-background-glow app-background-glow-1" />
    <div className="app-background-glow app-background-glow-2" />
  </div>
);

export default function App() {
  if (config.isMaintenanceMode) {
    return (
      <>
        {createPortal(appBackground, document.body)}
        <MaintenanceScreen />
      </>
    );
  }

  return (
      <>
        {createPortal(appBackground, document.body)}
        <ModalProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes/>
            </Router>
          </NotificationProvider>
        </ModalProvider>
      </>
  );
}
