import { SETTINGS_KEY, DEFAULT_SETTINGS } from '@/lib/settings';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadSettings, saveSettings, resetSettings } from '@/lib/settings';

describe('loadSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should return default settings when localStorage is empty', () => {
    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  test('should return saved settings when valid data exists', () => {
    const saved = { mascot: false, confetti: false, animations: true, easterEgg: false, pageSize: 10 };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));

    const settings = loadSettings();
    expect(settings.mascot).toBe(false);
    expect(settings.confetti).toBe(false);
    expect(settings.easterEgg).toBe(false);
    expect(settings.pageSize).toBe(10);
  });

  test('should fall back to defaults for missing keys', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mascot: false }));

    const settings = loadSettings();
    expect(settings.mascot).toBe(false);
    expect(settings.confetti).toBe(DEFAULT_SETTINGS.confetti);
    expect(settings.animations).toBe(DEFAULT_SETTINGS.animations);
    expect(settings.easterEgg).toBe(DEFAULT_SETTINGS.easterEgg);
    expect(settings.pageSize).toBe(DEFAULT_SETTINGS.pageSize);
  });

  test('should return defaults when stored json is invalid', () => {
    localStorage.setItem(SETTINGS_KEY, 'not-valid-json{{{');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test('should return defaults when stored value is not an object', () => {
    localStorage.setItem(SETTINGS_KEY, '"just a string"');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test('should fall back to default page size for invalid pageSize value', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ pageSize: 999 }));
    const settings = loadSettings();
    expect(settings.pageSize).toBe(DEFAULT_SETTINGS.pageSize);
  });

  test('should accept all valid page sizes', () => {
    for (const size of [10, 25, 50]) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ pageSize: size }));
      expect(loadSettings().pageSize).toBe(size);
    }
  });

  test('should return defaults when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe('saveSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should persist settings to localStorage', () => {
    const settings = { ...DEFAULT_SETTINGS, mascot: false };
    saveSettings(settings);

    const raw = localStorage.getItem(SETTINGS_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.mascot).toBe(false);
  });

  test('should not throw when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow();
  });
});

describe('resetSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should remove the settings key from localStorage', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    resetSettings();

    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
  });

  test('should not throw when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(() => resetSettings()).not.toThrow();
  });
});
