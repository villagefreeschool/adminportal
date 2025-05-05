import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

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
    'Father',
    'Mother',
    'Parent',
    'Grandparent',
    'Stepfather',
    'Stepmother',
    'Brother',
    'Sister',
    'Legal Guardian',
    'Uncle',
    'Aunt',
    'Step-grandparent',
    'Friend',
    'Neighbor',
    'Housemate',
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
