import { act } from 'react';
import type { LGTMEntry } from '@/lib/lgtm';
import { makeEntry } from '@/test/fixtures';
import { COPY_FEEDBACK_MS } from '@/lib/config';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { RandomGenerator } from '@/components/random-generator';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

beforeEach(() => {
  vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
  vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
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

  test('should not show description when entry has no description', () => {
    render(<RandomGenerator entries={entries} initialEntry={makeEntry({ description: undefined })} />);
    expect(screen.queryByText('The original, the classic.')).not.toBeInTheDocument();
  });

  test('should not show tags when entry has no tags', () => {
    render(<RandomGenerator entries={entries} initialEntry={makeEntry({ tags: undefined })} />);
    expect(screen.queryByText(/#\w/)).not.toBeInTheDocument();
  });

  test('should call navigator.clipboard.writeText with the share url on copy click', async () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[1]} />);
    fireEvent.click(screen.getByText(/Copy link/i));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('/lgtm/2'));
    });
  });

  test('should show "Copied!" after clicking copy link', async () => {
    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    fireEvent.click(screen.getByText(/Copy link/i));

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  test('should revert copy button to "Copy link" after COPY_FEEDBACK_MS', async () => {
    vi.useFakeTimers();

    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Copy link/i));
      await Promise.resolve();
    });

    expect(screen.getByText('Copied!')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(COPY_FEEDBACK_MS + 50);
    });

    expect(screen.getByText('Copy link')).toBeInTheDocument();
    vi.useRealTimers();
  });

  test('should disable the generate button while animating', async () => {
    vi.useFakeTimers();

    render(<RandomGenerator entries={entries} initialEntry={entries[0]} />);
    const btn = screen.getByRole('button', { name: /Generate another/i });

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(btn).toBeDisabled();

    await act(async () => {
      vi.runAllTimers();
    });

    expect(btn).not.toBeDisabled();
    vi.useRealTimers();
  });
});
