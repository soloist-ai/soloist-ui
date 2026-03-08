/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: 'development' | 'production';
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_USE_MOCKS: string;
  readonly VITE_MAINTENANCE_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
