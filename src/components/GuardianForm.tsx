import React from 'react';
import { TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Grid } from '@mui/material';
import { Guardian } from '../services/firebase/models/types';
import RelationshipDropdown from './RelationshipDropdown';

interface GuardianFormProps {
  guardian: Guardian;
  onChange: (guardian: Guardian) => void;
  index: number;
}

/**
 * Form for entering guardian information
 * Migrated from Vue GuardianForm
 */
const GuardianForm: React.FC<GuardianFormProps> = ({ guardian, onChange, index }) => {
  // Handle field changes
  const handleChange = (field: keyof Guardian, value: unknown) => {
    onChange({
      ...guardian,
      [field]: value,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="First Name"
          value={guardian.firstName || ''}
          onChange={(e) => handleChange('firstName', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="Last Name"
          value={guardian.lastName || ''}
          onChange={(e) => handleChange('lastName', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <RelationshipDropdown
          value={guardian.relationship || ''}
          onChange={(value) => handleChange('relationship', value)}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <TextField
          label="Email Address"
          value={guardian.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <TextField
          label="Cell Phone"
          value={guardian.cellPhone || ''}
          onChange={(e) => handleChange('cellPhone', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <TextField
          label="Work Phone"
          value={guardian.workPhone || ''}
          onChange={(e) => handleChange('workPhone', e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Work/Other Email Addresses"
          value={guardian.otherEmails || ''}
          onChange={(e) => handleChange('otherEmails', e.target.value)}
          multiline
          rows={2}
          fullWidth
          helperText="Users logging in with any of these email addresses will be linked to your family automatically."
        />
      </Grid>

      {index !== 0 && (
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={guardian.atSameAddress || false}
                onChange={(e) => handleChange('atSameAddress', e.target.checked)}
              />
            }
            label="At Same Address"
          />
        </Grid>
      )}

      {index === 0 && (
        <Grid size={{ xs: 12 }}>
          <div style={{ minHeight: '48px' }} />
        </Grid>
      )}

      {!guardian.atSameAddress && (
        <>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Address"
              value={guardian.address1 || ''}
              onChange={(e) => handleChange('address1', e.target.value)}
              fullWidth
              required={!guardian.atSameAddress}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Suite / Apt #"
              value={guardian.address2 || ''}
              onChange={(e) => handleChange('address2', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="City"
              value={guardian.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              fullWidth
              required={!guardian.atSameAddress}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              label="State"
              value={guardian.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              fullWidth
              required={!guardian.atSameAddress}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label="ZIP Code"
              value={guardian.zip || ''}
              onChange={(e) => handleChange('zip', e.target.value)}
              fullWidth
              required={!guardian.atSameAddress}
            />
          </Grid>
        </>
      )}

      <Grid size={{ xs: 12 }}>
        <TextField
          label="Occupation"
          value={guardian.occupation || ''}
          onChange={(e) => handleChange('occupation', e.target.value)}
          fullWidth
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          label="Notes"
          value={guardian.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          multiline
          rows={2}
          fullWidth
          helperText="If needed, enter notes about custody or relationship status."
        />
      </Grid>
    </Grid>
  );
};

export default GuardianForm;
