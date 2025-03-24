import React from 'react';
import { Grid, TextField, MenuItem } from '@mui/material';
import { MedicalProvider } from '../services/firebase/models/types';

interface MedicalProviderFormProps {
  provider: MedicalProvider;
  onChange: (provider: MedicalProvider) => void;
}

/**
 * Form for entering medical provider information
 * Migrated from Vue MedicalProviderForm
 */
const MedicalProviderForm: React.FC<MedicalProviderFormProps> = ({ provider, onChange }) => {
  // Provider types
  const providerTypes = ['Pediatrician', 'Family Doctor', 'Dentist', 'Specialist', 'Other'];

  // Handle field changes
  const handleChange = (field: keyof MedicalProvider, value: string) => {
    onChange({
      ...provider,
      [field]: value,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          select
          label="Provider Type"
          value={provider.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          fullWidth
          required
        >
          {providerTypes.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Provider Name"
          value={provider.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Phone Number"
          value={provider.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          fullWidth
        />
      </Grid>
    </Grid>
  );
};

export default MedicalProviderForm;