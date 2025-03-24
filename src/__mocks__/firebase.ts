import { vi } from 'vitest';

// Mock Firebase services and functions
export const mockAuth = {
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  currentUser: null,
};

export const mockFirestore = {
  collection: vi.fn().mockReturnThis(),
  doc: vi.fn().mockReturnThis(),
  get: vi.fn(),
  add: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
};

export const mockStorage = {
  ref: vi.fn().mockReturnThis(),
  child: vi.fn().mockReturnThis(),
  put: vi.fn(),
  getDownloadURL: vi.fn(),
  delete: vi.fn(),
};

// Main mock
const firebaseMock = {
  initializeApp: vi.fn(),
  auth: vi.fn(() => mockAuth),
  firestore: vi.fn(() => mockFirestore),
  storage: vi.fn(() => mockStorage),
};

export default firebaseMock;
