import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { DayStreak, UserAdditionalInfoResponse } from '../api';
import { gqlSdk } from '../graphql/client';

interface UserAdditionalInfoContextType {
  photoUrl: string | undefined;
  dayStreak: DayStreak | null;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
}

const UserAdditionalInfoContext = createContext<UserAdditionalInfoContextType | undefined>(undefined);

export const useUserAdditionalInfo = () => {
  const context = useContext(UserAdditionalInfoContext);
  if (context === undefined) {
    throw new Error('useUserAdditionalInfo must be used within UserAdditionalInfoProvider');
  }
  return context;
};

interface UserAdditionalInfoProviderProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  /** Данные с первого запроса getAdditionalInfo (из useLocaleSync); при передаче повторный запрос при монтировании не выполняется */
  initialData?: UserAdditionalInfoResponse | null;
}

export const UserAdditionalInfoProvider: React.FC<UserAdditionalInfoProviderProps> = ({
  children,
  isAuthenticated,
  initialData = null,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialData?.photoUrl);
  const [dayStreak, setDayStreak] = useState<DayStreak | null>(initialData?.dayStreak ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchInfo = useCallback(async () => {
    if (!isAuthenticated) {
      setPhotoUrl(undefined);
      setDayStreak(null);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const { me } = await gqlSdk.GetAppData();
      const data: UserAdditionalInfoResponse = {
        photoUrl: me.photoUrl ?? undefined,
        locale: me.locale ?? { tag: 'ru', isManual: false },
        roles: me.roles as any,
        dayStreak: me.player.dayStreak as any,
      };
      setPhotoUrl(data.photoUrl);
      setDayStreak(data.dayStreak ?? null);
      if (data.photoUrl) {
        const img = new Image();
        img.src = data.photoUrl;
      }
    } catch (e) {
      console.error('[UserAdditionalInfo] Failed to fetch:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPhotoUrl(undefined);
      setDayStreak(null);
      return;
    }
    if (initialData != null) {
      setPhotoUrl(initialData.photoUrl);
      setDayStreak(initialData.dayStreak ?? null);
      if (initialData.photoUrl) {
        const img = new Image();
        img.src = initialData.photoUrl;
      }
      return;
    }
    fetchInfo();
  }, [isAuthenticated, initialData, fetchInfo]);

  const value: UserAdditionalInfoContextType = {
    photoUrl,
    dayStreak,
    loading,
    error,
    refetch: fetchInfo,
  };

  return (
    <UserAdditionalInfoContext.Provider value={value}>
      {children}
    </UserAdditionalInfoContext.Provider>
  );
};
