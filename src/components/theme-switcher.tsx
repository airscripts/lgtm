import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/config';

type Theme = 'system' | 'light' | 'dark';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function IconSystem() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const THEMES: { value: Theme; icon: () => ReactElement; label: string }[] = [
  { value: 'system', icon: IconSystem, label: 'System theme' },
  { value: 'light',  icon: IconSun,    label: 'Light theme' },
  { value: 'dark',   icon: IconMoon,   label: 'Dark theme' },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const valid = THEMES.map((t) => t.value);
    if (stored && valid.includes(stored)) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function cycle() {
    const idx = THEMES.findIndex((t) => t.value === theme);
    const next = THEMES[(idx + 1) % THEMES.length].value;
    setTheme(next);
    applyTheme(next);
    if (next === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }
  }

  const current = THEMES.find((t) => t.value === theme)!;
  const Icon = current.icon;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={current.label}
      title={current.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        background: 'transparent',
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-raised)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
      }}
    >
      <Icon />
    </button>
  );
}
