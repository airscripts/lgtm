import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/config';
import { Monitor, Sun, Moon } from 'lucide-react';

type Theme = 'system' | 'light' | 'dark';

function isValidTheme(value: string | null, validValues: Theme[]): value is Theme {
  return value !== null && validValues.includes(value as Theme);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

const THEMES: { value: Theme; icon: () => ReactElement; label: string }[] = [
  { value: 'system', icon: () => <Monitor size={18} aria-hidden="true" />, label: 'System theme' },
  { value: 'light', icon: () => <Sun size={18} aria-hidden="true" />, label: 'Light theme' },
  { value: 'dark', icon: () => <Moon size={18} aria-hidden="true" />, label: 'Dark theme' },
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? null;
    const validValues = THEMES.map((themeOption) => themeOption.value);

    if (isValidTheme(stored, validValues)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme('system');
    }

    function onStorage(e: StorageEvent) {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = (e.newValue as Theme | null) ?? 'system';
      setTheme(isValidTheme(next, validValues) ? next : 'system');
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function cycle() {
    const idx = THEMES.findIndex((themeOption) => themeOption.value === theme);
    const next = THEMES[(idx + 1) % THEMES.length].value;

    setTheme(next);
    applyTheme(next);

    try {
      if (next === 'system') {
        localStorage.removeItem(THEME_STORAGE_KEY);
        window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: null }));
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: next }));
      }
    } catch {
      // Safeguard against localStorage access issues.
    }
  }

  const current = THEMES.find((themeOption) => themeOption.value === theme)!;
  const Icon = current.icon;

  return (
    <button
      type="button"
      onClick={cycle}
      title={current.label}
      aria-label={current.label}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border flex-shrink-0 cursor-pointer transition-[background,color] duration-150 hover:[background:var(--color-surface-raised)] hover:[color:var(--color-text)]"
      style={{
        background: 'transparent',
        color: 'var(--color-text-muted)',
        border: '1px solid var(--color-border)',
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
