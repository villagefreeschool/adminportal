import React, { useEffect, useCallback } from 'react';
import { TextField, MenuItem, FormControlLabel, Switch, Typography } from '@mui/material';
import { Grid2 } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Student } from '../services/firebase/models/types';

interface StudentFormProps {
  student: Student;
  onChange: (student: Student) => void;
}

/**
 * Form for entering student information
 * Migrated from Vue StudentForm
 */
const StudentForm: React.FC<StudentFormProps> = ({ student, onChange }) => {
  // Gender and pronoun options
  const genders = ['Female', 'Male', 'Rather Not Say', 'Custom'];
  const pronouns = ['He', 'She', 'They', 'Rather Not Say'];

  // Handle field changes
  const handleChange = useCallback(
    (field: keyof Student, value: unknown) => {
      onChange({
        ...student,
        [field]: value,
      });
    },
    [student, onChange],
  );

  // Update preferred name if first name changes and preferred name is empty
  useEffect(() => {
    if (student.firstName && !student.preferredName) {
      handleChange('preferredName', student.firstName);
    }
  }, [student.firstName, student.preferredName, handleChange]);

  // Calculate reflexive pronoun for self-sign-out text
  const getReflexivePronoun = (): string => {
    if (!student.pronoun) return 'themself';

    switch (student.pronoun.toLowerCase()) {
      case 'he':
      case 'his':
        return 'himself';
      case 'she':
      case 'her':
        return 'herself';
      case 'they':
      default:
        return 'themself';
    }
  };

  // Get student's short name for labels
  const shortName = student.preferredName || student.firstName || 'this student';
  const reflexivePronoun = getReflexivePronoun();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid2 container spacing={2}>
        {/* Name fields */}
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <TextField
            label="First Name"
            value={student.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            fullWidth
            required
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Middle Name"
            value={student.middleName || ''}
            onChange={(e) => handleChange('middleName', e.target.value)}
            fullWidth
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Last Name"
            value={student.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            fullWidth
            required
          />
        </Grid2>

        {/* Preferred name and birthdate */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Preferred Name"
            value={student.preferredName || ''}
            onChange={(e) => handleChange('preferredName', e.target.value)}
            fullWidth
            required
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <DatePicker
            label="Birthdate"
            value={student.birthdate ? dayjs(student.birthdate) : null}
            onChange={(date: unknown) => {
              if (
                date &&
                typeof date === 'object' &&
                'format' in date &&
                typeof date.format === 'function'
              ) {
                handleChange('birthdate', date.format('YYYY-MM-DD'));
              } else {
                handleChange('birthdate', null);
              }
            }}
          />
        </Grid2>

        {/* Gender and pronouns */}
        <Grid2 size={{ xs: 12, sm: student.gender === 'Custom' ? 6 : 12, md: 6 }}>
          <TextField
            select
            label="Gender"
            value={student.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            fullWidth
            required
          >
            {genders.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>

        {student.gender === 'Custom' && (
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Custom Gender"
              value={student.customGender || ''}
              onChange={(e) => handleChange('customGender', e.target.value)}
              fullWidth
              required
            />
          </Grid2>
        )}

        <Grid2 size={{ xs: 12, md: 6 }}>
          <TextField
            select
            label="Pronoun"
            value={student.pronoun || ''}
            onChange={(e) => handleChange('pronoun', e.target.value)}
            fullWidth
            required
          >
            {pronouns.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid2>

        {/* Email and prior school */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email Address (Optional)"
            value={student.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
            helperText={`Enter only if ${shortName} uses email.`}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Prior School"
            value={student.priorSchool || ''}
            onChange={(e) => handleChange('priorSchool', e.target.value)}
            fullWidth
            helperText={`School ${shortName} most recently attended before VFS.`}
          />
        </Grid2>

        {/* Medical and learning info */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Learning Disabilities"
            value={student.learningDisabilities || ''}
            onChange={(e) => handleChange('learningDisabilities', e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Additional Information"
            value={student.additionalInfo || ''}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Severe Allergies"
            value={student.severeAllergies || ''}
            onChange={(e) => handleChange('severeAllergies', e.target.value)}
            multiline
            rows={3}
            fullWidth
            helperText="Note allergies with anaphylaxis or other severe impacts"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Non-Severe Allergies"
            value={student.nonSevereAllergies || ''}
            onChange={(e) => handleChange('nonSevereAllergies', e.target.value)}
            multiline
            rows={3}
            fullWidth
            helperText="Note dietary intolerances, seasonal allergies and other allergies with non-severe impacts"
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Other Medical Conditions"
            value={student.otherMedicalConditions || ''}
            onChange={(e) => handleChange('otherMedicalConditions', e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Grid2>

        {/* Media release and sign-out permissions */}
        <Grid2 spacing={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={student.mediaRelease || false}
                onChange={(e) => handleChange('mediaRelease', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I authorize the use of photographs or other media recordings of {shortName}
              </Typography>
            }
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={student.signSelfOut || false}
                onChange={(e) => handleChange('signSelfOut', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I authorize {shortName} to sign out of school {reflexivePronoun}
              </Typography>
            }
          />
        </Grid2>
      </Grid2>
    </LocalizationProvider>
  );
};

export default StudentForm;
