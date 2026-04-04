import { PAGE_SIZE } from '@/lib/config';
import { useState, useMemo } from 'react';
import Pagination from '@/components/pagination';
import type { LGTMEntry, Rarity } from '@/lib/lgtm';
import { RARITY_LABELS, CATEGORY_LABELS, getAllRarities } from '@/lib/lgtm';
import { CATEGORY_COLORS, RARITY_COLORS, RARITY_ORDER } from '@/lib/content';
import { Search, X } from 'lucide-react';

interface Props {
  entries: LGTMEntry[];
}

type SortOption = 'alpha' | 'rarity-asc' | 'rarity-desc' | 'newest';

const SORT_LABELS: Record<SortOption, string> = {
  alpha: 'A → Z',
  'rarity-asc': 'Rarity: Common First',
  'rarity-desc': 'Rarity: Legendary First',
  newest: 'Newest First',
};

function RarityDot({ rarity }: { rarity: Rarity }) {
  return (
    <span
      aria-hidden="true"
      style={{ background: RARITY_COLORS[rarity] }}
      className="inline-block w-2 h-2 rounded-full flex-shrink-0 mt-[1px]"
    />
  );
}

function EntryRow({ entry }: { entry: LGTMEntry }) {
  const color = CATEGORY_COLORS[entry.category] ?? 'var(--color-text-muted)';

  return (
    <a
      href={`/lgtm/${entry.id}`}
      className="grid gap-x-6 gap-y-1 items-start p-4 rounded-[10px] border no-underline transition-[border-color,box-shadow] duration-150"
      style={{
        gridTemplateColumns: '1fr auto',
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 2px 8px color-mix(in srgb, var(--color-accent) 10%, transparent)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-[0.2rem]">
          <RarityDot rarity={entry.rarity as Rarity} />

          <span
            style={{ color: 'var(--color-text)' }}
            className="font-semibold text-[0.9375rem] overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {entry.meaning}
          </span>
        </div>

        {entry.description && (
          <p
            style={{ color: 'var(--color-text-muted)' }}
            className="m-0 text-[0.8125rem] overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {entry.description}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          style={{ color: RARITY_COLORS[entry.rarity as Rarity] ?? 'var(--color-text-faint)' }}
          className="text-xs font-bold tracking-[0.04em] uppercase inline-flex items-center gap-[0.3em]"
        >
          {RARITY_LABELS[entry.rarity as Rarity]}
        </span>

        <span className="text-xs font-medium py-[0.15em] px-[0.45em]" style={{ color }}>
          {CATEGORY_LABELS[entry.category] ?? entry.category}
        </span>
      </div>
    </a>
  );
}

export default function BrowseFilters({ entries }: Props) {
  const allCategories = useMemo(
    () => [...new Set(entries.map((entry) => entry.category))].sort(),
    [entries],
  );

  const allRarities = getAllRarities();
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [activeRarities, setActiveRarities] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortOption>('alpha');
  const [page, setPage] = useState(1);

  function toggleCategory(category: string) {
    setActiveCategories((prev) => {
      const next = new Set(prev);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      return next;
    });

    setPage(1);
  }

  function toggleRarity(rarity: string) {
    setActiveRarities((prev) => {
      const next = new Set(prev);

      if (next.has(rarity)) {
        next.delete(rarity);
      } else {
        next.add(rarity);
      }

      return next;
    });

    setPage(1);
  }

  const filtered = useMemo(() => {
    let result = entries;

    if (search.trim()) {
      const searchQuery = search.toLowerCase();

      result = result.filter(
        (entry) =>
          entry.meaning.toLowerCase().includes(searchQuery) ||
          entry.description?.toLowerCase().includes(searchQuery) ||
          entry.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
      );
    }

    if (activeCategories.size > 0) {
      result = result.filter((entry) => activeCategories.has(entry.category));
    }

    if (activeRarities.size > 0) {
      result = result.filter((entry) => activeRarities.has(entry.rarity));
    }

    return [...result].sort((a, b) => {
      switch (sort) {
        case 'alpha':
          return a.meaning.localeCompare(b.meaning);

        case 'rarity-asc':
          return (RARITY_ORDER[a.rarity as Rarity] ?? 0) - (RARITY_ORDER[b.rarity as Rarity] ?? 0);

        case 'rarity-desc':
          return (RARITY_ORDER[b.rarity as Rarity] ?? 0) - (RARITY_ORDER[a.rarity as Rarity] ?? 0);

        case 'newest':
          return (b.created_at ?? '').localeCompare(a.created_at ?? '');

        default:
          return 0;
      }
    });
  }, [entries, search, activeCategories, activeRarities, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageStart = (clampedPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const hasFilters = search.trim() || activeCategories.size > 0 || activeRarities.size > 0;

  function clearAll() {
    setSearch('');
    setActiveCategories(new Set());
    setActiveRarities(new Set());
    setPage(1);
  }

  function handlePageChange(pageNumber: number) {
    setPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none"
          style={{ color: 'var(--color-text-faint)' }}
        >
          <Search size={18} aria-hidden="true" />
        </span>

        <input
          type="search"
          value={search}
          placeholder="Search meanings, descriptions, tags…"
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
          className="w-full py-3 pl-10 pr-4 text-[0.9375rem] rounded-[10px] border outline-none transition-[border-color] duration-150 box-border"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            color: 'var(--color-text)',
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span
            style={{ color: 'var(--color-text-faint)' }}
            className="text-xs font-semibold tracking-[0.06em] uppercase mr-1"
          >
            Category
          </span>

          {allCategories.map((category) => {
            const active = activeCategories.has(category);
            const color = CATEGORY_COLORS[category] ?? 'var(--color-text-muted)';

            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className="text-[0.8125rem] font-medium py-[0.3em] px-[0.75em] rounded-[20px] cursor-pointer transition-all duration-150"
                style={{
                  color: active ? color : 'var(--color-text-muted)',
                  border: `1.5px solid ${active ? color : 'var(--color-border)'}`,
                  background: active
                    ? `color-mix(in srgb, ${color} 12%, var(--color-surface))`
                    : 'var(--color-surface)',
                }}
              >
                {CATEGORY_LABELS[category] ?? category}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span
            style={{ color: 'var(--color-text-faint)' }}
            className="text-xs font-semibold tracking-[0.06em] uppercase mr-1"
          >
            Rarity
          </span>

          {allRarities.map((rarity) => {
            const active = activeRarities.has(rarity);
            const color = RARITY_COLORS[rarity];

            return (
              <button
                key={rarity}
                onClick={() => toggleRarity(rarity)}
                className="text-[0.8125rem] font-semibold py-[0.3em] px-[0.75em] rounded-[20px] cursor-pointer transition-all duration-150 tracking-[0.03em] uppercase inline-flex items-center gap-[0.3em]"
                style={{
                  color: active ? color : 'var(--color-text-muted)',
                  border: `1.5px solid ${active ? color : 'var(--color-border)'}`,
                  background: active
                    ? `color-mix(in srgb, ${color} 12%, var(--color-surface))`
                    : 'var(--color-surface)',
                }}
              >
                {RARITY_LABELS[rarity]}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{ borderColor: 'var(--color-border)' }}
        className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b"
      >
        <p className="m-0 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <strong style={{ color: 'var(--color-text)' }}>{filtered.length}</strong> of{' '}
          {entries.length} entries
          {filtered.length > PAGE_SIZE && (
            <span className="ml-2" style={{ color: 'var(--color-text-faint)' }}>
              page {clampedPage} of {totalPages}
            </span>
          )}
          {hasFilters && (
            <button
              onClick={clearAll}
              style={{ color: 'var(--color-accent)', background: 'none' }}
              className="ml-3 text-[0.8125rem] bg-none border-none cursor-pointer p-0 underline"
            >
              Clear filters
            </button>
          )}
        </p>

        <div className="flex items-center gap-2">
          <label
            htmlFor="sort-select"
            className="text-[0.8125rem]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Sort:
          </label>

          <select
            id="sort-select"
            value={sort}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            className="text-sm py-[0.3rem] px-[0.6rem] rounded-md border cursor-pointer outline-none transition-colors duration-150"
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            style={{
              color: 'var(--color-text)',
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option
                key={key}
                value={key}
                style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
              >
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex justify-center mb-4">
            <X size={64} className="text-center" />
          </div>

          <p className="m-0 text-[0.9rem]">No entries match your filters.</p>
          <button
            onClick={clearAll}
            className="mt-2 text-[0.9rem] bg-none border-none cursor-pointer underline"
            style={{ color: 'var(--color-accent)', background: 'none' }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {paginated.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>

          <Pagination page={clampedPage} totalPages={totalPages} onPage={handlePageChange} />
        </>
      )}
    </div>
  );
}
