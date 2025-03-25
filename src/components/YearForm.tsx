import { useState, useEffect } from 'react';
import { TextField, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import {
  DefaultMinimumIncome,
  DefaultMaximumIncome,
  DefaultMinimumTuition,
  DefaultMaximumTuition,
  Year,
} from '../services/firebase/years';

// Input formatter for currency fields
const formatCurrency = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, '');

  if (!numericValue) return '';

  const number = parseInt(numericValue, 10);
  return number.toLocaleString('en-US');
};

// Parse currency string to number value
const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
};

interface YearFormProps {
  year: Partial<Year>;
  onChange: (year: Partial<Year>) => void;
}

export default function YearForm({ year, onChange }: YearFormProps) {
  // Local state for form handling
  const [formValues, setFormValues] = useState<Partial<Year>>({
    name: '',
    minimumTuition: DefaultMinimumTuition,
    maximumTuition: DefaultMaximumTuition,
    minimumIncome: DefaultMinimumIncome,
    maximumIncome: DefaultMaximumIncome,
    isAcceptingRegistrations: false,
    isAcceptingIntentToReturns: false,
    ...year,
  });

  // Update local state when props change
  useEffect(() => {
    setFormValues({
      name: '',
      minimumTuition: DefaultMinimumTuition,
      maximumTuition: DefaultMaximumTuition,
      minimumIncome: DefaultMinimumIncome,
      maximumIncome: DefaultMaximumIncome,
      isAcceptingRegistrations: false,
      isAcceptingIntentToReturns: false,
      ...year,
    });
  }, [year]);

  // Handle form field changes
  const handleChange = (field: keyof Year, value: string | number | boolean) => {
    const updatedValues = { ...formValues, [field]: value };
    setFormValues(updatedValues);
    onChange(updatedValues);
  };

  // Handle currency field changes
  const handleCurrencyChange = (field: keyof Year, value: string) => {
    const numericValue = parseCurrency(value);
    handleChange(field, numericValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          label="Name"
          fullWidth
          required
          value={formValues.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          inputProps={{ 'data-testid': 'year-name-input' }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Minimum Tuition"
          fullWidth
          required
          value={formatCurrency(formValues.minimumTuition?.toString() || '')}
          onChange={(e) => handleCurrencyChange('minimumTuition', e.target.value)}
          InputProps={{
            startAdornment: '$',
          }}
          inputProps={{ 'data-testid': 'minimum-tuition-input' }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Maximum Tuition"
          fullWidth
          required
          value={formatCurrency(formValues.maximumTuition?.toString() || '')}
          onChange={(e) => handleCurrencyChange('maximumTuition', e.target.value)}
          InputProps={{
            startAdornment: '$',
          }}
          inputProps={{ 'data-testid': 'maximum-tuition-input' }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Minimum Income"
          fullWidth
          required
          value={formatCurrency(formValues.minimumIncome?.toString() || '')}
          onChange={(e) => handleCurrencyChange('minimumIncome', e.target.value)}
          InputProps={{
            startAdornment: '$',
          }}
          inputProps={{ 'data-testid': 'minimum-income-input' }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Maximum Income"
          fullWidth
          required
          value={formatCurrency(formValues.maximumIncome?.toString() || '')}
          onChange={(e) => handleCurrencyChange('maximumIncome', e.target.value)}
          InputProps={{
            startAdornment: '$',
          }}
          inputProps={{ 'data-testid': 'maximum-income-input' }}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.isAcceptingRegistrations || false}
              onChange={(e) => handleChange('isAcceptingRegistrations', e.target.checked)}
              data-testid="registration-checkbox"
            />
          }
          label="Registration Open"
        />
        <Typography variant="caption" display="block">
          Enables the registration link for families.
        </Typography>
      </Grid>
    </Grid>
  );
}
