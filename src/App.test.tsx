import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Clock component to avoid timer issues in tests
vi.mock('./components/ui/Clock', () => ({
  Clock: () => <div data-testid="clock">12:34:56</div>,
}));

describe('App', () => {
  it('renders the header', () => {
    render(<App />);

    // Check if the header is rendered
    expect(screen.getByText('Village Free School Admin Portal')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<App />);

    // Check if the welcome message is rendered
    expect(screen.getByText(/Welcome to the Village Free School Admin Portal/)).toBeInTheDocument();
  });

  it('renders the clock component', () => {
    render(<App />);

    // Check if the clock component is rendered
    expect(screen.getByTestId('clock')).toBeInTheDocument();
  });
});
