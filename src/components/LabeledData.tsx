import React, { ReactNode } from 'react';
import { Box, Typography, SxProps, Theme, Grid } from '@mui/material';

interface LabeledDataProps {
  label: string;
  children: ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  error?: boolean;
  sx?: SxProps<Theme>;
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * A component for displaying labeled data in a consistent format
 * Mimics the Vue LabeledData component but with React/MUI patterns
 */
const LabeledData: React.FC<LabeledDataProps> = ({
  label,
  children,
  xs = 12,
  sm,
  md,
  lg,
  error = false,
  sx,
  textAlign,
}) => {
  return (
    <Grid size={{ xs: xs, sm: sm, md: md, lg: lg }}>
      <Box sx={{ mb: 2, ...sx, textAlign }}>
        <Typography
          variant="subtitle2"
          component="div"
          color={error ? 'error' : 'text.secondary'}
          gutterBottom
        >
          {label}
        </Typography>
        <Typography variant="body-md" component="div">
          {children || '-'}
        </Typography>
      </Box>
    </Grid>
  );
};

export default LabeledData;
