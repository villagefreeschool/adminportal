import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

function FamilyList() {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Families
        </Typography>
        <Typography variant="body1">
          This page will display a list of all families in the system.
        </Typography>
      </Paper>
    </Box>
  );
}

export default FamilyList;
