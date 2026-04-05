import { ThemeSwitcher } from '@/components/theme-switcher';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

function getTheme() {
  return document.documentElement.getAttribute('data-theme');
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('theme switcher', () => {
  test('should render a button', () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should start in system mode (no data-theme attribute)', () => {
    render(<ThemeSwitcher />);
    expect(getTheme()).toBeNull();
  });

  test('should cycle system → light on first click', () => {
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole('button'));
    expect(getTheme()).toBe('light');
    expect(localStorage.getItem('lgtm-theme')).toBe('light');
  });

  test('should cycle light → dark on second click', () => {
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(getTheme()).toBe('dark');
    expect(localStorage.getItem('lgtm-theme')).toBe('dark');
  });

  test('should cycle dark → system on third click', () => {
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(getTheme()).toBeNull();
    expect(localStorage.getItem('lgtm-theme')).toBeNull();
  });

  test('should restore persisted theme from localStorage on mount', () => {
    localStorage.setItem('lgtm-theme', 'dark');
    render(<ThemeSwitcher />);
    expect(getTheme()).toBe('dark');
  });

  test('should have an accessible aria-label', () => {
    render(<ThemeSwitcher />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label');
  });
});
