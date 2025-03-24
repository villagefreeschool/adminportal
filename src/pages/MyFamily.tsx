import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

function MyFamily() {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 3, sm: 4 },
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        My Family
      </Typography>
      <Typography variant="body1">
        This page will display information about your family members and related data.
      </Typography>
    </Paper>
  );
}

export default MyFamily;
