/**
 * Type definitions for the Firebase data models
 */

export interface Guardian {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  otherEmails?: string;
  cellPhone?: string;
  relationship?: string;
}

export interface Student {
  id: string;
  familyID: string;
  firstName: string;
  lastName: string;
  birthdate?: string; // ISO date string
  email?: string;
  grade?: string;
  medicalNotes?: string;
  allergies?: string;
}

export interface EmergencyContact {
  firstName: string;
  cellPhone?: string;
  relationship?: string;
}

export interface Family {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  allergies?: string;
  grossFamilyIncome?: number | null;
  guardians: Guardian[];
  students: Student[];
  emergencyContacts?: EmergencyContact[];
}

export interface UserFamily {
  familyID: string;
  familyName: string;
}

export interface Enrollment {
  id: string;
  yearID: string;
  enrollmentType: string;
  familyID: string;
  familyName: string;
  studentID: string;
  studentName: string;
  family?: Family;
  student?: Student;
  birthday?: string | null;
  birthdaySort?: string;
  birthdayDisplay?: string;
}

export interface Contract {
  id: string;
  yearID: string;
  familyID: string;
  studentDecisions: Record<string, string>;
}
