import { COPY_FEEDBACK_MS } from '@/lib/config';
import { CopyShareButton } from '@/components/copy-share-button';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('copy share button', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    Object.defineProperty(document, 'execCommand', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });
  });

  test('should render with the default label', () => {
    render(<CopyShareButton url="https://example.com" />);
    expect(screen.getByText('Copy share link')).toBeInTheDocument();
  });

  test('should render with a custom label', () => {
    render(<CopyShareButton url="https://example.com" label="Share" />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  test('should call navigator.clipboard.writeText with the provided url', async () => {
    render(<CopyShareButton url="https://example.com/test" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/test');
  });

  test('should show "Copied!" after clicking', async () => {
    render(<CopyShareButton url="https://example.com" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  test('should revert to the original label after COPY_FEEDBACK_MS', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<CopyShareButton url="https://example.com" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
      await Promise.resolve();
    });

    expect(screen.getByText('Copied!')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(COPY_FEEDBACK_MS);
    });

    expect(screen.getByText('Copy share link')).toBeInTheDocument();
    vi.useRealTimers();
  });

  test('should fall back to document.execCommand when clipboard.writeText throws', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    render(<CopyShareButton url="https://example.com" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
