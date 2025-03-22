# Village Free School Admin Portal

A modern React application for the Village Free School administration.

## Tech Stack

- React 18.2.0
- TypeScript 5.4.2
- Vite 6.2.2
- Vitest 3.0.8
- TailwindCSS 4.0.14
- ESLint 9.22.0
- Prettier 3.2.5
- Husky 9.1.7

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
/
├── .husky/             # Git hooks
├── public/             # Static assets
├── src/                # Source code
│   ├── assets/         # Images, fonts, and other static assets
│   ├── components/     # Reusable React components
│   │   └── ui/         # UI components (buttons, inputs, etc.)
│   ├── constants/      # Application constants and configuration
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page components
│   ├── services/       # API and external service integrations
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main App component
│   └── main.tsx        # Entry point
├── .gitignore          # Git ignore file
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # TailwindCSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Features

- Modern React with functional components and hooks
- Type safety with TypeScript
- Fast development with Vite
- Testing with Vitest
- Styling with TailwindCSS
- Code quality with ESLint and Prettier
- Git hooks with Husky
