import type { LGTMEntry } from '@/lib/lgtm';
import { makeEntry } from '@/test/fixtures';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { RandomGenerator } from '@/components/random-generator';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

beforeEach(() => {
  vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
  vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
});

const entries: LGTMEntry[] = [
  makeEntry({
    id: 1,
    tags: ['tag1'],
    rarity: 'common',
    meaning: 'Meaning 1',
    description: 'Description for 1',
  }),

  makeEntry({
    id: 2,
    tags: ['tag2'],
    rarity: 'rare',
    meaning: 'Meaning 2',
    description: 'Description for 2',
  }),

  makeEntry({
    id: 3,
    tags: ['tag3'],
    rarity: 'epic',
    meaning: 'Meaning 3',
    description: 'Description for 3',
  }),

  makeEntry({
    id: 4,
    tags: ['tag4'],
    rarity: 'legendary',
    meaning: 'Meaning 4',
    description: 'Description for 4',
  }),
];

describe('random generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render with an initialentry', () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    expect(screen.getByText('Meaning 1')).toBeInTheDocument();
  });

  test('should show the description when present', () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    expect(screen.getByText('Description for 1')).toBeInTheDocument();
  });

  test('should render a generate another button', () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    expect(screen.getByText(/Generate another/i)).toBeInTheDocument();
  });

  test('should render a copy link button', () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    expect(screen.getByText(/Copy link/i)).toBeInTheDocument();
  });

  test('should render a view detail link', () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    expect(screen.getByText(/View detail/i)).toBeInTheDocument();
  });

  test('should have view detail link pointing to the current entry', () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[1]} />);
    const link = screen.getByRole('link', { name: /View detail/i });
    expect(link.getAttribute('href')).toBe('/lgtm/2');
  });

  test('should render tags', () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    expect(screen.getByText('#tag1')).toBeInTheDocument();
  });

  test('should call history.replaceState on mount (no initialEntry)', async () => {
    render(<RandomGenerator entries={entries} />);
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalled();
    });
  });

  test('should trigger a new entry on clicking generate another', async () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    const btn = screen.getByText(/Generate another/i);
    fireEvent.click(btn);

    await waitFor(
      () => {
        expect(window.history.pushState).toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });
});
