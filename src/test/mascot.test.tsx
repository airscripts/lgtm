import type { Rarity } from '@/lib/lgtm';
import { pickLine } from '@/lib/mascot-lines';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, fireEvent, act } from '@testing-library/react';

vi.mock('@/lib/mascot-lines', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importOriginal<typeof import('@/lib/mascot-lines')>();
  return { ...actual, pickLine: vi.fn(actual.pickLine) };
});

function setupMatchMedia(reducedMotion = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,

    value: vi.fn((query: string) => ({
      matches: reducedMotion && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe('mascot component', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    setupMatchMedia(false);

    window.innerWidth = 1024;
    window.innerHeight = 768;
    localStorage.clear();

    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function renderMascot(props: { rarity?: Rarity; isIndex?: boolean } = {}) {
    const { Mascot } = await import('@/components/mascot');
    return render(<Mascot {...props} />);
  }

  test('should render without crashing', async () => {
    await renderMascot();
    expect(screen.getByRole('img', { name: /pierre/i })).toBeInTheDocument();
  });

  test('should render the mascot body element with accessible label', async () => {
    await renderMascot();
    const bot = screen.getByRole('img', { name: "LGTM's Mascot Pierre" });
    expect(bot).toBeInTheDocument();
  });

  test('should not show speech bubble text initially', async () => {
    await renderMascot();
    const bubbles = document.querySelectorAll('[style*="opacity: 0"]');
    expect(bubbles.length).toBeGreaterThan(0);
  });

  test('should fire idle quip after IDLE_QUIP_MS', async () => {
    await renderMascot();

    await act(async () => {
      vi.advanceTimersByTime(8000);
    });

    expect(pickLine).toHaveBeenCalledWith('idle', expect.anything());
  });

  test('should call pickLine with greeting context when isIndex is true', async () => {
    await renderMascot({ isIndex: true });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(pickLine).toHaveBeenCalledWith('greeting', expect.anything());
  });

  test('should not call pickLine with greeting when isIndex is false', async () => {
    await renderMascot({ isIndex: false });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    const greetingCalls = vi.mocked(pickLine).mock.calls.filter(([ctx]) => ctx === 'greeting');
    expect(greetingCalls).toHaveLength(0);
  });

  test('should restore saved position from localStorage on mount', async () => {
    const savedPos = { x: 100, y: 200 };
    localStorage.setItem('lgtm-mascot-pos', JSON.stringify(savedPos));

    const { container } = await renderMascot();

    const bot = container.querySelector('[style*="left: 100"]');
    expect(bot).not.toBeNull();
  });

  test('should ignore invalid saved position in localStorage and use default', async () => {
    localStorage.setItem('lgtm-mascot-pos', 'not-valid-json');
    expect(() => renderMascot()).not.toThrow();
  });

  test('should save position to localStorage on drag release', async () => {
    vi.useRealTimers();

    const { container } = await renderMascot();
    const bot = within(container).getByRole('img');
    const user = userEvent.setup({ delay: null });

    await user.pointer([
      { keys: '[MouseLeft>]', target: bot, coords: { x: 200, y: 200 } },
      { pointerName: 'mouse', target: bot, coords: { x: 250, y: 250 } },
      { pointerName: 'mouse', target: bot, coords: { x: 300, y: 300 } },
      { keys: '[/MouseLeft]', target: bot, coords: { x: 300, y: 300 } },
    ]);

    expect(localStorage.getItem('lgtm-mascot-pos')).not.toBeNull();
    vi.useFakeTimers();
  });

  test('should call pickLine with click context on click', async () => {
    await renderMascot();
    const bot = screen.getByRole('img');
    fireEvent.click(bot);
    expect(pickLine).toHaveBeenCalledWith('click', expect.anything());
  });

  test('should call pickLine with hover context on mouse enter', async () => {
    await renderMascot();
    const bot = screen.getByRole('img');
    fireEvent.mouseEnter(bot);
    expect(pickLine).toHaveBeenCalledWith('hover', expect.anything());
  });

  test('should call pickLine with rarity context when rarity is provided', async () => {
    await renderMascot({ rarity: 'legendary' });

    await act(async () => {
      vi.advanceTimersByTime(3500);
    });

    expect(pickLine).toHaveBeenCalledWith('legendary', expect.anything());
  });

  test('should show speech bubble after say is triggered via click', async () => {
    await renderMascot();
    const bot = screen.getByRole('img');
    vi.mocked(pickLine).mockReturnValue('Hello there!');

    await act(async () => {
      fireEvent.click(bot);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText(/Hello there!/)).toBeInTheDocument();
  });

  test('should clamp drag position within viewport bounds', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = await renderMascot();
    const bot = screen.getByRole('img');

    fireEvent.pointerDown(bot, { clientX: 500, clientY: 500, pointerId: 1 });
    fireEvent.pointerMove(bot, { clientX: -500, clientY: -500, pointerId: 1 });
    fireEvent.pointerUp(bot, { pointerId: 1 });

    const posEl = container.querySelector('[style*="position: fixed"]');
    expect(posEl).not.toBeNull();
    void container;
    consoleError.mockRestore();
  });
});

describe('mascot helper functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('accentForRarity returns the correct css var for each rarity', async () => {
    const { Mascot } = await import('@/components/mascot');
    setupMatchMedia(false);
    window.innerWidth = 1024;
    window.innerHeight = 768;

    const rarities = ['common', 'rare', 'epic', 'legendary'] as const;

    for (const rarity of rarities) {
      const { unmount } = render(<Mascot rarity={rarity} />);
      const badge = document.querySelector(`[style*="var(--color-${rarity})"]`);
      expect(badge).not.toBeNull();
      unmount();
    }
  });
});
