import { CountUp } from '@/components/count-up';
import { render, screen, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let observerCallback: ObserverCallback | null = null;
let observeSpy: ReturnType<typeof vi.fn>;
let disconnectSpy: ReturnType<typeof vi.fn>;

function triggerIntersection(isIntersecting: boolean) {
  observerCallback?.([{ isIntersecting }] as IntersectionObserverEntry[]);
}

describe('count up', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    observerCallback = null;

    observeSpy = vi.fn();
    disconnectSpy = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((cb: ObserverCallback) => {
        observerCallback = cb;
        return { observe: observeSpy, disconnect: disconnectSpy };
      }),
    );

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((cb: FrameRequestCallback) => {
        cb(performance.now() + 9999);
        return 0;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('should render 0 before intersection fires', () => {
    render(<CountUp to={42} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('should display the target value after intersection fires', () => {
    render(<CountUp to={42} />);

    act(() => {
      triggerIntersection(true);
    });

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('should not restart animation if intersection fires a second time', () => {
    render(<CountUp to={10} />);

    act(() => {
      triggerIntersection(true);
    });

    const rafCallCount = (requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length;

    act(() => {
      triggerIntersection(true);
    });

    expect((requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length).toBe(rafCallCount);
  });

  test('should not animate when isIntersecting is false', () => {
    render(<CountUp to={99} />);

    act(() => {
      triggerIntersection(false);
    });

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('should apply the className prop to the span', () => {
    render(<CountUp to={5} className="test-class" />);
    const span = screen.getByText('0');
    expect(span).toHaveClass('test-class');
  });

  test('should reach the correct target for any given to value', () => {
    render(<CountUp to={251} />);

    act(() => {
      triggerIntersection(true);
    });

    expect(screen.getByText('251')).toBeInTheDocument();
  });
});
