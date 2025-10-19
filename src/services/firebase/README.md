# Firebase Services

This directory contains all Firebase integration code for the VFS Admin Portal.

## Architecture Overview

The application uses Firestore with the following collection structure:

```
users/                    # User accounts and permissions
families/                 # Family records with embedded guardians/students
students/                 # Denormalized student data for efficient queries
userFamilies/            # Links user emails to family IDs for access control
years/                   # School year configurations
  {yearId}/contracts/    # Enrollment contracts (one per family per year)
  {yearId}/enrollments/  # Individual student enrollments
```

## Key Concepts

### Data Denormalization

Students are stored in two places:

1. **Embedded in families** - For family management UI
2. **Separate students collection** - For efficient cross-family queries

This is intentional! When you save a family, both locations are updated
automatically.

### Chunked Queries

Firestore limits `in` queries to 10 items. Functions like `fetchFamiliesWithIDs`
automatically chunk large ID arrays to work around this limitation. That's why
you'll see `CHUNK_SIZE = 10`.

### Access Control

The `authorizedEmails` array on families determines which users can view/edit
that family. This is used by Firebase security rules. Admins bypass this
restriction.

## Common Workflows

### Creating/Updating a Family

```typescript
import { saveFamily } from "./firebase";

// saveFamily handles:
// - Generating IDs for new families/students
// - Updating families, students, and userFamilies collections
// - Building authorizedEmails from guardian/student emails
const savedFamily = await saveFamily(familyData);
```

### Fetching Enrolled Families for a Year

```typescript
import { enrolledFamiliesInYear } from "./firebase";

// Returns families with at least one Full Time or Part Time student
const families = await enrolledFamiliesInYear(yearId);
```

### Working with Contracts

```typescript
import {
  fetchContract,
  saveContract,
  saveContractSignatures,
} from "./firebase";

// Contracts use familyID as their document ID
const contract = await fetchContract(yearId, familyId);

// Update contract data
await saveContract({ ...contract, tuition: 5000 });

// Add signatures
await saveContractSignatures(yearId, familyId, signaturesObject);
```

## Firebase Constraints

### Undefined Values

Firestore doesn't allow `undefined` in documents. The `removeUndefinedFields`
utility in `families.ts` strips these before saving to prevent errors.

### Document ID Patterns

- **users**: Email address (lowercase)
- **families**: Auto-generated Firestore ID
- **students**: Auto-generated Firestore ID
- **userFamilies**: Email address (lowercase)
- **years**: Auto-generated Firestore ID
- **contracts**: Family ID (one contract per family per year)
- **enrollments**: Student ID (one enrollment per student per year)

## Testing

Mock Firebase services are available in `src/__mocks__/firebase.ts` for unit
testing.
