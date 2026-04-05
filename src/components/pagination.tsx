'use client';
import type { MouseEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPage: (pageNumber: number) => void;
};

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages: (number | '…')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const baseClasses =
    'inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-md border text-sm font-medium cursor-pointer transition-[background,color,border-color] duration-150';

  function hoverOn(e: MouseEvent<HTMLButtonElement>) {
    (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-raised)';
    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)';
  }

  function hoverOff(e: MouseEvent<HTMLButtonElement>) {
    (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface)';
    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
  }

  const sharedButtonStyle = {
    color: 'var(--color-text-muted)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  };

  const activeStyle = {
    color: '#fff',
    fontWeight: 700,
    cursor: 'default',
    background: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
  };

  const disabledStyle = {
    ...sharedButtonStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  function renderPage(pageNumber: number | '…', i: number) {
    if (pageNumber === '…') {
      return (
        <span
          key={`ellipsis-${i}`}
          className={baseClasses}
          style={{
            border: 'none',
            cursor: 'default',
            background: 'none',
            color: 'var(--color-text-muted)',
          }}
        >
          …
        </span>
      );
    }

    return (
      <button
        key={pageNumber}
        className={baseClasses}
        aria-label={`Page ${pageNumber}`}
        aria-current={pageNumber === page ? 'page' : undefined}
        onMouseEnter={(e) => pageNumber !== page && hoverOn(e)}
        onMouseLeave={(e) => pageNumber !== page && hoverOff(e)}
        style={pageNumber === page ? activeStyle : sharedButtonStyle}
        onClick={() => pageNumber !== page && onPage(pageNumber as number)}
      >
        {pageNumber}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-[0.375rem] flex-wrap pt-6">
      <button
        disabled={page === 1}
        className={baseClasses}
        aria-label="Previous page"
        onClick={() => page > 1 && onPage(page - 1)}
        onMouseEnter={(e) => page > 1 && hoverOn(e)}
        onMouseLeave={(e) => page > 1 && hoverOff(e)}
        style={page === 1 ? disabledStyle : sharedButtonStyle}
      >
        <ArrowLeft size={16} />
      </button>

      {pages.map(renderPage)}

      <button
        aria-label="Next page"
        className={baseClasses}
        disabled={page === totalPages}
        onClick={() => page < totalPages && onPage(page + 1)}
        onMouseEnter={(e) => page < totalPages && hoverOn(e)}
        onMouseLeave={(e) => page < totalPages && hoverOff(e)}
        style={page === totalPages ? disabledStyle : sharedButtonStyle}
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
