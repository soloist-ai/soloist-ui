import React, { createContext, useContext, useState, useCallback } from 'react';
import { gqlSdk } from '../graphql/client';
import type { DayStreakFieldsFragment, UserRole } from '../graphql/generated';

export interface AppLocale {
  tag: string;
  isManual: boolean;
}

export interface AppMe {
  id: number;
  photoUrl?: string | null;
  locale?: AppLocale | null;
  roles: UserRole[];
  player: {
    dayStreak: DayStreakFieldsFragment;
  };
}

interface AppDataContextType {
  me: AppMe | null;
  loading: boolean;
  error: boolean;
  /** Replace data with a fresh full fetch */
  refetchAll: () => Promise<void>;
  /** Re-fetch day streak (after WS day-streak notification) */
  refreshDayStreak: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = (): AppDataContextType => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
};

interface AppDataProviderProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  initialData?: AppMe | null;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({
  children,
  isAuthenticated,
  initialData = null,
}) => {
  const [me, setMe] = useState<AppMe | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);
    try {
      const { me: data } = await gqlSdk.GetAppData();
      setMe(data);
    } catch (e) {
      console.error('[AppData] refetchAll failed:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshDayStreak = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { me: data } = await gqlSdk.RefreshDayStreak();
      setMe((prev) =>
        prev ? { ...prev, player: { ...prev.player, dayStreak: data.player.dayStreak } } : prev
      );
    } catch (e) {
      console.error('[AppData] refreshDayStreak failed:', e);
    }
  }, [isAuthenticated]);

  return (
    <AppDataContext.Provider value={{ me, loading, error, refetchAll, refreshDayStreak }}>
      {children}
    </AppDataContext.Provider>
  );
};
