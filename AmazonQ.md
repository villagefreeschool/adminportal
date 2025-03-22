# Village Free School Admin Portal - Development Notes

## Project Setup

This project is a modern React application for the Village Free School administration, built with:

- React 19.0.0
- TypeScript 5.8.2
- Vite 6.2.2
- TailwindCSS 4.0.15
- ESLint 8.57.1
- Prettier 3.5.3
- Vitest 3.0.9

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

The application follows a standard React project structure:

```
/
├── src/                # Source code
│   ├── components/     # Reusable React components
│   │   └── ui/         # UI components (buttons, inputs, etc.)
│   ├── App.tsx         # Main App component
│   └── main.tsx        # Entry point
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # TailwindCSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Key Components

### Clock Component

A simple clock component that displays the current time and updates every second:

```tsx
export function Clock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    // Update time every second
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="text-xl font-mono" data-testid="clock">
      {time.toLocaleTimeString()}
    </div>
  );
}
```

## Testing

Tests are written using Vitest and React Testing Library. Example test for the Clock component:

```tsx
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
```

## ESLint Configuration

The project uses ESLint with the modern flat config format, configured for TypeScript and React 19:

```js
export default [
  eslint.configs.recommended,
  {
    // TypeScript configuration
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    // ...
  },
  {
    // React configuration
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    // ...
  },
  // ...
];
```

## Future Enhancements

Potential areas for future development:

1. Add React Router for navigation
2. Implement authentication
3. Add more UI components
4. Connect to a backend API
5. Add state management (Context API or Redux)
