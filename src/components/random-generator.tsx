'use client';
import type { CSSProperties } from 'react';
import { COPY_FEEDBACK_MS } from '@/lib/config';
import type { LGTMEntry, Rarity } from '@/lib/lgtm';
import { weightedRandomExcluding } from '@/lib/random';
import { RARITY_LABELS, CATEGORY_LABELS } from '@/lib/lgtm';
import { RARITY_COLORS, CATEGORY_COLORS } from '@/lib/content';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Shuffle, Link, Check, ExternalLink } from 'lucide-react';

export type RandomGeneratorProps = {
  entries: LGTMEntry[];
  initialEntry?: LGTMEntry;
};

function buildShareUrl(id: number): string {
  return typeof window !== 'undefined' ? `${window.location.origin}/lgtm/${id}` : `/lgtm/${id}`;
}

function rarityBarBackground(rarity: string, color: string): string {
  return rarity === 'legendary' ? `linear-gradient(90deg, ${color}, #f59e0b, ${color})` : color;
}

function hasTags(entry: LGTMEntry): boolean {
  return (entry.tags?.length ?? 0) > 0;
}

function cardStyle(isAnimating: boolean, rarityColor: string): CSSProperties {
  return {
    opacity: isAnimating ? 0 : 1,
    background: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    transform: isAnimating ? 'translateY(8px)' : 'translateY(0)',
    boxShadow: `0 8px 32px color-mix(in srgb, ${rarityColor} 10%, transparent)`,
  };
}

function RarityBadgeInline({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className={`badge-${rarity} inline-flex items-center gap-[0.3em] text-xs font-bold tracking-[0.04em] uppercase rounded-md py-[0.3em] px-[0.65em]`}
    >
      {RARITY_LABELS[rarity]}
    </span>
  );
}

function CategoryBadgeInline({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? 'var(--color-text-muted)';
  return (
    <a
      href={`/categories/${category}`}
      className="inline-flex items-center text-[0.8125rem] font-medium rounded-md py-[0.3em] px-[0.7em] no-underline transition-opacity duration-150 hover:opacity-80"
      style={{
        color,
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
        background: `color-mix(in srgb, ${color} 10%, var(--color-surface))`,
      }}
    >
      {CATEGORY_LABELS[category] ?? category}
    </a>
  );
}

export function RandomGenerator({ entries, initialEntry }: RandomGeneratorProps) {
  const [current, setCurrent] = useState<LGTMEntry>(() => {
    return initialEntry ?? entries[0]!;
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialEntry) {
      const picked = weightedRandomExcluding(entries, 0);
      setCurrent(picked);
      history.replaceState(null, '', `/lgtm/${picked.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      const next = weightedRandomExcluding(entries, current.id);
      setCurrent(next);

      history.pushState(null, '', `/lgtm/${next.id}`);
      setIsAnimating(false);
    }, 180);
  }, [current.id, entries, isAnimating]);

  const shareUrl = buildShareUrl(current.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;

      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  const rarityColor = RARITY_COLORS[current.rarity as Rarity] ?? 'var(--color-common)';

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        ref={cardRef}
        style={cardStyle(isAnimating, rarityColor)}
        className="w-full max-w-[680px] rounded-[20px] border p-10 relative overflow-hidden transition-[opacity,transform] duration-[180ms] ease-[ease]"
      >
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-[20px]"
          style={{ background: rarityBarBackground(current.rarity, rarityColor) }}
        />

        <div className="flex gap-2 flex-wrap mb-5">
          <RarityBadgeInline rarity={current.rarity as Rarity} />

          <CategoryBadgeInline category={current.category} />
        </div>

        <p
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}
          className="text-[0.8125rem] font-semibold tracking-[0.12em] uppercase m-0 mb-[0.375rem]"
        >
          LGTM
        </p>

        <h1
          style={{ color: 'var(--color-text)' }}
          className="text-[clamp(1.625rem,5vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.02em] m-0 mb-3"
        >
          {current.meaning}
        </h1>

        {current.description && (
          <p style={{ color: 'var(--color-text-muted)' }} className="text-base m-0 leading-[1.6]">
            {current.description}
          </p>
        )}

        {hasTags(current) && (
          <div
            className="flex flex-wrap gap-[0.375rem] mt-5 pt-4 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {current.tags!.map((tag) => (
              <span
                key={tag}
                className="text-xs py-[0.15em] px-[0.45em] rounded"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-faint)',
                  background: 'var(--color-surface-raised)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <button onClick={generate} disabled={isAnimating} className="btn btn-primary text-base py-[0.7rem] px-7 gap-2">
          <Shuffle size={16} aria-hidden="true" />
          Generate another
        </button>

        <button onClick={handleCopy} className="btn btn-ghost text-[0.9375rem]">
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Link size={14} aria-hidden="true" />
              Copy link
            </>
          )}
        </button>

        <a href={`/lgtm/${current.id}`} className="btn btn-ghost text-[0.9375rem]">
          <ExternalLink size={14} aria-hidden="true" />
          View detail
        </a>
      </div>

      <p
        className="text-[0.8125rem] m-0 text-center"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-faint)' }}
      >
        {shareUrl}
      </p>
    </div>
  );
}
