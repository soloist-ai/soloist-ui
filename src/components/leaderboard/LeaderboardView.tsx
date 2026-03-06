import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { gqlSdk } from '../../graphql/client';
import type { GetUsersLeaderboardQuery, GetLeaderboardInitialQuery } from '../../graphql/generated';
import { LeaderboardType } from '../../api';
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
      const hasMoreData = newUsers.length > 0 && (paging?.hasMore || false);

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
        const hasMoreData = newUsers.length > 0 && (paging?.hasMore || false);
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
      const hasMoreData = newUsers.length > 0 && (paging?.hasMore || false);

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

  // Вспомогательные функции для получения стилей топ-3 через switch case
  const getTopThreeBackground = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return 'rgba(255, 255, 255, 0.09)';
    }
    switch (position) {
      case 1:
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 165, 0, 0.15) 50%, rgba(255, 200, 0, 0.1) 100%)';
      case 2:
        return 'linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(160, 160, 160, 0.15) 50%, rgba(200, 200, 200, 0.1) 100%)';
      case 3:
        return 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(160, 82, 45, 0.15) 50%, rgba(220, 150, 80, 0.1) 100%)';
      default:
        return 'rgba(255, 255, 255, 0.09)';
    }
  };

  const getTopThreeBorder = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return position === 0 ? '2px solid rgba(180, 220, 240, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)';
    }
    switch (position) {
      case 1:
        return '2px solid rgba(255, 215, 0, 0.6)';
      case 2:
        return '2px solid rgba(192, 192, 192, 0.6)';
      case 3:
        return '2px solid rgba(205, 127, 50, 0.6)';
      default:
        return '1px solid rgba(255, 255, 255, 0.12)';
    }
  };

  const getTopThreeBoxShadow = (position: number, isTopThree: boolean, isCurrentUser: boolean = false): string => {
    if (!isTopThree) {
      if (isCurrentUser) {
        return '0 0 25px rgba(180, 220, 240, 0.4), inset 0 0 25px rgba(200, 230, 245, 0.08), 0 0 40px rgba(180, 220, 240, 0.2)';
      }
      return '0 0 15px rgba(180, 220, 240, 0.1), inset 0 0 20px rgba(200, 230, 245, 0.02)';
    }
    switch (position) {
      case 1:
        return '0 0 30px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.1), 0 0 50px rgba(255, 165, 0, 0.3)';
      case 2:
        return '0 0 30px rgba(192, 192, 192, 0.5), inset 0 0 30px rgba(192, 192, 192, 0.1), 0 0 50px rgba(160, 160, 160, 0.3)';
      case 3:
        return '0 0 30px rgba(205, 127, 50, 0.5), inset 0 0 30px rgba(205, 127, 50, 0.1), 0 0 50px rgba(160, 82, 45, 0.3)';
      default:
        return '0 0 15px rgba(180, 220, 240, 0.1), inset 0 0 20px rgba(200, 230, 245, 0.02)';
    }
  };

  const getTopThreeLabelColor = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return 'rgba(180, 220, 240, 0.9)';
    }
    switch (position) {
      case 1:
        return 'rgba(255, 215, 0, 0.95)';
      case 2:
        return 'rgba(192, 192, 192, 0.95)';
      case 3:
        return 'rgba(205, 127, 50, 0.95)';
      default:
        return 'rgba(180, 220, 240, 0.9)';
    }
  };

  const getTopThreeLabelTextShadow = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return '0 0 8px rgba(180, 220, 240, 0.5)';
    }
    switch (position) {
      case 1:
        return '0 0 10px rgba(255, 215, 0, 0.8)';
      case 2:
        return '0 0 10px rgba(192, 192, 192, 0.8)';
      case 3:
        return '0 0 10px rgba(205, 127, 50, 0.8)';
      default:
        return '0 0 8px rgba(180, 220, 240, 0.5)';
    }
  };

  const getTopThreePositionBackground = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return 'linear-gradient(135deg, rgba(180, 220, 240, 0.3) 0%, rgba(160, 210, 235, 0.2) 100%)';
    }
    switch (position) {
      case 1:
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 165, 0, 0.3) 100%)';
      case 2:
        return 'linear-gradient(135deg, rgba(192, 192, 192, 0.4) 0%, rgba(160, 160, 160, 0.3) 100%)';
      case 3:
        return 'linear-gradient(135deg, rgba(205, 127, 50, 0.4) 0%, rgba(160, 82, 45, 0.3) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(180, 220, 240, 0.3) 0%, rgba(160, 210, 235, 0.2) 100%)';
    }
  };

  const getTopThreePositionBorder = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return '2px solid rgba(180, 220, 240, 0.6)';
    }
    switch (position) {
      case 1:
        return '2px solid rgba(255, 215, 0, 0.8)';
      case 2:
        return '2px solid rgba(192, 192, 192, 0.8)';
      case 3:
        return '2px solid rgba(205, 127, 50, 0.8)';
      default:
        return '2px solid rgba(180, 220, 240, 0.6)';
    }
  };

  const getTopThreePositionColor = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return '#f4f4f5';
    }
    switch (position) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#f4f4f5';
    }
  };

  const getTopThreePositionBoxShadow = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return '0 0 15px rgba(180, 220, 240, 0.4), inset 0 0 10px rgba(200, 230, 245, 0.1)';
    }
    switch (position) {
      case 1:
        return '0 0 25px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.15)';
      case 2:
        return '0 0 25px rgba(192, 192, 192, 0.6), inset 0 0 20px rgba(192, 192, 192, 0.15)';
      case 3:
        return '0 0 25px rgba(205, 127, 50, 0.6), inset 0 0 20px rgba(205, 127, 50, 0.15)';
      default:
        return '0 0 15px rgba(180, 220, 240, 0.4), inset 0 0 10px rgba(200, 230, 245, 0.1)';
    }
  };

  const getTopThreeAvatarBorder = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return '2px solid rgba(180, 220, 240, 0.4)';
    }
    switch (position) {
      case 1:
        return '2px solid rgba(255, 215, 0, 0.6)';
      case 2:
        return '2px solid rgba(192, 192, 192, 0.6)';
      case 3:
        return '2px solid rgba(205, 127, 50, 0.6)';
      default:
        return '2px solid rgba(180, 220, 240, 0.4)';
    }
  };

  const getTopThreeAvatarBoxShadow = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return '0 0 10px rgba(180, 220, 240, 0.3)';
    }
    switch (position) {
      case 1:
        return '0 0 15px rgba(255, 215, 0, 0.5)';
      case 2:
        return '0 0 15px rgba(192, 192, 192, 0.5)';
      case 3:
        return '0 0 15px rgba(205, 127, 50, 0.5)';
      default:
        return '0 0 10px rgba(180, 220, 240, 0.3)';
    }
  };

  const getTopThreeAvatarPlaceholderBackground = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return 'linear-gradient(135deg, rgba(180, 220, 240, 0.3) 0%, rgba(160, 210, 235, 0.2) 100%)';
    }
    switch (position) {
      case 1:
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%)';
      case 2:
        return 'linear-gradient(135deg, rgba(192, 192, 192, 0.3) 0%, rgba(160, 160, 160, 0.2) 100%)';
      case 3:
        return 'linear-gradient(135deg, rgba(205, 127, 50, 0.3) 0%, rgba(160, 82, 45, 0.2) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(180, 220, 240, 0.3) 0%, rgba(160, 210, 235, 0.2) 100%)';
    }
  };

  const getTopThreeNameTextShadow = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return '0 0 4px rgba(180, 220, 240, 0.2)';
    }
    switch (position) {
      case 1:
        return '0 0 6px rgba(255, 215, 0, 0.4)';
      case 2:
        return '0 0 6px rgba(192, 192, 192, 0.4)';
      case 3:
        return '0 0 6px rgba(205, 127, 50, 0.4)';
      default:
        return '0 0 4px rgba(180, 220, 240, 0.2)';
    }
  };

  const getTopThreeIconColor = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return 'rgba(180, 220, 240, 1)';
    }
    switch (position) {
      case 1:
        return 'rgba(255, 215, 0, 1)';
      case 2:
        return 'rgba(192, 192, 192, 1)';
      case 3:
        return 'rgba(205, 127, 50, 1)';
      default:
        return 'rgba(180, 220, 240, 1)';
    }
  };

  const getTopThreeIconFilter = (position: number, isTopThree: boolean, isCurrentUser: boolean = false): string => {
    if (!isTopThree) {
      if (isCurrentUser) {
        return 'drop-shadow(0 0 12px rgba(180, 220, 240, 0.8)) drop-shadow(0 0 20px rgba(160, 210, 235, 0.4))';
      }
      return '';
    }
    switch (position) {
      case 1:
        return 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 25px rgba(255, 165, 0, 0.5))';
      case 2:
        return 'drop-shadow(0 0 15px rgba(192, 192, 192, 0.9)) drop-shadow(0 0 25px rgba(160, 160, 160, 0.5))';
      case 3:
        return 'drop-shadow(0 0 15px rgba(205, 127, 50, 0.9)) drop-shadow(0 0 25px rgba(160, 82, 45, 0.5))';
      default:
        return '';
    }
  };

  const getTopThreeListPositionBoxShadow = (position: number, isTopThree: boolean): string => {
    if (!isTopThree) {
      return 'none';
    }
    switch (position) {
      case 1:
        return '0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 15px rgba(255, 215, 0, 0.1)';
      case 2:
        return '0 0 20px rgba(192, 192, 192, 0.5), inset 0 0 15px rgba(192, 192, 192, 0.1)';
      case 3:
        return '0 0 20px rgba(205, 127, 50, 0.5), inset 0 0 15px rgba(205, 127, 50, 0.1)';
      default:
        return 'none';
    }
  };


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
        const isTopThree = currentUser.position <= 3;
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
                background: getTopThreeBackground(position, isTopThree),
                backdropFilter: 'blur(20px)',
                border: getTopThreeBorder(position, isTopThree),
                boxShadow: getTopThreeBoxShadow(position, isTopThree, true)
              }}
            >
              {/* Label inside card */}
              <div
                className="text-xs font-tech mb-2 px-1"
                style={{
                  color: getTopThreeLabelColor(position, isTopThree),
                  textShadow: getTopThreeLabelTextShadow(position, isTopThree),
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
                    background: getTopThreePositionBackground(position, isTopThree),
                    border: getTopThreePositionBorder(position, isTopThree),
                    color: getTopThreePositionColor(position, isTopThree),
                    backdropFilter: 'blur(10px)',
                    boxShadow: getTopThreePositionBoxShadow(position, isTopThree),
                    fontSize: positionFontSize
                  }}
                >
                  {formattedPosition}
                </div>

              {/* Avatar */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden"
                style={{
                  border: getTopThreeAvatarBorder(position, isTopThree),
                  boxShadow: getTopThreeAvatarBoxShadow(position, isTopThree)
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
                      background: getTopThreeAvatarPlaceholderBackground(position, isTopThree)
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
                      textShadow: getTopThreeNameTextShadow(position, isTopThree)
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

                {/* Highlight Icon */}
                <div
                  className="flex-shrink-0"
                  style={{
                    color: getTopThreeIconColor(position, isTopThree),
                    filter: getTopThreeIconFilter(position, isTopThree, true)
                  }}
                >
                  <Icon type={isTopThree ? "trophy" : "award"} size={24} />
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
            {leaderboard.map((user, index) => {
              const isTopThree = index < 3;
              const position = user.position;
              // Форматируем позицию для больших чисел
              const formatPosition = (pos: number): string => {
                if (pos > 9999) {
                  return `${Math.floor(pos / 1000)}k`;
                } else if (pos > 999) {
                  return `${(pos / 1000).toFixed(1)}k`;
                }
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
                    background: getTopThreeBackground(position, isTopThree),
                    backdropFilter: 'blur(20px)',
                    border: getTopThreeBorder(position, isTopThree),
                    boxShadow: getTopThreeBoxShadow(position, isTopThree)
                  }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Position */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-tech font-bold"
                      style={{
                        background: isTopThree 
                          ? getTopThreePositionBackground(position, isTopThree)
                          : 'rgba(220, 235, 245, 0.1)',
                        border: isTopThree
                          ? getTopThreePositionBorder(position, isTopThree)
                          : '1px solid rgba(255, 255, 255, 0.12)',
                        color: getTopThreePositionColor(position, isTopThree),
                        boxShadow: isTopThree
                          ? getTopThreeListPositionBoxShadow(position, isTopThree)
                          : 'none',
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
                        border: getTopThreeAvatarBorder(position, isTopThree),
                        boxShadow: getTopThreeAvatarBoxShadow(position, isTopThree)
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
                            background: getTopThreeAvatarPlaceholderBackground(position, isTopThree)
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
                          textShadow: getTopThreeNameTextShadow(position, isTopThree)
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

                    {/* Trophy Icon for top 3 - только для визуального акцента */}
                    {isTopThree && (
                      <div
                        className="flex-shrink-0"
                        style={{
                          color: getTopThreeIconColor(position, isTopThree),
                          filter: getTopThreeIconFilter(position, isTopThree)
                        }}
                      >
                        <Icon type="trophy" size={20} />
                      </div>
                    )}
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

