import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { gqlSdk } from '../../graphql/client';
import type { GetUsersLeaderboardQuery, GetLeaderboardInitialQuery } from '../../graphql/generated';
import { LeaderboardType } from '../../graphql/generated';
import Icon from '../common/Icon';
import { cn } from '../../utils';
import ScrollNavigationButtons from '../common/ScrollNavigationButtons';

type LeaderboardUser = GetUsersLeaderboardQuery['usersLeaderboard']['users'][number];
type LeaderboardCurrentUser = GetLeaderboardInitialQuery['userLeaderboard'];

type LeaderboardViewProps = {
  isAuthenticated: boolean;
  leaderboardType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
  onUserClick?: (userId: number) => void;
};

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ 
  isAuthenticated, 
  leaderboardType,
  onTypeChange,
  onUserClick
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardCurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCurrentUserTransitioning, setIsCurrentUserTransitioning] = useState(false);
  const [displayLeaderboardType, setDisplayLeaderboardType] = useState(leaderboardType);
  const { t } = useLocalization();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);
  const loadLeaderboardRef = useRef<typeof loadLeaderboard | undefined>(undefined);

  // Initial load or type change — fetches users list + current user position in one request
  const loadInitial = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsTransitioning(true);
    setIsCurrentUserTransitioning(true);
    setLoading(true);
    currentPageRef.current = 0;
    hasMoreRef.current = true;

    try {
      const result = await gqlSdk.GetLeaderboardInitial({
        filter: { type: leaderboardType as any },
        paging: { page: 0, pageSize: 20 },
      });
      const { users: newUsers, paging } = result.usersLeaderboard;
      const hasMoreData = paging != null && paging.currentPage < paging.totalPageCount - 1;

      if (paging?.totalRowCount !== undefined) setTotalCount(paging.totalRowCount);
      setLeaderboard(newUsers);
      setHasMore(hasMoreData);
      hasMoreRef.current = hasMoreData;
      setCurrentUser(result.userLeaderboard ?? null);
    } catch (error: any) {
      // graphql-request throws even on partial success (errors[] + data).
      // If usersLeaderboard data is present, use it and treat currentUser as null.
      const partialData = error?.response?.data;
      if (partialData?.usersLeaderboard) {
        const { users: newUsers, paging } = partialData.usersLeaderboard;
        const hasMoreData = paging != null && paging.currentPage < paging.totalPageCount - 1;
        if (paging?.totalRowCount !== undefined) setTotalCount(paging.totalRowCount);
        setLeaderboard(newUsers);
        setHasMore(hasMoreData);
        hasMoreRef.current = hasMoreData;
        setCurrentUser(null);
      } else {
        console.error('[Leaderboard] initial load failed:', error);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      setTimeout(() => {
        setIsTransitioning(false);
        setIsCurrentUserTransitioning(false);
        setDisplayLeaderboardType(leaderboardType);
      }, 25);
    }
  }, [isAuthenticated, leaderboardType]);

  // Subsequent pages — only list, no current user
  const loadLeaderboard = useCallback(async (page: number = 0, reset: boolean = false) => {
    if (!isAuthenticated) return;
    if (!reset && !hasMoreRef.current) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    if (reset) {
      setLoading(true);
      currentPageRef.current = 0;
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await gqlSdk.GetUsersLeaderboard({
        filter: { type: leaderboardType as any },
        paging: { page, pageSize: 20 },
      });
      const { users: newUsers, paging } = result.usersLeaderboard;
      const hasMoreData = paging != null && paging.currentPage < paging.totalPageCount - 1;

      if (paging?.totalRowCount !== undefined) setTotalCount(paging.totalRowCount);

      if (newUsers.length > 0) {
        setLeaderboard(prev => [...prev, ...newUsers]);
        setHasMore(hasMoreData);
        currentPageRef.current = page;
        hasMoreRef.current = hasMoreData;
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (error) {
      console.error('[Leaderboard] load page failed:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, leaderboardType]);

  // Сохраняем актуальную версию функции в ref
  useEffect(() => {
    loadLeaderboardRef.current = loadLeaderboard;
  }, [loadLeaderboard]);

  // Настройка Intersection Observer для бесконечного скролла
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Не создаем observer если данных больше нет, идет загрузка или список пуст (первая загрузка)
    if (!hasMoreRef.current || loadingMore || isLoadingRef.current || leaderboard.length === 0) {
      return;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMoreRef.current && !loadingMore && !isLoadingRef.current && leaderboard.length > 0) {
        const nextPage = currentPageRef.current + 1;
        loadLeaderboardRef.current?.(nextPage, false);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, { 
      threshold: 0,
      rootMargin: '200px'
    });

    const timeoutId = setTimeout(() => {
      if (loadMoreRef.current && observerRef.current && hasMoreRef.current && leaderboard.length > 0) {
        observerRef.current.observe(loadMoreRef.current);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, leaderboard.length]);

  // Initial load on mount
  useEffect(() => {
    if (isAuthenticated && leaderboard.length === 0) {
      loadInitial();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Type change — fade-out then reload both lists together
  useEffect(() => {
    if (displayLeaderboardType === leaderboardType) return;

    setIsTransitioning(true);
    setIsCurrentUserTransitioning(true);

    const fadeOutTimeout = setTimeout(() => {
      loadInitial();
    }, 100);

    return () => clearTimeout(fadeOutTimeout);
  }, [leaderboardType, displayLeaderboardType, loadInitial]);

  const handleTypeChange = (type: LeaderboardType) => {
    onTypeChange(type);
  };

  // Получение текста для очков в зависимости от типа
  const getScoreLabel = (type: LeaderboardType): string => {
    switch (type) {
      case LeaderboardType.LEVEL:
        return t('menu.score.level');
      case LeaderboardType.BALANCE:
        return t('menu.score.balance');
      default:
        return t('menu.score.level');
    }
  };

  // ── Position Style Config ──────────────────────────────────────────────────
  type PositionStyle = {
    rgb: [number, number, number];
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
    labelColor: string;
    labelTextShadow: string;
    positionBg: string;
    positionBorder: string;
    positionColor: string;
    positionShadow: string;
    avatarBorder: string;
    avatarShadow: string;
    avatarPlaceholderBg: string;
    nameTextShadow: string;
  };

  const rgba = (r: number, g: number, b: number, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;

  const makeRankedStyle = (r: number, g: number, b: number): PositionStyle => ({
    rgb: [r, g, b],
    cardBg: rgba(r, g, b, 0.07),
    cardBorder: `1px solid ${rgba(r, g, b, 0.25)}`,
    cardShadow: 'none',
    labelColor: rgba(r, g, b, 0.9),
    labelTextShadow: 'none',
    positionBg: rgba(r, g, b, 0.18),
    positionBorder: `1px solid ${rgba(r, g, b, 0.45)}`,
    positionColor: `rgb(${r}, ${g}, ${b})`,
    positionShadow: 'none',
    avatarBorder: `2px solid ${rgba(r, g, b, 0.35)}`,
    avatarShadow: 'none',
    avatarPlaceholderBg: rgba(r, g, b, 0.14),
    nameTextShadow: 'none',
  });

  const POSITION_STYLES: Record<number, PositionStyle> = {
    1: {
      rgb: [220, 160, 255],
      cardBg: 'linear-gradient(135deg, rgba(255, 100, 200, 0.18) 0%, rgba(160, 120, 255, 0.16) 25%, rgba(100, 200, 255, 0.15) 50%, rgba(80, 255, 180, 0.15) 75%, rgba(255, 200, 100, 0.18) 100%)',
      cardBorder: '2px solid rgba(200, 160, 255, 0.6)',
      cardShadow: '0 0 25px rgba(255, 100, 200, 0.35), 0 0 45px rgba(130, 100, 255, 0.25), 0 0 60px rgba(100, 200, 255, 0.15), inset 0 0 30px rgba(200, 160, 255, 0.08)',
      labelColor: 'rgba(220, 180, 255, 0.95)',
      labelTextShadow: '0 0 10px rgba(200, 160, 255, 0.8)',
      positionBg: 'linear-gradient(135deg, rgba(255, 120, 200, 0.5) 0%, rgba(160, 120, 255, 0.45) 25%, rgba(100, 210, 255, 0.45) 50%, rgba(80, 255, 180, 0.45) 75%, rgba(255, 210, 100, 0.5) 100%)',
      positionBorder: '2px solid rgba(200, 160, 255, 0.8)',
      positionColor: '#e8d5ff',
      positionShadow: '0 0 20px rgba(255, 100, 200, 0.4), 0 0 30px rgba(130, 100, 255, 0.3), inset 0 0 15px rgba(200, 160, 255, 0.1)',
      avatarBorder: '2px solid rgba(200, 160, 255, 0.6)',
      avatarShadow: '0 0 12px rgba(255, 100, 200, 0.4), 0 0 20px rgba(130, 100, 255, 0.3)',
      avatarPlaceholderBg: 'linear-gradient(135deg, rgba(255, 120, 200, 0.3) 0%, rgba(130, 100, 255, 0.25) 50%, rgba(100, 210, 255, 0.2) 100%)',
      nameTextShadow: '0 0 6px rgba(200, 160, 255, 0.4)',
    },
    2: {
      rgb: [52, 211, 153],
      cardBg: 'linear-gradient(135deg, rgba(40, 230, 160, 0.18) 0%, rgba(16, 185, 129, 0.15) 50%, rgba(52, 211, 153, 0.12) 100%)',
      cardBorder: '2px solid rgba(52, 211, 153, 0.6)',
      cardShadow: '0 0 25px rgba(52, 211, 153, 0.4), 0 0 45px rgba(16, 185, 129, 0.25), inset 0 0 30px rgba(40, 230, 160, 0.08)',
      labelColor: 'rgba(80, 230, 170, 0.95)',
      labelTextShadow: '0 0 10px rgba(52, 211, 153, 0.7)',
      positionBg: 'linear-gradient(135deg, rgba(40, 230, 160, 0.5) 0%, rgba(16, 185, 129, 0.45) 50%, rgba(52, 211, 153, 0.4) 100%)',
      positionBorder: '2px solid rgba(52, 211, 153, 0.8)',
      positionColor: '#5eead4',
      positionShadow: '0 0 20px rgba(52, 211, 153, 0.5), 0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 15px rgba(40, 230, 160, 0.1)',
      avatarBorder: '2px solid rgba(52, 211, 153, 0.6)',
      avatarShadow: '0 0 12px rgba(52, 211, 153, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)',
      avatarPlaceholderBg: 'linear-gradient(135deg, rgba(40, 230, 160, 0.3) 0%, rgba(16, 185, 129, 0.25) 100%)',
      nameTextShadow: '0 0 6px rgba(52, 211, 153, 0.4)',
    },
    3: {
      rgb: [180, 30, 50],
      cardBg: 'linear-gradient(135deg, rgba(180, 30, 50, 0.22) 0%, rgba(140, 20, 40, 0.17) 50%, rgba(100, 15, 30, 0.12) 100%)',
      cardBorder: '2px solid rgba(180, 30, 50, 0.6)',
      cardShadow: '0 0 25px rgba(180, 30, 50, 0.4), 0 0 45px rgba(140, 20, 40, 0.25), inset 0 0 30px rgba(200, 40, 60, 0.08)',
      labelColor: 'rgba(220, 70, 90, 0.95)',
      labelTextShadow: '0 0 10px rgba(180, 30, 50, 0.7)',
      positionBg: 'linear-gradient(135deg, rgba(200, 40, 60, 0.55) 0%, rgba(160, 25, 45, 0.5) 50%, rgba(130, 20, 35, 0.45) 100%)',
      positionBorder: '2px solid rgba(180, 30, 50, 0.8)',
      positionColor: '#e05060',
      positionShadow: '0 0 20px rgba(180, 30, 50, 0.5), 0 0 30px rgba(140, 20, 40, 0.3), inset 0 0 15px rgba(200, 40, 60, 0.1)',
      avatarBorder: '2px solid rgba(180, 30, 50, 0.6)',
      avatarShadow: '0 0 12px rgba(180, 30, 50, 0.4), 0 0 20px rgba(140, 20, 40, 0.3)',
      avatarPlaceholderBg: 'linear-gradient(135deg, rgba(200, 40, 60, 0.3) 0%, rgba(140, 20, 40, 0.25) 100%)',
      nameTextShadow: '0 0 6px rgba(180, 30, 50, 0.4)',
    },
    4:  makeRankedStyle(245, 158, 11),  // Amber
    5:  makeRankedStyle(59, 130, 246),  // Blue
    6:  makeRankedStyle(168, 85, 247),  // Violet
    7:  makeRankedStyle(236, 72, 153),  // Pink
    8:  makeRankedStyle(6, 182, 212),   // Cyan
    9:  makeRankedStyle(249, 115, 22),  // Orange
    10: makeRankedStyle(99, 102, 241),  // Indigo
  };

  const DEFAULT_STYLE: PositionStyle = {
    rgb: [180, 220, 240],
    cardBg: 'rgba(255, 255, 255, 0.09)',
    cardBorder: '1px solid rgba(255, 255, 255, 0.12)',
    cardShadow: '0 0 10px rgba(180, 220, 240, 0.08), inset 0 0 15px rgba(200, 230, 245, 0.02)',
    labelColor: 'rgba(180, 220, 240, 0.9)',
    labelTextShadow: 'none',
    positionBg: 'rgba(220, 235, 245, 0.1)',
    positionBorder: '1px solid rgba(255, 255, 255, 0.12)',
    positionColor: '#f4f4f5',
    positionShadow: 'none',
    avatarBorder: '2px solid rgba(180, 220, 240, 0.4)',
    avatarShadow: 'none',
    avatarPlaceholderBg: 'linear-gradient(135deg, rgba(180, 220, 240, 0.3) 0%, rgba(160, 210, 235, 0.2) 100%)',
    nameTextShadow: 'none',
  };

  const getStyle = (position: number): PositionStyle => POSITION_STYLES[position] ?? DEFAULT_STYLE;


  return (
    <div className="space-y-6">
        {/* Leaderboard Type Selector */}
        <div className="flex justify-center mb-6">
        <div
          className="inline-flex rounded-full p-1"
          style={{
            background: 'rgba(220, 235, 245, 0.08)',
            border: '1px solid rgba(220, 235, 245, 0.12)',
            backdropFilter: 'blur(10px)'
          }}
        >
        <div className="inline-flex gap-2">
          {[LeaderboardType.LEVEL, LeaderboardType.BALANCE].map((type) => {
            // TASKS временно скрыт, так как логика на бэкенде не готова
            if (type === LeaderboardType.TASKS) return null;
            return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={cn(
                "px-6 md:px-8 py-2.5 md:py-3 rounded-full font-tech font-semibold text-sm md:text-base transition-all duration-300 ease-in-out",
                leaderboardType === type ? '' : 'opacity-50 hover:opacity-70'
              )}
              style={leaderboardType === type ? {
                background: 'linear-gradient(135deg, rgba(180, 220, 240, 0.25) 0%, rgba(160, 210, 235, 0.15) 100%)',
                border: '2px solid rgba(180, 220, 240, 0.4)',
                color: '#f4f4f5',
                boxShadow: '0 0 20px rgba(180, 220, 240, 0.3), inset 0 0 20px rgba(200, 230, 245, 0.05)',
                textShadow: '0 0 4px rgba(180, 220, 240, 0.3)',
                backdropFilter: 'blur(20px)'
              } : {
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(220, 235, 245, 0.6)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {t(`menu.types.${type.toLowerCase()}`)}
            </button>
            );
          })}
        </div>
        </div>
      </div>


      {/* Current User Card - Sticky at top */}
      {currentUser && (() => {
        const position = currentUser.position;
        
        const formatPosition = (pos: number): string => {
          if (pos > 9999) {
            return `${Math.floor(pos / 1000)}k`;
          } else if (pos > 999) {
            return `${(pos / 1000).toFixed(1)}k`;
          }
          return pos.toString();
        };
        const formattedPosition = formatPosition(position);
        const positionFontSize = position > 9999 ? '0.75rem' : position > 999 ? '0.875rem' : '1.125rem';
        
        return (
          <div 
            className="sticky z-10 mb-3 leaderboard-current-user-sticky" 
            style={{ 
              top: '1rem',
              opacity: isCurrentUserTransitioning ? 0 : 1,
              transform: isCurrentUserTransitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
            }}
          >
            <button
              onClick={() => onUserClick?.(currentUser.id)}
              className="w-full rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] text-left"
              style={{
                background: getStyle(position).cardBg,
                backdropFilter: 'blur(20px)',
                border: getStyle(position).cardBorder,
                boxShadow: getStyle(position).cardShadow
              }}
            >
              {/* Label inside card */}
              <div
                className="text-xs font-tech mb-2 px-1"
                style={{
                  color: getStyle(position).labelColor,
                  textShadow: getStyle(position).labelTextShadow,
                  letterSpacing: '0.05em'
                }}
              >
                {t('menu.leaderboard.yourPosition')}
              </div>
              <div className="flex items-center space-x-4">
                {/* Position */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-tech font-bold"
                  style={{
                    background: getStyle(position).positionBg,
                    border: getStyle(position).positionBorder,
                    color: getStyle(position).positionColor,
                    backdropFilter: 'blur(10px)',
                    boxShadow: getStyle(position).positionShadow,
                    fontSize: positionFontSize
                  }}
                >
                  {formattedPosition}
                </div>

              {/* Avatar */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden"
                style={{
                  border: getStyle(position).avatarBorder,
                  boxShadow: getStyle(position).avatarShadow
                }}
              >
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={`${currentUser.firstName} ${currentUser.lastName || ''}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: getStyle(position).avatarPlaceholderBg
                    }}
                  >
                    <Icon type="user" size={24} />
                  </div>
                )}
              </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-tech font-semibold text-base mb-1 truncate"
                    style={{
                      color: '#f4f4f5',
                      textShadow: getStyle(position).nameTextShadow
                    }}
                  >
                    {currentUser.firstName} {currentUser.lastName || ''}
                  </div>
                  <div
                    className="text-sm font-tech"
                    style={{
                      color: 'rgba(220, 235, 245, 0.7)'
                    }}
                  >
                    {getScoreLabel(displayLeaderboardType)}: {currentUser.score}
                  </div>
                </div>

              </div>
            </button>
          </div>
        );
      })()}

      {/* Loading indicator for current user */}
      {loading && !currentUser && (
        <div className="mb-3">
          <div
            className="text-xs font-tech mb-2 px-1"
            style={{
              color: 'rgba(180, 220, 240, 0.9)',
              textShadow: '0 0 8px rgba(180, 220, 240, 0.5)',
              letterSpacing: '0.05em'
            }}
          >
            {t('menu.leaderboard.yourPosition')}
          </div>
          <div
            className="rounded-xl p-4 animate-pulse w-full"
            style={{
              background: 'rgba(220, 235, 245, 0.05)',
              border: '1px solid rgba(220, 235, 245, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4">
              {/* Position skeleton */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full"
                style={{
                  background: 'rgba(220, 235, 245, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              ></div>
              {/* Avatar skeleton */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full"
                style={{
                  background: 'rgba(220, 235, 245, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}
              ></div>
              {/* User info skeleton */}
              <div className="flex-1 min-w-0">
                <div
                  className="h-4 w-32 rounded mb-2"
                  style={{
                    background: 'rgba(220, 235, 245, 0.1)'
                  }}
                ></div>
                <div
                  className="h-3 w-24 rounded"
                  style={{
                    background: 'rgba(220, 235, 245, 0.08)'
                  }}
                ></div>
              </div>
              {/* Icon skeleton */}
              <div
                className="flex-shrink-0 w-6 h-6 rounded"
                style={{
                  background: 'rgba(220, 235, 245, 0.1)'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Separator line between current user and leaderboard */}
      {currentUser && (
        <div 
          className="my-4"
          style={{
            opacity: (isTransitioning || isCurrentUserTransitioning) ? 0 : 1,
            transition: 'opacity 0.15s ease-out'
          }}
        >
          <div
            className="w-full h-px rounded-full"
            style={{
              background: 'rgba(180, 220, 240, 0.3)',
              boxShadow: '0 0 4px rgba(180, 220, 240, 0.2)'
            }}
          ></div>
          
          {/* Отображение общего количества под чертой */}
          {totalCount !== null && leaderboard.length > 0 && (
            <div 
              className="mt-4 text-sm font-tech" 
              style={{ 
                color: 'rgba(220, 235, 245, 0.7)',
                opacity: (isTransitioning || isCurrentUserTransitioning) ? 0 : 1,
                transition: 'opacity 0.15s ease-out'
              }}
            >
              {t('common.totalItems', { total: totalCount.toString() })}
            </div>
          )}
        </div>
      )}
      
      {/* Отображение общего количества если нет текущего пользователя */}
      {!currentUser && totalCount !== null && leaderboard.length > 0 && (
        <div 
          className="mb-4 text-sm font-tech" 
          style={{ 
            color: 'rgba(220, 235, 245, 0.7)',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 0.15s ease-out'
          }}
        >
          {t('common.totalItems', { total: totalCount.toString() })}
        </div>
      )}

      {/* Leaderboard List */}
      {loading && leaderboard.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 animate-pulse"
              style={{
                background: i < 3 
                  ? 'rgba(220, 235, 245, 0.08)' 
                  : 'rgba(220, 235, 245, 0.05)',
                border: i < 3
                  ? '1px solid rgba(220, 235, 245, 0.15)'
                  : '1px solid rgba(220, 235, 245, 0.1)'
              }}
            >
              <div className="flex items-center space-x-4">
                {/* Position skeleton */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full"
                  style={{
                    background: i < 3 
                      ? 'rgba(220, 235, 245, 0.15)' 
                      : 'rgba(220, 235, 245, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                ></div>
                {/* Avatar skeleton */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full"
                  style={{
                    background: 'rgba(220, 235, 245, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                ></div>
                {/* User info skeleton */}
                <div className="flex-1 min-w-0">
                  <div
                    className="h-4 w-32 rounded mb-2"
                    style={{
                      background: 'rgba(220, 235, 245, 0.1)'
                    }}
                  ></div>
                  <div
                    className="h-3 w-24 rounded"
                    style={{
                      background: 'rgba(220, 235, 245, 0.08)'
                    }}
                  ></div>
                </div>
                {/* Trophy icon skeleton for top 3 */}
                {i < 3 && (
                  <div
                    className="flex-shrink-0 w-5 h-5 rounded"
                    style={{
                      background: 'rgba(220, 235, 245, 0.1)'
                    }}
                  ></div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div 
            className="space-y-3"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
            }}
          >
            {leaderboard.map((user) => {
              const position = user.position;
              const s = getStyle(position);
              const formatPosition = (pos: number): string => {
                if (pos > 9999) return `${Math.floor(pos / 1000)}k`;
                if (pos > 999) return `${(pos / 1000).toFixed(1)}k`;
                return pos.toString();
              };
              const formattedPosition = formatPosition(position);
              const positionFontSize = position > 9999
                ? '0.75rem'
                : position > 999
                ? '0.875rem'
                : '1.125rem';

              return (
                <button
                  key={user.id}
                  onClick={() => onUserClick?.(user.id)}
                  className="w-full rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] text-left"
                  style={{
                    background: s.cardBg,
                    backdropFilter: 'blur(20px)',
                    border: s.cardBorder,
                    boxShadow: s.cardShadow
                  }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Position */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-tech font-bold"
                      style={{
                        background: s.positionBg,
                        border: s.positionBorder,
                        color: s.positionColor,
                        boxShadow: s.positionShadow,
                        backdropFilter: 'blur(10px)',
                        fontSize: positionFontSize
                      }}
                    >
                      {formattedPosition}
                    </div>

                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden"
                      style={{
                        border: s.avatarBorder,
                        boxShadow: s.avatarShadow
                      }}
                    >
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={`${user.firstName} ${user.lastName || ''}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: s.avatarPlaceholderBg
                          }}
                        >
                          <Icon type="user" size={24} />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-tech font-semibold text-base mb-1 truncate"
                        style={{
                          color: '#f4f4f5',
                          textShadow: s.nameTextShadow
                        }}
                      >
                        {user.firstName} {user.lastName || ''}
                      </div>
                      <div
                        className="text-sm font-tech"
                        style={{
                          color: 'rgba(220, 235, 245, 0.7)'
                        }}
                      >
                        {getScoreLabel(displayLeaderboardType)}: {user.score}
                      </div>
                    </div>

                  </div>
                </button>
              );
            })}
          </div>

          {/* Индикатор загрузки */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div 
                className="animate-spin rounded-full h-6 w-6 border-2"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  borderTopColor: 'rgba(180, 220, 240, 0.6)'
                }}
              ></div>
            </div>
          )}

          {/* Элемент для отслеживания скролла */}
          {hasMore && !loadingMore && (
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              <div className="text-xs font-tech" style={{ color: 'rgba(220, 235, 245, 0.5)' }}>
                {t('common.loading')}
              </div>
            </div>
          )}
        </>
      )}

      {/* Scroll Navigation Buttons */}
      <ScrollNavigationButtons isLoadingMore={loadingMore} />
    </div>
  );
};

export default LeaderboardView;

