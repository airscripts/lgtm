import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SETTINGS_KEY, DEFAULT_SETTINGS } from '@/lib/settings';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/easter-egg', () => ({ showEasterEgg: vi.fn() }));

describe('settings panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,

      value: vi.fn((query: string) => ({
        media: query,
        matches: false,
        onchange: null,
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  async function renderPanel() {
    const { SettingsPanel } = await import('@/components/settings-panel');
    return render(<SettingsPanel />);
  }

  test('should render without crashing', async () => {
    const { container } = await renderPanel();
    expect(container).toBeDefined();
  });

  test('should render all four section headings', async () => {
    await renderPanel();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Browsing')).toBeInTheDocument();
    expect(screen.getByText('Danger zone')).toBeInTheDocument();
  });

  test('should render all toggle labels', async () => {
    await renderPanel();
    expect(screen.getByText('Mascot')).toBeInTheDocument();
    expect(screen.getByText('Confetti')).toBeInTheDocument();
    expect(screen.getByText('Animations')).toBeInTheDocument();
    expect(screen.getByText('Easter Egg')).toBeInTheDocument();
  });

  test('should render theme segmented control with three options', async () => {
    await renderPanel();
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });

  test('should render page size segmented control with options 10, 25, 50', async () => {
    await renderPanel();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '25' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
  });

  test('should persist mascot toggle to localStorage when clicked', async () => {
    await renderPanel();

    const toggle = screen.getByRole('switch', { name: /toggle mascot/i });
    fireEvent.click(toggle);

    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
    expect(saved.mascot).toBe(false);
  });

  test('should persist confetti toggle to localStorage when clicked', async () => {
    await renderPanel();

    const toggle = screen.getByRole('switch', { name: /toggle confetti/i });
    fireEvent.click(toggle);

    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
    expect(saved.confetti).toBe(false);
  });

  test('should persist animations toggle to localStorage when clicked', async () => {
    await renderPanel();

    const toggle = screen.getByRole('switch', { name: /toggle animations/i });
    fireEvent.click(toggle);

    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
    expect(saved.animations).toBe(false);
  });

  test('should persist easter egg toggle to localStorage when clicked', async () => {
    await renderPanel();

    const toggle = screen.getByRole('switch', { name: /toggle easter egg/i });
    fireEvent.click(toggle);

    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
    expect(saved.easterEgg).toBe(false);
  });

  test('should persist page size selection to localStorage', async () => {
    await renderPanel();

    fireEvent.click(screen.getByRole('button', { name: '10' }));

    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
    expect(saved.pageSize).toBe(10);
  });

  test('should show confirm reset button after first click on reset', async () => {
    await renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /reset settings/i }));

    expect(screen.getByRole('button', { name: /confirm reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('should reset settings to defaults on confirm reset', async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, mascot: false, pageSize: 10 }));

    await renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /reset settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm reset/i }));

    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
    expect(screen.queryByRole('button', { name: /confirm reset/i })).not.toBeInTheDocument();
  });

  test('should cancel reset when cancel button is clicked', async () => {
    await renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /reset settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('button', { name: /confirm reset/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset settings/i })).toBeInTheDocument();
  });

  test('should load existing settings from localStorage on mount', async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, mascot: false }));

    await renderPanel();

    const toggle = screen.getByRole('switch', { name: /toggle mascot/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});
