import type { LGTMEntry } from '@/lib/lgtm';

export function makeEntry(overrides: Partial<LGTMEntry> = {}): LGTMEntry {
  return {
    id: 1,
    category: 'nerd',
    rarity: 'common',
    created_at: '2024-01-01',
    meaning: 'Looks Good To Me',
    tags: ['classic', 'code-review'],
    description: 'The original, the classic.',
    ...overrides,
  };
}
