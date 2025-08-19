# Permissions & Security Guide

This document details the permission system, security model, and access control mechanisms in the VFS Admin Portal.

## Permission Levels

### Family Users (Default)
**Role**: `isAdmin: false, isStaff: false`

**Access Rights**:
- ✅ View and edit their own family information
- ✅ Register students for school years
- ✅ View and sign contracts for their family
- ✅ Update student information for their children
- ✅ Manage emergency contacts and medical providers
- ❌ Access other families' data
- ❌ Create or manage school years
- ❌ View administrative reports
- ❌ Manage user accounts

**Data Access**:
- Can only access families where their email is in the `authorizedEmails` array
- Can view contracts linked to their family
- Can access school years (read-only) for registration purposes

### Admin Users
**Role**: `isAdmin: true`

**Access Rights**:
- ✅ Full access to all families and students
- ✅ Create and manage school years
- ✅ Create and manage user accounts
- ✅ View all contracts and enrollment data
- ✅ Generate reports and export data
- ✅ Access administrative tools and settings
- ✅ Override family-specific restrictions
- ✅ Manage tuition parameters and sliding scale settings

**Data Access**:
- Unrestricted access to all Firestore collections
- Can read/write any family, contract, or user document
- Can create and modify school year configurations

### Staff Users (Future Use)
**Role**: `isStaff: true, isAdmin: false`

**Planned Access Rights**:
- Limited administrative access
- View-only access to family data
- Cannot modify critical settings
- Cannot manage user accounts

*Note: Staff permissions are currently equivalent to family user permissions and reserved for future implementation.*

## Authentication Flow

### 1. User Login
```typescript
// User authenticates via Firebase Auth
const user = await signInWithEmail(email, password);

// System fetches user permissions from Firestore
const userData = await getUserData(user);

// Auth context is populated with user and permissions
setCurrentUser({ ...user, ...userData });
```

### 2. Permission Resolution
```typescript
// AuthContext determines user permissions
const isAdmin = !!currentUser?.isAdmin;
const isAuthenticated = !!currentUser && !currentUser.isAnonymous;

// Family association is resolved
const userFamily = await fetchUserFamily(user.email);
const myFamily = await fetchFamily(userFamily.familyID);
```

### 3. Route Protection
```typescript
// ProtectedRoute component enforces access control
<ProtectedRoute requireAdmin={true}>
  <AdminOnlyComponent />
</ProtectedRoute>

<ProtectedRoute>
  <FamilyAccessibleComponent />
</ProtectedRoute>
```

## Data Access Control

### Family Data Access

#### For Family Users
```typescript
// 1. Check userFamilies collection for association
const userFamilyDoc = await getDoc(doc(userFamilyDB, userEmail));

// 2. Access only linked family data
if (userFamilyDoc.exists()) {
  const familyData = userFamilyDoc.data();
  const family = await getDoc(doc(familyDB, familyData.familyID));
}

// 3. Verify email authorization
const family = familyDoc.data();
const isAuthorized = family.authorizedEmails?.includes(userEmail);
```

#### For Admin Users
```typescript
// Direct access to any family
const family = await getDoc(doc(familyDB, familyID));

// No authorization checks required
// Admin override bypasses all restrictions
```

### Contract Access Control

#### Family Users
- Can only view contracts where `contract.familyID` matches their linked family
- Can sign contracts for their family
- Cannot view other families' contracts

#### Admin Users
- Can view all contracts regardless of family association
- Can modify contract details and tuition amounts
- Can override contract restrictions

### User Management Access

#### Family Users
- Cannot access user management features
- Cannot create or modify user accounts
- Cannot view other users' information

#### Admin Users
- Full access to user management
- Can create new user accounts
- Can modify user permissions
- Can link users to families

## Route-Level Security

### Public Routes
```typescript
// No authentication required
/login
/forgot-password
/create-account
```

### Family Routes
```typescript
// Requires authentication only
<ProtectedRoute>
  / (Home)
  /my-family
  /register
</ProtectedRoute>
```

### Admin Routes
```typescript
// Requires admin privileges
<ProtectedRoute requireAdmin={true}>
  /families
  /families/:id
  /families/:id/register
  /years
  /years/:id/roster
  /years/:id/contracts
  /users
  /sliding-scale
</ProtectedRoute>
```

## Component-Level Security

### Conditional Rendering
```typescript
function NavigationMenu() {
  const { isAdmin } = useAuth();
  
  return (
    <Menu>
      <MenuItem to="/my-family">My Family</MenuItem>
      <MenuItem to="/register">Register</MenuItem>
      
      {isAdmin && (
        <>
          <MenuItem to="/families">All Families</MenuItem>
          <MenuItem to="/years">School Years</MenuItem>
          <MenuItem to="/users">Users</MenuItem>
        </>
      )}
    </Menu>
  );
}
```

### Permission Hooks
```typescript
// Custom hook for permission checking
function usePermissions() {
  const { currentUser, isAdmin } = useAuth();
  
  return {
    canViewFamily: (familyId: string) => {
      if (isAdmin) return true;
      return currentUser?.linkedFamilyId === familyId;
    },
    
    canEditContract: (contract: Contract) => {
      if (isAdmin) return true;
      return contract.familyID === currentUser?.linkedFamilyId;
    },
    
    canManageUsers: () => isAdmin,
    canCreateYear: () => isAdmin,
  };
}
```

## Firestore Security Rules

### User Collection Rules
```javascript
// Users can only access their own document or admins can access all
match /users/{email} {
  allow read, write: if request.auth != null && 
    (request.auth.token.email == email || 
     get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.isAdmin == true);
}
```

### Family Collection Rules
```javascript
// Access based on authorizedEmails or admin status
match /families/{familyId} {
  allow read, write: if request.auth != null && 
    (request.auth.token.email in resource.data.authorizedEmails ||
     get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.isAdmin == true);
}
```

### Contract Collection Rules
```javascript
// Access based on family association or admin status
match /contracts/{contractId} {
  allow read, write: if request.auth != null && 
    (exists(/databases/$(database)/documents/userFamilies/$(request.auth.token.email)) &&
     get(/databases/$(database)/documents/userFamilies/$(request.auth.token.email)).data.familyID == resource.data.familyID ||
     get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.isAdmin == true);
}
```

### Year Collection Rules
```javascript
// Read access for all authenticated users, write access for admins only
match /years/{yearId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.isAdmin == true;
}
```

## Security Best Practices

### Client-Side Security
```typescript
// Always validate permissions on the client
function FamilyEditForm({ familyId }: { familyId: string }) {
  const { canViewFamily } = usePermissions();
  
  if (!canViewFamily(familyId)) {
    return <AccessDenied />;
  }
  
  return <FamilyForm familyId={familyId} />;
}
```

### Server-Side Security
- Firestore security rules provide server-side enforcement
- Rules are evaluated on every database operation
- Client-side checks are for UX only, not security

### Data Sanitization
```typescript
// Remove sensitive data before sending to client
function sanitizeFamilyData(family: Family, isAdmin: boolean): Partial<Family> {
  if (isAdmin) {
    return family; // Admins see everything
  }
  
  // Remove sensitive fields for family users
  const { grossFamilyIncome, ...sanitized } = family;
  return sanitized;
}
```

## Permission Debugging

### Auth State Debugging
```typescript
// Log auth state for debugging
useEffect(() => {
  console.log('Auth State:', {
    isAuthenticated,
    isAdmin,
    userEmail: currentUser?.email,
    linkedFamilyId: userFamily?.familyID,
  });
}, [isAuthenticated, isAdmin, currentUser, userFamily]);
```

### Permission Check Logging
```typescript
function checkPermission(action: string, resource: string): boolean {
  const hasPermission = /* permission logic */;
  
  console.log('Permission Check:', {
    action,
    resource,
    user: currentUser?.email,
    isAdmin,
    result: hasPermission,
  });
  
  return hasPermission;
}
```

### Security Rule Testing
```bash
# Use Firebase emulator for testing security rules
firebase emulators:start --only firestore

# Test rules with different user contexts
# Verify admin access works correctly
# Ensure family users can't access other families
```

## Common Security Patterns

### Family Authorization Check
```typescript
async function ensureFamilyAccess(familyId: string, userEmail: string): Promise<boolean> {
  // Check if user is admin
  const userDoc = await getDoc(doc(userDB, userEmail));
  if (userDoc.exists() && userDoc.data().isAdmin) {
    return true;
  }
  
  // Check if user is authorized for this family
  const familyDoc = await getDoc(doc(familyDB, familyId));
  if (familyDoc.exists()) {
    const family = familyDoc.data();
    return family.authorizedEmails?.includes(userEmail) || false;
  }
  
  return false;
}
```

### Contract Access Validation
```typescript
async function validateContractAccess(contractId: string, userEmail: string): Promise<boolean> {
  const contractDoc = await getDoc(doc(contractDB, contractId));
  if (!contractDoc.exists()) return false;
  
  const contract = contractDoc.data();
  return await ensureFamilyAccess(contract.familyID, userEmail);
}
```

### Admin Action Verification
```typescript
function requireAdmin(user: User | null): void {
  if (!user?.isAdmin) {
    throw new Error('Admin privileges required for this action');
  }
}

// Usage
async function createSchoolYear(yearData: Year) {
  requireAdmin(currentUser);
  // Proceed with admin action
}
```

## Error Handling

### Permission Denied Errors
```typescript
try {
  await firebaseOperation();
} catch (error) {
  if (error.code === 'permission-denied') {
    // Handle gracefully - show appropriate message
    setError('You do not have permission to perform this action');
    return;
  }
  throw error; // Re-throw other errors
}
```

### Graceful Degradation
```typescript
function FamilyList() {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return (
      <Alert severity="info">
        You need administrator privileges to view all families.
        <Link to="/my-family">View your family information</Link>
      </Alert>
    );
  }
  
  return <AdminFamilyList />;
}
```
