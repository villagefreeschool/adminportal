import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import type React from "react";

/**
 * Enrollment type selector for student attendance options
 */
interface EnrollmentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

const EnrollmentTypeSelector: React.FC<EnrollmentTypeSelectorProps> = ({
  value,
  onChange,
  label,
  required = false,
  error = false,
  helperText,
}) => {
  const choices = ["Not Attending", "Part Time", "Full Time"];

  return (
    <FormControl fullWidth required={required} error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ""}
        onChange={(e) => onChange(e.target.value as string)}
        label={label}
      >
        {choices.map((choice) => (
          <MenuItem key={choice} value={choice}>
            {choice}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default EnrollmentTypeSelector;
