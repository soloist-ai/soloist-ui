import { parseLanguage, type Language } from '../locales';

/**
 * Applies locale from any object with a `locale` field to settings.
 */
export const applyLocale = (
  locale: { tag: string; isManual: boolean } | null | undefined,
  updateSettings: (settings: { language: Language; isManual: boolean }) => void,
  setLocaleLoaded?: (loaded: boolean) => void
): void => {
  if (locale?.tag) {
    const backendLanguage = parseLanguage(locale.tag);
    updateSettings({ language: backendLanguage, isManual: locale.isManual });
    console.log('[Locale] Updated locale from server:', backendLanguage);
  } else {
    console.log('[Locale] No locale information in response');
  }
  if (setLocaleLoaded) setLocaleLoaded(true);
};
