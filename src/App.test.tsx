import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);

    // Check if the welcome message is rendered
    expect(screen.getByText(/Welcome to the Village Free School Admin Portal/)).toBeInTheDocument();
  });
});
