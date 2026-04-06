import { THEME_STORAGE_KEY } from '@/lib/config';
import type { CSSProperties, ReactElement } from 'react';
import type { Settings, PageSize } from '@/lib/settings';
import { useState, useCallback, useEffect } from 'react';
import { Monitor, Sun, Moon, RotateCcw } from 'lucide-react';
import { loadSettings, saveSettings, resetSettings, DEFAULT_SETTINGS } from '@/lib/settings';

type Theme = 'system' | 'light' | 'dark';

const THEMES: { value: Theme; icon: () => ReactElement; label: string }[] = [
  { value: 'system', icon: () => <Monitor size={16} aria-hidden="true" />, label: 'System' },
  { value: 'light', icon: () => <Sun size={16} aria-hidden="true" />, label: 'Light' },
  { value: 'dark', icon: () => <Moon size={16} aria-hidden="true" />, label: 'Dark' },
];

const PAGE_SIZES: PageSize[] = [10, 25, 50];

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Safeguard against localStorage access issues.
  }

  return 'system';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function saveTheme(theme: Theme) {
  try {
    if (theme === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: null }));
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: theme }));
    }
  } catch {
    // Safeguard against localStorage access issues.
  }
}

function applyAnimations(enabled: boolean) {
  const root = document.documentElement;

  if (enabled) {
    root.removeAttribute('data-no-animations');
  } else {
    root.setAttribute('data-no-animations', '');
  }
}

function sectionStyle(): CSSProperties {
  return {
    borderRadius: 12,
    padding: '1.5rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  };
}

function sectionHeadingStyle(): CSSProperties {
  return {
    fontWeight: 700,
    fontSize: '0.6875rem',
    letterSpacing: '0.1em',
    marginBottom: '1.25rem',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text-faint)',
  };
}

function rowStyle(last: boolean): CSSProperties {
  return {
    paddingTop: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.875rem 1.5rem',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: last ? 0 : '1.25rem',
    paddingBottom: last ? 0 : '1.25rem',
    borderBottom: last ? 'none' : '1px solid var(--color-border)',
  };
}

function rowLabelStyle(): CSSProperties {
  return {
    fontWeight: 500,
    fontSize: '0.9375rem',
    color: 'var(--color-text)',
  };
}

function rowDescStyle(): CSSProperties {
  return {
    marginTop: '0.2rem',
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
  };
}

function toggleTrackStyle(enabled: boolean): CSSProperties {
  return {
    width: 48,
    height: 28,
    flexShrink: 0,
    padding: '3px',
    border: 'none',
    display: 'flex',
    borderRadius: 14,
    cursor: 'pointer',
    position: 'relative',
    alignItems: 'center',
    transition: 'background 0.2s ease',
    background: enabled ? 'var(--color-accent)' : 'var(--color-border)',
  };
}

function toggleThumbStyle(enabled: boolean): CSSProperties {
  return {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    transform: enabled ? 'translateX(20px)' : 'translateX(0)',
    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
  };
}

function segmentedStyle(active: boolean): CSSProperties {
  return {
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: '0.3rem 0.75rem',
    fontWeight: active ? 600 : 500,
    transition: 'background 0.15s ease, color 0.15s ease',
    color: active ? '#ffffff' : 'var(--color-text-muted)',
    background: active ? 'var(--color-accent)' : 'transparent',
  };
}

function segmentedContainerStyle(): CSSProperties {
  return {
    gap: 2,
    padding: 3,
    flexShrink: 0,
    display: 'flex',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-raised)',
  };
}

type SettingToggleProps = {
  label: string;
  enabled: boolean;
  onToggle: () => void;
};

function SettingToggle({ enabled, label, onToggle }: SettingToggleProps) {
  return (
    <button
      role="switch"
      type="button"
      aria-label={label}
      onClick={onToggle}
      aria-checked={enabled}
      style={toggleTrackStyle(enabled)}
    >
      <span style={toggleThumbStyle(enabled)} />
    </button>
  );
}

type SettingRowProps = {
  label: string;
  last?: boolean;
  description: string;
  children: ReactElement;
};

function SettingRow({ label, description, last = false, children }: SettingRowProps) {
  return (
    <div style={rowStyle(last)}>
      <div style={{ minWidth: 0 }}>
        <div style={rowLabelStyle()}>{label}</div>
        <div style={rowDescStyle()}>{description}</div>
      </div>

      {children}
    </div>
  );
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const [theme, setTheme] = useState<Theme>('system');
  const [resetPending, setResetPending] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
    setTheme(loadTheme());
    setIsReady(true);

    function onStorage(e: StorageEvent) {
      if (e.key === THEME_STORAGE_KEY) {
        const next = e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : 'system';
        setTheme(next);
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  function cycleTheme(value: Theme) {
    setTheme(value);
    applyTheme(value);
    saveTheme(value);
  }

  useEffect(() => {
    applyAnimations(settings.animations);
  }, [settings.animations]);

  function handleReset() {
    if (!resetPending) {
      setResetPending(true);
      return;
    }

    resetSettings();
    setSettings({ ...DEFAULT_SETTINGS });
    setResetPending(false);

    const defaultTheme = loadTheme();
    setTheme(defaultTheme);
    applyTheme(defaultTheme);
    applyAnimations(DEFAULT_SETTINGS.animations);
  }

  function cancelReset() {
    setResetPending(false);
  }

  return (
    <div className="flex flex-col gap-6" style={{ visibility: isReady ? 'visible' : 'hidden' }}>
      <section style={sectionStyle()} aria-labelledby="section-appearance">
        <h2 id="section-appearance" style={sectionHeadingStyle()}>
          Appearance
        </h2>

        <SettingRow label="Theme" description="Choose your preferred color scheme." last={false}>
          <div style={segmentedContainerStyle()} role="group" aria-label="Theme selection">
            {THEMES.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={theme === value}
                onClick={() => cycleTheme(value)}
                style={segmentedStyle(theme === value)}
              >
                <span className="flex items-center gap-1.5">
                  <Icon />
                  {label}
                </span>
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow last label="Animations" description="Enable entrance and transition animations across the site.">
          <SettingToggle
            label="Toggle animations"
            enabled={settings.animations}
            onToggle={() => update('animations', !settings.animations)}
          />
        </SettingRow>
      </section>

      <section style={sectionStyle()} aria-labelledby="section-experience">
        <h2 id="section-experience" style={sectionHeadingStyle()}>
          Experience
        </h2>

        <SettingRow label="Mascot" description="Show Pierre the robot in the corner of every page.">
          <SettingToggle
            label="Toggle mascot"
            enabled={settings.mascot}
            onToggle={() => update('mascot', !settings.mascot)}
          />
        </SettingRow>

        <SettingRow label="Confetti" description="Fire a confetti burst when you land on a legendary entry.">
          <SettingToggle
            label="Toggle confetti"
            enabled={settings.confetti}
            onToggle={() => update('confetti', !settings.confetti)}
          />
        </SettingRow>

        <SettingRow last label="Easter Egg" description="Print the ASCII art greeting to the browser console.">
          <SettingToggle
            label="Toggle easter egg"
            enabled={settings.easterEgg}
            onToggle={() => update('easterEgg', !settings.easterEgg)}
          />
        </SettingRow>
      </section>

      <section style={sectionStyle()} aria-labelledby="section-browsing">
        <h2 id="section-browsing" style={sectionHeadingStyle()}>
          Browsing
        </h2>

        <SettingRow
          last
          label="Default Page Size"
          description="Number of entries shown per page on Browse and category pages."
        >
          <div style={segmentedContainerStyle()} role="group" aria-label="Page size selection">
            {PAGE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => update('pageSize', size)}
                aria-pressed={settings.pageSize === size}
                style={segmentedStyle(settings.pageSize === size)}
              >
                {size}
              </button>
            ))}
          </div>
        </SettingRow>
      </section>

      <section
        aria-labelledby="section-danger"
        style={{
          ...sectionStyle(),
          background: 'var(--color-legendary-section-bg)',
          border: '1px solid var(--color-legendary-border)',
        }}
      >
        <h2 id="section-danger" style={{ ...sectionHeadingStyle(), color: 'var(--color-legendary)' }}>
          Danger zone
        </h2>

        <div style={rowStyle(true)}>
          <div>
            <div style={rowLabelStyle()}>Reset All Settings</div>
            <div style={rowDescStyle()}>Restore every preference to its default value.</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {resetPending && (
              <button type="button" onClick={cancelReset} className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
                Cancel
              </button>
            )}

            <button
              type="button"
              className="btn"
              onClick={handleReset}
              style={{
                gap: '0.4rem',
                fontSize: '0.875rem',
                border: `1px solid var(--color-legendary-border)`,
                color: resetPending ? '#ffffff' : 'var(--color-legendary)',
                background: resetPending
                  ? 'var(--color-legendary)'
                  : 'color-mix(in srgb, var(--color-legendary) 10%, var(--color-surface))',
              }}
            >
              <RotateCcw size={15} aria-hidden="true" />
              {resetPending ? 'Confirm reset' : 'Reset settings'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
