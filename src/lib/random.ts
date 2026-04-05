import { RARITY_WEIGHTS } from '@/lib/lgtm';
import type { LGTMEntry, Rarity } from '@/lib/lgtm';

function entryWeight(entry: LGTMEntry): number {
  return RARITY_WEIGHTS[entry.rarity as Rarity] ?? RARITY_WEIGHTS.common;
}

function buildPool(entries: LGTMEntry[], excludeId: number): LGTMEntry[] {
  return entries.length > 1 ? entries.filter((entry) => entry.id !== excludeId) : entries;
}

export function weightedRandom(entries: LGTMEntry[]): LGTMEntry {
  if (entries.length === 0) throw new Error('Cannot pick from empty list');

  const totalWeight = entries.reduce((sum, entry) => sum + entryWeight(entry), 0);

  let remaining = Math.random() * totalWeight;

  for (const entry of entries) {
    remaining -= entryWeight(entry);
    if (remaining <= 0) return entry;
  }

  return entries[entries.length - 1]!;
}

export function weightedRandomExcluding(entries: LGTMEntry[], excludeId: number): LGTMEntry {
  const pool = buildPool(entries, excludeId);
  return weightedRandom(pool);
}
