import { makeEntry } from '@/test/fixtures';
import type { LGTMEntry, Rarity } from '@/lib/lgtm';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { weightedRandom, weightedRandomExcluding } from '@/lib/random';

const entries: LGTMEntry[] = [
  makeEntry({ id: 1, rarity: 'common' }),
  makeEntry({ id: 2, rarity: 'rare' }),
  makeEntry({ id: 3, rarity: 'epic' }),
  makeEntry({ id: 4, rarity: 'legendary' }),
];

describe('weighted random', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should throw for empty input', () => {
    expect(() => weightedRandom([])).toThrow();
  });

  test('should return one of the provided entries', () => {
    for (let i = 0; i < 20; i++) {
      const result = weightedRandom(entries);
      expect(entries).toContain(result);
    }
  });

  test('should return the only entry when list has one item', () => {
    const single = [makeEntry({ id: 99, rarity: 'common' })];
    expect(weightedRandom(single)).toBe(single[0]);
  });

  test('should respect weights, common is more frequent than legendary', () => {
    const pool = [makeEntry({ id: 1, rarity: 'common' }), makeEntry({ id: 2, rarity: 'legendary' })];

    let commonCount = 0;
    const TRIALS = 1000;

    for (let i = 0; i < TRIALS; i++) {
      if (weightedRandom(pool).rarity === 'common') commonCount++;
    }

    expect(commonCount / TRIALS).toBeGreaterThan(0.75);
  });

  test('should handle floating-point edge case via fallback (Math.random = 1)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999999);
    const result = weightedRandom(entries);
    expect(entries).toContain(result);
    vi.restoreAllMocks();
  });

  test('should use common weight as fallback for an entry with unknown rarity', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const entry = makeEntry({ rarity: 'unknown' as Rarity });
    const result = weightedRandom([entry]);

    expect(result).toBe(entry);
    vi.restoreAllMocks();
  });
});

describe('weighted random excluding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should never return the excluded entry (when pool > 1)', () => {
    for (let i = 0; i < 50; i++) {
      const result = weightedRandomExcluding(entries, 1);
      expect(result.id).not.toBe(1);
    }
  });

  test('should return something even when excludeId is 0 (no real match)', () => {
    const result = weightedRandomExcluding(entries, 0);
    expect(entries).toContain(result);
  });

  test('should return the single entry when pool has only one item', () => {
    const single = [makeEntry({ id: 5, rarity: 'epic' })];
    expect(weightedRandomExcluding(single, 5)).toBe(single[0]);
  });

  test('should throw when entries array is empty', () => {
    expect(() => weightedRandomExcluding([], 1)).toThrow();
  });
});
