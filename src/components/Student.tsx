import React from 'react';
import { Box, Typography, Grid2 } from '@mui/material';
import LabeledData from './LabeledData';
import { Student as StudentType } from '../services/firebase/models/types';

interface StudentProps {
  student: StudentType;
}

/**
 * A component for displaying student information
 * Migrated from Vue Student component
 */
const Student: React.FC<StudentProps> = ({ student }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Student Name Header */}
      <Grid2 container>
        <Grid2 size={{ xs: 12 }}>
          <Typography variant="h5" component="div">
            {student.preferredName || student.firstName}
            {student.pronoun && (
              <Typography variant="subtitle1" component="span" sx={{ ml: 1 }}>
                ({student.pronoun})
              </Typography>
            )}
          </Typography>
        </Grid2>
      </Grid2>

      {/* Name Fields - Split into thirds */}
      <Grid2 container spacing={2} sx={{ mt: 1 }}>
        <Grid2 size={{ xs: 4 }}>
          <Box>
            <LabeledData label="First">{student.firstName}</LabeledData>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <LabeledData label="Middle">{student.middleName || '-'}</LabeledData>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 4 }}>
          <Box sx={{ textAlign: 'right' }}>
            <LabeledData label="Last">{student.lastName}</LabeledData>
          </Box>
        </Grid2>
      </Grid2>

      {/* Other Student Information */}
      <Grid2 container spacing={2} sx={{ mt: 2 }}>
        {student.email && (
          <Grid2 size={{ xs: 12 }}>
            <LabeledData label="Email Address">{student.email}</LabeledData>
          </Grid2>
        )}

        {student.severeAllergies && (
          <Grid2 size={{ xs: 12, md: 6 }}>
            <LabeledData label="Severe Allergies" error>
              {student.severeAllergies}
            </LabeledData>
          </Grid2>
        )}

        {student.nonSevereAllergies && (
          <Grid2 size={{ xs: 12, md: 6 }}>
            <LabeledData label="Non-Severe Allergies">{student.nonSevereAllergies}</LabeledData>
          </Grid2>
        )}

        {student.priorSchool && (
          <Grid2 size={{ xs: 12, md: 6 }}>
            <LabeledData label="Prior School">{student.priorSchool}</LabeledData>
          </Grid2>
        )}

        {student.learningDisabilities && (
          <Grid2 size={{ xs: 12, md: 6 }}>
            <LabeledData label="Learning Disabilities">{student.learningDisabilities}</LabeledData>
          </Grid2>
        )}

        {student.additionalInfo && (
          <Grid2 size={{ xs: 12, md: 6 }}>
            <LabeledData label="Additional Information">{student.additionalInfo}</LabeledData>
          </Grid2>
        )}

        {student.otherMedicalConditions && (
          <Grid2 size={{ xs: 12, md: 6 }}>
            <LabeledData label="Other Medical Conditions">
              {student.otherMedicalConditions}
            </LabeledData>
          </Grid2>
        )}
      </Grid2>
    </Box>
  );
};

export default Student;
