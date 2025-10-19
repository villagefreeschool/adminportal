/**
 * Type definitions for the Firebase data models
 */

/**
 * Guardian represents a parent, grandparent, step-parent, or other adult
 * responsible for a student's care and enrollment at VFS
 */
export interface Guardian {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  otherEmails?: string;
  cellPhone?: string;
  workPhone?: string;
  relationship?: string; // Relationship to student (e.g., "Parent", "Grandparent", "Step-Parent")
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  occupation?: string;
  notes?: string;
  atSameAddress?: boolean; // True if this guardian lives at the same address as another guardian
}

/**
 * Student represents a child enrolled or potentially enrolling at VFS
 */
export interface Student {
  id: string;
  familyID: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  birthdate?: string; // ISO date string
  gender?: string;
  customGender?: string;
  pronoun?: string;
  email?: string;
  grade?: string;
  priorSchool?: string;
  learningDisabilities?: string;
  additionalInfo?: string;
  severeAllergies?: string;
  nonSevereAllergies?: string;
  otherMedicalConditions?: string;
  medicalNotes?: string;
  allergies?: string; // General allergies field
  mediaRelease?: boolean; // Permission for school to use student photos/videos in publications
  signSelfOut?: boolean; // Permission for student to sign themselves out of school early
}

/**
 * Emergency contact for a family - someone to call if guardians cannot be reached
 */
export interface EmergencyContact {
  firstName: string;
  lastName?: string;
  cellPhone?: string;
  workPhone?: string;
  relationship?: string;
  notes?: string;
}

/**
 * Medical provider information for a family (doctor, dentist, etc.)
 */
export interface MedicalProvider {
  name: string;
  phone?: string; // Legacy field
  phoneNumber?: string; // Preferred field
  type?: string; // Type of provider (e.g., "Doctor", "Dentist")
  office?: string;
}

/**
 * Family represents a household with one or more guardians and students
 * Central data structure containing all family information for enrollment
 */
export interface Family {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  allergies?: string;
  grossFamilyIncome?: number | null; // Annual household income for sliding scale tuition calculation
  slidingScaleOptOut?: boolean; // True if family chooses not to provide income and opts out of sliding scale
  guardians: Guardian[];
  students: Student[];
  emergencyContacts?: EmergencyContact[];
  medicalProviders?: MedicalProvider[];
  medicalInsuranceProvider?: string;
  medicalInsuranceNameOfPrimaryInsured?: string;
  medicalInsurancePolicyNumber?: string;
  medicalInsuranceGroupNumber?: string;
  pickupList?: string;
  authorizedEmails?: string[]; // User emails authorized to access this family's data
}

/**
 * UserFamily links a user account to a family record
 * Stored with user's email as document ID for quick lookup
 */
export interface UserFamily {
  familyID: string; // Reference to families collection
  familyName: string; // Cached family name for quick display
  id?: string;
}

/**
 * Enrollment represents a student's attendance status for a specific school year
 * Used for roster generation and tracking full-time vs part-time students
 */
export interface Enrollment {
  id: string;
  yearID: string;
  enrollmentType: string; // "Not Attending" | "Part Time" | "Full Time"
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

/**
 * SignatureData stores a digital signature from a guardian on a contract
 */
export interface SignatureData {
  data: string; // Base64 encoded signature image
  date: string; // ISO date string of when the signature was created
  guardianId: string; // ID of the guardian who signed
}

/**
 * Contract represents an enrollment agreement between a family and VFS for a school year
 * Includes student enrollment decisions, tuition calculation, and guardian signatures
 */
export interface Contract {
  id: string;
  yearID: string;
  familyID: string;
  familyName?: string;
  familyNameAndGuardians?: string;
  studentDecisions: Record<string, string>; // Maps student ID to enrollment type
  tuition?: number; // Final tuition amount family will pay
  assistanceAmount?: number; // Dollar amount of aid requested when family sets tuition below income-based minimum
  tuitionAssistanceRequested?: boolean; // True if family requested tuition below their calculated minimum
  tuitionAssistanceGranted?: boolean; // True if admin approved the assistance request
  isSigned?: boolean; // True when all required guardian signatures are collected
  family?: Family; // Populated family data for display
  fullTimeNames?: string; // Comma-separated names of full-time students
  partTimeNames?: string; // Comma-separated names of part-time students
  suggestedTuition?: number; // Calculated tuition based on income and sliding scale
  minTuition?: number; // Minimum tuition allowed based on income
  lastSavedBy?: string; // Email of user who last modified the contract
  lastSavedAt?: string; // ISO timestamp of last modification
  signatures?: Record<string, SignatureData>; // Maps guardian ID to signature data
}

/**
 * Year represents a school year with tuition parameters and enrollment settings
 * Defines the sliding scale income/tuition ranges for that year
 */
export interface Year {
  id: string;
  name: string; // Display name (e.g., "2024-2025")
  minimumTuition: number; // Lowest tuition amount on sliding scale
  maximumTuition: number; // Highest tuition amount on sliding scale
  minimumIncome: number; // Income threshold for minimum tuition
  maximumIncome: number; // Income threshold for maximum tuition
  isAcceptingRegistrations: boolean; // Controls whether families can register for this year
}

/**
 * VFSAdminUser represents a user account with role-based permissions
 * Stored with email as document ID for authentication lookup
 */
export interface VFSAdminUser {
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean; // Grants full administrative access to all data and features
  isStaff: boolean; // Reserved for future use (currently equivalent to family user)
}
