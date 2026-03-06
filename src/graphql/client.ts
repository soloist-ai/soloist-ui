import { GraphQLClient, ClientError } from 'graphql-request';
import { getSdk } from './generated';
import type { SdkFunctionWrapper } from './generated';
import { auth } from '../auth';
import { getLanguageFromStorage } from '../hooks/useSettings';
import { apiBaseUrl, useMocks } from '../config/environment';
import { LeaderboardType } from '../api';

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

async function handleGraphqlMock(operationName: string, variables?: Record<string, unknown>): Promise<unknown> {
  const { mockUserService, mockPlayerService } = await import('../mocks/mockApi');

  switch (operationName) {
    case 'GetAppData': {
      const [userData, tasksData, topicsData, balanceData, additionalInfo] = await Promise.all([
        mockUserService.getCurrentUser(),
        mockPlayerService.getActiveTasks(),
        mockPlayerService.getCurrentPlayerTopics(),
        mockPlayerService.getPlayerBalance(),
        mockUserService.getUserAdditionalInfo(),
      ]);
      const u = userData.user;
      return {
        me: {
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          photoUrl: u.photoUrl,
          locale: additionalInfo.locale ? { tag: String(additionalInfo.locale), isManual: false } : null,
          roles: additionalInfo.roles ?? [],
          player: {
            id: u.player.id,
            agility: u.player.agility,
            strength: u.player.strength,
            intelligence: u.player.intelligence,
            level: u.player.level,
            stamina: tasksData.stamina,
            dayStreak: additionalInfo.dayStreak,
            balance: balanceData.balance
              ? { id: balanceData.balance.id, amount: balanceData.balance.balance }
              : null,
            taskTopics: { topics: topicsData.playerTaskTopics },
            activeTasks: { tasks: tasksData.tasks, isFirstTime: tasksData.isFirstTime },
          },
        },
      };
    }
    case 'RefreshActiveTasks': {
      const data = await mockPlayerService.getActiveTasks();
      return {
        me: {
          player: {
            activeTasks: { tasks: data.tasks, isFirstTime: data.isFirstTime },
            stamina: data.stamina,
          },
        },
      };
    }
    case 'RefreshPlayerStats': {
      const data = await mockUserService.getCurrentUser();
      const balanceData = await mockPlayerService.getPlayerBalance();
      const u = data.user;
      return {
        me: {
          player: {
            agility: u.player.agility,
            strength: u.player.strength,
            intelligence: u.player.intelligence,
            level: u.player.level,
            balance: balanceData.balance
              ? { id: balanceData.balance.id, amount: balanceData.balance.balance }
              : null,
          },
        },
      };
    }
    case 'RefreshTaskTopics': {
      const data = await mockPlayerService.getCurrentPlayerTopics();
      return {
        me: {
          player: { taskTopics: { topics: data.playerTaskTopics } },
        },
      };
    }
    case 'RefreshDayStreak': {
      const data = await mockUserService.getUserAdditionalInfo();
      return {
        me: {
          player: { dayStreak: data.dayStreak },
        },
      };
    }
    case 'GetCurrentUser': {
      const data = await mockUserService.getCurrentUser();
      const u = data.user;
      return {
        me: {
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          photoUrl: u.photoUrl,
          locale: u.locale ? { tag: String(u.locale), isManual: false } : null,
          roles: [],
          player: {
            id: u.player.id,
            agility: u.player.agility,
            strength: u.player.strength,
            intelligence: u.player.intelligence,
            level: u.player.level,
            balance: u.player.balance
              ? { id: u.player.balance.id, amount: u.player.balance.balance }
              : null,
            stamina: null,
          },
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
          player: {
            id: u.player.id,
            agility: u.player.agility,
            strength: u.player.strength,
            intelligence: u.player.intelligence,
            level: u.player.level,
          },
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
            agility: u.player.agility,
            strength: u.player.strength,
            intelligence: u.player.intelligence,
            level: u.player.level,
            balance: u.player.balance
              ? { id: u.player.balance.id, amount: u.player.balance.balance }
              : null,
          },
        },
      };
    }
    case 'GetUserTopics': {
      const data = await mockPlayerService.getCurrentPlayerTopics();
      return {
        me: {
          player: {
            taskTopics: { topics: data.playerTaskTopics },
          },
        },
      };
    }
    case 'GetPlayerTopics': {
      const data = await mockPlayerService.getCurrentPlayerTopics();
      return {
        me: {
          player: {
            taskTopics: { topics: data.playerTaskTopics },
          },
        },
      };
    }
    case 'GetPlayerBalance': {
      const data = await mockPlayerService.getPlayerBalance();
      return {
        me: {
          player: {
            balance: {
              id: data.balance.id,
              amount: data.balance.balance,
            },
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
    case 'GetClosedTasks': {
      const page = (variables?.paging as { page?: number })?.page;
      const pageSize = (variables?.paging as { pageSize?: number })?.pageSize ?? 20;
      const data = await mockPlayerService.searchPlayerTasks({}, page, pageSize);
      return {
        me: {
          player: {
            closedTasks: {
              tasks: data.tasks,
              paging: data.paging,
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
    case 'GetUserLeaderboard': {
      const filter = variables?.filter as { type?: string; range?: unknown } | undefined;
      const type = (filter?.type as keyof typeof LeaderboardType) ?? 'TASKS';
      const data = await mockUserService.getUserLeaderboard(
        LeaderboardType[type],
        { range: filter?.range as any }
      );
      return { userLeaderboard: data.user };
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
    case 'GetDailyTasks': {
      const data = await mockPlayerService.getDailyTasks();
      return {
        me: {
          player: {
            dailyTasks: { tasks: data.tasks },
          },
        },
      };
    }
    case 'GetUserAdditionalInfo': {
      const data = await mockUserService.getUserAdditionalInfo();
      return {
        me: {
          photoUrl: data.photoUrl,
          locale: data.locale,
          roles: data.roles,
          player: { dayStreak: data.dayStreak },
        },
      };
    }
    case 'GenerateTasks': {
      await mockPlayerService.generateTasks();
      return { generateTasks: true };
    }
    case 'CompleteTask': {
      const taskId = variables?.id as string;
      const data = await mockPlayerService.completeTask(taskId);
      // Map old REST Player to GraphQL CompleteTaskPlayer shape
      const mapPlayer = (p: typeof data.playerBefore) => ({
        id: p.id,
        agility: p.agility,
        strength: p.strength,
        intelligence: p.intelligence,
        level: p.level,
        balance: p.balance ? { id: p.balance.id, amount: p.balance.balance } : null,
        taskTopics: p.taskTopics ?? [],
      });
      return {
        completeTask: {
          playerBefore: mapPlayer(data.playerBefore),
          playerAfter: mapPlayer(data.playerAfter),
        },
      };
    }
    case 'SkipTask': {
      const taskId = variables?.id as string;
      await mockPlayerService.skipTask(taskId);
      return { skipTask: true };
    }
    case 'SavePlayerTopics': {
      const topics = variables?.topics as any[];
      await mockPlayerService.savePlayerTopics({ playerTaskTopics: topics });
      return { savePlayerTopics: true };
    }
    case 'UpdateUserLocale': {
      const locale = variables?.locale as { tag: string; isManual: boolean };
      await mockUserService.updateUserLocale({ locale: locale.tag });
      return { updateUserLocale: true };
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
