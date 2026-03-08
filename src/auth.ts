import type {LoginResponse, TgAuthData} from './api';
import {AuthService} from './api';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Глобальная переменная для отслеживания процесса обновления токена
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Callback для уведомления об обновлении токена
type TokenRefreshCallback = (newToken: string) => void;
const tokenRefreshCallbacks: Set<TokenRefreshCallback> = new Set();

// Callback для уведомления об истечении сессии (refresh токен истек)
type SessionExpiredCallback = () => void;
let sessionExpiredCallback: SessionExpiredCallback | null = null;

// Глобальный промис авторизации для ожидания завершения login перед выполнением запросов
let globalAuthPromise: Promise<any> | null = null;

function saveTokens(jwt: LoginResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, jwt.accessToken.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, jwt.refreshToken.token);
}

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function loginWithTelegram(initData: string, tg_web_app_data: any): Promise<LoginResponse> {
  const authData: TgAuthData = {
    init_data: initData,
    tg_web_app_data,
  };

  try {
    const jwt = await AuthService.login(authData);
    if (!jwt || !jwt.accessToken || !jwt.refreshToken || !jwt.accessToken.token || !jwt.refreshToken.token) {
      throw new Error('Invalid authentication response');
    }
    saveTokens(jwt);
    return jwt;
  } catch (e: any) {
    clearTokens();
    throw e;
  }
}

async function refreshTokenIfNeeded(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const newToken = await AuthService.refresh({refreshToken});
    if (newToken && newToken.accessToken && newToken.accessToken.token) {
      const tokenValue = newToken.accessToken.token;
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenValue);
      
      // Уведомляем все зарегистрированные callback'и об обновлении токена
      tokenRefreshCallbacks.forEach(callback => {
        try {
          callback(tokenValue);
        } catch (error) {
          console.error('[Auth] Error in token refresh callback:', error);
        }
      });
      
      return tokenValue;
    } else {
      clearTokens();
      return null;
    }
  } catch (error: any) {
    console.error('Failed to refresh token:', error);
    
    // Проверяем, является ли это ошибкой 401 (истек refresh токен)
    // ApiError имеет свойство status, также проверяем другие возможные форматы
    const is401Error = error?.status === 401 || 
                      error?.response?.status === 401 ||
                      (error?.body && typeof error.body === 'object' && error.body.status === 401) ||
                      (error?.message && typeof error.message === 'string' && error.message.includes('401')) ||
                      (error?.request?.url && error.request.url.includes('/api/v1/auth/refresh') && error?.status === 401);
    
    if (is401Error) {
      // Refresh токен истек - уведомляем об истечении сессии
      clearTokens();
      // Не показываем "сессия истекла" если идёт процесс логина —
      // login получит новые токены и всё заработает
      if (sessionExpiredCallback && !globalAuthPromise) {
        try {
          sessionExpiredCallback();
        } catch (callbackError) {
          console.error('[Auth] Error in session expired callback:', callbackError);
        }
      }
    } else {
    clearTokens();
    }
    
    return null;
  }
}

// Функция для обработки 401 ошибки
async function handle401Error(): Promise<string | null> {
  // Если уже идёт обновление токена, ждём его завершения
  if (isRefreshing && refreshPromise) {
    return await refreshPromise;
  }

  // Начинаем обновление токена
  isRefreshing = true;
  refreshPromise = refreshTokenIfNeeded();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

// Функция для получения токена (используется в OpenAPI.TOKEN)
// Сигнатура должна соответствовать типу Resolver<string>: (options: ApiRequestOptions) => Promise<string>
async function getTokenForRequest(options: any): Promise<string> {
  // Не отправляем токен для login и refresh запросов
  if (options.url?.includes('/api/auth/login') || options.url?.includes('/api/auth/refresh')) {
    return '';
  }

  // Если есть активный промис авторизации, ждем его завершения
  // Это гарантирует, что токены будут сохранены перед выполнением запросов
  if (globalAuthPromise) {
    try {
      await globalAuthPromise;
    } catch (error) {
      // Игнорируем ошибки авторизации, продолжаем проверку токена
      console.warn('[Auth] Auth promise rejected, continuing with token check:', error);
    }
  }

  // Ждем, пока токен станет доступен (максимум 1 секунда)
  // Это необходимо, так как localStorage.setItem синхронный, но может быть задержка
  let attempts = 0;
  const maxAttempts = 20; // 20 попыток по 50ms = 1 секунда
  let token = getAccessToken();
  
  while (!token && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 50));
    token = getAccessToken();
    attempts++;
  }

  if (token) {
    return token;
  }

  // Если токена все еще нет, пытаемся обновить через refresh токен
  token = await refreshTokenIfNeeded();

  if (token) {
    return token;
  }

  // Если и после обновления токена нет, возвращаем пустую строку
  // Это приведет к 401 ошибке, которую нужно обработать на уровне компонентов
  return '';
}

// Функция для проверки, авторизован ли пользователь
function isAuthenticated(): boolean {
  return !!(getAccessToken() || getRefreshToken());
}

/**
 * Регистрирует callback, который будет вызван при обновлении токена
 * @param callback Функция, которая будет вызвана с новым токеном
 * @returns Функция для отмены регистрации callback'а
 */
function onTokenRefresh(callback: TokenRefreshCallback): () => void {
  tokenRefreshCallbacks.add(callback);
  return () => {
    tokenRefreshCallbacks.delete(callback);
  };
}

/**
 * Устанавливает callback, который будет вызван при истечении сессии (refresh токен истек)
 * @param callback Функция, которая будет вызвана при истечении сессии
 */
function onSessionExpired(callback: SessionExpiredCallback): void {
  sessionExpiredCallback = callback;
}

/**
 * Регистрирует глобальный промис авторизации для ожидания завершения login
 * @param promise Промис авторизации
 */
function setAuthPromise(promise: Promise<any> | null): void {
  globalAuthPromise = promise;
}

export const auth = {
  loginWithTelegram,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  refreshTokenIfNeeded,
  handle401Error,
  getTokenForRequest,
  isAuthenticated,
  onTokenRefresh,
  onSessionExpired,
  setAuthPromise,
};