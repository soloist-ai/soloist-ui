import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SettingsProvider } from './hooks/useSettings';
import './i18n';
import './api/config';

async function bootstrap() {
  if (typeof window !== 'undefined') {
    // The Telegram SDK (telegram-web-app.js) always creates window.Telegram.WebApp,
    // even in a plain browser — but initData is only populated inside a real Telegram session.
    // VITE_USE_MOCKS=true explicitly forces mock mode (e.g. testing while inside Telegram).
    const forceMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    const hasTelegramAuth = !!(window as any).Telegram?.WebApp?.initData;
    if (forceMocks || !hasTelegramAuth) {
      const { setupMockTelegram } = await import('./mocks/mockTelegram');
      setupMockTelegram();
    }
  }

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </React.StrictMode>
  );

  reportWebVitals();
}

bootstrap();
