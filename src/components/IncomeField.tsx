import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

interface IncomeFieldProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

/**
 * A component for handling income input with proper formatting
 * Migrated from Vue IncomeField component
 */
const IncomeField: React.FC<IncomeFieldProps> = ({
  value,
  onChange,
  label = 'Income',
  required = false,
  error = false,
  helperText,
}) => {
  // Format the value for display (strip commas and non-numeric characters)
  const displayValue = value !== null && value !== undefined ? value.toString() : '';

  // Handle change and convert to number
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const input = e.target.value;
    const numbers = input.replace(/[^0-9]/g, '');
    
    if (numbers === '') {
      onChange(null);
    } else {
      onChange(parseInt(numbers, 10));
    }
  };

  // Format the value for display
  const formatValue = (input: string): string => {
    if (!input) return '';
    
    const numbers = input.replace(/[^0-9]/g, '');
    if (numbers === '') return '';
    
    const parsed = parseInt(numbers, 10);
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(parsed);
  };

  return (
    <TextField
      label={label}
      value={formatValue(displayValue)}
      onChange={handleChange}
      fullWidth
      required={required}
      error={error}
      helperText={helperText}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      }}
    />
  );
};

export default IncomeField;