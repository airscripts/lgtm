import { Pagination } from '@/components/pagination';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render null when totalPages is 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPage={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test('should render null when totalPages is 0', () => {
    const { container } = render(<Pagination page={1} totalPages={0} onPage={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test('should render all page buttons when totalPages is 5', () => {
    render(<Pagination page={1} totalPages={5} onPage={vi.fn()} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`Page ${i}`)).toBeInTheDocument();
    }
  });

  test('should mark the current page with aria-current="page"', () => {
    render(<Pagination page={3} totalPages={5} onPage={vi.fn()} />);
    const current = screen.getByRole('button', { current: 'page' });
    expect(current).toHaveTextContent('3');
  });

  test('should disable the previous button on page 1', () => {
    render(<Pagination page={1} totalPages={5} onPage={vi.fn()} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  test('should disable the next button on the last page', () => {
    render(<Pagination page={5} totalPages={5} onPage={vi.fn()} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  test('should call onPage with page minus one when previous is clicked', () => {
    const onPage = vi.fn();
    render(<Pagination page={3} totalPages={5} onPage={onPage} />);
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPage).toHaveBeenCalledWith(2);
  });

  test('should call onPage with page plus one when next is clicked', () => {
    const onPage = vi.fn();
    render(<Pagination page={3} totalPages={5} onPage={onPage} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPage).toHaveBeenCalledWith(4);
  });

  test('should call onPage with the correct number when a page button is clicked', () => {
    const onPage = vi.fn();
    render(<Pagination page={1} totalPages={5} onPage={onPage} />);
    fireEvent.click(screen.getByLabelText('Page 4'));
    expect(onPage).toHaveBeenCalledWith(4);
  });

  test('should not call onPage when the current page button is clicked', () => {
    const onPage = vi.fn();
    render(<Pagination page={3} totalPages={5} onPage={onPage} />);
    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(onPage).not.toHaveBeenCalled();
  });

  test('should render ellipsis near the start when on page 2 of 10', () => {
    render(<Pagination page={2} totalPages={10} onPage={vi.fn()} />);
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(1);
  });

  test('should render ellipsis near the end when on page 9 of 10', () => {
    render(<Pagination page={9} totalPages={10} onPage={vi.fn()} />);
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(1);
  });

  test('should render two ellipses when current page is in the middle of a large range', () => {
    render(<Pagination page={5} totalPages={10} onPage={vi.fn()} />);
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(2);
  });
});
