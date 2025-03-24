import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

function YearList() {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          School Years
        </Typography>
        <Typography variant="body1">
          This page will display a list of school years and related information.
        </Typography>
      </Paper>
    </Box>
  );
}

export default YearList;
