import { gqlSdk } from './graphql/client';
import type { CompleteTaskResponse } from './api';
import type { PlayerTask as ApiPlayerTask } from './api/models/PlayerTask';

export const taskActions = {
  completeTask: async (playerTask: ApiPlayerTask): Promise<CompleteTaskResponse> => {
    if (!playerTask.id) throw new Error('Task ID is required');
    const data = await gqlSdk.CompleteTask({ id: playerTask.id });

    const mapPlayer = (p: typeof data.completeTask.playerBefore) => ({
      id: Number(p.id),
      agility: p.agility,
      strength: p.strength,
      intelligence: p.intelligence,
      level: p.level as any,
      balance: p.balance
        ? {
            id: p.balance.id,
            balance: {
              currencyCode: p.balance.amount.currencyCode,
              amount: Number(p.balance.amount.amount),
            },
          }
        : undefined,
      taskTopics: p.taskTopics as any,
    });

    return {
      playerBefore: mapPlayer(data.completeTask.playerBefore),
      playerAfter: mapPlayer(data.completeTask.playerAfter),
    };
  },

  skipTask: async (playerTask: ApiPlayerTask): Promise<void> => {
    if (!playerTask.id) throw new Error('Task ID is required');
    await gqlSdk.SkipTask({ id: playerTask.id });
  },
};
