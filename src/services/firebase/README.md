# Firebase Services

This directory contains a TypeScript implementation of the Firebase services used in the original Vue.js app. The code has been refactored to use a more maintainable structure while maintaining full API compatibility.

## Directory Structure

- **`config.ts`** - Firebase project configuration
- **`core.ts`** - Core Firebase initialization
- **`families.ts`** - Family-related Firestore operations
- **`students.ts`** - Student-related Firestore operations
- **`years.ts`** - Academic year-related Firestore operations
- **`index.ts`** - Barrel file exporting all Firebase functionality
- **`models/`** - Type definitions
  - **`types.ts`** - TypeScript interfaces for all data models
- **`utils/`** - Utility functions
  - **`formatters.ts`** - Helper functions for formatting data

## API Compatibility

This implementation maintains full compatibility with the original Vue app's `firestoredb.js` file while adding TypeScript type safety:

- Collection references use the same names (`userDB`, `familyDB`, etc.)
- Helper functions have the same signatures (`saveFamily`, `deleteFamily`, etc.)
- Utility functions work identically (`contactToString`, etc.)

## Firebase SDK v11

Updates made to work with Firebase SDK v11:

- Modular imports from `firebase/firestore` packages
- Function-based API calls (`collection()`, `doc()`) instead of chained methods
- Explicit query builders with `query()` and `where()`

## Configuration

Firebase configuration is managed through:

1. Environment variables (defined in `.env.local`)
2. Project selection variable (`VITE_FIREBASE_PROJECT`)
3. Fallback hardcoded configs (identical to original Vue app)

## Usage Example

```typescript
import { 
  saveFamily, 
  fetchStudentsWithIDs,
  enrolledStudentsInYear,
  Family 
} from 'src/services';

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

// Get all students enrolled in a specific year
const yearID = '2023-2024';
const enrolledStudents = await enrolledStudentsInYear(yearID);
```