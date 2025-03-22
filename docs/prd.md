# Village Free School Admin Portal - Product Requirements Document

## Executive Summary

The Village Free School Admin Portal is a web application designed to streamline the administration
of the Village Free School, a progressive educational institution. The application serves two
primary user groups: administrative staff and families. The portal facilitates family registration,
student enrollment, tuition calculation, and administrative functions.

This document outlines the requirements for building a comprehensive administrative system that will
improve operational efficiency and enhance the experience for both staff and families.

## Background

The Village Free School (VFS) is a progressive educational institution that requires a robust
administrative system to manage family registrations, student enrollments, and tuition calculations.
The school operates on a sliding scale tuition model to ensure accessibility for families of all
income levels. This system will replace manual processes and provide a centralized platform for all
administrative functions.

## User Personas

### Administrative Staff

- School administrators who manage family accounts, student enrollments, and school years
- Need comprehensive access to all family and student data
- Responsible for setting up school years, tuition parameters, and managing user accounts
- Generate reports and view enrollment statistics

### Families

- Parents and guardians of students
- Need to create and manage family profiles
- Register students for school years
- View and sign enrollment contracts
- Access their own family information

## Core Features

### Authentication and User Management

#### User Authentication

- Single-sign-on integration with auth mechanisms supported by Firebase Auth (Google, Apple,
  Facebook, etc)
- Email/password authentication
- Password reset functionality
- Anonymous access for public-facing calculators

#### User Account Management

- Admin-only access to create and edit user accounts
- User roles: Admin, Staff, Family
- User profile with name, email, and role information

### Family Management

#### Family Profiles

- Create and edit family profiles
- Family information includes:
  - Family name
  - Parents/guardians with contact information
  - Students with personal and medical information
  - Emergency contacts
  - Medical providers and insurance information
  - Income information for sliding scale tuition calculation
  - Pick-up list for authorized adults

#### Student Information

- Comprehensive student profiles including:
  - Personal information (name, birthdate, gender, pronouns)
  - Medical information (allergies, conditions, disabilities)
  - Prior school information
  - Media release permissions
  - Self sign-out permissions

#### Guardian Information

- Contact details (email, phone, address)
- Relationship to students
- Occupation information
- Multiple guardians per family with primary address indicator

### School Year Management

#### Year Configuration

- Create and configure school years
- Set tuition parameters (minimum/maximum tuition, income thresholds)
- Control registration periods
- View year-specific reports and rosters

#### Enrollment Management

- Family registration for school years
- Student enrollment status tracking (Full Time, Part Time, Not Attending)
- Contract generation and management
- Enrollment roster by school year

### Tuition Management

#### Sliding Scale Calculation

- Calculate tuition based on family income using a sliding scale algorithm
- Ability to pay above or below the sliding scale recommendation, with soft and hard limits (soft
  limit triggers a tuition assistance request)
- Support for sibling discounts
- Support for part-time enrollment discounts
- Minimum and maximum tuition thresholds

#### Tuition Assistance

- Request and track approval of tuition assistance to pay below the sliding scale limits
- Admin approval of assistance requests
- Adjustment of final tuition amounts

### Reporting

#### Family Directory

- Generate PDF directory of enrolled families
- Include contact information for enrolled students and guardians

#### Enrollment Roster

- View and export student enrollment by school year
- Filter and sort enrollment data

#### Contracts

- Generate and manage enrollment contracts
- Track contract signing status
- PDF generation of contracts

## User Flows

### Family Registration Flow

1. User creates family profile with guardian and student information
2. User navigates to registration page for current school year
3. User selects enrollment status for each student
4. System calculates suggested tuition based on family income
5. User adjusts tuition if needed or requests assistance
6. User submits registration
7. Admin reviews and approves registration
8. Contract is generated and made available to family

### Admin Year Setup Flow

1. Admin creates new school year
2. Admin configures tuition parameters
3. Admin enables registration for the year
4. Admin monitors and manages enrollments
5. Admin generates reports and rosters

## Technical Requirements

### Frontend

- React 18+ with TypeScript
- Component-based architecture
- Responsive design for mobile and desktop
- Accessibility compliance
- Modern UI framework (Material UI recommended)

### Backend

- Firebase integration for database and authentication
- Firestore for data storage
- Firebase Authentication for user management
- Cloud Functions for complex operations

### Data Models

#### User

- Email (primary key)
- First name
- Last name
- Is admin flag
- Is staff flag

#### Family

- Family name
- Guardians array
- Students array
- Emergency contacts array
- Medical providers array
- Pick-up list
- Medical insurance information
- Income information
- Authorized emails array

#### Student

- First, middle, last name
- Preferred name
- Birthdate
- Gender and pronouns
- Email (optional)
- Prior school
- Learning disabilities
- Allergies (severe and non-severe)
- Other medical conditions
- Media release permission
- Self sign-out permission

#### School Year

- Name
- Minimum/maximum tuition
- Minimum/maximum income thresholds
- Registration status flags

#### Contract

- Family reference
- Year reference
- Student enrollment decisions
- Tuition amount
- Tuition assistance information
- Signing status

## Non-Functional Requirements

### Performance

- Page load time under 2 seconds
- Smooth transitions between views
- Efficient data loading and caching

### Security

- Role-based access control
- Data encryption
- Secure authentication
- Protection of sensitive family information

### Usability

- Intuitive navigation
- Clear error messages
- Helpful guidance for complex processes
- Mobile-friendly interface

### Maintainability

- Well-documented code
- Component reusability
- Consistent coding standards
- Comprehensive test coverage
