import { Rarity } from '../graphql/generated';

export const getTaskStaminaCost = (rarity?: Rarity): number => {
  switch (rarity) {
    case Rarity.COMMON: return 10;
    case Rarity.UNCOMMON: return 20;
    case Rarity.RARE: return 30;
    case Rarity.EPIC: return 40;
    case Rarity.LEGENDARY: return 50;
    default: return 10;
  }
};

export const SKIP_STAMINA_COST = 5;
