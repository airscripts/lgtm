export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export type Category =
  | 'funny'
  | 'sarcastic'
  | 'wholesome'
  | 'nerd'
  | 'existential'
  | 'corporate'
  | 'chaotic';

export interface LGTMEntry {
  id: number;
  meaning: string;
  category: Category | string;
  rarity: Rarity;
  description?: string;
  tags?: string[];
  created_at?: string;
}

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare: 30,
  epic: 15,
  legendary: 5,
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const CATEGORY_LABELS: Record<string, string> = {
  funny: 'Funny',
  sarcastic: 'Sarcastic',
  wholesome: 'Wholesome',
  nerd: 'Nerd',
  existential: 'Existential',
  corporate: 'Corporate',
  chaotic: 'Chaotic',
};

import rawData from '../../data/lgtm.json';

export function getAllEntries(): LGTMEntry[] {
  return rawData as LGTMEntry[];
}

export function getEntryById(id: number): LGTMEntry | undefined {
  return getAllEntries().find((e) => e.id === id);
}

export function getEntriesByCategory(category: string): LGTMEntry[] {
  return getAllEntries().filter((e) => e.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(getAllEntries().map((e) => e.category))].sort();
}

export function getAllRarities(): Rarity[] {
  return Object.keys(RARITY_WEIGHTS) as Rarity[];
}

export function getEntriesByRarity(rarity: Rarity): LGTMEntry[] {
  return getAllEntries().filter((e) => e.rarity === rarity);
}
