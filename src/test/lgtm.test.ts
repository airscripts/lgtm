import { describe, test, expect, vi, beforeEach } from 'vitest';

import {
  getEntryById,
  getAllEntries,
  RARITY_LABELS,
  getAllRarities,
  RARITY_WEIGHTS,
  CATEGORY_LABELS,
  getAllCategories,
  getEntriesByCategory,
} from '@/lib/lgtm';

describe('get all entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return a non-empty array', () => {
    const entries = getAllEntries();
    expect(entries.length).toBeGreaterThan(0);
  });

  test('should have a numeric id on every entry', () => {
    const entries = getAllEntries();

    for (const e of entries) {
      expect(typeof e.id).toBe('number');
      expect(e.id).toBeGreaterThan(0);
    }
  });

  test('should have contiguous ids starting at 1', () => {
    const entries = getAllEntries();
    const ids = entries.map((e) => e.id).sort((a, b) => a - b);
    ids.forEach((id, idx) => expect(id).toBe(idx + 1));
  });

  test('should have a valid rarity on every entry', () => {
    const valid = new Set(['common', 'rare', 'epic', 'legendary']);

    for (const e of getAllEntries()) {
      expect(valid.has(e.rarity)).toBe(true);
    }
  });
});

describe('get entry by id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return the correct entry', () => {
    const entry = getEntryById(1);
    expect(entry).toBeDefined();
    expect(entry!.id).toBe(1);
  });

  test('should return undefined for unknown id', () => {
    expect(getEntryById(9999)).toBeUndefined();
  });
});

describe('get entries by category', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return only entries of the given category', () => {
    const cats = getAllCategories();
    const cat = cats[0]!;
    const entries = getEntriesByCategory(cat);
    expect(entries.length).toBeGreaterThan(0);

    for (const e of entries) {
      expect(e.category).toBe(cat);
    }
  });

  test('should return empty array for unknown category', () => {
    expect(getEntriesByCategory('__nonexistent__')).toHaveLength(0);
  });
});

describe('get all categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return an array of strings', () => {
    const cats = getAllCategories();
    expect(Array.isArray(cats)).toBe(true);
    expect(cats.length).toBeGreaterThan(0);
    for (const c of cats) expect(typeof c).toBe('string');
  });

  test('should return unique values', () => {
    const cats = getAllCategories();
    expect(new Set(cats).size).toBe(cats.length);
  });
});

describe('get all rarities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return the four rarities', () => {
    expect(getAllRarities()).toEqual(['common', 'rare', 'epic', 'legendary']);
  });
});

describe('constants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should have positive rarity weights', () => {
    for (const w of Object.values(RARITY_WEIGHTS)) {
      expect(w).toBeGreaterThan(0);
    }
  });

  test('should have rarity labels covering all rarities', () => {
    expect(Object.keys(RARITY_LABELS)).toEqual(expect.arrayContaining(['common', 'rare', 'epic', 'legendary']));
  });

  test('should have a non-empty category labels object', () => {
    expect(Object.keys(CATEGORY_LABELS).length).toBeGreaterThan(0);
  });
});
