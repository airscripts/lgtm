export const SETTINGS_KEY = 'lgtm-settings';

export type PageSize = 10 | 25 | 50;

export type Settings = {
  mascot: boolean;
  confetti: boolean;
  easterEgg: boolean;
  pageSize: PageSize;
  animations: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  mascot: true,
  pageSize: 25,
  confetti: true,
  easterEgg: true,
  animations: true,
};

const VALID_PAGE_SIZES: PageSize[] = [10, 25, 50];

function isValidPageSize(value: unknown): value is PageSize {
  return VALID_PAGE_SIZES.includes(value as PageSize);
}

function isValidSettings(value: unknown): value is Partial<Settings> {
  if (typeof value !== 'object' || value === null) return false;
  return true;
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSettings(parsed)) return { ...DEFAULT_SETTINGS };

    const partial = parsed as Record<string, unknown>;

    return {
      mascot: typeof partial.mascot === 'boolean' ? partial.mascot : DEFAULT_SETTINGS.mascot,
      confetti: typeof partial.confetti === 'boolean' ? partial.confetti : DEFAULT_SETTINGS.confetti,
      animations: typeof partial.animations === 'boolean' ? partial.animations : DEFAULT_SETTINGS.animations,
      easterEgg: typeof partial.easterEgg === 'boolean' ? partial.easterEgg : DEFAULT_SETTINGS.easterEgg,
      pageSize: isValidPageSize(partial.pageSize) ? partial.pageSize : DEFAULT_SETTINGS.pageSize,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    const value = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, value);
    window.dispatchEvent(new StorageEvent('storage', { key: SETTINGS_KEY, newValue: value }));
  } catch {
    // Safeguard against QuotaExceededError or if localStorage is unavailable.
  }
}

export function resetSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    window.dispatchEvent(new StorageEvent('storage', { key: SETTINGS_KEY, newValue: null }));
  } catch {
    // Safeguard against localStorage access issues.
  }
}
