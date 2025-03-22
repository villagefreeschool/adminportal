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
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
/
├── .husky/             # Git hooks
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # React components
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
│   └── ...
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
