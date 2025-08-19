# Development Guide

This guide covers development practices, coding standards, and workflows for the VFS Admin Portal.

## Project Structure

```
vfsadmin/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── families/        # Family-specific components
│   │   ├── contracts/       # Contract-related components
│   │   ├── users/           # User management components
│   │   └── years/           # School year components
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── useAuth.ts       # Auth hook
│   ├── pages/               # Route-level components
│   │   ├── families/        # Family management pages
│   │   ├── contracts/       # Contract pages
│   │   ├── users/           # User management pages
│   │   └── years/           # School year pages
│   ├── services/            # Business logic and API calls
│   │   └── firebase/        # Firebase integration
│   │       ├── models/      # TypeScript type definitions
│   │       ├── auth.ts      # Authentication services
│   │       ├── families.ts  # Family CRUD operations
│   │       ├── users.ts     # User management
│   │       ├── years.ts     # School year operations
│   │       └── contracts.ts # Contract management
│   └── utils/               # Utility functions
├── docs/                    # Documentation
├── public/                  # Static assets
└── tests/                   # Test files
```

## Coding Standards

### Component Patterns

**Preferred**: Functional components with hooks
```typescript
function MyComponent({ prop }: MyComponentProps) {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return <div>{prop}</div>;
}
```

**Avoid**: React.FC pattern
```typescript
// Don't use this pattern
const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};
```

### TypeScript Guidelines

#### Interface Definitions
```typescript
// Use interfaces for props and data structures
interface FamilyProps {
  family: Family;
  onUpdate: (family: Family) => void;
  isEditable?: boolean;
}

// Use type for unions and computed types
type EnrollmentStatus = 'Full Time' | 'Part Time' | 'Not Attending';
type FamilyWithStudents = Family & { studentCount: number };
```

#### Type Safety
```typescript
// Always type function parameters and returns
async function fetchFamily(id: string): Promise<Family | null> {
  // Implementation
}

// Use type guards for runtime type checking
function isFamily(obj: unknown): obj is Family {
  return typeof obj === 'object' && 
         obj !== null && 
         'name' in obj && 
         'guardians' in obj;
}
```

### Firebase Service Patterns

#### Service Structure
```typescript
// Each collection gets its own service file
// families.ts
export async function fetchFamilies(): Promise<Family[]> {
  // Implementation
}

export async function saveFamily(family: Family): Promise<Family> {
  // Implementation
}

export async function deleteFamily(familyId: string): Promise<void> {
  // Implementation
}
```

#### Error Handling
```typescript
// Consistent error handling pattern
export async function saveFamily(family: Family): Promise<Family> {
  try {
    const cleanedFamily = removeUndefinedFields(family);
    
    if (family.id) {
      // Update existing
      await setDoc(doc(familyDB, family.id), cleanedFamily);
    } else {
      // Create new
      const docRef = await addDoc(familyDB, cleanedFamily);
      family.id = docRef.id;
    }
    
    return family;
  } catch (error) {
    console.error('Error saving family:', error);
    throw error; // Re-throw for component handling
  }
}
```

### Component Organization

#### File Naming
- Components: `PascalCase.tsx` (e.g., `FamilyForm.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- Services: `camelCase.ts` (e.g., `families.ts`)
- Types: `types.ts` or inline with component

#### Component Structure
```typescript
// 1. Imports (external libraries first, then internal)
import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import { useAuth } from '@contexts/useAuth';
import { saveFamily } from '@services/firebase/families';
import type { Family } from '@services/firebase/models/types';

// 2. Interface definitions
interface FamilyFormProps {
  family?: Family;
  onSave: (family: Family) => void;
  onCancel: () => void;
}

// 3. Component implementation
function FamilyForm({ family, onSave, onCancel }: FamilyFormProps) {
  // State declarations
  const [formData, setFormData] = useState<Partial<Family>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { currentUser } = useAuth();
  
  // Effects
  useEffect(() => {
    if (family) {
      setFormData(family);
    }
  }, [family]);
  
  // Event handlers
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Implementation
  };
  
  // Render
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
}

// 4. Export
export default FamilyForm;
```

## Development Workflow

### Git Workflow

#### Branch Naming
- Feature branches: `feature/description` (e.g., `feature/family-registration`)
- Bug fixes: `fix/description` (e.g., `fix/contract-signing-error`)
- Documentation: `docs/description` (e.g., `docs/api-documentation`)

#### Commit Messages
```bash
# Format: type(scope): description
feat(families): add family registration form
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
refactor(contracts): simplify contract generation logic
```

#### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests locally
4. Create pull request with description
5. Code review and approval
6. Merge to main

### Local Development

#### Environment Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd vfsadmin

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Firebase config

# 4. Start development server
npm start
```

#### Firebase Emulator Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start --only firestore,auth

# Update .env for emulator
VITE_FIREBASE_PROJECT=demo-project
```

### Testing Strategy

#### Unit Tests
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FamilyForm from './FamilyForm';

describe('FamilyForm', () => {
  it('renders form fields', () => {
    render(<FamilyForm onSave={vi.fn()} onCancel={vi.fn()} />);
    
    expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
  
  it('calls onSave when form is submitted', async () => {
    const mockSave = vi.fn();
    render(<FamilyForm onSave={mockSave} onCancel={vi.fn()} />);
    
    fireEvent.change(screen.getByLabelText(/family name/i), {
      target: { value: 'Test Family' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Family' })
    );
  });
});
```

#### Service Tests
```typescript
// Service testing with mocked Firebase
import { vi } from 'vitest';
import { saveFamily } from './families';

// Mock Firebase
vi.mock('./core', () => ({
  db: {},
  familyDB: {},
}));

describe('Family Service', () => {
  it('saves family successfully', async () => {
    const mockFamily = {
      id: '',
      name: 'Test Family',
      guardians: [],
      students: [],
      authorizedEmails: [],
    };
    
    const result = await saveFamily(mockFamily);
    
    expect(result.name).toBe('Test Family');
    expect(result.id).toBeTruthy();
  });
});
```

#### Integration Tests
```typescript
// End-to-end testing with Firebase emulator
describe('Family Registration Flow', () => {
  beforeEach(async () => {
    // Set up test data in emulator
    await setupTestData();
  });
  
  it('completes family registration', async () => {
    // Test full user flow
    render(<App />);
    
    // Navigate to registration
    fireEvent.click(screen.getByText(/register/i));
    
    // Fill out form
    // Submit form
    // Verify success
  });
});
```

### Code Quality

#### Linting Configuration
```json
// biome.jsonc
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noMultipleSpacesInRegularExpressionLiterals": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

#### Pre-commit Hooks
```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

### Performance Guidelines

#### Component Optimization
```typescript
// Use React.memo for expensive components
const ExpensiveFamilyList = React.memo(function FamilyList({ families }: Props) {
  return (
    <div>
      {families.map(family => (
        <FamilyCard key={family.id} family={family} />
      ))}
    </div>
  );
});

// Use useMemo for expensive calculations
function FamilyStats({ families }: { families: Family[] }) {
  const stats = useMemo(() => {
    return {
      totalStudents: families.reduce((sum, f) => sum + f.students.length, 0),
      averageIncome: families.reduce((sum, f) => sum + (f.grossFamilyIncome || 0), 0) / families.length,
    };
  }, [families]);
  
  return <div>{/* Render stats */}</div>;
}
```

#### Firebase Optimization
```typescript
// Batch operations for efficiency
async function updateMultipleFamilies(updates: Array<{ id: string; data: Partial<Family> }>) {
  const batch = writeBatch(db);
  
  updates.forEach(({ id, data }) => {
    const docRef = doc(familyDB, id);
    batch.update(docRef, data);
  });
  
  await batch.commit();
}

// Use pagination for large datasets
async function fetchFamiliesPaginated(pageSize = 25, lastDoc?: DocumentSnapshot) {
  let q = query(familyDB, orderBy('name'), limit(pageSize));
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  return {
    families: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === pageSize,
  };
}
```

### Debugging

#### Development Tools
```typescript
// Add debug logging in development
function debugLog(message: string, data?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Use React DevTools for component debugging
// Use Firebase DevTools for database inspection
```

#### Error Boundaries
```typescript
// Wrap components in error boundaries
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### Deployment

#### Build Process
```bash
# Production build
npm run build

# Analyze bundle size
npm run build:analyze

# Preview production build
npm run serve
```

#### Environment Variables
```bash
# Production environment
VITE_FIREBASE_PROJECT=vfsadmin
VITE_FIREBASE_API_KEY=production_key
# ... other production config

# Development environment  
VITE_FIREBASE_PROJECT=vfsadmin-dev
VITE_FIREBASE_API_KEY=development_key
# ... other development config
```

#### Deployment Checklist
- [ ] All tests passing
- [ ] Linting checks pass
- [ ] Environment variables configured
- [ ] Firebase security rules updated
- [ ] Performance metrics acceptable
- [ ] Error monitoring configured
- [ ] Backup procedures in place

### Troubleshooting

#### Common Issues

**Firebase Permission Errors**
```typescript
// Check user authentication
const { currentUser, isAdmin } = useAuth();
console.log('User:', currentUser?.email, 'Admin:', isAdmin);

// Verify Firestore rules
// Test with Firebase emulator
```

**Component Re-rendering Issues**
```typescript
// Use React DevTools Profiler
// Check dependency arrays in useEffect
// Verify memo dependencies
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run check

# Verify imports and exports
```

This development guide provides the foundation for maintaining code quality and consistency across the VFS Admin Portal project.
