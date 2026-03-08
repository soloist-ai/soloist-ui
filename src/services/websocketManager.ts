import { Client, IMessage } from '@stomp/stompjs';
import type { Message } from '../api';
import { auth } from '../auth';
import { config } from '../config/environment';

type NotificationHandler = (notification: Message['payload']) => void;
type LocaleUpdateHandler = () => Promise<void>;

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private client: Client | null = null;
  private isConnecting = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectInterval = 10000; // 10 секунд
  private notificationHandlers: Set<NotificationHandler> = new Set();
  private localeUpdateHandlers: Set<LocaleUpdateHandler> = new Set();
  private isEnabled = false;
  private lastUsedToken: string | null = null;
  private tokenCheckInterval: NodeJS.Timeout | null = null;
  private tokenRefreshUnsubscribe: (() => void) | null = null;
  private unloadHandlers: {
    beforeunload?: () => void;
    pagehide?: (event: PageTransitionEvent) => void;
    visibilitychange?: () => void;
  } = {};

  private constructor() {
    // Приватный конструктор для singleton
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Регистрирует обработчик уведомлений
   */
  addNotificationHandler(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    // Возвращаем функцию для удаления обработчика
    return () => {
      this.notificationHandlers.delete(handler);
    };
  }

  /**
   * Регистрирует обработчик обновления локализации
   */
  addLocaleUpdateHandler(handler: LocaleUpdateHandler): () => void {
    this.localeUpdateHandlers.add(handler);
    // Возвращаем функцию для удаления обработчика
    return () => {
      this.localeUpdateHandlers.delete(handler);
    };
  }

  /**
   * Проверяет, активно ли соединение
   */
  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }

  /**
   * Проверяет, идет ли процесс подключения
   */
  isConnectingNow(): boolean {
    return this.isConnecting;
  }

  /**
   * Включает WebSocket менеджер и начинает попытки подключения
   */
  enable(): void {
    if (this.isEnabled) {
      // Если уже включен, проверяем токен и соединение
      const currentToken = auth.getAccessToken();
      if (this.isConnected()) {
        if (currentToken !== this.lastUsedToken) {
          console.log('[WS Manager] Token changed, reconnecting...');
          this.reconnect();
        } else {
          console.log('[WS Manager] Already enabled and connected with same token');
        }
      } else {
        // Если включен, но не подключен, пытаемся подключиться
        console.log('[WS Manager] Already enabled but not connected, attempting connection...');
        this.attemptConnection();
      }
      return;
    }

    this.isEnabled = true;
    console.log('[WS Manager] Enabled, starting connection attempts');
    
    // Регистрируем callback для уведомления об обновлении токена (только один раз)
    if (!this.tokenRefreshUnsubscribe) {
      this.tokenRefreshUnsubscribe = auth.onTokenRefresh((newToken: string) => {
        console.log('[WS Manager] Token refreshed, reconnecting WebSocket...');
        // Разрываем текущее соединение и переподключаемся с новым токеном
        this.reconnect();
      });
    }
    
    // Начинаем попытки подключения
    this.attemptConnection();

    // Запускаем периодическую проверку токена
    this.startTokenCheck();

    // Регистрируем обработчики закрытия страницы
    this.registerUnloadHandlers();
  }

  /**
   * Отключает WebSocket менеджер и закрывает соединение
   */
  disable(): void {
    if (!this.isEnabled) {
      return;
    }

    this.isEnabled = false;
    console.log('[WS Manager] Disabled, closing connection');

    // Останавливаем таймер переподключения
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Останавливаем проверку токена
    this.stopTokenCheck();

    // Отменяем регистрацию callback для обновления токена
    if (this.tokenRefreshUnsubscribe) {
      this.tokenRefreshUnsubscribe();
      this.tokenRefreshUnsubscribe = null;
    }

    // Удаляем обработчики закрытия страницы
    this.unregisterUnloadHandlers();

    // Закрываем соединение
    this.disconnect();
  }

  /**
   * Попытка подключения к WebSocket
   */
  private async attemptConnection(): Promise<void> {
    // Если уже подключены или идет подключение, не делаем ничего
    if (this.isConnected() || this.isConnecting) {
      return;
    }

    // Если менеджер отключен, не пытаемся подключаться
    if (!this.isEnabled) {
      return;
    }

    // Получаем токен
    const token = auth.getAccessToken();
    if (!token) {
      console.warn('[WS Manager] No access token available, will retry in 10s');
      this.scheduleReconnect();
      return;
    }

    this.isConnecting = true;
    console.log('[WS Manager] Attempting to connect...');

    try {
      await this.connect(token);
    } catch (error) {
      console.error('[WS Manager] Connection failed:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Подключается к WebSocket с указанным токеном
   */
  private connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Если уже есть активное соединение, закрываем его
      if (this.client && this.client.connected) {
        console.log('[WS Manager] Closing existing connection before creating new one');
        this.disconnect();
      }

      // Если есть клиент, но он не подключен, очищаем его
      if (this.client) {
        try {
          this.client.deactivate();
        } catch (e) {
          console.warn('[WS Manager] Error deactivating old client:', e);
        }
        this.client = null;
      }

      // Используем wsUrl из конфигурации окружения вместо формирования из OpenAPI.BASE
      // Важно: всегда читаем актуальное значение из config, чтобы гарантировать правильный URL
      // Никогда не формируем URL из window.location или OpenAPI.BASE
      const wsBaseUrl = config.wsUrl || 'wss://soloist-gateway.ru.tuna.am/ws';
      
      // Убеждаемся, что URL абсолютный (начинается с ws:// или wss://)
      if (!wsBaseUrl.startsWith('ws://') && !wsBaseUrl.startsWith('wss://')) {
        console.error('[WS Manager] Invalid WebSocket URL (must start with ws:// or wss://):', wsBaseUrl);
        reject(new Error('Invalid WebSocket URL configuration'));
        return;
      }
      
      const brokerURL = `${wsBaseUrl}?token=${encodeURIComponent(token)}`;

      console.log('[WS Manager] Connecting to:', brokerURL.replace(/\?token=.*$/, '?token=***'));

      const client = new Client({
        brokerURL,
        // КРИТИЧНО: Отключаем ВСЕ автоматические переподключения STOMP
        // Мы управляем переподключением сами через scheduleReconnect()
        reconnectDelay: 0,
        // Устанавливаем большой таймаут, чтобы предотвратить автоматические переподключения
        connectionTimeout: 5000,
        // Отключаем автоматическое переподключение при ошибках
        // Важно: библиотека может пытаться переподключиться автоматически,
        // поэтому мы должны явно управлять этим через наш код
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        // Дополнительная защита: убеждаемся, что библиотека не использует внутренние механизмы переподключения
        debug: (str: string) => {
          // Логируем только важные сообщения, чтобы не засорять консоль
          if (str.includes('reconnect') || str.includes('error') || str.includes('close')) {
            console.log('[WS Manager][STOMP Debug]', str);
          }
        },
        onConnect: () => {
          console.log('[WS Manager] Connected successfully');
          this.isConnecting = false;
          this.lastUsedToken = token; // Сохраняем использованный токен

          // Подписываемся на уведомления
          client.subscribe(`/user/queue/notifications`, (message: IMessage) => {
            try {
              const body: Message = JSON.parse(message.body);
              const notification = body.payload;

              // Вызываем все зарегистрированные обработчики
              this.notificationHandlers.forEach(handler => {
                try {
                  handler(notification);
                } catch (e) {
                  console.error('[WS Manager] Error in notification handler:', e);
                }
              });

              // Обрабатываем специальные типы уведомлений
              const src = String(notification.source ?? '').toLowerCase().replace(/_/g, '');
              if (src === 'locale') {
                this.localeUpdateHandlers.forEach(handler => {
                  handler().catch(e => {
                    console.error('[WS Manager] Error in locale update handler:', e);
                  });
                });
              }
            } catch (e) {
              console.warn('[WS Manager] Failed to parse message', e, message.body);
            }
          });

          resolve();
        },
        onStompError: (frame: any) => {
          console.error('[WS Manager][STOMP ERROR]', frame.headers['message'], frame.body);
          this.isConnecting = false;
          this.scheduleReconnect();
          reject(new Error(frame.headers['message'] || 'STOMP error'));
        },
        onWebSocketError: (event: Event) => {
          console.error('[WS Manager][SOCKET ERROR]', event);
          this.isConnecting = false;
          this.scheduleReconnect();
          reject(new Error('WebSocket error'));
        },
        onWebSocketClose: (event: CloseEvent) => {
          console.warn('[WS Manager][CLOSED]', event.code, event.reason);
          this.isConnecting = false;
          // Важно: очищаем клиент ДО планирования переподключения, чтобы предотвратить использование старого URL
          if (this.client) {
            try {
              this.client.deactivate();
            } catch (e) {
              console.warn('[WS Manager] Error deactivating client on close:', e);
            }
          }
          this.client = null;
          // Не сбрасываем lastUsedToken, чтобы при переподключении использовать тот же токен

          // Если менеджер включен, планируем переподключение
          if (this.isEnabled) {
            this.scheduleReconnect();
          }
        },
      });

      this.client = client;
      client.activate();
    });
  }

  /**
   * Отключается от WebSocket
   */
  private disconnect(): void {
    if (this.client) {
      try {
        if (this.client.connected) {
          this.client.deactivate();
        }
      } catch (e) {
        console.warn('[WS Manager] Error during disconnect:', e);
      }
      this.client = null;
    }
    this.isConnecting = false;
  }

  /**
   * Планирует переподключение через заданный интервал
   */
  private scheduleReconnect(): void {
    // Очищаем предыдущий таймер, если есть
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Если менеджер отключен, не планируем переподключение
    if (!this.isEnabled) {
      console.log('[WS Manager] Not scheduling reconnect: manager is disabled');
      return;
    }

    // Если уже подключены, не планируем переподключение
    if (this.isConnected()) {
      console.log('[WS Manager] Not scheduling reconnect: already connected');
      return;
    }

    // Логируем, какой URL будет использован при переподключении
    // Важно: читаем актуальное значение из config при каждом переподключении
    const currentWsUrl = config.wsUrl || 'wss://soloist-gateway.ru.tuna.am/ws';
    console.log(`[WS Manager] Scheduling reconnect in ${this.reconnectInterval / 1000}s to: ${currentWsUrl}`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log('[WS Manager] Executing scheduled reconnect...');
      this.attemptConnection();
    }, this.reconnectInterval);
  }

  /**
   * Принудительно переподключается (например, при смене токена)
   */
  async reconnect(): Promise<void> {
    console.log('[WS Manager] Forcing reconnect...');
    this.disconnect();
    this.lastUsedToken = null; // Сбрасываем токен, чтобы использовать новый
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.isEnabled) {
      await this.attemptConnection();
    }
  }

  /**
   * Запускает периодическую проверку токена
   */
  private startTokenCheck(): void {
    // Останавливаем предыдущую проверку, если есть
    this.stopTokenCheck();

    // Проверяем токен каждые 5 секунд
    this.tokenCheckInterval = setInterval(() => {
      if (!this.isEnabled) {
        this.stopTokenCheck();
        return;
      }

      const currentToken = auth.getAccessToken();
      
      // Если токен изменился и мы подключены, переподключаемся
      if (currentToken && currentToken !== this.lastUsedToken && this.isConnected()) {
        console.log('[WS Manager] Token changed, reconnecting...');
        this.reconnect();
      }
    }, 5000); // Проверяем каждые 5 секунд
  }

  /**
   * Останавливает периодическую проверку токена
   */
  private stopTokenCheck(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  /**
   * Регистрирует обработчики событий закрытия страницы
   */
  private registerUnloadHandlers(): void {
    // Удаляем старые обработчики, если они есть
    this.unregisterUnloadHandlers();

    // Обработчик beforeunload - срабатывает перед закрытием страницы
    this.unloadHandlers.beforeunload = () => {
      console.log('[WS Manager] beforeunload event, disconnecting...');
      this.disconnectGracefully();
    };

    // Обработчик pagehide - более надежен для мобильных браузеров
    this.unloadHandlers.pagehide = (event: PageTransitionEvent) => {
      // Если страница выгружается (не просто скрывается), отключаемся
      if (!event.persisted) {
        console.log('[WS Manager] pagehide event (page unloading), disconnecting...');
        this.disconnectGracefully();
      }
    };

    // Обработчик visibilitychange - когда вкладка становится скрытой
    // Отключаемся только если страница полностью выгружается
    this.unloadHandlers.visibilitychange = () => {
      if (document.visibilityState === 'hidden') {
        // Используем небольшую задержку, чтобы отличить простое скрытие от закрытия
        // Если страница вернется в visible, таймер будет очищен
        const timeoutId = setTimeout(() => {
          // Если страница все еще скрыта через 1 секунду, вероятно она закрывается
          if (document.visibilityState === 'hidden') {
            console.log('[WS Manager] visibilitychange: page hidden for too long, disconnecting...');
            this.disconnectGracefully();
          }
        }, 1000);

        // Очищаем таймер, если страница снова стала видимой
        const checkVisibility = () => {
          if (document.visibilityState === 'visible') {
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', checkVisibility);
          }
        };
        document.addEventListener('visibilitychange', checkVisibility, { once: true });
      }
    };

    // Регистрируем обработчики
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.unloadHandlers.beforeunload);
      window.addEventListener('pagehide', this.unloadHandlers.pagehide);
      document.addEventListener('visibilitychange', this.unloadHandlers.visibilitychange);
    }
  }

  /**
   * Удаляет обработчики событий закрытия страницы
   */
  private unregisterUnloadHandlers(): void {
    if (typeof window !== 'undefined') {
      if (this.unloadHandlers.beforeunload) {
        window.removeEventListener('beforeunload', this.unloadHandlers.beforeunload);
      }
      if (this.unloadHandlers.pagehide) {
        window.removeEventListener('pagehide', this.unloadHandlers.pagehide);
      }
      if (this.unloadHandlers.visibilitychange) {
        document.removeEventListener('visibilitychange', this.unloadHandlers.visibilitychange);
      }
    }
    this.unloadHandlers = {};
  }

  /**
   * Корректно отключается от WebSocket при закрытии страницы
   */
  private disconnectGracefully(): void {
    // Отключаем менеджер, чтобы предотвратить переподключение
    this.isEnabled = false;

    // Останавливаем таймеры
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopTokenCheck();

    // Явно отключаемся от WebSocket
    if (this.client && this.client.connected) {
      try {
        // Используем синхронное отключение для надежности
        this.client.deactivate();
        console.log('[WS Manager] Gracefully disconnected on page unload');
      } catch (e) {
        console.warn('[WS Manager] Error during graceful disconnect:', e);
      }
    }
    this.client = null;
    this.isConnecting = false;
  }
}

export const websocketManager = WebSocketManager.getInstance();
