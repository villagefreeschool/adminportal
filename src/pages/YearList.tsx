import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

function YearList() {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 3, sm: 4 },
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        School Years
      </Typography>
      <Typography variant="body1">
        This page will display a list of school years and related information.
      </Typography>
    </Paper>
  );
}

export default YearList;
