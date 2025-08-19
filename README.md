# Village Free School Admin Portal

A comprehensive React application for managing the Village Free School's administrative operations, including family registration, student enrollment, tuition calculation with sliding scale support, and contract management.

## Overview

The VFS Admin Portal serves two primary user groups:
- **Administrative Staff**: Manage families, students, school years, and generate reports
- **Families**: Register students, manage family information, and sign enrollment contracts

The application features a role-based permission system, sliding scale tuition calculation, digital contract signing, and comprehensive reporting capabilities.

## Tech Stack

- **Frontend**: React 19.0.0 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.2 for fast development and optimized builds
- **UI Framework**: Material-UI (MUI) v7 with custom theming
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Testing**: Vitest 3.0.9 with React Testing Library
- **Code Quality**: Biome for linting and formatting, Husky for git hooks
- **Additional Libraries**: 
  - React Router v7 for navigation
  - PDFMake for contract generation
  - Plotly.js for data visualization
  - ExcelJS for spreadsheet exports

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vfsadmin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Start development server
npm start
```

### Environment Configuration

The application supports multiple Firebase environments:

```bash
# Use predefined project configurations
VITE_FIREBASE_PROJECT=vfsadmin-dev  # or "vfsadmin" for production

# Or specify custom Firebase config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config values
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production  
- `npm run build:analyze` - Build with bundle analysis
- `npm run serve` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run Biome linter
- `npm run lint:fix` - Fix linting issues automatically
## Architecture & Data Model

### Firebase Collections

The application uses Firestore with the following main collections:

#### `users` Collection
- **Document ID**: User's email address (lowercase)
- **Purpose**: Stores user account information and permissions
- **Fields**:
  - `firstName`: User's first name
  - `lastName`: User's last name  
  - `isAdmin`: Boolean - grants full administrative access
  - `isStaff`: Boolean - grants staff-level access (future use)

#### `families` Collection
- **Document ID**: Auto-generated Firestore ID
- **Purpose**: Central family data including guardians, students, and contact information
- **Key Fields**:
  - `name`: Family display name
  - `guardians[]`: Array of guardian objects with contact details
  - `students[]`: Array of student objects with personal/medical info
  - `emergencyContacts[]`: Emergency contact information
  - `medicalProviders[]`: Healthcare provider information
  - `grossFamilyIncome`: For sliding scale tuition calculation
  - `authorizedEmails[]`: Users who can access this family's data

#### `userFamilies` Collection
- **Document ID**: User's email address (lowercase)
- **Purpose**: Links user accounts to family records
- **Fields**:
  - `familyID`: Reference to families collection
  - `familyName`: Cached family name for quick access

#### `years` Collection
- **Document ID**: Auto-generated Firestore ID
- **Purpose**: School year configuration and tuition parameters
- **Fields**:
  - `name`: Display name (e.g., "2024-2025")
  - `minimumTuition`/`maximumTuition`: Tuition bounds
  - `minimumIncome`/`maximumIncome`: Income thresholds for sliding scale
  - `isAcceptingRegistrations`: Controls registration availability

#### `contracts` Collection
- **Document ID**: Auto-generated Firestore ID
- **Purpose**: Enrollment contracts linking families to school years
- **Fields**:
  - `yearID`: Reference to years collection
  - `familyID`: Reference to families collection
  - `studentDecisions`: Object mapping student IDs to enrollment status
  - `tuition`: Final tuition amount
  - `signatures`: Digital signatures from guardians
  - `isSigned`: Contract completion status

### Data Relationships

```
User (email) → UserFamily → Family → Students
                                  ↓
Year ← Contract ← Family → Guardians
                     ↓
              Emergency Contacts
              Medical Providers
```

## Authentication & Permissions

### Authentication Methods

The application supports multiple authentication providers through Firebase Auth:

- **Email/Password**: Traditional account creation and login
- **Google OAuth**: Single sign-on with Google accounts
- **Password Reset**: Email-based password recovery

### Permission System

The application implements a role-based access control system:

#### **Family Users** (Default)
- Access to their own family information only
- Can register students for school years
- Can view and sign contracts
- Can update family profile and student information

#### **Admin Users** (`isAdmin: true`)
- Full access to all families and students
- Can create and manage school years
- Can create and manage user accounts
- Can view all contracts and enrollment data
- Can generate reports and export data
- Access to administrative tools and settings

#### **Staff Users** (`isStaff: true`)
- Reserved for future use
- Currently equivalent to family user permissions

### Route Protection

Routes are protected using the `ProtectedRoute` component:

```typescript
// Family-accessible route
<ProtectedRoute>
  <MyFamily />
</ProtectedRoute>

// Admin-only route  
<ProtectedRoute requireAdmin={true}>
  <FamilyList />
</ProtectedRoute>
```

### Data Access Control

- **Family Data**: Users can only access families linked via `userFamilies` collection
- **Admin Override**: Admin users bypass family-specific restrictions
- **Contract Access**: Users can only view/sign contracts for their linked families
- **User Management**: Only admins can create/modify user accounts

## Firebase Integration

### Configuration

Firebase configuration is handled through environment variables with fallback to hardcoded configs:

```typescript
// Priority order:
1. Environment variables (VITE_FIREBASE_*)
2. Project-specific configs (vfsadmin-dev, vfsadmin)
3. Production fallback
```

### Security Rules

Firestore security rules should enforce:
- Users can only read/write their own user document
- Family access restricted to linked users or admins
- Contract modifications require proper family association
- Admin-only collections (users, years) protected appropriately

### Batch Operations

The application uses chunked operations for large datasets:
- `CHUNK_SIZE = 10` for Firestore 'in' query limits
- Batch writes for bulk operations
- Efficient pagination for large family lists

## Key Features

### Sliding Scale Tuition

The tuition calculation system:
1. Takes family income and school year parameters
2. Calculates suggested tuition on sliding scale
3. Allows families to pay above/below suggestion
4. Triggers assistance requests for below-minimum payments
5. Enforces hard limits set by administrators

### Digital Contracts

Contract workflow:
1. Family completes registration with student enrollment decisions
2. System generates PDF contract with calculated tuition
3. Guardians provide digital signatures
4. Completed contracts stored with signature metadata
5. Admin oversight of contract completion status

### Reporting & Analytics

Built-in reporting features:
- Family directory generation (PDF)
- Enrollment rosters by school year
- Contract completion tracking
- Tuition analysis and visualization
- Data export capabilities (Excel, CSV)

## Development Guidelines

### Code Organization

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── pages/             # Route-level components
├── services/          # Firebase integration
│   └── firebase/      # Firebase-specific services
│       ├── models/    # TypeScript type definitions
│       └── *.ts       # Collection-specific services
└── utils/             # Utility functions
```

### Component Patterns

The project uses functional components with hooks:

```typescript
// Preferred pattern
function MyComponent({ prop }: MyComponentProps) {
  // Component logic
}

// Avoid React.FC pattern
const MyComponent: React.FC<Props> = ({ prop }) => {
  // Component logic
}
```

### Firebase Service Pattern

Each collection has a dedicated service file:
- `families.ts` - Family CRUD operations
- `users.ts` - User management
- `years.ts` - School year operations
- `contracts.ts` - Contract management

### Error Handling

- Firebase errors are caught and displayed to users
- Loading states shown during async operations
- Graceful degradation for missing data
- Console logging for debugging

## Deployment

The application is configured for deployment on Netlify with:
- Automatic builds from Git repository
- Environment variable configuration
- Redirect rules for SPA routing
- Build optimization and bundle analysis

For other platforms, ensure:
- Environment variables are properly configured
- Build artifacts are served from `dist/` directory
- SPA routing redirects are configured
- Firebase project permissions are set correctly

## Documentation

- **[Firebase Integration](docs/FIREBASE.md)** - Detailed Firebase setup, collections, and security rules
- **[Permissions & Security](docs/PERMISSIONS.md)** - Role-based access control and security model
- **[API Documentation](docs/API.md)** - Service layer APIs and data operations
- **[Development Guide](docs/DEVELOPMENT.md)** - Coding standards, workflows, and best practices
- **[Product Requirements](docs/prd.md)** - Original product requirements document

## Contributing

1. Read the [Development Guide](docs/DEVELOPMENT.md) for coding standards
2. Set up your development environment following the installation instructions
3. Create a feature branch for your changes
4. Write tests for new functionality
5. Ensure all tests pass and code is properly formatted
6. Submit a pull request with a clear description

## License

This project is proprietary software for the Village Free School.
