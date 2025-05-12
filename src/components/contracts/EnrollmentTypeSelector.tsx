import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";

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

function EnrollmentTypeSelector({
  value,
  onChange,
  label,
  required = false,
  error = false,
  helperText,
}: EnrollmentTypeSelectorProps) {
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
}

export default EnrollmentTypeSelector;
