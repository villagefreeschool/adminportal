import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

function MyFamily() {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Family
        </Typography>
        <Typography variant="body1">
          This page will display information about your family members and related data.
        </Typography>
      </Paper>
    </Box>
  );
}

export default MyFamily;
