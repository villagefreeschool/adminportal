import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

function FamilyList() {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 3, sm: 4 },
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Families
      </Typography>
      <Typography variant="body1">
        This page will display a list of all families in the system.
      </Typography>
    </Paper>
  );
}

export default FamilyList;
