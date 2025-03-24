import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, Grid, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';

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
 * Includes privacy features to obscure income values
 */
const IncomeField: React.FC<IncomeFieldProps> = ({
  value,
  onChange,
  label = 'Income',
  required = false,
  error = false,
  helperText,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const [initialValue, setInitialValue] = useState<number | null | undefined>(null);
  const [displayedValue, setDisplayedValue] = useState<number | null | undefined>(null);

  // Initialize component state
  useEffect(() => {
    setDisplayedValue(value);

    // Lock the field if it has a value initially
    if (value !== null && value !== undefined) {
      setInitialValue(value);
      setIsLocked(true);
    }
  }, [value]);

  // Update displayed value when parent value changes
  useEffect(() => {
    setDisplayedValue(value);
  }, [value]);

  // Handle unlocking the field for editing
  const handleUnlock = () => {
    setIsLocked(false);
    setDisplayedValue(null);
  };

  // Handle canceling edits
  const handleCancel = () => {
    setIsLocked(true);
    setDisplayedValue(null);
    // Ensure we don't pass undefined to onChange
    onChange(initialValue !== undefined ? initialValue : null);
  };

  // Handle confirming edits
  const handleConfirm = () => {
    setInitialValue(displayedValue);
    setIsLocked(true);
  };

  // Handle change and convert to number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: React.ChangeEvent<any>) => {
    const input = e.target.value;
    const numbers = input.replace(/[^0-9]/g, '');

    if (numbers === '') {
      setDisplayedValue(null);
      onChange(null);
    } else {
      const numericValue = parseInt(numbers, 10);
      setDisplayedValue(numericValue);
      onChange(numericValue);
    }
  };

  // Format the value for display
  const formatValue = (input: number | null | undefined): string => {
    if (input === null || input === undefined) return '';

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(input);
  };

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={isLocked ? 8 : 12} sm={isLocked ? 9 : 12}>
        {isLocked ? (
          <TextField
            label={label}
            value="Previously Entered"
            disabled
            fullWidth
            required={required}
            error={error}
            helperText={helperText}
          />
        ) : (
          <TextField
            label={label}
            value={formatValue(displayedValue)}
            onChange={handleChange}
            fullWidth
            required={required}
            error={error}
            helperText={helperText}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        )}
      </Grid>

      {isLocked && (
        <Grid item xs={4} sm={3}>
          <Button
            variant="contained"
            size="small"
            onClick={handleUnlock}
            startIcon={<EditIcon />}
            color="primary"
          >
            Edit
          </Button>
        </Grid>
      )}

      {!isLocked && initialValue !== null && initialValue !== undefined && (
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="contained"
              size="small"
              onClick={handleConfirm}
              startIcon={<CheckIcon />}
              color="success"
              disabled={displayedValue === initialValue}
            >
              OK
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleCancel}
              startIcon={<BlockIcon />}
              color="error"
            >
              Cancel
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default IncomeField;
