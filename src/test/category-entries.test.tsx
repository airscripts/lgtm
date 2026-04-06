import { PAGE_SIZE } from '@/lib/config';
import { makeEntry } from '@/test/fixtures';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CategoryEntries } from '@/components/category-entries';

describe('category entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('scrollTo', vi.fn());
  });

  test('should render all entry links when count is below page size', () => {
    const entries = [makeEntry({ id: 1 }), makeEntry({ id: 2 }), makeEntry({ id: 3 })];
    render(<CategoryEntries entries={entries} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  test('should render entry id as #id', () => {
    render(<CategoryEntries entries={[makeEntry({ id: 7 })]} />);
    expect(screen.getByText('#7')).toBeInTheDocument();
  });

  test('should render entry meaning', () => {
    render(<CategoryEntries entries={[makeEntry({ meaning: 'Ship it!' })]} />);
    expect(screen.getByText('Ship it!')).toBeInTheDocument();
  });

  test('should render description when present', () => {
    render(<CategoryEntries entries={[makeEntry({ description: 'A good one.' })]} />);
    expect(screen.getByText('A good one.')).toBeInTheDocument();
  });

  test('should not render description when absent', () => {
    render(<CategoryEntries entries={[makeEntry({ description: undefined })]} />);
    expect(screen.queryByText('The original, the classic.')).not.toBeInTheDocument();
  });

  test('should set href to /lgtm/:id', () => {
    render(<CategoryEntries entries={[makeEntry({ id: 42 })]} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/lgtm/42');
  });

  test('should not render pagination when entries fit on one page', () => {
    const entries = Array.from({ length: PAGE_SIZE }, (_, i) => makeEntry({ id: i + 1 }));
    render(<CategoryEntries entries={entries} />);
    expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
  });

  test('should render pagination when entries exceed PAGE_SIZE', () => {
    const entries = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeEntry({ id: i + 1 }));
    render(<CategoryEntries entries={entries} />);
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });
});
