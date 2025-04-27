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
  workPhone?: string;
  relationship?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  occupation?: string;
  notes?: string;
  atSameAddress?: boolean;
}

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
  mediaRelease?: boolean;
  signSelfOut?: boolean;
}

export interface EmergencyContact {
  firstName: string;
  lastName?: string;
  cellPhone?: string;
  workPhone?: string;
  relationship?: string;
  notes?: string;
}

export interface MedicalProvider {
  name: string;
  phone?: string;
  phoneNumber?: string;
  type?: string;
  office?: string;
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
  slidingScaleOptOut?: boolean;
  guardians: Guardian[];
  students: Student[];
  emergencyContacts?: EmergencyContact[];
  medicalProviders?: MedicalProvider[];
  medicalInsuranceProvider?: string;
  medicalInsuranceNameOfPrimaryInsured?: string;
  medicalInsurancePolicyNumber?: string;
  medicalInsuranceGroupNumber?: string;
  pickupList?: string;
  authorizedEmails?: string[];
}

export interface UserFamily {
  familyID: string;
  familyName: string;
  id?: string;
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

export interface SignatureData {
  data: string; // Base64 encoded signature image
  date: string; // ISO date string of when the signature was created
  guardianId: string; // ID of the guardian who signed
}

export interface Contract {
  id: string;
  yearID: string;
  familyID: string;
  familyName?: string;
  familyNameAndGuardians?: string;
  studentDecisions: Record<string, string>;
  tuition?: number;
  assistanceAmount?: number;
  tuitionAssistanceRequested?: boolean;
  tuitionAssistanceGranted?: boolean;
  isSigned?: boolean;
  family?: Family;
  fullTimeNames?: string;
  partTimeNames?: string;
  suggestedTuition?: number;
  minTuition?: number;
  lastSavedBy?: string;
  lastSavedAt?: string;
  signatures?: Record<string, SignatureData>; // Guardian ID -> Signature data
}

export interface Year {
  id: string;
  name: string;
  minimumTuition: number;
  maximumTuition: number;
  minimumIncome: number;
  maximumIncome: number;
  isAcceptingRegistrations: boolean;
}

export interface VFSAdminUser {
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isStaff: boolean;
}
