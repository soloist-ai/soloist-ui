import {useState, useEffect, useRef} from 'react';
import {useTelegram} from './useTelegram';
import {auth} from '../auth';
import type {LoginResponse} from '../api';
import {useMocks} from '../config/environment';

// Глобальный кэш для предотвращения множественных авторизаций
let globalAuthPromise: Promise<LoginResponse> | null = null;

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNoTelegramError, setShowNoTelegramError] = useState(false);
  const [isTelegramChecked, setIsTelegramChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const authPromiseRef = useRef<Promise<LoginResponse> | null>(null);

  const {initData, tgWebAppData} = useTelegram();

  // В мок-режиме пропускаем Telegram-авторизацию
  useEffect(() => {
    if (useMocks) {
      setIsAuthenticated(true);
      setIsTelegramChecked(true);
      setShowNoTelegramError(false);
      setAuthError(null);
      setIsAuthLoading(false);
    }
  }, []);

  // Шаг 1: Авторизация через Telegram при загрузке приложения
  useEffect(() => {
    if (useMocks) return;
    if (initData !== undefined && tgWebAppData !== undefined) {
      if (initData && tgWebAppData) {
        // Используем глобальный кэш для предотвращения множественных авторизаций
        if (!globalAuthPromise) {
          setIsAuthLoading(true);
          globalAuthPromise = auth.loginWithTelegram(initData, tgWebAppData);
          // Регистрируем промис в auth для использования в getTokenForRequest
          auth.setAuthPromise(globalAuthPromise);
        } else {
          setIsAuthLoading(true);
        }
        
        authPromiseRef.current = globalAuthPromise;

        globalAuthPromise
        .then(() => {
          setAuthError(null);
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          // После успешной авторизации ждем немного перед сбросом промиса,
          // чтобы все запросы, начатые во время авторизации, успели получить токен
          setTimeout(() => {
            auth.setAuthPromise(null);
          }, 100);
        })
        .catch((e) => {
          setAuthError(e.message || 'Ошибка авторизации');
          setIsAuthenticated(false);
          setIsAuthLoading(false);
          globalAuthPromise = null; // Сбрасываем кэш при ошибке
          auth.setAuthPromise(null); // Сбрасываем промис в auth
          console.error('[Auth] Authentication failed:', e);
        });
        setShowNoTelegramError(false);
      } else {
        setShowNoTelegramError(true);
        setAuthError(null);
        setIsAuthenticated(false);
        setIsAuthLoading(false);
      }
      setIsTelegramChecked(true);
    }
  }, [initData, tgWebAppData]);

  // Шаг 2: Проверяем, есть ли уже сохраненные токены в localStorage
  // Важно: не проверяем пока идёт логин (isAuthLoading), иначе старые протухшие
  // токены в localStorage приведут к преждевременному isAuthenticated=true,
  // что запустит запросы с невалидными токенами и покажет "сессия истекла"
  useEffect(() => {
    if (useMocks) return;
    if (isTelegramChecked && !showNoTelegramError && !authError && !isAuthLoading) {
      const hasTokens = auth.isAuthenticated();
      setIsAuthenticated(hasTokens);
    }
  }, [isTelegramChecked, showNoTelegramError, authError, isAuthLoading]);

  return {
    isAuthenticated,
    showNoTelegramError,
    isTelegramChecked,
    authError,
    isAuthLoading,
    authPromise: authPromiseRef.current,
  };
};
