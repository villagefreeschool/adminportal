# Switching to Simple Functional Components

Much of this project was written by Amazon Q and used some unusual patterns for code structures.
I'd like to eliminate the use of the `React.FC` style components. For example:

We want to change:

```typescript
const Student: React.FC<StudentProps> = ({ student }) => {
```

... to this ...

```typescript
function Student({ student }: StudentProps) {
```

## Components Converted

- [x] Student.tsx
- [x] Guardian.tsx
- [x] LabeledData.tsx
- [x] Contract.tsx
- [x] RelationshipDropdown.tsx
- [x] EnrollmentTypeSelector.tsx
- [x] IncomeField.tsx
- [x] SignatureCapture.tsx
- [x] EmergencyContactForm.tsx
- [x] StudentForm.tsx
- [x] GuardianForm.tsx
- [x] FamilyForm.tsx
- [x] UserForm.tsx
- [x] MedicalProviderForm.tsx
- [ ] ContractPDFGenerator.tsx
- [x] FamilyDialog.tsx
- [x] FamilyDeleteDialog.tsx
- [x] ContractEditDialog.tsx
- [ ] ContractSignDialog.tsx
- [x] UserDialog.tsx
- [x] Registration.tsx
