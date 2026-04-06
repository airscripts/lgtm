import { showEasterEgg } from '@/lib/easter-egg';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('show easter egg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should not call console.log when window is undefined', () => {
    const original = globalThis.window;
    // @ts-expect-error intentionally deleting window to simulate server environment
    delete globalThis.window;

    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    showEasterEgg();
    expect(spy).not.toHaveBeenCalled();

    globalThis.window = original;
  });

  test('should call console.log once with styled output when window is defined', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    showEasterEgg();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0]![0]).toMatch(/^%c/);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
