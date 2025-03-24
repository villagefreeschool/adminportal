import React from 'react';
import { Grid, Typography } from '@mui/material';
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
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" component="div">
          {student.preferredName || student.firstName}
          {student.pronoun && (
            <Typography variant="subtitle1" component="span" sx={{ ml: 1 }}>
              ({student.pronoun})
            </Typography>
          )}
        </Typography>
      </Grid>

      <Grid container item spacing={2} justifyContent="space-around">
        <LabeledData label="First">
          {student.firstName}
        </LabeledData>
        
        {student.middleName && (
          <LabeledData label="Middle">
            {student.middleName}
          </LabeledData>
        )}
        
        <LabeledData label="Last">
          {student.lastName}
        </LabeledData>
      </Grid>

      {student.email && (
        <LabeledData label="Email Address" xs={12}>
          {student.email}
        </LabeledData>
      )}

      {student.severeAllergies && (
        <LabeledData label="Severe Allergies" xs={12} md={6} error>
          {student.severeAllergies}
        </LabeledData>
      )}

      {student.nonSevereAllergies && (
        <LabeledData label="Non-Severe Allergies" xs={12} md={6}>
          {student.nonSevereAllergies}
        </LabeledData>
      )}

      {student.priorSchool && (
        <LabeledData label="Prior School" xs={12} md={6}>
          {student.priorSchool}
        </LabeledData>
      )}

      {student.learningDisabilities && (
        <LabeledData label="Learning Disabilities" xs={12} md={6}>
          {student.learningDisabilities}
        </LabeledData>
      )}

      {student.additionalInfo && (
        <LabeledData label="Additional Information" xs={12} md={6}>
          {student.additionalInfo}
        </LabeledData>
      )}

      {student.otherMedicalConditions && (
        <LabeledData label="Other Medical Conditions" xs={12} md={6}>
          {student.otherMedicalConditions}
        </LabeledData>
      )}
    </Grid>
  );
};

export default Student;