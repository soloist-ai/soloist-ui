import { gqlSdk } from '../graphql/client';
import type { PlayerTask, CompleteTaskMutation } from '../graphql/generated';

export type CompleteTaskResult = CompleteTaskMutation['completeTask'];

export const taskActions = {
  completeTask: async (playerTask: PlayerTask): Promise<CompleteTaskResult> => {
    if (!playerTask.id) throw new Error('Task ID is required');
    const data = await gqlSdk.CompleteTask({ id: playerTask.id });
    return data.completeTask;
  },

  skipTask: async (playerTask: PlayerTask): Promise<void> => {
    if (!playerTask.id) throw new Error('Task ID is required');
    await gqlSdk.SkipTask({ id: playerTask.id });
  },
};
