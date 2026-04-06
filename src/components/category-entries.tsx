import { PAGE_SIZE } from '@/lib/config';
import { useState, useEffect } from 'react';
import type { LGTMEntry } from '@/lib/lgtm';
import { Pagination } from '@/components/pagination';
import { SETTINGS_KEY, loadSettings } from '@/lib/settings';

export type CategoryEntriesProps = {
  entries: LGTMEntry[];
};

export function CategoryEntries({ entries }: CategoryEntriesProps) {
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageSize(loadSettings().pageSize);

    function onStorage(e: StorageEvent) {
      if (e.key !== SETTINGS_KEY) return;
      setPageSize(loadSettings().pageSize);
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const totalPages = Math.ceil(entries.length / pageSize);
  const start = (page - 1) * pageSize;
  const slice = entries.slice(start, start + pageSize);

  function handlePageChange(pageNumber: number) {
    setPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <div>
        {slice.map((entry) => (
          <a
            key={entry.id}
            href={`/lgtm/${entry.id}`}
            style={{ color: 'inherit', borderColor: 'var(--color-border)' }}
            className="flex items-start gap-4 py-4 border-b no-underline transition-colors duration-150"
          >
            <span
              className="flex-shrink-0 text-xs pt-[0.2rem] min-w-[2.5rem]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}
            >
              #{entry.id}
            </span>

            <div>
              <div style={{ color: 'var(--color-text)' }} className="font-semibold text-[0.9375rem] leading-[1.4]">
                {entry.meaning}
              </div>

              {entry.description && (
                <div
                  style={{ color: 'var(--color-text-muted)' }}
                  className="text-[0.8125rem] leading-[1.5] mt-[0.2rem]"
                >
                  {entry.description}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      <Pagination page={page} onPage={handlePageChange} totalPages={totalPages} />
    </div>
  );
}
