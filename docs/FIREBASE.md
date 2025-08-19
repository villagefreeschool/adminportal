# Firebase Integration Guide

This document provides detailed information about how the VFS Admin Portal integrates with Firebase services.

## Firebase Services Used

### Firestore Database
- **Purpose**: Primary data storage for all application data
- **Collections**: users, families, userFamilies, years, contracts
- **Features**: Real-time updates, offline support, security rules

### Firebase Authentication
- **Purpose**: User authentication and session management
- **Providers**: Email/Password, Google OAuth
- **Features**: Password reset, session persistence, user management

### Firebase Storage
- **Purpose**: File storage for documents and images
- **Usage**: Contract PDFs, signature images, family documents

## Collection Structure & Security

### Collection: `users`
```typescript
// Document ID: user email (lowercase)
{
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isStaff: boolean;
}
```

**Security Rules**:
- Users can read/write their own document
- Admins can read/write all user documents
- Email is used as document ID for efficient lookups

### Collection: `families`
```typescript
// Document ID: auto-generated
{
  name: string;
  guardians: Guardian[];
  students: Student[];
  emergencyContacts: EmergencyContact[];
  medicalProviders: MedicalProvider[];
  grossFamilyIncome?: number;
  authorizedEmails: string[];
  // ... other family fields
}
```

**Security Rules**:
- Users can only access families where their email is in `authorizedEmails`
- Admins can access all families
- Family creation requires admin privileges or authorized email

### Collection: `userFamilies`
```typescript
// Document ID: user email (lowercase)
{
  familyID: string;
  familyName: string;
}
```

**Security Rules**:
- Users can read their own userFamily document
- Admins can read/write all userFamily documents
- Links users to their associated family records

### Collection: `years`
```typescript
// Document ID: auto-generated
{
  name: string;
  minimumTuition: number;
  maximumTuition: number;
  minimumIncome: number;
  maximumIncome: number;
  isAcceptingRegistrations: boolean;
}
```

**Security Rules**:
- All authenticated users can read years
- Only admins can create/update years
- Controls school year configuration and tuition parameters

### Collection: `contracts`
```typescript
// Document ID: auto-generated
{
  yearID: string;
  familyID: string;
  studentDecisions: Record<string, string>;
  tuition: number;
  signatures: Record<string, SignatureData>;
  isSigned: boolean;
  // ... other contract fields
}
```

**Security Rules**:
- Users can access contracts for their linked families
- Admins can access all contracts
- Contract signing requires family association

## Data Access Patterns

### Family Data Access
```typescript
// For regular users - check userFamilies first
const userFamilyDoc = await getDoc(doc(userFamilyDB, userEmail));
if (userFamilyDoc.exists()) {
  const familyDoc = await getDoc(doc(familyDB, userFamilyDoc.data().familyID));
}

// For admins - direct access to any family
const familyDoc = await getDoc(doc(familyDB, familyID));
```

### Batch Operations
```typescript
// Use CHUNK_SIZE for 'in' queries (Firestore limit: 10)
const chunks = _.chunk(familyIDs, CHUNK_SIZE);
const allFamilies = [];

for (const chunk of chunks) {
  const q = query(familyDB, where(documentId(), 'in', chunk));
  const snapshot = await getDocs(q);
  allFamilies.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}
```

### Real-time Updates
```typescript
// Listen to family changes
const unsubscribe = onSnapshot(doc(familyDB, familyID), (doc) => {
  if (doc.exists()) {
    setFamily({ id: doc.id, ...doc.data() });
  }
});

// Clean up listener
return () => unsubscribe();
```

## Authentication Flow

### Login Process
1. User enters credentials or uses OAuth
2. Firebase Auth validates and creates session
3. App fetches user data from `users` collection
4. App fetches linked family data via `userFamilies`
5. User context is populated with permissions

### Permission Checking
```typescript
// In AuthContext
const isAdmin = !!currentUser?.isAdmin;
const isAuthenticated = !!currentUser && !currentUser.isAnonymous;

// In components
const { isAdmin, isAuthenticated } = useAuth();
```

### Route Protection
```typescript
// ProtectedRoute component checks:
1. Authentication status (isAuthenticated)
2. Admin requirements (requireAdmin)
3. Loading state (isLoading)
4. Redirects appropriately
```

## Error Handling

### Firebase Errors
```typescript
try {
  await firebaseOperation();
} catch (error) {
  const firebaseError = error as FirebaseError;
  console.error('Firebase error:', firebaseError.code, firebaseError.message);
  
  // Handle specific error codes
  switch (firebaseError.code) {
    case 'permission-denied':
      // Handle permission error
      break;
    case 'not-found':
      // Handle missing document
      break;
    default:
      // Handle generic error
  }
}
```

### Data Validation
```typescript
// Remove undefined fields before saving
function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedFields(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedFields(value);
      }
    }
    return cleaned as T;
  }
  
  return obj;
}
```

## Performance Optimization

### Efficient Queries
- Use document IDs when possible for direct access
- Implement pagination for large datasets
- Use composite indexes for complex queries
- Cache frequently accessed data

### Batch Operations
- Group multiple operations into batches
- Use transactions for related updates
- Implement retry logic for failed operations

### Offline Support
- Firestore provides automatic offline support
- Data is cached locally and synced when online
- Handle offline states in UI components

## Security Best Practices

### Firestore Security Rules
```javascript
// Example security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{email} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email == email || 
         get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.isAdmin == true);
    }
    
    // Family access based on authorizedEmails
    match /families/{familyId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.email in resource.data.authorizedEmails ||
         get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.isAdmin == true);
    }
  }
}
```

### Data Sanitization
- Always validate input data
- Remove undefined fields before saving
- Sanitize user-generated content
- Use TypeScript for type safety

### Access Control
- Implement role-based permissions
- Check permissions on both client and server
- Use Firebase Auth tokens for verification
- Audit access patterns regularly

## Monitoring & Debugging

### Firebase Console
- Monitor database usage and performance
- View authentication logs and user activity
- Check security rule evaluations
- Monitor storage usage and costs

### Application Logging
```typescript
// Structured logging for Firebase operations
console.log('Firebase operation:', {
  operation: 'fetchFamily',
  familyId,
  userId: currentUser?.email,
  timestamp: new Date().toISOString()
});
```

### Error Tracking
- Log Firebase errors with context
- Monitor authentication failures
- Track permission denied errors
- Set up alerts for critical failures

## Development vs Production

### Environment Configuration
```typescript
// Development
VITE_FIREBASE_PROJECT=vfsadmin-dev

// Production  
VITE_FIREBASE_PROJECT=vfsadmin
```

### Data Separation
- Use separate Firebase projects for dev/prod
- Different security rules for development
- Test data vs production data isolation
- Backup strategies for production data

### Deployment Considerations
- Environment variable management
- Security rule deployment
- Database migration strategies
- Performance monitoring setup
