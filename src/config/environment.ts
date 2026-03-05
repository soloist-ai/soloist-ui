export type Environment = 'development' | 'production';

export interface EnvironmentConfig {
  env: Environment;
  apiBaseUrl: string;
  wsUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  useMocks: boolean;
  /** Включён ли режим «технические работы» (показывается только экран обслуживания) */
  isMaintenanceMode: boolean;
}

const shouldUseMocks = (): boolean => {
  const useMocksEnv = import.meta.env.VITE_USE_MOCKS;
  if (useMocksEnv === 'true' || useMocksEnv === '1') return true;
  if (useMocksEnv === 'false' || useMocksEnv === '0') return false;
  return false;
};

const readMaintenanceMode = (): boolean =>
  import.meta.env.VITE_MAINTENANCE_MODE === 'true' || import.meta.env.VITE_MAINTENANCE_MODE === '1';

const developmentConfig: EnvironmentConfig = {
  env: 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://soloist-gateway.ru.tuna.am',
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://soloist-gateway.ru.tuna.am/ws',
  isDevelopment: true,
  isProduction: false,
  useMocks: shouldUseMocks(),
  isMaintenanceMode: readMaintenanceMode(),
};

const PROD_HOST = 'gateway.soloist-ai.com';

const productionConfig: EnvironmentConfig = {
  env: 'production',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || `https://${PROD_HOST}`,
  wsUrl: import.meta.env.VITE_WS_URL || `wss://${PROD_HOST}/ws`,
  isDevelopment: false,
  isProduction: true,
  useMocks: false,
  isMaintenanceMode: readMaintenanceMode(),
};

const getCurrentEnvironment = (): Environment => {
  const envFromVite = import.meta.env.VITE_ENV as Environment;
  if (envFromVite === 'development' || envFromVite === 'production') return envFromVite;
  if (import.meta.env.MODE === 'production') return 'production';
  return 'development';
};

const currentEnv = getCurrentEnvironment();

export const config: EnvironmentConfig = currentEnv === 'production' ? productionConfig : developmentConfig;

if (typeof window !== 'undefined') {
  if (config.isProduction) {
    (config as any).useMocks = false;
  } else if (config.isDevelopment && !config.useMocks) {
    // initData is empty outside a real Telegram session, even though the SDK always
    // creates window.Telegram.WebApp. Use that as the authoritative mock signal.
    const hasTelegramAuth = !!(window as any).Telegram?.WebApp?.initData;
    if (!hasTelegramAuth) {
      (config as any).useMocks = true;
    }
  }
}

export const { env, apiBaseUrl, wsUrl, isDevelopment, isProduction, useMocks, isMaintenanceMode } = config;

export const getConfigByEnvironment = (environment: Environment): EnvironmentConfig =>
  environment === 'production' ? productionConfig : developmentConfig;

export const setEnvironment = (environment: Environment): void => {
  if (typeof window !== 'undefined') {
    (window as any).__VITE_ENV__ = environment;
  }
};

export const getCurrentEnvironmentConfig = (): EnvironmentConfig => {
  if (typeof window !== 'undefined' && (window as any).__VITE_ENV__) {
    const env = (window as any).__VITE_ENV__;
    return env === 'production' ? productionConfig : developmentConfig;
  }
  return config;
};
