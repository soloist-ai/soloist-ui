import { useState, useEffect } from 'react';
import { useSettings } from './useSettings';
import { applyLocale } from '../utils/localeUtils';
import { gqlSdk } from '../graphql/client';
import type { AppMe } from '../contexts/AppDataContext';

export const useLocaleSync = (isAuthenticated: boolean) => {
  const [localeFetched, setLocaleFetched] = useState(false);
  const [isLocaleLoading, setIsLocaleLoading] = useState(false);
  const [appData, setAppData] = useState<AppMe | null>(null);
  const { updateSettings, setLocaleLoaded, localeLoaded } = useSettings();

  useEffect(() => {
    if (!isAuthenticated || localeFetched) {
      setIsLocaleLoading(false);
      return;
    }

    let isCancelled = false;
    const timeoutId = setTimeout(() => {
      setIsLocaleLoading(true);

      (async () => {
        try {
          console.log('[Locale] Fetching app bootstrap data...');
          const { me } = await gqlSdk.GetAppData();
          if (isCancelled) return;
          applyLocale(me.locale, updateSettings, setLocaleLoaded);
          setAppData(me);
          setLocaleFetched(true);
        } catch (e) {
          console.error('[Locale] Failed to fetch bootstrap data:', e);
          if (isCancelled) return;
          setLocaleLoaded(true);
          setLocaleFetched(true);
        } finally {
          if (!isCancelled) setIsLocaleLoading(false);
        }
      })();
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      setIsLocaleLoading(false);
    };
  }, [isAuthenticated, localeFetched, updateSettings, setLocaleLoaded]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocaleFetched(false);
      setAppData(null);
      setIsLocaleLoading(false);
    }
  }, [isAuthenticated]);

  return { localeFetched, isLocaleLoading, localeLoaded, appData };
};
