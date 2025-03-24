import React from 'react';
import { TextField, MenuItem } from '@mui/material';

interface RelationshipDropdownProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

/**
 * A dropdown component for selecting family relationships
 * Migrated from Vue RelationshipDropdown component
 */
const RelationshipDropdown: React.FC<RelationshipDropdownProps> = ({
  value,
  onChange,
  required = false,
  error = false,
  helperText,
}) => {
  const relationships = [
    'Mother',
    'Father',
    'Parent',
    'Stepmother',
    'Stepfather',
    'Guardian',
    'Grandmother',
    'Grandfather',
    'Aunt',
    'Uncle',
    'Sibling',
    'Other',
  ];

  return (
    <TextField
      select
      label="Relationship"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      required={required}
      error={error}
      helperText={helperText}
    >
      {relationships.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default RelationshipDropdown;
