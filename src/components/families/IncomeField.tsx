import BlockIcon from "@mui/icons-material/Block";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { type ChangeEvent, useEffect, useState } from "react";

interface IncomeFieldProps {
  value: number | null | undefined;
  onChange: (value: number | null | "OPT_OUT") => void;
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
function IncomeField({
  value,
  onChange,
  label = "Income",
  required = false,
  error = false,
  helperText,
}: IncomeFieldProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [initialValue, setInitialValue] = useState<number | null | undefined>(null);
  const [displayedValue, setDisplayedValue] = useState<number | null | undefined>(null);

  // Initialize component state
  // biome-ignore lint/correctness/useExhaustiveDependencies: This should only run once.
  useEffect(() => {
    setDisplayedValue(value);

    // Lock the field if it has a value initially
    if (value !== null && value !== undefined) {
      setInitialValue(value);
      setIsLocked(true);
    } else {
      // If no initial value, start unlocked
      setInitialValue(null);
      setIsLocked(false);
    }
  }, []);

  // Handle external value changes (like clearing from opt-out)
  useEffect(() => {
    // If value becomes null/undefined from outside (like opt-out), reset component
    if (value === null || value === undefined) {
      setDisplayedValue(null);
      setInitialValue(null);
      setIsLocked(false);
    }
    // If component is locked and value changes externally, update displayed value
    else if (isLocked && value !== displayedValue) {
      setDisplayedValue(value);
      setInitialValue(value);
    }
  }, [value, isLocked, displayedValue]);

  // Handle unlocking the field for editing
  const handleUnlock = () => {
    setIsLocked(false);
    setDisplayedValue(null);
  };

  // Handle canceling edits
  const handleCancel = () => {
    if (initialValue !== null && initialValue !== undefined) {
      // If there was a previous value, revert to locked state showing that value
      setIsLocked(true);
      setDisplayedValue(initialValue);
      onChange(initialValue);
    } else {
      // If no previous value, clear the field and trigger opt-out
      setDisplayedValue(null);
      setIsLocked(false);
      // Signal to parent to opt out (clear income and check opt-out)
      onChange("OPT_OUT");
    }
  };

  // Handle confirming edits
  const handleConfirm = () => {
    setInitialValue(displayedValue);
    setIsLocked(true);
  };

  // Handle change and convert to number
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numbers = input.replace(/[^0-9]/g, "");

    if (numbers === "") {
      setDisplayedValue(null);
      onChange(null);
    } else {
      const numericValue = Number.parseInt(numbers, 10);
      setDisplayedValue(numericValue);
      onChange(numericValue);
    }
  };

  // Format the value for display
  const formatValue = (input: number | null | undefined): string => {
    if (input === null || input === undefined) return "";

    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(input);
  };

  return (
    <Grid container spacing={1} alignItems="center">
      <Grid size={{ xs: isLocked ? 8 : 12, sm: isLocked ? 9 : 12 }}>
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
        <Grid size={{ xs: 4, sm: 3 }}>
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

      {!isLocked && (
        <Grid size={{ xs: 12 }}>
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
}

export default IncomeField;
