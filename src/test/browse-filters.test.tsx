import { PAGE_SIZE } from '@/lib/config';
import { makeEntry } from '@/test/fixtures';
import { BrowseFilters } from '@/components/browse-filters';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const entries = [
  makeEntry({ id: 1, rarity: 'common', category: 'nerd', meaning: 'Alpha', description: 'First entry', tags: ['a'] }),
  makeEntry({ id: 2, rarity: 'rare', category: 'funny', meaning: 'Beta', description: 'Second entry', tags: ['b'] }),
  makeEntry({ id: 3, rarity: 'epic', category: 'nerd', meaning: 'Gamma', description: 'Third entry', tags: ['c'] }),

  makeEntry({
    id: 4,
    rarity: 'legendary',
    category: 'funny',
    meaning: 'Delta',
    description: 'desc delta',
    tags: ['d'],
  }),
];

describe('browse filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  test('should render all entries by default', () => {
    render(<BrowseFilters entries={entries} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
  });

  test('should show total entry count', () => {
    render(<BrowseFilters entries={entries} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/of 4 entries/)).toBeInTheDocument();
  });

  test('should filter entries by meaning via search', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Alpha' } });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  test('should filter entries by description via search', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Second' } });
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  test('should filter entries by tag via search', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'c' } });
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  test('should show no results message when search matches nothing', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'xyznotfound' } });
    expect(screen.getByText(/No entries match your filters/)).toBeInTheDocument();
  });

  test('should clear all filters when "Clear all filters" is clicked in no-results state', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'xyznotfound' } });
    fireEvent.click(screen.getByText('Clear all filters'));

    expect(screen.queryByText(/No entries match your filters/)).not.toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  test('should filter entries by category when a category button is clicked', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.click(screen.getByRole('button', { name: /nerd/i }));

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByText('Delta')).not.toBeInTheDocument();
  });

  test('should deselect category filter when clicked again', () => {
    render(<BrowseFilters entries={entries} />);
    const nerdBtn = screen.getByRole('button', { name: /nerd/i });

    fireEvent.click(nerdBtn);
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();

    fireEvent.click(nerdBtn);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  test('should filter entries by rarity when a rarity button is clicked', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.click(screen.getByRole('button', { name: /common/i }));

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  test('should combine category and rarity filters', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.click(screen.getByRole('button', { name: /nerd/i }));
    fireEvent.click(screen.getByRole('button', { name: /common/i }));

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  test('should show clear filters button when a filter is active', () => {
    render(<BrowseFilters entries={entries} />);
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /nerd/i }));
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  test('should clear all active filters when "Clear filters" button is clicked', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.click(screen.getByRole('button', { name: /nerd/i }));
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  test('should sort entries alphabetically by default (a → z)', () => {
    render(<BrowseFilters entries={[...entries].reverse()} />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href')).filter(Boolean);

    expect(hrefs.indexOf('/lgtm/1')).toBeLessThan(hrefs.indexOf('/lgtm/2'));
    expect(hrefs.indexOf('/lgtm/2')).toBeLessThan(hrefs.indexOf('/lgtm/4'));
    expect(hrefs.indexOf('/lgtm/4')).toBeLessThan(hrefs.indexOf('/lgtm/3'));
  });

  test('should sort by rarity ascending (common first) when selected', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'rarity-asc' } });

    const links = screen.getAllByRole('link');
    const textContents = links.map((l) => l.textContent ?? '');
    const commonIdx = textContents.findIndex((t) => t.includes('Alpha'));
    const legendaryIdx = textContents.findIndex((t) => t.includes('Delta'));
    expect(commonIdx).toBeLessThan(legendaryIdx);
  });

  test('should sort by rarity descending (legendary first) when selected', () => {
    render(<BrowseFilters entries={entries} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'rarity-desc' } });

    const links = screen.getAllByRole('link');
    const textContents = links.map((l) => l.textContent ?? '');
    const legendaryIdx = textContents.findIndex((t) => t.includes('Delta'));
    const commonIdx = textContents.findIndex((t) => t.includes('Alpha'));
    expect(legendaryIdx).toBeLessThan(commonIdx);
  });

  test('should sort by newest first when selected', () => {
    const newestEntries = [
      makeEntry({ id: 1, meaning: 'Oldest', created_at: '2023-01-01' }),
      makeEntry({ id: 2, meaning: 'Newest', created_at: '2025-06-01' }),
      makeEntry({ id: 3, meaning: 'Middle', created_at: '2024-03-01' }),
    ];

    render(<BrowseFilters entries={newestEntries} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'newest' } });

    const links = screen.getAllByRole('link');
    const textContents = links.map((l) => l.textContent ?? '');
    const newestIdx = textContents.findIndex((t) => t.includes('Newest'));
    const oldestIdx = textContents.findIndex((t) => t.includes('Oldest'));
    expect(newestIdx).toBeLessThan(oldestIdx);
  });

  test('should show pagination when filtered entries exceed PAGE_SIZE', () => {
    const manyEntries = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
      makeEntry({ id: i + 1, meaning: `Entry ${i + 1}` }),
    );

    render(<BrowseFilters entries={manyEntries} />);
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
  });

  test('should not show pagination when filtered entries fit on one page', () => {
    render(<BrowseFilters entries={entries} />);
    expect(screen.queryByLabelText('Page 2')).not.toBeInTheDocument();
  });

  test('should reset to page 1 when search changes', () => {
    const manyEntries = Array.from({ length: PAGE_SIZE + 5 }, (_, i) =>
      makeEntry({ id: i + 1, meaning: `ZEntry ${i + 1}` }),
    );

    render(<BrowseFilters entries={manyEntries} />);
    fireEvent.click(screen.getByLabelText('Page 2'));
    expect(screen.getByLabelText('Page 2')).toHaveAttribute('aria-current', 'page');

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ZEntry 1' } });
    expect(screen.queryByLabelText('Page 2')).not.toBeInTheDocument();
  });

  test('should reset to page 1 when category filter changes', () => {
    const manyEntries = [
      ...Array.from({ length: PAGE_SIZE }, (_, i) =>
        makeEntry({ id: i + 1, meaning: `ZEntry ${i + 1}`, category: 'nerd' }),
      ),

      ...Array.from({ length: 5 }, (_, i) =>
        makeEntry({ id: PAGE_SIZE + i + 1, meaning: `Funny ${i + 1}`, category: 'funny' }),
      ),
    ];

    render(<BrowseFilters entries={manyEntries} />);
    fireEvent.click(screen.getByLabelText('Page 2'));
    expect(screen.getByLabelText('Page 2')).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: /nerd/i }));
    expect(screen.queryByLabelText('Page 2')).not.toBeInTheDocument();
  });

  test('should call window.scrollTo when page changes', () => {
    const manyEntries = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
      makeEntry({ id: i + 1, meaning: `Entry ${i + 1}` }),
    );

    render(<BrowseFilters entries={manyEntries} />);
    fireEvent.click(screen.getByLabelText('Page 2'));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
