import { GraphQLClient, ClientError } from 'graphql-request';
import { getSdk } from './generated';
import type { SdkFunctionWrapper } from './generated';
import { auth } from '../auth';
import { getLanguageFromStorage } from '../hooks/useSettings';
import { apiBaseUrl, useMocks } from '../config/environment';
import { LeaderboardType } from './generated';

const GRAPHQL_URL = `${apiBaseUrl}/graphql`;

const gqlClient = new GraphQLClient(GRAPHQL_URL);

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof ClientError) {
    return error.response?.status === 401;
  }
  if (error && typeof error === 'object' && 'response' in error) {
    const e = error as { response?: { status?: number } };
    return e.response?.status === 401;
  }
  return false;
}

function buildRequestHeaders(): Record<string, string> {
  const token = auth.getAccessToken();
  const headers: Record<string, string> = {
    'Accept-Language': getLanguageFromStorage(),
    'X-TimeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    'API-Version': '1',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ── Mock support ────────────────────────────────────────────────────────────

/** Mock task state — shared across operations in a single session */
const mockTaskState = (() => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let tasks = [
    {
      id: 'dt-steps',
      type: 'STEPS',
      name: null,
      goal: 8000,
      progress: 3200,
      gemReward: 50,
      isCompleted: false,
      proofType: 'PHOTO',
      day: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'dt-pushups',
      type: 'PUSH_UPS',
      name: null,
      goal: 30,
      progress: 0,
      gemReward: 40,
      isCompleted: false,
      proofType: 'PHOTO',
      day: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'dt-squats',
      type: 'SQUATS',
      name: null,
      goal: 50,
      progress: 50,
      gemReward: 40,
      isCompleted: true,
      proofType: 'PHOTO',
      day: today,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ct-1',
      type: 'CUSTOM',
      name: 'Read 30 pages',
      goal: 1,
      progress: 0,
      gemReward: 60,
      isCompleted: false,
      proofType: 'PHOTO',
      day: today,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const historyTasks = [
    {
      id: 'h-1',
      type: 'STEPS',
      name: null,
      goal: 5000,
      progress: 5000,
      gemReward: 100,
      isCompleted: true,
      proofType: 'PHOTO',
      day: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'h-2',
      type: 'PUSH_UPS',
      name: null,
      goal: 30,
      progress: 30,
      gemReward: 40,
      isCompleted: true,
      proofType: 'VIDEO',
      day: new Date(Date.now() - 259200000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'h-3',
      type: 'CUSTOM',
      name: 'Meditate 15 minutes',
      goal: 1,
      progress: 1,
      gemReward: 55,
      isCompleted: true,
      proofType: 'TEXT',
      day: new Date(Date.now() - 345600000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
  ];

  return {
    getTasks: () => [...tasks],
    getHistoryTasks: () => [...historyTasks],
    createCustomTask: (name: string) => {
      // Simple mock validation: reject if name is too short
      if (name.trim().length < 5) {
        return { isValid: false, rejectionReason: 'Task name is too vague', task: null };
      }
      const newTask = {
        id: `ct-${Date.now()}`,
        type: 'CUSTOM',
        name,
        goal: 1,
        progress: 0,
        gemReward: 50 + Math.floor(Math.random() * 50),
        isCompleted: false,
        proofType: ['TEXT', 'PHOTO', 'VIDEO'][Math.floor(Math.random() * 3)] as string,
        day: today,
        createdAt: new Date().toISOString(),
      };
      tasks = [...tasks, newTask];
      return { isValid: true, rejectionReason: null, task: { ...newTask } };
    },
  };
})();

async function handleGraphqlMock(operationName: string, variables?: Record<string, unknown>): Promise<unknown> {
  const { mockUserService, mockPlayerService } = await import('../mocks/mockApi');

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  switch (operationName) {
    case 'GetAppData': {
      const [userData, additionalInfo] = await Promise.all([
        mockUserService.getCurrentUser(),
        mockUserService.getUserAdditionalInfo(),
      ]);
      const u = userData.user;
      return {
        me: {
          id: u.id,
          photoUrl: u.photoUrl,
          locale: additionalInfo.locale ? { tag: String(additionalInfo.locale), isManual: false } : null,
          roles: additionalInfo.roles ?? [],
          player: {
            dayStreak: additionalInfo.dayStreak,
            tasks: {
              tasks: mockTaskState.getTasks(),
            },
          },
        },
      };
    }
    case 'GetTasks': {
      return {
        me: {
          player: {
            tasks: {
              tasks: mockTaskState.getTasks(),
            },
          },
        },
      };
    }
    case 'GetTaskHistory': {
      const page = (variables?.paging as { page?: number })?.page ?? 0;
      const pageSize = (variables?.paging as { pageSize?: number })?.pageSize ?? 20;
      const all = mockTaskState.getHistoryTasks();
      const start = page * pageSize;
      const sliced = all.slice(start, start + pageSize);
      return {
        me: {
          player: {
            taskHistory: {
              tasks: sliced,
              paging: {
                totalRowCount: all.length,
                totalPageCount: Math.ceil(all.length / pageSize),
                currentPage: page,
                currentPageSize: sliced.length,
              },
            },
          },
        },
      };
    }
    case 'CreateCustomTask': {
      const name = variables?.name as string;
      const result = mockTaskState.createCustomTask(name);
      return { createCustomTask: result };
    }
    case 'RefreshDayStreak': {
      const data = await mockUserService.getUserAdditionalInfo();
      return {
        me: {
          player: { dayStreak: data.dayStreak },
        },
      };
    }
    case 'GetUserProfile': {
      const data = await mockUserService.getCurrentUser();
      const u = data.user;
      return {
        me: {
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          photoUrl: u.photoUrl,
          roles: [],
          locale: u.locale ? { tag: String(u.locale), isManual: false } : null,
          player: { id: u.player.id },
        },
      };
    }
    case 'GetUserById': {
      const userId = variables?.id as number | undefined;
      if (userId == null) throw new Error('GetUserById requires id variable');
      const data = await mockUserService.getUser(userId);
      const u = data.user;
      return {
        user: {
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          photoUrl: u.photoUrl,
          locale: u.locale ? { tag: String(u.locale), isManual: false } : null,
          roles: [],
          player: {
            id: u.player.id,
            balance: u.player.balance
              ? { id: u.player.balance.id, amount: u.player.balance.balance }
              : null,
          },
        },
      };
    }
    case 'GetBalanceWithTransactions': {
      const page = (variables?.paging as { page?: number })?.page;
      const pageSize = (variables?.paging as { pageSize?: number })?.pageSize ?? 20;
      const [balanceData, transData] = await Promise.all([
        mockPlayerService.getPlayerBalance(),
        mockPlayerService.searchPlayerBalanceTransactions({}, page, pageSize),
      ]);
      return {
        me: {
          player: {
            balance: {
              id: balanceData.balance.id,
              amount: balanceData.balance.balance,
              transactions: {
                transactions: transData.transactions,
                paging: transData.paging,
              },
            },
          },
        },
      };
    }
    case 'GetBalanceTransactions': {
      const page = (variables?.paging as { page?: number })?.page;
      const pageSize = (variables?.paging as { pageSize?: number })?.pageSize ?? 20;
      const data = await mockPlayerService.searchPlayerBalanceTransactions({}, page, pageSize);
      return {
        me: {
          player: {
            balance: {
              transactions: {
                transactions: data.transactions,
                paging: data.paging,
              },
            },
          },
        },
      };
    }
    case 'GetUsersLeaderboard': {
      const filter = variables?.filter as { type?: string; range?: unknown } | undefined;
      const page = (variables?.paging as { page?: number })?.page;
      const pageSize = (variables?.paging as { pageSize?: number })?.pageSize ?? 20;
      const type = (filter?.type as keyof typeof LeaderboardType) ?? 'TASKS';
      const data = await mockUserService.getUsersLeaderboard(
        LeaderboardType[type],
        { range: filter?.range as any },
        page,
        pageSize
      );
      return { usersLeaderboard: data };
    }
    case 'GetLeaderboardInitial': {
      const filter = variables?.filter as { type?: string; range?: unknown } | undefined;
      const page = (variables?.paging as { page?: number })?.page;
      const pageSize = (variables?.paging as { pageSize?: number })?.pageSize ?? 20;
      const type = (filter?.type as keyof typeof LeaderboardType) ?? 'TASKS';
      const [usersData, userData] = await Promise.all([
        mockUserService.getUsersLeaderboard(LeaderboardType[type], { range: filter?.range as any }, page, pageSize),
        mockUserService.getUserLeaderboard(LeaderboardType[type], { range: filter?.range as any }),
      ]);
      return {
        usersLeaderboard: usersData,
        userLeaderboard: userData.user,
      };
    }
    case 'GetMonthlyActivity': {
      const year = variables?.year as number;
      const month = variables?.month as number;
      const data = await mockPlayerService.getMonthlyActivity(year, month);
      return {
        me: {
          player: {
            monthlyActivity: { activeDays: data.activeDays ?? [] },
          },
        },
      };
    }
    case 'UpdateUserLocale': {
      const locale = variables?.locale as { tag: string; isManual: boolean };
      await mockUserService.updateUserLocale({ locale: locale.tag });
      return { updateUserLocale: true };
    }
    case 'GetUserLocale': {
      const data = await mockUserService.getUserAdditionalInfo();
      return {
        me: {
          locale: data.locale ? { tag: String(data.locale), isManual: false } : null,
        },
      };
    }
    default:
      return null;
  }
}

// ── SDK wrapper with auth + 401 retry + mock support ────────────────────────

const withAuthAndRetry: SdkFunctionWrapper = async <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  _operationType: string | undefined,
  variables: any
): Promise<T> => {
  if (useMocks) {
    const mockResult = await handleGraphqlMock(operationName, variables as Record<string, unknown>);
    if (mockResult !== null) {
      return mockResult as T;
    }
  }

  const headers = buildRequestHeaders();

  try {
    return await action(headers);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      const newToken = await auth.handle401Error();
      if (newToken) {
        return await action({ ...headers, Authorization: `Bearer ${newToken}` });
      }
    }
    throw error;
  }
};

export const gqlSdk = getSdk(gqlClient, withAuthAndRetry);
