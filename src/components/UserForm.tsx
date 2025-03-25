import React, { useEffect, useCallback } from 'react';
import { TextField, FormControlLabel, Checkbox, Typography, Box } from '@mui/material';
import { Grid } from '@mui/material';
import { VFSAdminUser } from '../services/firebase/models/types';

interface UserFormProps {
  user: VFSAdminUser;
  onChange: (user: VFSAdminUser) => void;
  allowChangingEmail?: boolean;
}

/**
 * Form for entering user information
 * Migrated from Vue UserForm
 */
const UserForm: React.FC<UserFormProps> = ({ user, onChange, allowChangingEmail = true }) => {
  // Handle field changes
  const handleChange = useCallback(
    (field: keyof VFSAdminUser, value: unknown) => {
      onChange({
        ...user,
        [field]: value,
      });
    },
    [user, onChange],
  );

  // Make staff automatically true when admin is true
  useEffect(() => {
    if (user.isAdmin && !user.isStaff) {
      handleChange('isStaff', true);
    }
  }, [user.isAdmin, user.isStaff, handleChange]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Email Address"
          value={user.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={!allowChangingEmail}
          fullWidth
          required
          helperText="They will log in to the system using this address."
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="First Name"
          value={user.firstName || ''}
          onChange={(e) => handleChange('firstName', e.target.value)}
          fullWidth
          required
          autoFocus={!allowChangingEmail}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Last Name"
          value={user.lastName || ''}
          onChange={(e) => handleChange('lastName', e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={user.isAdmin || false}
                onChange={(e) => handleChange('isAdmin', e.target.checked)}
                color="primary"
              />
            }
            label="Administrator"
          />
        </Box>
        <Typography variant="caption" color="textSecondary">
          Administrators can see all data and can create new users.
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={user.isStaff || false}
                onChange={(e) => handleChange('isStaff', e.target.checked)}
                color="primary"
              />
            }
            label="Staff"
          />
        </Box>
        <Typography variant="caption" color="textSecondary">
          Staff have access to the backend area.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default UserForm;
