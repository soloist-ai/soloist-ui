import type {
  LoginResponse,
  RefreshResponse,
  GetUserResponse,
  GetPlayerBalanceResponse,
  SearchPlayerBalanceTransactionsResponse,
  GetUsersLeaderboardResponse,
  GetUsersLeaderboardRequest,
  GetUserLeaderboardResponse,
  TgAuthData,
  RefreshRequest,
  SearchRequest,
  LocalizedField,
  User,
} from '../api';
import {
  mockGetUserResponse,
  mockGetPlayerBalanceResponse,
  mockLoginResponse,
  mockRefreshResponse,
  mockTransactions,
  generateMockLeaderboardUsers,
  mockUser,
  createMockLeaderboardResponse,
} from './mockData';
import { LeaderboardType, Assessment } from '../api';
import { CancelablePromise } from '../api';

// Simulate network latency
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  login: (_requestBody: TgAuthData): CancelablePromise<LoginResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(3000);
      resolve(mockLoginResponse);
    });
  },

  refresh: (_requestBody: RefreshRequest): CancelablePromise<RefreshResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(300);
      resolve(mockRefreshResponse);
    });
  },
};

export const mockUserService = {
  getCurrentUser: (): CancelablePromise<GetUserResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      resolve(mockGetUserResponse);
    });
  },

  getUser: (userId: number): CancelablePromise<GetUserResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      const allUsers = generateMockLeaderboardUsers(200);
      const leaderboardUser = allUsers.find(u => u.id === userId);
      const mockUserData: User = leaderboardUser ? {
        id: leaderboardUser.id,
        username: `user_${leaderboardUser.id}`,
        firstName: leaderboardUser.firstName,
        lastName: leaderboardUser.lastName,
        photoUrl: leaderboardUser.photoUrl,
        locale: 'ru',
        player: {
          id: leaderboardUser.id,
          agility: 0,
          strength: 0,
          intelligence: 0,
          level: {
            id: `level-${leaderboardUser.id}`,
            level: 1,
            totalExperience: 0,
            currentExperience: 0,
            experienceToNextLevel: 1000,
            assessment: Assessment.E,
          },
          balance: {
            id: `balance-${leaderboardUser.id}`,
            balance: {
              currencyCode: 'GEM',
              amount: leaderboardUser.score || 0,
            },
          },
          taskTopics: [],
        },
      } : mockUser;
      resolve({ user: mockUserData });
    });
  },

  getUserAdditionalInfo: (): CancelablePromise<{
    photoUrl?: string;
    dayStreak: { id: string; current: number; max: number; isExtendedToday: boolean };
    locale: string;
    roles: string[];
  }> => {
    return new CancelablePromise(async (resolve) => {
      await delay(200);
      resolve({
        photoUrl: undefined,
        dayStreak: {
          id: 'mock-streak',
          current: 3,
          max: 7,
          isExtendedToday: false,
        },
        locale: 'ru',
        roles: [],
      });
    });
  },

  updateUserLocale: (_requestBody: any): CancelablePromise<any> => {
    return new CancelablePromise(async (resolve) => {
      await delay(300);
      resolve({ locale: 'ru' });
    });
  },

  getUsersLeaderboard: (
    _type: LeaderboardType,
    _requestBody: GetUsersLeaderboardRequest,
    page?: number,
    pageSize: number = 20
  ): CancelablePromise<GetUsersLeaderboardResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      const currentPage = page || 0;
      const response = createMockLeaderboardResponse(currentPage, pageSize, 200);
      resolve(response);
    });
  },

  getUserLeaderboard: (
    type: LeaderboardType,
    _requestBody: GetUsersLeaderboardRequest,
  ): CancelablePromise<GetUserLeaderboardResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      const currentUserId = mockUser.id;
      const mockPosition = 12345;

      let score: number;
      if (type === LeaderboardType.LEVEL) {
        score = 2500;
      } else if (type === LeaderboardType.BALANCE) {
        score = 1500;
      } else {
        score = 1000;
      }

      resolve({
        user: {
          id: currentUserId,
          firstName: mockUser.firstName || 'User',
          ...(mockUser.lastName && { lastName: mockUser.lastName }),
          ...(mockUser.photoUrl && { photoUrl: mockUser.photoUrl }),
          score,
          position: mockPosition,
        },
      });
    });
  },
};

export const mockPlayerService = {
  getPlayerBalance: (): CancelablePromise<GetPlayerBalanceResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      resolve(mockGetPlayerBalanceResponse);
    });
  },

  searchPlayerBalanceTransactions: (
    requestBody: SearchRequest,
    page?: number,
    pageSize: number = 20
  ): CancelablePromise<SearchPlayerBalanceTransactionsResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);

      let filteredTransactions = [...mockTransactions];

      if (requestBody.options?.filter?.dateFilters) {
        requestBody.options.filter.dateFilters.forEach(dateFilter => {
          if (dateFilter.field === 'createdAt' && dateFilter.range?.from && dateFilter.range?.to) {
            const fromDate = new Date(dateFilter.range.from);
            const toDate = new Date(dateFilter.range.to);
            filteredTransactions = filteredTransactions.filter(transaction => {
              const transactionDate = new Date(transaction.createdAt);
              return transactionDate >= fromDate && transactionDate <= toDate;
            });
          }
        });
      }

      if (requestBody.options?.filter?.enumFilters) {
        requestBody.options.filter.enumFilters.forEach(enumFilter => {
          if (enumFilter.values.length > 0) {
            if (enumFilter.field === 'type') {
              filteredTransactions = filteredTransactions.filter(transaction =>
                enumFilter.values.includes(transaction.type.toString())
              );
            } else if (enumFilter.field === 'cause') {
              filteredTransactions = filteredTransactions.filter(transaction =>
                enumFilter.values.includes(transaction.cause.toString())
              );
            }
          }
        });
      }

      filteredTransactions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const currentPage = page || 0;
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

      const mockFilters: LocalizedField[] = [
        {
          field: 'type',
          localization: 'Type',
          items: [
            { name: 'IN', localization: 'Income' },
            { name: 'OUT', localization: 'Outcome' },
          ],
        },
        {
          field: 'cause',
          localization: 'Cause',
          items: [
            { name: 'TASK_COMPLETION', localization: 'Task Completion' },
            { name: 'DAILY_CHECK_IN', localization: 'Daily Check-in' },
          ],
        },
      ];

      resolve({
        transactions: paginatedTransactions,
        paging: {
          totalRowCount: filteredTransactions.length,
          totalPageCount: Math.ceil(filteredTransactions.length / pageSize),
          currentPage: currentPage,
          currentPageSize: paginatedTransactions.length,
        },
        options: {
          filters: mockFilters,
        },
      });
    });
  },

  getMonthlyActivity: (year: number, month: number): CancelablePromise<{ activeDays?: number[] }> => {
    return new CancelablePromise(async (resolve) => {
      await delay(200);
      const today = new Date().getDate();
      const activeDays = [1, 5, Math.min(10, today), Math.min(15, today), Math.min(20, today)].filter(
        (d, i, arr) => arr.indexOf(d) === i && d <= new Date(year, month, 0).getDate()
      );
      resolve({ activeDays });
    });
  },
};
