import type { MascotContext } from '@/lib/mascot-lines';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { pickLine, contextFromPath, MASCOT_LINES } from '@/lib/mascot-lines';

describe('pick line', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return a string from the correct context pool', () => {
    const result = pickLine('idle');
    expect(MASCOT_LINES.idle).toContain(result);
  });

  test('should never return the excluded string when pool has multiple lines', () => {
    const excluded = MASCOT_LINES.idle[0]!;

    for (let i = 0; i < 50; i++) {
      expect(pickLine('idle', excluded)).not.toBe(excluded);
    }
  });

  test('should return a string even when exclude matches the only available line', () => {
    const singleLine = ['only line'];
    vi.spyOn(MASCOT_LINES, 'idle', 'get').mockReturnValue(singleLine);
    const result = pickLine('idle', 'only line');

    expect(typeof result).toBe('string');
    expect(result).toBe('only line');
  });

  test('should return a string from each valid context', () => {
    const contexts: MascotContext[] = [
      'idle',
      'hover',
      'click',
      'rare',
      'epic',
      'common',
      'browse',
      'random',
      '404',
      'legendary',
      'greeting',
    ];

    for (const ctx of contexts) {
      const result = pickLine(ctx);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });
});

describe('context from path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should map '/' to 'idle'", () => {
    expect(contextFromPath('/')).toBe('idle');
  });

  test("should map '/browse' to 'browse'", () => {
    expect(contextFromPath('/browse')).toBe('browse');
  });

  test("should map '/browse/extra' to 'browse'", () => {
    expect(contextFromPath('/browse/extra')).toBe('browse');
  });

  test("should map '/random' to 'random'", () => {
    expect(contextFromPath('/random')).toBe('random');
  });

  test("should map '/random/something' to 'random'", () => {
    expect(contextFromPath('/random/something')).toBe('random');
  });

  test("should map '/lgtm/42' to 'idle'", () => {
    expect(contextFromPath('/lgtm/42')).toBe('idle');
  });

  test("should map '/lgtm/1' to 'idle'", () => {
    expect(contextFromPath('/lgtm/1')).toBe('idle');
  });

  test("should map '/404' to '404'", () => {
    expect(contextFromPath('/404')).toBe('404');
  });

  test("should map a path containing '404' to '404'", () => {
    expect(contextFromPath('/error-404-page')).toBe('404');
  });

  test('should map an unknown path to idle', () => {
    expect(contextFromPath('/unknown-route')).toBe('idle');
  });

  test("should map '/categories/nerd' to 'idle'", () => {
    expect(contextFromPath('/categories/nerd')).toBe('idle');
  });
});

describe('mascot lines constant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should have at least one line for every mascot context', () => {
    for (const [, lines] of Object.entries(MASCOT_LINES)) {
      expect(lines.length).toBeGreaterThan(0);
    }
  });
});
