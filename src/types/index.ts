/**
 * Core type definitions for the application
 */

// Example type definition
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'teacher' | 'student' | 'parent';
}

// Add more types as needed
