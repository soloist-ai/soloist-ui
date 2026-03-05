import { TaskRarity } from '../api';

export const getTaskStaminaCost = (rarity?: TaskRarity): number => {
  switch (rarity) {
    case TaskRarity.COMMON: return 10;
    case TaskRarity.UNCOMMON: return 20;
    case TaskRarity.RARE: return 30;
    case TaskRarity.EPIC: return 40;
    case TaskRarity.LEGENDARY: return 50;
    default: return 10;
  }
};

export const SKIP_STAMINA_COST = 5;
