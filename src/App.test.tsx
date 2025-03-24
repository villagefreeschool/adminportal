import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app header', () => {
    render(<App />);

    // Check if the header is rendered
    expect(screen.getByText('VFS Admin Portal')).toBeInTheDocument();
  });
});
