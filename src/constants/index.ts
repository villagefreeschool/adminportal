/**
 * Application-wide constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  CLASSES: '/classes',
  SETTINGS: '/settings',
};

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};
