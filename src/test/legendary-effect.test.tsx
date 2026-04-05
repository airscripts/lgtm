import { render } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import confetti from 'canvas-confetti';
import { LegendaryEffect } from '@/components/legendary-effect';

describe('legendary effect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render without crashing', () => {
    const { container } = render(<LegendaryEffect />);
    expect(container).toBeDefined();
  });

  test('should call confetti on mount', () => {
    render(<LegendaryEffect />);
    expect(confetti).toHaveBeenCalledOnce();
  });

  test('should call confetti with particleCount', () => {
    render(<LegendaryEffect />);
    expect(confetti).toHaveBeenCalledWith(expect.objectContaining({ particleCount: expect.any(Number) }));
  });

  test('should render null (no dom nodes)', () => {
    const { container } = render(<LegendaryEffect />);
    expect(container.firstChild).toBeNull();
  });
});
