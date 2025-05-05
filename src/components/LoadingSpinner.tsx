import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingSpinner = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" width="100%">
      <CircularProgress />
    </Box>
  );
};

export default LoadingSpinner;
