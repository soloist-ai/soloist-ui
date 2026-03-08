/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import FormData from 'form-data';

import { ApiError } from './ApiError';
import type { ApiRequestOptions } from './ApiRequestOptions';
import type { ApiResult } from './ApiResult';
import { CancelablePromise } from './CancelablePromise';
import type { OnCancel } from './CancelablePromise';
import type { OpenAPIConfig } from './OpenAPI';
import { auth } from '../../auth';
import { getLanguageFromStorage } from '../../hooks/useSettings';
import { useMocks } from '../../config/environment';

export const isDefined = <T>(value: T | null | undefined): value is Exclude<T, null | undefined> => {
  return value !== undefined && value !== null;
};

export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isStringWithValue = (value: any): value is string => {
  return isString(value) && value !== '';
};

export const isBlob = (value: any): value is Blob => {
  return (
      typeof value === 'object' &&
      typeof value.type === 'string' &&
      typeof value.stream === 'function' &&
      typeof value.arrayBuffer === 'function' &&
      typeof value.constructor === 'function' &&
      typeof value.constructor.name === 'string' &&
      /^(Blob|File)$/.test(value.constructor.name) &&
      /^(Blob|File)$/.test(value[Symbol.toStringTag])
  );
};

export const isFormData = (value: any): value is FormData => {
  return value instanceof FormData;
};

export const isSuccess = (status: number): boolean => {
  return status >= 200 && status < 300;
};

export const base64 = (str: string): string => {
  try {
    return btoa(str);
  } catch (err) {
    // @ts-ignore
    return Buffer.from(str).toString('base64');
  }
};

export const getQueryString = (params: Record<string, any>): string => {
  const qs: string[] = [];

  const append = (key: string, value: any) => {
    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  const process = (key: string, value: any) => {
    if (isDefined(value)) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          process(key, v);
        });
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          process(`${key}[${k}]`, v);
        });
      } else {
        append(key, value);
      }
    }
  };

  Object.entries(params).forEach(([key, value]) => {
    process(key, value);
  });

  if (qs.length > 0) {
    return `?${qs.join('&')}`;
  }

  return '';
};

const getUrl = (config: OpenAPIConfig, options: ApiRequestOptions): string => {
  const encoder = config.ENCODE_PATH || encodeURI;

  const path = options.url
  .replace('{api-version}', config.VERSION)
  .replace(/{(.*?)}/g, (substring: string, group: string) => {
    if (options.path?.hasOwnProperty(group)) {
      return encoder(String(options.path[group]));
    }
    return substring;
  });

  const url = `${config.BASE}${path}`;
  if (options.query) {
    return `${url}${getQueryString(options.query)}`;
  }
  return url;
};

export const getFormData = (options: ApiRequestOptions): FormData | undefined => {
  if (options.formData) {
    const formData = new FormData();

    const process = (key: string, value: any) => {
      if (isString(value) || isBlob(value)) {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    };

    Object.entries(options.formData)
    .filter(([_, value]) => isDefined(value))
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => process(key, v));
      } else {
        process(key, value);
      }
    });

    return formData;
  }
  return undefined;
};

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;

export const resolve = async <T>(options: ApiRequestOptions, resolver?: T | Resolver<T>): Promise<T | undefined> => {
  if (typeof resolver === 'function') {
    return (resolver as Resolver<T>)(options);
  }
  return resolver;
};

export const getHeaders = async (config: OpenAPIConfig, options: ApiRequestOptions, formData?: FormData): Promise<Record<string, string>> => {
  const [token, username, password, additionalHeaders] = await Promise.all([
    resolve(options, config.TOKEN),
    resolve(options, config.USERNAME),
    resolve(options, config.PASSWORD),
    resolve(options, config.HEADERS),
  ]);

  const formHeaders = typeof formData?.getHeaders === 'function' && formData?.getHeaders() || {}

  // Получаем временную зону браузера
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Версионирование API для auth-запросов (Spring Boot style)
  const isAuthRequest = options.url?.includes('/auth/login') || options.url?.includes('/auth/refresh');
  const versionHeaders = isAuthRequest ? { 'API-Version': '1' } : {};

  const headers = Object.entries({
    Accept: 'application/json',
    'Accept-Language': getLanguageFromStorage(),
    'X-TimeZone': timeZone,
    ...versionHeaders,
    ...additionalHeaders,
    ...options.headers,
    ...formHeaders,
  })
  .filter(([_, value]) => isDefined(value))
  .reduce((headers, [key, value]) => ({
    ...headers,
    [key]: String(value),
  }), {} as Record<string, string>);

  if (isStringWithValue(token)) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isStringWithValue(username) && isStringWithValue(password)) {
    const credentials = base64(`${username}:${password}`);
    headers['Authorization'] = `Basic ${credentials}`;
  }

  if (options.body !== undefined) {
    if (options.mediaType) {
      headers['Content-Type'] = options.mediaType;
    } else if (isBlob(options.body)) {
      headers['Content-Type'] = options.body.type || 'application/octet-stream';
    } else if (isString(options.body)) {
      headers['Content-Type'] = 'text/plain';
    } else if (!isFormData(options.body)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  return headers;
};

export const getRequestBody = (options: ApiRequestOptions): any => {
  if (options.body) {
    return options.body;
  }
  return undefined;
};

export const sendRequest = async <T>(
    config: OpenAPIConfig,
    options: ApiRequestOptions,
    url: string,
    body: any,
    formData: FormData | undefined,
    headers: Record<string, string>,
    onCancel: OnCancel,
    axiosClient: AxiosInstance
): Promise<AxiosResponse<T>> => {
  const source = axios.CancelToken.source();

  const requestConfig: AxiosRequestConfig = {
    url,
    headers,
    data: body ?? formData,
    method: options.method,
    withCredentials: config.WITH_CREDENTIALS,
    withXSRFToken: config.CREDENTIALS === 'include' ? config.WITH_CREDENTIALS : false,
    cancelToken: source.token,
  };

  onCancel(() => source.cancel('The user aborted a request.'));

  try {
    return await axiosClient.request(requestConfig);
  } catch (error) {
    const axiosError = error as AxiosError<T>;
    if (axiosError.response) {
      return axiosError.response;
    }
    throw error;
  }
};

export const getResponseHeader = (response: AxiosResponse<any>, responseHeader?: string): string | undefined => {
  if (responseHeader) {
    const content = response.headers[responseHeader];
    if (isString(content)) {
      return content;
    }
  }
  return undefined;
};

export const getResponseBody = (response: AxiosResponse<any>): any => {
  if (response.status !== 204) {
    return response.data;
  }
  return undefined;
};

/**
 * Обработка моковых запросов
 */
const handleMockRequest = async <T>(options: ApiRequestOptions): Promise<T | null> => {
  try {
    const { mockAuthService, mockUserService, mockPlayerService } = await import('../../mocks/mockApi');
    
    // Обработка auth запросов
    if (options.url === '/api/auth/login' && options.method === 'POST') {
      return await mockAuthService.login(options.body as any) as any;
    }
    if (options.url === '/api/auth/refresh' && options.method === 'POST') {
      return await mockAuthService.refresh(options.body as any) as any;
    }
    
    // Обработка user запросов
    if (options.url === '/api/v1/user/me' && options.method === 'GET') {
      return await mockUserService.getCurrentUser() as any;
    }
    if (options.url?.startsWith('/api/v1/user/') && options.url !== '/api/v1/user/me' && options.method === 'GET') {
      const userId = parseInt(options.path?.userId as string || '0');
      return await mockUserService.getUser(userId) as any;
    }
    if (options.url === '/api/v1/user/additional-info' && options.method === 'GET') {
      return await mockUserService.getUserAdditionalInfo() as any;
    }
    if (options.url === '/api/v1/user/locale' && options.method === 'PUT') {
      return await mockUserService.updateUserLocale(options.body as any) as any;
    }
    
    // Обработка player запросов
    if (options.url === '/api/v1/player/topics' && options.method === 'GET') {
      return await mockPlayerService.getCurrentPlayerTopics() as any;
    }
    if (options.url?.startsWith('/api/v1/player/') && options.url.includes('/topics') && options.method === 'GET') {
      const playerId = parseInt(options.path?.playerId as string || '0');
      return await mockPlayerService.getPlayerTopics(playerId) as any;
    }
    if (options.url === '/api/v1/player/topics' && options.method === 'POST') {
      return await mockPlayerService.savePlayerTopics(options.body as any) as any;
    }
    if (options.url === '/api/v1/player/tasks/active' && options.method === 'GET') {
      return await mockPlayerService.getActiveTasks() as any;
    }
    if (options.url === '/api/v1/player/tasks/generate' && options.method === 'POST') {
      return await mockPlayerService.generateTasks() as any;
    }
    if (options.url?.includes('/api/v1/player/tasks/') && options.url?.includes('/complete') && options.method === 'POST') {
      const taskId = options.path?.id as string || '';
      return await mockPlayerService.completeTask(taskId) as any;
    }
    if (options.url?.includes('/api/v1/player/tasks/') && options.url?.includes('/skip') && options.method === 'POST') {
      const taskId = options.path?.id as string || '';
      return await mockPlayerService.skipTask(taskId) as any;
    }
    if (options.url === '/api/v1/player/balance' && options.method === 'GET') {
      return await mockPlayerService.getPlayerBalance() as any;
    }
    if (options.url === '/api/v1/player/balance/transaction/search' && options.method === 'POST') {
      const page = options.query?.page as number | undefined;
      const pageSize = (options.query?.pageSize as number) || 20;
      return await mockPlayerService.searchPlayerBalanceTransactions(
        options.body as any,
        page,
        pageSize
      ) as any;
    }
    if (options.url === '/api/v1/player/tasks/daily' && options.method === 'GET') {
      return await mockPlayerService.getDailyTasks() as any;
    }
    if (options.url === '/api/v1/player/tasks/search' && options.method === 'POST') {
      const page = options.query?.page as number | undefined;
      const pageSize = (options.query?.pageSize as number) || 20;
      return await mockPlayerService.searchPlayerTasks(
        options.body as any,
        page,
        pageSize
      ) as any;
    }
    if (options.url?.startsWith('/api/v1/player/activity/monthly') && options.method === 'GET') {
      const year = Number(options.query?.year) || new Date().getFullYear();
      const month = Number(options.query?.month) || new Date().getMonth() + 1;
      return await mockPlayerService.getMonthlyActivity(year, month) as any;
    }
    
    // Обработка leaderboard запросов
    if (options.url?.includes('/api/v1/user/leaderboard/') && options.method === 'POST') {
      const { mockUserService } = await import('../../mocks/mockApi');
      const type = options.path?.type as string;
      
      // Проверяем, это запрос для текущего пользователя (/me)
      if (options.url?.includes('/me')) {
        return await mockUserService.getUserLeaderboard(
          type as any,
          options.body as any
        ) as any;
      }
      
      // Обычный запрос лидерборда с пагинацией
      const page = options.query?.page as number | undefined;
      const pageSize = (options.query?.pageSize as number) || 20;
      return await mockUserService.getUsersLeaderboard(
        type as any,
        options.body as any,
        page,
        pageSize
      ) as any;
    }
    
    // Если запрос не обработан, возвращаем null (будет использован реальный запрос)
    return null;
  } catch (error) {
    console.error('[Mock API] Error handling mock request:', error);
    return null;
  }
};

export const catchErrorCodes = (options: ApiRequestOptions, result: ApiResult): void => {
  const errors: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    ...options.errors,
  }

  const error = errors[result.status];
  if (error) {
    throw new ApiError(options, result, error);
  }

  if (!result.ok) {
    const errorStatus = result.status ?? 'unknown';
    const errorStatusText = result.statusText ?? 'unknown';
    const errorBody = (() => {
      try {
        return JSON.stringify(result.body, null, 2);
      } catch (e) {
        return undefined;
      }
    })();

    throw new ApiError(options, result,
        `Generic Error: status: ${errorStatus}; status text: ${errorStatusText}; body: ${errorBody}`
    );
  }
};

/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param options The request options from the service
 * @param axiosClient The axios client instance to use
 * @returns CancelablePromise<T>
 * @throws ApiError
 */
export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions, axiosClient: AxiosInstance = axios): CancelablePromise<T> => {
  return new CancelablePromise(async (resolve, reject, onCancel) => {
    try {
      // Если используем моки, перехватываем запросы
      if (useMocks) {
        const mockResponse = await handleMockRequest<T>(options);
        if (mockResponse !== null) {
          resolve(mockResponse);
          return;
        }
      }

      const url = getUrl(config, options);
      const formData = getFormData(options);
      const body = getRequestBody(options);
      const headers = await getHeaders(config, options, formData);

      if (!onCancel.isCancelled) {
        let response = await sendRequest<T>(config, options, url, body, formData, headers, onCancel, axiosClient);
        let responseBody = getResponseBody(response);
        let responseHeader = getResponseHeader(response, options.responseHeader);
        let retryCount = 0;
        const maxRetries = 1; // Максимум 1 дополнительная попытка (всего 2 попытки)

        // Retry логика для 500 ошибок
        while (response.status === 500 && retryCount < maxRetries && 
               options.url !== '/api/auth/login' &&
               options.url !== '/api/auth/refresh') {
          retryCount++;
          console.warn(`[Request] Received 500 error, retrying (attempt ${retryCount}/${maxRetries})...`, {
            url: options.url,
            method: options.method
          });
          
          // Небольшая задержка перед retry (экспоненциальная задержка)
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
          
          // Повторяем запрос
          try {
            response = await sendRequest<T>(config, options, url, body, formData, headers, onCancel, axiosClient);
            responseBody = getResponseBody(response);
            responseHeader = getResponseHeader(response, options.responseHeader);
          } catch (retryError) {
            // Если retry тоже упал, используем последний ответ
            console.error('[Request] Retry failed:', retryError);
            break;
          }
        }

        const result: ApiResult = {
          url,
          ok: isSuccess(response.status),
          status: response.status,
          statusText: response.statusText,
          body: responseHeader ?? responseBody,
        };

        // Если получили 401 и это не auth-запрос, пробуем обновить токен и повторить
        if (response.status === 401 &&
            options.url !== '/api/auth/login' &&
            options.url !== '/api/auth/refresh') {
          try {
            const newToken = await auth.handle401Error();
            if (newToken) {
              // Создаем новый конфиг с обновленным токеном
              const newConfig = {
                ...config,
                TOKEN: async () => newToken
              };

              // Повторяем запрос с новым токеном
              const newHeaders = await getHeaders(newConfig, options, formData);
              const retryResponse = await sendRequest<T>(newConfig, options, url, body, formData, newHeaders, onCancel, axiosClient);
              const retryResponseBody = getResponseBody(retryResponse);
              const retryResponseHeader = getResponseHeader(retryResponse, options.responseHeader);

              const retryResult: ApiResult = {
                url,
                ok: isSuccess(retryResponse.status),
                status: retryResponse.status,
                statusText: retryResponse.statusText,
                body: retryResponseHeader ?? retryResponseBody,
              };

              catchErrorCodes(options, retryResult);
              resolve(retryResult.body);
              return;
            }
          } catch (refreshError) {
            // Если обновление токена не удалось, продолжаем с оригинальной ошибкой
            console.error('Failed to refresh token:', refreshError);
          }
        }

        catchErrorCodes(options, result);
        resolve(result.body);
      }
    } catch (error) {
      reject(error);
    }
  });
};