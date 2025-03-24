# Firebase Services

This directory contains Firebase-related services for the VFSAdmin application. These services
provide a TypeScript implementation of the original Vue app's Firebase functionality.

## Configuration

Firebase configuration is managed through environment variables or fallback hardcoded configs:

1. **Environment Variables**: Define in `.env.local` file (see `.env.example` for format)
2. **Project Selection**: Set `VITE_FIREBASE_PROJECT=vfsadmin-dev` or
   `VITE_FIREBASE_PROJECT=vfsadmin` to switch environments
3. **Fallback Configs**: If environment variables aren't available, hardcoded configs in
   `firebaseConfig.ts` will be used

## Services

- `firebase.ts` - Core Firebase initialization
- `firebaseConfig.ts` - Configuration management
- `firestoredb.ts` - Firestore database operations
- `index.ts` - Barrel file that exports all Firebase functionality

## Types

The services include TypeScript definitions for all data models:

- `Family` - Family records with guardians and students
- `Guardian` - Parent/guardian information
- `Student` - Student information
- `EmergencyContact` - Emergency contact information
- `Enrollment` - Student enrollment in a specific year

## API Compatibility

This implementation maintains API compatibility with the original Vue app's `firestoredb.js` while
adding type safety:

- Collection references are maintained with the same names
- Helper functions like `saveFamily`, `deleteFamily`, etc. have the same signatures
- Utility functions like `contactToString` work identically

## Firebase SDK v11

This implementation uses Firebase SDK v11 patterns, which differ from the older SDK:

- Uses modular imports (`firebase/firestore` vs `firebase/app`)
- Uses function-based APIs (`collection()`, `doc()`) instead of chained methods
- Uses explicit query builders (`query()`, `where()`) instead of method chaining

## Usage Example

```typescript
import { saveFamily, fetchStudentsWithIDs, Family } from './services';

// Create or update a family
const family: Family = {
  id: '123',
  name: 'Smith Family',
  guardians: [...],
  students: [...]
};

await saveFamily(family);

// Get students by IDs
const studentIDs = ['abc', 'def'];
const students = await fetchStudentsWithIDs(studentIDs);
```
