import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Clock } from './Clock';

describe('Clock component', () => {
  beforeEach(() => {
    // Mock Date to return a fixed time
    const mockDate = new Date('2025-03-22T12:34:56');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the current time', () => {
    render(<Clock />);

    // Get the formatted time string that should be displayed
    const formattedTime = new Date().toLocaleTimeString();

    // Check if the component displays the time
    const clockElement = screen.getByTestId('clock');
    expect(clockElement).toHaveTextContent(formattedTime);
  });
});
