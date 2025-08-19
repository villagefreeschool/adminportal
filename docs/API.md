# API Documentation

This document describes the service layer APIs and data operations available in the VFS Admin Portal.

## Service Architecture

The application uses a service-oriented architecture with Firebase as the backend. Each major data entity has its own service module:

```
src/services/firebase/
├── auth.ts          # Authentication operations
├── families.ts      # Family CRUD operations  
├── users.ts         # User management
├── years.ts         # School year operations
├── contracts.ts     # Contract management
├── students.ts      # Student operations
└── models/types.ts  # TypeScript type definitions
```

## Authentication Services

### `signInWithEmail(email: string, password: string): Promise<User>`
Authenticates user with email and password.

```typescript
try {
  const user = await signInWithEmail('user@example.com', 'password');
  console.log('Logged in:', user.email);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### `createUserWithEmail(email: string, password: string): Promise<User>`
Creates a new user account.

### `signInWithGooglePopup(): Promise<User>`
Authenticates user with Google OAuth popup.

### `signInWithGoogleRedirect(): Promise<void>`
Initiates Google OAuth redirect flow (preferred for mobile).

### `resetPassword(email: string): Promise<void>`
Sends password reset email to user.

### `getUserData(user: FirebaseUser): Promise<User>`
Fetches extended user data from Firestore.

### `subscribeToAuthChanges(callback: (user: User | null) => void): () => void`
Subscribes to authentication state changes. Returns unsubscribe function.

## Family Services

### `fetchFamilies(): Promise<Family[]>`
Fetches all families (admin only).

```typescript
// Admin usage
const families = await fetchFamilies();
console.log(`Found ${families.length} families`);
```

### `fetchFamiliesWithIDs(familyIDs: string[]): Promise<Family[]>`
Fetches specific families by ID array. Uses chunked queries for efficiency.

```typescript
const familyIds = ['family1', 'family2', 'family3'];
const families = await fetchFamiliesWithIDs(familyIds);
```

### `saveFamily(family: Family): Promise<Family>`
Creates or updates a family record.

```typescript
const family: Family = {
  id: '', // Empty for new family
  name: 'Smith Family',
  guardians: [/* guardian data */],
  students: [/* student data */],
  authorizedEmails: ['parent@example.com'],
  // ... other fields
};

const savedFamily = await saveFamily(family);
console.log('Family saved with ID:', savedFamily.id);
```

### `deleteFamily(familyId: string): Promise<void>`
Deletes a family and all associated data.

```typescript
await deleteFamily('family123');
console.log('Family deleted');
```

### `calculatedNameForFamily(family: Family): string`
Generates display name for family based on guardians.

### `guardianNamesForFamily(family: Family): string`
Returns formatted string of guardian names.

### `contactToString(contact: EmergencyContact | MedicalProvider): string`
Formats contact information as display string.

## User Services

### `fetchUsers(): Promise<VFSAdminUser[]>`
Fetches all user accounts (admin only).

```typescript
const users = await fetchUsers();
users.forEach(user => {
  console.log(`${user.firstName} ${user.lastName} - Admin: ${user.isAdmin}`);
});
```

### `fetchUser(email: string): Promise<VFSAdminUser | null>`
Fetches a single user by email.

### `saveUser(user: VFSAdminUser): Promise<VFSAdminUser>`
Creates or updates a user account.

```typescript
const user: VFSAdminUser = {
  email: 'newuser@example.com',
  firstName: 'John',
  lastName: 'Doe',
  isAdmin: false,
  isStaff: false,
};

await saveUser(user);
```

## School Year Services

### `fetchYears(): Promise<Year[]>`
Fetches all school years.

```typescript
const years = await fetchYears();
const currentYear = years.find(year => year.isAcceptingRegistrations);
```

### `fetchYear(yearId: string): Promise<Year | null>`
Fetches a specific school year.

### `saveYear(year: Year): Promise<Year>`
Creates or updates a school year.

```typescript
const year: Year = {
  id: '',
  name: '2024-2025',
  minimumTuition: 5000,
  maximumTuition: 15000,
  minimumIncome: 30000,
  maximumIncome: 150000,
  isAcceptingRegistrations: true,
};

await saveYear(year);
```

### `deleteYear(yearId: string): Promise<void>`
Deletes a school year.

### `enrolledStudentsInYear(yearId: string): Promise<Enrollment[]>`
Gets all student enrollments for a school year.

### `enrolledFamiliesInYear(yearId: string): Promise<string[]>`
Gets family IDs enrolled in a school year.

## Contract Services

### `fetchContracts(): Promise<Contract[]>`
Fetches all contracts (admin only).

### `fetchContractsForYear(yearId: string): Promise<Contract[]>`
Fetches contracts for a specific school year.

### `fetchContractForFamily(yearId: string, familyId: string): Promise<Contract | null>`
Fetches contract for a specific family and year.

```typescript
const contract = await fetchContractForFamily('year123', 'family456');
if (contract) {
  console.log(`Tuition: $${contract.tuition}`);
  console.log(`Signed: ${contract.isSigned}`);
}
```

### `saveContract(contract: Contract): Promise<Contract>`
Creates or updates a contract.

```typescript
const contract: Contract = {
  id: '',
  yearID: 'year123',
  familyID: 'family456',
  studentDecisions: {
    'student1': 'Full Time',
    'student2': 'Part Time',
  },
  tuition: 12000,
  isSigned: false,
};

await saveContract(contract);
```

### `deleteContract(contractId: string): Promise<void>`
Deletes a contract.

## Student Services

### `fetchStudentsWithIDs(studentIDs: string[]): Promise<Student[]>`
Fetches specific students by ID array.

```typescript
const studentIds = ['student1', 'student2'];
const students = await fetchStudentsWithIDs(studentIds);
```

## Tuition Calculation Services

### `calculateTuition(income: number, year: Year): number`
Calculates suggested tuition based on sliding scale.

```typescript
import { calculateTuition } from '@services/tuitioncalc';

const year = await fetchYear('year123');
const suggestedTuition = calculateTuition(75000, year);
console.log(`Suggested tuition: $${suggestedTuition}`);
```

### `calculateSiblingDiscount(baseAmount: number, siblingCount: number): number`
Applies sibling discount to tuition amount.

### `calculatePartTimeDiscount(baseAmount: number): number`
Applies part-time enrollment discount.

## Error Handling Patterns

### Firebase Errors
```typescript
import type { FirebaseError } from 'firebase/app';

try {
  await saveFamily(family);
} catch (error) {
  const firebaseError = error as FirebaseError;
  
  switch (firebaseError.code) {
    case 'permission-denied':
      setError('You do not have permission to perform this action');
      break;
    case 'not-found':
      setError('The requested resource was not found');
      break;
    case 'unavailable':
      setError('Service is temporarily unavailable. Please try again.');
      break;
    default:
      setError('An unexpected error occurred');
      console.error('Firebase error:', firebaseError);
  }
}
```

### Data Validation
```typescript
// Services automatically clean data before saving
const cleanedFamily = removeUndefinedFields(family);
await setDoc(doc(familyDB, family.id), cleanedFamily);
```

## Batch Operations

### Chunked Queries
```typescript
// For operations that might exceed Firestore limits
const chunks = _.chunk(familyIDs, CHUNK_SIZE); // CHUNK_SIZE = 10
const allFamilies = [];

for (const chunk of chunks) {
  const q = query(familyDB, where(documentId(), 'in', chunk));
  const snapshot = await getDocs(q);
  allFamilies.push(...snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })));
}
```

### Batch Writes
```typescript
import { writeBatch } from 'firebase/firestore';

const batch = writeBatch(db);

families.forEach(family => {
  const docRef = doc(familyDB, family.id);
  batch.set(docRef, family);
});

await batch.commit();
```

## Real-time Subscriptions

### Family Data Subscription
```typescript
import { onSnapshot } from 'firebase/firestore';

const unsubscribe = onSnapshot(doc(familyDB, familyId), (doc) => {
  if (doc.exists()) {
    const family = { id: doc.id, ...doc.data() } as Family;
    setFamily(family);
  }
});

// Clean up subscription
useEffect(() => {
  return () => unsubscribe();
}, []);
```

### Contract Status Monitoring
```typescript
const unsubscribe = onSnapshot(
  query(contractDB, where('yearID', '==', yearId)),
  (snapshot) => {
    const contracts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setContracts(contracts);
  }
);
```

## Performance Optimization

### Efficient Data Loading
```typescript
// Load only necessary fields
const familyQuery = query(
  familyDB,
  select('name', 'guardians', 'authorizedEmails')
);

// Use pagination for large datasets
const familyQuery = query(
  familyDB,
  orderBy('name'),
  limit(25),
  startAfter(lastDoc)
);
```

### Caching Strategies
```typescript
// Cache frequently accessed data
const yearCache = new Map<string, Year>();

async function getCachedYear(yearId: string): Promise<Year | null> {
  if (yearCache.has(yearId)) {
    return yearCache.get(yearId)!;
  }
  
  const year = await fetchYear(yearId);
  if (year) {
    yearCache.set(yearId, year);
  }
  
  return year;
}
```

## Testing Services

### Mock Data
```typescript
// Use mock data for testing
const mockFamily: Family = {
  id: 'test-family',
  name: 'Test Family',
  guardians: [],
  students: [],
  authorizedEmails: ['test@example.com'],
};

// Mock Firebase operations
jest.mock('@services/firebase/families', () => ({
  saveFamily: jest.fn().mockResolvedValue(mockFamily),
  fetchFamilies: jest.fn().mockResolvedValue([mockFamily]),
}));
```

### Integration Testing
```typescript
// Test with Firebase emulator
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'test') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Common Usage Patterns

### Family Registration Flow
```typescript
async function registerFamily(familyData: Partial<Family>, yearId: string) {
  // 1. Save family data
  const family = await saveFamily(familyData as Family);
  
  // 2. Create user-family link
  await setDoc(doc(userFamilyDB, userEmail), {
    familyID: family.id,
    familyName: family.name,
  });
  
  // 3. Create contract
  const contract = await saveContract({
    yearID: yearId,
    familyID: family.id,
    studentDecisions: {},
    tuition: 0,
    isSigned: false,
  } as Contract);
  
  return { family, contract };
}
```

### Admin Dashboard Data
```typescript
async function loadDashboardData() {
  const [families, years, contracts] = await Promise.all([
    fetchFamilies(),
    fetchYears(),
    fetchContracts(),
  ]);
  
  return {
    totalFamilies: families.length,
    activeYears: years.filter(y => y.isAcceptingRegistrations),
    signedContracts: contracts.filter(c => c.isSigned).length,
  };
}
```
